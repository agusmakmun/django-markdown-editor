Customizing Martor Widgets
==========================

Martor provides powerful widget classes that can be customized to fit your specific needs. This guide covers widget customization, configuration, and advanced usage patterns.

Available Widgets
-----------------

Martor provides two main widget classes:

* **MartorWidget**: For use in regular forms
* **AdminMartorWidget**: For use in Django Admin

Basic Widget Usage
------------------

Standard Widget
~~~~~~~~~~~~~~~

.. code-block:: python

    from django import forms
    from martor.widgets import MartorWidget

    class MyForm(forms.Form):
        content = forms.CharField(widget=MartorWidget())

Admin Widget
~~~~~~~~~~~~

.. code-block:: python

    from django.contrib import admin
    from django.db import models
    from martor.widgets import AdminMartorWidget

    class MyModelAdmin(admin.ModelAdmin):
        formfield_overrides = {
            models.TextField: {'widget': AdminMartorWidget},
        }

Widget Configuration
--------------------

Martor widgets can be configured through several methods:

HTML Attributes
~~~~~~~~~~~~~~~

Configure the widget using HTML data attributes:

.. code-block:: python

    from martor.widgets import MartorWidget

    widget = MartorWidget(attrs={
        # Upload configuration
        'data-upload-url': '/custom-upload-endpoint/',
        'data-search-users-url': '/custom-user-search/',
        'data-base-emoji-url': 'https://example.com/emojis/',
        
        # Editor behavior
        'data-save-timeout': 2000,  # milliseconds
        'placeholder': 'Start writing...',
        'rows': 15,
        'class': 'my-custom-editor',
        
        # Feature toggles (override global settings)
        'data-enable-configs': {
            'emoji': 'true',
            'imgur': 'false',
            'mention': 'true',
            'living': 'false',
            'spellcheck': 'true',
            'hljs': 'true',
        }
    })

Available Data Attributes
~~~~~~~~~~~~~~~~~~~~~~~~~

* ``data-upload-url``: Custom image upload endpoint
* ``data-search-users-url``: Custom user search endpoint  
* ``data-base-emoji-url``: Custom emoji base URL
* ``data-save-timeout``: Preview update delay (milliseconds)
* ``data-markdownfy-url``: Custom markdown conversion endpoint
* ``data-enable-configs``: Override global feature settings

Advanced Widget Customization
------------------------------

Custom Widget Class
~~~~~~~~~~~~~~~~~~~

Create your own widget class for reusable customizations:

.. code-block:: python

    from martor.widgets import MartorWidget

    class BlogMartorWidget(MartorWidget):
        def __init__(self, *args, **kwargs):
            # Set default attributes
            default_attrs = {
                'data-upload-url': '/blog/upload-image/',
                'data-search-users-url': '/blog/search-users/',
                'placeholder': 'Write your blog post...',
                'rows': 20,
                'class': 'blog-editor',
                'data-enable-configs': {
                    'emoji': 'true',
                    'imgur': 'false',
                    'mention': 'true',
                    'living': 'true',
                    'spellcheck': 'true',
                    'hljs': 'true',
                }
            }
            
            # Merge with any provided attrs
            attrs = kwargs.get('attrs', {})
            default_attrs.update(attrs)
            kwargs['attrs'] = default_attrs
            
            super().__init__(*args, **kwargs)

    # Usage
    class BlogPostForm(forms.Form):
        content = forms.CharField(widget=BlogMartorWidget())

Conditional Widget Configuration
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Configure the widget based on context:

.. code-block:: python

    class ContextualMartorWidget(MartorWidget):
        def __init__(self, user=None, *args, **kwargs):
            attrs = kwargs.get('attrs', {})
            
            # Configure based on user permissions
            if user and user.has_perm('myapp.can_upload_images'):
                attrs['data-upload-url'] = '/secure-upload/'
            else:
                attrs['data-upload-url'] = ''  # Disable uploads
            
            # Configure mentions based on user
            if user and user.is_staff:
                attrs['data-search-users-url'] = '/admin/search-users/'
                attrs['data-enable-configs'] = {
                    'mention': 'true'
                }
            else:
                attrs['data-enable-configs'] = {
                    'mention': 'false'
                }
            
            kwargs['attrs'] = attrs
            super().__init__(*args, **kwargs)

    # Usage in form
    class PostForm(forms.Form):
        def __init__(self, user=None, *args, **kwargs):
            super().__init__(*args, **kwargs)
            self.fields['content'] = forms.CharField(
                widget=ContextualMartorWidget(user=user)
            )

