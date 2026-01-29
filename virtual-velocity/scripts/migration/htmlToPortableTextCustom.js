/**
 * Custom HTML to Portable Text Converter
 *
 * Properly converts WordPress HTML to Sanity Portable Text format
 * preserving paragraphs, headings, bold, italic, links, lists, etc.
 */

import { JSDOM } from 'jsdom';

/**
 * Generate a unique key for Sanity blocks
 */
function generateKey() {
  return Math.random().toString(36).substring(2, 11);
}

/**
 * Process a text node and its inline formatting
 */
function processTextNode(node, markDefs = []) {
  const marks = [];
  let currentNode = node;
  let parent = node.parentNode;

  // Walk up the tree to collect marks
  while (parent && parent.tagName) {
    const tag = parent.tagName.toLowerCase();

    if (tag === 'strong' || tag === 'b') {
      marks.push('strong');
    } else if (tag === 'em' || tag === 'i') {
      marks.push('em');
    } else if (tag === 'code') {
      marks.push('code');
    } else if (tag === 'a') {
      const href = parent.getAttribute('href');
      if (href) {
        const linkKey = generateKey();
        marks.push(linkKey);
        markDefs.push({
          _key: linkKey,
          _type: 'link',
          href: href,
        });
      }
    } else if (tag === 'p' || tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'h4' || tag === 'h5' || tag === 'h6' || tag === 'blockquote' || tag === 'li' || tag === 'ul' || tag === 'ol') {
      // Stop at block-level elements
      break;
    }

    parent = parent.parentNode;
  }

  return {
    _type: 'span',
    _key: generateKey(),
    text: node.textContent,
    marks: marks.length > 0 ? marks : undefined,
  };
}

/**
 * Process inline content within a block element
 */
function processInlineContent(element) {
  const children = [];
  const markDefs = [];

  function processNode(node) {
    if (node.nodeType === 3) { // Text node
      const text = node.textContent;
      if (text && text.trim()) {
        const span = processTextNode(node, markDefs);
        // Merge markDefs from this span
        if (span.marks) {
          span.marks.forEach((mark) => {
            if (typeof mark === 'string' && !['strong', 'em', 'code'].includes(mark)) {
              // This is a link mark, find its definition
              const existingDef = markDefs.find(def => def._key === mark);
              if (!existingDef) {
                // Find the link in the parent tree
                let parent = node.parentNode;
                while (parent) {
                  if (parent.tagName && parent.tagName.toLowerCase() === 'a') {
                    const href = parent.getAttribute('href');
                    if (href) {
                      markDefs.push({
                        _key: mark,
                        _type: 'link',
                        href: href,
                      });
                    }
                    break;
                  }
                  parent = parent.parentNode;
                }
              }
            }
          });
        }
        children.push(span);
      }
    } else if (node.nodeType === 1) { // Element node
      const tag = node.tagName.toLowerCase();

      if (tag === 'br') {
        // Add a newline
        children.push({
          _type: 'span',
          _key: generateKey(),
          text: '\n',
        });
      } else if (tag === 'strong' || tag === 'b' || tag === 'em' || tag === 'i' || tag === 'a' || tag === 'code' || tag === 'span') {
        // Process children of inline elements
        Array.from(node.childNodes).forEach(processNode);
      } else {
        // For other elements, just get text content
        const text = node.textContent;
        if (text && text.trim()) {
          children.push({
            _type: 'span',
            _key: generateKey(),
            text: text.trim(),
          });
        }
      }
    }
  }

  Array.from(element.childNodes).forEach(processNode);

  // If no children, add empty span
  if (children.length === 0) {
    children.push({
      _type: 'span',
      _key: generateKey(),
      text: '',
    });
  }

  return { children, markDefs };
}

/**
 * Convert an HTML element to a Portable Text block
 */
