/* ============================================================
   ABIRA — scroll-controlled transformation reel + site behavior
   ============================================================ */

(function () {
  'use strict';

  /* ---------------- Mobile menu ---------------- */

  const toggle = document.querySelector('.menu-toggle');
  const menu = document.getElementById('mobile-menu');

  function closeMenu() {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    menu.classList.remove('is-open');
    window.setTimeout(() => { menu.hidden = true; }, 300);
    document.body.style.overflow = '';
  }

  function openMenu() {
    menu.hidden = false;
    requestAnimationFrame(() => menu.classList.add('is-open'));
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
    document.body.style.overflow = 'hidden';
  }

  toggle.addEventListener('click', () => {
    (toggle.getAttribute('aria-expanded') === 'true') ? closeMenu() : openMenu();
  });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') closeMenu();
  });



  /* ---------------- Page loader ---------------- */

  const MIN_LOADER = 500;
  const loaderStart = performance.now();
  function ready() {
    const wait = Math.max(0, MIN_LOADER - (performance.now() - loaderStart));
    window.setTimeout(() => document.documentElement.classList.add('is-ready'), wait);
  }
  if (document.readyState === 'complete') ready();
  else window.addEventListener('load', ready);
  window.setTimeout(ready, 2500); // never trap the user behind the loader

  /* ---------------- Headline entrance (top → down) ---------------- */

  const heads = document.querySelectorAll('.ah, .ar');
  if ('IntersectionObserver' in window) {
    const headObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          headObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    heads.forEach(h => headObserver.observe(h));
    // Lets later-rendered content (the products grid) join the same reveal.
    window.ABIRA_REVEAL = (root) =>
      root.querySelectorAll('.ah, .ar').forEach(el => headObserver.observe(el));
  } else {
    heads.forEach(h => h.classList.add('in'));
    window.ABIRA_REVEAL = (root) =>
      root.querySelectorAll('.ah, .ar').forEach(el => el.classList.add('in'));
  }


  /* ---------------- Products grid ---------------- */

  function cardMarkup(p, delay) {
    const sub = p.print ? p.print + ' print' : (p.origin || '');
    return '<article class="shop-card ar"' + (delay ? ' style="--ar-delay:' + delay + 's"' : '') + '>' +
      '<div class="shop-card__media">' +
        '<img src="assets/' + p.img + '" loading="lazy" alt="' + p.alt + '">' +
        '<a class="btn btn--ghost" href="product.html?id=' + p.id + '">Check our product ' +
          '<span class="btn__icon" aria-hidden="true"></span></a>' +
      '</div>' +
      '<div class="shop-card__meta"><h3>' + p.name + '</h3></div>' +
      (sub ? '<p class="shop-card__sub">' + sub + '</p>' : '') +
      '<p class="shop-card__desc">' + p.desc + '</p>' +
    '</article>';
  }

  const shopGrid = document.getElementById('shop-grid');
  if (shopGrid && window.ABIRA_PRODUCTS) {
    const all = window.ABIRA_PRODUCTS;
    const family = p => (p.family === 'top' || p.family === 'outerwear') ? 'layer' : p.family;

    function renderGrid(filter) {
      const list = filter === 'all' ? all : all.filter(p => family(p) === filter);
      shopGrid.innerHTML = list.map((p, i) => cardMarkup(p, (i % 4) * 0.08)).join('');
      if (window.ABIRA_REVEAL) window.ABIRA_REVEAL(shopGrid);
      else shopGrid.querySelectorAll('.ar').forEach(el => el.classList.add('in'));
    }
    renderGrid('all');

    document.querySelectorAll('.shop-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.shop-filter').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        renderGrid(btn.dataset.family);
      });
    });
  }

  /* ---------------- Product detail page ---------------- */

  const pdp = document.getElementById('pdp');
  if (pdp && window.ABIRA_PRODUCTS) {
    const all = window.ABIRA_PRODUCTS;
    const id = new URLSearchParams(location.search).get('id');
    const product = all.find(p => p.id === id) || all[0];
    const fullName = product.name + (product.print ? ' — ' + product.print : '');

    document.title = fullName + ' — ABIRA';

    // Keep the page description, canonical and share card in step with the product.
    const blurb = (product.desc || '').replace(/\s+/g, ' ').trim().slice(0, 155);
    const setMeta = (sel, val) => { const el = document.head.querySelector(sel); if (el) el.setAttribute('content', val); };
    setMeta('meta[name="description"]', blurb);
    setMeta('meta[property="og:title"]', fullName + ' — ABIRA');
    setMeta('meta[property="og:description"]', blurb);
    setMeta('meta[property="og:url"]', location.href);
    const lead = (product.gallery && product.gallery[0] && product.gallery[0].img) || product.img;
    if (lead) setMeta('meta[property="og:image"]', new URL('assets/' + lead, location.href).href);
    const canon = document.head.querySelector('link[rel="canonical"]');
    if (canon) canon.setAttribute('href', location.href);

    document.getElementById('pdp-name').textContent = fullName;
    document.getElementById('pdp-desc').textContent =
      product.desc + (product.printNote ? ' ' + product.printNote : '');

    const origin = document.getElementById('pdp-origin');
    if (product.origin) origin.textContent = product.origin;
    else origin.remove();

    // Fabric properties
    const props = document.getElementById('pdp-props');
    if (product.properties && product.properties.length) {
      product.properties.forEach(t => {
        const li = document.createElement('li');
        li.textContent = t;
        props.appendChild(li);
      });
    } else {
      props.remove();
    }

    // Gallery: the lifestyle frame full width, then the studio details two-up.
    const gallery = document.getElementById('pdp-gallery');
    const frames = product.gallery && product.gallery.length
      ? product.gallery
      : [{ img: product.img, alt: product.alt }];

    gallery.innerHTML = frames.map((g, i) =>
      '<figure class="pdp-shot' + (i === 0 ? ' pdp-shot--lead' : '') + '">' +
        '<img src="assets/' + g.img + '" alt="' + (g.alt || '').replace(/"/g, '&quot;') + '"' +
        (i === 0 ? '' : ' loading="lazy"') + '>' +
      '</figure>'
    ).join('');

    // Other prints in the same style, each its own product page
    const printsBox = document.getElementById('pdp-prints');
    const printGrid = document.getElementById('print-grid');
    const siblings = product.print
      ? all.filter(p => p.family === product.family && p.id !== product.id)
      : [];
    if (siblings.length) {
      printsBox.hidden = false;
      siblings.forEach(pr => {
        const a = document.createElement('a');
        a.className = 'print';
        a.href = 'product.html?id=' + pr.id;
        a.innerHTML = '<img src="assets/' + pr.img + '" loading="lazy" alt="">' +
                      '<span>' + pr.print + '</span>';
        printGrid.appendChild(a);
      });
    }

    // Specification list
    const spec = document.getElementById('pdp-spec');
    const rows = [['Composition', product.composition], ['Sizes', product.sizes]];
    if (product.print) rows.push(['Print', product.print]);
    rows.forEach(([k, v]) => {
      if (!v) return;
      const dt = document.createElement('dt'); dt.textContent = k;
      const dd = document.createElement('dd'); dd.textContent = v;
      spec.appendChild(dt); spec.appendChild(dd);
    });

    // One size products do not need a size picker
    const sizes = document.getElementById('pdp-sizes');
    if (product.sizes === 'One size') {
      document.querySelector('.pdp__sizes-label')?.remove();
      sizes.remove();
    }
    else sizes.querySelectorAll('.size').forEach(btn => {
      btn.addEventListener('click', () => {
        sizes.querySelectorAll('.size').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
      });
    });

    // Related: pieces from other styles, starting with the matching set
    const grid = document.getElementById('related-grid');
    const mate = product.print
      ? all.find(p => p.print === product.print && p.family !== product.family)
      : null;
    const taken = new Set([product.id].concat(mate ? [mate.id] : []));
    const related = mate ? [mate] : [];
    // One piece from each remaining family, so the row is not six of the same thing.
    ['outerwear', 'top', 'bag', 'legging', 'bra'].forEach(fam => {
      if (related.length >= 3) return;
      const pick = all.find(p => p.family === fam && p.family !== product.family && !taken.has(p.id));
      if (pick) { related.push(pick); taken.add(pick.id); }
    });
    related.forEach(p => {
      const card = document.createElement('article');
      card.className = 'shop-card';
      const label = p.name + (p.print ? ' — ' + p.print : '');
      card.innerHTML =
        '<div class="shop-card__media">' +
          '<a href="product.html?id=' + p.id + '" aria-label="' + label + '">' +
            '<img src="assets/' + p.img + '" loading="lazy" alt=""></a></div>' +
        '<div class="shop-card__meta"><h3>' + label + '</h3></div>';
      grid.appendChild(card);
    });
  }

  /* ---------------- Locations map ---------------- */

  const atlas = document.querySelector('.atlas:not(.atlas--teaser)');
  if (atlas) {
    const card = atlas.querySelector('.atlas__card');
    const pins = document.querySelectorAll('.pin');
    const stockists = document.querySelectorAll('.stockist');

    const data = {};
    stockists.forEach(s => {
      data[s.dataset.id] = {
        city: s.querySelector('.city').textContent,
        store: s.querySelector('.store').textContent,
        addr: s.querySelector('.addr').textContent
      };
    });

    let activeId = null;
    function select(id) {
      if (id === activeId) { deselect(); return; }
      activeId = id;
      const d = data[id];
      card.querySelector('.city').textContent = d.city;
      card.querySelector('h3').textContent = d.store;
      card.querySelector('.addr').textContent = d.addr;
      card.classList.add('is-open');
      pins.forEach(p => p.classList.toggle('is-active', p.dataset.id === id));
      stockists.forEach(s => s.classList.toggle('is-active', s.dataset.id === id));
    }
    function deselect() {
      activeId = null;
      card.classList.remove('is-open');
      pins.forEach(p => p.classList.remove('is-active'));
      stockists.forEach(s => s.classList.remove('is-active'));
    }

    pins.forEach(p => {
      p.addEventListener('click', () => select(p.dataset.id));
      p.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(p.dataset.id); }
      });
    });
    stockists.forEach(s => s.addEventListener('click', () => select(s.dataset.id)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') deselect(); });
  }

  /* ---------------- About film autoplay nudge ---------------- */

  document.querySelectorAll('.film video, .page-hero__film').forEach((film) => {
    const tryPlay = () => film.play().catch(() => {});
    tryPlay();
    new IntersectionObserver((entries) => {
      entries[0].isIntersecting ? tryPlay() : film.pause();
    }, { threshold: 0.2 }).observe(film);
  });

  /* ---------------- Landing map: tap a pin to see the country ---------------- */

  const teaser = document.querySelector('.atlas--teaser');
  if (teaser) {
    const tpins = teaser.querySelectorAll('.pin');
    function toggle(pin) {
      const on = pin.classList.contains('is-active');
      tpins.forEach(p => p.classList.remove('is-active'));
      if (!on) pin.classList.add('is-active');
    }
    tpins.forEach(p => {
      p.addEventListener('click', () => toggle(p));
      p.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(p); }
      });
    });
  }

  /* ---------------- Contact form ---------------- */

  const form = document.querySelector('.form');
  if (form) {
    const status = form.querySelector('.form__status');

    function setError(input, msg) {
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      input.closest('.field').querySelector('.err').textContent = msg || '';
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let ok = true;
      const name = form.querySelector('#f-name');
      const email = form.querySelector('#f-email');
      const subject = form.querySelector('#f-subject');
      const message = form.querySelector('#f-message');

      setError(name, name.value.trim() ? '' : 'Add your name so we know who is writing.');
      setError(email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()) ? '' : 'Add a valid email so we can reply.');
      setError(subject, subject.value.trim() ? '' : 'Add a short subject.');
      setError(message, message.value.trim().length >= 10 ? '' : 'Tell us a little more (at least 10 characters).');

      ok = !form.querySelector('[aria-invalid="true"]');
      if (!ok) {
        form.querySelector('[aria-invalid="true"]').focus();
        return;
      }

      const firstName = name.value.trim().split(' ')[0];
      const endpoint = form.dataset.endpoint;
      const btn = form.querySelector('button[type="submit"]');

      const show = (msg) => {
        status.hidden = false;
        status.textContent = msg;
        status.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      };
      const clear = () => {
        form.reset();
        form.querySelectorAll('input, textarea').forEach(i => i.removeAttribute('aria-invalid'));
      };

      if (endpoint) {
        btn.disabled = true;
        show('Sending…');
        const data = new FormData(form);
        // Formspree reads _subject for the email subject line and uses the
        // email field as reply-to, so a reply goes straight back to them.
        data.set('_subject', 'ABIRA site: ' + subject.value.trim());
        fetch(endpoint, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: data
        }).then((r) => {
          if (!r.ok) throw new Error(r.status);
          show('Thanks, ' + firstName + '. Your message is with us. We reply within two business days.');
          clear();
        }).catch(() => {
          show('Sorry, that did not go through. Please email us at hello@abiraactive.com and we will pick it up from there.');
        }).finally(() => { btn.disabled = false; });
        return;
      }

      // No endpoint configured: hand the message to the visitor's mail app,
      // which actually delivers it, instead of claiming it was sent.
      const body = 'Name: ' + name.value.trim() +
        '\nEmail: ' + email.value.trim() +
        '\n\n' + message.value.trim();
      window.location.href = 'mailto:hello@abiraactive.com' +
        '?subject=' + encodeURIComponent(subject.value.trim()) +
        '&body=' + encodeURIComponent(body);
      show('Thanks, ' + firstName + '. Your email app is opening with the message ready — press send and it reaches us.');
      clear();
    });
  }

  /* ---------------- Scroll-scrubbed reel ---------------- */

  const reel = document.getElementById('reel');
  if (!reel) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduceMotion.matches) {
    // Static final frame instead of the scroll animation.
    reel.classList.add('reel--static');
    return;
  }

  const canvas = reel.querySelector('.reel__canvas');
  const ctx = canvas.getContext('2d');
  const progressFill = reel.querySelector('.reel__progress-fill');
  const pctLabel = reel.querySelector('.reel__pct');
  const loader = reel.querySelector('.reel__loader');
  const loaderBar = reel.querySelector('.reel__loader-bar span');
  const loaderText = reel.querySelector('.reel__loader-text');

  const FRAME_COUNT = 97;
  const frameSrc = i => `assets/frames/frame_${String(i + 1).padStart(3, '0')}.webp`;

  const frames = new Array(FRAME_COUNT).fill(null);
  let loaded = 0;
  let firstFrameReady = false;
  let allReady = false;
  let currentFrame = -1;
  let inView = false;
  let ticking = false;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  /* --- loading, first frame prioritized --- */

  function loadFrame(i) {
    return new Promise((resolve) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => { frames[i] = img; loaded++; resolve(img); };
      img.onerror = () => { loaded++; resolve(null); };
      img.src = frameSrc(i);
    });
  }

  function updateLoader() {
    const pct = Math.round((loaded / FRAME_COUNT) * 100);
    loaderBar.style.width = pct + '%';
    if (loaded >= FRAME_COUNT) {
      allReady = true;
      loader.classList.add('is-done');
      loader.setAttribute('aria-hidden', 'true');
      render(true);
    }
  }

  loadFrame(0).then(() => {
    firstFrameReady = true;
    sizeCanvas();
    render(true);
    // Load the rest with limited concurrency so the page stays responsive.
    let next = 1;
    const workers = Array.from({ length: 6 }, async function work() {
      while (next < FRAME_COUNT) {
        const i = next++;
        await loadFrame(i);
        updateLoader();
      }
    });
    Promise.all(workers).then(updateLoader);
  });

  /* --- canvas sizing + cover draw with focal point --- */

  function sizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = reel.clientWidth;
    const h = reel.querySelector('.reel__sticky').clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
  }

  // Keep the model (slightly above centre of the 16:9 source) in frame on all crops.
  const FOCAL_X = 0.5;
  const FOCAL_Y = 0.42;

  function drawFrame(img) {
    if (!img) return;
    const cw = canvas.width, ch = canvas.height;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const scale = Math.max(cw / iw, ch / ih);
    const dw = iw * scale, dh = ih * scale;
    let dx = cw / 2 - dw * FOCAL_X;
    let dy = ch / 2 - dh * FOCAL_Y;
    dx = Math.min(0, Math.max(cw - dw, dx));
    dy = Math.min(0, Math.max(ch - dh, dy));
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  function nearestLoadedFrame(i) {
    if (frames[i]) return frames[i];
    for (let d = 1; d < FRAME_COUNT; d++) {
      if (frames[i - d]) return frames[i - d];
      if (frames[i + d]) return frames[i + d];
    }
    return null;
  }

  /* --- scroll progress → frame + headline position --- */

  function progress() {
    const rect = reel.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    if (total <= 0) return 0;
    return Math.min(1, Math.max(0, -rect.top / total));
  }

  function render(force) {
    const p = progress();
    const idx = Math.min(FRAME_COUNT - 1, Math.floor(p * FRAME_COUNT));

    if (force || idx !== currentFrame) {
      currentFrame = idx;
      drawFrame(nearestLoadedFrame(idx));
    }

    progressFill.style.width = (p * 100) + '%';
    pctLabel.textContent = Math.round(p * 100) + '%';
  }

  function onScroll() {
    if (!inView || ticking || !firstFrameReady) return;
    ticking = true;
    requestAnimationFrame(() => { render(false); ticking = false; });
  }

  /* --- pause everything while the section is off screen --- */

  const reelObserver = new IntersectionObserver((entries) => {
    inView = entries[0].isIntersecting;
    if (inView) render(true);
  }, { rootMargin: '20% 0px 20% 0px' });
  reelObserver.observe(reel);

  window.addEventListener('scroll', onScroll, { passive: true });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { sizeCanvas(); render(true); }, 120);
  });

  reduceMotion.addEventListener('change', (e) => {
    if (e.matches) reel.classList.add('reel--static');
    else reel.classList.remove('reel--static');
  });
})();
