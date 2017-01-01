from setuptools import (setup, find_packages)
from draceditor import (__VERSION__, __AUTHOR__, __AUTHOR_EMAIL__)


def get_requirements():
    return open('requirements.txt').read().splitlines()


setup(
    name='draceditor',
    version=__VERSION__,
    packages=find_packages(exclude=["*demo"]),
    include_package_data=True,
    zip_safe=False,
    description='Django Markdown Editor built for Dracos Linux https://dracos-linux.org',
    url='https://github.com/agusmakmun/dracos-markdown-editor',
    download_url='https://github.com/agusmakmun/djipsum/tarball/v{}'.format(__VERSION__),
    keywords=['draceditor', 'django markdown', 'django markdown editor'],
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
        'Intended Audience :: Developers',
        'License :: OSI Approved :: BSD License',
        'Operating System :: OS Independent',
        'Programming Language :: JavaScript',
        'Programming Language :: Python',
        'Programming Language :: Python :: 2.7',
        'Programming Language :: Python :: 3.3',
        'Programming Language :: Python :: 3.5',
        'Topic :: Software Development :: Libraries :: Python Modules',
    ],
    install_requires=get_requirements(),
)
