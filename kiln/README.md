# Kiln CMS — Acupuncture instance (overlay build)

The holistic-acupuncture site's Kiln CMS deployment, assembled from two parts,
mirroring the pattern established by
[The-Verscienta/verscienta-base](https://github.com/The-Verscienta/verscienta-base)'s
`kiln/`:

- **`upstream/`** — a git submodule pinning [The-Verscienta/kiln_cms](https://github.com/The-Verscienta/kiln_cms)
  at an exact commit. The kiln_cms repo is a **fully generic, reusable CMS** —
  it contains nothing acupuncture-specific.
- **The overlay** (this directory) — everything acupuncture-specific, laid on
  top at Docker build time:

| Path | Purpose |
| --- | --- |
| `projects/acupuncture/` | The acupuncture subproject: `Acupuncture.Catalog` Ash domain (condition, team member, testimonial, faq), the one-time Sanity import scripts. Extracted from kiln_cms (originally landed there in kiln_cms#439/#441; previously built in-tree via kiln_cms's `PROJECT=acupuncture`/`PROJECT=example` build arg until kiln_cms#1230 renamed that in-tree demo away from the business it was actually serving). |
| `config/project.exs` | Registers `Acupuncture.Catalog` in `ash_domains`/`content_domains`. Upstream's `config/config.exs` imports it (when present) as its final step, so the domain is wired into the admin, importer, GraphQL and JSON:API surfaces with zero core edits. |
| `priv/repo/migrations/`, `priv/resource_snapshots/` | Ash migrations + snapshots for the four acupuncture content types. Kept downstream so upstream kiln_cms ships zero acupuncture schema; overlaid onto upstream's `priv/` at build time. |
| `priv/repo/acupuncture_field_definitions.exs`, `priv/repo/acupuncture_import.exs` | The one-time Sanity migration — see [`projects/acupuncture/README.md`](projects/acupuncture/README.md). |
| `Dockerfile` | Multi-stage release build: upstream sources + overlay. Mirrors upstream's own Dockerfile (same builder args, libvips runtime) — this overlay needs none of Verscienta's optional EXLA/semantic-search machinery, so it builds upstream's lean tree (`KILN_ML` unset) in a straight single-pass compile. |

The running service is deployed by Coolify from the image this repo's CI
builds (see "Building & deploying" below) — Coolify no longer builds directly
from the kiln_cms repo's source.

## Why an overlay (and not a fork or vendored copy)

kiln_cms is the base for multiple projects and moves fast; copying its source
here would diverge within days. Kiln was designed for this split: `projects/`
is in its `elixirc_paths` but core config never registers any project domain,
and its stock Dockerfile doesn't ship `projects/` at all.

This also fixes a real incident: kiln_cms previously committed this overlay
in-tree as `projects/acupuncture` (a "worked example" that happened to double
as the actual production config, since no separate downstream repo existed
yet). kiln_cms#1230 renamed it to `projects/example` to remove an assumed
namespace collision with "a real downstream project" — except that project
didn't exist yet, so the rename broke this site's Coolify deploy outright.
Extracting the overlay here, the same way Verscienta's already is, removes
that coupling for good: kiln_cms stays business-agnostic, and this repo owns
its own build.

## Building & deploying

```bash
git submodule update --init          # once, or after a ref bump
docker build kiln/
```

Production deploys are automated by `.github/workflows/deploy-kiln.yml`: a
push to `main` touching `kiln/**` (or a manual `workflow_dispatch`) builds the
image, pushes it to `ghcr.io/<owner>/holistic-acupuncture-kiln`, and triggers
the Coolify webhook in the `COOLIFY_KILN_WEBHOOK_URL` secret. The build clones
the private `kiln/upstream` submodule via the `KILN_CMS_TOKEN` secret.

Kiln runs on Postgres (Coolify-managed, external to any compose stack). Pass
its connection string as `DATABASE_URL` on the Coolify resource. On boot the
release runs `bin/migrate` before starting.

## Running the import

In a release, use `rpc` (runs in the live, already-started node):

```bash
bin/kiln_cms rpc 'Code.eval_file("priv/repo/acupuncture_field_definitions.exs")'
bin/kiln_cms rpc 'Code.eval_file("priv/repo/acupuncture_import.exs", ["/path/to/kiln-export.json"])'
```

See [`projects/acupuncture/README.md`](projects/acupuncture/README.md) for
what each script does and the Sanity → Kiln field mapping.

## Local development / running the tests

Assemble a working tree that mimics what the Dockerfile builds (upstream +
overlay), then run kiln's usual mix workflow. Needs **Elixir 1.19+** — upstream
declares `elixir: "~> 1.19"`, so an older toolchain stops at `mix deps.get`:

```bash
./dev-assemble.sh /tmp/kiln-acupuncture   # copies upstream + overlays this dir
cd /tmp/kiln-acupuncture
mix deps.get
mix compile
```

## Bumping the pinned upstream

Pin to a release tag, not `main` — upstream's
[overlay contract](upstream/docs/overlay-contract.md) only covers tagged
minors. Read every `Upgrade notes` section between the old and new tag in
upstream's `CHANGELOG.md` (or the GitHub release) first.

1. `cd kiln/upstream && git fetch --tags && git checkout <new-tag>`
2. Diff the things the overlay duplicates against upstream:
   - `config/project.exs` — re-sync the `ash_domains` list with upstream
     `config/config.exs` (ours must be *core list + `Acupuncture.Catalog`*).
     `:plugins` and `:content_domains` replace the core list the same way.
   - `Dockerfile` — diff the builder and runtime stages against
     `upstream/Dockerfile` for changed build steps; the ARG pins must match.
3. Regenerate the overlay's schema. A core minor may add columns to *our*
   tables (the `KilnCMS.CMS.Content` macro contributes attributes to every
   overlay resource, and the core's codegen can't see our `priv/`) — this is
   the failure mode that has taken production down before (`undefined_column`
   on the first content API request). In the assembled tree, or in the
   built image's `builder` stage:

   ```bash
   mix ash.codegen <migration_name>   # writes priv/repo/migrations + snapshots
   mix ash.codegen --check            # must then be clean
   mix kiln.plugins.doctor            # domains registered, no collisions
   ```

   Copy the new migration and snapshot files back into `kiln/priv/`. Only the
   acupuncture tables should appear — a core table in the diff means
   `ash_domains` drifted (step 2).
4. Commit the submodule pointer together with the re-sync and the new
   migration in one commit; `deploy-kiln.yml` builds it on merge.

Without a local Elixir 1.19 toolchain, step 3's commands run inside the
image's builder stage:

```bash
docker build --target builder -t kiln-acu-builder kiln/
docker run --rm kiln-acu-builder mix ash.codegen --check
```
