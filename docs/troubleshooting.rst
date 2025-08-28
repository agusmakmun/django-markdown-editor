Troubleshooting
===============

This guide helps you diagnose and fix common issues with Martor. If you don't find your specific problem here, check the :doc:`faq` or create an issue on GitHub.

Installation Issues
-------------------

Editor Not Loading
~~~~~~~~~~~~~~~~~~

**Symptoms:**
- Textarea appears as plain text field
- No editor toolbar visible
- JavaScript console shows errors

**Solutions:**

1. **Check static files:**

.. code-block:: bash

    python manage.py collectstatic

2. **Verify MARTOR_THEME setting:**

.. code-block:: python

    # settings.py
    MARTOR_THEME = 'bootstrap'  # or 'semantic'

3. **Check required CSS/JS files in templates:**

.. code-block:: html

    <!-- Required CSS -->
    <link href="{% static 'plugins/css/ace.min.css' %}" rel="stylesheet">
    <link href="{% static 'martor/css/martor.bootstrap.min.css' %}" rel="stylesheet">

    <!-- Required JavaScript -->
    <script src="{% static 'plugins/js/ace.js' %}"></script>
    <script src="{% static 'martor/js/martor.bootstrap.min.js' %}"></script>

4. **Check browser console for JavaScript errors:**

Press F12 and look for errors in the Console tab.

CSRF Token Errors
~~~~~~~~~~~~~~~~~

**Symptoms:**
- "CSRF verification failed" errors
- Upload functionality not working
- Preview not updating

**Solutions:**

1. **Set CSRF_COOKIE_HTTPONLY to False:**

.. code-block:: python

    # settings.py
    CSRF_COOKIE_HTTPONLY = False

2. **Ensure CSRF token in forms:**

.. code-block:: html

    <form method="post">
        {% csrf_token %}
        {{ form.as_p }}
    </form>

3. **Check AJAX requests include CSRF token:**

.. code-block:: javascript

    // Martor handles this automatically, but for custom AJAX:
    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            xhr.setRequestHeader("X-CSRFToken", $('[name=csrfmiddlewaretoken]').val());
        }
    });

Static Files Not Found
~~~~~~~~~~~~~~~~~~~~~~

**Symptoms:**
- 404 errors for CSS/JS files
- Unstyled editor appearance
- Missing images/icons

**Solutions:**

1. **Check STATIC_URL and STATIC_ROOT:**

.. code-block:: python

    # settings.py
    STATIC_URL = '/static/'
    STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

2. **Collect static files:**

.. code-block:: bash

    python manage.py collectstatic

3. **Verify URL configuration:**

.. code-block:: python

    # urls.py
    from django.conf import settings
    from django.conf.urls.static import static

    urlpatterns = [
        # ... your patterns
    ]

    if settings.DEBUG:
        urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

Editor Functionality Issues
---------------------------

Preview Not Working
~~~~~~~~~~~~~~~~~~~

**Symptoms:**
- Live preview shows "Loading..." indefinitely
- Preview pane remains empty
- Console shows AJAX errors

**Solutions:**

1. **Check Martor URLs are included:**

.. code-block:: python

    # urls.py
    urlpatterns = [
        path('martor/', include('martor.urls')),
    ]

2. **Verify markdownify endpoint:**

Visit ``/martor/markdownify/`` directly to test the endpoint.

3. **Check MARTOR_MARKDOWNIFY_URL setting:**

.. code-block:: python

    # settings.py
    MARTOR_MARKDOWNIFY_URL = '/martor/markdownify/'  # Default

4. **Increase timeout for slow responses:**

.. code-block:: python

    # settings.py
    MARTOR_MARKDOWNIFY_TIMEOUT = 5000  # 5 seconds

Upload Not Working
~~~~~~~~~~~~~~~~~~

**Symptoms:**
- Upload button doesn't respond
- Image upload fails silently
- Error messages about upload endpoint

**Solutions:**

1. **Configure imgur settings:**

.. code-block:: python

    # settings.py
    MARTOR_IMGUR_CLIENT_ID = 'your-client-id'
    MARTOR_IMGUR_API_KEY = 'your-api-key'

2. **Check upload URL configuration:**

.. code-block:: python

    # settings.py
    MARTOR_UPLOAD_URL = '/martor/uploader/'  # Default

