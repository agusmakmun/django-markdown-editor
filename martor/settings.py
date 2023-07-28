# -*- coding: utf-8 -*-
from __future__ import unicode_literals

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
MARTOR_MARKDOWNIFY_FUNCTION = getattr(
    settings, "MARTOR_MARKDOWNIFY_FUNCTION", "martor.utils.markdownify"
)
MARTOR_MARKDOWNIFY_URL = getattr(
    settings, "MARTOR_MARKDOWNIFY_URL", "/martor/markdownify/"
)

# Markdown extensions
MARTOR_MARKDOWN_EXTENSIONS = getattr(
    settings,
    "MARTOR_MARKDOWN_EXTENSIONS",
    [
        "markdown.extensions.extra",
        "markdown.extensions.nl2br",
        "markdown.extensions.smarty",
        "markdown.extensions.fenced_code",
        # Custom markdown extensions.
        "martor.extensions.urlize",
        "martor.extensions.del_ins",  # ~~strikethrough~~ and ++underscores++
        "martor.extensions.mention",  # to parse markdown mention
        "martor.extensions.emoji",  # to parse markdown emoji
        "martor.extensions.mdx_video",  # to parse embed/iframe video
        "martor.extensions.escape_html",  # to handle the XSS vulnerabilities
    ],
)

# Markdown Extensions Configs
MARTOR_MARKDOWN_EXTENSION_CONFIGS = getattr(
    settings, "MARTOR_MARKDOWN_EXTENSION_CONFIGS", {}
)

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
MARTOR_ALTERNATIVE_JS_FILE_THEME = getattr(
    settings, "MARTOR_ALTERNATIVE_JS_FILE_THEME", None
)
MARTOR_ALTERNATIVE_CSS_FILE_THEME = getattr(
    settings, "MARTOR_ALTERNATIVE_CSS_FILE_THEME", None
)
MARTOR_ALTERNATIVE_JQUERY_JS_FILE = getattr(
    settings, "MARTOR_ALTERNATIVE_JQUERY_JS_FILE", None
)

# URL schemes that are allowed within links
ALLOWED_URL_SCHEMES = getattr(
    settings,
    "ALLOWED_URL_SCHEMES",
    {
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
    },
)

# https://gist.github.com/mrmrs/7650266
ALLOWED_HTML_TAGS = getattr(
    settings,
    "ALLOWED_HTML_TAGS",
    {
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
    },
)

# https://www.w3schools.com/TAGS/ref_attributes.asp
# https://www.w3schools.com/TAGS/default.asp
# https://www.w3schools.com/TAGS/ref_standardattributes.asp
GLOBAL_HTML_ATTRIBUTES = getattr(
    settings,
    "GLOBAL_HTML_ATTRIBUTES",
    {
        "accesskey",
        "class",
        "contenteditable",
        "data-",  # https://github.com/messense/nh3/issues/14
        "dir",
        "draggable",
        "hidden",
        "id",
        "lang",
        "spellcheck",
        "style",
        "tabindex",
        "title",
        "translate",
    },
)

# https://github.com/decal/werdlists/blob/master/html-words/html-attributes-list.txt
ALLOWED_HTML_ATTRIBUTES = getattr(
    settings,
    "ALLOWED_HTML_ATTRIBUTES",
    {
        "a": GLOBAL_HTML_ATTRIBUTES
        | {"href"},  # don't add "rel", it will causing rust error
        "abbr": GLOBAL_HTML_ATTRIBUTES,
        "blockquote": GLOBAL_HTML_ATTRIBUTES,
        "cite": GLOBAL_HTML_ATTRIBUTES,
        "code": GLOBAL_HTML_ATTRIBUTES,
        "command": GLOBAL_HTML_ATTRIBUTES,
        "dd": GLOBAL_HTML_ATTRIBUTES,
        "del": GLOBAL_HTML_ATTRIBUTES | {"cite", "datetime"},
        "dl": GLOBAL_HTML_ATTRIBUTES,
        "dt": GLOBAL_HTML_ATTRIBUTES,
        "em": GLOBAL_HTML_ATTRIBUTES,
        "fieldset": GLOBAL_HTML_ATTRIBUTES,
        "h1": GLOBAL_HTML_ATTRIBUTES,
        "h2": GLOBAL_HTML_ATTRIBUTES,
        "h3": GLOBAL_HTML_ATTRIBUTES,
        "h4": GLOBAL_HTML_ATTRIBUTES,
        "h5": GLOBAL_HTML_ATTRIBUTES,
        "h6": GLOBAL_HTML_ATTRIBUTES,
        "hr": GLOBAL_HTML_ATTRIBUTES,
        "iframe": GLOBAL_HTML_ATTRIBUTES,
        "img": GLOBAL_HTML_ATTRIBUTES | {"alt", "height", "src", "width"},
        "input": GLOBAL_HTML_ATTRIBUTES | {"type", "name", "value"},
        "ins": GLOBAL_HTML_ATTRIBUTES | {"cite", "datetime"},
        "kbd": GLOBAL_HTML_ATTRIBUTES,
        "label": GLOBAL_HTML_ATTRIBUTES | {"for"},
        "legend": GLOBAL_HTML_ATTRIBUTES,
        "li": GLOBAL_HTML_ATTRIBUTES,
        "ol": GLOBAL_HTML_ATTRIBUTES,
        "optgroup": GLOBAL_HTML_ATTRIBUTES | {"label"},
        "option": GLOBAL_HTML_ATTRIBUTES | {"value"},
        "p": GLOBAL_HTML_ATTRIBUTES,
        "pre": GLOBAL_HTML_ATTRIBUTES,
        "small": GLOBAL_HTML_ATTRIBUTES,
        "span": GLOBAL_HTML_ATTRIBUTES,
        "strong": GLOBAL_HTML_ATTRIBUTES,
        "sub": GLOBAL_HTML_ATTRIBUTES,
        "sup": GLOBAL_HTML_ATTRIBUTES,
        "table": GLOBAL_HTML_ATTRIBUTES,
        "tbody": GLOBAL_HTML_ATTRIBUTES,
        "td": GLOBAL_HTML_ATTRIBUTES,
        "tfoot": GLOBAL_HTML_ATTRIBUTES,
        "th": GLOBAL_HTML_ATTRIBUTES,
        "thead": GLOBAL_HTML_ATTRIBUTES,
        "tr": GLOBAL_HTML_ATTRIBUTES,
        "u": GLOBAL_HTML_ATTRIBUTES,
        "ul": GLOBAL_HTML_ATTRIBUTES,
    },
)
