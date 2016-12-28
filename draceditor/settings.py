from django.conf import settings

# Imgur API Keys
DRACEDITOR_IMGUR_CLIENT_ID = getattr(
    settings, 'DRACEDITOR_IMGUR_CLIENT_ID', ''
)
DRACEDITOR_IMGUR_API_KEY = getattr(
    settings, 'DRACEDITOR_IMGUR_API_KEY', ''
)

# Safe Mode
DRACEDITOR_MARKDOWN_SAFE_MODE = getattr(
    settings, 'DRACEDITOR_MARKDOWN_SAFE_MODE', True
)

# Markdownify
DRACEDITOR_MARKDOWNIFY_FUNCTION = getattr(
    settings, 'DRACEDITOR_MARKDOWNIFY_FUNCTION', 'draceditor.utils.markdownify'
)

# Markdown extensions
DRACEDITOR_MARKDOWN_EXTENSIONS = getattr(
    settings, 'DRACEDITOR_MARKDOWN_EXTENSIONS', [
        'markdown.extensions.extra',
        'markdown.extensions.nl2br',
        'markdown.extensions.smarty',
        'markdown.extensions.fenced_code',

        # Custom markdown extensions.
        'draceditor.utils.extensions.urlize',
        'draceditor.utils.extensions.mention',
        'draceditor.utils.extensions.emoji',
    ]
)
DRACEDITOR_MARKDOWN_EXTENSION_CONFIGS = getattr(
    settings, 'DRACEDITOR_MARKDOWN_EXTENSION_CONFIGS', {}
)

# Markdown urls
DRACEDITOR_UPLOAD_URLS_PATH = getattr(
    settings, 'DRACEDITOR_UPLOAD_URLS_PATH', '/draceditor/uploader/'
)
DRACEDITOR_SEARCH_USERS_URLS_PATH = getattr(
    settings, 'DRACEDITOR_SEARCH_USERS_URLS_PATH', '/draceditor/search-user/'
)

# Markdown Extensions
DRACEDITOR_MARKDOWN_BASE_EMOJI_URL = getattr(
    settings, 'DRACEDITOR_MARKDOWN_BASE_EMOJI_URL', 'https://assets-cdn.github.com/images/icons/emoji/'
)
DRACEDITOR_MARKDOWN_BASE_MENTION_URL = getattr(
    settings, 'DRACEDITOR_MARKDOWN_BASE_MENTION_URL', 'https://forum.dracos-linux.org/profile/'
)

# https://getuikit.com/docs/htmleditor.html#javascript-options
DRACEDITOR_EDITOR_OPTIONS = getattr(
    settings, 'DRACEDITOR_EDITOR_OPTIONS', {
        'markdown': 'true',
        'toolbar': [
            'bold', 'italic', 'strike',
            'link', 'image', 'blockquote',
            'listUl', 'listOl', 'upload',
        ]
    }
)
