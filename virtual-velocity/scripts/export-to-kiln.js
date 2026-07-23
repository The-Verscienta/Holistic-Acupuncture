/**
 * Export all published Sanity content as Kiln-ready JSON.
 *
 * Produces one JSON file consumed by kiln_cms's import script
 * (priv/repo/acupuncture_import.exs): media items (metadata-only, pointing at
 * Cloudflare Images), categories/tags, and one record per document with
 * blocks already in Kiln's shape — Kiln rich_text bodies are canonical
 * Portable Text, so Sanity PT passes through nearly verbatim; inline PT
 * images split into Kiln image blocks referencing media by Sanity asset ref
 * (the importer swaps refs for MediaItem UUIDs).
 *
 *   node scripts/export-to-kiln.js [output-path] [--all-media]
 *                                  (default output: kiln-export.json)
 *
 * By default only media referenced by content documents are exported.
 * --all-media additionally emits one media item per entry in
 * public/cloudflare-images-index.json (the full 700+ image library,
 * including unreferenced WordPress-era uploads), deduped against the
 * content-referenced set.
 *
 * Requires PUBLIC_SANITY_PROJECT_ID / PUBLIC_SANITY_DATASET in .env.
 */

import { createClient } from '@sanity/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const ALL_MEDIA = args.includes('--all-media');
const OUT_PATH =
  args.find((a) => !a.startsWith('--')) || path.join(__dirname, '../kiln-export.json');
const INDEX_PATH = path.join(__dirname, '../public/cloudflare-images-index.json');
const ACCOUNT_HASH = 't5tnnNBoCpmnml-JZw7JMA';

const CATEGORY_LABELS = {
  wellness: 'Wellness',
  'pain-management': 'Pain Management',
  'getting-started': 'Getting Started',
  'mental-health': 'Mental Health',
  'womens-health': "Women's Health",
  nutrition: 'Nutrition',
};

const sanity = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
});

// Sanity asset ref -> Cloudflare image id
const cfIndex = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf-8'));
const refToCf = new Map();
for (const entry of cfIndex) {
  if (entry.sanity && entry.cloudflare) {
    refToCf.set(entry.sanity.asset._ref, entry);
  }
}

const cfUrl = (id, opts = '') =>
  `https://imagedelivery.net/${ACCOUNT_HASH}/${id}/public${opts}`;

// Media registry: one entry per unique Sanity asset ref used anywhere.
const media = new Map();

function registerMedia(sanityImage, altFallback = '') {
  const ref = sanityImage?.asset?._ref;
  if (!ref) return null;
  const cf = refToCf.get(ref);
  if (!cf) {
    console.warn(`  WARN no Cloudflare mapping for ${ref} — skipping media`);
    return null;
  }
  if (!media.has(ref)) {
    // Dimensions from the asset ref (image-<hash>-<WxH>-<ext>), falling back to the index.
    const dims = ref.match(/-(\d+)x(\d+)-(\w+)$/);
    const width = dims ? Number(dims[1]) : cf.width || null;
    const height = dims ? Number(dims[2]) : cf.height || null;
    const ext = dims ? dims[3] : 'jpg';
    media.set(ref, {
      sanity_ref: ref,
      filename: cf.filename || `${ref}.${ext}`,
      content_type:
        cf.mimeType ||
        (ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg'),
      width,
      height,
      url: cfUrl(cf.cloudflare.id),
      variants: {
        thumb: { url: cfUrl(cf.cloudflare.id, '?width=400'), width: 400 },
        medium: { url: cfUrl(cf.cloudflare.id, '?width=800'), width: 800 },
        large: { url: cfUrl(cf.cloudflare.id, '?width=1200'), width: 1200 },
      },
      alt: sanityImage.alt || cf.altText || altFallback || '',
    });
  }
  return ref;
}

// Split a Sanity Portable Text array into Kiln blocks: runs of text blocks
// become one rich_text block (body passes through — Kiln PT is Sanity PT);
// inline images become image blocks tagged with media_ref for the importer.
function ptToKilnBlocks(ptArray, altFallback = '') {
  if (!Array.isArray(ptArray) || ptArray.length === 0) return [];
  const blocks = [];
  let run = [];
  const flush = () => {
    if (run.length) {
      blocks.push({ _type: 'rich_text', body: run });
      run = [];
    }
  };
  for (const item of ptArray) {
    if (item._type === 'block') {
      run.push(item);
    } else if (item._type === 'image') {
      flush();
      if (item.asset) {
        const ref = registerMedia(item, altFallback);
        if (ref) blocks.push({ _type: 'image', media_ref: ref, alt: item.alt || '' });
      } else if (item._sanityAsset) {
        // WP-migrated inline image: a bare URL, no Sanity asset.
        let url = item._sanityAsset.replace(/^image@/, '');
        blocks.push({ _type: 'image', url, alt: item.alt || '' });
      }
    }
    // Other inline types (none in this dataset) are dropped.
  }
  flush();
  return blocks;
}

const textToPt = (text) =>
  String(text)
    .split(/\n\s*\n/)
    .filter((p) => p.trim())
    .map((p, i) => ({
      _type: 'block',
      _key: `p${i}`,
      style: 'normal',
      markDefs: [],
      children: [{ _type: 'span', text: p.trim(), marks: [] }],
    }));

const textBlock = (text) =>
  text && String(text).trim() ? [{ _type: 'rich_text', body: textToPt(text) }] : [];

const headingBlock = (text) => ({ _type: 'heading', text, level: 2 });

// One-per-line encoding for list custom fields; " | " joins structured parts.
const lines = (arr) => (Array.isArray(arr) && arr.length ? arr.join('\n') : null);
const structuredLines = (arr, parts) =>
  Array.isArray(arr) && arr.length
    ? arr.map((o) => parts.map((k) => o?.[k] ?? '').join(' | ')).join('\n')
    : null;

const compact = (obj) =>
  Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== null && v !== undefined && v !== '')
  );

