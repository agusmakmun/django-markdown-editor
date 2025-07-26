from setuptools import find_packages, setup

from martor import __AUTHOR__, __AUTHOR_EMAIL__, __VERSION__


def get_requirements():
    return open("requirements.txt").read().splitlines()


setup(
    name="martor",
    version=__VERSION__,
    packages=find_packages(exclude=["*demo"]),
    include_package_data=True,
    zip_safe=False,
    description="Django Markdown Editor",
    url="https://github.com/agusmakmun/django-markdown-editor",
    download_url="https://github.com/agusmakmun/django-markdown-editor/tarball/v%s"
    % __VERSION__,
    keywords=["martor", "django markdown", "django markdown editor"],
    long_description=open("README.md").read(),
    long_description_content_type="text/markdown",
    license="GNUGPL-v3",
    author=__AUTHOR__,
    author_email=__AUTHOR_EMAIL__,
    classifiers=[
        "Development Status :: 5 - Production/Stable",
        "Environment :: Web Environment",
        "Framework :: Django",
        "Framework :: Django :: 4.2",
        "Framework :: Django :: 5.0",
        "Framework :: Django :: 5.1",
        "Intended Audience :: Developers",
        "Operating System :: OS Independent",
        "Programming Language :: JavaScript",
        "Programming Language :: Python",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Programming Language :: Python :: 3.13",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "License :: OSI Approved :: GNU General Public License v3 (GPLv3)",
    ],
    install_requires=get_requirements(),
    project_urls={
        "Documentation": "https://github.com/agusmakmun/django-markdown-editor?tab=readme-ov-file#installation",
        "Release notes": "https://github.com/agusmakmun/django-markdown-editor/releases",
        "Funding": "https://www.paypal.com/paypalme/summonagus",
        "Source": "https://github.com/agusmakmun/django-markdown-editor",
        "Issue Tracker": "https://github.com/agusmakmun/django-markdown-editor/issues",
    },
)
