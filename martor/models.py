# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models

from .fields import MartorFormField


class MartorField(models.TextField):
    def formfield(self, **kwargs):
        defaults = {"form_class": MartorFormField}
        defaults.update(kwargs)
        return super(MartorField, self).formfield(**defaults)
