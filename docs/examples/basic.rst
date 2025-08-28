Basic Examples
==============

This page provides complete, working examples of Martor integration. You can copy and adapt these examples for your own projects.

Simple Blog Application
-----------------------

Here's a complete blog application using Martor:

Models
~~~~~~

.. code-block:: python

    # blog/models.py
    from django.db import models
    from django.contrib.auth.models import User
    from django.urls import reverse
    from django.utils.text import slugify
    from martor.models import MartorField

    class Category(models.Model):
        name = models.CharField(max_length=100)
        slug = models.SlugField(unique=True)
        description = models.TextField(blank=True)

        class Meta:
            verbose_name_plural = "Categories"

        def __str__(self):
            return self.name

    class Post(models.Model):
        title = models.CharField(max_length=200)
        slug = models.SlugField(unique=True, blank=True)
        author = models.ForeignKey(User, on_delete=models.CASCADE)
        category = models.ForeignKey(Category, on_delete=models.CASCADE)
        
        # Martor field for rich content editing
        content = MartorField(
            verbose_name="Post Content",
            help_text="Write your blog post using Markdown syntax"
        )
        
        excerpt = models.TextField(
            max_length=500,
            help_text="Brief description of the post"
        )
        
        # Publishing
        published = models.BooleanField(default=False)
        featured = models.BooleanField(default=False)
        
        # Timestamps
        created_at = models.DateTimeField(auto_now_add=True)
        updated_at = models.DateTimeField(auto_now=True)

        class Meta:
            ordering = ['-created_at']

        def __str__(self):
            return self.title

        def save(self, *args, **kwargs):
            if not self.slug:
                self.slug = slugify(self.title)
            super().save(*args, **kwargs)

        def get_absolute_url(self):
            return reverse('blog:post_detail', kwargs={'slug': self.slug})

Forms
~~~~~

.. code-block:: python

    # blog/forms.py
    from django import forms
    from django.core.exceptions import ValidationError
    from martor.fields import MartorFormField
    from .models import Post, Category

    class PostForm(forms.ModelForm):
        content = MartorFormField(
            help_text="Use Markdown syntax for formatting. You can upload images and use the toolbar for quick formatting."
        )

        class Meta:
            model = Post
            fields = ['title', 'category', 'excerpt', 'content', 'published', 'featured']
            widgets = {
                'title': forms.TextInput(attrs={'class': 'form-control'}),
                'excerpt': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
                'category': forms.Select(attrs={'class': 'form-control'}),
            }

        def clean_content(self):
            content = self.cleaned_data['content']
            
            # Ensure minimum word count
            word_count = len(content.split())
            if word_count < 50:
                raise ValidationError(f"Post content must be at least 50 words. Current: {word_count}")
            
            return content

        def clean_title(self):
            title = self.cleaned_data['title']
            
            # Check for unique title (excluding current instance)
            qs = Post.objects.filter(title__iexact=title)
            if self.instance.pk:
                qs = qs.exclude(pk=self.instance.pk)
            
            if qs.exists():
                raise ValidationError("A post with this title already exists.")
            
            return title

Views
~~~~~

