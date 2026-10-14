/* ============================================================
   ABIRA — "Around the World" interactive dotted map
   Canvas-rendered dot field with a magnetic / magnifying cursor.
   Grey dots are attracted and enlarged near the pointer, then
   spring back to their exact geographic positions.
   Pink markers stay anchored, and stay clickable.
   ============================================================ */

(function () {
  'use strict';

  const section = document.querySelector('.atlas--teaser');
  if (!section || !window.ABIRA_MAP) return;

  const wrap = section.querySelector('.atlas__wrap');
  const svg = wrap.querySelector('svg.wmap');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Reduced motion: leave the original static dotted SVG exactly as it is.
  if (reduce.matches) return;

  const DATA = window.ABIRA_MAP;
  const VW = DATA.w, VH = DATA.h;

  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const lowPower =
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
    (navigator.deviceMemory && navigator.deviceMemory <= 4) ||
    window.innerWidth < 560;

  // --- dot field -----------------------------------------------------------
  // Thin the field on weaker devices rather than dropping the effect.
  const stride = lowPower ? 2 : 1;
  const dots = [];
  for (let i = 0; i < DATA.dots.length; i += stride) {
    const d = DATA.dots[i];
    dots.push({ ox: d[0], oy: d[1], x: d[0], y: d[1], vx: 0, vy: 0, s: 1, ts: 1 });
  }

  // --- canvas, sized to the SVG box ---------------------------------------
  const canvas = document.createElement('canvas');
  canvas.className = 'wmap-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  wrap.insertBefore(canvas, svg);
  const ctx = canvas.getContext('2d');

  // The SVG keeps only its markers; the canvas draws the land dots.
  svg.classList.add('wmap--dots-hidden');

  let W = 0, H = 0, scale = 1, dpr = 1;
  function resize() {
    const r = svg.getBoundingClientRect();
    W = r.width;
    H = r.height;
    scale = W / VW;                      // viewBox units -> css px
    dpr = Math.min(window.devicePixelRatio || 1, lowPower ? 1.5 : 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);  // draw in viewBox units
    draw();
  }

  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 140); });

  // --- pointer -------------------------------------------------------------
  const RADIUS = lowPower ? 110 : 145;   // css px reach of the magnet
  let px = -9999, py = -9999;            // pointer in viewBox units
  let targetX = -9999, targetY = -9999;
  let active = false;

  function toView(clientX, clientY) {
    const r = svg.getBoundingClientRect();
    return { x: (clientX - r.left) / scale, y: (clientY - r.top) / scale, r };
  }

  wrap.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    const p = toView(e.clientX, e.clientY);
    targetX = p.x; targetY = p.y;
    active = true;
    kick();
  }, { passive: true });

  wrap.addEventListener('pointerleave', () => { active = false; });

  // Touch: follow a finger without ever blocking vertical scrolling.
  if (coarse) {
    const t = (e) => {
      const touch = e.touches && e.touches[0];
      if (!touch) return;
      const p = toView(touch.clientX, touch.clientY);
      if (p.x < 0 || p.y < 0 || p.x > VW || p.y > VH) return;
      targetX = p.x; targetY = p.y; active = true;
      kick();
    };
    wrap.addEventListener('touchstart', t, { passive: true });
    wrap.addEventListener('touchmove', t, { passive: true });
    wrap.addEventListener('touchend', () => { active = false; }, { passive: true });
  }

  // --- markers: react to proximity, never move ----------------------------
  const pins = Array.from(svg.querySelectorAll('.pin'));
  const markers = pins.map((el, i) => ({
    el,
    x: DATA.markers[i] ? DATA.markers[i].x : 0,
    y: DATA.markers[i] ? DATA.markers[i].y : 0,
    near: false
  }));

  function updateMarkers() {
    const r = 60;
    markers.forEach(m => {
      const near = active && Math.hypot(m.x - px, m.y - py) < r;
      if (near !== m.near) {
        m.near = near;
        m.el.classList.toggle('is-near', near);
      }
    });
  }

  // --- render loop ---------------------------------------------------------
  const DOT_R = 1.7;                       // matches the original pattern dot
  let raf = 0, idleFrames = 0, visible = true;

  function draw() {
    ctx.clearRect(0, 0, VW, VH);
    ctx.fillStyle = 'rgba(244,243,241,.34)';

    // Resting dots share one fill (one state change for ~2.5k dots).
    let bright = null;
    for (let i = 0; i < dots.length; i++) {
      const d = dots[i];
      if (d.s > 1.04) { (bright || (bright = [])).push(d); continue; }
      ctx.beginPath();
      ctx.arc(d.x, d.y, DOT_R * d.s, 0, 6.283185);
      ctx.fill();
    }

    // Attracted dots (a few hundred at most) brighten smoothly with scale,
    // so there is no visible ring or banding at the edge of the lens.
    if (bright) {
      for (let i = 0; i < bright.length; i++) {
        const d = bright[i];
        const k = Math.min((d.s - 1) / 0.75, 1);
        ctx.fillStyle = 'rgba(244,243,241,' + (0.34 + k * 0.40).toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(d.x, d.y, DOT_R * d.s, 0, 6.283185);
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(244,243,241,.34)';
    }
  }

  function step() {
    raf = 0;

    // ease the pointer itself so the lens glides rather than snaps
    if (active) {
      px += (targetX - px) * 0.22;
      py += (targetY - py) * 0.22;
    }

    const R = RADIUS / scale;              // reach in viewBox units
    const R2 = R * R;
    let moving = false;

    for (let i = 0; i < dots.length; i++) {
      const d = dots[i];
      let tx = d.ox, ty = d.oy, ts = 1;

      if (active) {
        const dx = px - d.ox, dy = py - d.oy;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < R2) {
          const dist = Math.sqrt(dist2) || 0.0001;
          // smooth radial falloff — no hard magnifier edge
          const f = 1 - dist / R;
          const ease = f * f * (3 - 2 * f);          // smoothstep
          // pull toward the cursor, but stop short so they never collapse
          // into a single solid clump
          const pull = Math.min(ease * 0.26, (dist - 7) / dist);
          if (pull > 0) {
            tx = d.ox + dx * pull;
            ty = d.oy + dy * pull;
          }
          ts = 1 + ease * 0.75;                       // up to ~1.75x
        }
      }

      // spring back / toward target
      const ax = (tx - d.x) * 0.16;
      const ay = (ty - d.y) * 0.16;
      d.vx = (d.vx + ax) * 0.72;
      d.vy = (d.vy + ay) * 0.72;
      d.x += d.vx;
      d.y += d.vy;
      d.s += (ts - d.s) * 0.18;

      const settled =
        Math.abs(d.vx) < 0.004 && Math.abs(d.vy) < 0.004 &&
        Math.abs(d.x - d.ox) < 0.05 && Math.abs(d.y - d.oy) < 0.05 &&
        Math.abs(d.s - 1) < 0.004;

      if (settled) {
        // snap home so the map always returns to its exact original shape
        d.x = d.ox; d.y = d.oy; d.vx = 0; d.vy = 0; d.s = 1;
      } else {
        moving = true;
      }
    }

    updateMarkers();
    draw();

    // keep ticking while anything is still settling, then idle out
    if (moving || active) { idleFrames = 0; kick(); }
    else if (idleFrames++ < 4) kick();
  }

  function kick() {
    if (!raf && visible) raf = requestAnimationFrame(step);
  }

  // --- pause entirely when off screen --------------------------------------
  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    if (visible) { resize(); kick(); }
    else if (raf) { cancelAnimationFrame(raf); raf = 0; }
  }, { threshold: 0.02 }).observe(section);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && raf) { cancelAnimationFrame(raf); raf = 0; }
    else kick();
  });

  reduce.addEventListener('change', (e) => {
    if (e.matches) {
      if (raf) cancelAnimationFrame(raf);
      canvas.remove();
      svg.classList.remove('wmap--dots-hidden');
    }
  });

  // fonts/layout can shift the box after load
  window.addEventListener('load', resize);
  resize();
})();
