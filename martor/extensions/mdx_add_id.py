import markdown
from xml.etree import ElementTree

# Regex pattern to detect `{#id_name}` at the end of the line
ADD_ID_RE = r"(.+?)\s\{#([a-zA-Z0-9_-]+)\}$"


class AddIDPattern(markdown.inlinepatterns.Pattern):
    """Pattern to match Markdown text ending with `{#id}` and set it as an ID."""

    def handleMatch(self, m):
        text_content = m.group(2).strip()  # Actual text content
        id_value = m.group(3)  # The ID inside `{#id}`

        # Create a <span> element to hold the text and ID
        el = ElementTree.Element("span")
        el.text = markdown.util.AtomicString(text_content)
        el.set("id", id_value)
        return el


class AddIDExtension(markdown.Extension):
    """Add ID Extension for Python-Markdown."""

    def extendMarkdown(self, md: markdown.core.Markdown, *args):
        """Register AddIDPattern with the Markdown parser."""
        md.inlinePatterns.register(AddIDPattern(ADD_ID_RE, md), "add_id", 9)


def makeExtension(*args, **kwargs):
    return AddIDExtension(*args, **kwargs)


if __name__ == "__main__":
    import doctest

    doctest.testmod()
