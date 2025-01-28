from xml.etree import ElementTree

import markdown
from django.contrib.auth import get_user_model

from ..settings import MARTOR_ENABLE_CONFIGS, MARTOR_MARKDOWN_BASE_MENTION_URL

"""
>>> import markdown
>>> md = markdown.Markdown(extensions=['martor.utils.extensions.mention'])
>>> md.convert('@[summonagus]')
'<p><a class="direct-mention-link"
href="https://example.com/profile/summonagus/">summonagus</a></p>'
>>>
>>> md.convert('hello @[summonagus], i mentioned you!')
'<p>hello <a class="direct-mention-link"
href="https://example.com/profile/summonagus/">summonagus</a>,
i mentioned you!</p>'
>>>
"""

MENTION_RE = r"(?<!\!)\@\[([^\]]+)\]"


class MentionPattern(markdown.inlinepatterns.Pattern):
    def handleMatch(self, m):
        if MARTOR_ENABLE_CONFIGS["mention"] != "true":
            return

        username = self.unescape(m.group(2))
        User = get_user_model()
        users = User.objects.filter(
            is_active=True,
            **{getattr(User, "USERNAME_FIELD", "username"): username},
        )  # noqa: E501

        """Makesure `username` is registered and activated."""
        if users.exists():
            url = "{}{}/".format(
                MARTOR_MARKDOWN_BASE_MENTION_URL, username
            )  # noqa: E501
            el = ElementTree.Element("a")
            el.set("href", url)
            el.set("class", "direct-mention-link")
            el.text = markdown.util.AtomicString("@" + username)
            return el


class MentionExtension(markdown.Extension):
    def extendMarkdown(self, md: markdown.core.Markdown, *args):
        """Setup `mention_link` with MentionPattern"""
        md.inlinePatterns.register(MentionPattern(MENTION_RE, md), "mention_link", 13)


def makeExtension(*args, **kwargs):
    return MentionExtension(*args, **kwargs)


if __name__ == "__main__":
    import doctest

    doctest.testmod()
