Configuration & Settings
========================

Martor provides extensive configuration options to customize the editor's behavior, appearance, and functionality. All settings are optional and have sensible defaults.

Quick Configuration
-------------------

The minimal configuration you need:

.. code-block:: python

    # settings.py
    
    # Choose your theme
    MARTOR_THEME = 'bootstrap'  # or 'semantic'
    
    # Required for AJAX functionality
    CSRF_COOKIE_HTTPONLY = False

Complete Settings Reference
---------------------------

Theme Configuration
~~~~~~~~~~~~~~~~~~~

**MARTOR_THEME**

Choose between Bootstrap or Semantic-UI styling:

.. code-block:: python

    MARTOR_THEME = 'bootstrap'  # Default
    # or
    MARTOR_THEME = 'semantic'

The theme affects:

* CSS styling and layout
* JavaScript behavior
* HTML structure of the editor

Feature Configuration
~~~~~~~~~~~~~~~~~~~~~

**MARTOR_ENABLE_CONFIGS**

Control which features are enabled:

.. code-block:: python

    MARTOR_ENABLE_CONFIGS = {
        'emoji': 'true',        # Enable/disable emoji icons
        'imgur': 'true',        # Enable/disable imgur/custom uploader
        'mention': 'false',     # Enable/disable user mentions
        'jquery': 'true',       # Include/exclude jQuery (required for admin)
        'living': 'false',      # Enable/disable live preview updates
        'spellcheck': 'false',  # Enable/disable spellcheck
        'hljs': 'true',         # Enable/disable syntax highlighting
    }

.. note::
    All values must be strings: ``'true'`` or ``'false'``, not Python booleans.

**Feature Details:**

* **emoji**: Enables emoji picker and ``:emoji_name:`` syntax
* **imgur**: Enables image upload functionality
* **mention**: Enables ``@[username]`` user mention syntax
* **jquery**: Includes jQuery library (essential for Django admin)
* **living**: Real-time preview updates as you type (can impact performance)
* **spellcheck**: Browser-based spellchecking (US English only)
* **hljs**: Syntax highlighting in code blocks using highlight.js

Toolbar Configuration
~~~~~~~~~~~~~~~~~~~~~

**MARTOR_TOOLBAR_BUTTONS**

Customize which buttons appear in the editor toolbar:

.. code-block:: python

    MARTOR_TOOLBAR_BUTTONS = [
        'bold',                # Bold text button
        'italic',              # Italic text button
        'horizontal',          # Horizontal rule
        'heading',             # Heading dropdown
        'pre-code',           # Code block button
        'blockquote',         # Blockquote button
        'unordered-list',     # Bullet list
        'ordered-list',       # Numbered list
        'link',               # Link insertion
        'image-link',         # Image by URL
        'image-upload',       # Image upload (requires imgur/custom uploader)
        'emoji',              # Emoji picker
        'direct-mention',     # User mention
        'toggle-maximize',    # Fullscreen toggle
        'help'                # Help/guide modal
    ]

.. tip::
    Remove buttons you don't need to declutter the interface. For example, remove ``'image-upload'`` if you don't have upload configured.

Editor Behavior
~~~~~~~~~~~~~~~

**MARTOR_ENABLE_LABEL**

Control whether form fields show labels:

.. code-block:: python

    MARTOR_ENABLE_LABEL = False  # Default: no labels
    # or
    MARTOR_ENABLE_LABEL = True   # Show field labels

**MARTOR_MARKDOWNIFY_TIMEOUT**

Delay for live preview updates (in milliseconds):

.. code-block:: python

    MARTOR_MARKDOWNIFY_TIMEOUT = 1000  # Default: 1 second
    # or
    MARTOR_MARKDOWNIFY_TIMEOUT = 0     # Instant updates

Higher values reduce server load but create noticeable delays. Use ``0`` for instant updates.

Image Upload Configuration
~~~~~~~~~~~~~~~~~~~~~~~~~~

**Imgur Integration**

To enable image uploads via imgur.com:

.. code-block:: python

    MARTOR_IMGUR_CLIENT_ID = 'your-imgur-client-id'
    MARTOR_IMGUR_API_KEY = 'your-imgur-api-key'

Get these credentials by registering at https://api.imgur.com/oauth2/addclient

**Upload URLs**

Configure upload endpoints:

.. code-block:: python

    # Default imgur upload endpoint
    MARTOR_UPLOAD_URL = '/martor/uploader/'
    
    # Disable upload functionality
    MARTOR_UPLOAD_URL = ''
    
    # Custom upload endpoint
    MARTOR_UPLOAD_URL = '/my-custom-uploader/'

**User Search URL**

For user mentions functionality:

