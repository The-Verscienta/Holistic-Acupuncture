#!/bin/sh
# Assemble upstream kiln_cms + the acupuncture overlay into a working tree for
# local development and tests — the same composition kiln/Dockerfile builds.
#
# Usage: ./dev-assemble.sh [target-dir]   (default: ../.kiln-dev, git-ignored)
set -eu

KILN_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
TARGET=${1:-"$KILN_DIR/../.kiln-dev"}

if [ ! -f "$KILN_DIR/upstream/mix.exs" ]; then
  echo "kiln/upstream submodule is empty — run: git submodule update --init" >&2
  exit 1
fi

mkdir -p "$TARGET"
# Sync upstream sources (exclude VCS + build artifacts), then overlay.
# config/project.exs is overlay-owned (absent upstream) — exclude it so
# --delete doesn't remove it every run (which forced a fresh-mtime re-copy
# below and tripped a running dev server's stale-config check).
rsync -a --delete --exclude '.git' --exclude '_build' --exclude 'deps' \
  --exclude 'node_modules' --exclude 'config/project.exs' \
  "$KILN_DIR/upstream/" "$TARGET/"
rsync -a "$KILN_DIR/projects/" "$TARGET/projects/"
# Overlay the acupuncture subproject's migrations + resource snapshots
# (additive: distinct filenames, so upstream priv/ is never clobbered —
# upstream ships no acupuncture schema). NOT --delete.
rsync -a "$KILN_DIR/priv/" "$TARGET/priv/"
# Copy only when the content actually changed: a fresh mtime on a config file
# makes a running dev server's code reloader refuse every request ("must
# restart your server") until a forced recompile.
if ! cmp -s "$KILN_DIR/config/project.exs" "$TARGET/config/project.exs" 2>/dev/null; then
  cp "$KILN_DIR/config/project.exs" "$TARGET/config/project.exs"
fi

# Shim for upstream refs that predate the config/project.exs hook (idempotent;
# no-op once upstream config.exs imports project.exs itself).
if ! grep -q 'project.exs' "$TARGET/config/config.exs"; then
  printf '\n# Downstream project overlay (appended by kiln/dev-assemble.sh shim)\nif File.exists?(Path.join(__DIR__, "project.exs")), do: import_config("project.exs")\n' \
    >> "$TARGET/config/config.exs"
fi

echo "Assembled kiln_cms + acupuncture overlay at: $TARGET"
