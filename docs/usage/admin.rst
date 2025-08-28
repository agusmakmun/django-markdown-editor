Using Martor in Django Admin
=============================

Martor seamlessly integrates with Django Admin, providing a rich markdown editing experience for content management. This guide covers setup, customization, and best practices for admin integration.

Basic Admin Setup
-----------------

The simplest way to enable Martor in Django Admin:

.. code-block:: python

    # admin.py
    from django.contrib import admin
    from django.db import models
    from martor.widgets import AdminMartorWidget
    from .models import BlogPost

    @admin.register(BlogPost)
    class BlogPostAdmin(admin.ModelAdmin):
        formfield_overrides = {
            models.TextField: {'widget': AdminMartorWidget},
        }

For models using ``MartorField``:

.. code-block:: python

    # models.py
    from martor.models import MartorField

    class Article(models.Model):
        content = MartorField()

    # admin.py - MartorField automatically uses AdminMartorWidget
    @admin.register(Article) 
    class ArticleAdmin(admin.ModelAdmin):
        pass  # No extra configuration needed

Advanced Admin Configuration
----------------------------

Custom Admin with Specific Fields
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: python

    from django.contrib import admin
    from django.forms import ModelForm
    from martor.widgets import AdminMartorWidget
    from .models import Documentation

    class DocumentationForm(ModelForm):
        class Meta:
            model = Documentation
            fields = '__all__'
            widgets = {
                'content': AdminMartorWidget(attrs={
                    'data-upload-url': '/admin/docs/upload/',
                    'data-search-users-url': '/admin/docs/search-users/',
                    'rows': 30,
                })
            }

    @admin.register(Documentation)
    class DocumentationAdmin(admin.ModelAdmin):
        form = DocumentationForm
        list_display = ['title', 'section', 'last_updated']
        list_filter = ['section', 'is_public']
        search_fields = ['title', 'content']

Fieldset Organization
~~~~~~~~~~~~~~~~~~~~~

.. code-block:: python

    @admin.register(BlogPost)
    class BlogPostAdmin(admin.ModelAdmin):
        formfield_overrides = {
            models.TextField: {'widget': AdminMartorWidget},
        }
        
        fieldsets = (
            ('Basic Information', {
                'fields': ('title', 'slug', 'author')
            }),
            ('Content', {
                'fields': ('excerpt', 'content'),
                'classes': ('wide',),
            }),
            ('Publishing', {
                'fields': ('published', 'featured', 'publish_date'),
                'classes': ('collapse',),
            }),
            ('SEO', {
                'fields': ('meta_description', 'meta_keywords'),
                'classes': ('collapse',),
            }),
        )
        
        list_display = ['title', 'author', 'published', 'created_at']
        list_filter = ['published', 'featured', 'created_at']
        search_fields = ['title', 'content']
        prepopulated_fields = {'slug': ('title',)}

Inline Admin with Martor
~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: python

    from django.contrib import admin
    from .models import Course, Lesson

    class LessonInline(admin.TabularInline):
        model = Lesson
        formfield_overrides = {
            models.TextField: {'widget': AdminMartorWidget},
        }
        extra = 1
        fields = ['title', 'content', 'order']

    @admin.register(Course)
    class CourseAdmin(admin.ModelAdmin):
        inlines = [LessonInline]
        list_display = ['title', 'instructor', 'created_at']

Custom Admin Widget Configuration
---------------------------------

Context-Aware Widget
~~~~~~~~~~~~~~~~~~~~

.. code-block:: python

    from django.contrib import admin
    from django.forms import ModelForm
    from martor.widgets import AdminMartorWidget

    class ContextualAdminMartorWidget(AdminMartorWidget):
        def __init__(self, *args, **kwargs):
            # Get current user context (if available)
            attrs = kwargs.get('attrs', {})
            
            # Configure based on admin context
            attrs.update({
                'data-upload-url': '/admin/upload/',
                'data-search-users-url': '/admin/search-users/',
                'rows': 25,
                'data-enable-configs': {
                    'emoji': 'true',
                    'imgur': 'false',  # Use internal upload
                    'mention': 'true',
                    'living': 'true',
                    'spellcheck': 'true',
                    'hljs': 'true',
                }
            })
            
            kwargs['attrs'] = attrs
            super().__init__(*args, **kwargs)

    class ArticleForm(ModelForm):
        class Meta:
            model = Article
            fields = '__all__'
            widgets = {
                'content': ContextualAdminMartorWidget(),
            }

    @admin.register(Article)
    class ArticleAdmin(admin.ModelAdmin):
        form = ArticleForm