.. code-block:: python

    # blog/views.py
    from django.shortcuts import render, get_object_or_404, redirect
    from django.contrib.auth.decorators import login_required
    from django.contrib import messages
    from django.core.paginator import Paginator
    from django.db.models import Q
    from .models import Post, Category
    from .forms import PostForm

    def post_list(request):
        posts = Post.objects.filter(published=True).select_related('author', 'category')
        
        # Search functionality
        query = request.GET.get('q')
        if query:
            posts = posts.filter(
                Q(title__icontains=query) | 
                Q(content__icontains=query) |
                Q(excerpt__icontains=query)
            )
        
        # Category filter
        category_slug = request.GET.get('category')
        if category_slug:
            posts = posts.filter(category__slug=category_slug)
        
        # Pagination
        paginator = Paginator(posts, 10)
        page_number = request.GET.get('page')
        page_obj = paginator.get_page(page_number)
        
        categories = Category.objects.all()
        
        context = {
            'page_obj': page_obj,
            'categories': categories,
            'query': query,
            'current_category': category_slug,
        }
        return render(request, 'blog/post_list.html', context)

    def post_detail(request, slug):
        post = get_object_or_404(Post, slug=slug, published=True)
        
        # Get related posts
        related_posts = Post.objects.filter(
            category=post.category, 
            published=True
        ).exclude(id=post.id)[:3]
        
        context = {
            'post': post,
            'related_posts': related_posts,
        }
        return render(request, 'blog/post_detail.html', context)

    @login_required
    def post_create(request):
        if request.method == 'POST':
            form = PostForm(request.POST)
            if form.is_valid():
                post = form.save(commit=False)
                post.author = request.user
                post.save()
                messages.success(request, 'Post created successfully!')
                return redirect(post.get_absolute_url())
        else:
            form = PostForm()
        
        context = {'form': form, 'title': 'Create New Post'}
        return render(request, 'blog/post_form.html', context)

    @login_required
    def post_edit(request, slug):
        post = get_object_or_404(Post, slug=slug, author=request.user)
        
        if request.method == 'POST':
            form = PostForm(request.POST, instance=post)
            if form.is_valid():
                form.save()
                messages.success(request, 'Post updated successfully!')
                return redirect(post.get_absolute_url())
        else:
            form = PostForm(instance=post)
        
        context = {'form': form, 'post': post, 'title': 'Edit Post'}
        return render(request, 'blog/post_form.html', context)

Templates
~~~~~~~~~

**Base Template:**

.. code-block:: html

    <!-- blog/templates/blog/base.html -->
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>{% block title %}Blog{% endblock %}</title>
        
        <!-- Bootstrap CSS -->
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
        
        {% block css %}{% endblock %}
    </head>
    <body>
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
            <div class="container">
                <a class="navbar-brand" href="{% url 'blog:post_list' %}">My Blog</a>
                <div class="navbar-nav ms-auto">
                    {% if user.is_authenticated %}
                        <a class="nav-link" href="{% url 'blog:post_create' %}">Write Post</a>
                        <a class="nav-link" href="{% url 'admin:index' %}">Admin</a>
                        <a class="nav-link" href="{% url 'logout' %}">Logout</a>
                    {% else %}
                        <a class="nav-link" href="{% url 'login' %}">Login</a>
                    {% endif %}
                </div>
            </div>
        </nav>

        <main class="container mt-4">
            {% if messages %}
                {% for message in messages %}
                    <div class="alert alert-{{ message.tags }} alert-dismissible fade show" role="alert">
                        {{ message }}
                        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                    </div>
                {% endfor %}
            {% endif %}

            {% block content %}{% endblock %}
        </main>

        <!-- Bootstrap JavaScript -->
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
        {% block js %}{% endblock %}
    </body>
    </html>

**Post Form Template:**

