from django.urls import path

from .views import markdown_imgur_uploader, markdown_search_user, markdownfy_view

urlpatterns = [
    path("markdownify/", markdownfy_view, name="martor_markdownfy"),
    path("uploader/", markdown_imgur_uploader, name="imgur_uploader"),
    path("search-user/", markdown_search_user, name="search_user_json"),
]
