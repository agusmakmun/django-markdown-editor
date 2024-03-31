from app.models import Post, PostMeta
from django.contrib import admin
from django.db import models

from martor.models import MartorField
from martor.widgets import AdminMartorWidget


class PostMetaAdminInline(admin.TabularInline):
    model = PostMeta


class PostMetaStackedInline(admin.StackedInline):
    model = PostMeta


class PostAdmin(admin.ModelAdmin):
    autocomplete_fields = ["author"]
    inlines = [PostMetaAdminInline, PostMetaStackedInline]
    list_display = ["title", "id"]
    formfield_overrides = {
        MartorField: {"widget": AdminMartorWidget},
        models.TextField: {"widget": AdminMartorWidget},
    }


admin.site.register(Post, PostAdmin)
