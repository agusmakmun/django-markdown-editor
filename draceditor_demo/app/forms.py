from django import forms

from draceditor.fields import DraceditorFormField
from app.models import Post


class SimpleForm(forms.Form):
    title = forms.CharField(widget=forms.TextInput())
    description = DraceditorFormField()


class PostForm(forms.ModelForm):

    class Meta:
        model = Post
        fields = '__all__'
