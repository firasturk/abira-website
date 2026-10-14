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
  } else {
    heads.forEach(h => h.classList.add('in'));
  }


  /* ---------------- Product detail page ---------------- */

  const pdp = document.getElementById('pdp');
  if (pdp && window.ABIRA_PRODUCTS) {
    const all = window.ABIRA_PRODUCTS;
    const id = new URLSearchParams(location.search).get('id');
    const product = all.find(p => p.id === id) || all[0];

    document.title = product.name + ' — ABIRA';
    const img = document.getElementById('pdp-img');
    img.src = 'assets/' + product.img;
    img.alt = product.alt;
    document.getElementById('pdp-name').textContent = product.name;
    document.getElementById('pdp-price').textContent = product.price;
    document.getElementById('pdp-desc').textContent = product.desc;
    const ul = document.getElementById('pdp-details');
    product.details.forEach(d => {
      const li = document.createElement('li');
      li.textContent = d;
      ul.appendChild(li);
    });

    document.querySelectorAll('.pdp__sizes .size').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.pdp__sizes .size').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
      });
    });

    // Related: the next three pieces in the catalog
    const grid = document.getElementById('related-grid');
    const start = all.indexOf(product);
    for (let i = 1; i <= 3; i++) {
      const p = all[(start + i) % all.length];
      const card = document.createElement('article');
      card.className = 'shop-card';
      card.innerHTML =
        '<div class="shop-card__media">' +
          '<a href="product.html?id=' + p.id + '" aria-label="' + p.name + '">' +
            '<img src="assets/' + p.img + '" loading="lazy" alt=""></a></div>' +
        '<div class="shop-card__meta"><h3>' + p.name + '</h3><span>' + p.price + '</span></div>';
      grid.appendChild(card);
    }
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

  const film = document.querySelector('.film video');
  if (film) {
    const tryPlay = () => film.play().catch(() => {});
    tryPlay();
    new IntersectionObserver((entries) => {
      entries[0].isIntersecting ? tryPlay() : film.pause();
    }, { threshold: 0.2 }).observe(film);
  }

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

      status.hidden = false;
      status.textContent = 'Thanks, ' + name.value.trim().split(' ')[0] +
        ' — your message is on its way. We reply within two business days.';
      form.reset();
      form.querySelectorAll('input, textarea').forEach(i => i.removeAttribute('aria-invalid'));
      status.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
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
