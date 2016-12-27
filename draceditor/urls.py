from django.conf.urls import url

urlpatterns = [
    url(
        r'^uploader/$',
        markdownx_imgur_uploader,
        name='imgur_uploader'
    ),
    url(
        r'^search-user/$',
        markdownx_search_user,
        name='search_user_json'
    ),
]
