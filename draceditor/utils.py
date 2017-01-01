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
