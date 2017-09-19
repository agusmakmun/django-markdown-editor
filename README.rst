martor |pypi version|
------------------------------

.. |pypi version|
   image:: https://img.shields.io/pypi/v/martor.svg?style=flat-square
   :target: https://pypi.python.org/pypi/martor

.. image:: https://img.shields.io/badge/license-GNUGPLv3-blue.svg?style=flat-square
   :target: https://raw.githubusercontent.com/agusmakmun/django-markdown-editor/master/LICENSE

.. image:: https://img.shields.io/pypi/pyversions/martor.svg?style=flat-square
   :target: https://pypi.python.org/pypi/martor

.. image:: https://img.shields.io/badge/Django-1.8,%201.9,%201.10,%201.11-green.svg?style=flat-square
  :target: https://www.djangoproject.com


**Martor** is Markdown Editor plugin for Django and new face of **DracEditor**.


Features
------------------------------

* Live Preview
* Integrated with `Ace Editor`_
* Integrated with `Semantic-UI`_
* Support Multiple Fields (`fixed this issue`_)
* Upload Image to imgur.com `(via API)` and `custom uploader`_.
* Direct Mention users ``@[username]`` - `(require user to logged in)`
* Emoji ``:emoji_name:`` + Cheat sheets
* Martor Commands Refference
* Support Django Admin
* Highlight ``pre``
* Toolbar Buttons


Preview
------------------------------

.. image:: https://raw.githubusercontent.com/agusmakmun/django-markdown-editor/master/__screenshot/martor-preview-editor.png

.. image:: https://raw.githubusercontent.com/agusmakmun/django-markdown-editor/master/__screenshot/martor-preview-result.png


Requirements
------------------------------

* ``Django>=1.10.1``
* ``Markdown>=2.6.7``
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
    urlpatterns = [
        ...
        url(r'^martor/', include('martor.urls')),
    ]


4. Collect included some martor static files to your ``STATIC_ROOT`` folder.

::

    ./manage.py collectstatic


Setting Configurations ``settings.py``
---------------------------------------

Please register application in https://api.imgur.com/oauth2/addclient
to get ``IMGUR_CLIENT_ID`` and ``IMGUR_API_KEY``.

::

    # Global martor settings
    # Input: string boolean, `true/false`
    MARTOR_ENABLE_CONFIGS' = {
        'imgur': 'true',     # to enable/disable imgur/custom uploader.
        'mention': 'false',  # to enable/disable mention
        'jquery': 'true',    # to include/revoke jquery (require for admin default django)
    }

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
        'martor.extensions.del_ins', # ~~strikethrough~~ and ++underscores++
        'martor.extensions.mention', # require for mention
        'martor.extensions.emoji',   # require for emoji
    ]

    # Markdown Extensions Configs
    MARTOR_MARKDOWN_EXTENSION_CONFIGS = {}

    # Markdown urls
    MARTOR_UPLOAD_URL = '/martor/uploader/' # default
    MARTOR_SEARCH_USERS_URL = '/martor/search-user/' # default

    # Markdown Extensions
    MARTOR_MARKDOWN_BASE_EMOJI_URL = 'https://assets-cdn.github.com/images/icons/emoji/' # default
    MARTOR_MARKDOWN_BASE_MENTION_URL = 'https://python.web.id/profile/' # default (change this)

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

Simply safe the markdown content as html ouput with loading the templatetags from ``martor/templatetags/martortags.py``.

::

    {% load martortags %}
    {{ field_name|safe_markdown }}

    # example
    {{ post.description|safe_markdown }}


Custom Uploader
-----------------

If you want to save the images uploaded to your storage,
**Martor** also provide to handle it. Please checkout this `WIKI`_.

Test the Martor from this Repository
-------------------------------------

I assume you already setup with virtual enviroment (virtualenv).

::

    $ git clone https://github.com/agusmakmun/django-markdown-editor.git
    $ cd django-markdown-editor/ && python setup.py install
    $ cd martor_demo/
    $ python manage.py makemigrations && python manage.py migrate
    $ python manage.py runserver


And let checkout at http://127.0.0.1:8000/simple-form/ to your browser.


Martor Commands Refference
--------------------------------

.. image:: https://raw.githubusercontent.com/agusmakmun/django-markdown-editor/master/__screenshot/martor-guide.png


Notes
--------------------------------

**Martor** was inspired by great `django-markdownx`_, `Python Markdown`_ and `Online reStructuredText editor`_.


.. _Ace Editor: https://ace.c9.io
.. _Semantic-UI: http://semantic-ui.com
.. _PyPI: https://pypi.python.org/pypi/martor
.. _django-markdownx: https://github.com/adi-/django-markdownx
.. _Python Markdown: https://github.com/waylan/Python-Markdown
.. _Online reStructuredText editor: http://rst.ninjs.org
.. _WIKI: https://github.com/agusmakmun/django-markdown-editor/wiki
.. _fixed this issue: https://github.com/agusmakmun/django-markdown-editor/issues/3
.. _custom uploader: https://github.com/agusmakmun/django-markdown-editor/wiki
