import markdown
from django.contrib.auth.models import User
from ..settings import (
    DRACEDITOR_MARKDOWN_BASE_MENTION_URL
)

"""
>>> import markdown
>>> md = markdown.Markdown(extensions=['draceditor.utils.extensions.mention'])
>>> md.convert('@[summonagus]')
'<p><a href="https://forum.dracos-linux.org/profile/summonagus/">summonagus</a></p>'
>>>
>>> md.convert('hellp @[summonagus], i mentioned you!')
'<p>hellp <a href="https://forum.dracos-linux.org/profile/summonagus/">summonagus</a>, i mentioned you!</p>'
>>>
"""

MENTION_RE = r'(?<!\!)\@\[([^\]]+)\]'


class MentionPattern(markdown.inlinepatterns.Pattern):

    def handleMatch(self, m):
        username = self.unescape(m.group(2))

        """Makesure `username` is registered."""
        if username in [u.username for u in User.objects.all() if u.is_active]:
            url = '{0}{1}/'.format(DRACEDITOR_MARKDOWN_BASE_MENTION_URL, username)
            el = markdown.util.etree.Element('a')
            el.set('href', url)
            el.set('class', 'direct-mention-link')
            el.text = markdown.util.AtomicString('@' + username)
            return el


class MentionExtension(markdown.Extension):

    def extendMarkdown(self, md, md_globals):
        """ Setup `mention_link` with MentionPattern """
        md.inlinePatterns['mention_link'] = MentionPattern(MENTION_RE, md)


def makeExtension(*args, **kwargs):
    return MentionExtension(*args, **kwargs)
