from django import forms

from .widgets import (
    DraceditorWidget,
    AdminDraceditorWidget,
)


class DraceditorFormField(forms.CharField):

    def __init__(self, *args, **kwargs):
        kwargs['label'] = ''  # To set without label.
        super(DraceditorFormField, self).__init__(*args, **kwargs)

        if not issubclass(self.widget.__class__, DraceditorWidget):
            self.widget = DraceditorWidget()
