Using Martor with Forms
=======================

Martor provides ``MartorFormField`` for use in Django forms, offering a rich markdown editing experience in any form context.

Basic Form Usage
----------------

The simplest way to add markdown editing to forms:

.. code-block:: python

    from django import forms
    from martor.fields import MartorFormField

    class PostForm(forms.Form):
        title = forms.CharField(max_length=200)
        content = MartorFormField()

    class ContactForm(forms.Form):
        name = forms.CharField(max_length=100)
        email = forms.EmailField()
        message = MartorFormField(label="Your Message")

ModelForm Integration
---------------------

With ModelForms, you can use either approach:

**Approach 1: Automatic (Recommended)**

If your model uses ``MartorField``, the form automatically uses ``MartorFormField``:

.. code-block:: python

    from django import forms
    from .models import BlogPost  # Assuming BlogPost.content is MartorField

    class BlogPostForm(forms.ModelForm):
        class Meta:
            model = BlogPost
            fields = ['title', 'content', 'published']
            # MartorField automatically becomes MartorFormField

**Approach 2: Explicit Widget**

For regular TextFields, explicitly specify the widget:

.. code-block:: python

    from django import forms
    from martor.widgets import MartorWidget
    from .models import Article

    class ArticleForm(forms.ModelForm):
        class Meta:
            model = Article
            fields = ['title', 'content']
            widgets = {
                'content': MartorWidget(),
            }

Form Field Options
------------------

``MartorFormField`` accepts all standard ``CharField`` parameters:

.. code-block:: python

    class DocumentForm(forms.Form):
        content = MartorFormField(
            label="Document Content",
            help_text="Use Markdown syntax for formatting",
            required=True,
            max_length=5000,
            initial="# Document Title\n\nStart writing here...",
            widget=MartorWidget(attrs={
                'data-upload-url': '/custom-upload/',
                'placeholder': 'Start typing your content...'
            })
        )

Common Field Parameters
~~~~~~~~~~~~~~~~~~~~~~~

* **label**: Field label displayed in forms
* **help_text**: Help text shown below the field
* **required**: Whether the field is required (default: True)
* **max_length**: Maximum character length
* **min_length**: Minimum character length
* **initial**: Default value for the field
* **widget**: Custom widget instance (usually ``MartorWidget``)

Advanced Form Examples
----------------------

Multi-Field Form
~~~~~~~~~~~~~~~~

.. code-block:: python

    from django import forms
    from martor.fields import MartorFormField

    class BookForm(forms.Form):
        title = forms.CharField(max_length=200)
        author = forms.CharField(max_length=100)
        isbn = forms.CharField(max_length=20)
        
        # Multiple markdown fields
        summary = MartorFormField(
            label="Book Summary",
            help_text="Brief overview of the book"
        )
        description = MartorFormField(
            label="Detailed Description",
            help_text="Full description with chapters, themes, etc."
        )
        author_bio = MartorFormField(
            label="Author Biography",
            required=False
        )

Form with Custom Validation
~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: python

    import re
    from django import forms
    from django.core.exceptions import ValidationError
    from martor.fields import MartorFormField

    class ArticleForm(forms.Form):
        title = forms.CharField(max_length=200)
        content = MartorFormField()

        def clean_content(self):
            content = self.cleaned_data['content']
            
            # Custom validation: require at least one heading
            if not re.search(r'^#{1,6}\s+', content, re.MULTILINE):
                raise ValidationError("Content must include at least one heading.")
            
            # Word count validation
            word_count = len(content.split())
            if word_count < 100:
                raise ValidationError("Content must be at least 100 words.")
            
            return content

        def clean(self):
            cleaned_data = super().clean()
            title = cleaned_data.get('title')
            content = cleaned_data.get('content')
            
            # Cross-field validation
            if title and content and title.lower() not in content.lower():
                raise ValidationError("The title should be mentioned in the content.")
            
            return cleaned_data

Dynamic Forms
~~~~~~~~~~~~~

.. code-block:: python

    class DynamicContentForm(forms.Form):
        def __init__(self, *args, content_fields=None, **kwargs):
            super().__init__(*args, **kwargs)
            
            # Dynamically add MartorFormFields
            if content_fields:
                for field_name, field_config in content_fields.items():
                    self.fields[field_name] = MartorFormField(
                        label=field_config.get('label', field_name.title()),
                        required=field_config.get('required', True),
                        help_text=field_config.get('help_text', ''),
                    )

    # Usage
    form = DynamicContentForm(content_fields={
        'introduction': {'label': 'Introduction', 'required': True},
        'conclusion': {'label': 'Conclusion', 'required': False},
    })

Form Rendering in Templates
---------------------------

