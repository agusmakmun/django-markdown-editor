from django.contrib import admin
from django.db import models

from .widgets import AdminDraceditorWidget
from .models import DraceditorField


class DraceditorModelAdmin(admin.ModelAdmin):

    formfield_overrides = {
        DraceditorField: {'widget': AdminDraceditorWidget}
    }
