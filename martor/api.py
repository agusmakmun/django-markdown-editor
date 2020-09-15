# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import json
import base64
import requests
from .settings import (MARTOR_IMGUR_CLIENT_ID, MARTOR_IMGUR_API_KEY)

requests.packages.urllib3.disable_warnings()


def imgur_uploader(image):
    """
    Basic imgur uploader return as json data.
    :param `image` is from `request.FILES['markdown-image-upload']`
    :return json response
    """
    api_url = 'https://api.imgur.com/3/upload.json'
    headers = {'Authorization': 'Client-ID ' + MARTOR_IMGUR_CLIENT_ID}
    response = requests.post(
        api_url,
        headers=headers,
        data={
            'key': MARTOR_IMGUR_API_KEY,
            'image': base64.b64encode(image.read()),
            'type': 'base64',
            'name': image.name
        }
    )

    if response.status_code == 200:
        response_data = json.loads(response.content.decode('utf-8'))
        return json.dumps({
            'status': response_data['status'],
            'link': response_data['data']['link'],
            'name': response_data['data']['name']
        })

    elif response.status_code == 415:
        # Unsupport File type
        return json.dumps({
            'status': response.status_code,
            'error': response.reason
        })

    return json.dumps({
        'status': response.status_code,
        'error': response.content.decode('utf-8')
    })