.. code-block:: python

    # Default user search endpoint  
    MARTOR_SEARCH_USERS_URL = '/martor/search-user/'
    
    # Disable user mentions
    MARTOR_SEARCH_USERS_URL = ''
    
    # Custom user search endpoint
    MARTOR_SEARCH_USERS_URL = '/my-user-search/'

Markdown Processing
~~~~~~~~~~~~~~~~~~~

**MARTOR_MARKDOWNIFY_FUNCTION**

Customize the markdown processing function:

.. code-block:: python

    MARTOR_MARKDOWNIFY_FUNCTION = 'martor.utils.markdownify'  # Default
    # or
    MARTOR_MARKDOWNIFY_FUNCTION = 'myapp.utils.custom_markdownify'

**MARTOR_MARKDOWNIFY_URL**

URL endpoint for AJAX markdown conversion:

.. code-block:: python

    MARTOR_MARKDOWNIFY_URL = '/martor/markdownify/'  # Default

**MARTOR_MARKDOWN_EXTENSIONS**

Configure which markdown extensions to use:

.. code-block:: python

    MARTOR_MARKDOWN_EXTENSIONS = [
        # Standard Python Markdown extensions
        'markdown.extensions.extra',
        'markdown.extensions.nl2br',
        'markdown.extensions.smarty',
        'markdown.extensions.fenced_code',
        'markdown.extensions.sane_lists',
        
        # Martor custom extensions
        'martor.extensions.urlize',       # Auto-link URLs
        'martor.extensions.del_ins',      # ~~strikethrough~~ and ++underline++
        'martor.extensions.mention',      # @[username] mentions
        'martor.extensions.emoji',        # :emoji_name: support
        'martor.extensions.mdx_video',    # Video embedding
        'martor.extensions.escape_html',  # XSS protection
        'martor.extensions.mdx_add_id',   # Custom ID attributes {#id}
    ]

**MARTOR_MARKDOWN_EXTENSION_CONFIGS**

Additional configuration for markdown extensions:

.. code-block:: python

    MARTOR_MARKDOWN_EXTENSION_CONFIGS = {
        'markdown.extensions.codehilite': {
            'css_class': 'highlight',
        },
        'markdown.extensions.extra': {
            'markdown.extensions.footnotes': {
                'PLACE_MARKER': '^^^FOOTNOTES^^^'
            }
        }
    }

External Resources
~~~~~~~~~~~~~~~~~~

**MARTOR_MARKDOWN_BASE_EMOJI_URL**

Base URL for emoji images:

.. code-block:: python

    # Default: GitHub emoji
    MARTOR_MARKDOWN_BASE_EMOJI_URL = 'https://github.githubassets.com/images/icons/emoji/'
    
    # Alternative: WebFX emoji
    MARTOR_MARKDOWN_BASE_EMOJI_URL = 'https://www.webfx.com/tools/emoji-cheat-sheet/graphics/emojis/'
    
    # Disable emoji images
    MARTOR_MARKDOWN_BASE_EMOJI_URL = ''

**MARTOR_MARKDOWN_BASE_MENTION_URL**

Base URL for user mention links:

.. code-block:: python

    MARTOR_MARKDOWN_BASE_MENTION_URL = 'https://yoursite.com/users/'

When users type ``@[john]``, it creates links to ``https://yoursite.com/users/john``

Custom Theme Files
~~~~~~~~~~~~~~~~~~

Override default CSS/JS with your own themed versions:

.. code-block:: python

    # Custom themed CSS file
    MARTOR_ALTERNATIVE_CSS_FILE_THEME = 'my-theme/semantic.min.css'
    
    # Custom themed JS file  
    MARTOR_ALTERNATIVE_JS_FILE_THEME = 'my-theme/semantic.min.js'
    
    # Custom jQuery file
    MARTOR_ALTERNATIVE_JQUERY_JS_FILE = 'jquery/dist/jquery.min.js'

Admin Interface
~~~~~~~~~~~~~~~

**MARTOR_ENABLE_ADMIN_CSS**

Control whether to include admin-specific CSS:

.. code-block:: python

    MARTOR_ENABLE_ADMIN_CSS = True   # Default: include admin styles
    # or  
    MARTOR_ENABLE_ADMIN_CSS = False  # Disable for custom admin themes like django-grappelli

Security Settings
~~~~~~~~~~~~~~~~~

**ALLOWED_URL_SCHEMES**

URL schemes allowed in links:

.. code-block:: python

    ALLOWED_URL_SCHEMES = [
        'file', 'ftp', 'ftps', 'http', 'https', 'irc', 'mailto',
        'sftp', 'ssh', 'tel', 'telnet', 'tftp', 'vnc', 'xmpp',
    ]

**ALLOWED_HTML_TAGS**

