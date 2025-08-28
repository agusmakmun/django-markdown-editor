Installation
============

This guide walks you through installing and setting up Martor in your Django project.

Requirements
------------

Martor requires the following:

* **Python**: 3.9+ 
* **Django**: 3.2+
* **Markdown**: 3.0+
* **Additional Dependencies**:
  
  * ``requests`` >= 2.12.4
  * ``bleach`` (for HTML sanitization)
  * ``urllib3``
  * ``zipp``
  * ``tzdata``

Installing Martor
------------------

1. Install via pip
~~~~~~~~~~~~~~~~~~

The easiest way to install Martor is through pip:

.. code-block:: bash

    pip install martor

2. Install from source
~~~~~~~~~~~~~~~~~~~~~~

For the latest development version:

.. code-block:: bash

    git clone https://github.com/agusmakmun/django-markdown-editor.git
    cd django-markdown-editor
    pip install -e .

Django Configuration
---------------------

1. Add to INSTALLED_APPS
~~~~~~~~~~~~~~~~~~~~~~~~~

Add ``'martor'`` to your ``INSTALLED_APPS`` in settings.py:

.. code-block:: python

    # settings.py
    INSTALLED_APPS = [
        'django.contrib.admin',
        'django.contrib.auth',
        'django.contrib.contenttypes',
        'django.contrib.sessions',
        'django.contrib.messages',
        'django.contrib.staticfiles',
        
        # Your apps
        'your_app',
        
        # Third party apps
        'martor',  # Add this line
    ]

.. note::
    Martor doesn't require database migrations, so you don't need to run ``makemigrations`` or ``migrate`` after adding it.

2. Configure URLs
~~~~~~~~~~~~~~~~~

Add Martor URLs to your main ``urls.py``:

.. code-block:: python

    # urls.py
    from django.contrib import admin
    from django.urls import path, include

    urlpatterns = [
        path('admin/', admin.site.urls),
        path('martor/', include('martor.urls')),  # Add this line
        # ... your other URL patterns
    ]

The Martor URLs provide essential endpoints for:

* ``/martor/markdownify/`` - Live preview conversion
* ``/martor/uploader/`` - Image upload handling
* ``/martor/search-user/`` - User mention search

3. Collect Static Files
~~~~~~~~~~~~~~~~~~~~~~~

Martor includes CSS and JavaScript files that need to be collected:

.. code-block:: bash

    python manage.py collectstatic

This will copy Martor's static files to your ``STATIC_ROOT`` directory.

Essential Settings
------------------

While Martor works with default settings, you'll want to configure a few key options:

.. code-block:: python

    # settings.py
    
    # Choose your preferred theme: "bootstrap" or "semantic"
    MARTOR_THEME = 'bootstrap'  # Default
    
    # CSRF token configuration (required for AJAX uploads)
    CSRF_COOKIE_HTTPONLY = False
    
    # Optional: Configure imgur for image uploads
    MARTOR_IMGUR_CLIENT_ID = 'your-imgur-client-id'
    MARTOR_IMGUR_API_KEY = 'your-imgur-api-key'

.. warning::
    Setting ``CSRF_COOKIE_HTTPONLY = False`` is required for Martor's AJAX functionality to work properly. This allows the CSRF token to be accessible via JavaScript for secure AJAX requests.

Imgur Configuration (Optional)
-------------------------------

For image uploads to work with imgur.com:

1. **Register your application** at https://api.imgur.com/oauth2/addclient
2. **Get your credentials** from the imgur developer portal
3. **Add them to your settings**:

.. code-block:: python

    # settings.py
    MARTOR_IMGUR_CLIENT_ID = 'your-client-id-here'
    MARTOR_IMGUR_API_KEY = 'your-api-key-here'

Alternatively, you can set up a :doc:`custom uploader <examples/custom-uploader>` to handle image uploads to your own storage backend.

Verification
------------

To verify your installation is working:

1. **Start your development server**:

.. code-block:: bash

    python manage.py runserver

2. **Create a simple test view** (optional):

.. code-block:: python

    # views.py
    from django.shortcuts import render
    from django import forms
    from martor.fields import MartorFormField

    class TestForm(forms.Form):
        content = MartorFormField()

    def test_martor(request):
        form = TestForm()
        return render(request, 'test_martor.html', {'form': form})

3. **Create a test template**:

.. code-block:: html

    <!-- test_martor.html -->
    <!DOCTYPE html>
    <html>
    <head>
        <title>Martor Test</title>
        {% load static %}
        <link href="{% static 'plugins/css/ace.min.css' %}" rel="stylesheet" />
        <link href="{% static 'martor/css/martor.bootstrap.min.css' %}" rel="stylesheet" />
    </head>
    <body>
        <div class="container">
            <h1>Martor Test</h1>
            <form method="post">
                {% csrf_token %}
                {{ form.as_p }}
                <button type="submit">Submit</button>
            </form>
        </div>
        
        <script src="{% static 'plugins/js/ace.js' %}"></script>
        <script src="{% static 'plugins/js/mode-markdown.js' %}"></script>
        <script src="{% static 'plugins/js/ext-language_tools.js' %}"></script>
        <script src="{% static 'plugins/js/theme-github.js' %}"></script>
        <script src="{% static 'plugins/js/highlight.min.js' %}"></script>
        <script src="{% static 'plugins/js/emojis.min.js' %}"></script>
        <script src="{% static 'martor/js/martor.bootstrap.min.js' %}"></script>
    </body>
    </html>

Troubleshooting Installation
----------------------------

**Static files not loading?**
    Make sure you've run ``collectstatic`` and your ``STATIC_URL`` and ``STATIC_ROOT`` are properly configured.

**CSRF errors during AJAX requests?**
    Ensure ``CSRF_COOKIE_HTTPONLY = False`` is set in your settings.

**Import errors?**
    Verify that Martor is properly installed: ``pip show martor``

**JavaScript errors?**
    Check that all required static files are properly loaded. Use browser developer tools to identify missing files.

Next Steps
----------

Now that Martor is installed, continue with:

* :doc:`quickstart` - Basic usage examples
* :doc:`settings` - Complete configuration reference
* :doc:`usage/models` - Using Martor in your models
