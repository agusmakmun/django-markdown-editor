from django import forms
from django.template.loader import get_template
from django.contrib.admin import widgets

from .settings import (
    DRACEDITOR_UPLOAD_URLS_PATH,
    DRACEDITOR_SEARCH_USERS_URLS_PATH,
    DRACEDITOR_MARKDOWN_BASE_EMOJI_URL,
    DRACEDITOR_EDITOR_OPTIONS
)


class MarkdownxWidget(forms.Textarea):

    def render(self, name, value, attrs=None):
        if attrs is None:
            attrs = {}
        elif 'class' in attrs:
            attrs['class'] += ' draceditor'
        else:
            attrs.update({'class': 'draceditor'})

        attrs['data-upload-urls-path'] = DRACEDITOR_UPLOAD_URLS_PATH
        attrs['data-search-users-urls-path'] = DRACEDITOR_SEARCH_USERS_URLS_PATH
        attrs['data-base-emoji-url'] = DRACEDITOR_MARKDOWN_BASE_EMOJI_URL
        attrs['data-uk-htmleditor'] = DRACEDITOR_EDITOR_OPTIONS

        widget = super(MarkdownxWidget, self).render(name, value, attrs)

        template = get_template('draceditor/editor.html')

        return template.render({
            'draceditor': widget,
        })

    class Media:
        js = (
            'draceditor/js/draceditor.js',
        )


class AdminMarkdownxWidget(MarkdownxWidget, widgets.AdminTextareaWidget):

    class Media:
        css = {
            'all': ('draceditor/admin/css/draceditor.css',)
        }
        js = (
            'draceditor/js/draceditor.js',
        )
