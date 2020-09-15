# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.http import (HttpResponse, JsonResponse)
from django.utils.module_loading import import_string
from django.utils.translation import ugettext_lazy as _
from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model
from django.db.models import Q

from .api import imgur_uploader
from .settings import MARTOR_MARKDOWNIFY_FUNCTION
from .utils import LazyEncoder

User = get_user_model()


def markdownfy_view(request):
    if request.method == 'POST':
        content = request.POST.get('content', '')
        markdownify = import_string(MARTOR_MARKDOWNIFY_FUNCTION)
        return HttpResponse(markdownify(content))
    return HttpResponse(_('Invalid request!'))


@login_required
def markdown_imgur_uploader(request):
    """
    Makdown image upload for uploading to imgur.com
    and represent as json to markdown editor.
    """
    if request.method == 'POST' and request.is_ajax():
        if 'markdown-image-upload' in request.FILES:
            image = request.FILES['markdown-image-upload']
            response_data = imgur_uploader(image=image)
            return HttpResponse(response_data, content_type='application/json')
        return HttpResponse(_('Invalid request!'))
    return HttpResponse(_('Invalid request!'))


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
    username = request.GET.get('username')

    if username is not None \
            and username != '' \
            and ' ' not in username:

        users = User.objects.filter(
            Q(username__iexact=username) |
            Q(username__icontains=username)
        ).filter(is_active=True)

        if users.exists():
            response_data.update({'status': 200,
                                  'data': [{'username': u.username} for u in users]})
            return JsonResponse(response_data)

        response_data.update({'status': 204,
                              'error': _('No users registered as `%(username)s` '
                                         'or user is unactived.') % {'username': username}})
    else:
        response_data.update({'status': 204,
                              'error': _('Validation Failed for field `username`')})

    return JsonResponse(response_data)
