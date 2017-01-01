import json
from django.http import HttpResponse
from django.utils.module_loading import import_string
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.db.models import Q

from .api import imgur_uploader
from .settings import DRACEDITOR_MARKDOWNIFY_FUNCTION


def markdownfy_view(request):
    if request.method == 'POST':
        markdownify = import_string(DRACEDITOR_MARKDOWNIFY_FUNCTION)
        return HttpResponse(
            markdownify(request.POST['content'])
        )
    return HttpResponse('Invalid request!')


@login_required
def markdown_imgur_uploader(request):
    """
    Makdown image upload for uploading to imgur.com
    and represent as json to markdown editor.
    """
    if request.method == 'POST' and request.is_ajax():
        if 'markdown-image-upload' in request.FILES:
            image = request.FILES['markdown-image-upload']
            data = imgur_uploader(image)
            return HttpResponse(data, content_type='application/json')
        return HttpResponse('Invalid request!')
    return HttpResponse('Invalid request!')


@login_required
def markdown_search_user(request):
    """
    Json usernames of the users registered & actived.

    url(method=get):
        /draceditor/search-user/?username={username}

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
    data = {}
    username = request.GET.get('username')
    if username is not None \
            and username != '' \
            and ' ' not in username:
        queryset = User.objects.filter(
            Q(username__icontains=username)
        )
        if queryset.exists():
            data.update({
                'status': 200,
                'data': [{'username': u.username} for u in queryset]
            })
            return HttpResponse(json.dumps(data), content_type='application/json')
    data.update({
        'status': 204,
        'error': 'No users registered by query `{}`.'.format(username)
    })
    return HttpResponse(json.dumps(data), content_type='application/json')