3. **Implement custom uploader:**

See :doc:`examples/custom-uploader` for implementation details.

4. **Disable upload if not needed:**

.. code-block:: python

    # settings.py
    MARTOR_UPLOAD_URL = ''  # Disables upload
    MARTOR_ENABLE_CONFIGS = {
        'imgur': 'false',
        # ... other configs
    }

Toolbar Buttons Missing
~~~~~~~~~~~~~~~~~~~~~~~

**Symptoms:**
- Some toolbar buttons don't appear
- Buttons present but not working
- Unexpected button behavior

**Solutions:**

1. **Check MARTOR_TOOLBAR_BUTTONS setting:**

.. code-block:: python

    # settings.py
    MARTOR_TOOLBAR_BUTTONS = [
        'bold', 'italic', 'heading', 'link',
        'image-upload', 'emoji', 'help'
    ]

2. **Verify feature configurations:**

.. code-block:: python

    # settings.py
    MARTOR_ENABLE_CONFIGS = {
        'emoji': 'true',     # For emoji button
        'imgur': 'true',     # For image upload
        'mention': 'true',   # For mention button
    }

3. **Check JavaScript console for errors:**

Button functionality depends on JavaScript being loaded correctly.

Admin Integration Issues
------------------------

Editor Not Showing in Admin
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Symptoms:**
- Plain textarea in admin forms
- Admin interface missing rich editor

**Solutions:**

1. **Check admin configuration:**

.. code-block:: python

    # admin.py
    from martor.widgets import AdminMartorWidget

    @admin.register(MyModel)
    class MyModelAdmin(admin.ModelAdmin):
        formfield_overrides = {
            models.TextField: {'widget': AdminMartorWidget},
        }

2. **Verify MARTOR_ENABLE_ADMIN_CSS:**

.. code-block:: python

    # settings.py
    MARTOR_ENABLE_ADMIN_CSS = True

3. **Check for admin theme conflicts:**

.. code-block:: python

    # For custom admin themes like django-grappelli
    MARTOR_ENABLE_ADMIN_CSS = False

Admin Styling Issues
~~~~~~~~~~~~~~~~~~~~

**Symptoms:**
- Editor appears but looks broken
- CSS conflicts with admin theme
- Layout problems

**Solutions:**

1. **Disable admin CSS for custom themes:**

.. code-block:: python

    # settings.py
    MARTOR_ENABLE_ADMIN_CSS = False

2. **Override admin templates:**

.. code-block:: html

    <!-- templates/admin/change_form.html -->
    {% extends "admin/change_form.html" %}
    
    {% block extrahead %}
        {{ block.super }}
        <style>
            .martor-field { width: 100%; }
        </style>
    {% endblock %}

3. **Check for JavaScript conflicts:**

Some admin themes may conflict with Martor's JavaScript.

Performance Issues
------------------

Slow Editor Loading
~~~~~~~~~~~~~~~~~~~

**Symptoms:**
- Long delay before editor appears
- Sluggish typing response
- High CPU usage

**Solutions:**

1. **Disable live preview:**

.. code-block:: python

    # settings.py
    MARTOR_ENABLE_CONFIGS = {
        'living': 'false',
    }

2. **Increase preview timeout:**

.. code-block:: python

    # settings.py
    MARTOR_MARKDOWNIFY_TIMEOUT = 2000  # 2 seconds

3. **Use lazy loading for multiple editors:**

.. code-block:: javascript

    // Initialize editors only when needed
    document.addEventListener('DOMContentLoaded', function() {
        // Custom lazy loading logic
    });

Memory Issues with Large Content
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Symptoms:**
- Browser becomes unresponsive
- High memory usage
- Editor crashes with large documents

**Solutions:**

1. **Limit content length:**

.. code-block:: python

    # In forms
    content = MartorFormField(max_length=50000)

2. **Disable real-time features:**

.. code-block:: python

    # settings.py
    MARTOR_ENABLE_CONFIGS = {
        'living': 'false',
        'spellcheck': 'false',
    }

3. **Implement content pagination:**

Break large documents into smaller sections.

Browser Compatibility Issues
----------------------------

Internet Explorer Issues
~~~~~~~~~~~~~~~~~~~~~~~~

**Note:** Martor has limited support for older IE versions.

**Solutions:**

1. **Add polyfills for IE:**

