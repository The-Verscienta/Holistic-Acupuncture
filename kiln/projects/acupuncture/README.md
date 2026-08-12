# Acupuncture on KilnCMS

The content catalog backing the [holistic-acupuncture](https://holisticacupuncture.net)
site's migration off Sanity: four content types on `KilnCMS.CMS.Content` —
**Condition**, **TeamMember**, **Testimonial**, **Faq** — registered on the
`Acupuncture.Catalog` Ash domain, plus the one-time Sanity import scripts.

See [`kiln/README.md`](../../README.md) for how this overlay is built,
activated and deployed.

## Layout

| Path | Purpose |
| --- | --- |
| `catalog.ex`, `catalog/` | `Acupuncture.Catalog` domain + the four content-type resources (each `use KilnCMS.CMS.Content, domain: Acupuncture.Catalog`). Originally generated with `mix kiln.gen.content` (kiln_cms#439). |
| `plugin.ex` | `Acupuncture.Plugin` (D18) — declares the domain for `mix kiln.plugins.doctor`. |
| `../../priv/repo/migrations/` | The catalog's Ash migrations: the eight tables (four types + their `_versions`) and the hand-written search-vector migration. Overlaid onto upstream's `priv/repo/migrations/` at build time. |
| `../../priv/resource_snapshots/repo/` | The matching `ash.codegen` snapshots — kept here so upstream kiln_cms ships zero acupuncture schema. |
| `../../priv/repo/acupuncture_field_definitions.exs` | 27 custom-field definitions (24 across the four types + 3 on core `post` for the migrated blog). Idempotent; run before the import. |
| `../../priv/repo/acupuncture_import.exs` | The Sanity content import (kiln_cms#441). Loads the export produced by the Astro repo's `scripts/export-to-kiln.js`. Idempotent by natural key. |

## The Sanity migration

One-time, after activation, against a seeded admin (`ADMIN_EMAIL`, default
`admin@kiln.test`):

```bash
mix run priv/repo/acupuncture_field_definitions.exs
mix run priv/repo/acupuncture_import.exs path/to/kiln-export.json
```

Both are idempotent and safe to re-run; the field-definitions script is the
source of truth for the custom fields (condition category/symptoms,
team-member credentials, testimonial ratings, FAQ categories, post bylines).
The import publishes each record and then restores its original Sanity
`published_at` with a direct `Repo` update.

In a running release, use `rpc` (same pattern as the assembled dev tree, just
against the live node):

```bash
bin/kiln_cms rpc 'Code.eval_file("priv/repo/acupuncture_field_definitions.exs")'
bin/kiln_cms rpc 'Code.eval_file("priv/repo/acupuncture_import.exs", ["/path/to/kiln-export.json"])'
```
