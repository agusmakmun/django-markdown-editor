# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.contrib import admin

from .widgets import AdminMartorWidget
from .models import MartorField


class MartorModelAdmin(admin.ModelAdmin):

    formfield_overrides = {
        MartorField: {"widget": AdminMartorWidget},
    }
