#!/usr/bin/env node
/**
 * Generates static HTML redirect pages for all remaining crawled WordPress URLs
 * that don't already have a redirect page.
 *
 * Covers:
 *  - Old WordPress static pages (about-us, contact-us-2, how-acupuncture-works, etc.)
 *  - WordPress attachment/sub-path URLs (photo-by-*, blog-slug/sub-path)
 *  - Blog pagination (/blog/page/3/)
 *  - welcome-website-* sub-paths
 *  - wp-content PDF URLs (creates HTML at directory-equivalent path)
 *
 * Run: node scripts/generate-missing-redirects.js
 * (called automatically from prebuild)
 */

import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
const SITE_URL = 'https://holisticacupuncture.net';

// Map of URL path (no leading slash, no trailing slash) → redirect destination
// Destinations with # are hash fragments (client-side only, which is fine here)
const REDIRECTS = {
  // -------------------------------------------------------------------------
  // Old WordPress static pages
  // -------------------------------------------------------------------------
  'contact-us-2':                        '/contact/',
  'position-available':                  '/contact/',
  'career-opportunities':                '/contact/',
  'contact-us-2/map':                    '/contact/',
  'about-us':                            '/about/',
  'about-the-staff':                     '/about/',
  'treatment-room':                      '/about/',
  'how-acupuncture-works':               '/acupuncture/',
  'diagnosis':                           '/acupuncture/',
  'specials':                            '/services/',
  '29-acupuncture-special-thankyou':     '/services/',
  'health-newsletters':                  '/blog/',
  'privacy-policy':                      '/privacy/',
  'photo-by-saranya7':                   '/',

  // -------------------------------------------------------------------------
  // Old blog post that exists on new site but was missed in generate-blog-redirect-pages
  // -------------------------------------------------------------------------
  '3d-still-showing-sciatica-nerve':     '/blog/3d-still-showing-sciatica-nerve/',

  // -------------------------------------------------------------------------
  // Blog pagination
  // -------------------------------------------------------------------------
  'blog/page/3':                         '/blog/',

  // -------------------------------------------------------------------------
  // about-us/* sub-paths (WordPress media attachments)
  // -------------------------------------------------------------------------
  'about-us/philip-photo-6-28-21img_4943':   '/about/',
  'about-us/curry-solo-1200x1600':           '/about/',
  'about-us/2023-best-of-plaque':            '/about/',
  'about-us/img_2752-edit':                  '/about/',
  'about-us/2024-10-29_12-51-44_871':        '/about/',

  // -------------------------------------------------------------------------
  // about-the-staff/* sub-paths
  // -------------------------------------------------------------------------
  'about-the-staff/melissa':             '/about/',

  // -------------------------------------------------------------------------
  // welcome-website-acupuncture-holistic-health-associates/* sub-paths
  // -------------------------------------------------------------------------
  'welcome-website-acupuncture-holistic-health-associates/staff-photo-2-25-2025':            '/',
  'welcome-website-acupuncture-holistic-health-associates/community-awards':                 '/',
  'welcome-website-acupuncture-holistic-health-associates/meet-the-team-at-the-clinic-1':   '/',
  'welcome-website-acupuncture-holistic-health-associates/ahha-staff-2021':                  '/',
  'welcome-website-acupuncture-holistic-health-associates/milwaukee-top-choice-for-acupuncture': '/',
  'welcome-website-acupuncture-holistic-health-associates/best-acupuncture-banner':          '/',
  'welcome-website-acupuncture-holistic-health-associates/morgan':                           '/',
  'welcome-website-acupuncture-holistic-health-associates/bom2021_logo_finalist_k':          '/',
  'welcome-website-acupuncture-holistic-health-associates/img_0170-2':                       '/',
  'welcome-website-acupuncture-holistic-health-associates/community-choice-awards-full-paper2025': '/',

  // -------------------------------------------------------------------------
  // 2697-2/* sub-paths
  // -------------------------------------------------------------------------
  '2697-2/chicken-vegetable-soup-with-chicken-5': '/blog/',
  '2697-2/chicken':                               '/blog/',

  // -------------------------------------------------------------------------
  // sleep/* sub-paths
  // -------------------------------------------------------------------------
  'sleep/sleep-2':                       '/conditions/#mental-health',

  // -------------------------------------------------------------------------
  // Blog post attachment/sub-path pages → parent blog post
  // -------------------------------------------------------------------------
  'summer-health-tips-from-an-acupuncturist/photo-by-aleksandr-eremin':
    '/blog/summer-health-tips-from-an-acupuncturist/',
  'signs-that-you-need-acupuncture/young-woman-with-neck-and-shoulder-pain-close-up':
    '/blog/signs-that-you-need-acupuncture/',
  'exploring-colon-cleanses-myths-methods-and-what-really-works/photo-by-birgith-roosipuu':
    '/blog/exploring-colon-cleanses-myths-methods-and-what-really-works/',
  'exploring-colon-cleanses-myths-methods-and-what-really-works/photo-by-dimmis-vart':
    '/blog/exploring-colon-cleanses-myths-methods-and-what-really-works/',
  'oil-pulling-modern-oral-health/photo-by-skyler-ewing':
    '/blog/oil-pulling-modern-oral-health/',
  'preparing-for-the-holidays/photo-by-megan-watson':
    '/blog/preparing-for-the-holidays/',
  'acupuncture-for-fertility/photo-by-febe-vanermen':
    '/blog/acupuncture-for-fertility/',
  'food-medicine-winter-months/photo-by-atle-mo':
    '/blog/food-medicine-winter-months/',
  'can-acupuncture-help-treat-acne/photo-by-muthia-ashifa-salsabella':
    '/blog/can-acupuncture-help-treat-acne/',
  'the-dangers-of-msg/msg':
    '/blog/the-dangers-of-msg/',
  'the-shen-in-chinese-medicine-nurturing-the-spirit-for-optimal-health/photo-by-greg-rakozy':
    '/blog/the-shen-in-chinese-medicine-nurturing-the-spirit-for-optimal-health/',
  'winters-end-spring-transition/photo-by-mary-hinton':
    '/blog/winters-end-spring-transition/',
  'the-yi-in-chinese-medicine/photo-by-mailchimp':
    '/blog/the-yi-in-chinese-medicine/',
  'the-po-the-bodys-soul-in-chinese-medicine/photo-by-wallace-henry':
    '/blog/the-po-the-bodys-soul-in-chinese-medicine/',
  'how-does-your-immune-system-work/allergies':
    '/blog/how-does-your-immune-system-work/',
  'the-role-of-the-hun-in-chinese-medicine-understanding-the-ethereal-soul/photo-by-teslariu-mihai':
    '/blog/the-role-of-the-hun-in-chinese-medicine-understanding-the-ethereal-soul/',
  'the-liver-in-chinese-medicine-nurturing-your-bodys-general-for-optimal-health/photo-by-julien-tromeur-3':
    '/blog/the-liver-in-chinese-medicine-nurturing-your-bodys-general-for-optimal-health/',
  'stevia-faq-questions-and-answers-about-stevia-sweeteners/photo-by-mathilde-langevin':
    '/blog/stevia-faq-questions-and-answers-about-stevia-sweeteners/',
  'fortify-your-defenses-5-time-tested-strategies-from-classical-chinese-medicine-to-prevent-illness/photo-by-milada-vigerova':
    '/blog/fortify-your-defenses-5-time-tested-strategies-from-classical-chinese-medicine-to-prevent-illness/',
  'fluid-metabolism-in-chinese-medicine/fluids':
    '/blog/fluid-metabolism-in-chinese-medicine/',

  // -------------------------------------------------------------------------
  // wp-content PDF links → /blog/
  // Creates a directory named e.g. "skin-newsletter.pdf" with index.html inside.
  // Handles the trailing-slash variant (/skin-newsletter.pdf/) which Cloudflare
  // Pages serves as a directory index. The non-slash variant may still 404 but
  // this is best-effort for PDF attachment URLs.
  // -------------------------------------------------------------------------
  'wp-content/uploads/2025/04/oriental-medicine-and-emotions.pdf': '/blog/',
  'wp-content/uploads/2015/10/skin-newsletter.pdf':                '/blog/',
  'wp-content/uploads/2015/10/sugar-newsletter.pdf':               '/blog/',
  'wp-content/uploads/2015/10/steps-to-maintain-a-healthy-digestive-tract.pdf': '/blog/',
  'wp-content/uploads/2014/03/skin-conditions.pdf':                '/blog/',
  'wp-content/uploads/2015/10/raw-foods.pdf':                      '/blog/',
  'wp-content/uploads/2015/10/oriental-nutrition-newsletter.pdf':  '/blog/',
  'wp-content/uploads/2015/10/acupuncture-needle-safety.pdf':      '/blog/',
  'wp-content/uploads/2015/10/discontinuing-medication-you-currently-take-newsletter.pdf': '/blog/',
  'wp-content/uploads/2015/10/western-vs-oriental-medicine-newsletter.pdf': '/blog/',
  'wp-content/uploads/2015/10/womens-reproductive-health.pdf':     '/blog/',
};

function buildHtml(dest) {
  const abs = dest.startsWith('http') ? dest : `${SITE_URL}${dest}`;
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="canonical" href="${abs}" />
    <meta http-equiv="refresh" content="0; url=${dest}" />
    <script>window.location.replace('${dest}');</script>
    <title>Redirecting…</title>
  </head>
  <body></body>
</html>
`;
}

let count = 0;
for (const [slug, dest] of Object.entries(REDIRECTS)) {
  const dir = join(publicDir, ...slug.split('/'));
  if (existsSync(join(dir, 'index.html'))) continue;
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), buildHtml(dest));
  count++;
}

console.log(`Generated ${count} missing redirect page(s).`);
