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


**DracEditor** is Django Markdown Editor built for Dracos Linux *(https://dracos-linux.org)*. Demo video: https://youtu.be/DZCZD7Y8P0Y


Features
------------------------------

* Integrated with `Ace Editor`_
* Integrated with `Semantic-UI`_
* Live Preview
* Upload Image to imgur.com `(via API)`
* Emoji ``:emoji_name:`` + Cheat sheet
* Direct Mention users ``@[username]`` - `(require user to logged in)`
* Highlight ``pre``
* Django Admin support
* Toolbar Buttons


Preview
------------------------------

.. image:: https://raw.githubusercontent.com/agusmakmun/dracos-markdown-editor/master/__screenshot/draceditor-preview.png


Requirements
------------------------------

* ``Django>=1.10.1``
* ``Markdown>=2.6.7``
* ``requests>=2.12.4``


Installation
------------------------------

DracEditor is available directly from `PyPI`_:

1. Installing the package.

::

    $ pip install draceditor


2. Don't forget to add ``'draceditor'`` to your ``'INSTALLED_APPS'`` setting `(without migrations)`.

::

    # settings.py
    INSTALLED_APPS = [
        ....
        'draceditor',
    ]


3. Add url pattern to your ``urls.py.``

::

    # urls.py
    urlpatterns = [
        ...
        url(r'^draceditor/', include('draceditor.urls')),
    ]


4. Collect included some draceditor static files to your ``STATIC_ROOT`` folder.

::

    ./manage.py collectstatic


Setting Configurations ``settings.py``
---------------------------------------

Please register application in https://api.imgur.com/oauth2/addclient
to get ``IMGUR_CLIENT_ID`` and ``IMGUR_API_KEY``.

::

    # Global draceditor settings
    # Input: string boolean, `true/false`
    DRACEDITOR_ENABLE_CONFIGS' = {
        'imgur': 'true',     # to enable/disable imgur uploader.
        'mention': 'false',  # to enable/disable mention
        'jquery': 'true',    # to include/revoke jquery (require for admin default django)
    }

    # Imgur API Keys
    DRACEDITOR_IMGUR_CLIENT_ID = 'your-client-id'
    DRACEDITOR_IMGUR_API_KEY   = 'your-api-key'

    # Safe Mode
    DRACEDITOR_MARKDOWN_SAFE_MODE = True # default

    # Markdownify
    DRACEDITOR_MARKDOWNIFY_FUNCTION = 'draceditor.utils.markdownify' # default
    DRACEDITOR_MARKDOWNIFY_URL = '/draceditor/markdownify/' # default

    # Markdown extensions (default)
    DRACEDITOR_MARKDOWN_EXTENSIONS = [
        'markdown.extensions.extra',
        'markdown.extensions.nl2br',
        'markdown.extensions.smarty',
        'markdown.extensions.fenced_code',

        # Custom markdown extensions.
        'draceditor.extensions.urlize',
        'draceditor.extensions.mention', # require for mention
        'draceditor.extensions.emoji',   # require for emoji
    ]

    # Markdown Extensions Configs
    DRACEDITOR_MARKDOWN_EXTENSION_CONFIGS = {}

    # Markdown urls
    DRACEDITOR_UPLOAD_URL = '/draceditor/uploader/' # default
    DRACEDITOR_SEARCH_USERS_URL = '/draceditor/search-user/' # default

    # Markdown Extensions
    DRACEDITOR_MARKDOWN_BASE_EMOJI_URL = 'https://assets-cdn.github.com/images/icons/emoji/' # default
    DRACEDITOR_MARKDOWN_BASE_MENTION_URL = 'https://forum.dracos-linux.org/profile/' # default (change this)

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


**Template**

Simply safe the markdown content as html ouput with loading the templatetags from ``draceditor/templatetags/dractags.py``.

::

    {% load dractags %}
    {{ field_name|safe_markdown }}

    # example
    {{ post.description|safe_markdown }}


Test Draceditor from this Repository
-------------------------------------

I assume you already setup with virtual enviroment (virtualenv).

::

    $ git clone https://github.com/agusmakmun/dracos-markdown-editor.git
    $ cd dracos-markdown-editor/ && python setup.py install
    $ cd draceditor_demo/
    $ python manage.py makemigrations && python manage.py migrate
    $ python manage.py runserver


And let checkout at http://127.0.0.1:8000/simple-form/ to your browser.


Draceditor Commands Refference
--------------------------------

.. image:: https://raw.githubusercontent.com/agusmakmun/dracos-markdown-editor/master/__screenshot/draceditor-guide.png


Notes
--------------------------------

**DracEditor** was inspired by great `django-markdownx`_, `Python Markdown`_ and `Online reStructuredText editor`_.


.. _Ace Editor: https://ace.c9.io
.. _Semantic-UI: http://semantic-ui.com
.. _PyPI: https://pypi.python.org/pypi/draceditor
.. _django-markdownx: https://github.com/adi-/django-markdownx
.. _Python Markdown: https://github.com/waylan/Python-Markdown
.. _Online reStructuredText editor: http://rst.ninjs.org
