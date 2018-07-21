from django.http import HttpResponse
from django.shortcuts import (render, redirect)
from django.contrib.auth.decorators import login_required

from app.forms import (SimpleForm, PostForm)
from app.models import Post


def home_redirect_view(request):
    return redirect('simple_form')


def simple_form_view(request):
    form = SimpleForm()
    context = {'form': form, 'title': 'Simple Form'}
    return render(request, 'custom_form.html', context)


@login_required
def post_form_view(request):
    if request.method == 'POST':
        form = PostForm(request.POST)
        if form.is_valid():
            form.save()
            title = form.cleaned_data['title']
            return HttpResponse('%s successfully  saved!' % title)
    else:
        form = PostForm()
        context = {'form': form, 'title': 'Post Form'}
    return render(request, 'custom_form.html', context)


def test_markdownify(request):
    post = Post.objects.last()
    context = {'post': post}
    if post is None:
        context = {
            'post': {
                'title': 'Fake Post',
                'description': """It **working**! :heart: [Python Learning](https://python.web.id)"""
            }
        }
    return render(request, 'test_markdownify.html', context)
