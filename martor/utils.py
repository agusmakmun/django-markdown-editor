# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.utils.functional import Promise
from django.utils.encoding import force_text
from django.core.serializers.json import DjangoJSONEncoder

import markdown
from .settings import (
    MARTOR_MARKDOWN_EXTENSIONS,
    MARTOR_MARKDOWN_EXTENSION_CONFIGS
)


class VersionNotCompatible(Exception):
    pass


def markdownify(markdown_content):
    """
    Render the markdown content to HTML.

    Basic:
        >>> from martor.utils import markdownify
        >>> content = "![awesome](http://i.imgur.com/hvguiSn.jpg)"
        >>> markdownify(content)
        '<p><img alt="awesome" src="http://i.imgur.com/hvguiSn.jpg" /></p>'
        >>>
    """
    try:
        return markdown.markdown(
            markdown_content,
            extensions=MARTOR_MARKDOWN_EXTENSIONS,
            extension_configs=MARTOR_MARKDOWN_EXTENSION_CONFIGS
        )
    except TypeError as e:
        if 'extendMarkdown' not in str(e):
            raise
        raise VersionNotCompatible(
            "The markdown isn't compatible, please reinstall "
            "your python markdown into Markdown>=3.0"
        )


class LazyEncoder(DjangoJSONEncoder):
    """
    This problem because we found error encoding,
    as docs says, django has special `DjangoJSONEncoder` at
    https://docs.djangoproject.com/en/dev/topics/serialization/#serialization-formats-json
    also discused in this answer: http://stackoverflow.com/a/31746279/6396981

    Usage:
        >>> data = {}
        >>> json.dumps(data, cls=LazyEncoder)
    """

    def default(self, obj):
        if isinstance(obj, Promise):
            return force_text(obj)
        return super(LazyEncoder, self).default(obj)
