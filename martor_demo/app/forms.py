from app.models import Post
from django import forms

from martor.fields import MartorFormField


class SimpleForm(forms.Form):
    title = forms.CharField(widget=forms.TextInput())
    description = MartorFormField()
    wiki = MartorFormField()


class PostForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = "__all__"
