from django import forms
from django.template.loader import get_template
from django.contrib.admin import widgets

from .settings import (
    DRACEDITOR_ENABLE_CONFIGS,
    DRACEDITOR_UPLOAD_URL,
    DRACEDITOR_MARKDOWNIFY_URL,
    DRACEDITOR_SEARCH_USERS_URL,
    DRACEDITOR_MARKDOWN_BASE_EMOJI_URL
)


class DraceditorWidget(forms.Textarea):

    def render(self, name, value, attrs=None):
        if attrs is None:
            attrs = {}
        elif 'class' in attrs:
            attrs['class'] += ' draceditor'
        else:
            attrs.update({'class': 'draceditor'})

        attrs['data-enable-configs'] = DRACEDITOR_ENABLE_CONFIGS
        attrs['data-upload-url'] = DRACEDITOR_UPLOAD_URL
        attrs['data-markdownfy-url'] = DRACEDITOR_MARKDOWNIFY_URL
        attrs['data-search-users-url'] = DRACEDITOR_SEARCH_USERS_URL
        attrs['data-base-emoji-url'] = DRACEDITOR_MARKDOWN_BASE_EMOJI_URL

        widget = super(DraceditorWidget, self).render(name, value, attrs)

        template = get_template('draceditor/editor.html')

        return template.render({
            'draceditor': widget,
        })

    class Media:
        css = {
            'all': (
                'plugins/css/ace.min.css',
                'plugins/css/semantic.min.css',
                'css/draceditor.css',
            )
        }
        js = (
            #'plugins/js/jquery.min.js',
            'plugins/js/ace.js',
            'plugins/js/semantic.min.js',
            'plugins/js/mode-markdown.js',
            'plugins/js/ext-language_tools.js',
            'plugins/js/theme-github.js',
            'plugins/js/highlight.min.js',

            'plugins/js/emojis.min.js',
            'js/draceditor.js',
        )
        if DRACEDITOR_ENABLE_CONFIGS['jquery'] == 'true':
            js = ('plugins/js/jquery.min.js',).__add__(js)


class AdminDraceditorWidget(DraceditorWidget, widgets.AdminTextareaWidget):
    pass
