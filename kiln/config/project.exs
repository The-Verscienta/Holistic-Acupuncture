import Config

# Acupuncture project overlay for KilnCMS.
#
# KilnCMS's `config/config.exs` imports this file (when present) as its very
# last step — after `#{config_env()}.exs` — so everything here overrides both
# the core defaults and the per-env config. The reusable kiln_cms repo never
# ships a `config/project.exs`; the Docker build in `kiln/Dockerfile` copies
# this one in next to the upstream config (see `kiln/README.md`).
#
# NOTE: `ash_domains` fully REPLACES the core list (Elixir config lists are
# replaced, not appended). When bumping the pinned upstream ref, diff this
# list against the one in upstream `config/config.exs` and re-sync.
#
# Drifting is not harmless. A core domain missing here is a domain the overlay
# build cannot see, so `mix ash.codegen` reads its tables as orphaned and offers
# to DROP them — and declining writes `drop_table_opted_out` into the core's
# snapshots, which then ships as an unrelated diff. Re-synced #497 after
# Billing, Federation and Experiments had each fallen out.
config :kiln_cms,
  ash_domains: [
    KilnCMS.Accounts,
    KilnCMS.CMS,
    KilnCMS.Analytics,
    KilnCMS.Firing,
    KilnCMS.History,
    KilnCMS.SearchIndex,
    KilnCMS.Mail,
    KilnCMS.Notifications,
    KilnCMS.Newsletter,
    KilnCMS.Automation,
    KilnCMS.Billing,
    KilnCMS.Federation,
    KilnCMS.Experiments,
    KilnCMS.Social,
    Acupuncture.Catalog
  ],
  # Scanned by `KilnCMS.CMS.ContentTypes` for content types, and (via
  # `Application.compile_env/3`) by the GraphQL schema and JSON:API router —
  # registering the catalog here exposes conditions/team-members/testimonials/
  # faqs on every delivery surface with no core edits.
  content_domains: [KilnCMS.CMS, Acupuncture.Catalog]

# Per-deployment session-cookie salts (kiln_cms v0.9.0, #1326). Both are
# combined with SECRET_KEY_BASE via PBKDF2 to derive the cookie's signing and
# encryption keys, so on their own they are not secrets — but the core's
# defaults are public literals shared by every KilnCMS deployment ever built,
# and upstream asks each overlay to set its own. Compile-time config
# (`KilnCMSWeb.SessionCookie` reads them via `Application.compile_env/3`), so
# they MUST be literals here: wiring them to `System.get_env/1` compiles to
# nil in the image build, and a nil or blank salt fails the build on purpose.
# Changing either value logs every editor out once.
config :kiln_cms,
  session_signing_salt: "c7SyEwlOK8QlRChM",
  session_encryption_salt: "E6kMoVgY8VQ3nJ"

# The migrated media library serves from Cloudflare Images, so the admin,
# preview and delivery CSPs must allow its host in `img-src` or every
# thumbnail renders blank. `CSP_IMG_SRC` (runtime.exs) overrides this.
config :kiln_cms, :csp_img_src, ["https://imagedelivery.net"]

# Register the plugin (D18 seams: `mix kiln.plugins.doctor`, nav, blocks).
# In test, the core's test.exs registers KilnCMS.FixturePlugin — this file is
# imported after it and replaces the list, so restate the fixture plugin too.
if config_env() == :test do
  config :kiln_cms, :plugins, [KilnCMS.FixturePlugin, Acupuncture.Plugin]
else
  config :kiln_cms, :plugins, [Acupuncture.Plugin]
end
