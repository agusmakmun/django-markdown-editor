from django.http import HttpResponse
from django.shortcuts import render
from django.contrib.auth.decorators import login_required

from app.forms import (SimpleForm, PostForm)


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
            return HttpResponse(
                form.cleaned_data['title'] + ' successfully  saved!'
            )
    else:
        form = PostForm()
        context = {'form': form, 'title': 'Post Form'}
    return render(request, 'custom_form.html', context)
