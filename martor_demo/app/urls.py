from app.views import (
    home_redirect_view,
    post_form_view,
    simple_form_view,
    test_markdownify,
)
from django.urls import path

urlpatterns = [
    path("", home_redirect_view, name="home_redirect"),
    path("simple-form/", simple_form_view, name="simple_form"),
    path("post-form/", post_form_view, name="post_form"),
    path("test-markdownify/", test_markdownify, name="test_markdownify"),
]
