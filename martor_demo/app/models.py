from django.db import models
from martor.models import MartorField


class Post(models.Model):
    title = models.CharField(max_length=200)
    description = MartorField()
    wiki = MartorField()
