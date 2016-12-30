from django import forms
from django.template.loader import get_template
from django.contrib.admin import widgets

from .settings import (
    DRACEDITOR_UPLOAD_URLS_PATH,
    DRACEDITOR_SEARCH_USERS_URLS_PATH,
    DRACEDITOR_MARKDOWN_BASE_EMOJI_URL,
    DRACEDITOR_EDITOR_OPTIONS
)


class DraceditorWidget(forms.Textarea):

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
        attrs['data-toolbar'] = DRACEDITOR_EDITOR_OPTIONS

        widget = super(DraceditorWidget, self).render(name, value, attrs)

        template = get_template('draceditor/editor.html')

        return template.render({
            'draceditor': widget,
        })

    class Media:
        css = {
            'all': (
                'plugins/css/ace.min.css',
                'plugins/css/atwho.css',
                'plugins/css/semantic.min.css',
                'css/draceditor.css',
            )
        }
        js = (
            'plugins/js/jquery.min.js',
            'plugins/js/ace.js',
            'plugins/js/semantic.min.js',
            'plugins/js/mode-markdown.js',
            'plugins/js/ext-language_tools.js',
            'plugins/js/theme-github.js',
            'plugins/js/marked.min.js',
            'plugins/js/highlight.min.js',

            'plugins/js/emojis.min.js',
            'js/draceditor.js',
        )


class AdminDraceditorWidget(DraceditorWidget, widgets.AdminTextareaWidget):
    pass
