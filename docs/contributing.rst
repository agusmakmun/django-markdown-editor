Contributing to Martor
======================

We welcome contributions to Martor! This guide will help you get started with contributing to the project.

Ways to Contribute
------------------

There are many ways you can contribute to Martor:

* **Report bugs** - Help us identify and fix issues
* **Suggest features** - Propose new functionality or improvements
* * **Write code** - Implement bug fixes or new features
* **Improve documentation** - Help make our docs better
* **Test the project** - Help ensure quality across different environments
* **Share your experience** - Write blog posts, tutorials, or give talks

Getting Started
---------------

Setting Up Development Environment
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

1. **Fork the repository** on GitHub
2. **Clone your fork**:

.. code-block:: bash

    git clone https://github.com/YOUR-USERNAME/django-markdown-editor.git
    cd django-markdown-editor

3. **Create a virtual environment**:

.. code-block:: bash

    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate

4. **Install development dependencies**:

.. code-block:: bash

    pip install -e .[dev]

5. **Install the demo project dependencies**:

.. code-block:: bash

    cd martor_demo
    pip install -r requirements.txt

6. **Run migrations**:

.. code-block:: bash

    python manage.py migrate

7. **Create a superuser**:

.. code-block:: bash

    python manage.py createsuperuser

8. **Run the development server**:

.. code-block:: bash

    python manage.py runserver

Development Workflow
--------------------

Creating a Feature Branch
~~~~~~~~~~~~~~~~~~~~~~~~~

Always create a new branch for your changes:

.. code-block:: bash

    git checkout -b feature/your-feature-name
    # or
    git checkout -b bugfix/issue-number

Making Changes
~~~~~~~~~~~~~~

1. **Write tests** for your changes (see Testing section below)
2. **Implement your changes**
3. **Update documentation** if needed
4. **Run the test suite** to ensure nothing is broken
5. **Test manually** using the demo project

Committing Changes
~~~~~~~~~~~~~~~~~~

Write clear, descriptive commit messages:

.. code-block:: bash

    git add .
    git commit -m "Add user mention autocomplete feature

    - Implement real-time user search
    - Add keyboard navigation support
    - Update documentation with configuration options
    
    Closes #123"

Submitting a Pull Request
~~~~~~~~~~~~~~~~~~~~~~~~~

1. **Push your branch** to your fork:

.. code-block:: bash

    git push origin feature/your-feature-name

2. **Create a Pull Request** on GitHub
3. **Fill out the PR template** with all required information
4. **Wait for review** and address any feedback

Coding Standards
----------------

Code Style
~~~~~~~~~~

We follow Django's coding style and PEP 8:

* Use 4 spaces for indentation
* Line length should not exceed 120 characters
* Use descriptive variable and function names
* Follow Django naming conventions

**Format your code** using Black:

.. code-block:: bash

    black .

**Sort imports** using isort:

.. code-block:: bash

    isort .

**Check code quality** using flake8:

.. code-block:: bash

    flake8 .

Python and Django Compatibility
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Martor supports:

* **Python**: 3.9+
* **Django**: 3.2+

Ensure your code works with all supported versions.

JavaScript and CSS
~~~~~~~~~~~~~~~~~~

For frontend code:

* Use modern JavaScript (ES6+) with appropriate polyfills
* Follow consistent indentation and naming
* Comment complex logic
* Test across different browsers

Testing
-------

Running Tests
~~~~~~~~~~~~~

Run the full test suite:

.. code-block:: bash

    python runtests.py

Run specific tests:

.. code-block:: bash

    python runtests.py martor.tests.test_models

Run tests with coverage:

.. code-block:: bash

    coverage run runtests.py
    coverage report

Writing Tests
~~~~~~~~~~~~~

**Test Organization:**

.. code-block:: text

    martor/tests/
    ├── __init__.py
    ├── test_models.py      # Model tests
    ├── test_fields.py      # Field tests
    ├── test_widgets.py     # Widget tests
    ├── test_views.py       # View tests
    ├── test_utils.py       # Utility tests
    └── test_templates.py   # Template tests

**Example Test:**

.. code-block:: python

    from django.test import TestCase
    from martor.models import MartorField
    from martor.fields import MartorFormField

    class MartorFieldTest(TestCase):
        def test_field_creation(self):
            """Test that MartorField can be created with default settings."""
            field = MartorField()
            self.assertIsInstance(field, MartorField)
        
        def test_field_with_custom_settings(self):
            """Test MartorField with custom parameters."""
            field = MartorField(
                verbose_name="Custom Content",
                help_text="Custom help text",
                blank=True
            )
            self.assertEqual(field.verbose_name, "Custom Content")
            self.assertEqual(field.help_text, "Custom help text")
            self.assertTrue(field.blank)