function elementToBlock(element) {
  const tag = element.tagName.toLowerCase();

  // Get style based on tag
  let style = 'normal';
  if (tag === 'h1') style = 'h1';
  else if (tag === 'h2') style = 'h2';
  else if (tag === 'h3') style = 'h3';
  else if (tag === 'h4') style = 'h4';
  else if (tag === 'h5') style = 'h4'; // Map h5 to h4
  else if (tag === 'h6') style = 'h4'; // Map h6 to h4
  else if (tag === 'blockquote') style = 'blockquote';

  const { children, markDefs } = processInlineContent(element);

  const block = {
    _type: 'block',
    _key: generateKey(),
    style: style,
    children: children,
  };

  if (markDefs.length > 0) {
    block.markDefs = markDefs;
  }

  return block;
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
    const document = dom.window.document;
    const body = document.body;

    const blocks = [];

    // Process each child element
    function processElement(element) {
      const tag = element.tagName ? element.tagName.toLowerCase() : null;

      if (!tag) {
        // Text node at body level - wrap in paragraph
        const text = element.textContent?.trim();
        if (text) {
          blocks.push({
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            children: [{
              _type: 'span',
              _key: generateKey(),
              text: text,
            }],
          });
        }
        return;
      }

      // Handle block elements
      if (tag === 'p' || tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'h4' || tag === 'h5' || tag === 'h6' || tag === 'blockquote') {
        // Check if this block contains images
        const hasImages = element.querySelector && element.querySelector('img') !== null;

        if (hasImages) {
          // Extract images first, then handle remaining text
          Array.from(element.childNodes).forEach(child => {
            if (child.nodeType === 1 && child.tagName.toLowerCase() === 'img') {
              blocks.push({
                _type: 'image',
                _key: generateKey(),
                _sanityAsset: 'image@' + child.getAttribute('src'),
                alt: child.getAttribute('alt') || '',
              });
            } else if (child.nodeType === 1) {
              processElement(child);
            } else if (child.nodeType === 3 && child.textContent?.trim()) {
              // Text node - create a text block
              blocks.push({
                _type: 'block',
                _key: generateKey(),
                style: tag === 'p' ? 'normal' : tag,
                children: [{
                  _type: 'span',
                  _key: generateKey(),
                  text: child.textContent.trim(),
                }],
              });
            }
          });
        } else {
          const text = element.textContent?.trim();
          if (text) {
            blocks.push(elementToBlock(element));
          }
        }
      } else if (tag === 'ul' || tag === 'ol') {
        // Handle lists
        const listType = tag === 'ul' ? 'bullet' : 'number';
        const items = element.querySelectorAll('li');

        items.forEach((item) => {
          const { children, markDefs } = processInlineContent(item);
          const block = {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            listItem: listType,
            children: children,
          };
          if (markDefs.length > 0) {
            block.markDefs = markDefs;
          }
          blocks.push(block);
        });
      } else if (tag === 'img') {
        // Handle images
        blocks.push({
          _type: 'image',
          _key: generateKey(),
          _sanityAsset: 'image@' + element.getAttribute('src'),
          alt: element.getAttribute('alt') || '',
        });
      } else if (tag === 'iframe') {
        // Handle iframes
        blocks.push({
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [{
            _type: 'span',
            _key: generateKey(),
            text: `[Embedded content: ${element.getAttribute('src')}]`,
          }],
        });
      } else if (tag === 'div' || tag === 'section' || tag === 'article') {
        // Check if div contains images (including nested in links)
        const hasImages = element.querySelector && element.querySelector('img') !== null;

        // Check if div contains only inline elements (links, spans, text)
        const hasOnlyInlineContent = !hasImages && Array.from(element.childNodes).every(child => {
          if (child.nodeType === 3) return true; // Text node
          if (child.nodeType === 1) {
            const childTag = child.tagName.toLowerCase();
            return ['a', 'span', 'strong', 'em', 'b', 'i', 'code', 'br'].includes(childTag);
          }
          return false;
        });

        if (hasOnlyInlineContent && element.textContent?.trim()) {
          // Treat as inline content and create a block
          const { children, markDefs } = processInlineContent(element);
          const block = {
            _type: 'block',
            _key: generateKey(),
            style: 'normal',
            children: children,
          };
          if (markDefs.length > 0) {
            block.markDefs = markDefs;
          }
          blocks.push(block);
        } else {
          // Recursively process container elements
          Array.from(element.childNodes).forEach(child => {
            if (child.nodeType === 1) {
              processElement(child);
            } else if (child.nodeType === 3 && child.textContent?.trim()) {
              // Text node - wrap in paragraph
              blocks.push({
                _type: 'block',
                _key: generateKey(),
                style: 'normal',
                children: [{
                  _type: 'span',
                  _key: generateKey(),
                  text: child.textContent.trim(),
                }],
              });
            }
          });
        }
      } else {
        // For other tags (including <a>), check if they contain images first
        const hasImages = element.querySelector && element.querySelector('img') !== null;

        if (hasImages) {
          // Recursively process to extract images
          Array.from(element.childNodes).forEach(child => {
            if (child.nodeType === 1) {
              processElement(child);
            }
          });
        } else {
          // No images, try to process as inline content
          const text = element.textContent?.trim();
          if (text) {
            const { children, markDefs } = processInlineContent(element);
            const block = {
              _type: 'block',
              _key: generateKey(),
              style: 'normal',
              children: children,
            };
            if (markDefs.length > 0) {
              block.markDefs = markDefs;
            }
            blocks.push(block);
          }
        }
      }
    }

    Array.from(body.childNodes).forEach(child => {
      if (child.nodeType === 1) {
        processElement(child);
      } else if (child.nodeType === 3 && child.textContent?.trim()) {
        // Text node at body level - wrap in paragraph
        blocks.push({
          _type: 'block',
          _key: generateKey(),
          style: 'normal',
          children: [{
            _type: 'span',
            _key: generateKey(),
            text: child.textContent.trim(),
          }],
        });
      }
    });

    return blocks;

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
