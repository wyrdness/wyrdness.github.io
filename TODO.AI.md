# TODO

Issues discovered incidentally while implementing the logo/category/map/full-content
fixes (2026-08-28), out of scope for that work, logged per AI.md's
"no issue left only in conversation" rule.

- `browse/index.html` result cards (and likely `js/favorites.js`) use
  `class="card" card__header card__body card__footer card__title` — none of these
  classes have any matching rule in `css/*.css`. Cards render unstyled.
- Two orphaned generated pages exist with stale pre-fix content (old logo, old
  "visit the GitHub repository" template): `phenomena/aj-acha-te-oh-te/index.html`
  and `phenomena/el-sombreron/index.html`. Their source sibling repos no longer
  exist on disk, so `generate-pages.js` never regenerates or removes them —
  `make build` doesn't clean orphaned output when a source repo disappears/renames.
- `make validate-html` references a Docker image that no longer exists/is
  inaccessible (`cyb3rjak3/html5validator-action:latest` — pull access denied).
  Needs a working html5validator image or replacement tool.
- Sibling repo `el-sombrer-n` (likely renamed from/to `el-sombreron`) has no
  `api.json`, so `aggregate-local.js` reports `Errors: 1` on every build
  (`make validate-schema` confirms: `[missing] el-sombrer-n - api.json not present`).
  Content gap, not a code bug — needs the repo's `api.json` populated or the
  repo removed from the org.
