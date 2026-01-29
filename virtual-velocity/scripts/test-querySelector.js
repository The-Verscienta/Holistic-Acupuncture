/**
 * Test if querySelector works on JSDOM elements
 */

import { JSDOM } from 'jsdom';

const html = `
<div class="wp-caption">
  <a href="test.html">
    <img src="image.jpg" alt="Test" />
  </a>
</div>
`;

const dom = new JSDOM(html);
const div = dom.window.document.querySelector('div');

console.log('div element:', div.tagName);
console.log('Has querySelector?', typeof div.querySelector);
console.log('querySelector(img):', div.querySelector('img'));
console.log('Has image?', div.querySelector('img') !== null);
