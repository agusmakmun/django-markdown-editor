from setuptools import (setup, find_packages)
from martor import (__VERSION__, __AUTHOR__, __AUTHOR_EMAIL__)


def get_requirements():
    return open('requirements.txt').read().splitlines()


setup(
    name='martor',
    version=__VERSION__,
    packages=find_packages(exclude=["*demo"]),
    include_package_data=True,
    zip_safe=False,
    description='Django Markdown Editor',
    url='https://github.com/agusmakmun/django-markdown-editor',
    download_url='https://github.com/agusmakmun/django-markdown-editor/tarball/v%s' % __VERSION__,
    keywords=['martor', 'django markdown', 'django markdown editor'],
    long_description=open('README.rst').read(),
    license='GNUGPL-v3',
    author=__AUTHOR__,
    author_email=__AUTHOR_EMAIL__,
    classifiers=[
        'Development Status :: 5 - Production/Stable',
        'Environment :: Web Environment',
        'Framework :: Django',
        'Framework :: Django :: 1.8',
        'Framework :: Django :: 1.9',
        'Framework :: Django :: 1.10',
        'Framework :: Django :: 1.11',
        'Framework :: Django :: 2.0',
        'Framework :: Django :: 2.1',
        'Framework :: Django :: 2.2',
        'Intended Audience :: Developers',
        'Operating System :: OS Independent',
        'Programming Language :: JavaScript',
        'Programming Language :: Python',
        'Programming Language :: Python :: 3.4',
        'Programming Language :: Python :: 3.5',
        'Programming Language :: Python :: 3.6',
        'Topic :: Software Development :: Libraries :: Python Modules',
        'License :: OSI Approved :: GNU General Public License v3 (GPLv3)',
    ],
    install_requires=get_requirements(),
)
