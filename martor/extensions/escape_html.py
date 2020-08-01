
import markdown


class EscapeHtml(markdown.Extension):

    def extendMarkdown(self, md):
        md.preprocessors.deregister('html_block')
        md.inlinePatterns.deregister('html')


def makeExtension(*args, **kwargs):
    return EscapeHtml(*args, **kwargs)


if __name__ == "__main__":
    import doctest
    doctest.testmod()
