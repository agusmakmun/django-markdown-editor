### 1. Installation

Modern, extensible Python project management using Hatch:
https://hatch.pypa.io/latest/install/

```console
$ pip3 install hatch
```

> Ensure we're working on environment.

Just for knowledge how this project generated using `hatch new {project_name}`:

```
$ hatch new martor
```

### 2. Testing

```console
$ hatch run test:test
```

Or run tests with verbose output:

```console
$ hatch run test:test-verbose
```

Run pytest directly:

```console
$ hatch run test:test-pytest
```

Check the type checking using `mypy`:

```console
$ hatch run dev:type-check
```

### 3. Development Tools

Format code with Black:

```console
$ hatch run dev:format
```

Check formatting without making changes:

```console
$ hatch run dev:format-check
```

Lint code with flake8:

```console
$ hatch run dev:lint
```

Sort imports with isort:

```console
$ hatch run dev:sort
```

Check import sorting without making changes:

```console
$ hatch run dev:sort-check
```

### 4. Versioning

https://hatch.pypa.io/latest/version/#updating

**To check the current version:**

```console
$ hatch version
1.6.45
```

**To tag new release:**

```console
$ hatch version "0.1.0"
Old: 1.6.45
New: 0.1.0
```

**Release micro version:**

```console
$ hatch version micro
Old: 1.6.45
New: 1.6.46
```

### 5. Building

https://hatch.pypa.io/latest/build/

```console
$ hatch build
[sdist]
dist/martor-1.6.45.tar.gz

[wheel]
dist/martor-1.6.45-py3-none-any.whl
```

### 6. Publishing

https://hatch.pypa.io/latest/publish/

Ensure we already setup the api token:
https://pypi.org/help/#apitoken

To make it easy, you can save inside `~/.pypirc` file:

```console
➜  ~ cat .pypirc
[pypi]
  username = __token__
  password = pypi-XXXXX
```

For the first time, `hatch` will require user to fill above PyPi token,
but it will be caching for the next publishments:

```console
$ hatch publish

Enter your username [__token__]:
Enter your credentials:
dist/martor-1.6.45.tar.gz ... success
dist/martor-1.6.45-py3-none-any.whl ... success

[martor]
https://pypi.org/project/martor/1.6.45/
```

### 7. Environment Management

Hatch provides isolated environments for different purposes:

**List available environments:**
```console
$ hatch env show
```

**Create a specific environment:**
```console
$ hatch env create test
```

**Activate an environment:**
```console
$ hatch shell test
```

**Run commands in specific environment:**
```console
$ hatch run test:test
$ hatch run dev:lint
```

### 8. Migration from setup.py

This project has been migrated from the legacy `setup.py` build system to the modern `pyproject.toml` with Hatch. The following files have been removed:

- `setup.py` (replaced by `pyproject.toml`)
- `setup.cfg` (configuration moved to `pyproject.toml`)
- `MANIFEST.in` (inclusion rules moved to `pyproject.toml`)

Additionally, the project now uses Hatch's built-in publishing capabilities instead of `twine`:
- `twine upload` → `hatch publish`
- Removed `twine` from development dependencies
- Simplified publishing workflow with `hatch build && hatch publish`

All functionality has been preserved and enhanced with better dependency management and isolated environments.