.. code-block:: html

    <!--[if IE]>
    <script src="{% static 'polyfills/ie-polyfills.js' %}"></script>
    <![endif]-->

2. **Graceful degradation:**

.. code-block:: javascript

    if (!window.ace) {
        // Fallback to plain textarea
        document.querySelector('.martor').style.display = 'none';
        document.querySelector('.fallback-textarea').style.display = 'block';
    }

Mobile Device Issues
~~~~~~~~~~~~~~~~~~~~

**Symptoms:**
- Editor not responsive on mobile
- Touch interactions not working
- Virtual keyboard issues

**Solutions:**

1. **Use responsive theme:**

.. code-block:: python

    # settings.py
    MARTOR_THEME = 'bootstrap'  # Generally more mobile-friendly

2. **Add viewport meta tag:**

.. code-block:: html

    <meta name="viewport" content="width=device-width, initial-scale=1">

3. **Consider mobile-specific styles:**

.. code-block:: css

    @media (max-width: 768px) {
        .martor-field {
            font-size: 16px; /* Prevents zoom on iOS */
        }
    }

Security Issues
---------------

XSS Concerns
~~~~~~~~~~~~

**Symptoms:**
- Concerns about user-generated content
- Need to sanitize HTML output

**Solutions:**

1. **Martor includes built-in sanitization:**

.. code-block:: python

    # These are configured by default
    ALLOWED_HTML_TAGS = [
        'a', 'abbr', 'b', 'blockquote', 'br', 'cite', 'code',
        # ... safe tags only
    ]

2. **Use safe_markdown filter:**

.. code-block:: html

    {% load martortags %}
    {{ content|safe_markdown }}  <!-- Automatically sanitized -->

3. **Additional validation:**

.. code-block:: python

    from django.core.exceptions import ValidationError
    import re

    def validate_no_script_tags(value):
        if re.search(r'<script', value, re.IGNORECASE):
            raise ValidationError("Script tags are not allowed.")

Content Not Saving
~~~~~~~~~~~~~~~~~~

**Symptoms:**
- Form submits but content is lost
- Data appears truncated
- Save operation fails silently

**Solutions:**

1. **Check database field length:**

.. code-block:: python

    # For very large content
    class MyModel(models.Model):
        content = models.TextField()  # No length limit

2. **Verify form handling:**

.. code-block:: python

    def my_view(request):
        if request.method == 'POST':
            form = MyForm(request.POST)
            if form.is_valid():
                form.save()
                return redirect('success')
            else:
                print(form.errors)  # Debug form errors

3. **Check server limits:**

.. code-block:: python

    # settings.py
    DATA_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10MB

Getting Help
------------

Debug Mode
~~~~~~~~~~

Enable Django debug mode to see detailed error messages:

.. code-block:: python

    # settings.py
    DEBUG = True

Check Server Logs
~~~~~~~~~~~~~~~~~

Look at your server error logs for detailed error information:

.. code-block:: bash

    # Django development server
    tail -f /path/to/your/logfile

    # Or check Django logs
    python manage.py shell
    >>> import logging
    >>> logging.basicConfig(level=logging.DEBUG)

Browser Developer Tools
~~~~~~~~~~~~~~~~~~~~~~~

1. **Open developer tools** (F12)
2. **Check Console tab** for JavaScript errors
3. **Check Network tab** for failed requests
4. **Check Elements tab** for CSS issues

Community Support
~~~~~~~~~~~~~~~~~

If you can't resolve your issue:

1. **Search existing issues:** https://github.com/agusmakmun/django-markdown-editor/issues
2. **Create a new issue** with:
   - Django version
   - Martor version
   - Browser and version
   - Complete error messages
   - Minimal code to reproduce the issue

**Issue Template:**

.. code-block:: text

    ## Environment
    - Django version: 
    - Martor version: 
    - Python version: 
    - Browser: 

    ## Expected Behavior
    [What you expected to happen]

    ## Actual Behavior
    [What actually happened]

    ## Steps to Reproduce
    1. 
    2. 
    3. 

    ## Error Messages
    [Full error message with traceback]

    ## Code
    [Minimal code that reproduces the issue]

Next Steps
----------

* :doc:`faq` - Frequently asked questions
* :doc:`examples/basic` - Working examples
* :doc:`settings` - Configuration reference
