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
        attrs['data-uk-htmleditor'] = DRACEDITOR_EDITOR_OPTIONS

        widget = super(DraceditorWidget, self).render(name, value, attrs)

        template = get_template('draceditor/editor.html')

        return template.render({
            'draceditor': widget,
        })

    class Media:
        css = {
            'all': (
                'plugins/css/uikit.gradient.min.css',
                'plugins/css/htmleditor.gradient.min.css',
                'plugins/css/codemirror.css',
                'plugins/css/atwho.css',
                'css/draceditor.css',
            )
        }
        js = (
            'plugins/js/jquery.min.js',
            'plugins/js/uikit.min.js',
            'plugins/js/codemirror.min.js',

            'plugins/js/markdown.js',
            'plugins/js/overlay.js',
            'plugins/js/xml.js',
            'plugins/js/marked.min.js',

            # i dont't know if use this editor,
            # the `emoji` and `mention` is't work well.
            'plugins/js/htmleditor.js',

            'plugins/js/caret.min.js',
            'plugins/js/atwho.min.js',
            'plugins/js/emojis.min.js',
            'js/draceditor.js',
        )


class AdminDraceditorWidget(DraceditorWidget, widgets.AdminTextareaWidget):
    pass
