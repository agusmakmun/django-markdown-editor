from django.db import models
from draceditor.models import DraceditorField


class Post(models.Model):
    title = models.CharField(max_length=200)
    description = DraceditorField()
