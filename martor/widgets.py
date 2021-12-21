# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django import forms
from django.template.loader import get_template
from django.contrib.admin import widgets

from .settings import (
    MARTOR_THEME,
    MARTOR_ENABLE_CONFIGS,
    MARTOR_UPLOAD_URL,
    MARTOR_MARKDOWNIFY_URL,
    MARTOR_SEARCH_USERS_URL,
    MARTOR_MARKDOWN_BASE_EMOJI_URL,
    MARTOR_TOOLBAR_BUTTONS,
    MARTOR_ALTERNATIVE_JS_FILE_THEME,
    MARTOR_ALTERNATIVE_CSS_FILE_THEME,
    MARTOR_ALTERNATIVE_JQUERY_JS_FILE,
)


def get_theme():
    """function to get the selected theme"""
    supported_themes = ["bootstrap", "semantic"]
    if MARTOR_THEME in supported_themes:
        return MARTOR_THEME
    return "bootstrap"


class MartorWidget(forms.Textarea):
    def render(self, name, value, attrs=None, renderer=None, **kwargs):
        # Make the settings the default attributes to pass
        attributes_to_pass = {
            "data-enable-configs": MARTOR_ENABLE_CONFIGS,
            "data-upload-url": MARTOR_UPLOAD_URL,
            "data-markdownfy-url": MARTOR_MARKDOWNIFY_URL,
            "data-search-users-url": MARTOR_SEARCH_USERS_URL,
            "data-base-emoji-url": MARTOR_MARKDOWN_BASE_EMOJI_URL,
        }

        # Make sure that the martor value is in the class attr passed in
        if "class" in attrs:
            attrs["class"] += " martor"
        else:
            attrs["class"] = "martor"

        # Update and overwrite with the attributes passed in
        attributes_to_pass.update(attrs)

        # Update and overwrite with any attributes that are on the widget
        # itself. This is also the only way we can push something in without
        # being part of the render chain.
        attributes_to_pass.update(self.attrs)

        template = get_template("martor/%s/editor.html" % get_theme())
        emoji_enabled = MARTOR_ENABLE_CONFIGS.get("emoji") == "true"
        mentions_enabled = MARTOR_ENABLE_CONFIGS.get("mention") == "true"

        widget = super().render(name, value, attributes_to_pass)

        return template.render(
            {
                "martor": widget,
                "field_name": name,
                "emoji_enabled": emoji_enabled,
                "mentions_enabled": mentions_enabled,
                "toolbar_buttons": MARTOR_TOOLBAR_BUTTONS,
            }
        )

    class Media:
        selected_theme = get_theme()
        css = {
            "all": (
                "plugins/css/ace.min.css",
                "plugins/css/resizable.min.css",
                "martor/css/martor.%s.min.css" % selected_theme,
                "martor/css/martor-admin.min.css",
            )
        }
        js = (
            "plugins/js/ace.js",
            "plugins/js/mode-markdown.js",
            "plugins/js/ext-language_tools.js",
            "plugins/js/theme-github.js",
            "plugins/js/highlight.min.js",
            "plugins/js/resizable.min.js",
            "plugins/js/emojis.min.js",
            "martor/js/martor.%s.min.js" % selected_theme,
        )

        # Adding the following scripts to the end
        # of the tuple in case it affects behaviour.
        # spellcheck configuration
        if MARTOR_ENABLE_CONFIGS.get("spellcheck") == "true":
            js = ("plugins/js/typo.js", "plugins/js/spellcheck.js").__add__(js)

        # support alternative vendor theme file like: bootstrap, semantic)
        # 1. vendor css theme
        if MARTOR_ALTERNATIVE_CSS_FILE_THEME:
            css_theme = MARTOR_ALTERNATIVE_CSS_FILE_THEME
            css["all"] = (css_theme,).__add__(css.get("all"))
        else:
            css_theme = "plugins/css/%s.min.css" % selected_theme
            css["all"] = (css_theme,).__add__(css.get("all"))

        # 2. vendor js theme
        if MARTOR_ALTERNATIVE_JS_FILE_THEME:
            js_theme = MARTOR_ALTERNATIVE_JS_FILE_THEME
            js = (MARTOR_ALTERNATIVE_JS_FILE_THEME,).__add__(js)
        else:
            js_theme = "plugins/js/%s.min.js" % selected_theme
            js = (js_theme,).__add__(js)

        # 3. vendor jQUery
        if MARTOR_ALTERNATIVE_JQUERY_JS_FILE:
            js = (MARTOR_ALTERNATIVE_JQUERY_JS_FILE,).__add__(js)
        elif MARTOR_ENABLE_CONFIGS.get("jquery") == "true":
            js = ("plugins/js/jquery.min.js",).__add__(js)


class AdminMartorWidget(MartorWidget, widgets.AdminTextareaWidget):
    pass