async function main() {
  const records = [];
  const categories = new Map();
  const tags = new Map();

  // --- Blog -> post --------------------------------------------------------
  const blogs = await sanity.fetch(
    `*[_type == "blog" && !(_id in path("drafts.**"))] | order(publishedAt asc) {
      ..., "author": author->{name, slug, role}
    }`
  );
  for (const doc of blogs) {
    if (!doc.slug?.current) continue;
    const categorySlug = doc.category || doc.categories?.[0] || null;
    if (categorySlug && !categories.has(categorySlug)) {
      categories.set(categorySlug, CATEGORY_LABELS[categorySlug] || titleize(categorySlug));
    }
    const tagSlugs = [];
    for (const tag of doc.tags || []) {
      const slug = slugify(tag);
      // Skip empties, duplicates-after-slugify ("Acupuncture" vs "acupuncture"),
      // and numeric-only WordPress term-id cruft.
      if (!slug || tagSlugs.includes(slug) || /^\d+$/.test(slug)) continue;
      if (!tags.has(slug)) tags.set(slug, tag);
      tagSlugs.push(slug);
    }
    records.push(
      compact({
        type: 'post',
        title: doc.title,
        slug: doc.slug.current,
        excerpt: doc.excerpt || null,
        seo_title: doc.seo?.metaTitle || null,
        seo_description: doc.seo?.metaDescription || null,
        published_at: doc.publishedAt || doc._createdAt,
        category_slug: categorySlug,
        tag_slugs: tagSlugs.length ? tagSlugs : null,
        featured_image_ref: doc.featuredImage ? registerMedia(doc.featuredImage, doc.title) : null,
        custom_fields: compact({
          featured: doc.featured === true ? true : null,
          author_name: doc.author?.name || null,
          author_slug: doc.author?.slug?.current || null,
        }),
        blocks: ptToKilnBlocks(doc.body, doc.title),
      })
    );
  }

  // --- Condition -----------------------------------------------------------
  const conditions = await sanity.fetch(
    `*[_type == "condition" && !(_id in path("drafts.**"))] | order(order asc) {
      ..., "related_slugs": relatedConditions[]->slug.current
    }`
  );
  for (const doc of conditions) {
    if (!doc.slug?.current) continue;
    records.push(
      compact({
        type: 'condition',
        title: doc.name,
        slug: doc.slug.current,
        excerpt: doc.description || null,
        seo_title: doc.seo?.metaTitle || null,
        seo_description: doc.seo?.metaDescription || null,
        related_slugs: (doc.related_slugs || []).filter(Boolean),
        custom_fields: compact({
          category: doc.category || 'other',
          icon: doc.icon || null,
          symptoms: lines(doc.symptoms),
          treatment_duration: doc.treatmentDuration || null,
          featured: doc.featuredOnHomepage === true ? true : null,
          display_order: doc.order ?? null,
        }),
        // Two Sanity rich-text fields fold into one body, separated by a heading.
        blocks: [
          ...ptToKilnBlocks(doc.detailedDescription, doc.name),
          ...(doc.howAcupunctureHelps?.length
            ? [headingBlock('How Acupuncture Helps'), ...ptToKilnBlocks(doc.howAcupunctureHelps, doc.name)]
            : []),
        ],
      })
    );
  }

  // --- Team member ---------------------------------------------------------
  const members = await sanity.fetch(
    `*[_type == "teamMember" && !(_id in path("drafts.**"))] | order(order asc)`
  );
  for (const doc of members) {
    if (!doc.slug?.current) continue;
    records.push(
      compact({
        type: 'team_member',
        title: doc.name,
        slug: doc.slug.current,
        excerpt: doc.shortBio || null,
        published: doc.active !== false, // inactive members import as drafts
        featured_image_ref: doc.photo ? registerMedia(doc.photo, doc.name) : null,
        custom_fields: compact({
          role: doc.role || 'Practitioner',
          credentials: doc.credentials || null,
          specialties: lines(doc.specialties),
          certifications: structuredLines(doc.certifications, ['title', 'organization', 'year']),
          education: structuredLines(doc.education, ['degree', 'school', 'year']),
          years_experience: doc.yearsExperience ?? null,
          languages: lines(doc.languages),
          email: doc.email || null,
          phone: doc.phone || null,
          display_order: doc.order ?? null,
        }),
        blocks: ptToKilnBlocks(doc.bio, doc.name),
      })
    );
  }

  // --- Testimonial ---------------------------------------------------------
  const testimonials = await sanity.fetch(
    `*[_type == "testimonial" && !(_id in path("drafts.**"))] | order(date asc)`
  );
  const testimonialSlugs = new Set();
  testimonials.forEach((doc, i) => {
    let slug = slugify(doc.author || `testimonial-${i}`);
    while (testimonialSlugs.has(slug)) slug = `${slug}-2`;
    testimonialSlugs.add(slug);
    records.push(
      compact({
        type: 'testimonial',
        title: doc.author || 'Anonymous',
        slug,
        excerpt: doc.quote || null,
        featured_image_ref: doc.avatar ? registerMedia(doc.avatar, doc.author) : null,
        custom_fields: compact({
          condition_treated: doc.condition || null,
          rating: doc.rating ?? null,
          review_date: doc.date || null,
          featured: doc.featured === true ? true : null,
          verified: doc.verified === true ? true : null,
        }),
        blocks: textBlock(doc.quote),
      })
    );
  });

  // --- FAQ -----------------------------------------------------------------
  const faqs = await sanity.fetch(
    `*[_type == "faq" && !(_id in path("drafts.**"))] | order(order asc)`
  );
  const faqSlugs = new Set();
  for (const doc of faqs) {
    if (!doc.question) continue;
    let slug = slugify(doc.question).slice(0, 80).replace(/-$/, '');
    while (faqSlugs.has(slug)) slug = `${slug}-2`;
    faqSlugs.add(slug);
    records.push(
      compact({
        type: 'faq',
        title: doc.question,
        slug,
        custom_fields: compact({
          category: doc.category || 'about-acupuncture',
          featured: doc.featured === true ? true : null,
          display_order: doc.order ?? null,
        }),
        blocks: textBlock(doc.answer),
      })
    );
  }

  // --all-media: sweep the rest of the Cloudflare Images library into the
  // media list so the whole library lands in Kiln, not just images that
  // content documents happen to reference.
  if (ALL_MEDIA) {
    const before = media.size;
    let unmapped = 0;
    for (const entry of cfIndex) {
      if (!entry.cloudflare) {
        unmapped++;
        continue;
      }
      const ref = entry.sanity?.asset?._ref;
      if (!ref || media.has(ref)) continue;
      registerMedia({ asset: { _ref: ref } }, entry.title || '');
    }
    console.log(
      `  --all-media: +${media.size - before} unreferenced library images` +
        (unmapped ? ` (${unmapped} index entries without a Cloudflare id skipped)` : '')
    );
  }

  const out = {
    exported_at: new Date().toISOString(),
    source: {
      project_id: process.env.PUBLIC_SANITY_PROJECT_ID,
      dataset: process.env.PUBLIC_SANITY_DATASET || 'production',
    },
    media: [...media.values()],
    categories: [...categories].map(([slug, name]) => ({ slug, name })),
    tags: [...tags].map(([slug, name]) => ({ slug, name })),
    records,
  };

  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 1));
  const counts = records.reduce((acc, r) => ((acc[r.type] = (acc[r.type] || 0) + 1), acc), {});
  console.log(`Exported to ${OUT_PATH}`);
  console.log(
    `  records: ${records.length} (${Object.entries(counts)
      .map(([t, n]) => `${t}: ${n}`)
      .join(', ')})`
  );
  console.log(`  media: ${media.size}, categories: ${categories.size}, tags: ${tags.size}`);
}

function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function titleize(slug) {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
