# The overlay's own Mix dependencies (kiln_cms #1967), appended to the core's
# deps/0 by upstream/config/project_deps_hook.exs and locked in
# config/project.lock. No `override: true` — the hook refuses it.
[
  {:kiln_cloudflare_images,
   github: "The-Verscienta/kiln_cloudflare_images", tag: "v0.1.0"}
]
