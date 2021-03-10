# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.conf import settings

# Choices are: "semantic", "bootstrap"
MARTOR_THEME = getattr(settings, 'MARTOR_THEME', 'bootstrap')

# Global martor settings
# Input: string boolean, `true/false`
MARTOR_ENABLE_CONFIGS = getattr(
    settings, 'MARTOR_ENABLE_CONFIGS', {
        'emoji': 'true',  # enable/disable emoji icons.
        'imgur': 'true',  # enable/disable imgur/custom uploader.
        'mention': 'false',  # enable/disable mention
        'jquery': 'true',  # include/revoke jquery (require for admin django)
        'living': 'false',  # enable/disable live updates in preview
        'spellcheck': 'false',  # enable/disable spellcheck in form textareas
        'hljs': 'true',  # enable/disable hljs highlighting in preview
    }
)

# To show the toolbar buttons
MARTOR_TOOLBAR_BUTTONS = getattr(
    settings, 'MARTOR_TOOLBAR_BUTTONS', [
        'bold', 'italic', 'horizontal', 'heading', 'pre-code',
        'blockquote', 'unordered-list', 'ordered-list',
        'link', 'image-link', 'image-upload', 'emoji',
        'direct-mention', 'toggle-maximize', 'help'
    ]
)

# To setup the martor editor with title label or not (default is False)
MARTOR_ENABLE_LABEL = getattr(
    settings, 'MARTOR_ENABLE_LABEL', False
)

# Imgur API Keys
MARTOR_IMGUR_CLIENT_ID = getattr(
    settings, 'MARTOR_IMGUR_CLIENT_ID', ''
)
MARTOR_IMGUR_API_KEY = getattr(
    settings, 'MARTOR_IMGUR_API_KEY', ''
)

# Markdownify
MARTOR_MARKDOWNIFY_FUNCTION = getattr(
    settings, 'MARTOR_MARKDOWNIFY_FUNCTION', 'martor.utils.markdownify'
)
MARTOR_MARKDOWNIFY_URL = getattr(
    settings, 'MARTOR_MARKDOWNIFY_URL', '/martor/markdownify/'
)

# Markdown extensions
MARTOR_MARKDOWN_EXTENSIONS = getattr(
    settings, 'MARTOR_MARKDOWN_EXTENSIONS', [
        'markdown.extensions.extra',
        'markdown.extensions.nl2br',
        'markdown.extensions.smarty',
        'markdown.extensions.fenced_code',

        # Custom markdown extensions.
        'martor.extensions.urlize',
        'martor.extensions.del_ins',  # ~~strikethrough~~ and ++underscores++
        'martor.extensions.mention',  # to parse markdown mention
        'martor.extensions.emoji',  # to parse markdown emoji
        'martor.extensions.mdx_video',  # to parse embed/iframe video
        'martor.extensions.escape_html',  # to handle the XSS vulnerabilities
    ]
)

# Markdown Extensions Configs
MARTOR_MARKDOWN_EXTENSION_CONFIGS = getattr(
    settings, 'MARTOR_MARKDOWN_EXTENSION_CONFIGS', {}
)

# Markdown urls
MARTOR_UPLOAD_URL = getattr(
    settings, 'MARTOR_UPLOAD_URL',
    '/martor/uploader/'  # for imgur
)
MARTOR_SEARCH_USERS_URL = getattr(
    settings, 'MARTOR_SEARCH_USERS_URL',
    '/martor/search-user/'  # for mention
)

# Markdown Extensions
MARTOR_MARKDOWN_BASE_EMOJI_URL = getattr(
    settings, 'MARTOR_MARKDOWN_BASE_EMOJI_URL',
    'https://github.githubassets.com/images/icons/emoji/'
)

MARTOR_MARKDOWN_BASE_MENTION_URL = getattr(
    settings, 'MARTOR_MARKDOWN_BASE_MENTION_URL',
    'https://python.web.id/author/'
)

# If you need to use your own themed "bootstrap" or "semantic ui" dependency
# replace the values with the file in your static files dir
MARTOR_ALTERNATIVE_JS_FILE_THEME = getattr(
    settings, 'MARTOR_ALTERNATIVE_JS_FILE_THEME', None
)
MARTOR_ALTERNATIVE_CSS_FILE_THEME = getattr(
    settings, 'MARTOR_ALTERNATIVE_CSS_FILE_THEME', None
)
MARTOR_ALTERNATIVE_JQUERY_JS_FILE = getattr(
    settings, 'MARTOR_ALTERNATIVE_JQUERY_JS_FILE', None
)
