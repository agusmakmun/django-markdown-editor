from django.conf.urls import url
from .views import (
    markdown_imgur_uploader, markdown_search_user
)

urlpatterns = [
    url(
        r'^uploader/$',
        markdown_imgur_uploader,
        name='imgur_uploader'
    ),
    url(
        r'^search-user/$',
        markdown_search_user,
        name='search_user_json'
    ),
]
