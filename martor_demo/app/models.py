from django.db import models
from martor.models import MartorField


class Post(models.Model):
    title = models.CharField(max_length=200)
    description = MartorField()
    wiki = MartorField(blank=True)


class PostMeta(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    text = MartorField()
