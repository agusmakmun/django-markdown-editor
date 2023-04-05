# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import django

from .settings import MARTOR_MARKDOWNIFY_URL, MARTOR_UPLOAD_URL, MARTOR_SEARCH_USERS_URL
from .views import (
    markdownfy_view,
    markdown_imgur_uploader,
    markdown_search_user,
)


def __normalize(path):
    return path.removeprefix('/').removesuffix('/')


if django.VERSION >= (2, 0):
    from django.urls import path

    urlpatterns = [
        path(
            f"{__normalize(MARTOR_MARKDOWNIFY_URL)}/",
            markdownfy_view,
            name="martor_markdownfy",
        ),
    ]

    if MARTOR_UPLOAD_URL:
        urlpatterns.append(
            path(
                f"{__normalize(MARTOR_UPLOAD_URL)}/",
                markdown_imgur_uploader,
                name="imgur_uploader",
            ),
        )

    if MARTOR_SEARCH_USERS_URL:
        urlpatterns.append(
            path(
                f"{__normalize(MARTOR_SEARCH_USERS_URL)}/",
                markdown_search_user,
                name="search_user_json",
            ),
        )
else:
    from django.conf.urls import url

    urlpatterns = [
        url(
            r"^%s/$" % __normalize(MARTOR_MARKDOWNIFY_URL),
            markdownfy_view,
            name="martor_markdownfy"
        ),
    ]

    if MARTOR_UPLOAD_URL:
        urlpatterns.append(
            url(
                r"^%s/$" % __normalize(MARTOR_UPLOAD_URL),
                markdown_imgur_uploader,
                name="imgur_uploader",
            ),
        )

    if MARTOR_SEARCH_USERS_URL:
        urlpatterns.append(
            url(
                r"^%s/$" % __normalize(MARTOR_SEARCH_USERS_URL),
                markdown_search_user,
                name="search_user_json",
            ),
        )