Basic Template
~~~~~~~~~~~~~~

.. code-block:: html

    <!-- form.html -->
    {% extends "base.html" %}
    {% load static %}

    {% block css %}
        <!-- Required CSS for Martor -->
        <link href="{% static 'plugins/css/ace.min.css' %}" rel="stylesheet">
        <link href="{% static 'martor/css/martor.bootstrap.min.css' %}" rel="stylesheet">
    {% endblock %}

    {% block content %}
    <div class="container">
        <h2>Create Post</h2>
        <form method="post">
            {% csrf_token %}
            
            <!-- Regular form fields -->
            <div class="form-group">
                {{ form.title.label_tag }}
                {{ form.title }}
                {% if form.title.errors %}
                    <div class="text-danger">{{ form.title.errors }}</div>
                {% endif %}
            </div>
            
            <!-- Martor field -->
            <div class="form-group">
                {{ form.content.label_tag }}
                {{ form.content }}
                {% if form.content.help_text %}
                    <small class="form-text text-muted">{{ form.content.help_text }}</small>
                {% endif %}
                {% if form.content.errors %}
                    <div class="text-danger">{{ form.content.errors }}</div>
                {% endif %}
            </div>
            
            <button type="submit" class="btn btn-primary">Save</button>
        </form>
    </div>
    {% endblock %}

    {% block js %}
        <!-- Required JavaScript for Martor -->
        <script src="{% static 'plugins/js/ace.js' %}"></script>
        <script src="{% static 'plugins/js/mode-markdown.js' %}"></script>
        <script src="{% static 'plugins/js/ext-language_tools.js' %}"></script>
        <script src="{% static 'plugins/js/theme-github.js' %}"></script>
        <script src="{% static 'plugins/js/highlight.min.js' %}"></script>
        <script src="{% static 'plugins/js/emojis.min.js' %}"></script>
        <script src="{% static 'martor/js/martor.bootstrap.min.js' %}"></script>
    {% endblock %}

Bootstrap Styled Form
~~~~~~~~~~~~~~~~~~~~~

.. code-block:: html

    <!-- bootstrap_form.html -->
    {% extends "base.html" %}
    {% load static %}

    {% block css %}
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
        <link href="{% static 'plugins/css/ace.min.css' %}" rel="stylesheet">
        <link href="{% static 'martor/css/martor.bootstrap.min.css' %}" rel="stylesheet">
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
                            
                            {% for field in form %}
                                <div class="mb-3">
                                    {{ field.label_tag }}
                                    {% if field.name == 'content' %}
                                        {{ field }}
                                    {% else %}
                                        {{ field|add_class:"form-control" }}
                                    {% endif %}
                                    
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
                            {% endfor %}
                            
                            <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save"></i> Save Post
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
    {% endblock %}

    {% block js %}
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
        <script src="{% static 'plugins/js/ace.js' %}"></script>
        <script src="{% static 'plugins/js/mode-markdown.js' %}"></script>
        <script src="{% static 'plugins/js/ext-language_tools.js' %}"></script>
        <script src="{% static 'plugins/js/theme-github.js' %}"></script>
        <script src="{% static 'plugins/js/highlight.min.js' %}"></script>
        <script src="{% static 'plugins/js/emojis.min.js' %}"></script>
        <script src="{% static 'martor/js/martor.bootstrap.min.js' %}"></script>
    {% endblock %}

Form Views
----------

Function-Based Views
~~~~~~~~~~~~~~~~~~~~~

.. code-block:: python

    from django.shortcuts import render, redirect
    from django.contrib import messages
    from .forms import PostForm

    def create_post(request):
        if request.method == 'POST':
            form = PostForm(request.POST)
            if form.is_valid():
                # Process the form data
                title = form.cleaned_data['title']
                content = form.cleaned_data['content']
                
                # Save to database, send email, etc.
                # ...
                
                messages.success(request, 'Post created successfully!')
                return redirect('post_list')
        else:
            form = PostForm()
        
        return render(request, 'create_post.html', {'form': form})

Class-Based Views
~~~~~~~~~~~~~~~~~

.. code-block:: python

    from django.views.generic import CreateView, UpdateView
    from django.contrib.messages.views import SuccessMessageMixin
    from .models import BlogPost
    from .forms import BlogPostForm

    class PostCreateView(SuccessMessageMixin, CreateView):
        model = BlogPost
        form_class = BlogPostForm
        template_name = 'blog/post_form.html'
        success_message = "Post was created successfully!"
        
        def form_valid(self, form):
            form.instance.author = self.request.user
            return super().form_valid(form)

    class PostUpdateView(SuccessMessageMixin, UpdateView):
        model = BlogPost
        form_class = BlogPostForm
        template_name = 'blog/post_form.html'
        success_message = "Post was updated successfully!"

