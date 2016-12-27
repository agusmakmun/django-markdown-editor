from django.conf import settings

# Safe Mode
DRACEDITOR_MARKDOWN_SAFE_MODE getattr(
    settings, 'DRACEDITOR_MARKDOWN_SAFE_MODE', True
)

# Markdownify
DRACEDITOR_MARKDOWNIFY_FUNCTION = getattr(
    settings, 'DRACEDITOR_MARKDOWNIFY_FUNCTION', 'draceditor.utils.markdownify'
)

# Markdown extensions
DRACEDITOR_MARKDOWN_EXTENSIONS = getattr(settings, 'DRACEDITOR_MARKDOWN_EXTENSIONS', [])
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
    settings, 'DRACEDITOR_EDITOR_OPTIONS',
    {
        'markdown': 'true',
        'toolbar': [
            'bold', 'italic', 'strike',
            'link', 'picture', 'blockquote',
            'listUl', 'listOl', 'upload'
        ]
    }
)
