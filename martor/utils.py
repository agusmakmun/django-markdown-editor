import re

import bleach
from django.core.serializers.json import DjangoJSONEncoder
from django.utils.functional import Promise

try:
    from django.utils.encoding import force_str  # noqa: Django>=4.x
except ImportError:
    from django.utils.encoding import force_text as force_str  # noqa: Django<=3.x

import markdown

from .settings import (
    ALLOWED_HTML_ATTRIBUTES,
    ALLOWED_HTML_TAGS,
    ALLOWED_URL_SCHEMES,
    MARTOR_MARKDOWN_EXTENSION_CONFIGS,
    MARTOR_MARKDOWN_EXTENSIONS,
)


def markdownify(markdown_text):
    """
    Render the markdown content to HTML.

    Basic:
        >>> from martor.utils import markdownify
        >>> content = "![awesome](http://i.imgur.com/hvguiSn.jpg)"
        >>> markdownify(content)
        '<p><img alt="awesome" src="http://i.imgur.com/hvguiSn.jpg" /></p>'
        >>>
    """
    # Sanitize Markdown links
    # https://github.com/netbox-community/netbox/commit/5af2b3c2f577a01d177cb24cda1019551a2a4b64
    schemes = "|".join(ALLOWED_URL_SCHEMES)

    # Adjusted pattern to focus on links that do not follow the allowed schemes directly
    # The negative lookahead now correctly positioned to ensure it applies to the whole URL
    pattern = rf"\[([^\]]+)\]\(((?!({schemes}):)[^)]+)\)"

    markdown_text = re.sub(
        pattern,
        "[\\1](\\2)",
        markdown_text,
        flags=re.IGNORECASE,
    )

    html = markdown.markdown(
        markdown_text,
        extensions=MARTOR_MARKDOWN_EXTENSIONS,
        extension_configs=MARTOR_MARKDOWN_EXTENSION_CONFIGS,
    )
    return bleach.clean(
        html,
        tags=ALLOWED_HTML_TAGS,
        attributes=ALLOWED_HTML_ATTRIBUTES,
        protocols=ALLOWED_URL_SCHEMES,
    )


class LazyEncoder(DjangoJSONEncoder):
    """
    This problem because we found error encoding,
    as docs says, django has special `DjangoJSONEncoder` at
    https://docs.djangoproject.com/en/dev/topics/serialization/#serialization-formats-json
    also discussed in this answer: http://stackoverflow.com/a/31746279/6396981

    Usage:
        >>> data = {}
        >>> json.dumps(data, cls=LazyEncoder)
    """

    def default(self, obj):
        if isinstance(obj, Promise):
            return force_str(obj)
        return super().default(obj)
