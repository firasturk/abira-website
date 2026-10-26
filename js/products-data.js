// ABIRA product catalogue — Collection 01.
// 16 products: 6 legging prints, 6 sports bra prints, 1 top, 1 jacket, 2 bags.
// Structure and copy supplied by the client. Prices are deliberately not held
// here: they live in the wholesale price list only.
//
// Every garment carries the same gallery shape: one campaign cover plus five
// studio detail frames (front, back, side, print macro, construction detail).
// The bags carry their own product photography.

(function () {
  var LEG_DESC = 'A sculpting, high-rise legging featuring signature artwork along the leg.';
  var BRA_DESC = 'A supportive sports bra featuring signature artwork across the front.';
  var FABRIC   = 'Nylon 80% / Spandex 20%';
  var SIZES    = 'XS to XL (US sizing)';
  var PROPS    = ['UV protection', 'Anti bacterial', 'Cloud soft'];

  // Each print: [slug, display name, note]
  var PRINTS = [
    ['bluebird',     'Bluebird',     'Bluebirds in flight over blossom — freedom.'],
    ['wildflower',   'Wildflower',   'Scattered poppies and wild blooms — energy.'],
    ['rosalia',      'Rosalia',      'Deep red roses on green — confidence.'],
    ['cherry-bloom', 'Cherry Bloom', 'White cherry blossom and fruit — joy.'],
    ['dragon-rose',  'Dragon Rose',  'Gold dragon coiled through roses — strength inside softness.'],
    ['starflower',   'Starflower',   'Peonies and star blooms in pink and lilac — grace.']
  ];

  // The five detail frames, in gallery order, per family.
  var VIEWS = {
    legging: ['front view, full length',
              'back view, print along the leg',
              'side view, print placement',
              'close detail of the print',
              'close detail of the high-rise waistband'],
    bra:     ['front view, print across the chest',
              'back view, print across the back band',
              'side view, print placement',
              'close detail of the print',
              'close detail of the double strap'],
    jacket:  ['front view, worn closed',
              'back view',
              'close detail of the hidden side pocket',
              'close detail of the fabric and finish',
              'close detail of the collar and zip pull'],
    top:     ['front view',
              'back view with the ABIRA mark',
              'close detail of the neckline',
              'close detail of the fabric',
              'close detail of the drop hem']
  };

  // cover + five details, built from the asset naming convention.
  function gallery(id, family, label) {
    var g = [{ img: 'cards/' + id + '.webp', alt: label + ', campaign image' }];
    VIEWS[family].forEach(function (view, i) {
      g.push({ img: 'details/' + id + '-' + (i + 1) + '.webp', alt: label + ', ' + view });
    });
    return g;
  }

  var items = [];

  PRINTS.forEach(function (p) {
    var slug = p[0], name = p[1], note = p[2];
    var legId = 'legging-' + slug, braId = 'bra-' + slug;
    var legLabel = 'The Signature Legging in the ' + name + ' print';
    var braLabel = 'The Signature Sports Bra in the ' + name + ' print';

    items.push({
      id: legId,
      family: 'legging',
      name: 'The Signature Legging',
      print: name,
      printNote: note,
      origin: 'Designed in Colombia',
      desc: LEG_DESC,
      img: 'cards/' + legId + '.webp',
      alt: legLabel,
      composition: FABRIC,
      sizes: SIZES,
      properties: PROPS,
      gallery: gallery(legId, 'legging', legLabel)
    });

    items.push({
      id: braId,
      family: 'bra',
      name: 'The Signature Sports Bra',
      print: name,
      printNote: note,
      origin: 'Designed in Colombia',
      desc: BRA_DESC,
      img: 'cards/' + braId + '.webp',
      alt: braLabel,
      composition: FABRIC,
      sizes: SIZES,
      properties: PROPS,
      gallery: gallery(braId, 'bra', braLabel)
    });
  });

  items.push({
    id: 'motion-top',
    family: 'top',
    name: 'The Motion Top',
    print: '',
    origin: '',
    desc: 'A lightweight top designed for easy coverage and effortless movement.',
    img: 'cards/motion-top.webp',
    alt: 'Model wearing The Motion Top',
    composition: 'Polyester 88% / Spandex 12%',
    sizes: SIZES,
    properties: PROPS,
    gallery: gallery('motion-top', 'top', 'The Motion Top')
  });

  items.push({
    id: 'refined-jacket',
    family: 'outerwear',
    name: 'The Refined Jacket',
    print: '',
    origin: '',
    desc: 'Designed with hidden pockets for functionality, finished with a clean silhouette.',
    img: 'cards/refined-jacket.webp',
    alt: 'Model wearing The Refined Jacket',
    composition: FABRIC,
    sizes: SIZES,
    properties: PROPS,
    gallery: gallery('refined-jacket', 'jacket', 'The Refined Jacket')
  });

  items.push({
    id: 'active-shoulder-bag',
    family: 'bag',
    name: 'The Active Shoulder Bag',
    print: '',
    origin: '',
    desc: 'A soft, lightweight everyday bag designed for life on the go.',
    img: 'cards/shoulder-bag.webp',
    alt: 'The Active Shoulder Bag',
    composition: '100% Polyester, black',
    sizes: 'One size',
    properties: [],
    gallery: [
      { img: 'cards/shoulder-bag.webp',     alt: 'The Active Shoulder Bag, three-quarter view' },
      { img: 'details/shoulder-bag-2.webp', alt: 'The Active Shoulder Bag, strap at full length' },
      { img: 'details/shoulder-bag-3.webp', alt: 'The Active Shoulder Bag, side view' },
      { img: 'details/shoulder-bag-4.webp', alt: 'Close detail of the gathered body and the ABIRA mark' }
    ]
  });

  items.push({
    id: 'essential-phone-bag',
    family: 'bag',
    name: 'The Essential Phone Bag',
    print: '',
    origin: '',
    desc: 'A quilted crossbody designed to carry your phone and essentials, hands free.',
    img: 'cards/phone-bag.webp',
    alt: 'The Essential Phone Bag',
    composition: '100% Polyester, black quilted, adjustable strap',
    sizes: 'One size',
    properties: [],
    gallery: [
      { img: 'cards/phone-bag.webp',     alt: 'The Essential Phone Bag, front view' },
      { img: 'details/phone-bag-2.webp', alt: 'The Essential Phone Bag, strap at full length' },
      { img: 'details/phone-bag-3.webp', alt: 'The Essential Phone Bag, shorter strap drop' },
      { img: 'details/phone-bag-4.webp', alt: 'Close detail of the quilting, zip and the ABIRA mark' }
    ]
  });

  window.ABIRA_PRODUCTS = items;
})();

// Collection story, supplied by the client.
window.ABIRA_STORY = {
  "lede": "Abir means the fragrance of flowers: the scent that reaches you before you see the garden.",
  "body": [
    "Our first collection is a garden worn on the body: red roses for confidence, wild poppies for energy, bluebirds for freedom, soft peonies for grace, cherry blossoms for joy, and dragon roses for the strength inside softness.",
    "Every flower tells a different story, but they all come from the same root: the belief that strength and beauty grow together. These pieces are made to move with you through training and everyday life, carrying a little of the garden wherever you go."
  ],
  "signoff": "ABIRA. Wear your bloom."
};
