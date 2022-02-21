from django.test import TestCase, override_settings
from django.contrib.auth.models import User
from martor.utils import markdownify


class SimpleTest(TestCase):
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
        }
    )
    def test_markdownify(self):
        # Heading
        response = self.client.post(
            "/martor/markdownify/", {"content": "# Hello world!"}
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

        # # Mention
        # response = self.client.post(
        #     '/martor/markdownify/',
        #     {'content': f'@[{self.user.username}]'}
        # )
        # self.assertEqual(response.status_code, 200)
        # self.assertEqual(
        #     response.content.decode('utf-8'),
        #     '...fixme'
        # )

    def test_markdownify_xss_handled(self):
        xss_payload_1 = "[aaaa](javascript:alert(1))"
        response_1 = markdownify(xss_payload_1)
        self.assertEqual(response_1, '<p><a href=":">aaaa</a></p>')

        # xss_payload_2 = "![\" onerror=alert(1) ](x)"
        # response_2 = markdownify(xss_payload_2)
        # self.assertEqual(response_2, '')
