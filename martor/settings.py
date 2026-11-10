from django.conf import settings

# Choices are: "semantic", "bootstrap"
MARTOR_THEME = getattr(settings, "MARTOR_THEME", "bootstrap")

# Global martor settings
# Input: string boolean, `true/false`
MARTOR_ENABLE_CONFIGS = getattr(
    settings,
    "MARTOR_ENABLE_CONFIGS",
    {
        "emoji": "true",  # enable/disable emoji icons.
        "imgur": "true",  # enable/disable imgur/custom uploader.
        "mention": "false",  # enable/disable mention
        "jquery": "true",  # include/revoke jquery (require for admin django)
        "living": "false",  # enable/disable live updates in preview
        "spellcheck": "false",  # enable/disable spellcheck in form textareas
        "hljs": "true",  # enable/disable hljs highlighting in preview
    },
)

# To show the toolbar buttons
MARTOR_TOOLBAR_BUTTONS = getattr(
    settings,
    "MARTOR_TOOLBAR_BUTTONS",
    [
        "bold",
        "italic",
        "horizontal",
        "heading",
        "pre-code",
        "blockquote",
        "unordered-list",
        "ordered-list",
        "link",
        "image-link",
        "image-upload",
        "emoji",
        "direct-mention",
        "toggle-maximize",
        "help",
    ],
)

# To setup the martor editor with title label or not (default is False)
MARTOR_ENABLE_LABEL = getattr(settings, "MARTOR_ENABLE_LABEL", False)

# Imgur API Keys
MARTOR_IMGUR_CLIENT_ID = getattr(settings, "MARTOR_IMGUR_CLIENT_ID", "")
MARTOR_IMGUR_API_KEY = getattr(settings, "MARTOR_IMGUR_API_KEY", "")

# Markdownify
MARTOR_MARKDOWNIFY_FUNCTION = getattr(settings, "MARTOR_MARKDOWNIFY_FUNCTION", "martor.utils.markdownify")
# Require login for the markdownify (preview) endpoint, keep False for anonymous forms
MARTOR_MARKDOWNIFY_LOGIN_REQUIRED = getattr(settings, "MARTOR_MARKDOWNIFY_LOGIN_REQUIRED", False)
MARTOR_MARKDOWNIFY_URL = getattr(settings, "MARTOR_MARKDOWNIFY_URL", "/martor/markdownify/")

# Time to delay the markdownify ajax request, in millisecond.
MARTOR_MARKDOWNIFY_TIMEOUT = getattr(settings, "MARTOR_MARKDOWNIFY_TIMEOUT", 1000)

# Markdown extensions
MARTOR_MARKDOWN_EXTENSIONS = getattr(
    settings,
    "MARTOR_MARKDOWN_EXTENSIONS",
    [
        "markdown.extensions.extra",
        "markdown.extensions.nl2br",
        "markdown.extensions.smarty",
        "markdown.extensions.fenced_code",
        "markdown.extensions.sane_lists",
        # Custom markdown extensions.
        "martor.extensions.urlize",
        "martor.extensions.del_ins",  # ~~strikethrough~~ and ++underscores++
        "martor.extensions.mention",  # to parse markdown mention
        "martor.extensions.emoji",  # to parse markdown emoji
        "martor.extensions.mdx_video",  # to parse embed/iframe video
        "martor.extensions.escape_html",  # to handle the XSS vulnerabilities
        "martor.extensions.mdx_add_id",  # to parse id like {#this_is_id}
    ],
)

# Markdown Extensions Configs
MARTOR_MARKDOWN_EXTENSION_CONFIGS = getattr(settings, "MARTOR_MARKDOWN_EXTENSION_CONFIGS", {})

# Markdown urls
MARTOR_UPLOAD_URL = (
    # Allows to disable this endpoint
    settings.MARTOR_UPLOAD_URL
    if hasattr(settings, "MARTOR_UPLOAD_URL")
    else "/martor/uploader/"
)

MARTOR_SEARCH_USERS_URL = (
    # Allows to disable this endpoint
    settings.MARTOR_SEARCH_USERS_URL
    if hasattr(settings, "MARTOR_SEARCH_USERS_URL")
    else "/martor/search-user/"
)

# Markdown Extensions
MARTOR_MARKDOWN_BASE_EMOJI_URL = (
    # Allows to disable this endpoint
    settings.MARTOR_MARKDOWN_BASE_EMOJI_URL
    if hasattr(settings, "MARTOR_MARKDOWN_BASE_EMOJI_URL")
    else "https://github.githubassets.com/images/icons/emoji/"
)

