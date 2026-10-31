from app.forms import PostForm, SimpleForm
from app.models import Post
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render

import martor
from martor.widgets import MartorWidget, get_theme


def render_demo(request, template, context):
    context.setdefault("media", MartorWidget().media)
    context.update(martor_theme=get_theme(), martor_version=martor.__version__)
    return render(request, "demo/%s" % template, context)


def home_redirect_view(request):
    return redirect("simple_form")


def simple_form_view(request):
    form = SimpleForm()
    return render_demo(
        request,
        "form.html",
        {
            "form": form,
            "media": form.media,
            "title": "Markdown editor",
            "subtitle": "A plain Django form with two MartorFormField fields.",
        },
    )


@login_required
def post_form_view(request):
    form = PostForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        post = form.save(commit=False)
        post.author = request.user
        post.save()
        messages.success(request, "%s successfully saved." % post.title)
        return redirect("test_markdownify")
    return render_demo(
        request,
        "form.html",
        {
            "form": form,
            "media": form.media,
            "title": "Post form",
            "subtitle": "A ModelForm with MartorField model fields, saved posts show up under Rendered.",
        },
    )


def test_markdownify(request):
    post = Post.objects.last() or {
        "title": "Example post",
        "description": "It **works**! :heart: [Python Learning](https://python.web.id)",
    }
    return render_demo(request, "markdownify.html", {"post": post, "title": "Rendered"})
