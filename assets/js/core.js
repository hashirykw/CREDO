/* ============================================================================
   CREDO · core.js — shared chrome & behaviour for every page
   Loaded synchronously right after <body> so the nav paints with the page.
   ============================================================================ */
(function () {
  const D = window.CREDO;
  const doc = document;
  const root = doc.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = {
    get(k, d) { try { const v = localStorage.getItem('credo:' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('credo:' + k, JSON.stringify(v)); } catch (e) {} }
  };
  const page = (doc.body.dataset.page || 'home');
  const app = doc.body.hasAttribute('data-app');

  /* ---------- icons ---------- */
  const I = {
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
    moon: '<svg class="theme-ic-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
    sun: '<svg class="theme-ic-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    sound: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>',
    up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M6 11l6-6 6 6"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 8h16M4 16h10"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg>',
    ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
    fb: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 8h3V4h-3a5 5 0 0 0-5 5v3H6v4h3v8h4v-8h3l1-4h-4V9a1 1 0 0 1 1-1z"/></svg>',
    yt: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12 31 31 0 0 0 1 16.8a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8zM9.8 15.1V8.9L15.6 12z"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.8 3h3.3l-7.2 8.2L22.4 21h-6.6l-5.2-6.8L4.7 21H1.4l7.7-8.8L1 3h6.8l4.7 6.2zm-1.2 16h1.8L7.5 4.9H5.6z"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1s-.5-.1-.7.1-.8 1-1 1.2-.4.2-.7.1a8.2 8.2 0 0 1-4-3.5c-.3-.5.3-.5.9-1.6.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6a1.1 1.1 0 0 0-.8.4 3.4 3.4 0 0 0-1 2.5 5.9 5.9 0 0 0 1.2 3.1 13.5 13.5 0 0 0 5.2 4.6c1.9.8 2.7.9 3.6.7a3.1 3.1 0 0 0 2-1.4 2.5 2.5 0 0 0 .2-1.4c-.1-.2-.3-.3-.6-.4zM12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2z"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="M22 7l-10 6L2 7"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
    left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 6l-6 6 6 6"/></svg>',
    right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg>'
  };

  const LINKS = [
    { href: './', label: 'Home', id: 'home' },
    { href: 'about', label: 'About', id: 'about' },
    { href: 'campuses', label: 'Campuses', id: 'campuses', mega: true },
    { href: 'academics', label: 'Academics', id: 'academics' },
    { href: 'faculty', label: 'Faculty', id: 'faculty' },
    { href: 'admissions', label: 'Admissions', id: 'admissions' },
    { href: 'life', label: 'Life at Credo', id: 'life' },
    { href: 'contact', label: 'Contact', id: 'contact' }
  ];

  /* ---------- sound (synthesised, no files) ---------- */
  let actx = null;
  let soundOn = store.get('sound', true);
  function tone(freqs, { dur = 0.12, type = 'sine', gain = 0.04, slide = 0, gap = 0.06 } = {}) {
    if (!soundOn) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === 'suspended') actx.resume();
      freqs.forEach((f, i) => {
        const t = actx.currentTime + i * gap;
        const o = actx.createOscillator(); const g = actx.createGain();
        o.type = type; o.frequency.setValueAtTime(f, t);
        if (slide) o.frequency.exponentialRampToValueAtTime(f * slide, t + dur);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g).connect(actx.destination); o.start(t); o.stop(t + dur + 0.02);
      });
    } catch (e) {}
  }
  const sfx = {
    tap: () => tone([660], { dur: 0.07, type: 'triangle', gain: 0.035 }),
    open: () => tone([520, 780], { dur: 0.12, type: 'sine', gain: 0.04 }),
    close: () => tone([620, 420], { dur: 0.1, type: 'sine', gain: 0.03 }),
    whoosh: () => tone([300], { dur: 0.32, type: 'sine', gain: 0.03, slide: 2.4 }),
    success: () => tone([523.25, 659.25, 783.99], { dur: 0.22, type: 'sine', gain: 0.045, gap: 0.08 }),
    error: () => tone([220, 180], { dur: 0.16, type: 'square', gain: 0.02 }),
    theme: () => tone([392, 587.33], { dur: 0.16, type: 'triangle', gain: 0.035 })
  };

  /* ---------- chrome markup ---------- */
  const campusMega = D.campuses.map((c) => `
    <a href="campuses#${c.id}" data-accent="${c.accent}">
      <div class="mega-img"><img src="${c.hero}" alt="" loading="lazy" decoding="async"></div>
      <b>${c.name}</b><span>${c.stage}</span>
    </a>`).join('');

  const navLinks = LINKS.filter((l) => l.id !== 'home' && l.id !== 'contact').map((l) => l.mega
    ? `<div class="has-mega"><button type="button" aria-expanded="false" aria-haspopup="true" ${page === l.id ? 'aria-current="page"' : ''}>${l.label} ${I.down}</button><div class="mega glass-3" role="menu"><a href="campuses" class="sr-only">All campuses</a>${campusMega}</div></div>`
    : `<a href="${l.href}" ${page === l.id ? 'aria-current="page"' : ''}>${l.label}</a>`).join('');

  const chrome = `
  <a class="skip" href="#main">Skip to content</a>
  <div class="aurora" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
  <div class="grain" aria-hidden="true"></div>
  <header class="nav" id="nav">
    <div class="nav-bar glass-3">
      <a class="brand" href="./" aria-label="Credo School & College Network, home">
        <img src="assets/img/brand/lion-navy.webp" alt="" width="38" height="33" class="brand-lion">
        <span class="brand-word"><b>CREDO</b><small>School &amp; College</small></span>
      </a>
      <nav class="nav-links" aria-label="Primary">${navLinks}</nav>
      <div class="nav-actions">
        <button class="icon-btn nav-tg" type="button" data-theme-toggle aria-label="Switch theme">${I.moon}${I.sun}</button>
        <button class="icon-btn nav-tg" type="button" data-sound-toggle aria-pressed="${soundOn}" aria-label="Sound effects">${I.sound}</button>
        <button class="search-pill" type="button" data-cmdk aria-label="Search the site">${I.search}<span class="lbl">Search</span><kbd>⌘K</kbd></button>
        <a class="icon-btn portal-mini" href="portal" aria-label="Parent &amp; Student Portal">${I.user}</a>
        <a class="btn btn-navy btn-sm" href="portal" data-sfx="open">Portal<span class="ic">${I.arrow}</span></a>
        <button class="icon-btn burger" type="button" aria-label="Open menu" aria-expanded="false" data-drawer>${I.menu}</button>
      </div>
    </div>
  </header>
  <div class="drawer" id="drawer" aria-hidden="true">
    <div class="drawer-scrim" data-drawer-close></div>
    <div class="drawer-panel glass-3" role="dialog" aria-label="Menu">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span class="eyebrow">Menu</span>
        <button class="icon-btn" type="button" aria-label="Close menu" data-drawer-close>${I.close}</button>
      </div>
      <nav class="drawer-links">${LINKS.map((l, i) => `<a href="${l.href}" ${page === l.id ? 'aria-current="page"' : ''}>${l.label}<small>0${i + 1}</small></a>`).join('')}</nav>
      <a class="btn btn-primary" href="portal" style="justify-content:space-between">Parent &amp; Student Portal<span class="ic">${I.arrow}</span></a>
      <a class="btn btn-gold" href="admissions" style="justify-content:space-between">Apply for admission<span class="ic">${I.arrow}</span></a>
    </div>
  </div>
  <div class="dock glass-3" role="group" aria-label="Display settings">
    <button class="icon-btn" type="button" data-theme-toggle aria-label="Switch theme">${I.moon}${I.sun}</button>
    <button class="icon-btn" type="button" data-sound-toggle aria-pressed="${soundOn}" aria-label="Sound effects">${I.sound}</button>
    <button class="icon-btn to-top" type="button" data-top aria-label="Back to top">${I.up}</button>
  </div>
  <div class="curtain" aria-hidden="true"><i></i><i></i><i></i><i></i></div>`;

  const here = doc.currentScript;
  here.insertAdjacentHTML('afterend', app
    ? `<a class="skip" href="#main">Skip to content</a><div class="aurora" aria-hidden="true"><i></i><i></i><i></i><i></i></div><div class="grain" aria-hidden="true"></div><div class="curtain" aria-hidden="true"><i></i><i></i><i></i><i></i></div>`
    : chrome);

  /* ---------- preloader: first visit of the session only ---------- */
  const firstVisit = !sessionStorage.getItem('credo:seen');
  if (firstVisit && !reduce) {
    sessionStorage.setItem('credo:seen', '1');
    doc.body.insertAdjacentHTML('afterbegin', `
      <div class="preloader" id="preloader" role="status" aria-label="Loading Credo">
        <div class="pl-inner">
          <img class="pl-lion" src="assets/img/brand/lion-gold.webp" alt="" width="120" height="104">
          <div class="pl-word" aria-hidden="true">${'CREDO'.split('').map((ch, i) => `<span style="animation-delay:${0.25 + i * 0.07}s">${ch}</span>`).join('')}</div>
          <div class="pl-bar"><i></i></div>
          <div class="pl-tag">#WeBelieve · Since 2017</div>
        </div>
      </div>`);
    const pl = doc.getElementById('preloader');
    const finish = () => { pl.classList.add('done'); setTimeout(() => pl.remove(), 700); };
    window.addEventListener('load', () => setTimeout(finish, 900));
    setTimeout(finish, 2600); // never hold the page longer than this
  } else {
    sessionStorage.setItem('credo:seen', '1');
  }

  /* ---------- curtain (page transitions) ---------- */
  const curtain = doc.querySelector('.curtain');
  if (sessionStorage.getItem('credo:curtain') === '1' && !reduce) {
    curtain.classList.add('cover');
    curtain.querySelectorAll('i').forEach((i) => { i.style.transition = 'none'; i.style.transformOrigin = 'top'; });
    requestAnimationFrame(() => requestAnimationFrame(() => {
      curtain.querySelectorAll('i').forEach((i) => { i.style.transition = ''; });
      curtain.classList.remove('cover');
    }));
  }
  sessionStorage.removeItem('credo:curtain');

  function go(href) {
    if (reduce) { location.href = href; return; }
    sfx.whoosh();
    curtain.querySelectorAll('i').forEach((i) => { i.style.transformOrigin = 'bottom'; });
    curtain.classList.add('cover');
    sessionStorage.setItem('credo:curtain', '1');
    setTimeout(() => { location.href = href; }, 560);
  }
  doc.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank' || a.hasAttribute('download')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.hash) return; // same-page anchor
    if (a.dataset.noCurtain !== undefined) return;
    e.preventDefault();
    go(url.href);
  });
  window.addEventListener('pageshow', (e) => { if (e.persisted) curtain.classList.remove('cover'); });

  /* ---------- theme ---------- */
  function setTheme(t) {
    root.dataset.theme = t; store.set('theme', t);
    doc.querySelectorAll('.brand-lion').forEach((img) => { img.src = t === 'dark' ? 'assets/img/brand/lion-gold.webp' : 'assets/img/brand/lion-navy.webp'; });
    doc.querySelector('meta[name="theme-color"]')?.setAttribute('content', t === 'dark' ? '#0d1230' : '#f8f5ef');
  }
  setTheme(root.dataset.theme || 'light');
  doc.addEventListener('click', (e) => {
    if (e.target.closest('[data-theme-toggle]')) {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      if (doc.startViewTransition && !reduce) doc.startViewTransition(() => setTheme(next)); else setTheme(next);
      sfx.theme();
    }
    if (e.target.closest('[data-sound-toggle]')) {
      soundOn = !soundOn; store.set('sound', soundOn);
      doc.querySelectorAll('[data-sound-toggle]').forEach((b) => b.setAttribute('aria-pressed', soundOn));
      if (soundOn) sfx.success();
    }
    if (e.target.closest('[data-top]')) { lenis ? lenis.scrollTo(0) : scrollTo({ top: 0, behavior: 'smooth' }); }
    if (e.target.closest('.btn, .tabs button, .chip[role="button"], [data-sfx="tap"]')) sfx.tap();
  });

  /* ---------- mega menu ---------- */
  const mega = doc.querySelector('.has-mega');
  if (mega) {
    const btn = mega.querySelector('button');
    let t;
    const open = (v) => { mega.classList.toggle('open', v); btn.setAttribute('aria-expanded', v); };
    mega.addEventListener('mouseenter', () => { clearTimeout(t); open(true); });
    mega.addEventListener('mouseleave', () => { t = setTimeout(() => open(false), 160); });
    btn.addEventListener('click', () => { const v = !mega.classList.contains('open'); open(v); if (v) sfx.open(); });
    doc.addEventListener('keydown', (e) => { if (e.key === 'Escape') open(false); });
    doc.addEventListener('click', (e) => { if (!mega.contains(e.target)) open(false); });
  }

  /* ---------- drawer ---------- */
  const drawer = doc.getElementById('drawer') || doc.createElement('div');
  function setDrawer(v) {
    if (!drawer.id) return;
    drawer.classList.toggle('open', v); drawer.setAttribute('aria-hidden', !v);
    doc.querySelector('[data-drawer]').setAttribute('aria-expanded', v);
    v ? sfx.open() : sfx.close();
    if (v) drawer.querySelector('[data-drawer-close].icon-btn').focus();
  }
  doc.addEventListener('click', (e) => {
    if (e.target.closest('[data-drawer]')) setDrawer(true);
    if (e.target.closest('[data-drawer-close]')) setDrawer(false);
  });

  /* ---------- nav hide on scroll / to-top ---------- */
  const nav = doc.getElementById('nav') || doc.createElement('div');
  const top = doc.querySelector('.to-top') || doc.createElement('div');
  const dock = doc.querySelector('.dock') || doc.createElement('div');
  let lastY = 0;
  function onScroll(y) {
    nav.classList.toggle('is-hidden', y > 240 && y > lastY && !mega?.classList.contains('open'));
    top.classList.toggle('show', y > 800);
    dock.classList.toggle('show', y > innerHeight * 0.75);
    lastY = y;
  }

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  function initLenis() {
    if (reduce || !window.Lenis || matchMedia('(pointer: coarse)').matches) {
      addEventListener('scroll', () => onScroll(scrollY), { passive: true });
      return;
    }
    lenis = new window.Lenis({ duration: 1.1, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true });
    lenis.on('scroll', ({ scroll }) => { onScroll(scroll); window.ScrollTrigger && window.ScrollTrigger.update(); });
    if (window.gsap) { window.gsap.ticker.add((t) => lenis.raf(t * 1000)); window.gsap.ticker.lagSmoothing(0); }
    else { const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf); }
    window.CredoLenis = lenis;
    doc.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (a && a.getAttribute('href').length > 1) { const el = doc.querySelector(a.getAttribute('href')); if (el) { e.preventDefault(); lenis.scrollTo(el, { offset: -90 }); } }
    });
  }

  /* ---------- reveal & counters ---------- */
  function initReveal() {
    const els = doc.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('in')); return; }
    const io = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight * 0.95) el.classList.add('in'); else io.observe(el); // above-the-fold content never waits
    });
    const cio = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (!en.isIntersecting) return; cio.unobserve(en.target);
      const el = en.target; const end = parseFloat(el.dataset.count); const dur = 1400; const t0 = performance.now();
      const fmt = (v) => (el.dataset.pad ? String(Math.round(v)).padStart(+el.dataset.pad, '0') : Math.round(v).toLocaleString());
      if (reduce) { el.textContent = fmt(end); return; }
      const step = (t) => { const p = Math.min(1, (t - t0) / dur); el.textContent = fmt(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    }), { threshold: 0.4 });
    doc.querySelectorAll('[data-count]').forEach((el) => cio.observe(el));
  }

  /* ---------- tilt ---------- */
  function initTilt() {
    if (reduce || matchMedia('(pointer: coarse)').matches) return;
    doc.querySelectorAll('[data-tilt]').forEach((el) => {
      const max = +el.dataset.tilt || 6;
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - 0.5; const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateX(${-y * max}deg) rotateY(${x * max}deg) translateZ(0)`;
        el.style.setProperty('--mx', (x + 0.5) * 100 + '%'); el.style.setProperty('--my', (y + 0.5) * 100 + '%');
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- command palette ---------- */
  const cmdItems = [
    ...LINKS.map((l) => ({ label: l.label, hint: 'Page', href: l.href })),
    { label: 'Parent & Student Portal', hint: 'Portal', href: 'portal' },
    ...D.campuses.map((c) => ({ label: c.name, hint: c.stage, href: 'campuses#' + c.id })),
    { label: 'No Tuition Policy', hint: 'Academics', href: 'academics#policies' },
    { label: 'A Level subjects', hint: 'Academics', href: 'academics#alevel' },
    { label: 'O Level streams', hint: 'Academics', href: 'academics#olevel' },
    { label: 'Preschool classes & ages', hint: 'Academics', href: 'academics#early' },
    { label: 'Scholarships', hint: 'Admissions', href: 'admissions#scholarships' },
    { label: 'Documents required', hint: 'Admissions', href: 'admissions#documents' },
    { label: 'Admission FAQ', hint: 'Admissions', href: 'admissions#faq' },
    { label: 'Houses: Cave, Congo, Cape', hint: 'Life', href: 'life#houses' },
    { label: 'Societies & clubs', hint: 'Life', href: 'life#societies' },
    { label: 'Gallery', hint: 'Life', href: 'life#gallery' },
    { label: 'Message from the Dean', hint: 'About', href: 'about#dean' },
    { label: 'University placements', hint: 'About', href: 'about#placements' },
    ...D.faculty.filter((f, i, a) => a.findIndex((g) => g.name === f.name) === i).map((f) => ({ label: f.name, hint: f.subject, href: 'faculty?q=' + encodeURIComponent(f.name) }))
  ];
  doc.body.insertAdjacentHTML('beforeend', `
    <div class="cmdk" id="cmdk" aria-hidden="true">
      <div class="cmdk-scrim" data-cmdk-close></div>
      <div class="cmdk-panel glass-3" role="dialog" aria-label="Search Credo">
        <input type="search" placeholder="Search pages, campuses, teachers…" aria-label="Search" autocomplete="off">
        <ul role="listbox"></ul>
      </div>
    </div>`);
  const cmdk = doc.getElementById('cmdk'); const cin = cmdk.querySelector('input'); const clist = cmdk.querySelector('ul');
  let cidx = 0, cres = [];
  function renderCmd() {
    const q = cin.value.trim().toLowerCase();
    cres = (q ? cmdItems.filter((i) => (i.label + ' ' + i.hint).toLowerCase().includes(q)) : cmdItems.slice(0, 12)).slice(0, 40);
    cidx = Math.min(cidx, Math.max(0, cres.length - 1));
    clist.innerHTML = cres.length ? cres.map((r, i) => `<li><a href="${r.href}" class="${i === cidx ? 'active' : ''}" role="option">${r.label}<small>${r.hint}</small></a></li>`).join('') : '<li class="empty">No match. Try “scholarship”, “physics” or “girls campus”.</li>';
  }
  function setCmd(v) {
    cmdk.classList.toggle('open', v); cmdk.setAttribute('aria-hidden', !v);
    if (v) { cin.value = ''; cidx = 0; renderCmd(); setTimeout(() => cin.focus(), 30); sfx.open(); lenis && lenis.stop(); } else { lenis && lenis.start(); }
  }
  cin.addEventListener('input', () => { cidx = 0; renderCmd(); });
  cin.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { cidx = Math.min(cres.length - 1, cidx + 1); renderCmd(); e.preventDefault(); }
    if (e.key === 'ArrowUp') { cidx = Math.max(0, cidx - 1); renderCmd(); e.preventDefault(); }
    if (e.key === 'Enter' && cres[cidx]) { setCmd(false); go(cres[cidx].href); }
  });
  doc.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setCmd(!cmdk.classList.contains('open')); }
    if (e.key === '/' && !/input|textarea|select/i.test(doc.activeElement.tagName)) { e.preventDefault(); setCmd(true); }
    if (e.key === 'Escape') { if (cmdk.classList.contains('open')) setCmd(false); if (drawer.classList.contains('open')) setDrawer(false); }
  });
  doc.addEventListener('click', (e) => { if (e.target.closest('[data-cmdk]')) setCmd(true); if (e.target.closest('[data-cmdk-close]')) setCmd(false); });

  /* ---------- Ask Credo (rule-based helper, answers only from Credo's published info) ---------- */
  const college = D.campuses[0], school = D.campuses[1], pre = D.campuses[2], girls = D.campuses[3];
  const answers = [
    { k: /fee|price|cost|charges|kitni|kitna/, a: () => `Credo doesn’t publish fees online. Each campus shares the current fee schedule directly — College ${college.phones[0]}, O Levels ${school.phones[1]}, Preschool ${pre.phones[0]}, Girls Campus ${girls.phones[0]}.` },
    { k: /scholar|waiver|discount|merit|need/, a: () => `Credo College offers merit scholarships from 10% to 100% tuition, plus ECA, sports and need-based awards — valid for one year, reviewed for A2. <a href="admissions#scholarships">See the criteria</a>.` },
    { k: /document|papers|b-?form|cnic|required/, a: () => `For school admission: B-Form, birth certificate, 3 passport photos, parents’ CNICs, last progress report and ECA certificates (originals returned). College needs attested reports and O Level results too. <a href="admissions#documents">Full lists</a>.` },
    { k: /admission|apply|enrol|enroll|join|form|test|interview/, a: () => `Apply online, then the admissions team reviews and calls you for an interview (Grades 1–5 take a test; preschoolers have a friendly observation). College applications run on Credo’s Skoolify portal. <a href="admissions">Admissions guide</a>.` },
    { k: /pre-?school|nursery|kg|kindergarten|primary|montessori|grade [1-5]\b/, a: () => `Credo Preschool & Primary is at ${pre.address}. Pre-nursery 2.5–3.5, Nursery 3.5–4.5, KG 4.5–5.5, then Grades 1–5. Visits Mon–Fri 8:30–12:30 · ${pre.phones[0]}.` },
    { k: /girl/, a: () => `Credo School Girls Campus: ${girls.address} · ${girls.phones[0]} · ${girls.email}.` },
    { k: /a ?level|college|as level|a2/, a: () => `Credo College (A Levels, centre P6012) is at ${college.address}. Subjects span Commerce, Science and Humanities. Call ${college.phones[0]}.` },
    { k: /o ?level|matric|grade (6|7|8|9|10|11)|middle/, a: () => `Credo School (Grades 6–11, centre PK741) is at ${school.address}. Science and Commerce streams from Grade 9. Call ${school.phones.join(' / ')}.` },
    { k: /tuition|coaching|academy/, a: () => `Credo runs a no-tuition policy: top faculty, the syllabus restarted every year, past papers solved in school, study kits and revision workshops — with 90% monthly attendance. <a href="academics#policies">How it works</a>.` },
    { k: /subject|stream|science|commerce|humanities|biology|computer/, a: () => `O Level streams: Science (Biology, Chemistry, Computer Science, Physics) or Commerce (Business, Economics, Accounts). A Levels add Humanities: Law, Psychology, Sociology, Media, Art & Design, English, Urdu. <a href="academics">Academics</a>.` },
    { k: /portal|diary|timetable|result|login|homework|assignment/, a: () => `The Parent & Student Portal holds the daily diary, timetable, assignments, notes, notices and results — parents see their child’s progress. <a href="portal">Open the portal</a>.` },
    { k: /where|address|location|map|campus/, a: () => `All four campuses are in Block 7, Gulshan-e-Iqbal, near Maskan / Disco Bakers. <a href="campuses">See every campus</a>.` },
    { k: /contact|phone|call|number|whatsapp|email/, a: () => `College ${college.phones[0]} · O Levels ${school.phones.join(' / ')} · Preschool ${pre.phones[0]} · Girls ${girls.phones[0]}. <a href="contact">All contacts</a>.` },
    { k: /house|cave|congo|cape/, a: () => `Credo has three houses — Cave, Congo and Cape — competing in sports, academics and challenges like the inter-house debate. <a href="life#houses">Meet the houses</a>.` },
    { k: /teacher|faculty|sir|miss/, a: () => `Credo’s faculty page lists ${new Set(D.faculty.map((f) => f.name)).size} teachers across the campuses. <a href="faculty">Browse faculty</a>.` },
    { k: /job|career|work|vacanc|cv/, a: () => `Credo welcomes teachers who want to be part of the team — send your CV via the contact page and mention your preferred campus. <a href="contact#work">Work at Credo</a>.` },
    { k: /timing|time|hours|open/, a: () => `The Preschool & Primary campus receives visitors Monday–Friday, 8:30 am–12:30 pm. For other campuses, call to book a tour.` },
    { k: /hi|hello|salam|assalam|hey/, a: () => `Walaikum assalam! Ask me about admissions, campuses, scholarships, subjects or the portal.` }
  ];
  if (!app) doc.body.insertAdjacentHTML('beforeend', `
    <div class="ask" id="ask">
      <div class="ask-panel glass-3" role="dialog" aria-label="Ask Credo">
        <div class="ask-head"><img src="assets/img/brand/lion-gold.webp" alt=""><div><b>Ask Credo</b><div class="ink-3" style="font-size:.75rem">Answers from Credo’s published information</div></div>
          <button class="icon-btn" type="button" style="margin-left:auto" aria-label="Close" data-ask-close>${I.close}</button></div>
        <div class="ask-log" aria-live="polite"><div class="msg bot">Assalam-o-Alaikum! I can help with admissions, campuses, scholarships, subjects and the portal.</div></div>
        <div class="ask-sugg">${['Admissions', 'Scholarships', 'Preschool ages', 'Fees', 'Portal'].map((s) => `<button type="button">${s}</button>`).join('')}</div>
        <form><input type="text" placeholder="Type a question…" aria-label="Your question"><button class="icon-btn" type="submit" aria-label="Send">${I.send}</button></form>
      </div>
      <button class="ask-btn glass-3" type="button" aria-expanded="false" data-ask-toggle><span>Ask Credo</span><img src="assets/img/brand/lion-gold.webp" alt=""></button>
    </div>`);
  const ask = doc.getElementById('ask') || doc.createElement('div'); const log = ask.querySelector('.ask-log');
  const say = (html, who) => { log.insertAdjacentHTML('beforeend', `<div class="msg ${who}">${html}</div>`); log.scrollTop = log.scrollHeight; };
  function reply(q) {
    say(q.replace(/</g, '&lt;'), 'me');
    const hit = answers.find((x) => x.k.test(q.toLowerCase()));
    setTimeout(() => { say(hit ? hit.a() : `I don’t have that one. The admissions office will know — College ${college.phones[0]} or <a href="contact">contact a campus</a>.`, 'bot'); sfx.tap(); }, 380);
  }
  if (!app) ask.querySelector('form').addEventListener('submit', (e) => { e.preventDefault(); const i = e.target.querySelector('input'); if (i.value.trim()) { reply(i.value.trim()); i.value = ''; } });
  if (!app) ask.querySelector('.ask-sugg').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) reply(b.textContent); });
  doc.addEventListener('click', (e) => {
    if (e.target.closest('[data-ask-toggle]')) { const v = !ask.classList.contains('open'); ask.classList.toggle('open', v); e.target.closest('[data-ask-toggle]').setAttribute('aria-expanded', v); v ? sfx.open() : sfx.close(); if (v) setTimeout(() => ask.querySelector('input').focus(), 60); }
    if (e.target.closest('[data-ask-close]')) { ask.classList.remove('open'); sfx.close(); }
  });

  /* ---------- footer ---------- */
  function footer() {
    const slot = doc.getElementById('footer');
    if (!slot) return;
    const s = (c) => [c.social.instagram && `<a href="${c.social.instagram}" target="_blank" rel="noopener" aria-label="${c.name} on Instagram">${I.ig}</a>`, c.social.facebook && `<a href="${c.social.facebook}" target="_blank" rel="noopener" aria-label="${c.name} on Facebook">${I.fb}</a>`, c.social.youtube && `<a href="${c.social.youtube}" target="_blank" rel="noopener" aria-label="${c.name} on YouTube">${I.yt}</a>`, c.social.x && `<a href="${c.social.x}" target="_blank" rel="noopener" aria-label="${c.name} on X">${I.x}</a>`].filter(Boolean).join('');
    slot.outerHTML = `
    <footer class="footer">
      <div class="wrap">
        <p class="statement" aria-label="We believe.">We <span>believe.</span></p>
        <div class="footer-grid">
          <div>
            <h4>Credo School &amp; College Network</h4>
            <p style="max-width:38ch;color:oklch(85% .02 270);font-size:.9rem">Cambridge education in Block 7, Gulshan-e-Iqbal, Karachi — from the first day of pre-nursery to the last paper of A2. Founded ${D.network.founded}. Cambridge centres P6012 &amp; PK741.</p>
            <div class="socials">${s(college)}</div>
          </div>
          <div><h4>Explore</h4><ul>${LINKS.map((l) => `<li><a href="${l.href}">${l.label}</a></li>`).join('')}<li><a href="portal">Parent &amp; Student Portal</a></li></ul></div>
          <div class="span-2" style="grid-column: span 2"><h4>Campuses</h4>
            <div class="grid cols-2" style="gap:0 var(--space-lg)">${D.campuses.map((c) => `<div class="campus-mini"><b>${c.name}</b>${c.address.replace(', Karachi 75300', '').replace(', Karachi', '')}<br><a href="tel:${c.tel}">${c.phones[0]}</a></div>`).join('')}</div>
          </div>
        </div>
        <div class="nexlyr">
          <div class="nx-id"><img src="assets/img/brand/nexlyr.svg" alt="Nexlyr Solutions logo" width="22" height="35"><div><small>Designed &amp; developed by</small><b>NEXLYR</b></div></div>
          <a class="nx-go" href="https://nexlyr.solutions" target="_blank" rel="noopener">Connect ${I.arrow.replace('<svg', '<svg width="14" height="14"')}</a>
        </div>
        <div class="footer-base"><span>© ${new Date().getFullYear()} Credo School &amp; College Network. Content and photographs © Credo.</span><span>#WeBelieve</span></div>
      </div>
    </footer>`;
  }

  /* ---------- small public helpers ---------- */
  function toast(text, kind) {
    let w = doc.querySelector('.toast-wrap');
    if (!w) { w = doc.createElement('div'); w.className = 'toast-wrap'; w.setAttribute('aria-live', 'polite'); doc.body.appendChild(w); }
    const t = doc.createElement('div'); t.className = 'toast glass-3'; t.innerHTML = (kind === 'ok' ? I.check.replace('<svg', '<svg width="16" height="16" style="color:var(--color-ok)"') : '') + text;
    w.appendChild(t); setTimeout(() => { t.style.transition = 'opacity .3s'; t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3200);
    kind === 'ok' ? sfx.success() : kind === 'err' ? sfx.error() : sfx.tap();
  }
  function tabs(rootEl, onChange) {
    const btns = [...rootEl.querySelectorAll('[role="tab"]')];
    btns.forEach((b, i) => {
      b.addEventListener('click', () => { btns.forEach((x) => x.setAttribute('aria-selected', x === b)); onChange(b.dataset.tab, i); });
      b.addEventListener('keydown', (e) => { const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (d) { const n = btns[(i + d + btns.length) % btns.length]; n.focus(); n.click(); } });
    });
  }
  function lightbox(list, start) {
    let i = start;
    const lb = doc.createElement('div'); lb.className = 'lightbox'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-label', 'Photo viewer');
    lb.innerHTML = `<img alt=""><button class="icon-btn lb-close" aria-label="Close">${I.close}</button><button class="icon-btn lb-nav lb-prev" aria-label="Previous">${I.left}</button><button class="icon-btn lb-nav lb-next" aria-label="Next">${I.right}</button>`;
    doc.body.appendChild(lb);
    const img = lb.querySelector('img');
    const show = () => { img.src = list[i].src; img.alt = list[i].alt || ''; };
    const close = () => { lb.classList.remove('open'); setTimeout(() => lb.remove(), 300); doc.removeEventListener('keydown', key); lenis && lenis.start(); };
    const key = (e) => { if (e.key === 'Escape') close(); if (e.key === 'ArrowRight') { i = (i + 1) % list.length; show(); } if (e.key === 'ArrowLeft') { i = (i - 1 + list.length) % list.length; show(); } };
    lb.addEventListener('click', (e) => {
      if (e.target === lb || e.target.closest('.lb-close')) close();
      if (e.target.closest('.lb-next')) { i = (i + 1) % list.length; show(); sfx.tap(); }
      if (e.target.closest('.lb-prev')) { i = (i - 1 + list.length) % list.length; show(); sfx.tap(); }
    });
    doc.addEventListener('keydown', key); show(); lenis && lenis.stop();
    requestAnimationFrame(() => lb.classList.add('open')); sfx.open();
    lb.querySelector('.lb-close').focus();
  }

  window.Credo = { I, sfx, store, toast, tabs, lightbox, go, reduce, get lenis() { return lenis; } };

  doc.addEventListener('DOMContentLoaded', () => {
    footer();
    initLenis();
    initReveal();
    initTilt();
    doc.dispatchEvent(new CustomEvent('credo:ready'));
  });
})();
