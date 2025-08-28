Martor - Django Markdown Editor
===============================

.. image:: https://img.shields.io/pypi/v/martor.svg
   :target: https://pypi.python.org/pypi/martor
   :alt: PyPI Version

.. image:: https://img.shields.io/badge/license-GNUGPLv3-blue.svg
   :target: https://raw.githubusercontent.com/agusmakmun/django-markdown-editor/master/LICENSE
   :alt: License

.. image:: https://img.shields.io/pypi/pyversions/martor.svg
   :target: https://pypi.python.org/pypi/martor
   :alt: Python Version

.. image:: https://img.shields.io/badge/Django-3.2%20%3E=%204.2-green.svg
   :target: https://www.djangoproject.com
   :alt: Django Version

.. image:: https://img.shields.io/github/actions/workflow/status/agusmakmun/django-markdown-editor/run-tests.yml?branch=master
   :target: https://github.com/agusmakmun/django-markdown-editor/actions/workflows/run-tests.yml
   :alt: Build Status

**Martor** is a comprehensive Markdown Editor plugin for Django, designed to provide a powerful and user-friendly markdown editing experience with support for both **Bootstrap** and **Semantic-UI** frameworks.

Features
--------

* 📝 **Live Preview** - Real-time markdown rendering
* ⚡ **Ace Editor Integration** - Powerful code editor with syntax highlighting
* 🎨 **Dual Theme Support** - Bootstrap and Semantic-UI compatible
* 📤 **Image Upload** - Direct upload to imgur.com or custom endpoints
* 👥 **User Mentions** - Direct mention users with ``@[username]`` syntax
* 🎬 **Video Embedding** - Embed videos from YouTube, Vimeo, and more
* ✅ **Spellcheck** - Built-in spell checking (US English)
* 😀 **Emoji Support** - Full emoji support with cheat sheets
* 🔧 **Django Admin Integration** - Seamless admin interface integration
* 🛡️ **Security Features** - XSS protection and HTML sanitization
* 🔗 **Custom ID Support** - Add custom IDs to text elements
* 🧩 **Extensible** - Custom markdown extensions support

Quick Start
-----------

Installation::

    pip install martor

Add to your Django settings::

    INSTALLED_APPS = [
        ...
        'martor',
    ]

Include Martor URLs::

    urlpatterns = [
        ...
        path('martor/', include('martor.urls')),
    ]

Collect static files::

    python manage.py collectstatic

Usage in your models::

    from martor.models import MartorField

    class Post(models.Model):
        content = MartorField()

That's it! You now have a powerful markdown editor in your Django application.

Documentation Contents
----------------------

.. toctree::
   :maxdepth: 2
   :caption: Getting Started

   installation
   quickstart
   settings

.. toctree::
   :maxdepth: 2
   :caption: User Guide

   usage/models
   usage/forms
   usage/widgets
   usage/admin
   usage/templates

.. toctree::
   :maxdepth: 2
   :caption: Advanced Topics

   extensions/index
   customization
   themes
   security

.. toctree::
   :maxdepth: 2
   :caption: API Reference

   api/fields
   api/widgets
   api/models
   api/settings
   api/utils

.. toctree::
   :maxdepth: 2
   :caption: Examples & Tutorials

   examples/basic
   examples/custom-uploader
   examples/mentions
   examples/extensions

.. toctree::
   :maxdepth: 1
   :caption: Help & Support

   troubleshooting
   faq
   changelog
   contributing

Screenshots
-----------

Martor Editor Interface:

.. image:: https://raw.githubusercontent.com/agusmakmun/django-markdown-editor/master/.etc/images/bootstrap/martor-editor.png
   :alt: Martor Editor
   :align: center

Live Preview:

.. image:: https://raw.githubusercontent.com/agusmakmun/django-markdown-editor/master/.etc/images/bootstrap/martor-preview.png
   :alt: Martor Preview
   :align: center

Community & Support
-------------------

* **GitHub**: https://github.com/agusmakmun/django-markdown-editor
* **PyPI**: https://pypi.org/project/martor/
* **Issues**: https://github.com/agusmakmun/django-markdown-editor/issues
* **Wiki**: https://github.com/agusmakmun/django-markdown-editor/wiki

License
-------

Martor is released under the `GNU General Public License v3.0 <https://github.com/agusmakmun/django-markdown-editor/blob/master/LICENSE>`_.

Indices and Tables
==================

* :ref:`genindex`
* :ref:`modindex`
* :ref:`search`
