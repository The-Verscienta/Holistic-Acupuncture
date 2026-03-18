#!/usr/bin/env node
/**
 * Generates static HTML redirect pages for old WordPress blog post URLs.
 *
 * Old WordPress URLs were /:slug (no /blog/ prefix).
 * New URLs are /blog/:slug.
 *
 * The Cloudflare Worker intercepts all unknown paths and returns 404 before
 * _redirects rules are consulted. Static files bypass this: the Worker serves
 * them directly. So we generate public/:slug/index.html with a client-side
 * redirect for every blog post.
 *
 * Run: node scripts/generate-blog-redirect-pages.js
 * (called automatically from prebuild)
 */

import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
const SITE_URL = 'https://holisticacupuncture.net';

// All blog post slug redirects: old slug → new /blog/slug path
const BLOG_REDIRECTS = {
  'what-you-didnt-know-about-acupuncture-faqs-answered': '/blog/what-you-didnt-know-about-acupuncture-faqs-answered',
  'exploring-colon-cleanses-myths-methods-and-what-really-works': '/blog/exploring-colon-cleanses-myths-methods-and-what-really-works',
  'the-po-the-bodys-soul-in-chinese-medicine': '/blog/the-po-the-bodys-soul-in-chinese-medicine',
  'acupuncture-for-new-years-wellness-tips-for-staying-healthy-in-2025': '/blog/acupuncture-for-new-years-wellness-tips-for-staying-healthy-in-2025',
  'oil-pulling-modern-oral-health': '/blog/oil-pulling-modern-oral-health',
  'the-yi-in-chinese-medicine': '/blog/the-yi-in-chinese-medicine',
  'chinese-herbs-and-you': '/blog/chinese-herbs-and-you',
  'the-role-of-acupuncture-in-weight-loss-and-healthy-eating-a-natural-approach-for-milwaukee-residents': '/blog/the-role-of-acupuncture-in-weight-loss-and-healthy-eating-a-natural-approach-for-milwaukee-residents',
  'exploring-the-depths-of-acupuncture-unraveling-its-mechanisms-and-latest-scientific-insights': '/blog/exploring-the-depths-of-acupuncture-unraveling-its-mechanisms-and-latest-scientific-insights',
  'the-role-of-the-hun-in-chinese-medicine-understanding-the-ethereal-soul': '/blog/the-role-of-the-hun-in-chinese-medicine-understanding-the-ethereal-soul',
  'acupuncture-treatment-for-carpal-tunnel-syndrome-faq': '/blog/acupuncture-treatment-for-carpal-tunnel-syndrome-faq',
  'tea-key-maintaining-immune-strength-winter': '/blog/tea-key-maintaining-immune-strength-winter',
  'herbal-remedies-and-acupuncture-the-perfect-duo-for-healing-in-milwaukee-wisconsin': '/blog/herbal-remedies-and-acupuncture-the-perfect-duo-for-healing-in-milwaukee-wisconsin',
  'what-is-a-symptom': '/blog/what-is-a-symptom',
  'oriental-nutrition-things-eat-fall': '/blog/oriental-nutrition-things-eat-fall',
  'acupuncture-for-digestive-disorders': '/blog/acupuncture-for-digestive-disorders',
  'how-acupuncture-can-help-with-menstrual-pain-in-milwaukee-wisconsin': '/blog/how-acupuncture-can-help-with-menstrual-pain-in-milwaukee-wisconsin',
  'oriental-nutrition-secrets-for-eating-healthy-in-the-spring-season-a-guide-from-acupuncture-and-holistic-health-associates-in-milwaukee-wisconsin': '/blog/oriental-nutrition-secrets-for-eating-healthy-in-the-spring-season-a-guide-from-acupuncture-and-holistic-health-associates-in-milwaukee-wisconsin',
  'caffeine': '/blog/caffeine',
  'soup-or-salad': '/blog/soup-or-salad',
  'first-time-acupuncture-in-milwaukee-wisconsin-heres-what-to-expect': '/blog/first-time-acupuncture-in-milwaukee-wisconsin-heres-what-to-expect',
  'acupuncture-for-digestive-issues-a-natural-approach-in-milwaukee-wisconsin': '/blog/acupuncture-for-digestive-issues-a-natural-approach-in-milwaukee-wisconsin',
  'acupuncture-vs-traditional-western-medicine-benefits-and-differences': '/blog/acupuncture-vs-traditional-western-medicine-benefits-and-differences',
  'new-years-resolutions-through-classical-chinese-medicine-setting-intentions-for-holistic-health': '/blog/new-years-resolutions-through-classical-chinese-medicine-setting-intentions-for-holistic-health',
  '4-common-conditions-that-respond-well-to-acupuncture': '/blog/4-common-conditions-that-respond-well-to-acupuncture',
  'how-acupuncture-helps-athletes-recover-faster-in-milwaukee-wisconsin': '/blog/how-acupuncture-helps-athletes-recover-faster-in-milwaukee-wisconsin',
  'acupuncture-for-preventative-health-keeping-your-body-in-balance-in-milwaukee': '/blog/acupuncture-for-preventative-health-keeping-your-body-in-balance-in-milwaukee',
  'acupuncture-for-winter-health-boost-your-immunity-this-season-in-milwaukee': '/blog/acupuncture-for-winter-health-boost-your-immunity-this-season-in-milwaukee',
  '4-things-seniors-should-know-about-acupuncture': '/blog/4-things-seniors-should-know-about-acupuncture',
  'honoring-mothers-through-the-wisdom-of-chinese-medicine': '/blog/honoring-mothers-through-the-wisdom-of-chinese-medicine',
  'how-to-get-the-most-out-of-supplements-you-take': '/blog/how-to-get-the-most-out-of-supplements-you-take',
  'healing-reactions-what-are-they': '/blog/healing-reactions-what-are-they',
  'can-acupuncture-help-treat-acne': '/blog/can-acupuncture-help-treat-acne',
  'year-of-the-dragon': '/blog/year-of-the-dragon',
  '10-tips-for-staying-healthy-with-temperature-swings': '/blog/10-tips-for-staying-healthy-with-temperature-swings',
  'how-acupuncture-helps-children-with-allergies-and-asthma-in-milwaukee': '/blog/how-acupuncture-helps-children-with-allergies-and-asthma-in-milwaukee',
  'is-acupuncture-safe-what-you-need-to-know': '/blog/is-acupuncture-safe-what-you-need-to-know',
  'what-the-chinese-lunar-new-year-means-to-you-and-your-health-in-milwaukee': '/blog/what-the-chinese-lunar-new-year-means-to-you-and-your-health-in-milwaukee',
  'stevia-faq-questions-and-answers-about-stevia-sweeteners': '/blog/stevia-faq-questions-and-answers-about-stevia-sweeteners',
  'acupuncture-for-winter-immunity-boosting-defenses-against-colds': '/blog/acupuncture-for-winter-immunity-boosting-defenses-against-colds',
  'seasonal-affective-disorder-tdp-lamps': '/blog/seasonal-affective-disorder-tdp-lamps',
  'using-acupuncture-to-overcome-stress-overwhelm-and-anxiety': '/blog/using-acupuncture-to-overcome-stress-overwhelm-and-anxiety',
  'acupuncture-for-fertility': '/blog/acupuncture-for-fertility',
  '5-common-myths-about-acupuncture-debunked-milwaukee-wisconsin': '/blog/5-common-myths-about-acupuncture-debunked-milwaukee-wisconsin',
  'castor-oil-healing': '/blog/castor-oil-healing',
  'embracing-autumn-how-acupuncture-can-support-your-seasonal-transition': '/blog/embracing-autumn-how-acupuncture-can-support-your-seasonal-transition',
  '3-electrolyte-packed-mocktail-recipes-to-keep-you-hydrated': '/blog/3-electrolyte-packed-mocktail-recipes-to-keep-you-hydrated',
  'what-is-a-tdp-lamp-and-how-does-it-work': '/blog/what-is-a-tdp-lamp-and-how-does-it-work',
  'food-medicine-winter-months': '/blog/food-medicine-winter-months',
  'acupuncture-as-a-help-for-diabetes-mellitus-and-diabetic-peripheral-neuropathy': '/blog/acupuncture-as-a-help-for-diabetes-mellitus-and-diabetic-peripheral-neuropathy',
  'fortify-your-defenses-5-time-tested-strategies-from-classical-chinese-medicine-to-prevent-illness': '/blog/fortify-your-defenses-5-time-tested-strategies-from-classical-chinese-medicine-to-prevent-illness',
  'acupuncture-degenerative-disc-disease': '/blog/acupuncture-degenerative-disc-disease',
  'unlocking-chinese-herbal-medicine': '/blog/unlocking-chinese-herbal-medicine',
  'the-shen-in-chinese-medicine-nurturing-the-spirit-for-optimal-health': '/blog/the-shen-in-chinese-medicine-nurturing-the-spirit-for-optimal-health',
  'how-does-acupuncture-work-a-beginners-guide-to-acupuncture-in-milwaukee-wisconsin': '/blog/how-does-acupuncture-work-a-beginners-guide-to-acupuncture-in-milwaukee-wisconsin',
  'what-does-acupuncture-feel-like-exactly': '/blog/what-does-acupuncture-feel-like-exactly',
  'the-science-behind-acupuncture-for-stress-relief': '/blog/the-science-behind-acupuncture-for-stress-relief',
  'acupuncture-for-the-microbiome': '/blog/acupuncture-for-the-microbiome',
  'acupuncture-for-back-pain-a-comprehensive-guide': '/blog/acupuncture-for-back-pain-a-comprehensive-guide',
  'natural-sunscreen': '/blog/natural-sunscreen',
  'acupuncture-vs-chiropractic-which-is-right-for-you-in-milwaukee-wisconsin': '/blog/acupuncture-vs-chiropractic-which-is-right-for-you-in-milwaukee-wisconsin',
  'acupuncture-for-stomach-issues': '/blog/acupuncture-for-stomach-issues',
  'functional-acupuncture-vs-community-acupuncture': '/blog/functional-acupuncture-vs-community-acupuncture',
  'what-is-acupuncture-and-how-does-it-work': '/blog/what-is-acupuncture-and-how-does-it-work',
  'yoga-for-your-mind-body-and-soul': '/blog/yoga-for-your-mind-body-and-soul',
  'diet-and-your-immune-function': '/blog/diet-and-your-immune-function',
  'how-acupuncture-treats-allergies': '/blog/how-acupuncture-treats-allergies',
  'fast-and-easy-chai-tea-recipe': '/blog/fast-and-easy-chai-tea-recipe',
  'healthy-coffee-vs-tea': '/blog/healthy-coffee-vs-tea',
  'what-to-know-about-headaches-and-acupuncture': '/blog/what-to-know-about-headaches-and-acupuncture',
  'acupuncture-for-better-sleep-how-to-create-a-restful-routine': '/blog/acupuncture-for-better-sleep-how-to-create-a-restful-routine',
  'why-milwaukee-residents-are-choosing-acupuncture-for-back-pain-relief': '/blog/why-milwaukee-residents-are-choosing-acupuncture-for-back-pain-relief',
  'why-being-grateful-is-good-medicine': '/blog/why-being-grateful-is-good-medicine',
  'combining-acupuncture-with-yoga-a-milwaukee-wellness-guide': '/blog/combining-acupuncture-with-yoga-a-milwaukee-wellness-guide',
  'gmo-vs-non-gmo-foods': '/blog/gmo-vs-non-gmo-foods',
  'buyer-beware-tips-for-choosing-an-acupuncturist': '/blog/buyer-beware-tips-for-choosing-an-acupuncturist',
  'embrace-a-natural-and-healthy-lifestyle-simple-tips-for-wellness-in-milwaukee-wi': '/blog/embrace-a-natural-and-healthy-lifestyle-simple-tips-for-wellness-in-milwaukee-wi',
  'four-golden-rules-of-acupuncture': '/blog/four-golden-rules-of-acupuncture',
  'zhi-willpower-housed-in-the-kidneys': '/blog/zhi-willpower-housed-in-the-kidneys',
  'fluid-metabolism-in-chinese-medicine': '/blog/fluid-metabolism-in-chinese-medicine',
  'treating-fatty-liver-disease-a-holistic-chinese-medicine-approach': '/blog/treating-fatty-liver-disease-a-holistic-chinese-medicine-approach',
  'why-choose-acupuncture-over-painkillers': '/blog/why-choose-acupuncture-over-painkillers',
  'spring-cleansing': '/blog/spring-cleansing',
  'everything-you-need-to-know-about-using-acupuncture-for-pain-management': '/blog/everything-you-need-to-know-about-using-acupuncture-for-pain-management',
  'winters-end-spring-transition': '/blog/winters-end-spring-transition',
  'faqs-about-perimenopause-treatment-and-acupuncture': '/blog/faqs-about-perimenopause-treatment-and-acupuncture',
  'year-of-the-water-tiger-is-almost-upon-us': '/blog/year-of-the-water-tiger-is-almost-upon-us',
  'acupuncture-for-allergies': '/blog/acupuncture-for-allergies',
  'signs-that-you-need-acupuncture': '/blog/signs-that-you-need-acupuncture',
  'acupuncture-for-womens-health-issues': '/blog/acupuncture-for-womens-health-issues',
  'athletes-tendon-ligament-injuries': '/blog/athletes-tendon-ligament-injuries',
  'heart-function-natural-solutions-heart-related-health-problems': '/blog/heart-function-natural-solutions-heart-related-health-problems',
  'healthy-eating-starts-with-the-cookware': '/blog/healthy-eating-starts-with-the-cookware',
  'the-five-branches-of-oriental-medicine': '/blog/the-five-branches-of-oriental-medicine',
  'using-acupuncture-for-headaches-and-migraines-in-milwaukee-a-natural-approach-to-pain-relief': '/blog/using-acupuncture-for-headaches-and-migraines-in-milwaukee-a-natural-approach-to-pain-relief',
  'how-does-your-immune-system-work': '/blog/how-does-your-immune-system-work',
  'preparing-for-the-holidays': '/blog/preparing-for-the-holidays',
  'pumpkin-power': '/blog/pumpkin-power',
  'staying-healthy-during-the-holidays-can-be-tough': '/blog/staying-healthy-during-the-holidays-can-be-tough',
  'healthy-habits': '/blog/healthy-habits',
  'quick-and-easy-spring-noodle-soup': '/blog/quick-and-easy-spring-noodle-soup',
  'the-dangers-of-msg': '/blog/the-dangers-of-msg',
  'summer-health-tips-from-an-acupuncturist': '/blog/summer-health-tips-from-an-acupuncturist',
  'the-liver-in-chinese-medicine-nurturing-your-bodys-general-for-optimal-health': '/blog/the-liver-in-chinese-medicine-nurturing-your-bodys-general-for-optimal-health',
};

function buildHtml(dest) {
  const abs = `${SITE_URL}${dest}/`;
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="canonical" href="${abs}" />
    <meta http-equiv="refresh" content="0; url=${dest}/" />
    <script>window.location.replace('${dest}/');</script>
    <title>Redirecting…</title>
  </head>
  <body></body>
</html>
`;
}

let count = 0;
for (const [slug, dest] of Object.entries(BLOG_REDIRECTS)) {
  const dir = join(publicDir, slug);
  // Skip if an index.html already exists (e.g. from generate-hash-redirects.js)
  if (existsSync(join(dir, 'index.html'))) continue;
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), buildHtml(dest));
  count++;
}

console.log(`Generated ${count} blog redirect page(s).`);
