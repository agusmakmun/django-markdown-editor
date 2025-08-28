import random
import string

from django import forms
from django.contrib.admin import widgets
from django.template.loader import get_template
from django.urls import reverse

from .settings import (
    MARTOR_ALTERNATIVE_CSS_FILE_THEME,
    MARTOR_ALTERNATIVE_JQUERY_JS_FILE,
    MARTOR_ALTERNATIVE_JS_FILE_THEME,
    MARTOR_ENABLE_ADMIN_CSS,
    MARTOR_ENABLE_CONFIGS,
    MARTOR_MARKDOWN_BASE_EMOJI_URL,
    MARTOR_MARKDOWNIFY_TIMEOUT,
    MARTOR_SEARCH_USERS_URL,
    MARTOR_THEME,
    MARTOR_TOOLBAR_BUTTONS,
    MARTOR_UPLOAD_URL,
)


def get_theme():
    """function to get the selected theme"""
    supported_themes = ["bootstrap", "semantic"]
    if MARTOR_THEME in supported_themes:
        return MARTOR_THEME
    return "bootstrap"


class MartorWidget(forms.Textarea):
    def render(self, name, value, attrs=None, renderer=None, **kwargs):
        # Create random string to make field ID unique to prevent duplicated ID
        # when rendering fields with the same field name
        random_string = "".join(random.choice(string.ascii_letters + string.digits) for x in range(10))
        attrs["id"] = attrs["id"] + "-" + random_string

        # Make the settings the default attributes to pass
        attributes_to_pass = {
            "data-enable-configs": MARTOR_ENABLE_CONFIGS,
            "data-markdownfy-url": reverse("martor_markdownfy"),
        }

        if MARTOR_UPLOAD_URL:
            attributes_to_pass["data-upload-url"] = MARTOR_UPLOAD_URL
        if MARTOR_SEARCH_USERS_URL:
            attributes_to_pass["data-search-users-url"] = MARTOR_SEARCH_USERS_URL
        if MARTOR_MARKDOWN_BASE_EMOJI_URL:
            attributes_to_pass["data-base-emoji-url"] = MARTOR_MARKDOWN_BASE_EMOJI_URL
        if MARTOR_MARKDOWNIFY_TIMEOUT:
            attributes_to_pass["data-save-timeout"] = MARTOR_MARKDOWNIFY_TIMEOUT

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
                "field_name": name + "-" + random_string,
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
                "plugins/css/highlight.min.css",
                "martor/css/martor.%s.min.css" % selected_theme,
            )
        }

        if MARTOR_ENABLE_ADMIN_CSS:
            admin_theme = ("martor/css/martor-admin.min.css",)
            css["all"] = admin_theme.__add__(css.get("all"))

        js = (
            "plugins/js/ace.js",
            "plugins/js/mode-markdown.js",
            "plugins/js/ext-language_tools.js",
            "plugins/js/theme-github.js",
            "plugins/js/highlight.min.js",
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
