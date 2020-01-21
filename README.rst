martor |pypi version|
------------------------------

.. |pypi version|
   image:: https://img.shields.io/pypi/v/martor.svg
   :target: https://pypi.python.org/pypi/martor

.. image:: https://img.shields.io/badge/license-GNUGPLv3-blue.svg
   :target: https://raw.githubusercontent.com/agusmakmun/django-markdown-editor/master/LICENSE

.. image:: https://img.shields.io/pypi/pyversions/martor.svg
   :target: https://pypi.python.org/pypi/martor

.. image:: https://img.shields.io/badge/Django-1.8%20%3E=%202.2-green.svg
  :target: https://www.djangoproject.com

.. image:: https://travis-ci.org/agusmakmun/django-markdown-editor.svg?branch=master
  :target: https://travis-ci.org/agusmakmun/django-markdown-editor

**Martor** is a Markdown Editor plugin for Django and the new face of **DracEditor**.


Features
------------------------------

* Live Preview
* Integrated with `Ace Editor`_
* Integrated with `Semantic-UI`_
* Supports Multiple Fields (`fixed this issue`_)
* Upload Images to imgur.com `(via API)` and `custom uploader`_.
* Direct Mention users ``@[username]`` - `(requires user to logged in)`
* Supports embed/iframe video from (Youtube, Vimeo, Dailymotion, Yahoo, Veoh, & Metacafe)
* Emoji ``:emoji_name:`` + Cheat sheets
* Martor Commands Reference
* Supports Django Admin
* Toolbar Buttons
* Highlight ``pre``
* Spellchecking (only supports US English at this time)


Preview
------------------------------

.. image:: https://raw.githubusercontent.com/agusmakmun/django-markdown-editor/master/__screenshot/martor-preview-editor.png

.. image:: https://raw.githubusercontent.com/agusmakmun/django-markdown-editor/master/__screenshot/martor-preview-result.png


Requirements
------------------------------

* ``Django>=2.0``
* ``Markdown>=3.0``
* ``requests>=2.12.4``


Installation
------------------------------

Martor is available directly from `PyPI`_:

1. Installing the package.

::

    $ pip install martor


2. Don't forget to add ``'martor'`` to your ``'INSTALLED_APPS'`` setting `(without migrations)`.

::

    # settings.py
    INSTALLED_APPS = [
        ....
        'martor',
    ]


3. Add url pattern to your ``urls.py.``

::

    # urls.py
    # django >= 2.0
    urlpatterns = [
        ...
        path('martor/', include('martor.urls')),
    ]

    # django <= 1.9
    urlpatterns = [
        ...
        url(r'^martor/', include('martor.urls')),
    ]


4. Collect martor's static files in your ``STATIC_ROOT`` folder.

::

    ./manage.py collectstatic


Setting Configurations ``settings.py``
---------------------------------------

Please register your application at https://api.imgur.com/oauth2/addclient
to get ``IMGUR_CLIENT_ID`` and ``IMGUR_API_KEY``.

