# ABIRA — Fashion in Motion

Static website for ABIRA activewear. No build step, no dependencies — plain HTML, CSS and JavaScript.

## Pages

| File | Page |
|---|---|
| `index.html` | Home — hero, about, statement, scroll-controlled transformation, products, world map, CTA |
| `products.html` | Products — 9 cards |
| `product.html` | Product detail (`product.html?id=<product-id>`) |
| `about.html` | About — story, film, pillars |
| `locations.html` | Find Us — interactive world map with wholesale partners |
| `contact.html` | Contact — form with validation |

## Structure

```
assets/        images, logo, video frames, petal sprites, map data
  frames/      97 frames driving the scroll-scrubbed transformation
  petals/      flower sprites for the hero cursor effect
css/styles.css single stylesheet
js/            main.js, petals.js, worldmap.js, products-data.js
```

## Editing content

- **Products** — names, descriptions, details and images live in `js/products-data.js`. Both the products grid and the detail pages read from it.
- **Wholesale locations** — markers and labels live in `assets/map-data.js`; the list on `locations.html` is plain HTML.
- **Text** — all copy is regular HTML, editable in place.

## Fonts

Montserrat and Unbounded load from Google Fonts. Stretch Pro and AvantGarde LT Book are commercial typefaces and are **not** bundled. To enable them:

1. Add `StretchPro.woff2` and `AvantGardeLTBook.woff2` to `assets/fonts/`.
2. Link `css/licensed-fonts.css` in the `<head>` of each page (instructions are inside that file).

Until then the site falls back to Unbounded and Jost automatically.

## Local preview

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deployment

Deployed on Cloudflare Pages. Build settings:

- Framework preset: **None**
- Build command: *(empty)*
- Build output directory: `/`

Every push to `main` redeploys automatically.

## Accessibility

Respects `prefers-reduced-motion`: the scroll-scrubbed video shows a static final frame, and the hero flower effect and magnetic map interaction are disabled.
