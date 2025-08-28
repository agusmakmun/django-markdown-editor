Quick Start Guide
=================

This guide will get you up and running with Martor in just a few minutes.

Basic Usage
-----------

Once you've completed the :doc:`installation`, you can start using Martor in your Django applications.

Using Martor in Models
~~~~~~~~~~~~~~~~~~~~~~

The simplest way to add markdown editing to your Django models:

.. code-block:: python

    # models.py
    from django.db import models
    from martor.models import MartorField

    class Post(models.Model):
        title = models.CharField(max_length=200)
        content = MartorField()  # This replaces TextField
        created_at = models.DateTimeField(auto_now_add=True)
        
        def __str__(self):
            return self.title

The ``MartorField`` automatically provides:

* Rich markdown editing interface
* Live preview
* Toolbar with formatting options
* Image upload capabilities (when configured)

Using Martor in Forms
~~~~~~~~~~~~~~~~~~~~~

For custom forms, use ``MartorFormField``:

.. code-block:: python

    # forms.py
    from django import forms
    from martor.fields import MartorFormField

    class PostForm(forms.Form):
        title = forms.CharField(max_length=200)
        content = MartorFormField()  # Martor field
        
    # Or with ModelForm
    class PostModelForm(forms.ModelForm):
        class Meta:
            model = Post
            fields = ['title', 'content']
            widgets = {
                'content': MartorWidget(),  # Optional: explicit widget
            }

Template Integration
~~~~~~~~~~~~~~~~~~~~

In your templates, you need to include the necessary CSS and JavaScript files.

**Template for forms (editing):**

.. code-block:: html

    <!-- post_form.html -->
    {% extends "base.html" %}
    {% load static %}

    {% block css %}
        <!-- Required CSS -->
        <link href="{% static 'plugins/css/ace.min.css' %}" rel="stylesheet" />
        <link href="{% static 'martor/css/martor.bootstrap.min.css' %}" rel="stylesheet" />
    {% endblock %}

    {% block content %}
        <div class="container">
            <h2>Create Post</h2>
            <form method="post">
                {% csrf_token %}
                <div class="form-group">
                    <label for="{{ form.title.id_for_label }}">Title:</label>
                    {{ form.title }}
                </div>
                <div class="form-group">
                    <label for="{{ form.content.id_for_label }}">Content:</label>
                    {{ form.content }}
                </div>
                <button type="submit" class="btn btn-success">Save Post</button>
            </form>
        </div>
    {% endblock %}

    {% block js %}
        <!-- Required JavaScript -->
        <script src="{% static 'plugins/js/ace.js' %}"></script>
        <script src="{% static 'plugins/js/mode-markdown.js' %}"></script>
        <script src="{% static 'plugins/js/ext-language_tools.js' %}"></script>
        <script src="{% static 'plugins/js/theme-github.js' %}"></script>
        <script src="{% static 'plugins/js/highlight.min.js' %}"></script>
        <script src="{% static 'plugins/js/emojis.min.js' %}"></script>
        <script src="{% static 'martor/js/martor.bootstrap.min.js' %}"></script>
    {% endblock %}

**Template for rendering markdown (display):**

.. code-block:: html

    <!-- post_detail.html -->
    {% extends "base.html" %}
    {% load static %}
    {% load martortags %}

    {% block css %}
        <!-- For syntax highlighting in rendered content -->
        <link href="{% static 'plugins/css/highlight.min.css' %}" rel="stylesheet" />
        <link href="{% static 'martor/css/martor.bootstrap.min.css' %}" rel="stylesheet" />
    {% endblock %}

    {% block content %}
        <div class="container">
            <article class="martor-preview">
                <h1>{{ post.title }}</h1>
                <div class="content">
                    {{ post.content|safe_markdown }}  <!-- Convert markdown to HTML -->
                </div>
            </article>
        </div>
    {% endblock %}

    {% block js %}
        <!-- For syntax highlighting -->
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

Django Admin Integration
~~~~~~~~~~~~~~~~~~~~~~~~

Martor seamlessly integrates with Django Admin:

.. code-block:: python

    # admin.py
    from django.contrib import admin
    from django.db import models
    from martor.widgets import AdminMartorWidget
    from .models import Post

    @admin.register(Post)
    class PostAdmin(admin.ModelAdmin):
        list_display = ['title', 'created_at']
        
        # Use Martor widget for TextField in admin
        formfield_overrides = {
            models.TextField: {'widget': AdminMartorWidget},
        }

Complete Example
----------------

Here's a complete working example:

**models.py:**

.. code-block:: python

    from django.db import models
    from django.urls import reverse
    from martor.models import MartorField

    class BlogPost(models.Model):
        title = models.CharField(max_length=200)
        slug = models.SlugField(unique=True)
        content = MartorField()
        published = models.BooleanField(default=False)
        created_at = models.DateTimeField(auto_now_add=True)
        updated_at = models.DateTimeField(auto_now=True)
        
        class Meta:
            ordering = ['-created_at']
        
        def __str__(self):
            return self.title
        
        def get_absolute_url(self):
            return reverse('blog:post_detail', kwargs={'slug': self.slug})

**forms.py:**

.. code-block:: python

    from django import forms
    from martor.fields import MartorFormField
    from .models import BlogPost

    class BlogPostForm(forms.ModelForm):
        content = MartorFormField()
        
        class Meta:
            model = BlogPost
            fields = ['title', 'slug', 'content', 'published']
            widgets = {
                'title': forms.TextInput(attrs={'class': 'form-control'}),
                'slug': forms.TextInput(attrs={'class': 'form-control'}),
            }

**views.py:**

.. code-block:: python

    from django.shortcuts import render, get_object_or_404, redirect
    from django.contrib import messages
    from .models import BlogPost
    from .forms import BlogPostForm

    def post_create(request):
        if request.method == 'POST':
            form = BlogPostForm(request.POST)
            if form.is_valid():
                post = form.save()
                messages.success(request, 'Post created successfully!')
                return redirect(post.get_absolute_url())
        else:
            form = BlogPostForm()
        
        return render(request, 'blog/post_form.html', {'form': form})

    def post_detail(request, slug):
        post = get_object_or_404(BlogPost, slug=slug, published=True)
        return render(request, 'blog/post_detail.html', {'post': post})

**urls.py:**

.. code-block:: python

    from django.urls import path
    from . import views

    app_name = 'blog'
    urlpatterns = [
        path('create/', views.post_create, name='post_create'),
        path('<slug:slug>/', views.post_detail, name='post_detail'),
    ]

Testing Your Setup
-------------------

1. **Run migrations** (if you added the model):

.. code-block:: bash

    python manage.py makemigrations
    python manage.py migrate

2. **Start the development server**:

.. code-block:: bash

    python manage.py runserver

3. **Navigate to your form** and test:

   * Type some markdown text
   * Use the toolbar buttons
   * Check the live preview
   * Try uploading an image (if imgur is configured)

Common Markdown Syntax
----------------------

Here are some common markdown patterns you can use:

.. code-block:: markdown

    # Heading 1
    ## Heading 2
    ### Heading 3

    **Bold text**
    *Italic text*
    ~~Strikethrough~~
    ++Underline++ (custom extension)

    - Bullet list item 1
    - Bullet list item 2

    1. Numbered list item 1
    2. Numbered list item 2

    [Link text](https://example.com)
    ![Alt text](image-url.jpg)

    `Inline code`

    ```python
    # Code block with syntax highlighting
    def hello_world():
        print("Hello, World!")
    ```

    > Blockquote text

    | Table | Header |
    |-------|--------|
    | Cell  | Cell   |

    :smile: :heart: :thumbsup: (emoji support)

    @[username] (user mentions, if enabled)

    # Custom ID {#custom-id}

Next Steps
----------

Now that you have Martor working, explore these advanced features:

* :doc:`settings` - Complete configuration options
* :doc:`usage/widgets` - Customizing the editor widget  
* :doc:`examples/custom-uploader` - Setting up custom image upload
* :doc:`extensions/index` - Understanding Martor's markdown extensions
* :doc:`themes` - Customizing the appearance
