Changelog
=========

This document tracks the changes made to Martor over time.

Version 1.8.4 (Current)
-------------------------

**Release Date:** 31-Oct-2026

**Bug Fixes:**

* Admin follows django's light/dark theme (OS setting and theme toggle) in all themes: editor, toolbar, preview and modals #250
* Semantic: hidden upload input showing "Choose File" and pushing the toolbar above the tabs
* Semantic: regenerated broken minified css (fullscreen, live preview, scrollbar rules)
* Tailwind: stacked admin icons, full width admin inputs, misaligned upload button
* Help guide: lists indented by django's form styles, unreadable title, overflowing tailwind table

Version 1.8.3
-------------------------

**Release Date:** 31-Oct-2026

**New Features:**

* Upload images pasted from the clipboard #240
* Per-widget toolbar buttons: ``MartorWidget(toolbar_buttons=[...])`` #262
* ``MARTOR_MARKDOWNIFY_LOGIN_REQUIRED`` setting #194

**Bug Fixes:**

* Restore configurable CSRF cookie name in static JS, default to ``CSRF_COOKIE_NAME`` #292
* Semantic theme with ``autocomplete_fields`` (``dropdown is not a function``) #271
* Admin: editor full width / overflow #269 #256, dark mode preview #250, collapsed fieldsets #180, heading sizes #185
* bleach ``NoCssSanitizerWarning`` (now requires ``bleach[css]``) #202
* Video embeds use ``https://`` #191
* Urlize mangling html attributes #74
* Trailing space after link insert #59
* Removed Google Fonts import from semantic css #119

Version 1.8.1
-------------------------

**Release Date:** 01-Nov-2025

**Improvements:**

* Support different CSRF_COOKIE_NAME #286

Version 1.7.15
-------------------------

**Release Date:** 01-Nov-2025

**New Features:**

* Complete Sphinx documentation with comprehensive guides
* API reference documentation with autodoc
* Troubleshooting and FAQ sections
* Enhanced code examples and tutorials

**Improvements:**

* Better error handling and validation
* Improved accessibility features
* Enhanced security configurations
* Performance optimizations

**Bug Fixes:**

* Fixed compatibility issues with Django 5.x
* Resolved static file loading issues
* Fixed admin integration edge cases
* Improved CSRF token handling
* Fixed missing ACE editor icon files causing collectstatic MissingFileError
* Added 26 missing icon files (main-1.png through main-26.png, main-5.svg through main-25.svg) for ACE CSS

**Documentation:**

* Complete rewrite of documentation using Sphinx
* Added installation and quickstart guides
* Comprehensive configuration reference
* Usage examples for all components
* API documentation with full coverage

Previous Versions
-----------------

For historical changelog information, see the `GitHub Releases page <https://github.com/agusmakmun/django-markdown-editor/releases>`_.

Key Historical Milestones
~~~~~~~~~~~~~~~~~~~~~~~~~

**Version 1.7.x Series**
  * Enhanced Django 4.x and 5.x compatibility
  * Improved security features
  * Better performance and stability

**Version 1.6.x Series**
  * Major UI improvements
  * Enhanced mobile support
  * Better accessibility

**Version 1.5.x Series**
  * Custom upload support
  * Enhanced markdown extensions
  * Improved admin integration

**Version 1.4.x Series**
  * Semantic UI theme support
  * Performance improvements
  * Better customization options

**Version 1.3.x Series**
  * Bootstrap 4 support
  * Enhanced security features
  * Better Django integration

**Version 1.2.x Series**
  * User mention support
  * Improved image handling
  * Better form integration

**Version 1.1.x Series**
  * Emoji support
  * Enhanced preview functionality
  * Better error handling

**Version 1.0.x Series**
  * Initial stable release
  * Core markdown editing features
  * Basic Django integration

Migration Guide
---------------

From Version 1.6.x to 1.7.x
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

No breaking changes. Simply update the package:

.. code-block:: bash

    pip install -U martor

From Earlier Versions
~~~~~~~~~~~~~~~~~~~~~

For major version upgrades, please refer to the specific migration guides in the GitHub repository.

Deprecation Notices
-------------------

**Current Deprecations:**

* None at this time

**Planned Deprecations:**

* Support for Python 3.8 will be dropped in version 1.8.1
* Support for Django 3.1 and earlier will be dropped in version 1.8.1

Contributing to Changelog
--------------------------

When contributing to Martor, please:

1. Update this changelog with your changes
2. Follow the existing format and style
3. Include the type of change (New Feature, Improvement, Bug Fix, etc.)
4. Reference any related issues or pull requests

For more information, see the `Contributing Guide <https://github.com/agusmakmun/django-markdown-editor/blob/master/CONTRIBUTING.md>`_.