.. code-block:: html

    <!-- blog/templates/blog/post_form.html -->
    {% extends "blog/base.html" %}
    {% load static %}

    {% block title %}{{ title }}{% endblock %}

    {% block css %}
        <!-- Martor CSS -->
        <link href="{% static 'plugins/css/ace.min.css' %}" rel="stylesheet">
        <link href="{% static 'martor/css/martor.bootstrap.min.css' %}" rel="stylesheet">
    {% endblock %}

    {% block content %}
    <div class="row justify-content-center">
        <div class="col-lg-8">
            <div class="card">
                <div class="card-header">
                    <h3>{{ title }}</h3>
                </div>
                <div class="card-body">
                    <form method="post">
                        {% csrf_token %}
                        
                        {% if form.non_field_errors %}
                            <div class="alert alert-danger">
                                {% for error in form.non_field_errors %}
                                    <p>{{ error }}</p>
                                {% endfor %}
                            </div>
                        {% endif %}

                        <div class="row">
                            <div class="col-md-8">
                                <div class="mb-3">
                                    <label for="{{ form.title.id_for_label }}" class="form-label">Title *</label>
                                    {{ form.title }}
                                    {% if form.title.errors %}
                                        <div class="text-danger">
                                            {% for error in form.title.errors %}
                                                <small>{{ error }}</small>
                                            {% endfor %}
                                        </div>
                                    {% endif %}
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="mb-3">
                                    <label for="{{ form.category.id_for_label }}" class="form-label">Category *</label>
                                    {{ form.category }}
                                    {% if form.category.errors %}
                                        <div class="text-danger">
                                            {% for error in form.category.errors %}
                                                <small>{{ error }}</small>
                                            {% endfor %}
                                        </div>
                                    {% endif %}
                                </div>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label for="{{ form.excerpt.id_for_label }}" class="form-label">Excerpt *</label>
                            {{ form.excerpt }}
                            {% if form.excerpt.help_text %}
                                <div class="form-text">{{ form.excerpt.help_text }}</div>
                            {% endif %}
                            {% if form.excerpt.errors %}
                                <div class="text-danger">
                                    {% for error in form.excerpt.errors %}
                                        <small>{{ error }}</small>
                                    {% endfor %}
                                </div>
                            {% endif %}
                        </div>

                        <div class="mb-3">
                            <label for="{{ form.content.id_for_label }}" class="form-label">Content *</label>
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

                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-check">
                                    {{ form.published }}
                                    <label class="form-check-label" for="{{ form.published.id_for_label }}">
                                        Publish immediately
                                    </label>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-check">
                                    {{ form.featured }}
                                    <label class="form-check-label" for="{{ form.featured.id_for_label }}">
                                        Featured post
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div class="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
                            <a href="{% url 'blog:post_list' %}" class="btn btn-secondary">Cancel</a>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i> Save Post
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
    {% endblock %}

    {% block js %}
        <!-- Martor JavaScript -->
        <script src="{% static 'plugins/js/ace.js' %}"></script>
        <script src="{% static 'plugins/js/mode-markdown.js' %}"></script>
        <script src="{% static 'plugins/js/ext-language_tools.js' %}"></script>
        <script src="{% static 'plugins/js/theme-github.js' %}"></script>
        <script src="{% static 'plugins/js/highlight.min.js' %}"></script>
        <script src="{% static 'plugins/js/emojis.min.js' %}"></script>
        <script src="{% static 'martor/js/martor.bootstrap.min.js' %}"></script>
    {% endblock %}

**Post Detail Template:**

.. code-block:: html

    <!-- blog/templates/blog/post_detail.html -->
    {% extends "blog/base.html" %}
    {% load static %}
    {% load martortags %}

    {% block title %}{{ post.title }}{% endblock %}

    {% block css %}
        <!-- CSS for rendered markdown -->
        <link href="{% static 'plugins/css/highlight.min.css' %}" rel="stylesheet">
        <link href="{% static 'martor/css/martor.bootstrap.min.css' %}" rel="stylesheet">
        
        <style>
            .post-content {
                line-height: 1.7;
                font-size: 1.1rem;
            }
            
            .post-content img {
                max-width: 100%;
                height: auto;
                border-radius: 8px;
                margin: 1rem 0;
            }
            
            .post-meta {
                color: #6c757d;
                font-size: 0.9rem;
            }
        </style>
    {% endblock %}

    {% block content %}
    <div class="row">
        <div class="col-lg-8">
            <article>
                <header class="mb-4">
                    <h1 class="display-6">{{ post.title }}</h1>
                    <div class="post-meta mb-3">
                        <span class="badge bg-primary">{{ post.category.name }}</span>
                        <span class="text-muted ms-2">
                            By {{ post.author.get_full_name|default:post.author.username }}
                            on {{ post.created_at|date:"F d, Y" }}
                        </span>
                        {% if post.featured %}
                            <span class="badge bg-warning ms-2">Featured</span>
                        {% endif %}
                    </div>
                    <p class="lead">{{ post.excerpt }}</p>
                </header>

                <div class="post-content martor-preview">
                    {{ post.content|safe_markdown }}
                </div>

                <footer class="mt-5 pt-3 border-top">
                    <p class="text-muted">
                        Last updated: {{ post.updated_at|date:"F d, Y" }}
                    </p>
                    {% if user == post.author %}
                        <a href="{% url 'blog:post_edit' post.slug %}" class="btn btn-outline-primary btn-sm">
                            Edit Post
                        </a>
                    {% endif %}
                </footer>
            </article>
        </div>

        <aside class="col-lg-4">
            <div class="card">
                <div class="card-header">
                    <h5>Related Posts</h5>
                </div>
                <div class="card-body">
                    {% if related_posts %}
                        {% for related_post in related_posts %}
                            <div class="mb-3">
                                <h6>
                                    <a href="{{ related_post.get_absolute_url }}" class="text-decoration-none">
                                        {{ related_post.title }}
                                    </a>
                                </h6>
                                <small class="text-muted">{{ related_post.created_at|date:"M d, Y" }}</small>
                            </div>
                        {% endfor %}
                    {% else %}
                        <p class="text-muted">No related posts found.</p>
                    {% endif %}
                </div>
            </div>
        </aside>
    </div>
    {% endblock %}

    {% block js %}
        <!-- JavaScript for syntax highlighting -->
        <script src="{% static 'plugins/js/highlight.min.js' %}"></script>
        <script>
            document.addEventListener('DOMContentLoaded', function() {
                // Apply syntax highlighting to code blocks
                document.querySelectorAll('.martor-preview pre code').forEach(function(block) {
                    hljs.highlightBlock(block);
                });
            });
        </script>
    {% endblock %}

