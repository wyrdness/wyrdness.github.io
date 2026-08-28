# TODO

- Sibling repo `el-sombrer-n` (likely renamed from/to `el-sombreron`) has no
  `api.json`, so `aggregate-local.js` reports `Errors: 1` on every build
  (`make validate-schema` confirms: `[missing] el-sombrer-n - api.json not present`).
  Content gap, not a code bug — needs the repo's `api.json` populated or the
  repo removed from the org.
