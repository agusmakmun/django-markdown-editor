from django.conf.urls import url

from app.views import (
    simple_form_view,
    post_form_view,
    test_markdownify
)

urlpatterns = [
    url(r'^simple-form/$', simple_form_view, name='simple_form'),

    # require to logged in
    url(r'^post-form/$', post_form_view, name='post_form'),

    # test markdownify
    url(r'^test-markdownify/$', test_markdownify, name='test_markdownify'),
]
