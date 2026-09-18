# The holistic-acupuncture site's KilnCMS instance: upstream kiln_cms (pinned
# via the `kiln/upstream` git submodule) + the `projects/acupuncture`
# subproject + `config/project.exs` overlaid at build time.
#
# Build context is the `kiln/` directory:
#   docker build kiln/
#
# The overlay keeps the kiln_cms repo 100% project-agnostic (mirrors the
# pattern in The-Verscienta/verscienta-base's `kiln/`). Bump the pinned
# upstream by updating the submodule, re-syncing config/project.exs's
# ash_domains list against upstream's config/config.exs, and rebuilding.
#
# Unlike the Verscienta overlay, this one needs none of upstream's optional
# heavy machinery (semantic search / EXLA) — the four content types compile
# in one pass, so this Dockerfile stays a straight COPY-and-compile over
# upstream's own stages. Since kiln_cms v0.9.0 the ML stack is opt-in
# (`KILN_ML=1`, #1321), and this overlay leaves it OFF: semantic search was
# never enabled for this site, and the lean tree is ~670 MB of deps smaller.
# Pass `--build-arg KILN_ML=1` to opt in. Diff against `upstream/Dockerfile`
# when bumping the pinned ref; these ARGs are expected to match it exactly
# (same hexpm/elixir tag pieces).
ARG ELIXIR_VERSION=1.19.5
ARG OTP_VERSION=27.3.4.15
ARG DEBIAN_VERSION=bookworm-20260713-slim
ARG RUNNER_DEBIAN_VERSION=trixie-20260713-slim

ARG BUILDER_IMAGE="hexpm/elixir:${ELIXIR_VERSION}-erlang-${OTP_VERSION}-debian-${DEBIAN_VERSION}"
ARG RUNNER_IMAGE="debian:${RUNNER_DEBIAN_VERSION}"

# ---- Build stage ----
FROM ${BUILDER_IMAGE} AS builder

RUN apt-get update -y \
  && apt-get install -y build-essential git libvips-dev nodejs npm \
  && apt-get clean && rm -f /var/lib/apt/lists/*_*

WORKDIR /app

RUN mix local.hex --force && mix local.rebar --force

ENV MIX_ENV="prod"

# The ML stack (Bumblebee/Nx/EXLA) is opt-in upstream (#1321): empty leaves
# it out of the dep tree entirely. See the header comment.
ARG KILN_ML=""
ENV KILN_ML=${KILN_ML}

COPY upstream/mix.exs upstream/mix.lock ./
# upstream mix.exs requires config/ml_flag.exs (which requires
# strict_test_flag.exs) to decide its dep list, so both must be in place
# before the first `mix` command that loads the project.
COPY upstream/config/ml_flag.exs upstream/config/strict_test_flag.exs config/
RUN mix deps.get --only $MIX_ENV

COPY upstream/config/config.exs upstream/config/${MIX_ENV}.exs config/
# Same split as upstream/Dockerfile: when the ML/Nx stack is in the tree it
# compiles in its own BEAM (freed on exit) before the rest, capping peak build
# RAM. See that file for the full rationale — nothing here changes it, so keep
# the two lists synced. Guarded because `mix deps.compile <name>` on an absent
# dep is an error, and without KILN_ML the stack is absent.
RUN if [ -d deps/bumblebee ]; then \
  ERL_FLAGS="+S 2:2" mix deps.compile \
  complex nx nx_image nx_signal polaris axon safetensors unpickler \
  rustler_precompiled unzip tokenizers bumblebee; \
  fi
RUN ERL_FLAGS="+S 2:2" mix deps.compile

COPY upstream/priv priv
COPY upstream/lib lib
COPY upstream/assets assets

# Overlay the acupuncture subproject on top of upstream, unconditionally (no
# PROJECT build arg — this repo builds exactly one overlay). Order matters:
# upstream's priv/ must land first so these additive COPYs don't get
# clobbered by it.
#
#   config/project.exs   — registers Acupuncture.Catalog (must precede
#                           `mix compile`: ash_domains/content_domains are
#                           read at compile time).
#   priv/repo/migrations/, priv/resource_snapshots/repo/ — distinct
#                           filenames from upstream's own, so nothing there
#                           is overwritten.
#   projects/acupuncture — a compiled source path (see upstream mix.exs
#                           elixirc_paths).
COPY config/project.exs config/project.exs
COPY priv/repo/migrations/ priv/repo/migrations/
COPY priv/resource_snapshots/repo/ priv/resource_snapshots/repo/
COPY projects/acupuncture projects/acupuncture

# Install JS dependencies (TipTap, etc.) before bundling.
RUN npm --prefix assets ci

# Compile first so Phoenix generates the colocated JS/CSS manifest that
# assets/css/app.css and assets/js/app.js import; otherwise tailwind/esbuild
# can't resolve it. Same 2-scheduler cap as upstream (Ash resources are
# memory-heavy, and this pass now also expands the four acupuncture
# resources' KilnCMS.CMS.Content macros).
RUN ERL_FLAGS="+S 2:2" mix compile
RUN mix assets.deploy

# `config/runtime/` holds the per-concern fragments runtime.exs imports
# (#1322). Both halves are required: this puts them in the build context, and
# the `:steps` hook in upstream mix.exs copies them next to runtime.exs inside
# the assembled release. Drop either and the image builds and fails on boot.
COPY upstream/config/runtime.exs config/
COPY upstream/config/runtime config/runtime
COPY upstream/rel rel

# Package application source so Sentry can show code context around stack
# frames in error reports. Must run after `lib` is present and before the
# release is assembled.
RUN mix sentry.package_source_code

RUN mix release

# Assert the overlay actually shipped. `mix release` embeds only modules
# recorded in the compile manifest; a beam present on disk without a
# manifest entry is pruned as an orphan, and the embedded-mode release then
# boots fine until the first request touching a core OR acupuncture route
# raises UndefinedFunctionError. Build-time probes can't catch this (they run
# with lazy code loading), so check what actually ships: the assembled
# release's .app :modules list.
RUN elixir -e ' \
  app = \
    Path.wildcard("_build/prod/rel/kiln_cms/lib/kiln_cms-*/ebin/kiln_cms.app") \
    |> List.first() || raise("release .app not found"); \
  {:ok, [{:application, :kiln_cms, props}]} = :file.consult(String.to_charlist(app)); \
  mods = Keyword.get(props, :modules, []); \
  for m <- [ \
    KilnCMSWeb.AshJsonApiRouter, \
    KilnCMSWeb.GraphqlSchema, \
    Acupuncture.Catalog, \
    Acupuncture.Catalog.Condition \
  ], m not in mods do \
    raise("#{inspect(m)} missing from release .app :modules — the release would 500 on its API surface") \
  end; \
  IO.puts("release wiring verified: API routers + acupuncture overlay present in .app :modules")'