URLs
~~~~

.. code-block:: python

    # blog/urls.py
    from django.urls import path
    from . import views

    app_name = 'blog'

    urlpatterns = [
        path('', views.post_list, name='post_list'),
        path('create/', views.post_create, name='post_create'),
        path('<slug:slug>/', views.post_detail, name='post_detail'),
        path('<slug:slug>/edit/', views.post_edit, name='post_edit'),
    ]

**Project URLs:**

.. code-block:: python

    # myproject/urls.py
    from django.contrib import admin
    from django.urls import path, include
    from django.conf import settings
    from django.conf.urls.static import static

    urlpatterns = [
        path('admin/', admin.site.urls),
        path('martor/', include('martor.urls')),  # Required for Martor
        path('blog/', include('blog.urls')),
        path('', include('blog.urls')),  # Default to blog
    ]

    # Serve static files in development
    if settings.DEBUG:
        urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
        urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

Admin Configuration
~~~~~~~~~~~~~~~~~~~

.. code-block:: python

    # blog/admin.py
    from django.contrib import admin
    from django.db import models
    from martor.widgets import AdminMartorWidget
    from .models import Category, Post

    @admin.register(Category)
    class CategoryAdmin(admin.ModelAdmin):
        list_display = ['name', 'slug']
        prepopulated_fields = {'slug': ('name',)}

    @admin.register(Post)
    class PostAdmin(admin.ModelAdmin):
        list_display = ['title', 'author', 'category', 'published', 'featured', 'created_at']
        list_filter = ['published', 'featured', 'category', 'created_at']
        search_fields = ['title', 'content', 'excerpt']
        prepopulated_fields = {'slug': ('title',)}
        
        # Use Martor widget for content field
        formfield_overrides = {
            models.TextField: {'widget': AdminMartorWidget},
        }
        
        fieldsets = (
            ('Basic Information', {
                'fields': ('title', 'slug', 'author', 'category')
            }),
            ('Content', {
                'fields': ('excerpt', 'content'),
                'classes': ('wide',),
            }),
            ('Publishing', {
                'fields': ('published', 'featured'),
            }),
        )

        def save_model(self, request, obj, form, change):
            if not change:  # Creating new post
                obj.author = request.user
            super().save_model(request, obj, form, change)

