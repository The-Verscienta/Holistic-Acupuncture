/**
 * HTML to Portable Text Converter
 *
 * Converts WordPress HTML content to Sanity Portable Text format
 */

import { htmlToBlocks } from '@sanity/block-tools';
import { JSDOM } from 'jsdom';
import { Schema } from '@sanity/schema';

// Define schema for block content
const defaultSchema = Schema.compile({
  name: 'default',
  types: [
    {
      type: 'object',
      name: 'blogPost',
      fields: [
        {
          title: 'Body',
          name: 'body',
          type: 'array',
          of: [
            {
              type: 'block',
              styles: [
                { title: 'Normal', value: 'normal' },
                { title: 'H1', value: 'h1' },
                { title: 'H2', value: 'h2' },
                { title: 'H3', value: 'h3' },
                { title: 'H4', value: 'h4' },
                { title: 'Quote', value: 'blockquote' },
              ],
              lists: [
                { title: 'Bullet', value: 'bullet' },
                { title: 'Number', value: 'number' },
              ],
              marks: {
                decorators: [
                  { title: 'Strong', value: 'strong' },
                  { title: 'Emphasis', value: 'em' },
                  { title: 'Code', value: 'code' },
                ],
                annotations: [
                  {
                    name: 'link',
                    type: 'object',
                    title: 'Link',
                    fields: [
                      {
                        name: 'href',
                        type: 'string',
                        title: 'URL',
                      },
                    ],
                  },
                ],
              },
            },
          ],
        },
      ],
    },
  ],
});

const blockContentType = defaultSchema
  .get('blogPost')
  .fields.find((field) => field.name === 'body').type;

/**
 * Generate a unique key for Sanity blocks
 */
function generateKey() {
  return Math.random().toString(36).substring(2, 11);
}

/**
 * Add _key properties to blocks recursively
 */
function addKeysToBlocks(blocks) {
  if (!Array.isArray(blocks)) return blocks;

  return blocks.map(block => {
    const newBlock = { ...block };

    // Add _key to block if missing
    if (!newBlock._key) {
      newBlock._key = generateKey();
    }

    // Add _key to children if they exist
    if (Array.isArray(newBlock.children)) {
      newBlock.children = newBlock.children.map(child => ({
        ...child,
        _key: child._key || generateKey(),
      }));
    }

    // Handle nested blocks (like in lists)
    if (Array.isArray(newBlock.markDefs)) {
      newBlock.markDefs = newBlock.markDefs.map(def => ({
        ...def,
        _key: def._key || generateKey(),
      }));
    }

    return newBlock;
  });
}

/**
 * Convert WordPress HTML content to Portable Text
 */
export function convertHtmlToPortableText(html) {
  if (!html || typeof html !== 'string') {
    return [];
  }

  try {
    // Clean up WordPress-specific HTML
    let cleanedHtml = html
      // Remove WordPress caption shortcodes
      .replace(/\[caption[^\]]*\](.*?)\[\/caption\]/gi, '$1')
      // Remove WordPress gallery shortcodes
      .replace(/\[gallery[^\]]*\]/gi, '')
      // Remove other shortcodes
      .replace(/\[[^\]]+\]/g, '')
      // Fix WordPress paragraph spacing
      .replace(/<p>&nbsp;<\/p>/gi, '')
      // Remove empty paragraphs
      .replace(/<p>\s*<\/p>/gi, '')
      // Convert WordPress more tag
      .replace(/<!--more-->/gi, '');

    // Parse HTML with JSDOM
    const dom = new JSDOM(cleanedHtml);

    // Convert to Portable Text blocks with comprehensive rules
    const blocks = htmlToBlocks(cleanedHtml, blockContentType, {
      parseHtml: (htmlString) => new JSDOM(htmlString).window.document,
      rules: [
        // Custom rule for links
        {
          deserialize(el, next, block) {
            if (el.tagName.toLowerCase() === 'a') {
              const href = el.getAttribute('href');
              if (!href) return undefined;

              return {
                _type: 'span',
                marks: ['link-' + generateKey()],
                text: el.textContent,
              };
            }
            return undefined;
          },
        },
        // Custom rule for images
        {
          deserialize(el, next, block) {
            if (el.tagName.toLowerCase() === 'img') {
              return {
                _type: 'image',
                _key: generateKey(),
                _sanityAsset: 'image@' + el.getAttribute('src'),
                alt: el.getAttribute('alt') || '',
              };
            }
            return undefined;
          },
        },
        // Custom rule for iframes (embeds)
        {
          deserialize(el, next, block) {
            if (el.tagName.toLowerCase() === 'iframe') {
              return {
                _type: 'block',
                _key: generateKey(),
                children: [
                  {
                    _type: 'span',
                    _key: generateKey(),
                    text: `[Embedded content: ${el.getAttribute('src')}]`,
                  },
                ],
              };
            }
            return undefined;
          },
        },
      ],
    });

    // Ensure all blocks have _key properties
    const blocksWithKeys = addKeysToBlocks(blocks || []);
    return blocksWithKeys;
  } catch (error) {
    console.error('  ⚠️  HTML conversion error:', error.message);

    // Fallback: Strip HTML and create basic block
    const strippedText = html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();

    if (!strippedText) {
      return [];
    }

    return [
      {
        _type: 'block',
        _key: generateKey(),
        style: 'normal',
        children: [
          {
            _type: 'span',
            _key: generateKey(),
            text: strippedText,
          },
        ],
      },
    ];
  }
}

/**
 * Convert WordPress excerpt HTML to plain text
 */
export function extractExcerpt(html) {
  if (!html) return '';

  try {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#8217;/g, "'")
      .replace(/&#8220;/g, '"')
      .replace(/&#8221;/g, '"')
      .replace(/&#8211;/g, '-')
      .replace(/&#8212;/g, '—')
      .replace(/\s+/g, ' ')
      .trim();
  } catch (error) {
    return '';
  }
}

/**
 * Extract plain text from HTML (for metadata, search, etc.)
 */
export function htmlToPlainText(html) {
  return extractExcerpt(html);
}
