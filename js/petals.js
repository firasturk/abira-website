/* ============================================================
   ABIRA — hero flower / petal cursor trail
   Canvas particle system. Photoreal sprites cut from the
   campaign film; layered above the hero image, below the UI.
   ============================================================ */

(function () {
  'use strict';

  const hero = document.querySelector('.hero');
  if (!hero) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce.matches) return;

  // --- device capability ---------------------------------------------------
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const lowPower =
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
    (navigator.deviceMemory && navigator.deviceMemory <= 4) ||
    window.innerWidth < 480;

  const MAX = lowPower ? 22 : coarse ? 30 : 46;   // hard cap on live particles
  const SPAWN_GAP = lowPower ? 90 : 45;           // ms between spawn bursts

  // --- sprites -------------------------------------------------------------
  // [file, weight] — blooms appear more often than leaves.
  const FILES = [
    ['f00.png', 2],
    ['f01.png', 2],
    ['f02.png', 2],
    ['f03.png', 2],
    ['f04.png', 2],
    ['f05.png', 2],
    ['f06.png', 2],
    ['f07.png', 2],
    ['f08.png', 2],
    ['f09.png', 2],
    ['f10.png', 2],
    ['f11.png', 2],
    ['f12.png', 2],
    ['f13.png', 2],
    ['f14.png', 2],
    ['f15.png', 2],
    ['f16.png', 2],
    ['f17.png', 2],
    ['f18.png', 1],
    ['f19.png', 2],
    ['f20.png', 1],
    ['f21.png', 1],
    ['f22.png', 1],
    ['f23.png', 2],
    ['f24.png', 1],
    ['f25.png', 1],
    ['f26.png', 1],
    ['f27.png', 1],
    ['f28.png', 2],
    ['f29.png', 2],
    ['f30.png', 2]
  ];
  const sprites = [];

  FILES.forEach(([name, weight]) => {
    const img = new Image();
    img.decoding = 'async';
    img.src = 'assets/petals/' + name;
    img.onload = () => { for (let i = 0; i < weight; i++) sprites.push(img); };
  });

  // --- canvas --------------------------------------------------------------
  const canvas = document.createElement('canvas');
  canvas.className = 'hero__petals';
  canvas.setAttribute('aria-hidden', 'true');
  hero.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let W = 0, H = 0, dpr = 1;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, lowPower ? 1.5 : 2);
    W = hero.clientWidth;
    H = hero.clientHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });

  // --- particles -----------------------------------------------------------
  const parts = [];
  const rand = (a, b) => a + Math.random() * (b - a);

  function spawn(x, y, speed) {
    if (!sprites.length || parts.length >= MAX) return;

    // faster cursor => slightly more, but always gentle
    const n = speed > 900 ? 2 : 1;
    for (let i = 0; i < n && parts.length < MAX; i++) {
      const sprite = sprites[(Math.random() * sprites.length) | 0];
      const size = rand(9, 19) * (lowPower ? 0.85 : 1);
      const dir = rand(-Math.PI * 0.85, -Math.PI * 0.15);   // up and outward
      const v = rand(28, 78);
      parts.push({
        x: x + rand(-6, 6),
        y: y + rand(-6, 6),
        vx: Math.cos(dir) * v + rand(-14, 14),
        vy: Math.sin(dir) * v - rand(12, 40),
        size,
        sprite,
        rot: rand(0, Math.PI * 2),
        spin: rand(-1.7, 1.7),
        sway: rand(0.7, 1.9),
        phase: rand(0, Math.PI * 2),
        life: 0,
        ttl: rand(1.0, 1.5)                                  // seconds
      });
    }
  }

  // --- pointer -------------------------------------------------------------
  let inside = false, lastX = 0, lastY = 0, lastT = 0, lastSpawn = 0;

  function pointFromEvent(e) {
    const r = hero.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top, r };
  }

  function onMove(e) {
    if (!running) return;
    const p = pointFromEvent(e);
    if (p.x < 0 || p.y < 0 || p.x > p.r.width || p.y > p.r.height) return;

    const now = performance.now();
    const dt = Math.max(now - lastT, 1);
    const speed = Math.hypot(p.x - lastX, p.y - lastY) / (dt / 1000);
    lastX = p.x; lastY = p.y; lastT = now;

    if (now - lastSpawn >= SPAWN_GAP) {
      lastSpawn = now;
      spawn(p.x, p.y, speed);
      tick();
    }
  }

  hero.addEventListener('pointerenter', (e) => {
    if (e.pointerType === 'touch') return;
    inside = true;
    const p = pointFromEvent(e);
    lastX = p.x; lastY = p.y; lastT = performance.now();
  });
  hero.addEventListener('pointerleave', () => { inside = false; });
  hero.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    onMove(e);
  }, { passive: true });

  // Touch: a few petals on tap / gentle drag — never blocks scrolling.
  if (coarse) {
    const touch = (e) => {
      if (!running) return;
      const t = e.touches && e.touches[0];
      if (!t) return;
      const r = hero.getBoundingClientRect();
      const x = t.clientX - r.left, y = t.clientY - r.top;
      if (x < 0 || y < 0 || x > r.width || y > r.height) return;
      const now = performance.now();
      if (now - lastSpawn < SPAWN_GAP * 2) return;
      lastSpawn = now;
      spawn(x, y, 0);
      tick();
    };
    hero.addEventListener('touchstart', touch, { passive: true });
    hero.addEventListener('touchmove', touch, { passive: true });
  }

  // --- loop ----------------------------------------------------------------
  let raf = 0, prev = 0, running = true;

  function frame(now) {
    raf = 0;
    const dt = Math.min((now - prev) / 1000, 0.05);
    prev = now;

    ctx.clearRect(0, 0, W, H);

    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life += dt;
      if (p.life >= p.ttl) { parts.splice(i, 1); continue; }

      const k = p.life / p.ttl;
      p.vy += 46 * dt;                                   // gravity
      p.vx += Math.sin(now / 900 + p.phase) * 9 * dt;    // wind
      p.vx *= 0.995;
      p.x += (p.vx + Math.sin(p.life * p.sway + p.phase) * 12) * dt;
      p.y += p.vy * dt;
      p.rot += p.spin * dt;

      // fade in fast, out smoothly
      const alpha = Math.min(k / 0.12, 1) * (1 - Math.pow(k, 2.2));

      ctx.save();
      ctx.globalAlpha = Math.max(alpha, 0);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      const w = p.size, h = p.size * (p.sprite.height / p.sprite.width);
      ctx.shadowColor = 'rgba(0,0,0,.22)';
      ctx.shadowBlur = 3;
      ctx.shadowOffsetY = 1;
      ctx.drawImage(p.sprite, -w / 2, -h / 2, w, h);
      ctx.restore();
    }

    if (parts.length) tick();
  }

  function tick() {
    if (!raf && running) {
      prev = performance.now();
      raf = requestAnimationFrame(frame);
    }
  }

  // --- pause when the hero is off screen -----------------------------------
  new IntersectionObserver((entries) => {
    running = entries[0].isIntersecting;
    if (!running) {
      parts.length = 0;
      ctx.clearRect(0, 0, W, H);
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
    }
  }, { threshold: 0.05 }).observe(hero);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { parts.length = 0; ctx.clearRect(0, 0, W, H); }
  });

  reduce.addEventListener('change', (e) => {
    if (e.matches) {
      running = false;
      parts.length = 0;
      ctx.clearRect(0, 0, W, H);
      canvas.remove();
    }
  });
})();
