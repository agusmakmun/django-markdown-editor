from django import template
from django.utils.safestring import mark_safe

from ..utils import markdownify

register = template.Library()


@register.filter
def safe_markdown(markdown_text):
    """
    Safe the markdown text as html output.

    Usage:
        {% load martortags %}
        {{ markdown_text|safe_markdown }}

    Example:
        {{ post.description|safe_markdown }}
    """
    return mark_safe(markdownify(markdown_text))
