/**
 * Kiln block renderer — the single serializer for Kiln block trees, replacing
 * the three per-page Portable Text serializers used in the Sanity era.
 *
 * A Kiln `rich_text` block's `body` is canonical Portable Text (the same
 * shape Sanity stored), so the text/mark/style handling carries over — with
 * list support added, which the old serializers lacked.
 *
 * All text is HTML-escaped and all URLs pass the sanitize helpers, so block
 * content is safe to inject with set:html.
 */

import { escapeHtml, safeHref, safeImageSrc } from './sanitize';

type Block = Record<string, any>;

const P_CLASS = 'text-gray-700 leading-relaxed mb-6';

function renderSpan(child: any, markDefs: any[]): string {
  let text = escapeHtml(child.text || '');
  for (const mark of child.marks || []) {
    if (mark === 'strong') text = `<strong>${text}</strong>`;
    else if (mark === 'em') text = `<em>${text}</em>`;
    else if (mark === 'underline') text = `<u>${text}</u>`;
    else if (mark === 'strike') text = `<s>${text}</s>`;
    else if (mark === 'code')
      text = `<code class="bg-gray-100 px-2 py-1 rounded text-sm">${text}</code>`;
    else {
      const def = markDefs?.find((d: any) => d._key === mark);
      const safeUrl = def && def._type === 'link' ? safeHref(def.href) : null;
      if (safeUrl) {
        text = `<a href="${escapeHtml(safeUrl)}" class="text-sage-600 hover:text-sage-700 underline" target="_blank" rel="noopener noreferrer">${text}</a>`;
      }
    }
  }
  return text;
}

function renderPtBlock(block: Block): string {
  const content = (block.children || [])
    .map((child: any) => renderSpan(child, block.markDefs || []))
    .join('');

  // WordPress-migrated blocks sometimes hold multiple paragraphs joined by
  // newlines inside one PT block.
  if (content.includes('\n') && (block.style || 'normal') === 'normal') {
    return content
      .split('\n')
      .filter((p: string) => p.trim())
      .map((p: string) => `<p class="${P_CLASS}">${p.trim()}</p>`)
      .join('');
  }

  switch (block.style || 'normal') {
    case 'h1':
      return `<h1 class="text-4xl font-heading font-bold text-charcoal mt-12 mb-6">${content}</h1>`;
    case 'h2':
      return `<h2 class="text-3xl font-heading font-bold text-charcoal mt-10 mb-5">${content}</h2>`;
    case 'h3':
      return `<h3 class="text-2xl font-heading font-bold text-charcoal mt-8 mb-4">${content}</h3>`;
    case 'h4':
      return `<h4 class="text-xl font-heading font-semibold text-charcoal mt-6 mb-3">${content}</h4>`;
    case 'blockquote':
      return `<blockquote class="border-l-4 border-sage-500 pl-6 py-2 my-6 italic text-gray-700">${content}</blockquote>`;
    default:
      return `<p class="${P_CLASS}">${content}</p>`;
  }
}

/** Render a Portable Text array (a rich_text block's `body`) to HTML. */
export function renderPortableText(body: Block[]): string {
  const html: string[] = [];
  let list: { type: string; items: string[] } | null = null;

  const flushList = () => {
    if (!list) return;
    const tag = list.type === 'number' ? 'ol' : 'ul';
    const listClass =
      list.type === 'number' ? 'list-decimal pl-6 mb-6 space-y-2' : 'list-disc pl-6 mb-6 space-y-2';
    html.push(
      `<${tag} class="${listClass}">${list.items
        .map((item) => `<li class="text-gray-700 leading-relaxed">${item}</li>`)
        .join('')}</${tag}>`
    );
    list = null;
  };

  for (const block of body || []) {
    if (block._type !== 'block') continue;
    if (block.listItem) {
      const content = (block.children || [])
        .map((child: any) => renderSpan(child, block.markDefs || []))
        .join('');
      if (!list || list.type !== block.listItem) {
        flushList();
        list = { type: block.listItem, items: [] };
      }
      list.items.push(content);
    } else {
      flushList();
      html.push(renderPtBlock(block));
    }
  }
  flushList();
  return html.join('');
}

/** Render a Kiln block tree (a record's `blocks` array) to HTML. */
export function renderBlocks(blocks: Block[]): string {
  return (blocks || [])
    .map((block) => {
      switch (block._type) {
        case 'rich_text': {
          if (Array.isArray(block.body) && block.body.length) {
            return renderPortableText(block.body);
          }
          // legacy_html blocks are sanitized by Kiln on write; still, only
          // trust them as a fallback for un-migrated content.
          return block.legacy_html || '';
        }
        case 'heading': {
          const level = Math.min(Math.max(Number(block.level) || 2, 1), 6);
          const classes =
            level <= 2
              ? 'text-3xl font-heading font-bold text-charcoal mt-10 mb-5'
              : 'text-2xl font-heading font-bold text-charcoal mt-8 mb-4';
          return `<h${level} class="${classes}">${escapeHtml(block.text || '')}</h${level}>`;
        }
        case 'image': {
          const src = safeImageSrc(block.url || '');
          if (!src) return '';
          const alt = escapeHtml(block.alt || '');
          const caption = block.caption ? escapeHtml(block.caption) : '';
          return (
            `<figure class="my-8"><img src="${src}" alt="${alt}" loading="lazy" decoding="async" class="rounded-lg shadow-md w-full" />` +
            (caption
              ? `<figcaption class="text-sm text-gray-600 mt-2 text-center">${caption}</figcaption>`
              : '') +
            '</figure>'
          );
        }
        case 'quote': {
          const citation = block.citation
            ? `<cite class="block text-sm text-gray-600 mt-2 not-italic">— ${escapeHtml(block.citation)}</cite>`
            : '';
          return `<blockquote class="border-l-4 border-sage-500 pl-6 py-2 my-6 italic text-gray-700">${escapeHtml(block.text || '')}${citation}</blockquote>`;
        }
        case 'divider':
          return '<hr class="my-10 border-gray-200" />';
        case 'embed': {
          const href = safeHref(block.url);
          return href
            ? `<p class="${P_CLASS}"><a href="${escapeHtml(href)}" class="text-sage-600 hover:text-sage-700 underline" target="_blank" rel="noopener noreferrer">${escapeHtml(href)}</a></p>`
            : '';
        }
        default:
          return '';
      }
    })
    .join('');
}

/** Plain text of a block tree — for FAQ answers, meta descriptions, read time. */
export function blocksToPlainText(blocks: Block[]): string {
  return (blocks || [])
    .map((block) => {
      if (block._type === 'rich_text' && Array.isArray(block.body)) {
        return block.body
          .map((pt: Block) => (pt.children || []).map((c: any) => c.text || '').join(''))
          .join('\n\n');
      }
      if (block._type === 'heading') return block.text || '';
      if (block._type === 'quote') return block.text || '';
      return '';
    })
    .filter(Boolean)
    .join('\n\n');
}

/** Estimated read time in minutes from a block tree (200 wpm). */
export function readTimeMinutes(blocks: Block[]): number {
  const words = blocksToPlainText(blocks).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
