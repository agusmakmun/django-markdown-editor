Using Martor with Models
========================

Martor provides ``MartorField`` - a specialized model field that stores markdown content and provides a rich editing interface.

Basic Model Usage
-----------------

The simplest way to add markdown editing to your models:

.. code-block:: python

    from django.db import models
    from martor.models import MartorField

    class Article(models.Model):
        title = models.CharField(max_length=200)
        content = MartorField()
        created_at = models.DateTimeField(auto_now_add=True)
        
        def __str__(self):
            return self.title

The ``MartorField`` is essentially a ``TextField`` with additional functionality:

* Automatically uses ``MartorWidget`` in forms
* Stores raw markdown text in the database
* Provides rich editing interface in admin and forms

Field Options
-------------

``MartorField`` accepts all standard ``TextField`` options:

.. code-block:: python

    class Post(models.Model):
        content = MartorField(
            verbose_name="Post Content",
            help_text="Write your post content in Markdown",
            blank=True,
            null=True,
            max_length=10000,  # Optional length limit
        )

Common Field Parameters
~~~~~~~~~~~~~~~~~~~~~~~

* **verbose_name**: Human-readable field name
* **help_text**: Help text shown in forms
* **blank**: Allow empty values in forms (default: False)
* **null**: Allow NULL in database (default: False)
* **max_length**: Maximum character length (optional)
* **default**: Default value for new objects

Database Storage
----------------

``MartorField`` stores the raw markdown text in the database:

.. code-block:: python

    # What gets stored in the database
    article = Article.objects.create(
        title="My Article",
        content="# Heading\n\nThis is **bold** text."
    )
    
    print(article.content)
    # Output: "# Heading\n\nThis is **bold** text."

To render the markdown as HTML in templates, use the ``safe_markdown`` template filter:

.. code-block:: html

    {% load martortags %}
    {{ article.content|safe_markdown }}

Advanced Model Examples
-----------------------

Blog Post Model
~~~~~~~~~~~~~~~

.. code-block:: python

    from django.db import models
    from django.utils.text import slugify
    from django.urls import reverse
    from martor.models import MartorField

    class BlogPost(models.Model):
        title = models.CharField(max_length=200)
        slug = models.SlugField(unique=True, blank=True)
        excerpt = models.TextField(
            max_length=500,
            help_text="Brief description of the post"
        )
        content = MartorField(verbose_name="Post Content")
        
        # Publishing
        published = models.BooleanField(default=False)
        featured = models.BooleanField(default=False)
        
        # Timestamps
        created_at = models.DateTimeField(auto_now_add=True)
        updated_at = models.DateTimeField(auto_now=True)
        
        # SEO
        meta_description = models.CharField(
            max_length=160, 
            blank=True,
            help_text="SEO meta description"
        )
        
        class Meta:
            ordering = ['-created_at']
            verbose_name = "Blog Post"
            verbose_name_plural = "Blog Posts"
        
        def __str__(self):
            return self.title
        
        def save(self, *args, **kwargs):
            if not self.slug:
                self.slug = slugify(self.title)
            super().save(*args, **kwargs)
        
        def get_absolute_url(self):
            return reverse('blog:post_detail', kwargs={'slug': self.slug})

Documentation Page Model
~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: python

    class Documentation(models.Model):
        title = models.CharField(max_length=200)
        section = models.CharField(max_length=100)
        order = models.PositiveIntegerField(default=0)
        content = MartorField()
        
        # Versioning
        version = models.CharField(max_length=20, default="1.0")
        
        # Access control
        is_public = models.BooleanField(default=True)
        requires_auth = models.BooleanField(default=False)
        
        # Metadata
        last_updated = models.DateTimeField(auto_now=True)
        word_count = models.PositiveIntegerField(default=0)
        
        class Meta:
            ordering = ['section', 'order']
            unique_together = [['section', 'order', 'version']]
        
        def save(self, *args, **kwargs):
            # Auto-calculate word count
            import re
            text = re.sub(r'[^\w\s]', '', self.content)
            self.word_count = len(text.split())
            super().save(*args, **kwargs)

User Profile with Bio
~~~~~~~~~~~~~~~~~~~~~

.. code-block:: python

    from django.contrib.auth.models import User

    class UserProfile(models.Model):
        user = models.OneToOneField(User, on_delete=models.CASCADE)
        bio = MartorField(
            blank=True,
            verbose_name="Biography",
            help_text="Tell us about yourself (Markdown supported)"
        )
        website = models.URLField(blank=True)
        location = models.CharField(max_length=100, blank=True)
        
        def __str__(self):
            return f"{self.user.username}'s Profile"

Working with Multiple Fields
----------------------------

You can use multiple ``MartorField`` instances in the same model:

.. code-block:: python

    class Product(models.Model):
        name = models.CharField(max_length=200)
        short_description = models.TextField(max_length=300)
        
        # Multiple markdown fields
        description = MartorField(
            verbose_name="Product Description",
            help_text="Detailed product description"
        )
        specifications = MartorField(
            verbose_name="Technical Specifications",
            help_text="Technical details and specifications"
        )
        usage_instructions = MartorField(
            verbose_name="Usage Instructions",
            help_text="How to use this product"
        )
        
        price = models.DecimalField(max_digits=10, decimal_places=2)

Form Integration
----------------