AJAX Form Handling
------------------

For dynamic form submission without page reload:

.. code-block:: html

    <!-- ajax_form.html -->
    <form id="post-form" method="post">
        {% csrf_token %}
        {{ form.as_p }}
        <button type="submit">Save</button>
    </form>

    <script>
    document.getElementById('post-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        
        fetch(this.action || window.location.pathname, {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Post saved successfully!');
            } else {
                // Handle form errors
                console.log(data.errors);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
    </script>

Corresponding view:

.. code-block:: python

    import json
    from django.http import JsonResponse
    from django.views.decorators.csrf import csrf_exempt
    from django.utils.decorators import method_decorator
    from django.views import View

    @method_decorator(csrf_exempt, name='dispatch')
    class AjaxPostView(View):
        def post(self, request):
            form = PostForm(request.POST)
            
            if form.is_valid():
                # Process form data
                return JsonResponse({'success': True})
            else:
                return JsonResponse({
                    'success': False,
                    'errors': form.errors
                })

Custom Field Widgets
---------------------

Customizing Martor widget attributes:

.. code-block:: python

    from django import forms
    from martor.fields import MartorFormField
    from martor.widgets import MartorWidget

    class CustomizedForm(forms.Form):
        content = MartorFormField(
            widget=MartorWidget(attrs={
                'data-upload-url': '/my-custom-upload/',
                'data-search-users-url': '/my-user-search/',
                'data-base-emoji-url': 'https://example.com/emojis/',
                'placeholder': 'Start writing your amazing content...',
                'rows': 20,  # Editor height
                'class': 'my-custom-class',
            })
        )

Form Validation
---------------

Built-in Validation
~~~~~~~~~~~~~~~~~~~

.. code-block:: python

    from django import forms
    from martor.fields import MartorFormField

    class ValidatedForm(forms.Form):
        content = MartorFormField(
            max_length=5000,  # Maximum character limit
            min_length=100,   # Minimum character limit
            required=True,    # Field is required
        )

Custom Validation
~~~~~~~~~~~~~~~~~

.. code-block:: python

    import re
    from django.core.exceptions import ValidationError

    def validate_no_html(value):
        """Ensure no HTML tags are present"""
        if re.search(r'<[^>]+>', value):
            raise ValidationError("HTML tags are not allowed.")

    def validate_word_count(value):
        """Validate minimum word count"""
        word_count = len(value.split())
        if word_count < 50:
            raise ValidationError(f"Content must be at least 50 words. Current: {word_count}")

    class ValidatedPostForm(forms.Form):
        content = MartorFormField(
            validators=[validate_no_html, validate_word_count]
        )

Error Handling
--------------

Display form errors elegantly:

.. code-block:: html

    <!-- error_handling.html -->
    {% if form.non_field_errors %}
        <div class="alert alert-danger">
            {% for error in form.non_field_errors %}
                <p>{{ error }}</p>
            {% endfor %}
        </div>
    {% endif %}

    {% for field in form %}
        <div class="form-group">
            {{ field.label_tag }}
            {{ field }}
            
            {% if field.errors %}
                <div class="invalid-feedback d-block">
                    {% for error in field.errors %}
                        {{ error }}
                    {% endfor %}
                </div>
            {% endif %}
        </div>
    {% endfor %}

Best Practices
--------------

1. **Always include required static files**:

.. code-block:: html

    <!-- Minimum required files -->
    <link href="{% static 'plugins/css/ace.min.css' %}" rel="stylesheet">
    <link href="{% static 'martor/css/martor.bootstrap.min.css' %}" rel="stylesheet">

    <script src="{% static 'plugins/js/ace.js' %}"></script>
    <script src="{% static 'martor/js/martor.bootstrap.min.js' %}"></script>

2. **Use proper form structure**:

.. code-block:: python

    class PostForm(forms.ModelForm):
        class Meta:
            model = Post
            fields = ['title', 'content']
            widgets = {
                'title': forms.TextInput(attrs={'class': 'form-control'}),
                # content automatically gets MartorWidget
            }

3. **Handle form validation gracefully**:

.. code-block:: python

    def clean_content(self):
        content = self.cleaned_data['content']
        # Add your validation logic
        return content

4. **Provide helpful help_text**:

.. code-block:: python

    content = MartorFormField(
        help_text="Use **bold** for emphasis, # for headings, and [link](url) for links"
    )

Next Steps
----------

* :doc:`widgets` - Customizing the Martor widget
* :doc:`admin` - Using Martor in Django Admin
* :doc:`../examples/basic` - Complete form examples
* :doc:`../customization` - Advanced customization options
