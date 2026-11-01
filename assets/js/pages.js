/* CREDO · pages.js — renders data-driven sections for each page. Runs deferred (DOM parsed, before reveal init). */
(function () {
  const D = window.CREDO, C = window.Credo, I = C.I, doc = document;
  const $ = (s, r = doc) => r.querySelector(s);
  const page = doc.body.dataset.page;
  const byId = Object.fromEntries(D.campuses.map((c) => [c.id, c]));
  const uniq = (arr, key) => arr.filter((x, i, a) => a.findIndex((y) => key(y) === key(x)) === i);
  const people = uniq(D.faculty, (f) => f.name);
  const arrow = I.arrow;

  doc.querySelectorAll('.faculty-count').forEach((el) => { el.textContent = people.length; });

  /* faculty card */
  const fcard = (f) => f.img
    ? `<figure class="fcard" style="margin:0"><img src="${f.img}" alt="${f.name}" loading="lazy" decoding="async" width="210" height="262"><figcaption class="fc-tag glass-3"><b>${f.name}</b><span>${f.subject}</span></figcaption></figure>`
    : `<figure class="fcard no-img" style="margin:0"><span class="mono-init" aria-hidden="true">${f.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}</span><figcaption class="fc-tag glass-3"><b>${f.name}</b><span>${f.subject}</span></figcaption></figure>`;

  /* ================= HOME ================= */
  if (page === 'home') {
    // rotating belief line
    const rot = [...doc.querySelectorAll('.hero .rot span')];
    let ri = 0;
    if (!C.reduce) setInterval(() => {
      const cur = rot[ri]; ri = (ri + 1) % rot.length; const nxt = rot[ri];
      cur.classList.remove('on'); cur.classList.add('out');
      nxt.classList.remove('out'); nxt.classList.add('on');
      setTimeout(() => cur.classList.remove('out'), 900);
    }, 2600);

    // fanned campus stack
    const stack = $('#stack'); const dots = $('#stack .dots');
    const order = ['college', 'school', 'preschool', 'girls'].map((id) => byId[id]);
    order.forEach((c, i) => {
      stack.insertAdjacentHTML('afterbegin', `<a class="stack-card" href="campuses#${c.id}" data-i="${i}" data-pos="${i}" data-accent="${c.accent}" aria-label="${c.name}">
        <img src="${c.hero}" alt="" ${i ? 'loading="lazy"' : 'fetchpriority="high"'} decoding="async">
        <span class="sc-badge ${c.logoDark ? 'plate-dark' : ''}"><img src="${c.logo}" alt="${c.name} logo"></span>
        <span class="sc-meta"><span><small>${c.stage}</small><b>${c.name}</b></span><span class="ct-go" style="width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:var(--campus);color:var(--campus-ink)">${arrow.replace('<svg', '<svg width="16" height="16"')}</span></span>
      </a>`);
      dots.insertAdjacentHTML('beforeend', `<button type="button" role="tab" aria-label="${c.name}" aria-current="${i === 0}"></button>`);
    });
    const cards = [...stack.querySelectorAll('.stack-card')].sort((a, b) => a.dataset.i - b.dataset.i);
    let top = 0, timer;
    const lay = () => {
      cards.forEach((card, i) => { const p = (i - top + cards.length) % cards.length; card.dataset.pos = p; card.tabIndex = p === 0 ? 0 : -1; });
      [...dots.children].forEach((d, i) => d.setAttribute('aria-current', i === top));
    };
    const next = (to) => { top = to == null ? (top + 1) % cards.length : to; lay(); };
    const auto = () => { clearInterval(timer); if (!C.reduce) timer = setInterval(() => next(), 4200); };
    dots.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; next([...dots.children].indexOf(b)); auto(); C.sfx.tap(); });
    stack.addEventListener('pointerenter', () => clearInterval(timer));
    stack.addEventListener('pointerleave', auto);
    lay(); auto();

    // pathway
    const track = $('#pw-track');
    const pwImgs = ['preschool-circle-time', 'preschool-classroom', 'preschool-collaboration', 'preschool-library', 'school-trio', 'school-group', 'college-orientation', 'college-graduates'];
    D.pathway.forEach((s, i) => {
      const c = byId[s.campus];
      track.insertAdjacentHTML('beforeend', `<article class="pw-card glass-2" data-accent="${c.accent}">
        <div style="display:grid;gap:14px">
          <span class="pw-node">${String(i + 1).padStart(2, '0')}</span>
          <span class="ages">${s.ages}</span>
          <h3>${s.stage}</h3>
          <p>${s.text}</p>
          <span class="pw-campus">${c.name}</span>
        </div>
        <div class="pw-img"><img src="${D.ph(pwImgs[i])}" alt="" loading="lazy" decoding="async"></div>
      </article>`);
    });
    // pinned horizontal scroll on desktop
    const vp = $('#pw-viewport');
    const bar = $('#pw-progress');
    function pinPathway() {
      if (!window.gsap || !window.ScrollTrigger || C.reduce || innerWidth < 1000) return;
      gsap.registerPlugin(ScrollTrigger);
      const dist = () => track.scrollWidth - innerWidth;
      gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: { trigger: '#pathway', start: 'top top+=40', end: () => '+=' + dist(), pin: true, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: (st) => { bar.style.transform = `scaleX(${st.progress})`; } }
      });
    }
    pinPathway();

    // bento
    const tiles = { college: 't-college', school: 't-school', preschool: 't-pre', girls: 't-girls' };
    $('#bento').innerHTML = order.map((c) => `
      <a class="campus-tile ${tiles[c.id]}" href="campuses#${c.id}" data-accent="${c.accent}" data-reveal>
        <img class="bg" src="${c.photos[0]}" alt="" loading="lazy" decoding="async">
        <div class="ct-top"><span class="ct-logo ${c.logoDark ? 'plate-dark' : ''}"><img src="${c.logo}" alt="${c.name} logo"></span><span class="ct-stage">${c.stage}</span></div>
        <div class="ct-info">
          <h3>${c.name}</h3>
          <div class="ct-glass"><span>${I.pin}${c.address.split(',').slice(0, 2).join(',')}</span><span>${I.phone}${c.phones[0]}</span><span class="ct-go">${arrow}</span></div>
        </div>
      </a>`).join('');

    // faculty wall
    const withImg = people.filter((f) => f.img && f.campus === 'college');
    const half = Math.ceil(withImg.length / 2);
    const rowA = withImg.slice(0, half), rowB = withImg.slice(half);
    $('#fw-a').innerHTML = [...rowA, ...rowA].map(fcard).join('');
    $('#fw-b').innerHTML = [...rowB, ...rowB].map(fcard).join('');

    // houses
    $('#houses').innerHTML = D.life.houses.map((h, i) => `<article class="house glass-2" data-tone="${h.tone}" data-reveal style="--d:${i * 0.08}s" data-tilt="8"><img src="${h.crest}" alt="${h.name} house crest" loading="lazy"><h3>${h.name}</h3><span class="eyebrow">House ${i + 1} of 3</span></article>`).join('');

    // voices
    $('#voices').innerHTML = D.voices.map((v, i) => `<article class="voice glass-2" data-reveal style="--d:${i * 0.08}s"><p>“${v.quote}”</p><footer><span class="av">${v.name[0]}</span><div><b>${v.name}</b><div class="ink-3" style="font-size:.8rem">${v.role}</div></div></footer></article>`).join('');

    // universities
    const u1 = D.universities.international, u2 = D.universities.pakistan;
    $('#uni-a').innerHTML = [...u1, ...u1].map((u) => `<span class="uni glass-2">${u}</span>`).join('');
    $('#uni-b').innerHTML = [...u2, ...u2, ...u2].map((u) => `<span class="uni glass-2">${u}</span>`).join('');
  }

  /* ================= CAMPUSES ================= */
  if (page === 'campuses') {
    const host = $('#campus-list');
    const sub = $('#campus-subnav');
    sub.innerHTML = D.campuses.map((c) => `<a href="#${c.id}">${c.name.replace('Credo ', '')}</a>`).join('');
    host.innerHTML = D.campuses.map((c, idx) => {
      const soc = Object.entries(c.social).map(([k, v]) => `<a class="icon-btn" href="${v}" target="_blank" rel="noopener" aria-label="${c.name} on ${k}">${I[{ instagram: 'ig', facebook: 'fb', youtube: 'yt', x: 'x' }[k]]}</a>`).join('');
      return `<section class="section campus-sec" id="${c.id}" data-accent="${c.accent}" aria-labelledby="h-${c.id}">
        <div class="wrap">
          <div class="campus-head" data-reveal>
            <div>
              <span class="logo-plate ${c.logoDark ? 'plate-dark' : ''}"><img src="${c.logo}" alt="${c.name} logo"></span>
              <div class="eyebrow">${String(idx + 1).padStart(2, '0')} · ${c.label}</div>
              <h2 id="h-${c.id}" style="margin-top:10px">${c.name}</h2>
              <p class="lede" style="margin-top:var(--space-sm)">${c.intro}</p>
            </div>
            <div class="meta glass-2" style="padding:var(--space-md);border-radius:var(--radius-xl)">
              <div>${I.pin}<span>${c.address}</span></div>
              ${c.phones.map((p) => `<a href="tel:${p.includes('CREDO') ? '+923111127336' : '+92' + p.replace(/\D/g, '').replace(/^0/, '')}">${I.phone}<span>${p}</span></a>`).join('')}
              <a href="mailto:${c.email}">${I.mail}<span>${c.email}</span></a>
              ${c.visiting ? `<div>${I.check}<span>${c.visiting}</span></div>` : ''}
              ${c.centre ? `<div>${I.check}<span>Cambridge centre ${c.centre}</span></div>` : ''}
              <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">${soc}</div>
              <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">
                <a class="btn btn-sm btn-navy" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.name + ' ' + c.address)}" target="_blank" rel="noopener">Directions<span class="ic">${arrow}</span></a>
                <a class="btn btn-sm" href="https://wa.me/${c.whatsapp}?text=${encodeURIComponent('Assalam-o-Alaikum, I would like to know about admissions at ' + c.name + '.')}" target="_blank" rel="noopener">WhatsApp<span class="ic">${I.wa}</span></a>
              </div>
            </div>
          </div>
          <div class="campus-strip" data-reveal>
            ${c.photos.slice(0, 5).map((p, i) => `<button class="ph" type="button" data-lb="${c.id}" data-i="${i}" aria-label="Open photo ${i + 1} of ${c.name}"><img src="${p}" alt="${c.name} campus life" loading="lazy" decoding="async"></button>`).join('')}
          </div>
          <ul class="highlights">${c.highlights.map((h) => `<li class="glass-2" data-reveal>${h}</li>`).join('')}</ul>
        </div>
      </section>`;
    }).join('');
    doc.addEventListener('click', (e) => {
      const b = e.target.closest('[data-lb]'); if (!b) return;
      const c = byId[b.dataset.lb];
      C.lightbox(c.photos.map((src) => ({ src, alt: c.name })), +b.dataset.i);
    });
    // facilities
    $('#facilities').innerHTML = D.facilities.map((f, i) => `<article class="glass-2" data-reveal style="--d:${(i % 4) * 0.06}s;border-radius:var(--radius-xl);overflow:hidden">
      ${f.img ? `<div style="aspect-ratio:16/10;overflow:hidden"><img src="${f.img}" alt="${f.name}" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover"></div>` : `<div style="aspect-ratio:16/10;display:grid;place-items:center;background:linear-gradient(140deg,var(--brand-navy),var(--brand-crimson))"><img src="assets/img/brand/lion-gold.webp" alt="" style="width:72px;opacity:.9"></div>`}
      <div style="padding:18px"><h3 style="font-size:var(--text-lg)">${f.name}</h3><p class="ink-2" style="font-size:var(--text-sm);margin-top:4px">${f.text}</p></div></article>`).join('');
  }

  /* ================= ACADEMICS ================= */
  if (page === 'academics') {
    $('#early-grid').innerHTML = D.academics.preschoolClasses.map((s, i) => `<article class="stage glass-2" data-accent="blue" data-reveal style="--d:${i * 0.06}s"><span class="age">${s.ages}</span><h3>${s.name}</h3><p>${s.text}</p></article>`).join('');
    $('#principles').innerHTML = D.academics.teachingPrinciples.map((p) => `<li>${I.check}<span>${p}</span></li>`).join('');
    const ol = D.academics.oLevel;
    $('#ol-science').innerHTML = ol.science.map((s) => `<span>${s}</span>`).join('');
    $('#ol-commerce').innerHTML = ol.commerce.map((s) => `<span>${s}</span>`).join('');
    $('#ol-compulsory').innerHTML = ol.compulsory.map((s) => `<span>${s}</span>`).join('');
    const al = D.academics.aLevel;
    const tabs = $('#al-tabs'); const out = $('#al-subjects');
    const show = (k) => { out.innerHTML = al[k].map((s) => `<span>${s}</span>`).join(''); };
    tabs.innerHTML = Object.keys(al).map((k, i) => `<button type="button" role="tab" data-tab="${k}" aria-selected="${i === 0}">${k}</button>`).join('');
    C.tabs(tabs, show); show('Commerce');
    $('#policy-grid').innerHTML = D.academics.policies.map((p, i) => `<article class="card glass-2" data-reveal style="--d:${(i % 3) * 0.06}s"><span class="num">${String(i + 1).padStart(2, '0')}</span><h3 style="margin-top:8px">${p.title}</h3><p>${p.text}</p></article>`).join('');
    $('#support-grid').innerHTML = D.academics.support.map((s, i) => `<article class="glass-2" data-reveal style="--d:${i * 0.06}s;border-radius:var(--radius-xl);overflow:hidden"><div style="aspect-ratio:4/3;overflow:hidden"><img src="${s.img}" alt="${s.title}" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover"></div><div style="padding:20px"><h3 style="font-size:var(--text-lg)">${s.title}</h3><p class="ink-2" style="font-size:var(--text-sm);margin-top:6px">${s.text}</p></div></article>`).join('');
    $('#counsel').innerHTML = D.academics.counselling.map((c) => `<span>${c}</span>`).join('');
  }

  /* ================= FACULTY ================= */
  if (page === 'faculty') {
    const grid = $('#fdir'); const q = $('#fq'); const count = $('#fcount'); const tabs = $('#ftabs');
    let campus = 'all';
    const params = new URLSearchParams(location.search);
    if (params.get('q')) q.value = params.get('q');
    const campusName = { all: 'All', college: 'Credo College', school: 'O Level School', girls: 'Girls Campus' };
    tabs.innerHTML = Object.entries(campusName).map(([k, v], i) => `<button type="button" role="tab" data-tab="${k}" aria-selected="${i === 0}">${v}</button>`).join('');
    function render() {
      const term = q.value.trim().toLowerCase();
      let list = campus === 'all' ? people : D.faculty.filter((f) => f.campus === campus);
      if (term) list = list.filter((f) => (f.name + ' ' + f.subject + ' ' + f.dept).toLowerCase().includes(term));
      const groups = {};
      list.forEach((f) => { (groups[f.dept] = groups[f.dept] || []).push(f); });
      grid.innerHTML = list.length ? Object.entries(groups).map(([dept, fs]) => `<h2 class="h3" style="grid-column:1/-1;margin-top:var(--space-md);font-weight:500">${dept} <span class="fdir-count">· ${fs.length}</span></h2>${fs.map(fcard).join('')}`).join('') : `<p class="fdir-empty">No teacher matches “${q.value.replace(/</g, '&lt;')}”. Try a subject, like “Physics”.</p>`;
      count.textContent = `${list.length} ${list.length === 1 ? 'teacher' : 'teachers'}`;
    }
    C.tabs(tabs, (k) => { campus = k; render(); });
    q.addEventListener('input', render);
    render();
  }

  /* ================= ADMISSIONS ================= */
  if (page === 'admissions') {
    $('#steps').innerHTML = D.admissions.steps.map((s, i) => `<li class="glass-2" data-reveal style="--d:${i * 0.07}s"><h3>${s.title}</h3><p>${s.text}</p></li>`).join('');
    const docs = (arr) => arr.map((d) => `<li>${I.check}<span>${d}</span></li>`).join('');
    $('#docs-school').innerHTML = docs(D.admissions.schoolDocs);
    $('#docs-college').innerHTML = docs(D.admissions.collegeDocs);
    $('#elig').innerHTML = D.admissions.eligibility.map((e, i) => `<article class="card glass-2" data-reveal style="--d:${i * 0.05}s"><h3>${e.title}</h3><p>${e.text}</p></article>`).join('');
    $('#schol').innerHTML = D.admissions.scholarships.map((s, i) => `<article class="card glass-2 ${i === 0 ? 'gold-edge' : ''}" data-reveal style="--d:${i * 0.06}s"><span class="num">${String(i + 1).padStart(2, '0')}</span><h3 style="margin-top:8px">${s.title}</h3><p>${s.text}</p></article>`).join('');
    $('#faq').innerHTML = D.admissions.faq.map((f, i) => `<details ${i === 0 ? 'open' : ''}><summary>${f.q}<i aria-hidden="true">+</i></summary><div class="acc-body">${f.a}</div></details>`).join('');
    enquiryForm();
  }

  /* ================= LIFE ================= */
  if (page === 'life') {
    $('#houses').innerHTML = D.life.houses.map((h, i) => `<article class="house glass-2" data-tone="${h.tone}" data-reveal style="--d:${i * 0.08}s" data-tilt="8"><img src="${h.crest}" alt="${h.name} house crest" loading="lazy"><h3>${h.name}</h3></article>`).join('');
    $('#col-soc').innerHTML = D.life.collegeSocieties.map((s, i) => `<article class="card glass-2" data-reveal style="--d:${(i % 3) * 0.06}s"><h3>${s.name}</h3><p>${s.text}</p></article>`).join('');
    $('#sch-soc').innerHTML = D.life.schoolSocieties.map((s, i) => `<article class="glass-2" data-reveal style="--d:${i * 0.06}s;border-radius:var(--radius-xl);padding:var(--space-md);display:grid;justify-items:center;gap:10px;text-align:center"><img src="${s.img}" alt="${s.name} society logo" style="width:110px;height:110px;object-fit:contain" loading="lazy"><b>${s.name}</b></article>`).join('');
    $('#clubs').innerHTML = D.life.preschoolClubs.map((s, i) => `<article class="card glass-2" data-accent="blue" data-reveal style="--d:${(i % 3) * 0.06}s"><h3>${s.name}</h3><p>${s.text}</p></article>`).join('');
    $('#modules').innerHTML = D.life.modules.map((m) => `<span>${m}</span>`).join('');
    $('#sports').innerHTML = D.life.sports.map((m) => `<span>${m}</span>`).join('');
    $('#comps').innerHTML = D.life.competitions.map((m) => `<span>${m}</span>`).join('');
    $('#events').innerHTML = D.life.events.map((e, i) => `<article class="card glass-2" data-reveal style="--d:${(i % 4) * 0.05}s;padding:var(--space-md)"><h3 style="font-size:var(--text-lg)">${e.name}</h3><p>${e.text}</p></article>`).join('');
    const g = D.life.gallery;
    $('#gallery').innerHTML = g.map((p, i) => `<button type="button" data-i="${i}" aria-label="Open photo: ${p.alt}"><img src="${p.src}" alt="${p.alt}" loading="lazy" decoding="async"></button>`).join('');
    $('#gallery').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) C.lightbox(g, +b.dataset.i); });
    $('#writing').innerHTML = D.writing.map((w) => `<li><a href="${w.url}" target="_blank" rel="noopener" class="glass-2" style="display:flex;justify-content:space-between;gap:16px;align-items:center;padding:18px 22px;border-radius:var(--radius-lg)"><span><b style="font-family:var(--font-display);font-size:var(--text-lg);font-weight:500">${w.title}</b>${w.by ? `<span class="ink-3" style="display:block;font-size:.8rem">by ${w.by}</span>` : ''}</span>${arrow.replace('<svg', '<svg width="18" height="18" style="flex:none"')}</a></li>`).join('');
  }

  /* ================= ABOUT ================= */
  if (page === 'about') {
    $('#values').innerHTML = D.network.values.map((v, i) => `<article class="value glass-2" data-reveal style="--d:${i * 0.08}s"><span class="v-n">0${i + 1}</span><h3>${v.name}</h3><p>${v.text}</p></article>`).join('');
    $('#dean-msg').innerHTML = D.leadership.dean.message.map((p) => `<p style="margin-bottom:1em">${p}</p>`).join('');
    $('#founders').innerHTML = D.leadership.founders.map((f, i) => `<article class="founder glass-2" data-reveal style="--d:${(i % 2) * 0.08}s"><div class="fimg"><img src="${f.img}" alt="${f.name}" loading="lazy" decoding="async"></div><div><q>${f.quote}</q><b>${f.name}</b><span>${f.role}</span></div></article>`).join('');
    $('#mgmt').innerHTML = D.leadership.management.map((m) => `<li class="glass-2" style="padding:16px 20px;border-radius:var(--radius-md);display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap"><b>${m.name}</b><span class="ink-3" style="font-size:.85rem">${m.role}</span></li>`).join('');
    const u1 = D.universities.international, u2 = D.universities.pakistan;
    $('#uni-int').innerHTML = u1.map((u) => `<span>${u}</span>`).join('');
    $('#uni-pk').innerHTML = u2.map((u) => `<span>${u}</span>`).join('');
  }

  /* ================= CONTACT ================= */
  if (page === 'contact') {
    $('#ccards').innerHTML = D.campuses.map((c, i) => `<article class="ccard glass-2" data-accent="${c.accent}" data-reveal style="--d:${i * 0.06}s">
      <span class="logo-plate ${c.logoDark ? 'plate-dark' : ''}"><img src="${c.logo}" alt="${c.name} logo"></span>
      <h3>${c.name}</h3><span class="eyebrow">${c.stage}</span>
      <div class="row">${I.pin}<span>${c.address}</span></div>
      ${c.phones.map((p) => `<a class="row" href="tel:${p.includes('CREDO') ? '+923111127336' : '+92' + p.replace(/\D/g, '').replace(/^0/, '')}">${I.phone}<span>${p}</span></a>`).join('')}
      <a class="row" href="mailto:${c.email}">${I.mail}<span>${c.email}</span></a>
      <a class="row" href="https://wa.me/${c.whatsapp}" target="_blank" rel="noopener">${I.wa}<span>WhatsApp</span></a>
      <a class="link" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.name + ' ' + c.address)}" target="_blank" rel="noopener" style="margin-top:6px">Get directions ${arrow.replace('<svg', '<svg width="15" height="15"')}</a>
    </article>`).join('');
    enquiryForm();
  }

  /* shared: enquiry form → opens WhatsApp or email with the message written out */
  function enquiryForm() {
    const f = $('#enquiry'); if (!f) return;
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(f));
      let ok = true;
      f.querySelectorAll('[required]').forEach((el) => {
        const bad = !el.value.trim() || (el.type === 'tel' && el.value.replace(/\D/g, '').length < 10);
        el.setAttribute('aria-invalid', bad); ok = ok && !bad;
        const msg = el.closest('.field')?.querySelector('.err'); if (msg) msg.textContent = bad ? (el.type === 'tel' ? 'Enter a phone number we can call back.' : 'Please fill this in.') : '';
      });
      if (!ok) { C.toast('A couple of fields need attention.', 'err'); f.querySelector('[aria-invalid="true"]').focus(); return; }
      const c = byId[data.campus] || D.campuses[0];
      const text = `Assalam-o-Alaikum ${c.name},\n\n${data.purpose || 'Admission enquiry'}\nName: ${data.name}\nPhone: ${data.phone}${data.email ? '\nEmail: ' + data.email : ''}${data.grade ? '\nClass / grade: ' + data.grade : ''}${data.message ? '\n\n' + data.message : ''}\n\n(Sent from the Credo website)`;
      const btn = f.querySelector('button[type="submit"]'); btn.classList.add('is-loading');
      setTimeout(() => {
        btn.classList.remove('is-loading');
        if (data.via === 'email') location.href = `mailto:${c.email}?subject=${encodeURIComponent((data.purpose || 'Admission enquiry') + ' — ' + data.name)}&body=${encodeURIComponent(text)}`;
        else window.open(`https://wa.me/${c.whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
        C.toast(`Your message to ${c.name} is ready to send.`, 'ok');
      }, 450);
    });
    f.querySelectorAll('.input').forEach((el) => el.addEventListener('input', () => { if (el.getAttribute('aria-invalid') === 'true') { el.setAttribute('aria-invalid', 'false'); const m = el.closest('.field')?.querySelector('.err'); if (m) m.textContent = ''; } }));
  }

  /* subnav highlight for long pages */
  const subLinks = [...doc.querySelectorAll('.subnav a[href^="#"]')];
  if (subLinks.length && 'IntersectionObserver' in window) {
    const map = new Map(subLinks.map((a) => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { subLinks.forEach((a) => a.classList.remove('on')); map.get(en.target.id)?.classList.add('on'); } }), { rootMargin: '-45% 0px -50% 0px' });
    map.forEach((a, id) => { const el = doc.getElementById(id); if (el) io.observe(el); });
  }
})();