Permission-Based Configuration
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: python

    class PermissionBasedAdminWidget(AdminMartorWidget):
        def __init__(self, user=None, *args, **kwargs):
            attrs = kwargs.get('attrs', {})
            
            # Configure upload based on permissions
            if user and user.has_perm('myapp.can_upload_images'):
                attrs['data-upload-url'] = '/admin/upload/'
            else:
                attrs['data-upload-url'] = ''  # Disable upload
            
            # Configure mentions for staff only
            if user and user.is_staff:
                attrs['data-search-users-url'] = '/admin/search-users/'
                attrs['data-enable-configs'] = {'mention': 'true'}
            else:
                attrs['data-enable-configs'] = {'mention': 'false'}
            
            kwargs['attrs'] = attrs
            super().__init__(*args, **kwargs)

    class ArticleForm(ModelForm):
        def __init__(self, *args, **kwargs):
            self.user = kwargs.pop('user', None)
            super().__init__(*args, **kwargs)
            
            if 'content' in self.fields:
                self.fields['content'].widget = PermissionBasedAdminWidget(
                    user=self.user
                )

    class ArticleAdmin(admin.ModelAdmin):
        form = ArticleForm
        
        def get_form(self, request, obj=None, **kwargs):
            form = super().get_form(request, obj, **kwargs)
            # Pass current user to form
            form.user = request.user
            return form

Admin Media Configuration
-------------------------

Custom CSS for Admin
~~~~~~~~~~~~~~~~~~~~~

.. code-block:: python

    class CustomAdminMartorWidget(AdminMartorWidget):
        class Media:
            css = {
                'all': (
                    'plugins/css/ace.min.css',
                    'plugins/css/highlight.min.css',
                    'martor/css/martor.bootstrap.min.css',
                    'martor/css/martor-admin.min.css',
                    'admin/css/custom-martor.css',  # Your custom admin CSS
                )
            }

Custom JavaScript
~~~~~~~~~~~~~~~~~

.. code-block:: css

    /* admin/css/custom-martor.css */
    .martor-field {
        border: 1px solid #ddd;
        border-radius: 4px;
        margin-bottom: 20px;
    }

    .martor-toolbar {
        background: #f8f9fa;
        border-bottom: 1px solid #ddd;
        padding: 10px;
    }

    .martor-preview {
        max-height: 400px;
        overflow-y: auto;
        border-top: 1px solid #ddd;
        padding: 15px;
    }

Multi-Language Admin
--------------------

For international content management:

.. code-block:: python

    from django.contrib import admin
    from django.utils.translation import gettext_lazy as _
    from modeltranslation.admin import TranslationAdmin
    from .models import Article

    @admin.register(Article)
    class ArticleAdmin(TranslationAdmin):
        formfield_overrides = {
            models.TextField: {'widget': AdminMartorWidget},
        }
        
        fieldsets = (
            (_('Content'), {
                'fields': ('title', 'content'),
            }),
            (_('Metadata'), {
                'fields': ('slug', 'published'),
            }),
        )
        
        list_display = ['title', 'published', 'created_at']

Bulk Actions with Martor
------------------------

Custom admin actions for markdown content:

.. code-block:: python

    from django.contrib import admin
    from django.contrib import messages
    from django.http import HttpResponse
    import csv

    @admin.register(Article)
    class ArticleAdmin(admin.ModelAdmin):
        formfield_overrides = {
            models.TextField: {'widget': AdminMartorWidget},
        }
        
        actions = ['export_as_markdown', 'publish_selected', 'convert_to_html']
        
        def export_as_markdown(self, request, queryset):
            """Export selected articles as markdown files"""
            response = HttpResponse(content_type='application/zip')
            response['Content-Disposition'] = 'attachment; filename="articles.zip"'
            
            import zipfile
            import io
            
            zip_buffer = io.BytesIO()
            with zipfile.ZipFile(zip_buffer, 'w') as zip_file:
                for article in queryset:
                    filename = f"{article.slug}.md"
                    content = f"# {article.title}\n\n{article.content}"
                    zip_file.writestr(filename, content)
            
            response.write(zip_buffer.getvalue())
            return response
            
        export_as_markdown.short_description = "Export selected as Markdown"
        
        def publish_selected(self, request, queryset):
            """Publish selected articles"""
            count = queryset.update(published=True)
            self.message_user(
                request,
                f"{count} articles were successfully published.",
                messages.SUCCESS
            )
            
        publish_selected.short_description = "Publish selected articles"

Admin List Display with Markdown Preview
----------------------------------------

.. code-block:: python

    from django.utils.html import format_html
    from django.utils.safestring import mark_safe
    from martor.utils import markdownify

    @admin.register(Article)
    class ArticleAdmin(admin.ModelAdmin):
        formfield_overrides = {
            models.TextField: {'widget': AdminMartorWidget},
        }
        
        list_display = ['title', 'content_preview', 'published', 'created_at']
        
        def content_preview(self, obj):
            """Show a truncated HTML preview of the content"""
            if obj.content:
                # Convert markdown to HTML and truncate
                html = markdownify(obj.content[:200] + '...' if len(obj.content) > 200 else obj.content)
                return format_html(
                    '<div style="max-width: 300px; max-height: 100px; overflow: hidden;">{}</div>',
                    html
                )
            return "-"
            
        content_preview.short_description = "Content Preview"
        content_preview.allow_tags = True

Admin Filters for Markdown Content
----------------------------------