MARTOR_MARKDOWN_BASE_MENTION_URL = getattr(
    settings,
    "MARTOR_MARKDOWN_BASE_MENTION_URL",
    "",
)

# If you need to use your own themed "bootstrap" or "semantic ui" dependency
# replace the values with the file in your static files dir
MARTOR_ALTERNATIVE_JS_FILE_THEME = getattr(settings, "MARTOR_ALTERNATIVE_JS_FILE_THEME", None)
MARTOR_ALTERNATIVE_CSS_FILE_THEME = getattr(settings, "MARTOR_ALTERNATIVE_CSS_FILE_THEME", None)
MARTOR_ALTERNATIVE_JQUERY_JS_FILE = getattr(settings, "MARTOR_ALTERNATIVE_JQUERY_JS_FILE", None)

# URL schemes that are allowed within links
ALLOWED_URL_SCHEMES = getattr(
    settings,
    "ALLOWED_URL_SCHEMES",
    [
        "file",
        "ftp",
        "ftps",
        "http",
        "https",
        "irc",
        "mailto",
        "sftp",
        "ssh",
        "tel",
        "telnet",
        "tftp",
        "vnc",
        "xmpp",
    ],
)

# https://gist.github.com/mrmrs/7650266
ALLOWED_HTML_TAGS = getattr(
    settings,
    "ALLOWED_HTML_TAGS",
    [
        "a",
        "abbr",
        "b",
        "blockquote",
        "br",
        "cite",
        "code",
        "command",
        "dd",
        "del",
        "dl",
        "dt",
        "em",
        "fieldset",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "hr",
        "i",
        "iframe",
        "img",
        "input",
        "ins",
        "kbd",
        "label",
        "legend",
        "li",
        "ol",
        "optgroup",
        "option",
        "p",
        "pre",
        "small",
        "span",
        "strong",
        "sub",
        "sup",
        "table",
        "tbody",
        "td",
        "tfoot",
        "th",
        "thead",
        "tr",
        "u",
        "ul",
    ],
)

# https://github.com/decal/werdlists/blob/master/html-words/html-attributes-list.txt
ALLOWED_HTML_ATTRIBUTES = getattr(
    settings,
    "ALLOWED_HTML_ATTRIBUTES",
    [
        "alt",
        "class",
        "color",
        "colspan",
        # "data",
        "datetime",
        "height",
        "href",
        "id",
        "name",
        "reversed",
        "rowspan",
        "scope",
        "src",
        "style",
        "title",
        "type",
        "width",
    ],
)

# CSS properties kept in inline `style` attributes, everything else is removed.
# Default: the list bleach's `CSSSanitizer` allowed, so styles render as before.
ALLOWED_CSS_PROPERTIES = getattr(
    settings,
    "ALLOWED_CSS_PROPERTIES",
    [
        "azimuth",
        "background-color",
        "border-bottom-color",
        "border-collapse",
        "border-color",
        "border-left-color",
        "border-right-color",
        "border-top-color",
        "clear",
        "color",
        "cursor",
        "direction",
        "display",
        "elevation",
        "float",
        "font",
        "font-family",
        "font-size",
        "font-style",
        "font-variant",
        "font-weight",
        "height",
        "letter-spacing",
        "line-height",
        "overflow",
        "pause",
        "pause-after",
        "pause-before",
        "pitch",
        "pitch-range",
        "richness",
        "speak",
        "speak-header",
        "speak-numeral",
        "speak-punctuation",
        "speech-rate",
        "stress",
        "text-align",
        "text-decoration",
        "text-indent",
        "unicode-bidi",
        "vertical-align",
        "voice-family",
        "volume",
        "white-space",
        "width",
    ],
)
# Disable admin style when using custom admin interface e.g django-grappelli
MARTOR_ENABLE_ADMIN_CSS = getattr(settings, "MARTOR_ENABLE_ADMIN_CSS", True)

# Follow django's `CSRF_COOKIE_NAME` unless overridden.
MARTOR_CSRF_COOKIE_NAME = getattr(settings, "MARTOR_CSRF_COOKIE_NAME", settings.CSRF_COOKIE_NAME)

# Text shown in the preview tab when there is nothing to preview.
# `None` keeps the default (translated) "Nothing to preview".
MARTOR_PREVIEW_PLACEHOLDER = getattr(settings, "MARTOR_PREVIEW_PLACEHOLDER", None)
