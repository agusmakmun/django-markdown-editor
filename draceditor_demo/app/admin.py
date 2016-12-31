from django.db import models
from django.contrib import admin

from draceditor.widgets import AdminDraceditorWidget
from draceditor.models import DraceditorField

from app.models import Post


class PostAdmin(admin.ModelAdmin):
    list_display = ['title', 'id']
    formfield_overrides = {
        DraceditorField: {'widget': AdminDraceditorWidget},
        models.TextField: {'widget': AdminDraceditorWidget},
    }

admin.site.register(Post, PostAdmin)
