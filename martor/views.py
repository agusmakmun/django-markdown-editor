# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.http import HttpResponse, JsonResponse
from django.utils.module_loading import import_string
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model

from .api import imgur_uploader
from .settings import MARTOR_MARKDOWNIFY_FUNCTION
from .utils import LazyEncoder

User = get_user_model()


def markdownfy_view(request):
    if request.method == "POST":
        content = request.POST.get("content", "")
        markdownify = import_string(MARTOR_MARKDOWNIFY_FUNCTION)
        return HttpResponse(markdownify(content))
    return HttpResponse(_("Invalid request!"))


@login_required
def markdown_imgur_uploader(request):
    """
    Makdown image upload for uploading to imgur.com
    and represent as json to markdown editor.
    """

    def is_ajax(request):
        return request.META.get("HTTP_X_REQUESTED_WITH") == "XMLHttpRequest"

    if request.method == "POST" and is_ajax(request):
        if "markdown-image-upload" in request.FILES:
            image = request.FILES["markdown-image-upload"]
            response_data = imgur_uploader(image=image)
            return HttpResponse(response_data, content_type="application/json")
        return HttpResponse(_("Invalid request!"))
    return HttpResponse(_("Invalid request!"))


@login_required
def markdown_search_user(request):
    """
    Json usernames of the users registered & actived.

    url(method=get):
        /martor/search-user/?username={username}

    Response:
        error:
            - `status` is status code (204)
            - `error` is error message.
        success:
            - `status` is status code (204)
            - `data` is list dict of usernames.
                { 'status': 200,
                  'data': [
                    {'usernane': 'john'},
                    {'usernane': 'albert'}]
                }
    """
    response_data = {}
    username = request.GET.get("username")

    if username is not None and username != "" and " " not in username:

        queries = {"%s__icontains" % User.USERNAME_FIELD: username}
        users = User.objects.filter(**queries).filter(is_active=True)
        if users.exists():
            usernames = list(users.values_list("username", flat=True))
            response_data.update({"status": 200, "data": usernames})
            return JsonResponse(response_data)

        error_message = _(
            "No users registered as `%(username)s` " "or user is unactived."
        )
        error_message = error_message % {"username": username}
        response_data.update({"status": 204, "error": error_message})
    else:
        error_message = _("Validation Failed for field `username`")
        response_data.update({"status": 204, "error": error_message})

    return JsonResponse(response_data, encoder=LazyEncoder)
