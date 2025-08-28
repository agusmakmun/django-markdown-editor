Template Integration
===================

This guide covers how to properly integrate Martor in your Django templates, both for editing (forms) and displaying (rendered markdown) content.

Template Tags and Filters
--------------------------

Martor provides template tags and filters for rendering markdown content:

.. code-block:: html

    {% load martortags %}

Safe Markdown Filter
~~~~~~~~~~~~~~~~~~~~

The primary filter for rendering markdown as HTML:

.. code-block:: html

    {% load martortags %}
    
    <!-- Render markdown content as HTML -->
    {{ post.content|safe_markdown }}
    
    <!-- With additional context -->
    {{ article.description|safe_markdown }}

The ``safe_markdown`` filter:

* Converts markdown to HTML
* Applies security filtering (XSS protection)
* Processes Martor extensions (emoji, mentions, etc.)
* Returns safe HTML that can be displayed directly

Template Structure for Forms
-----------------------------

Basic Form Template
~~~~~~~~~~~~~~~~~~~

.. code-block:: html

    <!-- post_form.html -->
    {% extends "base.html" %}
    {% load static %}

    {% block title %}Create Post{% endblock %}

    {% block css %}
        <!-- Required CSS files -->
        <link href="{% static 'plugins/css/ace.min.css' %}" rel="stylesheet">
        <link href="{% static 'plugins/css/highlight.min.css' %}" rel="stylesheet">
        <link href="{% static 'martor/css/martor.bootstrap.min.css' %}" rel="stylesheet">
        
        <!-- Optional: Bootstrap for styling -->
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    {% endblock %}

    {% block content %}
    <div class="container mt-4">
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header">
                        <h3>Create New Post</h3>
                    </div>
                    <div class="card-body">
                        <form method="post">
                            {% csrf_token %}
                            
                            <!-- Title field -->
                            <div class="mb-3">
                                <label for="{{ form.title.id_for_label }}" class="form-label">
                                    {{ form.title.label }}
                                </label>
                                {{ form.title }}
                                {% if form.title.errors %}
                                    <div class="text-danger">
                                        {% for error in form.title.errors %}
                                            <small>{{ error }}</small>
                                        {% endfor %}
                                    </div>
                                {% endif %}
                            </div>
                            
                            <!-- Martor content field -->
                            <div class="mb-3">
                                <label for="{{ form.content.id_for_label }}" class="form-label">
                                    {{ form.content.label }}
                                </label>
                                {{ form.content }}
                                {% if form.content.help_text %}
                                    <div class="form-text">{{ form.content.help_text }}</div>
                                {% endif %}
                                {% if form.content.errors %}
                                    <div class="text-danger">
                                        {% for error in form.content.errors %}
                                            <small>{{ error }}</small>
                                        {% endfor %}
                                    </div>
                                {% endif %}
                            </div>
                            
                            <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save"></i> Save Post
                                </button>
                                <a href="{% url 'post_list' %}" class="btn btn-secondary">Cancel</a>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
    {% endblock %}

    {% block js %}
        <!-- Required JavaScript files -->
        <script src="{% static 'plugins/js/ace.js' %}"></script>
        <script src="{% static 'plugins/js/mode-markdown.js' %}"></script>
        <script src="{% static 'plugins/js/ext-language_tools.js' %}"></script>
        <script src="{% static 'plugins/js/theme-github.js' %}"></script>
        <script src="{% static 'plugins/js/highlight.min.js' %}"></script>
        <script src="{% static 'plugins/js/emojis.min.js' %}"></script>
        <script src="{% static 'martor/js/martor.bootstrap.min.js' %}"></script>
        
        <!-- Optional: Bootstrap JavaScript -->
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    {% endblock %}

Semantic UI Template
~~~~~~~~~~~~~~~~~~~~