``MartorField`` automatically provides the rich editor in forms:

.. code-block:: python

    from django import forms
    from .models import BlogPost

    class BlogPostForm(forms.ModelForm):
        class Meta:
            model = BlogPost
            fields = ['title', 'excerpt', 'content', 'published']
            # MartorField automatically uses MartorWidget

For custom form field behavior, override the widget:

.. code-block:: python

    from martor.widgets import MartorWidget

    class BlogPostForm(forms.ModelForm):
        class Meta:
            model = BlogPost
            fields = ['title', 'content']
            widgets = {
                'content': MartorWidget(attrs={
                    'data-upload-url': '/custom-upload/',
                    'data-search-users-url': '/custom-user-search/',
                }),
            }

Querying Markdown Content
-------------------------

You can query markdown content like any text field:

.. code-block:: python

    # Search for posts containing specific text
    posts = BlogPost.objects.filter(content__icontains='django')
    
    # Case-insensitive search
    posts = BlogPost.objects.filter(content__icontains='Django')
    
    # Search in title or content
    posts = BlogPost.objects.filter(
        models.Q(title__icontains='tutorial') |
        models.Q(content__icontains='tutorial')
    )
    
    # Find posts with specific markdown syntax
    posts = BlogPost.objects.filter(content__contains='```python')

Template Usage
--------------

Display markdown content in templates using the ``safe_markdown`` filter:

.. code-block:: html

    {% load martortags %}
    
    <article>
        <h1>{{ post.title }}</h1>
        <div class="post-content">
            {{ post.content|safe_markdown }}
        </div>
    </article>

With additional CSS for better rendering:

.. code-block:: html

    {% load static %}
    {% load martortags %}
    
    {% block css %}
        <link href="{% static 'plugins/css/highlight.min.css' %}" rel="stylesheet">
        <link href="{% static 'martor/css/martor.bootstrap.min.css' %}" rel="stylesheet">
    {% endblock %}
    
    <div class="martor-preview">
        {{ post.content|safe_markdown }}
    </div>
    
    {% block js %}
        <script src="{% static 'plugins/js/highlight.min.js' %}"></script>
        <script>
            document.querySelectorAll('pre code').forEach(function(block) {
                hljs.highlightBlock(block);
            });
        </script>
    {% endblock %}

Performance Considerations
--------------------------

Caching Rendered HTML
~~~~~~~~~~~~~~~~~~~~~~

For better performance, consider caching the rendered HTML:

.. code-block:: python

    from django.core.cache import cache
    from django.utils.html import mark_safe
    from martor.utils import markdownify

    class BlogPost(models.Model):
        content = MartorField()
        
        def get_html_content(self):
            cache_key = f"post_html_{self.pk}_{self.updated_at.timestamp()}"
            html_content = cache.get(cache_key)
            
            if html_content is None:
                html_content = markdownify(self.content)
                cache.set(cache_key, html_content, 3600)  # Cache for 1 hour
            
            return mark_safe(html_content)

Database Indexing
~~~~~~~~~~~~~~~~~

For text search performance, consider adding database indexes:

.. code-block:: python

    class BlogPost(models.Model):
        content = MartorField(db_index=True)  # Simple index
        
        class Meta:
            # Or use composite indexes
            indexes = [
                models.Index(fields=['published', 'created_at']),
                models.Index(fields=['title', 'content']),  # For search
            ]

Migration Considerations
------------------------

When adding ``MartorField`` to existing models:

.. code-block:: python

    # Migration example
    from django.db import migrations
    from martor.models import MartorField

    class Migration(migrations.Migration):
        dependencies = [
            ('myapp', '0001_initial'),
        ]

        operations = [
            migrations.AddField(
                model_name='blogpost',
                name='content',
                field=MartorField(blank=True),
            ),
        ]

Converting from TextField
~~~~~~~~~~~~~~~~~~~~~~~~~

If you're converting an existing ``TextField`` to ``MartorField``:

.. code-block:: python

    # Before
    class Post(models.Model):
        content = models.TextField()
    
    # After
    class Post(models.Model):
        content = MartorField()  # Data is preserved

The data is preserved since both fields store text in the database.

Best Practices
--------------

1. **Use descriptive verbose_name and help_text**:

.. code-block:: python

    content = MartorField(
        verbose_name="Article Content",
        help_text="Write your article content using Markdown syntax"
    )

2. **Consider field length limits for large content**:

.. code-block:: python

    # For very large content, consider using TextField with MartorWidget
    from martor.widgets import MartorWidget
    
    class Documentation(models.Model):
        content = models.TextField(widgets=MartorWidget)

3. **Use appropriate blank/null settings**:

.. code-block:: python

    # For optional content
    bio = MartorField(blank=True)
    
    # For required content (default)
    description = MartorField()

4. **Consider validation**:

.. code-block:: python

    from django.core.exceptions import ValidationError
    
    def validate_markdown_length(value):
        if len(value.split()) > 1000:
            raise ValidationError("Content must be less than 1000 words")
    
    class Post(models.Model):
        content = MartorField(validators=[validate_markdown_length])

Next Steps
----------

* :doc:`forms` - Using Martor in Django forms
* :doc:`widgets` - Customizing the Martor widget
* :doc:`admin` - Integrating with Django admin
* :doc:`../examples/basic` - Complete examples
