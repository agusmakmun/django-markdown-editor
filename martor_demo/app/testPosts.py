# app/testPosts.py

from django.test import TestCase
from app.models import Post


class PostTestCase(TestCase):
    def testPost(self):
        post = Post(title="My title", description="My description", wiki="My wiki")
        self.assertEqual(post.title, "My title")
        self.assertEqual(post.description, "My description")
        self.assertEqual(post.wiki, "My wiki")