.. code-block:: html

    <!-- semantic_form.html -->
    {% extends "base.html" %}
    {% load static %}

    {% block css %}
        <!-- Semantic UI CSS -->
        <link href="{% static 'plugins/css/semantic.min.css' %}" rel="stylesheet">
        <link href="{% static 'plugins/css/ace.min.css' %}" rel="stylesheet">
        <link href="{% static 'martor/css/martor.semantic.min.css' %}" rel="stylesheet">
    {% endblock %}

    {% block content %}
    <div class="ui container">
        <div class="ui segment">
            <h2 class="ui header">Create Post</h2>
            <form class="ui form" method="post">
                {% csrf_token %}
                
                <div class="field">
                    <label>{{ form.title.label }}</label>
                    {{ form.title }}
                </div>
                
                <div class="field">
                    <label>{{ form.content.label }}</label>
                    {{ form.content }}
                </div>
                
                <button type="submit" class="ui primary button">
                    <i class="save icon"></i> Save
                </button>
            </form>
        </div>
    </div>
    {% endblock %}

    {% block js %}
        <script src="{% static 'plugins/js/semantic.min.js' %}"></script>
        <script src="{% static 'plugins/js/ace.js' %}"></script>
        <script src="{% static 'plugins/js/mode-markdown.js' %}"></script>
        <script src="{% static 'plugins/js/ext-language_tools.js' %}"></script>
        <script src="{% static 'plugins/js/theme-github.js' %}"></script>
        <script src="{% static 'plugins/js/highlight.min.js' %}"></script>
        <script src="{% static 'plugins/js/emojis.min.js' %}"></script>
        <script src="{% static 'martor/js/martor.semantic.min.js' %}"></script>
    {% endblock %}

Template Structure for Display
------------------------------

Basic Display Template
~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: html

    <!-- post_detail.html -->
    {% extends "base.html" %}
    {% load static %}
    {% load martortags %}

    {% block title %}{{ post.title }}{% endblock %}

    {% block css %}
        <!-- CSS for rendered markdown -->
        <link href="{% static 'plugins/css/highlight.min.css' %}" rel="stylesheet">
        <link href="{% static 'martor/css/martor.bootstrap.min.css' %}" rel="stylesheet">
        
        <!-- Custom styles for content -->
        <style>
            .post-content {
                max-width: 800px;
                margin: 0 auto;
                line-height: 1.6;
            }
            
            .post-content h1, .post-content h2, .post-content h3 {
                margin-top: 2rem;
                margin-bottom: 1rem;
            }
            
            .post-content img {
                max-width: 100%;
                height: auto;
                border-radius: 4px;
                margin: 1rem 0;
            }
            
            .post-content blockquote {
                border-left: 4px solid #007bff;
                padding-left: 1rem;
                margin: 1rem 0;
                font-style: italic;
            }
        </style>
    {% endblock %}

    {% block content %}
    <div class="container mt-4">
        <article class="post-content">
            <header class="mb-4">
                <h1>{{ post.title }}</h1>
                <p class="text-muted">
                    Published on {{ post.created_at|date:"F d, Y" }}
                    {% if post.author %}by {{ post.author.get_full_name|default:post.author.username }}{% endif %}
                </p>
            </header>
            
            <div class="martor-preview">
                {{ post.content|safe_markdown }}
            </div>
            
            <footer class="mt-4 pt-3 border-top">
                <p class="text-muted">
                    Last updated: {{ post.updated_at|date:"F d, Y" }}
                </p>
            </footer>
        </article>
    </div>
    {% endblock %}

    {% block js %}
        <!-- JavaScript for syntax highlighting -->
        <script src="{% static 'plugins/js/highlight.min.js' %}"></script>
        <script>
            // Apply syntax highlighting to code blocks
            document.addEventListener('DOMContentLoaded', function() {
                document.querySelectorAll('.martor-preview pre code').forEach(function(block) {
                    hljs.highlightBlock(block);
                });
            });
        </script>
    {% endblock %}

Advanced Display Templates
~~~~~~~~~~~~~~~~~~~~~~~~~~

Template with Table of Contents:

.. code-block:: html

    <!-- advanced_post.html -->
    {% extends "base.html" %}
    {% load static %}
    {% load martortags %}

    {% block css %}
        {{ block.super }}
        <style>
            .toc {
                background: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 0.25rem;
                padding: 1rem;
                margin-bottom: 2rem;
            }
            
            .toc ul {
                list-style: none;
                padding-left: 1rem;
            }
            
            .toc a {
                text-decoration: none;
                color: #495057;
            }
            
            .toc a:hover {
                color: #007bff;
            }
        </style>
    {% endblock %}

    {% block content %}
    <div class="container">
        <div class="row">
            <div class="col-lg-9">
                <article class="post-content">
                    <h1>{{ post.title }}</h1>
                    
                    <div class="martor-preview">
                        {{ post.content|safe_markdown }}
                    </div>
                </article>
            </div>
            
            <div class="col-lg-3">
                <div class="toc sticky-top" style="top: 2rem;">
                    <h5>Table of Contents</h5>
                    <div id="toc-content">
                        <!-- Generated by JavaScript -->
                    </div>
                </div>
            </div>
        </div>
    </div>
    {% endblock %}

    {% block js %}
        {{ block.super }}
        <script>
            // Generate table of contents
            document.addEventListener('DOMContentLoaded', function() {
                const tocContainer = document.getElementById('toc-content');
                const headings = document.querySelectorAll('.martor-preview h1, .martor-preview h2, .martor-preview h3');
                
                if (headings.length > 0) {
                    const tocList = document.createElement('ul');
                    
                    headings.forEach(function(heading, index) {
                        const id = 'heading-' + index;
                        heading.id = id;
                        
                        const listItem = document.createElement('li');
                        const link = document.createElement('a');
                        link.href = '#' + id;
                        link.textContent = heading.textContent;
                        link.className = 'toc-' + heading.tagName.toLowerCase();
                        
                        listItem.appendChild(link);
                        tocList.appendChild(listItem);
                    });
                    
                    tocContainer.appendChild(tocList);
                } else {
                    tocContainer.innerHTML = '<p class="text-muted">No headings found</p>';
                }
            });
        </script>
    {% endblock %}

Multiple Content Display
~~~~~~~~~~~~~~~~~~~~~~~~~

For models with multiple markdown fields:

.. code-block:: html

    <!-- product_detail.html -->
    {% extends "base.html" %}
    {% load static %}
    {% load martortags %}

    {% block content %}
    <div class="container">
        <div class="row">
            <div class="col-md-8">
                <h1>{{ product.name }}</h1>
                
                <!-- Product description -->
                <section class="mb-5">
                    <h2>Description</h2>
                    <div class="martor-preview">
                        {{ product.description|safe_markdown }}
                    </div>
                </section>
                
                <!-- Technical specifications -->
                {% if product.specifications %}
                <section class="mb-5">
                    <h2>Technical Specifications</h2>
                    <div class="martor-preview">
                        {{ product.specifications|safe_markdown }}
                    </div>
                </section>
                {% endif %}
                
                <!-- Usage instructions -->
                {% if product.usage_instructions %}
                <section class="mb-5">
                    <h2>Usage Instructions</h2>
                    <div class="martor-preview">
                        {{ product.usage_instructions|safe_markdown }}
                    </div>
                </section>
                {% endif %}
            </div>
            
            <div class="col-md-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Product Info</h5>
                        <p class="card-text">
                            <strong>Price:</strong> ${{ product.price }}<br>
                            <strong>SKU:</strong> {{ product.sku }}
                        </p>
                        <button class="btn btn-primary">Add to Cart</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    {% endblock %}

AJAX Templates
--------------

For dynamic content loading:

.. code-block:: html

    <!-- ajax_preview.html -->
    <div class="modal fade" id="previewModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Preview</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div id="preview-content" class="martor-preview">
                        <!-- Content loaded via AJAX -->
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
    function loadPreview(contentId) {
        fetch(`/preview/${contentId}/`)
            .then(response => response.json())
            .then(data => {
                document.getElementById('preview-content').innerHTML = data.html;
                
                // Apply syntax highlighting
                document.querySelectorAll('#preview-content pre code').forEach(function(block) {
                    hljs.highlightBlock(block);
                });
                
                // Show modal
                new bootstrap.Modal(document.getElementById('previewModal')).show();
            });
    }
    </script>

Template Blocks and Includes
-----------------------------