# ---- Runtime stage ----
FROM ${RUNNER_IMAGE}

# See upstream/Dockerfile for the full rationale behind every package here
# (curl for the HEALTHCHECK, postgresql-client-17 pinned to the server major
# for pg_dump/pg_restore, qpdf for PDF metadata stripping, the trixie package
# renames). This runtime stage mirrors it exactly; diff on every pin bump.
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends \
     libstdc++6 openssl libncurses6 locales ca-certificates libvips42t64 curl gnupg qpdf \
  && apt-get clean && rm -f /var/lib/apt/lists/*_*

SHELL ["/bin/bash", "-o", "pipefail", "-c"]
RUN curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc \
     | gpg --dearmor -o /usr/share/keyrings/postgresql.gpg \
  && echo "deb [signed-by=/usr/share/keyrings/postgresql.gpg] https://apt.postgresql.org/pub/repos/apt trixie-pgdg main" \
     > /etc/apt/sources.list.d/pgdg.list \
  && apt-get update -y \
  && apt-get install -y --no-install-recommends postgresql-client-17 \
  && apt-get purge -y gnupg && apt-get autoremove -y \
  && apt-get clean && rm -f /var/lib/apt/lists/*_*
SHELL ["/bin/sh", "-c"]

RUN sed -i '/en_US.UTF-8/s/^# //g' /etc/locale.gen && locale-gen
ENV LANG=en_US.UTF-8 LANGUAGE=en_US:en LC_ALL=en_US.UTF-8

WORKDIR /app
# /var/backups/kiln is the default BACKUP_DIR (upstream config/runtime.exs);
# owning it here means a fresh named volume mounted there inherits `nobody`
# and the in-app Backups page can write without a manual chown.
RUN mkdir -p /var/backups/kiln && chown nobody /app /var/backups/kiln

ENV MIX_ENV="prod"

COPY --from=builder --chown=nobody:root /app/_build/${MIX_ENV}/rel/kiln_cms ./

# Build stamp — what Kiln.Version and the admin /editor/system page report
# about the running image. Both optional. The SHA is THIS repo's (the
# overlay commit) — the pinned kiln_cms ref is a property of that commit, not
# something this image reports separately.
#
#   docker build --build-arg GIT_SHA="$(git rev-parse HEAD)" \
#                --build-arg BUILD_DATE="$(date -u +%Y-%m-%dT%H:%M:%SZ)" kiln/
ARG GIT_SHA=""
ARG BUILD_DATE=""
ENV KILN_GIT_SHA=${GIT_SHA}
ENV KILN_BUILD_DATE=${BUILD_DATE}

LABEL org.opencontainers.image.title="Holistic Acupuncture Kiln" \
      org.opencontainers.image.source="https://github.com/The-Verscienta/Holistic-Acupuncture" \
      org.opencontainers.image.revision=${GIT_SHA} \
      org.opencontainers.image.created=${BUILD_DATE}

USER nobody

# Probes `/live` (serving, no DB check), NOT `/up` (DB-coupled 503) — see
# upstream/Dockerfile's HEALTHCHECK comment for why: this healthcheck
# triggers restarts, and restarting on a DB outage this container can't fix
# only restart-storms the replicas. Keep in sync with upstream.
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD curl -fsS "http://127.0.0.1:${PORT:-4000}/live" || exit 1

# Run pending migrations before starting (see upstream/Dockerfile rationale:
# Coolify's pre-deployment hook only runs in an already-running container, so
# this makes migrations unconditional on every boot; Ecto.Migrator's
# advisory lock keeps this safe if this ever scales beyond one replica).
CMD ["/bin/sh", "-c", "/app/bin/migrate && /app/bin/server"]
