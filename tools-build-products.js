/* Generates one static HTML page per product under products/.
   Run: node tools-build-products.js
   Each page carries its own title, description, canonical and Open Graph tags
   in the markup, so search engines and link scrapers (which do not run JS)
   see the product rather than the generic site card. */
const fs = require('fs');
const path = require('path');

const SITE = 'https://abiraactive.com';
const ROOT = __dirname;

// products-data.js assigns to window.ABIRA_PRODUCTS
const win = {};
new Function('window', fs.readFileSync(path.join(ROOT, 'js/products-data.js'), 'utf8'))(win);
const products = win.ABIRA_PRODUCTS;
if (!products || !products.length) throw new Error('no products parsed');

let tpl = fs.readFileSync(path.join(ROOT, 'product.html'), 'utf8');

// the generated files live one level down, so make every local path root-relative
tpl = tpl
  .replace(/(href|src)="(css|js|assets)\//g, '$1="/$2/')
  .replace(/(href|src)="(index)\.html"/g, '$1="/"')
  .replace(/(href|src)="([a-z0-9-]+)\.html"/g, '$1="/$2.html"');

const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

const outDir = path.join(ROOT, 'products');
fs.mkdirSync(outDir, { recursive: true });
// clear stale files so a removed product does not linger
for (const f of fs.readdirSync(outDir)) if (f.endsWith('.html')) fs.unlinkSync(path.join(outDir, f));

let n = 0;
for (const p of products) {
  const full  = p.name + (p.print ? ' — ' + p.print : '');
  const title = full + ' — ABIRA';
  const desc  = (p.desc || '').replace(/\s+/g, ' ').trim().slice(0, 155);
  const url   = SITE + '/products/' + p.id;
  // Share card: the pre-built 1200x630 JPEG. Scrapers skip WebP and crop
  // portrait shots badly, so the gallery image is never used here.
  const image = SITE + '/assets/og/' + p.id + '.jpg';
  const imgAlt = full + ', by ABIRA';

  const html = tpl
    .replace('<title>Product, ABIRA</title>', '<title>' + esc(title) + '</title>')
    .replace('content="ABIRA product details: fabric, fit, and artwork for every piece in the collection."', 'content="' + esc(desc) + '"')
    .replace('href="https://abiraactive.com/product.html"', 'href="' + url + '"')
    .replace('content="Product, ABIRA"', 'content="' + esc(title) + '"')
    .replace('content="https://abiraactive.com/product.html"', 'content="' + url + '"')
    .replace(/content="https:\/\/abiraactive\.com\/assets\/og-image\.jpg"/g, 'content="' + esc(image) + '"')
    .replace(/<meta property="og:image:alt" content="[^"]*">/, '<meta property="og:image:alt" content="' + esc(imgAlt) + '">')
    .replace('<meta property="og:type" content="website">', '<meta property="og:type" content="product">\n  <meta property="og:description" content="' + esc(desc) + '">')
    .replace('<h1 id="pdp-name">Product</h1>', '<h1 id="pdp-name">' + esc(full) + '</h1>')
    .replace('<script src="/js/products-data.js" defer></script>',
             '<script>window.ABIRA_PRODUCT_ID = ' + JSON.stringify(p.id) + ';</script>\n  <script src="/js/products-data.js" defer></script>');

  fs.writeFileSync(path.join(outDir, p.id + '.html'), html);
  n++;
}
console.log('generated ' + n + ' product pages in products/');
