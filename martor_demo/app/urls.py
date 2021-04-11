from django.urls import path

from app.views import (home_redirect_view, overview_view)

urlpatterns = [
    path('', home_redirect_view, name='home_redirect'),
    path('overview/', overview_view, name='overview'),    
]
