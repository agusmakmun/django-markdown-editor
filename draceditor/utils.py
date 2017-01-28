from django.utils.functional import Promise
from django.utils.encoding import force_text
from django.core.serializers.json import DjangoJSONEncoder

import markdown
from .settings import (
    DRACEDITOR_MARKDOWN_SAFE_MODE,
    DRACEDITOR_MARKDOWN_EXTENSIONS,
    DRACEDITOR_MARKDOWN_EXTENSION_CONFIGS
)


def markdownify(markdown_content):
    """
    Render the markdown content to HTML.

    Basic:
        >>> from draceditor.utils import markdownify
        >>> content = "![awesome](http://i.imgur.com/hvguiSn.jpg)"
        >>> markdownify(content)
        '<p><img alt="awesome" src="http://i.imgur.com/hvguiSn.jpg" /></p>'
        >>>
    """
    return markdown.markdown(
        markdown_content,
        safe_mode=DRACEDITOR_MARKDOWN_SAFE_MODE,
        extensions=DRACEDITOR_MARKDOWN_EXTENSIONS,
        extension_configs=DRACEDITOR_MARKDOWN_EXTENSION_CONFIGS
    )


class LazyEncoder(DjangoJSONEncoder):
    """
    This problem because we found error encoding,
    as docs says, django has special `DjangoJSONEncoder`
    at https://docs.djangoproject.com/en/1.10/topics/serialization/#serialization-formats-json
    also discused in this answer: http://stackoverflow.com/a/31746279/6396981

    Usage:
        >>> data = {}
        >>> json.dumps(data, cls=LazyEncoder)
    """

    def default(self, obj):
        if isinstance(obj, Promise):
            return force_text(obj)
        return super(LazyEncoder, self).default(obj)