.. code-block:: python

    from django.contrib.admin import SimpleListFilter

    class ContentLengthFilter(SimpleListFilter):
        title = 'content length'
        parameter_name = 'content_length'

        def lookups(self, request, model_admin):
            return (
                ('short', 'Short (< 500 chars)'),
                ('medium', 'Medium (500-2000 chars)'),
                ('long', 'Long (> 2000 chars)'),
            )

        def queryset(self, request, queryset):
            if self.value() == 'short':
                return queryset.extra(where=["CHAR_LENGTH(content) < 500"])
            elif self.value() == 'medium':
                return queryset.extra(where=["CHAR_LENGTH(content) BETWEEN 500 AND 2000"])
            elif self.value() == 'long':
                return queryset.extra(where=["CHAR_LENGTH(content) > 2000"])

    class HasImagesFilter(SimpleListFilter):
        title = 'has images'
        parameter_name = 'has_images'

        def lookups(self, request, model_admin):
            return (
                ('yes', 'Yes'),
                ('no', 'No'),
            )

        def queryset(self, request, queryset):
            if self.value() == 'yes':
                return queryset.filter(content__contains='![')
            elif self.value() == 'no':
                return queryset.exclude(content__contains='![')

    @admin.register(Article)
    class ArticleAdmin(admin.ModelAdmin):
        list_filter = [ContentLengthFilter, HasImagesFilter, 'published']

Custom Upload Endpoints for Admin
---------------------------------

.. code-block:: python

    # urls.py
    from django.urls import path, include

    urlpatterns = [
        path('admin/', admin.site.urls),
        path('admin/upload/', admin_upload_view, name='admin_upload'),
        path('martor/', include('martor.urls')),
    ]

    # views.py
    from django.contrib.admin.views.decorators import staff_member_required
    from django.http import JsonResponse
    from django.views.decorators.csrf import csrf_exempt
    import os

    @staff_member_required
    @csrf_exempt
    def admin_upload_view(request):
        if request.method == 'POST' and request.FILES.get('markdown-image-upload'):
            image = request.FILES['markdown-image-upload']
            
            # Save to admin-specific directory
            upload_path = os.path.join(settings.MEDIA_ROOT, 'admin-uploads', image.name)
            
            with open(upload_path, 'wb+') as destination:
                for chunk in image.chunks():
                    destination.write(chunk)
            
            image_url = os.path.join(settings.MEDIA_URL, 'admin-uploads', image.name)
            
            return JsonResponse({'status': 200, 'link': image_url})
        
        return JsonResponse({'status': 405, 'error': 'Method not allowed'})

Admin Templates Customization
-----------------------------

Override admin templates for better integration:

.. code-block:: html

    <!-- templates/admin/change_form.html -->
    {% extends "admin/change_form.html" %}
    {% load static %}

    {% block extrahead %}
        {{ block.super }}
        <style>
            .martor-field {
                width: 100%;
                margin-bottom: 20px;
            }
            
            .martor-toolbar {
                background: #f8f9fa;
                border: 1px solid #ddd;
                border-bottom: none;
            }
            
            .martor-preview {
                border: 1px solid #ddd;
                border-top: none;
                max-height: 400px;
                overflow-y: auto;
            }
        </style>
    {% endblock %}

Troubleshooting Admin Integration
---------------------------------

Common Issues and Solutions
~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Editor not loading in admin?**
    - Ensure ``MARTOR_ENABLE_ADMIN_CSS = True`` in settings
    - Check that static files are properly collected
    - Verify admin templates are not conflicting

**Upload not working in admin?**
    - Check upload URL configuration
    - Ensure proper permissions for admin users
    - Verify CSRF token handling

**Styling conflicts?**
    - Use ``MARTOR_ENABLE_ADMIN_CSS = False`` for custom admin themes
    - Override widget media to exclude conflicting styles
    - Check for CSS specificity issues

**Multiple editors conflicting?**
    - Ensure unique field names
    - Check JavaScript console for errors
    - Use different widget instances for different fields

Best Practices for Admin
------------------------

1. **Use appropriate field organization**:

.. code-block:: python

    fieldsets = (
        ('Content', {
            'fields': ('title', 'content'),
            'classes': ('wide',),
        }),
    )

2. **Provide meaningful help text**:

.. code-block:: python

    class Meta:
        help_texts = {
            'content': 'Use Markdown syntax. Images can be uploaded using the toolbar.'
        }

3. **Configure appropriate permissions**:

.. code-block:: python

    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        if not request.user.has_perm('myapp.can_upload'):
            # Disable upload for this user
            pass
        return form

4. **Use proper validation in admin**:

.. code-block:: python

    def clean(self):
        cleaned_data = super().clean()
        content = cleaned_data.get('content')
        
        if content and len(content) > 50000:
            raise ValidationError('Content is too long.')
        
        return cleaned_data

Next Steps
----------

* :doc:`templates` - Template integration and rendering
* :doc:`../customization` - Advanced customization options
* :doc:`../security` - Security considerations
* :doc:`../examples/basic` - Complete admin examples