**Testing Guidelines:**

* Write tests for all new functionality
* Ensure tests are isolated and repeatable
* Use descriptive test method names
* Test both success and failure cases
* Mock external dependencies (like imgur API)

Documentation
-------------

Documentation Structure
~~~~~~~~~~~~~~~~~~~~~~~

Our documentation uses Sphinx and is organized as follows:

.. code-block:: text

    docs/
    ├── index.rst           # Main documentation page
    ├── installation.rst    # Installation guide
    ├── quickstart.rst      # Quick start guide
    ├── settings.rst        # Configuration reference
    ├── usage/             # Usage guides
    ├── api/               # API reference
    ├── examples/          # Examples and tutorials
    └── ...

Writing Documentation
~~~~~~~~~~~~~~~~~~~~~

**Documentation Guidelines:**

* Use clear, concise language
* Provide working code examples
* Include both basic and advanced usage
* Update relevant sections when adding features
* Use proper reStructuredText formatting

**Building Documentation:**

.. code-block:: bash

    cd docs
    pip install -r requirements.txt
    sphinx-build -b html . _build/html

**Viewing Documentation:**

.. code-block:: bash

    # Open _build/html/index.html in your browser

Common Contribution Scenarios
-----------------------------

Adding a New Feature
~~~~~~~~~~~~~~~~~~~~

1. **Create an issue** to discuss the feature first
2. **Design the API** - think about how users will interact with it
3. **Write tests** for the expected behavior
4. **Implement the feature**
5. **Update documentation**
6. **Test thoroughly**

Fixing a Bug
~~~~~~~~~~~~

1. **Create a test** that reproduces the bug
2. **Fix the issue**
3. **Ensure the test passes**
4. **Update documentation** if the bug was due to unclear docs

Improving Documentation
~~~~~~~~~~~~~~~~~~~~~~

1. **Identify areas** that need improvement
2. **Write clear explanations** with examples
3. **Test the examples** to ensure they work
4. **Update the index** and navigation if needed

Pull Request Guidelines
-----------------------

PR Requirements
~~~~~~~~~~~~~~

Before submitting a pull request, ensure:

* ✅ **Tests pass** - All existing tests continue to pass
* ✅ **New tests added** - For new functionality or bug fixes
* ✅ **Documentation updated** - If the change affects user-facing functionality
* ✅ **Code style** - Follows project coding standards
* ✅ **No breaking changes** - Unless discussed and approved

PR Description Template
~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: text

    ## Description
    Brief description of what this PR does.

    ## Type of Change
    - [ ] Bug fix
    - [ ] New feature
    - [ ] Documentation update
    - [ ] Performance improvement
    - [ ] Code refactoring

    ## Related Issue
    Closes #(issue number)

    ## Testing
    - [ ] Tests added/updated
    - [ ] Manual testing completed
    - [ ] Works with supported Django versions

    ## Screenshots (if applicable)
    Add screenshots to help explain your changes.

    ## Checklist
    - [ ] Code follows project style guidelines
    - [ ] Self-review completed
    - [ ] Documentation updated
    - [ ] Tests pass locally

Review Process
~~~~~~~~~~~~~

1. **Automated checks** run on your PR
2. **Code review** by maintainers
3. **Feedback** and requested changes
4. **Approval** and merge

Be patient during the review process and responsive to feedback.

Community Guidelines
--------------------

Code of Conduct
~~~~~~~~~~~~~~~

We expect all contributors to follow our Code of Conduct:

* **Be respectful** and inclusive
* **Be constructive** in feedback and discussions
* **Help others learn** and grow
* **Assume good intentions**

Communication
~~~~~~~~~~~~~

* **GitHub Issues** for bug reports and feature requests
* **Pull Requests** for code contributions
* **Discussions** for general questions and ideas

Getting Help
~~~~~~~~~~~~

If you need help with contributing:

1. **Read the documentation** thoroughly
2. **Search existing issues** for similar problems
3. **Ask questions** in GitHub Discussions
4. **Tag maintainers** if you need specific guidance

Recognition
-----------

We appreciate all contributions to Martor! Contributors are recognized in:

* **GitHub contributors list**
* **Release notes** for significant contributions
* **Documentation credits**

Thank you for contributing to Martor and helping make it better for everyone!

Resources
---------

* `Django Development Documentation <https://docs.djangoproject.com/en/stable/internals/contributing/>`_
* `Python Style Guide (PEP 8) <https://www.python.org/dev/peps/pep-0008/>`_
* `Git Best Practices <https://git-scm.com/book/en/v2>`_
* `Open Source Guides <https://opensource.guide/>`_
