Fields API Reference
====================

This section documents the field classes provided by Martor for use in Django models and forms.

.. currentmodule:: martor

MartorField (Model Field)
-------------------------

.. autoclass:: martor.models.MartorField
   :members:
   :show-inheritance:

The ``MartorField`` is a specialized Django model field that stores markdown content and provides rich editing capabilities in forms and admin interfaces.

**Inheritance Hierarchy:**

* :class:`django.db.models.TextField`
  
  * :class:`martor.models.MartorField`

**Key Features:**

* Stores raw markdown text in the database
* Automatically uses ``MartorWidget`` in forms
* Seamless integration with Django Admin
* Full TextField compatibility

**Parameters:**

All standard :class:`django.db.models.TextField` parameters are supported:

* ``max_length`` (int, optional): Maximum length of the field
* ``blank`` (bool): Whether the field can be blank in forms
* ``null`` (bool): Whether the field can be NULL in the database
* ``default``: Default value for the field
* ``verbose_name`` (str): Human-readable name for the field
* ``help_text`` (str): Help text for forms

**Example Usage:**

.. code-block:: python

    from django.db import models
    from martor.models import MartorField

    class BlogPost(models.Model):
        title = models.CharField(max_length=200)
        content = MartorField(
            verbose_name="Post Content",
            help_text="Write your blog post using Markdown syntax",
            blank=False
        )
        created_at = models.DateTimeField(auto_now_add=True)

**Database Representation:**

The field stores markdown text as-is in the database. No HTML conversion is performed at the model level.

.. code-block:: python

    post = BlogPost.objects.create(
        title="Example Post",
        content="# Heading\n\nThis is **bold** text."
    )
    
    print(post.content)
    # Output: "# Heading\n\nThis is **bold** text."

MartorFormField (Form Field)
----------------------------

.. autoclass:: martor.fields.MartorFormField
   :members:
   :show-inheritance:

The ``MartorFormField`` provides rich markdown editing in Django forms.

**Inheritance Hierarchy:**

* :class:`django.forms.CharField`
  
  * :class:`martor.fields.MartorFormField`

**Key Features:**

* Rich markdown editor widget
* Client-side preview functionality
* Configurable toolbar and features
* Validation and error handling

**Parameters:**

All standard :class:`django.forms.CharField` parameters are supported:

* ``max_length`` (int, optional): Maximum length validation
* ``min_length`` (int, optional): Minimum length validation
* ``required`` (bool): Whether the field is required
* ``label`` (str): Field label (can be disabled via settings)
* ``help_text`` (str): Help text displayed below the field
* ``initial``: Initial value for the field
* ``widget``: Custom widget (defaults to ``MartorWidget``)
* ``validators`` (list): List of validation functions

**Example Usage:**

.. code-block:: python

    from django import forms
    from martor.fields import MartorFormField

    class ArticleForm(forms.Form):
        title = forms.CharField(max_length=200)
        content = MartorFormField(
            label="Article Content",
            help_text="Use Markdown syntax for formatting",
            max_length=10000,
            required=True
        )

    # With custom widget configuration
    class CustomArticleForm(forms.Form):
        content = MartorFormField(
            widget=MartorWidget(attrs={
                'data-upload-url': '/custom-upload/',
                'placeholder': 'Start writing...'
            })
        )

**Validation:**

The field supports Django's standard validation mechanisms:

.. code-block:: python

    from django.core.exceptions import ValidationError

    def validate_word_count(value):
        word_count = len(value.split())
        if word_count < 10:
            raise ValidationError(f"Content must be at least 10 words. Current: {word_count}")

    class ValidatedForm(forms.Form):
        content = MartorFormField(
            validators=[validate_word_count],
            max_length=5000
        )

Field Configuration
-------------------

Both fields respect Martor's global configuration settings:

**Label Configuration:**

.. code-block:: python

    # settings.py
    MARTOR_ENABLE_LABEL = False  # Disables labels for MartorFormField

**Widget Behavior:**

The fields automatically use appropriate widgets:

* ``MartorField`` → ``MartorWidget`` in forms, ``AdminMartorWidget`` in admin
* ``MartorFormField`` → ``MartorWidget`` by default

**Custom Widget Assignment:**

.. code-block:: python

    from martor.widgets import MartorWidget

    # In forms
    class MyForm(forms.Form):
        content = MartorFormField(
            widget=MartorWidget(attrs={
                'rows': 20,
                'data-upload-url': '/upload/'
            })
        )

    # In ModelForm
    class MyModelForm(forms.ModelForm):
        class Meta:
            model = MyModel
            fields = ['content']
            widgets = {
                'content': MartorWidget(attrs={'rows': 15})
            }

Migration Considerations
------------------------

**Adding MartorField to Existing Models:**

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
                model_name='mymodel',
                name='content',
                field=MartorField(blank=True),
            ),
        ]

**Converting from TextField:**

Since ``MartorField`` inherits from ``TextField``, no data migration is needed:

.. code-block:: python

    # Before
    class MyModel(models.Model):
        content = models.TextField()

    # After - no migration required for data
    class MyModel(models.Model):
        content = MartorField()

Best Practices
--------------

**Model Field Usage:**

.. code-block:: python

    class Article(models.Model):
        content = MartorField(
            verbose_name="Article Content",
            help_text="Write your article using Markdown syntax",
            blank=False,  # Required field
            # Don't use null=True unless you need three-state logic
        )

**Form Field Usage:**

.. code-block:: python

    class ArticleForm(forms.ModelForm):
        # Override to add custom validation
        def clean_content(self):
            content = self.cleaned_data['content']
            if len(content.split()) < 50:
                raise ValidationError("Article must be at least 50 words.")
            return content

**Performance Considerations:**

.. code-block:: python

    # For large content, consider indexing
    class Article(models.Model):
        content = MartorField(db_index=True)  # For search
        
        class Meta:
            indexes = [
                models.Index(fields=['content']),  # Full-text search
            ]

Common Patterns
---------------

**Optional Content Field:**

.. code-block:: python

    class UserProfile(models.Model):
        bio = MartorField(
            blank=True,
            verbose_name="Biography",
            help_text="Tell us about yourself"
        )

**Required Content with Validation:**

.. code-block:: python

    def validate_markdown_structure(value):
        if not value.startswith('#'):
            raise ValidationError("Content must start with a heading.")

    class Documentation(models.Model):
        content = MartorField(
            validators=[validate_markdown_structure],
            verbose_name="Documentation Content"
        )

**Multi-language Content:**

.. code-block:: python

    # With django-modeltranslation
    class Article(models.Model):
        title = models.CharField(max_length=200)
        content = MartorField()
        
        class Meta:
            translate = ('title', 'content')

See Also
--------

* :doc:`widgets` - Widget API reference
* :doc:`../usage/models` - Using fields in models
* :doc:`../usage/forms` - Using fields in forms