HTML tags allowed in rendered output:

.. code-block:: python

    ALLOWED_HTML_TAGS = [
        'a', 'abbr', 'b', 'blockquote', 'br', 'cite', 'code', 'command',
        'dd', 'del', 'dl', 'dt', 'em', 'fieldset', 'h1', 'h2', 'h3', 'h4',
        'h5', 'h6', 'hr', 'i', 'iframe', 'img', 'input', 'ins', 'kbd',
        'label', 'legend', 'li', 'ol', 'optgroup', 'option', 'p', 'pre',
        'small', 'span', 'strong', 'sub', 'sup', 'table', 'tbody', 'td',
        'tfoot', 'th', 'thead', 'tr', 'u', 'ul'
    ]

**ALLOWED_HTML_ATTRIBUTES**

HTML attributes allowed in rendered output:

.. code-block:: python

    ALLOWED_HTML_ATTRIBUTES = [
        'alt', 'class', 'color', 'colspan', 'datetime', 'height', 'href',
        'id', 'name', 'reversed', 'rowspan', 'scope', 'src', 'style',
        'title', 'type', 'width'
    ]

Environment-Specific Settings
-----------------------------

Development Settings
~~~~~~~~~~~~~~~~~~~~

For development, you might want more verbose output and instant updates:

.. code-block:: python

    # settings_dev.py
    MARTOR_ENABLE_CONFIGS = {
        'emoji': 'true',
        'imgur': 'true', 
        'mention': 'true',
        'jquery': 'true',
        'living': 'true',     # Enable for immediate feedback
        'spellcheck': 'true', # Enable for writing assistance
        'hljs': 'true',
    }
    
    MARTOR_MARKDOWNIFY_TIMEOUT = 0  # Instant updates

Production Settings
~~~~~~~~~~~~~~~~~~~

For production, optimize for performance:

.. code-block:: python

    # settings_prod.py
    MARTOR_ENABLE_CONFIGS = {
        'emoji': 'true',
        'imgur': 'true',
        'mention': 'false',   # Disable if not needed
        'jquery': 'true',
        'living': 'false',    # Disable for better performance  
        'spellcheck': 'false', # Let users handle this
        'hljs': 'true',
    }
    
    MARTOR_MARKDOWNIFY_TIMEOUT = 1000  # Reduce server load

Common Configuration Examples
-----------------------------

Minimal Blog Setup
~~~~~~~~~~~~~~~~~~

.. code-block:: python

    MARTOR_THEME = 'bootstrap'
    MARTOR_ENABLE_CONFIGS = {
        'emoji': 'true',
        'imgur': 'true', 
        'mention': 'false',
        'jquery': 'true',
        'living': 'false',
        'spellcheck': 'false',
        'hljs': 'true',
    }
    MARTOR_TOOLBAR_BUTTONS = [
        'bold', 'italic', 'heading', 'blockquote', 
        'unordered-list', 'ordered-list', 'link', 
        'image-upload', 'toggle-maximize'
    ]

Documentation/Wiki Setup
~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: python

    MARTOR_THEME = 'semantic'
    MARTOR_ENABLE_CONFIGS = {
        'emoji': 'true',
        'imgur': 'true',
        'mention': 'true',   # For collaborative editing
        'jquery': 'true',
        'living': 'true',    # Real-time preview
        'spellcheck': 'true', # Important for documentation
        'hljs': 'true',
    }
    MARTOR_TOOLBAR_BUTTONS = [
        'bold', 'italic', 'horizontal', 'heading', 'pre-code',
        'blockquote', 'unordered-list', 'ordered-list', 'link',
        'image-upload', 'direct-mention', 'toggle-maximize', 'help'
    ]

Troubleshooting Settings
------------------------

**Editor not loading?**
    Check ``MARTOR_THEME`` is set to a valid value (``'bootstrap'`` or ``'semantic'``).

**AJAX errors?**
    Ensure ``CSRF_COOKIE_HTTPONLY = False`` is set.

**Upload not working?**
    Verify ``MARTOR_IMGUR_CLIENT_ID`` and ``MARTOR_IMGUR_API_KEY`` are correct, or implement a custom uploader.

**Mentions not working?**
    Make sure ``mention`` is ``'true'`` in ``MARTOR_ENABLE_CONFIGS`` and you have a user search endpoint.

**Performance issues?**
    Set ``living`` to ``'false'`` and increase ``MARTOR_MARKDOWNIFY_TIMEOUT``.

Next Steps
----------

* :doc:`usage/models` - Using Martor with Django models
* :doc:`examples/custom-uploader` - Setting up custom image upload
* :doc:`security` - Understanding Martor's security features
* :doc:`customization` - Advanced customization options