Reusable Template Blocks
~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: html

    <!-- _martor_css.html -->
    {% load static %}
    <link href="{% static 'plugins/css/ace.min.css' %}" rel="stylesheet">
    <link href="{% static 'plugins/css/highlight.min.css' %}" rel="stylesheet">
    <link href="{% static 'martor/css/martor.bootstrap.min.css' %}" rel="stylesheet">

    <!-- _martor_js.html -->
    {% load static %}
    <script src="{% static 'plugins/js/ace.js' %}"></script>
    <script src="{% static 'plugins/js/mode-markdown.js' %}"></script>
    <script src="{% static 'plugins/js/ext-language_tools.js' %}"></script>
    <script src="{% static 'plugins/js/theme-github.js' %}"></script>
    <script src="{% static 'plugins/js/highlight.min.js' %}"></script>
    <script src="{% static 'plugins/js/emojis.min.js' %}"></script>
    <script src="{% static 'martor/js/martor.bootstrap.min.js' %}"></script>

    <!-- Usage in templates -->
    {% block css %}
        {% include "_martor_css.html" %}
    {% endblock %}

    {% block js %}
        {% include "_martor_js.html" %}
    {% endblock %}

Form Field Include
~~~~~~~~~~~~~~~~~~

.. code-block:: html

    <!-- _martor_field.html -->
    <div class="form-group">
        <label for="{{ field.id_for_label }}" class="form-label">
            {{ field.label }}
            {% if field.field.required %}<span class="text-danger">*</span>{% endif %}
        </label>
        {{ field }}
        {% if field.help_text %}
            <div class="form-text">{{ field.help_text }}</div>
        {% endif %}
        {% if field.errors %}
            <div class="text-danger">
                {% for error in field.errors %}
                    <small>{{ error }}</small>
                {% endfor %}
            </div>
        {% endif %}
    </div>

    <!-- Usage -->
    {% with field=form.content %}
        {% include "_martor_field.html" %}
    {% endwith %}

Template Performance
--------------------

Optimization Techniques
~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: html

    <!-- Optimized template -->
    {% extends "base.html" %}
    {% load static %}
    {% load martortags %}

    {% block css %}
        {% if form %}
            <!-- Load editor CSS only for forms -->
            {% include "_martor_css.html" %}
        {% else %}
            <!-- Load minimal CSS for display -->
            <link href="{% static 'plugins/css/highlight.min.css' %}" rel="stylesheet">
        {% endif %}
    {% endblock %}

    {% block js %}
        {% if form %}
            <!-- Load editor JS only for forms -->
            {% include "_martor_js.html" %}
        {% else %}
            <!-- Load minimal JS for display -->
            <script src="{% static 'plugins/js/highlight.min.js' %}"></script>
            <script>
                document.addEventListener('DOMContentLoaded', function() {
                    document.querySelectorAll('pre code').forEach(function(block) {
                        hljs.highlightBlock(block);
                    });
                });
            </script>
        {% endif %}
    {% endblock %}

Caching Rendered Content
~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: html

    {% load cache %}
    {% load martortags %}

    {% cache 3600 post_content post.id post.updated_at %}
        <div class="martor-preview">
            {{ post.content|safe_markdown }}
        </div>
    {% endcache %}

Best Practices
--------------

1. **Separate CSS/JS for editing vs. display**:

.. code-block:: html

    <!-- For editing -->
    {% if form %}
        {% include "_martor_editor_assets.html" %}
    {% endif %}
    
    <!-- For display -->
    {% if content %}
        {% include "_martor_display_assets.html" %}
    {% endif %}

2. **Use proper CSRF tokens**:

.. code-block:: html

    <form method="post">
        {% csrf_token %}
        {{ form.as_p }}
    </form>

3. **Handle errors gracefully**:

.. code-block:: html

    {% if form.errors %}
        <div class="alert alert-danger">
            Please correct the errors below.
        </div>
    {% endif %}

4. **Provide loading states**:

.. code-block:: html

    <div id="editor-loading" class="text-center">
        <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading editor...</span>
        </div>
    </div>

Next Steps
----------

* :doc:`../customization` - Advanced customization
* :doc:`../examples/basic` - Complete template examples
* :doc:`../themes` - Theming and styling
* :doc:`../security` - Security considerations
