Frequently Asked Questions
===========================

This page answers common questions about Martor. If you don't find your answer here, check the :doc:`troubleshooting` guide or create an issue on GitHub.

General Questions
-----------------

What is Martor?
~~~~~~~~~~~~~~~

Martor is a Django application that provides a rich markdown editor for web applications. It integrates seamlessly with Django models, forms, and admin interface, offering features like live preview, syntax highlighting, image upload, user mentions, and emoji support.

Why choose Martor over other markdown editors?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Martor offers several advantages:

* **Deep Django integration** - Works seamlessly with models, forms, and admin
* **Dual theme support** - Bootstrap and Semantic-UI compatible
* **Security-focused** - Built-in XSS protection and HTML sanitization
* **Feature-rich** - Image upload, mentions, emoji, video embedding
* **Extensible** - Custom markdown extensions and easy customization
* **Production-ready** - Used in many production applications

Is Martor free to use?
~~~~~~~~~~~~~~~~~~~~~~~

Yes! Martor is released under the GNU General Public License v3.0 (GPL-3.0), making it free to use in both personal and commercial projects, provided you comply with the license terms.

Installation & Setup
--------------------

What are the minimum requirements?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

* **Python**: 3.9+
* **Django**: 3.2+
* **Markdown**: 3.0+
* **Modern browser** with JavaScript support

Can I use Martor with older Django versions?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Martor officially supports Django 3.2+. While it might work with older versions, we recommend upgrading Django for security and feature benefits.

Do I need to run migrations after installing Martor?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

No! Martor doesn't include any database models, so no migrations are required. Simply add ``'martor'`` to ``INSTALLED_APPS`` and include the URLs.

Can I use Martor without collecting static files?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

No, you must run ``python manage.py collectstatic`` to make Martor's CSS, JavaScript, and other assets available to your application.

Configuration
-------------

What's the difference between Bootstrap and Semantic UI themes?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Both themes provide the same functionality but with different styling:

* **Bootstrap theme**: Uses Bootstrap CSS classes and styling
* **Semantic UI theme**: Uses Semantic UI CSS classes and styling

Choose based on your existing frontend framework. The theme affects only appearance, not functionality.

Can I use both themes in the same project?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

No, you can only use one theme at a time. The ``MARTOR_THEME`` setting applies globally to all Martor instances in your project.

How do I disable specific toolbar buttons?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Customize the ``MARTOR_TOOLBAR_BUTTONS`` setting:

.. code-block:: python

    # Remove buttons you don't want
    MARTOR_TOOLBAR_BUTTONS = [
        'bold', 'italic', 'heading', 'link',
        # Removed: 'image-upload', 'emoji', 'direct-mention'
    ]

Why do I need to set CSRF_COOKIE_HTTPONLY = False?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Martor uses AJAX requests for live preview and image upload. Setting ``CSRF_COOKIE_HTTPONLY = False`` allows JavaScript to access the CSRF token for secure AJAX requests.

Usage Questions
---------------

Can I use multiple Martor fields in the same model?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Yes! You can use as many ``MartorField`` instances as needed:

.. code-block:: python

    class Product(models.Model):
        description = MartorField(verbose_name="Product Description")
        specifications = MartorField(verbose_name="Technical Specs")
        instructions = MartorField(verbose_name="Usage Instructions")

How do I convert existing TextField to MartorField?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Since ``MartorField`` inherits from ``TextField``, no data migration is needed:

.. code-block:: python

    # Before
    class Article(models.Model):
        content = models.TextField()

    # After - existing data is preserved
    class Article(models.Model):
        content = MartorField()

Can I use Martor with Django REST Framework?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Yes! ``MartorField`` works with DRF serializers:

.. code-block:: python

    from rest_framework import serializers

    class ArticleSerializer(serializers.ModelSerializer):
        class Meta:
            model = Article
            fields = ['title', 'content']  # MartorField works normally

How do I render markdown content in templates?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Use the ``safe_markdown`` template filter:

.. code-block:: html

    {% load martortags %}
    {{ article.content|safe_markdown }}

Can I search within markdown content?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Yes, you can use Django's standard text search on ``MartorField``:

.. code-block:: python

    # Simple search
    articles = Article.objects.filter(content__icontains='django')

    # Full-text search (PostgreSQL)
    from django.contrib.postgres.search import SearchVector
    articles = Article.objects.annotate(
        search=SearchVector('title', 'content')
    ).filter(search='django tutorial')

