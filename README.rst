draceditor |pypi version|
------------------------------

.. |pypi version|
   image:: https://img.shields.io/pypi/v/draceditor.svg?style=flat-square
   :target: https://pypi.python.org/pypi/draceditor

.. image:: https://img.shields.io/badge/license-GNUGPLv3-blue.svg?style=flat-square
   :target: https://raw.githubusercontent.com/agusmakmun/draceditor/master/LICENSE

.. image:: https://img.shields.io/pypi/pyversions/draceditor.svg?style=flat-square
   :target: https://pypi.python.org/pypi/draceditor

.. image:: https://img.shields.io/badge/Django-1.8,%201.9,%201.10-green.svg?style=flat-square
  :target: https://www.djangoproject.com

.. image:: https://img.shields.io/pypi/dm/draceditor.svg?style=flat-square
   :target: https://pypi.python.org/pypi/draceditor


**DracEditor** is Django Markdown Editor build for Dracos Linux https://dracos-linux.org *(Under Development Mode)*


Features
------------------------------

* Integrated with `Ace Editor`_
* Integrated with `Semantic-UI`_
* Live Preview
* Upload Image to imgur.com `(via API)`
* Emoji ``:emoji_name:``
* Direct Mention users `(not yet)` - ``@[username]``
* Highlight ``pre``
* Django Admin support
* Toolbar Buttons


Preview
------------------------------

.. image:: https://raw.githubusercontent.com/agusmakmun/dracos-markdown-editor/master/__screenshot/draceditor-preview.png


Installation
------------------------------

DracEditor is available directly from `PyPI`_:

::

    $ pip install draceditor


***).** And don't forget to add ``'draceditor'`` to your ``'INSTALLED_APPS'`` setting `(without migrations)`.


Requirements
------------------------------

* ``Django>=1.10.1``
* ``Markdown>=2.6.7``
* ``requests>=2.12.4``


Configurations
------------------------------

::

    # Imgur API Keys
    DRACEDITOR_IMGUR_CLIENT_ID = 'your-client-id'
    DRACEDITOR_IMGUR_API_KEY   = 'your-api-key'

    # Safe Mode
    DRACEDITOR_MARKDOWN_SAFE_MODE = True # default

    # Markdownify
    DRACEDITOR_MARKDOWNIFY_FUNCTION = 'draceditor.utils.markdownify' # default

    # Markdown extensions (default)
    DRACEDITOR_MARKDOWN_EXTENSIONS = [
        'markdown.extensions.extra',
        'markdown.extensions.nl2br',
        'markdown.extensions.smarty',
        'markdown.extensions.fenced_code',

        # Custom markdown extensions.
        'draceditor.utils.extensions.urlize',
        'draceditor.utils.extensions.mention', # require for mention
        'draceditor.utils.extensions.emoji',   # require for emoji
    ]

    # Markdown Extensions Configs
    DRACEDITOR_MARKDOWN_EXTENSION_CONFIGS = {}

    # Markdown urls
    DRACEDITOR_UPLOAD_URLS_PATH = '/draceditor/uploader/' # default
    DRACEDITOR_SEARCH_USERS_URLS_PATH = '/draceditor/search-user/' # default

    # Markdown Extensions
    DRACEDITOR_MARKDOWN_BASE_EMOJI_URL = 'https://assets-cdn.github.com/images/icons/emoji/' # default
    DRACEDITOR_MARKDOWN_BASE_MENTION_URL = 'https://forum.dracos-linux.org/profile/' # default (change this)

    # Editor Options (please use default for now)
    DRACEDITOR_EDITOR_OPTIONS = {
        'markdown': 'true',
        'toolbar': [
            'bold', 'italic', 'strike',
            'link', 'image', 'blockquote',
            'listUl', 'listOl', 'upload',
        ]
    }

Usage
------------------------------

**Model**

::

    from django.db import models
    from draceditor.models import DraceditorField

    class Post(models.Model):
        description = DraceditorField()


**Form**

::

    from django import forms
    from draceditor.fields import DraceditorFormField

    class PostForm(forms.Form):
        description = DraceditorFormField()


**Admin**

::

    from django.db import models
    from django.contrib import admin

    from draceditor.widgets import AdminDraceditorWidget

    from yourapp.models import YourModel

    class YourModelAdmin(admin.ModelAdmin):
        formfield_overrides = {
            models.TextField: {'widget': AdminDraceditorWidget},
        }

    admin.site.register(YourModel, YourModelAdmin)


Draceditor Commands Refference
--------------------------------

.. image:: https://raw.githubusercontent.com/agusmakmun/dracos-markdown-editor/master/__screenshot/draceditor-guide.png


.. _Ace Editor: https://ace.c9.io
.. _Semantic-UI: http://semantic-ui.com
.. _PyPI: https://pypi.python.org/pypi/draceditor