Theme-Specific Widgets
----------------------

Bootstrap Widget
~~~~~~~~~~~~~~~~

.. code-block:: python

    class BootstrapMartorWidget(MartorWidget):
        def __init__(self, *args, **kwargs):
            attrs = kwargs.get('attrs', {})
            attrs.update({
                'class': 'form-control martor-bootstrap',
                'data-theme': 'bootstrap'
            })
            kwargs['attrs'] = attrs
            super().__init__(*args, **kwargs)

Semantic UI Widget
~~~~~~~~~~~~~~~~~~

.. code-block:: python

    class SemanticMartorWidget(MartorWidget):
        def __init__(self, *args, **kwargs):
            attrs = kwargs.get('attrs', {})
            attrs.update({
                'class': 'ui input martor-semantic',
                'data-theme': 'semantic'
            })
            kwargs['attrs'] = attrs
            super().__init__(*args, **kwargs)

Widget Media Configuration
--------------------------

The widget automatically includes necessary CSS and JavaScript files. You can customize this:

.. code-block:: python

    class CustomMartorWidget(MartorWidget):
        class Media:
            css = {
                'all': (
                    'plugins/css/ace.min.css',
                    'plugins/css/highlight.min.css',
                    'martor/css/martor.bootstrap.min.css',
                    'custom/my-martor-theme.css',  # Your custom CSS
                )
            }
            js = (
                'plugins/js/ace.js',
                'plugins/js/mode-markdown.js',
                'plugins/js/ext-language_tools.js',
                'plugins/js/theme-github.js',
                'plugins/js/highlight.min.js',
                'plugins/js/emojis.min.js',
                'martor/js/martor.bootstrap.min.js',
                'custom/my-martor-extensions.js',  # Your custom JS
            )

Widget Templates
----------------

Martor uses templates for rendering. You can override these:

**Template Structure:**
::

    martor/
    ├── bootstrap/
    │   ├── editor.html
    │   ├── emoji.html
    │   ├── guide.html
    │   └── toolbar.html
    └── semantic/
        ├── editor.html
        ├── emoji.html
        ├── guide.html
        └── toolbar.html

**Custom Template Example:**

.. code-block:: html

    <!-- templates/martor/bootstrap/editor.html -->
    <div class="martor-field" id="martor-{{ field_name }}">
        <div class="martor-toolbar">
            <!-- Custom toolbar -->
            {% include "martor/bootstrap/toolbar.html" %}
        </div>
        
        <div class="martor-editor-wrapper">
            {{ martor|safe }}
        </div>
        
        {% if emoji_enabled %}
            <div class="martor-emoji-picker">
                {% include "martor/bootstrap/emoji.html" %}
            </div>
        {% endif %}
        
        <div class="martor-preview" style="display: none;">
            <div class="martor-preview-content"></div>
        </div>
    </div>

JavaScript API Integration
--------------------------

Access the Martor editor instance via JavaScript:

.. code-block:: javascript

    // Get editor instance
    var editor = ace.edit('martor-editor-id');

    // Configure editor
    editor.setTheme('ace/theme/github');
    editor.getSession().setMode('ace/mode/markdown');

    // Custom event handlers
    editor.on('change', function() {
        console.log('Content changed');
        // Custom logic here
    });

    // Custom commands
    editor.commands.addCommand({
        name: 'customCommand',
        bindKey: {win: 'Ctrl-K', mac: 'Command-K'},
        exec: function(editor) {
            // Custom command logic
        }
    });

Multiple Editors
----------------

When using multiple Martor editors on the same page:

.. code-block:: python

    class MultiEditorForm(forms.Form):
        summary = forms.CharField(
            widget=MartorWidget(attrs={
                'placeholder': 'Brief summary...',
                'rows': 8,
                'data-editor-id': 'summary-editor'
            })
        )
        
        content = forms.CharField(
            widget=MartorWidget(attrs={
                'placeholder': 'Full content...',
                'rows': 20,
                'data-editor-id': 'content-editor'
            })
        )
        
        notes = forms.CharField(
            widget=MartorWidget(attrs={
                'placeholder': 'Additional notes...',
                'rows': 6,
                'data-editor-id': 'notes-editor',
                'data-enable-configs': {
                    'toolbar': 'false'  # Minimal toolbar
                }
            }),
            required=False
        )

