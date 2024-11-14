import sys
from importlib import reload

from django.contrib.auth.models import User
from django.core.signals import setting_changed
from django.test import TestCase, override_settings
from django.urls import clear_url_caches, resolve, reverse

from martor.utils import markdownify
from martor.views import markdown_imgur_uploader, markdown_search_user, markdownfy_view


class SimpleTest(TestCase):
    def _on_settings_changed(self, sender, **kwargs):
        # Reload settings.py and urls.py when @override_settings is called
        clear_url_caches()
        reload(sys.modules["martor.settings"])
        reload(sys.modules["martor.urls"])
        reload(sys.modules["martor.tests.urls"])

    def setUp(self):
        self.user_password = "TestEgg@1234"
        self.user = User.objects.create_user(
            username="user1",
            email="user1@mail.com",
            password=self.user_password,
        )
        self.client.login(
            username=self.user.username,
            password=self.user_password,
        )

        setting_changed.connect(self._on_settings_changed)

    def tearDown(self):
        setting_changed.disconnect(self._on_settings_changed)

    def test_form(self):
        response = self.client.get("/test-form-view/")
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed("test_form_view.html")
        self.assertContains(response, "main-martor-description")
        self.assertContains(response, "main-martor-wiki")

    @override_settings(
        MARTOR_ENABLE_CONFIGS={
            "emoji": "true",  # enable/disable emoji icons.
            "imgur": "true",  # enable/disable imgur/custom uploader.
            "mention": "true",  # enable/disable mention
            "jquery": "true",  # include/revoke jquery (require for admin django) # noqa: E501
            "living": "false",  # enable/disable live updates in preview
            "spellcheck": "false",  # enable/disable spellcheck in form textareas # noqa: E501
            "hljs": "true",  # enable/disable hljs highlighting in preview
        },
        MARTOR_MARKDOWN_BASE_EMOJI_URL="https://github.githubassets.com/images/icons/emoji/",
        MARTOR_MARKDOWN_BASE_MENTION_URL="https://python.web.id/author/",
    )
    def test_markdownify(self):
        # Heading
        response = self.client.post(
            "/martor/markdownify/",
            {"content": "# Hello world!"},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.content.decode("utf-8"), "<h1>Hello world!</h1>"
        )  # noqa: E501

        # Link
        response = self.client.post(
            "/martor/markdownify/",
            {"content": "[python](https://python.web.id)"},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.content.decode("utf-8"),
            '<p><a href="https://python.web.id">python</a></p>',
        )  # noqa: E501

        # Image
        response = self.client.post(
            "/martor/markdownify/",
            {"content": "![image](https://imgur.com/test.png)"},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.content.decode("utf-8"),
            '<p><img alt="image" src="https://imgur.com/test.png"></p>',
        )  # noqa: E501

        # Emoji
        response = self.client.post(
            "/martor/markdownify/",
            {"content": ":heart:"},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.content.decode("utf-8"),
            '<p><img class="marked-emoji" src="https://github.githubassets.com/images/icons/emoji/heart.png"></p>',
        )  # noqa: E501

        # # Mention
        # response = self.client.post(
        #     "/martor/markdownify/",
        #     {"content": f"@[{self.user.username}]"},
        # )
        # self.assertEqual(response.status_code, 200)
        # self.assertEqual(
        #     response.content.decode("utf-8"),
        #     f'<p><a class="direct-mention-link" href="https://python.web.id/author/{self.user.username}/">{self.user.username}</a></p>',
        # )

        # Id
        response = self.client.post(
            "/martor/markdownify/",
            {
                "content": "__Advertisement :)__ {#ad-section}\n###### h6 Heading {#h6-heading}"
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.content.decode("utf-8"),
            '<p><span id="ad-section"><strong>Advertisement :)</strong></span></p>\n<h6><span id="h6-heading">h6 Heading</span></h6>',
        )  # noqa: E501

    def test_markdownify_xss_handled(self):
        xss_payload_1 = "[aaaa](javascript:alert(1))"
        response_1 = markdownify(xss_payload_1)
        self.assertEqual(response_1, "<p><a>aaaa</a></p>")

        xss_payload_2 = '![" onerror=alert(1) ](x)'
        response_2 = markdownify(xss_payload_2)
        self.assertEqual(
            response_2, '<p><img alt="&quot; onerror=alert(1) " src="x"></p>'
        )

        xss_payload_3 = '[xss](" onmouseover=alert(document.domain) l)'
        response_3 = markdownify(xss_payload_3)
        self.assertEqual(
            response_3,
            '<p><a href="&quot; onmouseover=alert(document.domain)">xss</a>)</p>',  # noqa: E501
        )

    def test_urls(self):
        with override_settings(
            MARTOR_MARKDOWNIFY_URL="test/url",
            MARTOR_UPLOAD_URL="test/upload",
            MARTOR_SEARCH_USERS_URL="test/search",
        ):
            found = resolve(reverse("martor_markdownfy"))
            self.assertEqual(found.func, markdownfy_view)

            found = resolve(reverse("imgur_uploader"))
            self.assertEqual(found.func, markdown_imgur_uploader)

            found = resolve(reverse("search_user_json"))
            self.assertEqual(found.func, markdown_search_user)


class MarkdownifyTest(TestCase):
    def test_markdownify_regular_text(self):
        markdown_tuples = [
            ("# Heading Level 1", "<h1>Heading Level 1</h1>"),
            ("**This is bold text**", "<p><strong>This is bold text</strong></p>"),
            ("*This is italic text*", "<p><em>This is italic text</em></p>"),
            (
                "[Link to google](https://google.com)",
                '<p><a href="https://google.com">Link to google</a></p>',
            ),
            (
                "1. List item 1\n2. List item 2\n3. List item 3",
                "<ol>\n<li>List item 1</li>\n<li>List item 2</li>\n<li>List item 3</li>\n</ol>",
            ),
        ]

        for markdown_text, html in markdown_tuples:
            response = markdownify(markdown_text)
            self.assertEqual(
                response,
                html,
            )

    def test_markdownify_whitelist_indended_links(self):
        markdown_text = "[Blacklisted protocol](htttp://some-link.com)"

        response = markdownify(markdown_text)
        self.assertEqual(
            response,
            "<p><a>Blacklisted protocol</a></p>",
        )

    def test_markdownify_not_losing_links(self):
        markdown_text = "[[1]](#ftnt_ref1) - [Our Epidemic of Loneliness and Isolation (hhs.gov)](https://www.hhs.gov/sites/default/files/surgeon-general-social-connection-advisory.pdf)"

        response = markdownify(markdown_text)
        # previously, this was '<p><a href=":">[1]</a></p>'
        self.assertEqual(
            response,
            '<p><a href="#ftnt_ref1">[1]</a> - <a href="https://www.hhs.gov/sites/default/files/surgeon-general-social-connection-advisory.pdf">Our Epidemic of Loneliness and Isolation (hhs.gov)</a></p>',
        )

    def test_markdownify_not_losing_sentences(self):
        markdown_text = "The CDC reports that it was 26.2 per 100,000.[[4]](#ftnt4) In addition, individuals with mental and behavioral health conditions have a higher risk of suicide; rates increased 46 percent from 2000-2020 in non-metro areas.[[5]](#ftnt5)"

        response = markdownify(markdown_text)
        # previously, this was '<p>The CDC reports that it was 26.2 per 100,000.<a href=";">[4]</a></p>', dropping the last sentence
        self.assertEqual(
            response,
            '<p>The CDC reports that it was 26.2 per 100,000.<a href="#ftnt4">[4]</a> In addition, individuals with mental and behavioral health conditions have a higher risk of suicide; rates increased 46 percent from 2000-2020 in non-metro areas.<a href="#ftnt5">[5]</a></p>',
        )

    def test_markdownify_not_losing_sentences_semicolon(self):
        markdown_text = "Citation 4. [footnote 4](#ftnt4) Citation 5. [footnote 5](#ftnt5) Citation 6; [footnote 6](#ftnt6)"

        response = markdownify(markdown_text)
        # previously, this was '<p>Citation 4. <a href="#ftnt4">footnote 4</a> Citation 5. <a href=";">footnote 5</a></p>'
        self.assertEqual(
            response,
            '<p>Citation 4. <a href="#ftnt4">footnote 4</a> Citation 5. <a href="#ftnt5">footnote 5</a> Citation 6; <a href="#ftnt6">footnote 6</a></p>',
        )

    def test_markdownify_not_losing_sentences_colon(self):
        markdown_text = "Citation 4. [footnote 4](#ftnt4) Citation 5. [footnote 5](#ftnt5) Citation 6: [footnote 6](#ftnt6)"

        response = markdownify(markdown_text)
        # previously, this was '<p>Citation 4. <a href="#ftnt4">footnote 4</a> Citation 5. <a href=":">footnote 5</a></p>'
        self.assertEqual(
            response,
            '<p>Citation 4. <a href="#ftnt4">footnote 4</a> Citation 5. <a href="#ftnt5">footnote 5</a> Citation 6: <a href="#ftnt6">footnote 6</a></p>',
        )
