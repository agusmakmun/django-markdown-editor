from django import forms

from .widgets import (
    MartorWidget,
    AdminMartorWidget,
)


class MartorFormField(forms.CharField):

    def __init__(self, *args, **kwargs):
        kwargs['label'] = ''  # To set without label.
        super(MartorFormField, self).__init__(*args, **kwargs)

        if not issubclass(self.widget.__class__, MartorWidget):
            self.widget = MartorWidget()