Features & Functionality
------------------------

How do I set up image upload?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

You have two options:

1. **Use imgur.com** (easiest):

.. code-block:: python

    # settings.py
    MARTOR_IMGUR_CLIENT_ID = 'your-client-id'
    MARTOR_IMGUR_API_KEY = 'your-api-key'

2. **Custom uploader** (recommended for production):

See :doc:`examples/custom-uploader` for implementation details.

How do user mentions work?
~~~~~~~~~~~~~~~~~~~~~~~~~~

Enable mentions in settings and implement a user search endpoint:

.. code-block:: python

    # settings.py
    MARTOR_ENABLE_CONFIGS = {'mention': 'true'}
    MARTOR_SEARCH_USERS_URL = '/my-user-search/'

Users can then type ``@[username]`` to mention others.

Can I disable the live preview?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Yes, set ``living`` to ``false``:

.. code-block:: python

    # settings.py
    MARTOR_ENABLE_CONFIGS = {'living': 'false'}

How do I add custom markdown extensions?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Add them to ``MARTOR_MARKDOWN_EXTENSIONS``:

.. code-block:: python

    # settings.py
    MARTOR_MARKDOWN_EXTENSIONS = [
        # ... default extensions
        'my_app.markdown_extensions.custom_extension',
    ]

What video platforms are supported for embedding?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Martor supports embedding from:

* YouTube
* Vimeo
* Dailymotion
* Yahoo Video
* Veoh
* Metacafe

Simply paste the video URL in the editor.

Performance & Scaling
---------------------

Is Martor suitable for high-traffic websites?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Yes! Martor is used in production by many high-traffic sites. For optimal performance:

* Cache rendered HTML using Django's cache framework
* Disable live preview for better performance
* Use a CDN for static assets
* Consider database indexing for content search

How do I optimize performance with large content?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

1. **Disable real-time features**:

.. code-block:: python

    MARTOR_ENABLE_CONFIGS = {
        'living': 'false',
        'spellcheck': 'false',
    }

2. **Cache rendered content**:

.. code-block:: python

    from django.core.cache import cache
    from martor.utils import markdownify

    def get_cached_html(markdown_content, cache_key):
        html = cache.get(cache_key)
        if html is None:
            html = markdownify(markdown_content)
            cache.set(cache_key, html, 3600)  # 1 hour
        return html

3. **Use database indexing**:

.. code-block:: python

    class Article(models.Model):
        content = MartorField(db_index=True)

Can I use Martor with multiple databases?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Yes, ``MartorField`` works with Django's multiple database support just like any other field.

Security
--------

Is Martor secure against XSS attacks?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Yes! Martor includes built-in security features:

* **HTML sanitization** using the bleach library
* **Whitelist approach** for allowed HTML tags and attributes
* **Safe rendering** through the ``safe_markdown`` filter

The default configuration only allows safe HTML elements.

Can users inject malicious content?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Martor's security features prevent most attacks:

* Script tags are stripped by default
* Only whitelisted HTML tags are allowed
* URLs are validated against allowed schemes
* The ``escape_html`` extension handles edge cases

However, always validate user input and consider your specific security requirements.

How do I further restrict allowed content?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Customize the security settings:

.. code-block:: python

    # settings.py
    ALLOWED_HTML_TAGS = ['p', 'strong', 'em', 'a', 'ul', 'ol', 'li']
    ALLOWED_HTML_ATTRIBUTES = ['href', 'title']
    ALLOWED_URL_SCHEMES = ['http', 'https', 'mailto']

Customization
-------------

Can I customize the editor's appearance?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Yes! You can:

1. **Override CSS**:

.. code-block:: css

    .martor-field {
        border-radius: 10px;
        /* Your custom styles */
    }

2. **Use custom theme files**:

.. code-block:: python

    # settings.py
    MARTOR_ALTERNATIVE_CSS_FILE_THEME = 'custom/my-theme.css'
    MARTOR_ALTERNATIVE_JS_FILE_THEME = 'custom/my-theme.js'

3. **Override templates**:

Create your own templates in ``templates/martor/bootstrap/`` or ``templates/martor/semantic/``.

How do I add custom toolbar buttons?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

