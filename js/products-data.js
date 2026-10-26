// ABIRA product catalogue — Collection 01.
// 16 products: 6 legging prints, 6 sports bra prints, 1 top, 1 jacket, 2 bags.
// Structure and copy supplied by the client. Prices are deliberately not held
// here: they live in the wholesale price list only.

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

  // Gallery frames per print: [legging detail set, bra detail set]
  var FRAMES = {
    'bluebird': {
      leg: ['shoot/678A2603.webp', 'shoot/678A2591.webp', 'cards/d-leg-bluebird.webp', 'shoot/678A2549.webp'],
      bra: ['shoot/678A2755.webp', 'cards/d-bra-bluebird.webp', 'shoot/678A2591.webp', 'shoot/678A2603.webp'],
      legAlt: ['worn in an inverted stretch, full leg visible', 'kneeling, print along the outer thigh',
               'close detail of the bluebird print', 'styled with the matching sports bra'],
      braAlt: ['back view, print across the strap band', 'close detail of the bluebird print',
               'side view in movement', 'styled with the matching legging']
    },
    'wildflower': {
      leg: ['shoot/678A2427.webp', 'shoot/678A2423.webp', 'cards/d-leg-wildflower.webp', 'shoot/678A2437.webp'],
      bra: ['shoot/678A2437.webp', 'cards/d-bra-wildflower.webp', 'shoot/678A2424.webp', 'shoot/678A2393.webp'],
      legAlt: ['kneeling, poppy print along the leg', 'standing stretch, full length',
               'close detail of the wildflower print', 'styled with the matching sports bra'],
      braAlt: ['front view, print across the chest', 'close detail of the wildflower print',
               'arms raised in movement', 'styled with The Active Shoulder Bag']
    },
    'rosalia': {
      leg: ['shoot/678A2521.webp', 'shoot/678A2524.webp', 'cards/d-leg-rosalia.webp', 'shoot/678A2533.webp'],
      bra: ['shoot/678A2524.webp', 'cards/d-bra-rosalia.webp', 'shoot/678A2519.webp', 'shoot/678A2533.webp'],
      legAlt: ['kneeling, rose print along the outer thigh', 'deep lunge, full leg visible',
               'close detail of the Rosalia print', 'side plank, full length'],
      braAlt: ['front view, reaching overhead', 'close detail of the Rosalia print',
               'side view in a floor stretch', 'styled with the matching legging']
    },
    'cherry-bloom': {
      leg: ['shoot/678A2469.webp', 'shoot/678A2487.webp', 'cards/d-leg-cherry.webp', 'shoot/678A2497.webp'],
      bra: ['shoot/678A2453.webp', 'cards/d-bra-cherry.webp', 'shoot/678A2500.webp', 'shoot/678A2462.webp'],
      legAlt: ['bending forward, print along the leg', 'kneeling, full length',
               'close detail of the Cherry Bloom print', 'standing, styled with the sports bra'],
      braAlt: ['front view, print across the chest', 'close detail of the Cherry Bloom print',
               'training with light weights', 'side view in movement']
    },
    'dragon-rose': {
      leg: ['shoot/678A2629.webp', 'shoot/678A2622.webp', 'cards/d-leg-dragon.webp', 'shoot/678A2328.webp'],
      bra: ['shoot/678A2723.webp', 'cards/d-bra-dragon.webp', 'shoot/678A2328.webp', 'shoot/678A2660.webp'],
      legAlt: ['walking, dragon print along the leg', 'styled with The Active Shoulder Bag',
               'close detail of the Dragon Rose print', 'standing, full length'],
      braAlt: ['front view, print across the chest', 'close detail of the Dragon Rose print',
               'side view, full length', 'styled with the matching legging']
    },
    'starflower': {
      leg: ['shoot/678A2350.webp', 'shoot/678A2337.webp', 'cards/d-leg-star.webp', 'shoot/678A2360.webp'],
      bra: ['shoot/678A2337.webp', 'cards/d-bra-star.webp', 'shoot/678A2350.webp', 'shoot/678A2361.webp'],
      legAlt: ['training overhead, full leg visible', 'standing, print along the outer thigh',
               'close detail of the Starflower print', 'layered under The Refined Jacket'],
      braAlt: ['front view, print across the chest', 'close detail of the Starflower print',
               'training with light weights', 'layered under The Refined Jacket']
    }
  };

  function gallery(card, frames, alts, label) {
    var g = [{ img: card, alt: label + ', studio view' }];
    for (var i = 0; i < frames.length; i++) {
      g.push({ img: frames[i], alt: label + ', ' + alts[i] });
    }
    return g;
  }

  var items = [];

  PRINTS.forEach(function (p) {
    var slug = p[0], name = p[1], note = p[2], f = FRAMES[slug];
    var legLabel = 'The Signature Legging in the ' + name + ' print';
    var braLabel = 'The Signature Sports Bra in the ' + name + ' print';

    items.push({
      id: 'legging-' + slug,
      family: 'legging',
      name: 'The Signature Legging',
      print: name,
      printNote: note,
      origin: 'Designed in Colombia',
      desc: LEG_DESC,
      img: 'cards/legging-' + slug + '.webp',
      alt: legLabel,
      composition: FABRIC,
      sizes: SIZES,
      properties: PROPS,
      gallery: gallery('cards/legging-' + slug + '.webp', f.leg, f.legAlt, legLabel)
    });

    items.push({
      id: 'bra-' + slug,
      family: 'bra',
      name: 'The Signature Sports Bra',
      print: name,
      printNote: note,
      origin: 'Designed in Colombia',
      desc: BRA_DESC,
      img: 'cards/bra-' + slug + '.webp',
      alt: braLabel,
      composition: FABRIC,
      sizes: SIZES,
      properties: PROPS,
      gallery: gallery('cards/bra-' + slug + '.webp', f.bra, f.braAlt, braLabel)
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
    gallery: [
      { img: 'cards/motion-top.webp',   alt: 'The Motion Top, front view' },
      { img: 'shoot/678A2504.webp',     alt: 'The Motion Top, back view with the ABIRA logo' },
      { img: 'cards/d-top-back.webp',   alt: 'Close detail of the ABIRA logo at the back neck' },
      { img: 'shoot/678A2515.webp',     alt: 'The Motion Top worn loose over a legging' },
      { img: 'cards/d-top-hem.webp',    alt: 'Close detail of the drop hem and side fall' }
    ]
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
    gallery: [
      { img: 'cards/refined-jacket.webp',  alt: 'The Refined Jacket, front view' },
      { img: 'shoot/678A2360.webp',        alt: 'The Refined Jacket worn open, full length' },
      { img: 'cards/d-jacket-chest.webp',  alt: 'Close detail of the ABIRA mark on the chest' },
      { img: 'cards/d-jacket-pocket.webp', alt: 'Close detail of the hidden side pockets' },
      { img: 'shoot/678A2361.webp',        alt: 'The Refined Jacket in movement' }
    ]
  });

  items.push({
    id: 'active-shoulder-bag',
    family: 'bag',
    name: 'The Active Shoulder Bag',
    print: '',
    origin: '',
    desc: 'A soft, lightweight everyday bag designed for life on the go.',
    img: 'cards/shoulder-bag.webp',
    alt: 'Model wearing The Active Shoulder Bag',
    composition: '100% Polyester, black',
    sizes: 'One size',
    properties: [],
    gallery: [
      { img: 'cards/shoulder-bag.webp',   alt: 'The Active Shoulder Bag worn over the shoulder' },
      { img: 'cards/d-shoulder-bag.webp', alt: 'Close detail of the gathered body and ABIRA mark' },
      { img: 'shoot/678A2629.webp',       alt: 'The Active Shoulder Bag carried at the side' },
      { img: 'shoot/678A2386.webp',       alt: 'The Active Shoulder Bag held by the strap' },
      { img: 'shoot/678A2393.webp',       alt: 'The Active Shoulder Bag, strap length shown' }
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
    alt: 'Model wearing The Essential Phone Bag crossbody',
    composition: '100% Polyester, black quilted, adjustable strap',
    sizes: 'One size',
    properties: [],
    gallery: [
      { img: 'cards/phone-bag.webp',    alt: 'The Essential Phone Bag worn crossbody' },
      { img: 'cards/d-phone-macro.webp',alt: 'Close detail of the quilting and the ABIRA mark' },
      { img: 'cards/d-phone-wide.webp', alt: 'The Essential Phone Bag worn with the Bluebird legging' },
      { img: 'shoot/678A2684.webp',     alt: 'The Essential Phone Bag styled with the collection' }
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