::

    # Global martor settings
    # Input: string boolean, `true/false`
    MARTOR_ENABLE_CONFIGS = {
        'emoji': 'true',       # to enable/disable emoji icons.
        'imgur': 'true',       # to enable/disable imgur/custom uploader.
        'mention': 'false',    # to enable/disable mention
        'jquery': 'true',      # to include/revoke jquery (require for admin default django)
        'living': 'false',     # to enable/disable live updates in preview
        'spellcheck': 'true',  # to enable/disable spellcheck in form textareas
        'hljs': 'true',        # to enable/disable hljs highlighting in preview
    }

    # To setup the martor editor with label or not (default is False)
    MARTOR_ENABLE_LABEL = False

    # Imgur API Keys
    MARTOR_IMGUR_CLIENT_ID = 'your-client-id'
    MARTOR_IMGUR_API_KEY   = 'your-api-key'

    # Safe Mode
    MARTOR_MARKDOWN_SAFE_MODE = True # default

    # Markdownify
    MARTOR_MARKDOWNIFY_FUNCTION = 'martor.utils.markdownify' # default
    MARTOR_MARKDOWNIFY_URL = '/martor/markdownify/' # default

    # Markdown extensions (default)
    MARTOR_MARKDOWN_EXTENSIONS = [
        'markdown.extensions.extra',
        'markdown.extensions.nl2br',
        'markdown.extensions.smarty',
        'markdown.extensions.fenced_code',

        # Custom markdown extensions.
        'martor.extensions.urlize',
        'martor.extensions.del_ins',    # ~~strikethrough~~ and ++underscores++
        'martor.extensions.mention',    # to parse markdown mention
        'martor.extensions.emoji',      # to parse markdown emoji
        'martor.extensions.mdx_video',  # to parse embed/iframe video
    ]

    # Markdown Extensions Configs
    MARTOR_MARKDOWN_EXTENSION_CONFIGS = {}

    # Markdown urls
    MARTOR_UPLOAD_URL = '/martor/uploader/' # default
    MARTOR_SEARCH_USERS_URL = '/martor/search-user/' # default

    # Markdown Extensions
    # MARTOR_MARKDOWN_BASE_EMOJI_URL = 'https://www.webfx.com/tools/emoji-cheat-sheet/graphics/emojis/'     # from webfx
    MARTOR_MARKDOWN_BASE_EMOJI_URL = 'https://github.githubassets.com/images/icons/emoji/'                  # default from github
    MARTOR_MARKDOWN_BASE_MENTION_URL = 'https://python.web.id/author/'                                      # please change this to your domain

Check this setting is not set else csrf will not be sent over ajax calls:

::

    CSRF_COOKIE_HTTPONLY = False


Usage
------------------------------

**Model**

::

    from django.db import models
    from martor.models import MartorField

    class Post(models.Model):
        description = MartorField()


**Form**

::

    from django import forms
    from martor.fields import MartorFormField

    class PostForm(forms.Form):
        description = MartorFormField()


**Admin**

::

    from django.db import models
    from django.contrib import admin

    from martor.widgets import AdminMartorWidget

    from yourapp.models import YourModel

    class YourModelAdmin(admin.ModelAdmin):
        formfield_overrides = {
            models.TextField: {'widget': AdminMartorWidget},
        }

    admin.site.register(YourModel, YourModelAdmin)


**Template**

Simply safely parse markdown content as html ouput by loading templatetags from ``martor/templatetags/martortags.py``.

::

    {% load martortags %}
    {{ field_name|safe_markdown }}

    # example
    {{ post.description|safe_markdown }}


Custom Uploader
-----------------

If you want to save the images uploaded to your storage,
**Martor** also provides a way to handle this. Please checkout this `WIKI`_.

Test Martor from this Repository
-------------------------------------

Assuming you are already setup with a virtual enviroment (virtualenv):

::

    $ git clone https://github.com/agusmakmun/django-markdown-editor.git
    $ cd django-markdown-editor/ && python setup.py install
    $ cd martor_demo/
    $ python manage.py makemigrations && python manage.py migrate
    $ python manage.py runserver


Checkout at http://127.0.0.1:8000/simple-form/ on your browser.


Martor Commands Reference
--------------------------------

.. image:: https://raw.githubusercontent.com/agusmakmun/django-markdown-editor/master/__screenshot/martor-guide.png


Notes
--------------------------------

**Martor** was inspired by these great projects: `django-markdownx`_, `Python Markdown`_ and `Online reStructuredText editor`_.


.. _Ace Editor: https://ace.c9.io
.. _Semantic-UI: http://semantic-ui.com
.. _PyPI: https://pypi.python.org/pypi/martor
.. _django-markdownx: https://github.com/adi-/django-markdownx
.. _Python Markdown: https://github.com/waylan/Python-Markdown
.. _Online reStructuredText editor: http://rst.ninjs.org
.. _WIKI: https://github.com/agusmakmun/django-markdown-editor/wiki
.. _fixed this issue: https://github.com/agusmakmun/django-markdown-editor/issues/3
.. _custom uploader: https://github.com/agusmakmun/django-markdown-editor/wiki