This requires custom JavaScript development. You can:

1. Create a custom widget with additional buttons
2. Extend Martor's JavaScript files
3. Add custom ACE editor commands

Can I use a different code editor instead of ACE?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Martor is built specifically around the ACE editor. Switching to a different editor would require significant modification of the codebase.

Can I integrate with my existing CSS framework?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Yes! While Martor officially supports Bootstrap and Semantic UI, you can:

1. Use custom CSS to override styling
2. Create custom theme files
3. Override templates to match your HTML structure

Migration & Upgrading
--------------------

How do I migrate from django-markdownx?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

1. **Install Martor** alongside django-markdownx
2. **Update models** one by one:

.. code-block:: python

    # Before
    from markdownx.models import MarkdownxField
    content = MarkdownxField()

    # After
    from martor.models import MartorField
    content = MartorField()

3. **Update templates**:

.. code-block:: html

    <!-- Before -->
    {{ content|markdownify }}

    <!-- After -->
    {% load martortags %}
    {{ content|safe_markdown }}

4. **Test thoroughly** before removing django-markdownx

How do I upgrade Martor versions?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

1. **Check the changelog** for breaking changes
2. **Update the package**:

.. code-block:: bash

    pip install -U martor

3. **Collect static files**:

.. code-block:: bash

    python manage.py collectstatic

4. **Test your application** thoroughly

What happens to existing data when upgrading?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Your markdown content is preserved during upgrades. However:

* Check for changes in markdown rendering
* Test custom extensions compatibility
* Verify security settings are still appropriate

Development & Debugging
-----------------------

How do I debug Martor issues?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

1. **Enable Django debug mode**:

.. code-block:: python

    DEBUG = True

2. **Check browser console** for JavaScript errors
3. **Test individual endpoints** (e.g., ``/martor/markdownify/``)
4. **Check server logs** for Python errors

Can I contribute to Martor development?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Absolutely! Martor welcomes contributions:

1. **Report bugs** on GitHub Issues
2. **Submit pull requests** for fixes or features
3. **Improve documentation**
4. **Share your use cases** and feedback

How do I create custom markdown extensions?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Create a Python module following Python-Markdown's extension API:

.. code-block:: python

    from markdown.extensions import Extension
    from markdown.preprocessors import Preprocessor

    class MyExtension(Extension):
        def extendMarkdown(self, md):
            md.preprocessors.register(
                MyPreprocessor(md), 'my_preprocessor', 175
            )

    def makeExtension(**kwargs):
        return MyExtension(**kwargs)

Getting Help
------------

Where can I get help with Martor?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

1. **Documentation**: Start with this documentation
2. **GitHub Issues**: Search existing issues or create new ones
3. **Django Community**: Ask in Django forums or Slack channels
4. **Stack Overflow**: Tag questions with ``django-martor``

How do I report bugs?
~~~~~~~~~~~~~~~~~~~~

When reporting bugs, include:

* Django and Martor versions
* Browser and version
* Complete error messages
* Minimal code to reproduce the issue
* Steps to reproduce the problem

What information should I include in bug reports?
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Essential information:**

* **Environment**: Python, Django, Martor versions
* **Browser**: Name and version
* **Error messages**: Complete tracebacks
* **Code**: Minimal example that reproduces the issue
* **Configuration**: Relevant settings
* **Steps**: Exact steps to reproduce the problem

**Template:**

.. code-block:: text

    ## Environment
    - Django: 4.2.0
    - Martor: 1.7.16
    - Python: 3.9.0
    - Browser: Chrome 91.0

    ## Problem Description
    [Clear description of the issue]

    ## Steps to Reproduce
    1. [First step]
    2. [Second step]
    3. [Result]

    ## Expected Behavior
    [What should happen]

    ## Actual Behavior
    [What actually happens]

    ## Code
    [Minimal code example]

Still have questions?
~~~~~~~~~~~~~~~~~~~~

If your question isn't answered here:

1. Check the :doc:`troubleshooting` guide
2. Search `GitHub Issues <https://github.com/agusmakmun/django-markdown-editor/issues>`_
3. Create a new issue with detailed information

Next Steps
----------

* :doc:`troubleshooting` - Solve common problems
* :doc:`examples/basic` - See complete examples
* :doc:`installation` - Get started with Martor
