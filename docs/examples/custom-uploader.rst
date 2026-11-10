Custom Uploader
===============

By default the editor uploads images to imgur.com. To keep images in your own storage
(``MEDIA_ROOT``, S3, Google Cloud Storage, ...), point ``MARTOR_UPLOAD_URL`` to your own view.
The toolbar's upload button and images pasted from the clipboard both use it.

The view below works with any Django storage backend (``default_storage``) and checks that
the file really is an image before saving it.

Requirements
------------

The image check uses `Pillow <https://pillow.readthedocs.io/>`_:

.. code-block:: bash

    pip install Pillow

1. Settings
-----------

.. code-block:: python

    # settings.py
    MARTOR_ENABLE_CONFIGS = {
        # ...
        "imgur": "true",  # shows the upload button, for imgur or a custom uploader
    }

    MARTOR_UPLOAD_URL = "/api/uploader/"  # your view, instead of imgur

    MAX_IMAGE_UPLOAD_SIZE = 5 * 1024 * 1024  # 5 MB

    # local storage (skip when you use S3 or another storage backend)
    MEDIA_URL = "/media/"
    MEDIA_ROOT = BASE_DIR / "media"

2. View
-------

.. code-block:: python

    # yourapp/views.py
    import uuid

    from django.conf import settings
    from django.contrib.auth.decorators import login_required
    from django.core.files.storage import default_storage
    from django.http import JsonResponse
    from django.utils import timezone
    from django.utils.translation import gettext as _
    from django.views.decorators.http import require_POST
    from PIL import Image

    # Detected image format -> extension used for the saved file.
    # SVG is left out on purpose: it can contain scripts.
    IMAGE_FORMATS = {"PNG": "png", "JPEG": "jpg", "GIF": "gif", "WEBP": "webp"}
    MAX_IMAGE_UPLOAD_SIZE = getattr(settings, "MAX_IMAGE_UPLOAD_SIZE", 5 * 1024 * 1024)  # 5 MB


    def upload_error(message):
        # martor shows `error` to the user only for an HTTP 200 response whose `status` isn't 200
        return JsonResponse({"status": 400, "error": message})


    @login_required
    @require_POST
    def markdown_uploader(request):
        image = request.FILES.get("markdown-image-upload")
        if image is None:
            return upload_error(_("No image was uploaded."))

        if image.size > MAX_IMAGE_UPLOAD_SIZE:
            size_mb = MAX_IMAGE_UPLOAD_SIZE // (1024 * 1024)
            return upload_error(_("The image is too large, the maximum is %(size)s MB.") % {"size": size_mb})

        # Check the file content, not its name or the browser-sent content type (both can be faked)
        try:
            with Image.open(image) as img:
                img.verify()
                extension = IMAGE_FORMATS.get(img.format)
        except Exception:
            extension = None
        if extension is None:
            return upload_error(_("Please upload a PNG, JPEG, GIF or WebP image."))

        # A random name with the extension of the detected format, never the uploaded file name
        image.seek(0)
        path = f"martor/{timezone.now():%Y/%m/%d}/{uuid.uuid4().hex}.{extension}"
        path = default_storage.save(path, image)
        return JsonResponse({"status": 200, "link": default_storage.url(path), "name": image.name})

3. URL
------

.. code-block:: python

    # urls.py
    from django.conf import settings
    from django.conf.urls.static import static
    from django.urls import path

    from yourapp.views import markdown_uploader

    urlpatterns = [
        # ...
        path("api/uploader/", markdown_uploader, name="markdown_uploader"),
    ]

    # serve uploaded files during development (in production, let your web server or storage do it)
    if settings.DEBUG:
        urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

How it works
------------

The editor POSTs the image as the ``markdown-image-upload`` form field, with the CSRF token,
and expects a JSON response:

* success: ``{"status": 200, "link": "<image url>", "name": "<file name>"}``, the editor inserts
  ``![name](link)`` at the cursor.
* failure: ``{"status": <anything but 200>, "error": "<message>"}`` with HTTP status 200, the
  editor shows ``error`` to the user. A non-200 HTTP status (e.g. 400) fails silently in the editor,
  which is why ``upload_error()`` replies with HTTP 200.

Security
--------

Uploads come from your users, treat them as untrusted:

* **Check the content, not the name.** The file name and the browser-sent content type are chosen
  by the client. A file named ``photo.png`` sent as ``image/png`` can be HTML, and if your media is
  served from your own domain, opening it runs its scripts (stored XSS). The view opens the file with
  Pillow and only accepts real PNG, JPEG, GIF and WebP images.
* **Never use the uploaded file name for the saved path.** The view saves under a random name with
  the extension of the detected format, so ``evil.html`` or ``../../x.png`` can't choose the path
  or the type the file is served as.
* **No SVG.** SVG files can contain scripts.
* **Limit who can upload.** ``login_required`` sends anonymous users to the login page; add your own
  permission check if only some users may upload.
* **Limit the size.** ``MAX_IMAGE_UPLOAD_SIZE`` rejects large images. Also set Django's
  ``DATA_UPLOAD_MAX_MEMORY_SIZE`` / your web server's request body limit.

Other storage backends
----------------------

The view saves through ``default_storage`` and builds the link with ``default_storage.url()``, so it
works unchanged with `django-storages <https://django-storages.readthedocs.io/>`_ (S3, Google Cloud
Storage, Azure, ...): configure the storage, nothing in the view changes.
