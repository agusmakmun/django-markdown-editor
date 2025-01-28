from django.urls import include, path

from .views import TestFormView

urlpatterns = [
    path("test-form-view/", TestFormView.as_view()),
    path("martor/", include("martor.urls")),
]
