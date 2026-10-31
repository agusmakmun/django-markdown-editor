# CLAUDE.md

Martor: a Markdown editor (Ace) for Django forms and the Django admin, with live preview,
image upload, emoji and mentions. Published to PyPI as `martor`.

## Layout

- `martor/widgets.py`: `MartorWidget` / `AdminMartorWidget`, renders `martor/<theme>/editor.html` and
  declares the static `Media`. Settings are passed to the JS as `data-*` attributes on the textarea.
- `martor/settings.py`: every `MARTOR_*` setting and its default. Add new settings here.
- `martor/views.py`, `martor/urls.py`: markdownify (preview), imgur upload, user search endpoints.
- `martor/utils.py`: `markdownify()` = Python-Markdown + bleach (with `CSSSanitizer`).
- `martor/extensions/`: custom Markdown extensions (urlize, video, mention, emoji, escape_html, ...).
- `martor/templates/martor/{bootstrap,semantic,tailwind}/`: per-theme editor, toolbar, guide and emoji templates.
- `martor/static/martor/{css,js}/`: martor's own assets, one set per theme plus `martor-admin.css`.
- `martor/static/plugins/`: vendored third-party files (ace, highlight.js, jquery, Bootstrap 5.3.8 bundle,
  Semantic UI 2.5.0, Tailwind CSS v4). Don't edit them by hand:
  - Bootstrap/Semantic: copy from the npm packages. For Semantic, rewrite
    `themes/default/assets/{fonts,images}/` URLs to `../fonts/` / `../images/` and drop the Google Fonts `@import`.
  - Tailwind: generated from `.etc/tailwind.input.css` (only the utilities martor's tailwind templates/JS
    use). Rebuild after changing tailwind classes, see the command in that file. It's Tailwind v4, so use
    v4 class names (`bg-black/75`, not `bg-opacity-*`).
  - jQuery stays on 3.x: martor's JS uses `$.trim`, which jQuery 4 removed.
- `martor_demo/`: demo project for manual testing. One set of templates for every theme
  (`app/templates/demo/`), assets come from `{{ media }}` like a real project, and `app/static/demo/`
  holds the page styles and the light/dark toggle (same `localStorage` key as django admin).
- `martor/tests/`: test suite.

## Commands

The virtualenv lives one level up: use `../bin/python` (Python 3.9, Django 4.2).

```bash
../bin/python runtests.py          # test suite (what CI runs)
pre-commit run --all-files         # isort, black, pyupgrade, flake8, whitespace (line length 120)
../bin/python -m mypy martor       # type check
../bin/python -m build             # package build sanity check

# demo: admin at /admin/app/post/add/, frontend at /simple-form/
cd martor_demo && ../../bin/python manage.py runserver 127.0.0.1:8765
```

- Switch theme for manual testing: `MARTOR_THEME` in `martor_demo/martor_demo/settings.py`.
  Don't commit that change (`git checkout martor_demo/martor_demo/settings.py`).
- Pre-commit runs on every commit. If a commit fails because a hook rewrote files, re-stage and
  commit again. `martor/static/plugins/` (vendored) is excluded from the hooks, so keep it that way.
- Don't bump black/isort in `.pre-commit-config.yaml` casually: newer versions reformat the whole codebase.

## Rules

### Static files: always edit the source, then regenerate the `.min` file
Widgets load only the `.min.css` / `.min.js` files, so a change to the source alone does nothing.
Keep the 8-line header comment at the top of each min file and append the minified body:

```bash
S=$(mktemp)
f=martor/static/martor/js/martor.bootstrap   # or css/martor-admin, css/martor.semantic, ...
awk '/\*\*\//{print; exit} {print}' $f.min.js > $S   # keep existing header
npx -y terser@5 $f.js -c -m >> $S && mv $S $f.min.js
# CSS: npx -y clean-css-cli@5 -O1 $f.css >> $S ; echo >> $S ; mv $S $f.min.css
node -e "require('vm').createScript(require('fs').readFileSync('$f.min.js','utf8'))"   # JS syntax check
```

- Never use online minifiers: one of them stripped the spaces from descendant selectors in
  `martor.semantic.min.css` and silently broke rules.
- A JS change goes into all three themes (`martor.{bootstrap,semantic,tailwind}.js`). They share most code.

### Admin CSS (`martor-admin.css`)
- `MartorWidget.Media` adds it to every widget, frontend forms included, while
  `MARTOR_ENABLE_ADMIN_CSS` is `True` (default). So every rule needs a sane fallback outside the admin,
  where Django's CSS variables are undefined, and admin-only resets are scoped with
  `:where(#container)` / `body:where(:has(#container))` (no added specificity).
- Any page can theme the editor and rendered `.martor-preview` output by defining the same variables
  (the demo does, see `martor_demo/app/static/demo/demo.css`).
- The theme CSS (bootstrap/semantic/tailwind) is loaded globally into the Django admin, so
  conflicts are patched here. Write the fix in this file, not in the vendored plugin CSS.
- Colours must use Django's CSS variables (`--body-bg`, `--body-fg`, `--body-quiet-color`,
  `--body-loud-color`, `--darkened-bg`, `--border-color`, `--hairline-color`, `--link-fg`) with a
  light fallback, e.g. `var(--body-bg, #fff)`. They follow both the OS setting and the admin theme
  toggle (`html[data-theme]`). Don't use `@media (prefers-color-scheme)` alone, and don't override
  `:root` variables or `body` colours.
- Watch specificity. Fixes for vendor resets (tailwind preflight `img, svg {display:block}`) must
  stay below Django's class rules (e.g. `.theme-toggle svg`), or admin UI breaks.
- The editor sits inside Django's `form .aligned`, whose label/list rules leak in
  (`label {display:block}`, `ul {margin-left:160px}`, no bullets).
- Semantic UI moves modals out of `.main-martor` to `<body>`, so scope modal rules by
  `.modal-help-guide` / `.modal-emoji`, not `.main-martor`.

### Python
- Keep backwards compatibility: new settings default to the old behaviour (e.g.
  `MARTOR_MARKDOWNIFY_LOGIN_REQUIRED = False`).
- Settings are read at import time. Tests that use `override_settings` rely on the reload hook in
  `martor/tests/tests.py` (`_on_settings_changed`).
- Raw HTML in markdown is escaped on purpose (`escape_html` extension) and the output is sanitized by
  bleach. Don't weaken this.
- Add a test in `martor/tests/tests.py` for any new behaviour.

### Verify UI changes in a browser
CSS/JS bugs here are visual. Run the demo and check bootstrap, semantic and tailwind, each in light
mode, dark via the admin toggle and dark via the OS. Browsers cache the min files, so hard-reload.

## Release

1. Bump `__version__` and `__release_date__` in `martor/__init__.py`.
2. Add an entry at the top of `docs/changelog.rst` (mark it `(Current)`).
3. Update the header (`Martor vX.Y.Z`, `Release date`) in every file under `martor/static/martor/`.
4. Merge to `master`, then push a `vX.Y.Z` tag. `.github/workflows/release.yml` builds and
   uploads to PyPI on any tag push.
5. `gh release create vX.Y.Z --title vX.Y.Z --generate-notes --latest`.

Work on a branch and open a PR. CI tests Python 3.8-3.13 against Django 4.2-5.2.