Performance Optimization
------------------------

Lazy Loading Widget
~~~~~~~~~~~~~~~~~~~

For pages with many editors, implement lazy loading:

.. code-block:: python

    class LazyMartorWidget(MartorWidget):
        def __init__(self, *args, **kwargs):
            attrs = kwargs.get('attrs', {})
            attrs.update({
                'data-lazy-load': 'true',
                'class': 'martor-lazy'
            })
            kwargs['attrs'] = attrs
            super().__init__(*args, **kwargs)

Corresponding JavaScript:

.. code-block:: javascript

    // Initialize editors only when they come into view
    document.addEventListener('DOMContentLoaded', function() {
        const lazyEditors = document.querySelectorAll('.martor-lazy');
        
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    initializeMartorEditor(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        });
        
        lazyEditors.forEach(function(editor) {
            observer.observe(editor);
        });
    });

Widget with Custom Upload Handler
---------------------------------

Implement custom upload functionality:

.. code-block:: python

    class CustomUploadMartorWidget(MartorWidget):
        def __init__(self, upload_handler=None, *args, **kwargs):
            attrs = kwargs.get('attrs', {})
            
            if upload_handler:
                attrs['data-upload-url'] = upload_handler
            
            # Custom upload configuration
            attrs.update({
                'data-upload-max-size': '5MB',
                'data-upload-allowed-types': 'image/jpeg,image/png,image/gif',
                'data-upload-progress': 'true'
            })
            
            kwargs['attrs'] = attrs
            super().__init__(*args, **kwargs)

Usage Examples
--------------

Simple Blog Editor
~~~~~~~~~~~~~~~~~~

.. code-block:: python

    blog_widget = MartorWidget(attrs={
        'placeholder': 'Share your thoughts...',
        'rows': 15,
        'data-enable-configs': {
            'emoji': 'true',
            'imgur': 'true',
            'mention': 'false',
            'living': 'true',
        }
    })

Documentation Editor
~~~~~~~~~~~~~~~~~~~~

.. code-block:: python

    docs_widget = MartorWidget(attrs={
        'placeholder': 'Write documentation...',
        'rows': 25,
        'data-enable-configs': {
            'emoji': 'false',
            'imgur': 'false',
            'mention': 'true',
            'living': 'true',
            'spellcheck': 'true',
            'hljs': 'true',
        }
    })

Comment Editor
~~~~~~~~~~~~~~

.. code-block:: python

    comment_widget = MartorWidget(attrs={
        'placeholder': 'Add your comment...',
        'rows': 6,
        'data-enable-configs': {
            'emoji': 'true',
            'imgur': 'false',
            'mention': 'true',
            'living': 'false',
        },
        'data-toolbar-buttons': ['bold', 'italic', 'link', 'emoji']
    })

Troubleshooting Widgets
-----------------------

**Editor not rendering?**
    Check that all required static files are included and ``MARTOR_THEME`` is set correctly.

**Custom attributes not working?**
    Ensure attribute names start with ``data-`` and use proper JSON format for complex values.

**Multiple editors conflicting?**
    Use unique ``data-editor-id`` attributes for each editor.

**Upload not working?**
    Verify the upload URL is correct and the endpoint returns proper JSON responses.

Best Practices
--------------

1. **Use data attributes for configuration**:

.. code-block:: python

    widget = MartorWidget(attrs={
        'data-upload-url': '/upload/',
        'data-save-timeout': 1000,
    })

2. **Create reusable widget classes**:

.. code-block:: python

    class BlogMartorWidget(MartorWidget):
        # Predefined configuration for blog posts

3. **Consider performance for multiple editors**:

.. code-block:: python

    # Use lazy loading or minimal configurations

4. **Provide appropriate placeholders**:

.. code-block:: python

    widget = MartorWidget(attrs={
        'placeholder': 'Clear instructions for users...'
    })

Next Steps
----------

* :doc:`admin` - Using widgets in Django Admin
* :doc:`../customization` - Advanced customization
* :doc:`../examples/basic` - Complete widget examples
* :doc:`../themes` - Theming and styling
