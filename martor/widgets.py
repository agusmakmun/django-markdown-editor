from django import forms
from django.template.loader import get_template
from django.contrib.admin import widgets

from .settings import (
    MARTOR_ENABLE_CONFIGS,
    MARTOR_UPLOAD_URL,
    MARTOR_MARKDOWNIFY_URL,
    MARTOR_SEARCH_USERS_URL,
    MARTOR_MARKDOWN_BASE_EMOJI_URL
)


class MartorWidget(forms.Textarea):

    def render(self, name, value, attrs=None, renderer=None, **kwargs):
        if attrs is None:
            attrs = {}
        elif 'class' in attrs:
            attrs['class'] += ' martor'
        else:
            attrs.update({'class': 'martor'})

        attrs['data-enable-configs'] = MARTOR_ENABLE_CONFIGS
        attrs['data-upload-url'] = MARTOR_UPLOAD_URL
        attrs['data-markdownfy-url'] = MARTOR_MARKDOWNIFY_URL
        attrs['data-search-users-url'] = MARTOR_SEARCH_USERS_URL
        attrs['data-base-emoji-url'] = MARTOR_MARKDOWN_BASE_EMOJI_URL

        widget = super(MartorWidget, self).render(name, value, attrs)

        template = get_template('martor/editor.html')

        return template.render({
            'martor': widget,
            'field_name': name
        })

    class Media:
        css = {
            'all': (
                'plugins/css/ace.min.css',
                'plugins/css/semantic.min.css',
                'plugins/css/resizable.min.css',
                'martor/css/martor.min.css',
            )
        }
        js = (
            'plugins/js/ace.js',
            'plugins/js/semantic.min.js',
            'plugins/js/mode-markdown.js',
            'plugins/js/ext-language_tools.js',
            'plugins/js/theme-github.js',
            'plugins/js/highlight.min.js',
            'plugins/js/resizable.min.js',
            'plugins/js/emojis.min.js',
            'martor/js/martor.min.js',
        )
        if MARTOR_ENABLE_CONFIGS['jquery'] == 'true':
            js = ('plugins/js/jquery.min.js',).__add__(js)


class AdminMartorWidget(MartorWidget, widgets.AdminTextareaWidget):
    pass