Settings Configuration
~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: python

    # settings.py
    import os

    # ... other settings ...

    INSTALLED_APPS = [
        'django.contrib.admin',
        'django.contrib.auth',
        'django.contrib.contenttypes',
        'django.contrib.sessions',
        'django.contrib.messages',
        'django.contrib.staticfiles',
        
        # Third party apps
        'martor',
        
        # Local apps
        'blog',
    ]

    # Static files
    STATIC_URL = '/static/'
    STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

    # Media files
    MEDIA_URL = '/media/'
    MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

    # Martor settings
    MARTOR_THEME = 'bootstrap'
    MARTOR_ENABLE_CONFIGS = {
        'emoji': 'true',
        'imgur': 'true',
        'mention': 'false',
        'jquery': 'true',
        'living': 'true',
        'spellcheck': 'false',
        'hljs': 'true',
    }

    # Required for AJAX functionality
    CSRF_COOKIE_HTTPONLY = False

    # Optional: imgur configuration for image uploads
    MARTOR_IMGUR_CLIENT_ID = 'your-imgur-client-id'
    MARTOR_IMGUR_API_KEY = 'your-imgur-api-key'

Running the Example
~~~~~~~~~~~~~~~~~~~

1. **Create and run migrations:**

.. code-block:: bash

    python manage.py makemigrations blog
    python manage.py migrate

2. **Create a superuser:**

.. code-block:: bash

    python manage.py createsuperuser

3. **Collect static files:**

.. code-block:: bash

    python manage.py collectstatic

4. **Run the development server:**

.. code-block:: bash

    python manage.py runserver

5. **Access the application:**

   - Visit http://127.0.0.1:8000/ for the blog
   - Visit http://127.0.0.1:8000/admin/ for the admin interface
   - Visit http://127.0.0.1:8000/blog/create/ to create posts (requires login)

Simple Contact Form Example
---------------------------

Here's a simpler example using Martor in a contact form:

.. code-block:: python

    # contact/forms.py
    from django import forms
    from martor.fields import MartorFormField

    class ContactForm(forms.Form):
        name = forms.CharField(max_length=100)
        email = forms.EmailField()
        subject = forms.CharField(max_length=200)
        message = MartorFormField(
            label="Your Message",
            help_text="You can use Markdown formatting in your message",
            widget=forms.Textarea(attrs={
                'rows': 10,
                'placeholder': 'Write your message here...'
            })
        )

    # contact/views.py
    from django.shortcuts import render, redirect
    from django.contrib import messages
    from django.core.mail import send_mail
    from django.conf import settings
    from .forms import ContactForm

    def contact_view(request):
        if request.method == 'POST':
            form = ContactForm(request.POST)
            if form.is_valid():
                # Send email or save to database
                # ... email logic ...
                messages.success(request, 'Thank you for your message!')
                return redirect('contact')
        else:
            form = ContactForm()
        
        return render(request, 'contact/contact.html', {'form': form})

User Documentation Example
--------------------------

For documentation or knowledge base applications:

.. code-block:: python

    # docs/models.py
    from django.db import models
    from martor.models import MartorField

    class DocumentSection(models.Model):
        name = models.CharField(max_length=100)
        order = models.PositiveIntegerField(default=0)
        
        class Meta:
            ordering = ['order']
        
        def __str__(self):
            return self.name

    class Document(models.Model):
        title = models.CharField(max_length=200)
        slug = models.SlugField(unique=True)
        section = models.ForeignKey(DocumentSection, on_delete=models.CASCADE)
        content = MartorField()
        
        # Metadata
        created_at = models.DateTimeField(auto_now_add=True)
        updated_at = models.DateTimeField(auto_now=True)
        version = models.CharField(max_length=10, default='1.0')
        
        # Access control
        is_public = models.BooleanField(default=True)
        
        class Meta:
            ordering = ['section__order', 'title']
        
        def __str__(self):
            return self.title

This provides a solid foundation for building documentation websites with Martor.

Next Steps
----------

* :doc:`../usage/models` - Learn more about using Martor with models
* :doc:`../usage/forms` - Advanced form techniques
* :doc:`custom-uploader` - Set up custom image uploading
* :doc:`../customization` - Customize Martor's appearance and behavior
