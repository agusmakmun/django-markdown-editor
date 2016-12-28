from django.db import models

from .fields import DraceditorFormField


class DraceditorField(models.TextField):

    def formfield(self, **kwargs):
        defaults = {'form_class': DraceditorFormField}
        defaults.update(kwargs)
        return super(DraceditorField, self).formfield(**defaults)
