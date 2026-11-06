/* ============================================================================
   CREDO PORTAL · portal.js
   Students, parents and teachers on one live store. Anything a teacher posts
   (diary, homework, notes, marks, attendance, notices) appears for the student
   and their parents at once — across tabs, via BroadcastChannel + storage.

   Two designs:
     · senior  — Grade 6+, parents of seniors, all teachers. Glass, three looks
                 (Mist, Mono, Prism).
     · junior  — Pre-nursery to Grade 5 (and parents while viewing a junior
                 child). Sticky notes, folders and stars, two looks (Day, Night).
   Credo content (campuses, admissions, houses, clubs, events) comes from
   data.js, which was collected from Credo's own public websites.
   Designed & developed by Nexlyr Solutions.
   ============================================================================ */
(function () {
  'use strict';
  const CFG = window.CREDO_PORTAL || { mode: 'preview' };
  const CR = window.CREDO;
  const doc = document, html = doc.documentElement;
  const $ = (s, r = doc) => r.querySelector(s);
  const $$ = (s, r = doc) => [...r.querySelectorAll(s)];
  const cap = (s) => String(s || '').charAt(0).toUpperCase() + String(s || '').slice(1);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const KEY = 'credo:portal:db:v5';
  const SKEY = 'credo:portal:session';
  const LKEY = 'credo:look';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const JR_MAX = CFG.juniorUpTo ?? 5;

  /* ---------- icons ---------- */
  const ic = (p, w = 2) => `<svg class="svg-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  const IC = {
    home: ic('<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>'),
    grid: ic('<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>'),
    diary: ic('<path d="M4 4h12a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3z"/><path d="M8 8h7M8 12h7M8 16h4"/>'),
    clock: ic('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    task: ic('<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 12l3 3 5-6"/>'),
    book: ic('<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/>'),
    folder: ic('<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'),
    chart: ic('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
    star: ic('<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>'),
    cal: ic('<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
    bell: ic('<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/>'),
    alert: ic('<path d="M12 3l10 18H2z"/><path d="M12 10v4M12 17.5v.5"/>'),
    chat: ic('<path d="M21 12a8 8 0 0 1-12 7l-6 2 2-5a8 8 0 1 1 16-4z"/>'),
    plus: ic('<path d="M12 5v14M5 12h14"/>'),
    out: ic('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>'),
    eye: ic('<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
    sign: ic('<path d="M3 17c3-3 5-8 8-8s-1 8 2 8 4-4 6-4"/><path d="M3 21h18"/>'),
    menu: ic('<path d="M4 7h16M4 12h16M4 17h10"/>'),
    check: ic('<path d="M20 6L9 17l-5-5"/>'),
    trash: ic('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
    grade: ic('<path d="M12 3l9 5-9 5-9-5z"/><path d="M7 10.5V16c3 2 7 2 10 0v-5.5"/>'),
    roll: ic('<path d="M9 11l2 2 4-4"/><rect x="3" y="4" width="18" height="16" rx="3"/>'),
    search: ic('<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>'),
    arrow: ic('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    ext: ic('<path d="M14 4h6v6M20 4l-9 9"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/>'),
    nfc: ic('<path d="M6 8.5a6 6 0 0 1 0 7M9.5 6a10 10 0 0 1 0 12M13 3.5a14 14 0 0 1 0 17"/>'),
    user: ic('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
    users: ic('<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0M17 4a4 4 0 0 1 0 8M22 21a7 7 0 0 0-4-6"/>'),
    teach: ic('<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4M7 9h6M7 12h4"/>'),
    phone: ic('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>'),
    pin: ic('<path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>'),
    spark: ic('<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/>'),
    trophy: ic('<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>'),
    heart: ic('<path d="M12 20s-7-4.4-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.6-9 9-9 9z"/>'),
    smile: ic('<circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9.5h.01M15 9.5h.01"/>'),
    reset: ic('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>')
  };
  /* subject glyphs — used on junior folders, timetable blocks and notes */
  const GLYPH = {
    ENG: ic('<path d="M4 19l4-14h2l4 14M5.5 14h7"/><path d="M15 12.5a2.5 2.5 0 1 1 5 0V19M20 15.5a2.5 2.5 0 1 1-5 0"/>', 1.8),
    MATH: ic('<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M7.5 8h3M9 6.5v3M14 8h3M7 15.5l3 3M10 15.5l-3 3M14 15h3M14 18h3"/>', 1.8),
    SCI: ic('<path d="M9 3h6M10 3v6L4.5 18.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3"/><path d="M7 15h10"/>', 1.8),
    CHEM: ic('<path d="M9 3h6M10 3v6L4.5 18.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3"/><path d="M7 15h10"/>', 1.8),
    PHY: ic('<circle cx="12" cy="12" r="1.6"/><ellipse cx="12" cy="12" rx="9" ry="3.6"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)"/>', 1.6),
    URDU: ic('<path d="M4 20l3-1 11-11-2-2L5 17z"/><path d="M14 6l2 2M16 4l4 4"/>', 1.8),
    ISL: ic('<path d="M15.5 4.5A8 8 0 1 0 19.5 16 6.4 6.4 0 0 1 15.5 4.5z"/><path d="M18 6.5l.7 1.5 1.6.2-1.2 1.1.3 1.6-1.4-.8-1.4.8.3-1.6-1.2-1.1 1.6-.2z"/>', 1.6),
    SST: ic('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>', 1.6),
    PST: ic('<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>', 1.8),
    COMP: ic('<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>', 1.8),
    CS: ic('<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>', 1.8),
    ART: ic('<path d="M12 3a9 9 0 0 0 0 18c1.4 0 2-1 2-2 0-1.5-1.5-1.6-1.5-3 0-1 .8-2 2-2H17a4 4 0 0 0 4-4c0-4-4-7-9-7z"/><circle cx="7.5" cy="11" r="1.2"/><circle cx="10" cy="7" r="1.2"/><circle cx="15" cy="7.5" r="1.2"/>', 1.6)
  };
  const STAR_SVG = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.8l2.85 5.8 6.4.93-4.63 4.5 1.1 6.37L12 17.4l-5.72 3 1.1-6.37-4.63-4.5 6.4-.93z"/></svg>';

  /* ---------- dates ---------- */
  const pad = (n) => String(n).padStart(2, '0');
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parse = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const isSchoolDay = (d) => d.getDay() >= 1 && d.getDay() <= 5;
  const TODAY = new Date(); TODAY.setHours(0, 0, 0, 0);
  const todayISO = iso(TODAY);
  const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const fmt = (s, o = { day: 'numeric', month: 'short' }) => parse(s).toLocaleDateString('en-GB', o);
  const fmtLong = (s) => parse(s).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  const ago = (t) => { const m = Math.round((Date.now() - t) / 60000); if (m < 1) return 'just now'; if (m < 60) return m + ' min ago'; const h = Math.round(m / 60); if (h < 24) return h + ' h ago'; return Math.round(h / 24) + ' d ago'; };
  function schoolDays(from, to) { const out = []; for (let d = new Date(from); d <= to; d = addDays(d, 1)) if (isSchoolDay(d)) out.push(iso(d)); return out; }
  const prevSchoolDay = (d, n = 1) => { let x = new Date(d), k = 0; while (k < n) { x = addDays(x, -1); if (isSchoolDay(x)) k++; } return x; };
  const nextSchoolDay = (d, n = 1) => { let x = new Date(d), k = 0; while (k < n) { x = addDays(x, 1); if (isSchoolDay(x)) k++; } return x; };
  const greet = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; };

  /* ---------- seeded random ---------- */
  let seed = 20171;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const pick = (a) => a[Math.floor(rnd() * a.length)];

  /* ---------- subjects ---------- */
  const SJ = {
    ENG: { name: 'English', c: '#4f7cff', j: '#3f7cff', note: 'blue' }, MATH: { name: 'Mathematics', jn: 'Maths', c: '#ef4f5f', j: '#ff8a1f', note: 'orange' },
    PHY: { name: 'Physics', c: '#22b8cf' }, CHEM: { name: 'Chemistry', c: '#2fb877' }, CS: { name: 'Computer Science', c: '#8b5cf6' },
    ISL: { name: 'Islamiyat', c: '#14a38b', j: '#8a6bff', note: 'purple' }, PST: { name: 'Pakistan Studies', c: '#e0a526' },
    URDU: { name: 'Urdu', c: '#e2589b', j: '#ff5fa2', note: 'pink' }, SCI: { name: 'Science', c: '#2fb877', j: '#23b26d', note: 'green' },
    SST: { name: 'Social Studies', c: '#e0a526', j: '#f2b400', note: 'yellow' }, COMP: { name: 'Computer', c: '#8b5cf6', j: '#2bb3d9', note: 'blue' },
    ART: { name: 'Art', c: '#ff7a3d', j: '#ff6a4d', note: 'yellow' }
  };
  const sjName = (k) => (skin() === 'junior' && SJ[k]?.jn) || SJ[k]?.name || k;
  const sjTag = (k) => `<span class="sj" style="--sj:${SJ[k]?.c || 'var(--gold)'}">${esc(sjName(k))}</span>`;
  const jcol = (k) => SJ[k]?.j || SJ[k]?.c || '#3f7cff';

  /* ============================================================
     SAMPLE DATA (preview mode) — fictional people, clearly labelled
     ============================================================ */
  function seedDB() {
    seed = 20171;
    const PERIODS = [['07:45', '08:25'], ['08:25', '09:05'], ['09:05', '09:45'], ['09:45', '10:25'], ['10:25', '10:50', 'BREAK'], ['10:50', '11:30'], ['11:30', '12:10'], ['12:10', '12:50'], ['12:50', '13:30']];
    const teachers = [
      { id: 'T-301', name: 'Ms. Hira Qadri', subject: 'MATH', classTeacherOf: '9-A', pass: 'credo123' },
      { id: 'T-302', name: 'Mr. Faraz Ahmed', subject: 'PHY' }, { id: 'T-303', name: 'Ms. Mehreen Shah', subject: 'ENG' },
      { id: 'T-304', name: 'Mr. Owais Khan', subject: 'CHEM' }, { id: 'T-305', name: 'Ms. Sadaf Noor', subject: 'CS' },
      { id: 'T-306', name: 'Mr. Usman Ghani', subject: 'ISL' }, { id: 'T-307', name: 'Ms. Rabia Iqbal', subject: 'PST' },
      { id: 'T-308', name: 'Ms. Nida Farooq', subject: 'URDU' },
      { id: 'T-311', name: 'Ms. Amna Rauf', subject: 'ENG', classTeacherOf: '3-B', pass: 'credo123' }
    ];
    const tFor = (k, cls) => cls === '3-B' ? 'T-311' : (teachers.find((t) => t.subject === k && !t.classTeacherOf) || teachers[0]).id;
    const classes = [
      { id: '9-A', name: 'Grade 9 · Section A', grade: 9, campus: 'school', campusName: 'Credo School · O Levels', stream: 'Science', classTeacher: 'T-301', room: 'Room 204',
        week: { Monday: ['ENG', 'MATH', 'PHY', 'CHEM', 'BREAK', 'CS', 'ISL', 'URDU', 'PST'], Tuesday: ['MATH', 'PHY', 'ENG', 'CS', 'BREAK', 'CHEM', 'PST', 'ISL', 'URDU'], Wednesday: ['PHY', 'CHEM', 'MATH', 'ENG', 'BREAK', 'URDU', 'CS', 'PST', 'ISL'], Thursday: ['CHEM', 'ENG', 'CS', 'MATH', 'BREAK', 'PHY', 'URDU', 'ISL', 'PST'], Friday: ['MATH', 'CS', 'ENG', 'PHY', 'BREAK', 'CHEM', 'ISL', 'PST', 'URDU'] } },
      { id: '3-B', name: 'Grade 3 · Section B', grade: 3, campus: 'preschool', campusName: 'Credo Preschool & Primary', classTeacher: 'T-311', room: 'Blue Room',
        week: { Monday: ['ENG', 'MATH', 'SCI', 'URDU', 'BREAK', 'ISL', 'ART', 'SST', 'COMP'], Tuesday: ['MATH', 'ENG', 'URDU', 'SCI', 'BREAK', 'COMP', 'SST', 'ISL', 'ART'], Wednesday: ['ENG', 'SCI', 'MATH', 'SST', 'BREAK', 'URDU', 'ISL', 'COMP', 'ART'], Thursday: ['SCI', 'MATH', 'ENG', 'URDU', 'BREAK', 'ART', 'ISL', 'SST', 'COMP'], Friday: ['MATH', 'ENG', 'ISL', 'SCI', 'BREAK', 'URDU', 'ART', 'COMP', 'SST'] } }
    ];
    const names9 = ['Ayaan Siddiqui', 'Hania Rizvi', 'Zain Merchant', 'Aleena Baig', 'Muhammad Taha', 'Eshal Kazmi', 'Rayyan Junaid', 'Mahnoor Tariq', 'Abdullah Shaikh', 'Zoha Ansari', 'Daniyal Hashmi', 'Fatima Zehra', 'Hamza Qureshi', 'Anaya Malik'];
    const houses = ['Cave', 'Congo', 'Cape'];
    const students = names9.map((n, i) => ({ id: i === 0 ? 'CS-26-0917' : 'CS-26-09' + pad(20 + i), name: n, classId: '9-A', roll: i + 1, house: houses[i % 3], pass: i === 0 ? 'credo123' : null }));
    students.push({ id: 'CP-26-0311', name: 'Inaya Siddiqui', classId: '3-B', roll: 7, house: 'Cape', pass: 'credo123' });
    ['Hadi Raza', 'Sara Imran', 'Ali Abbas', 'Maryam Noman', 'Yusuf Ilyas', 'Alisha Kamran'].forEach((n, i) => students.push({ id: 'CP-26-03' + pad(20 + i), name: n, classId: '3-B', roll: i + 1, house: houses[i % 3] }));
    const parents = [{ id: 'P-1001', name: 'Mrs. Sana Siddiqui', children: ['CS-26-0917', 'CP-26-0311'], phone: '03xx xxxxxxx', pass: 'credo123' }];

    const diary = [];
    const hw9 = { ENG: ['Read “The Necklace” and write a 150-word summary', 'Comprehension practice: Paper 1, passage B', 'Learn 15 vocabulary words from the list'], MATH: ['Exercise 7.2 — questions 1 to 12', 'Simultaneous equations worksheet, side A', 'Revise indices; quiz tomorrow'], PHY: ['Draw and label a ray diagram for a convex lens', 'Bring the lab journal for the refraction practical', 'Past paper Q4 (speed–time graphs)'], CHEM: ['Balance the 10 equations on the handout', 'Learn the reactivity series', 'Write up the titration practical'], CS: ['Trace table for the bubble-sort algorithm', 'Binary to hexadecimal conversions, set 3', 'Pseudocode: validate a 4-digit PIN'], ISL: ['Learn the summary of Surah Al-Fatiha', 'Notes: the Treaty of Hudaybiyyah'], PST: ['Map work: rivers of Pakistan', 'Learn the causes of the War of Independence 1857'], URDU: ['مضمون: میرا پسندیدہ کھیل (۱۵۰ الفاظ)', 'Learn the poem by heart for recitation'] };
    const hw3 = { ENG: ['Spelling list 9 — learn for Friday', 'Read pages 20–24 of the reader'], MATH: ['Workbook page 41: two-digit multiplication', 'Times tables of 7 and 8'], SCI: ['Collect three different leaves for class', 'Colour the water-cycle diagram'], URDU: ['حروفِ تہجی سے پانچ الفاظ لکھیں', 'Read story page 12'], ISL: ['Learn the Kalima Tayyiba with meaning'], SST: ['Name the four provinces of Pakistan'], COMP: ['Draw parts of a computer'], ART: ['Bring crayons and an A4 sheet'] };
    const days = [...schoolDays(prevSchoolDay(TODAY, 9), TODAY), iso(nextSchoolDay(TODAY))].filter((v, i, a) => a.indexOf(v) === i);
    days.forEach((d) => {
      const dow = DAYS[parse(d).getDay() - 1];
      if (!dow) return;
      classes.forEach((cls) => {
        const subs = cls.week[dow].filter((x) => x !== 'BREAK');
        const bank = cls.id === '9-A' ? hw9 : hw3;
        const count = 3;
        const chosen = [...new Set(subs.map(() => pick(subs)))].slice(0, count);
        chosen.forEach((k, j) => {
          diary.push({ id: `d-${cls.id}-${d}-${j}`, classId: cls.id, date: d, subject: k, teacherId: tFor(k, cls.id), type: j === 0 && rnd() > 0.6 ? 'reminder' : 'homework', text: pick(bank[k] || ['Revise today’s lesson']), due: iso(nextSchoolDay(parse(d))), at: parse(d).getTime() + 13 * 3600e3 + j * 60e3 });
        });
      });
    });
    const diarySeen = {};
    diary.filter((e) => e.date < todayISO).forEach((e) => { diarySeen[e.id] = { 'P-1001': parse(e.date).getTime() + 19 * 3600e3 }; });

    const assignments = [
      { id: 'a1', classId: '9-A', subject: 'PHY', teacherId: 'T-302', title: 'Refraction practical write-up', details: 'Aim, apparatus, method, results table and a conclusion. Use the template from the lab.', due: iso(nextSchoolDay(TODAY, 2)), max: 20 },
      { id: 'a2', classId: '9-A', subject: 'MATH', teacherId: 'T-301', title: 'Algebra problem set 4', details: 'Questions 1–20 from the booklet. Show full working — method marks count.', due: iso(nextSchoolDay(TODAY, 1)), max: 25 },
      { id: 'a3', classId: '9-A', subject: 'ENG', teacherId: 'T-303', title: 'Directed writing: a letter to the principal', details: 'Argue for a longer library period. 250–350 words.', due: iso(nextSchoolDay(TODAY, 4)), max: 25 },
      { id: 'a4', classId: '9-A', subject: 'CS', teacherId: 'T-305', title: 'Logic gates worksheet', details: 'Truth tables for AND, OR, NOT, NAND, NOR, XOR and the combined circuit on page 2.', due: iso(prevSchoolDay(TODAY, 2)), max: 15 },
      { id: 'a5', classId: '9-A', subject: 'CHEM', teacherId: 'T-304', title: 'Mole calculations — set B', details: 'Ten questions on moles, mass and Mr.', due: iso(prevSchoolDay(TODAY, 5)), max: 20 },
      { id: 'a6', classId: '3-B', subject: 'SCI', teacherId: 'T-311', title: 'My plant diary', details: 'Draw your bean plant every day for a week and write one line about how it changed.', due: iso(nextSchoolDay(TODAY, 3)), max: 10 },
      { id: 'a7', classId: '3-B', subject: 'ART', teacherId: 'T-311', title: 'Draw my family', details: 'Draw and colour your family on an A4 sheet. Write everyone’s name under them.', due: iso(nextSchoolDay(TODAY, 1)), max: 10 }
    ];
    const submissions = {};
    students.filter((s) => s.classId === '9-A').forEach((s, i) => {
      submissions['a4:' + s.id] = { status: 'submitted', at: parse(iso(prevSchoolDay(TODAY, 3))).getTime(), marks: 9 + Math.round(rnd() * 6), note: '' };
      submissions['a5:' + s.id] = { status: i % 5 === 3 ? 'late' : 'submitted', at: parse(iso(prevSchoolDay(TODAY, 6))).getTime(), marks: 12 + Math.round(rnd() * 8), note: '' };
      if (i % 3 === 0) submissions['a2:' + s.id] = { status: 'submitted', at: Date.now() - 3 * 3600e3, note: '' };
    });

    const notes = [
      { id: 'n1', classId: '9-A', subject: 'PHY', kind: 'Notes', title: 'Light — reflection & refraction summary', body: 'Laws of reflection, refractive index n = sin i / sin r, critical angle and total internal reflection, with 6 worked examples.', teacherId: 'T-302', at: Date.now() - 2 * 864e5 },
      { id: 'n2', classId: '9-A', subject: 'MATH', kind: 'Worksheet', title: 'Indices & standard form drill', body: '30 graded questions with answers on the last page.', teacherId: 'T-301', at: Date.now() - 4 * 864e5 },
      { id: 'n3', classId: '9-A', subject: 'CHEM', kind: 'Past paper', title: 'Stoichiometry — topical past paper questions', body: 'Questions from recent Cambridge O Level Chemistry papers, sorted by difficulty.', teacherId: 'T-304', at: Date.now() - 6 * 864e5 },
      { id: 'n4', classId: '9-A', subject: 'CS', kind: 'Notes', title: 'Data representation cheat sheet', body: 'Binary, denary, hexadecimal, two’s complement and file-size calculations on one page.', teacherId: 'T-305', at: Date.now() - 7 * 864e5 },
      { id: 'n5', classId: '9-A', subject: 'ENG', kind: 'Notes', title: 'Directed writing — the 5 marking criteria', body: 'What examiners reward in content and in language, with a model answer.', teacherId: 'T-303', at: Date.now() - 9 * 864e5 },
      { id: 'n6', classId: '9-A', subject: 'PST', kind: 'Notes', title: 'History section 1 timeline', body: 'Key dates 1707–1857 on a single printable timeline.', teacherId: 'T-307', at: Date.now() - 12 * 864e5 },
      { id: 'n7', classId: '3-B', subject: 'MATH', kind: 'Worksheet', title: 'Times tables practice (6–9)', body: 'A fun colour-by-answer sheet.', teacherId: 'T-311', at: Date.now() - 3 * 864e5 },
      { id: 'n8', classId: '3-B', subject: 'ENG', kind: 'Notes', title: 'Spelling lists 9 & 10', body: 'Words for the next two weekly tests.', teacherId: 'T-311', at: Date.now() - 5 * 864e5 },
      { id: 'n9', classId: '3-B', subject: 'SCI', kind: 'Worksheet', title: 'Parts of a plant', body: 'Label the root, stem, leaf and flower, then colour it in.', teacherId: 'T-311', at: Date.now() - 6 * 864e5 },
      { id: 'n10', classId: '3-B', subject: 'URDU', kind: 'Notes', title: 'Story of the week', body: 'Read aloud with a grown-up and circle five new words.', teacherId: 'T-311', at: Date.now() - 8 * 864e5 }
    ];

    const notices = [
      { id: 'x1', level: 'emergency', scope: 'campus:school', title: 'Early dismissal today', body: 'Due to a heavy-rain advisory, Credo School will close at 11:30 am today. Please arrange early pick-up. Vans will leave at 11:45.', at: Date.now() - 50 * 60e3, by: 'Campus Office', ack: {} },
      { id: 'x2', level: 'notice', scope: 'campus:school', title: 'Mid-term examinations begin in December', body: 'The mid-term examination schedule for Grades 6–11 will be shared in the diary next week. Study kits are available from subject teachers.', at: Date.now() - 2 * 864e5, by: 'Examinations Office', ack: {} },
      { id: 'x3', level: 'event', scope: 'class:9-A', title: 'Inter-house debate: Cave vs Congo', body: 'Thursday after break in the AV room. Congo and Cave teams please meet Ms. Mehreen at 10:25.', at: Date.now() - 3 * 864e5, by: 'Ms. Mehreen Shah', ack: {} },
      { id: 'x4', level: 'notice', scope: 'campus:preschool', title: 'Splash Day — bring a change of clothes', body: 'Grade 3 will enjoy Splash Day this Friday. Please send a towel and a change of clothes in a labelled bag.', at: Date.now() - 864e5, by: 'Ms. Amna Rauf', ack: {} },
      { id: 'x5', level: 'event', scope: 'all', title: 'Parent-teacher meeting', body: 'The first parent-teacher meeting of the session is on Saturday, 9:00 am – 12:00 pm, at every campus.', at: Date.now() - 5 * 864e5, by: 'Credo Network', ack: {} }
    ];

    const start = new Date(TODAY.getFullYear(), TODAY.getMonth() - 2, 18);
    const attendance = {};
    const sdays = schoolDays(start, prevSchoolDay(TODAY));
    students.forEach((s, si) => {
      attendance[s.id] = {};
      sdays.forEach((d) => { const r = rnd(); attendance[s.id][d] = r < (si === 0 ? 0.03 : 0.05) ? 'A' : r < 0.09 ? 'L' : 'P'; });
    });

    const results = [];
    const terms = [{ id: 'm1', name: 'September monthly test', date: iso(new Date(TODAY.getFullYear(), TODAY.getMonth() - 2, 26)), max: 25 }, { id: 'm2', name: 'October monthly test', date: iso(new Date(TODAY.getFullYear(), TODAY.getMonth() - 1, 16)), max: 25 }, { id: 'c1', name: 'First-term class test', date: iso(prevSchoolDay(TODAY, 2)), max: 50 }];
    classes.forEach((cls) => {
      const subs = [...new Set(Object.values(cls.week).flat())].filter((x) => x !== 'BREAK');
      terms.forEach((t) => subs.forEach((k) => {
        students.filter((s) => s.classId === cls.id).forEach((s, si) => {
          const base = s.id === 'CS-26-0917' ? 0.78 : s.id === 'CP-26-0311' ? 0.86 : 0.55 + (si % 5) * 0.07;
          const trend = t.id === 'c1' ? 0.05 : t.id === 'm2' ? 0.03 : 0;
          const v = Math.max(0.3, Math.min(0.99, base + trend + (rnd() - 0.5) * 0.18));
          results.push({ studentId: s.id, assessment: t.id, subject: k, marks: Math.round(v * t.max), max: t.max });
        });
      }));
    });
    const assessments = terms.map((t) => ({ ...t, published: true }));
    const remarks = { 'CS-26-0917': 'Ayaan is attentive and asks good questions. Physics and Mathematics are strengths; English directed writing needs more practice with structure.', 'CP-26-0311': 'Inaya reads beautifully and is kind to her classmates. A joy in Art and Science.' };
    const messages = [
      { id: 'm-1', thread: 'P-1001:T-301', from: 'P-1001', to: 'T-301', text: 'Assalam-o-Alaikum Ms. Hira, Ayaan was unwell yesterday — could you share what was covered in Maths?', at: Date.now() - 26 * 3600e3 },
      { id: 'm-2', thread: 'P-1001:T-301', from: 'T-301', to: 'P-1001', text: 'Walaikum assalam! We started Exercise 7.2 (simultaneous equations). I’ve added the worksheet to Notes — he can ask me in class too.', at: Date.now() - 24 * 3600e3 },
      { id: 'm-3', thread: 'P-1001:T-311', from: 'T-311', to: 'P-1001', text: 'Inaya read her story aloud to the class today — beautifully done!', at: Date.now() - 20 * 3600e3 }
    ];
    const leaves = [{ id: 'l1', studentId: 'CS-26-0917', parentId: 'P-1001', from: iso(nextSchoolDay(TODAY, 6)), to: iso(nextSchoolDay(TODAY, 6)), reason: 'Family wedding out of the city.', status: 'pending', at: Date.now() - 5 * 3600e3 }];
    return { v: 5, PERIODS, teachers, classes, students, parents, diary, diarySeen, done: {}, assignments, submissions, notes, notices, attendance, results, assessments, remarks, messages, leaves, activity: [], updated: Date.now() };
  }

  /* ---------- store with live sync ---------- */
  let db;
  const chan = 'BroadcastChannel' in window ? new BroadcastChannel('credo-portal') : null;
  function load() { try { db = JSON.parse(localStorage.getItem(KEY)); } catch (e) { db = null; } if (!db || db.v !== 5) { db = seedDB(); persist(); } db.done = db.done || {}; }
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) {} }
  function commit(summary, audience) {
    db.updated = Date.now();
    if (summary) { db.activity.unshift({ text: summary, audience: audience || 'all', at: Date.now(), by: session?.id }); db.activity = db.activity.slice(0, 40); }
    persist();
    chan && chan.postMessage({ summary, audience, by: session?.id });
  }
  function onRemote(msg) {
    load();
    if (!session) return;
    render();
    pulse('live');
    if (msg && msg.summary && msg.by !== session.id && relevant(msg.audience)) toast(`<b>Live</b> · ${esc(msg.summary)}`, 'ok');
  }
  chan && chan.addEventListener('message', (e) => onRemote(e.data));
  addEventListener('storage', (e) => { if (e.key === KEY) onRemote(null); });

  /* ---------- data helpers ---------- */
  const teacher = (id) => db.teachers.find((t) => t.id === id);
  const student = (id) => db.students.find((s) => s.id === id);
  const klass = (id) => db.classes.find((c) => c.id === id);
  const parentOf = (sid) => db.parents.filter((p) => p.children.includes(sid));
  const parentMe = () => db.parents.find((p) => p.id === session.id);
  const initials = (n) => n.replace(/^(Ms\.|Mr\.|Mrs\.|Dr\.)\s*/, '').split(' ').map((w) => w[0]).slice(0, 2).join('');
  const firstName = (n) => n.replace(/^(Ms\.|Mr\.|Mrs\.|Dr\.)\s*/, '').split(' ')[0];
  const subjectsOf = (cls) => [...new Set(Object.values(cls.week).flat())].filter((x) => x !== 'BREAK');
  const subjTeacher = (cls, k) => teacher(cls.grade <= JR_MAX ? cls.classTeacher : (db.teachers.find((t) => t.subject === k && !t.classTeacherOf) || db.teachers.find((t) => t.subject === k) || db.teachers[0]).id);
  const AVG = ['linear-gradient(135deg,#6c79ff,#b18cff)', 'linear-gradient(135deg,#ff9a6b,#ff5f8a)', 'linear-gradient(135deg,#2fc7a6,#3f8cff)', 'linear-gradient(135deg,#ffbe3d,#ff7a1a)', 'linear-gradient(135deg,#8a6bff,#ff6fae)', 'linear-gradient(135deg,#22b8cf,#2fb877)'];
  const avBg = (n) => AVG[[...n].reduce((a, c) => a + c.charCodeAt(0), 0) % AVG.length];
  const avatar = (n, cls = '') => `<span class="avatar ${cls}" style="--av:${avBg(n)}">${esc(initials(n))}</span>`;
  const isJrClass = (cls) => (cls?.grade ?? 9) <= JR_MAX;
  function noticesFor(sid) {
    const s = student(sid); const cls = klass(s.classId);
    return db.notices.filter((n) => n.scope === 'all' || n.scope === 'class:' + cls.id || n.scope === 'campus:' + cls.campus).sort((a, b) => b.at - a.at);
  }
  function attStats(sid) {
    const v = Object.values(db.attendance[sid] || {});
    const p = v.filter((x) => x === 'P').length, l = v.filter((x) => x === 'L').length, ab = v.filter((x) => x === 'A').length, lv = v.filter((x) => x === 'V').length;
    return { pct: Math.round(((p + l) / (v.length || 1)) * 100), p, l, a: ab, v: lv, total: v.length };
  }
  function weeklyAttendance(sid, weeks = 6) {
    const a = db.attendance[sid] || {}; const out = [];
    let end = isSchoolDay(TODAY) ? TODAY : prevSchoolDay(TODAY);
    for (let w = weeks - 1; w >= 0; w--) {
      const to = addDays(end, -7 * w), from = addDays(to, -6);
      const ds = schoolDays(from, to).filter((d) => a[d]);
      const ok = ds.filter((d) => a[d] === 'P' || a[d] === 'L').length;
      out.push({ label: `${from.getDate()}/${from.getMonth() + 1}`, pct: ds.length ? Math.round((ok / ds.length) * 100) : 0 });
    }
    return out;
  }
  function resultSummary(sid) {
    const rs = db.results.filter((r) => r.studentId === sid);
    const bySub = {};
    rs.forEach((r) => { (bySub[r.subject] = bySub[r.subject] || []).push(r); });
    const subAvg = Object.entries(bySub).map(([k, a]) => ({ k, pct: Math.round((a.reduce((s, r) => s + r.marks / r.max, 0) / a.length) * 100) })).sort((a, b) => b.pct - a.pct);
    const byAs = db.assessments.filter((a) => a.published).sort((a, b) => a.date.localeCompare(b.date)).map((a) => { const x = rs.filter((r) => r.assessment === a.id); return { a, pct: x.length ? Math.round((x.reduce((s, r) => s + r.marks / r.max, 0) / x.length) * 100) : null }; }).filter((x) => x.pct != null);
    const overall = subAvg.length ? Math.round(subAvg.reduce((s, x) => s + x.pct, 0) / subAvg.length) : 0;
    return { subAvg, byAs, overall, rs };
  }
  const grade = (p) => p >= 90 ? 'A*' : p >= 80 ? 'A' : p >= 70 ? 'B' : p >= 60 ? 'C' : p >= 50 ? 'D' : p >= 40 ? 'E' : 'U';
  const starsOf = (p) => p >= 90 ? 5 : p >= 80 ? 4 : p >= 65 ? 3 : p >= 50 ? 2 : 1;
  const starRow = (n) => `<span class="stars" aria-label="${n} out of 5 stars">${[1, 2, 3, 4, 5].map((i) => STAR_SVG.replace('<svg', `<svg class="${i <= n ? '' : 'off'}"`)).join('')}</span>`;
  function pendingFor(sid) {
    const s = student(sid);
    return db.assignments.filter((a) => a.classId === s.classId && !db.submissions[a.id + ':' + sid] && a.due >= todayISO).sort((a, b) => a.due.localeCompare(b.due));
  }
  const toM = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  function nowPeriod() {
    const dow = DAYS[new Date().getDay() - 1];
    if (!dow) return { dow: null, idx: -1, doneBefore: () => false };
    const mins = new Date().getHours() * 60 + new Date().getMinutes();
    const idx = db.PERIODS.findIndex((p) => mins >= toM(p[0]) && mins < toM(p[1]));
    return { dow, idx, doneBefore: (i) => mins >= toM(db.PERIODS[i][1]) };
  }
  const unsignedFor = (sid) => db.diary.filter((e) => e.classId === student(sid).classId && e.date <= todayISO && !(db.diarySeen[e.id] || {})[session.id]);

  /* ---------- session & look ---------- */
  let session = null;
  try { session = JSON.parse(localStorage.getItem(SKEY)); } catch (e) {}
  let childId = null;
  function relevant(aud) {
    if (!aud || aud === 'all') return true;
    if (session.role === 'teacher') return aud.includes('teacher') || aud.includes(session.id);
    const kids = session.role === 'parent' ? (parentMe()?.children || []) : [session.id];
    return kids.some((k) => { const s = student(k); return aud.includes('class:' + s.classId) || aud.includes('campus:' + klass(s.classId).campus) || aud.includes(k); }) || aud.includes(session.id);
  }
  const focusSid = () => !session ? null : session.role === 'student' ? session.id : session.role === 'parent' ? childId : null;
  function skin() {
    if (!session || session.role === 'teacher') return 'senior';
    const sid = focusSid(); const s = sid && student(sid);
    return s && isJrClass(klass(s.classId)) ? 'junior' : 'senior';
  }
  const LOOKS = { senior: [['mist', 'Mist'], ['mono', 'Mono'], ['prism', 'Prism']], junior: [['day', 'Day'], ['night', 'Night']] };
  const lookStore = () => { try { return JSON.parse(localStorage.getItem(LKEY) || '{}'); } catch (e) { return {}; } };
  function themeFor(sk) { const s = lookStore(); const t = s[sk]; return LOOKS[sk].some((l) => l[0] === t) ? t : sk === 'junior' ? 'night' : 'mist'; }
  function saveLook(sk, theme) { const s = lookStore(); s.skin = sk; if (theme) s[sk] = theme; try { localStorage.setItem(LKEY, JSON.stringify(s)); } catch (e) {} }
  const metaTheme = () => { const m = $('meta[name="theme-color"]'); if (m) m.content = getComputedStyle(html).getPropertyValue('--bg').trim() || '#d6ddf3'; };
  /* change skin/theme; with a pointer origin it animates as a circular reveal */
  function withReveal(fn, x, y) {
    if (!doc.startViewTransition || reduce || x == null) { fn(); return; }
    html.style.setProperty('--vx', x + 'px'); html.style.setProperty('--vy', y + 'px');
    doc.startViewTransition(fn);
  }
  function applyLook(sk, theme) {
    html.dataset.skin = sk; html.dataset.theme = theme || themeFor(sk);
    saveLook(sk, html.dataset.theme); metaTheme();
  }

  /* ---------- feedback: prism stripe + toast + confetti ---------- */
  let pulseT;
  function pulse(state, ms = 1400) {
    $$('.prism-line').forEach((p) => { p.dataset.state = state; });
    clearTimeout(pulseT);
    if (state !== 'busy') pulseT = setTimeout(() => $$('.prism-line').forEach((p) => { p.dataset.state = ''; }), ms);
  }
  function toast(text, kind) {
    let w = $('.toasts');
    if (!w) { w = doc.createElement('div'); w.className = 'toasts'; w.setAttribute('aria-live', 'polite'); doc.body.appendChild(w); }
    const t = doc.createElement('div'); t.className = `toast glass strong ${kind || ''}`;
    t.innerHTML = (kind === 'ok' ? IC.check : kind === 'err' ? IC.alert : IC.bell) + `<span>${text}</span>`;
    w.appendChild(t);
    if (kind === 'ok' || kind === 'err') pulse(kind === 'ok' ? 'ok' : 'error');
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 400); }, 3600);
  }
  function confetti(x = innerWidth / 2) {
    if (reduce) return;
    const c = doc.createElement('div'); c.className = 'confetti';
    const cols = ['#ff8a1f', '#3f7cff', '#ffc62a', '#2fc77a', '#ff6fae', '#8a6bff'];
    c.innerHTML = Array.from({ length: 46 }, (_, i) => `<i style="left:${x + (Math.random() - .5) * 220}px;background:${cols[i % cols.length]};--x:${(Math.random() - .5) * 320}px;--r:${Math.random() * 720 - 360}deg;--d:${1.2 + Math.random() * 1.1}s;animation-delay:${Math.random() * .15}s"></i>`).join('');
    doc.body.appendChild(c); setTimeout(() => c.remove(), 2600);
  }

  /* ---------- charts ---------- */
  function barChart(items, h = 190) {
    const w = 560, pb = 34, pt = 16, n = Math.max(1, items.length), bw = Math.min(40, (w - 50) / n - 14);
    const gap = (w - 40 - bw * n) / n;
    const y = (p) => pt + (h - pt - pb) * (1 - p / 100);
    return `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Average percentage by subject">
      ${[0, 50, 100].map((g) => `<line class="axis" x1="30" x2="${w}" y1="${y(g)}" y2="${y(g)}"/><text x="0" y="${y(g) + 3}">${g}%</text>`).join('')}
      ${items.map((it, i) => { const x = 40 + i * (bw + gap); return `<g><rect class="bar" style="--i:${i}" x="${x}" y="${y(it.pct)}" width="${bw}" height="${h - pb - y(it.pct)}" rx="8" fill="${SJ[it.k]?.c || 'var(--accent)'}"><title>${esc(sjName(it.k))}: ${it.pct}%</title></rect><text x="${x + bw / 2}" y="${y(it.pct) - 6}" text-anchor="middle" style="fill:var(--ink);font-weight:600">${it.pct}</text><text x="${x + bw / 2}" y="${h - 12}" text-anchor="middle">${it.k}</text></g>`; }).join('')}
    </svg>`;
  }
  let gid = 0;
  function lineChart(points, h = 170) {
    if (!points.length) return '<div class="empty">No published assessments yet.</div>';
    const w = 560, pl = 34, pr = 20, pt = 18, pb = 30, id = 'gA' + (++gid);
    const x = (i) => pl + (points.length === 1 ? (w - pl - pr) / 2 : (i * (w - pl - pr)) / (points.length - 1));
    const y = (p) => pt + (h - pt - pb) * (1 - (p - 30) / 70);
    const d = points.map((p, i) => `${i ? 'L' : 'M'}${x(i)},${y(p.pct)}`).join(' ');
    return `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Overall percentage over time">
      <defs><linearGradient id="${id}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="var(--accent)" stop-opacity=".32"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs>
      ${[40, 70, 100].map((g) => `<line class="axis" x1="${pl}" x2="${w - pr}" y1="${y(g)}" y2="${y(g)}"/><text x="0" y="${y(g) + 3}">${g}%</text>`).join('')}
      <path class="area" style="fill:url(#${id})" d="${d} L${x(points.length - 1)},${h - pb} L${x(0)},${h - pb} Z"/>
      <path class="line" d="${d}"/>
      ${points.map((p, i) => `<circle class="pt" cx="${x(i)}" cy="${y(p.pct)}" r="5"><title>${esc(p.a.name)}: ${p.pct}%</title></circle><text x="${x(i)}" y="${y(p.pct) - 12}" text-anchor="middle" style="fill:var(--ink);font-weight:600">${p.pct}%</text><text x="${x(i)}" y="${h - 10}" text-anchor="middle">${esc(p.a.name.split(' ')[0])}</text>`).join('')}
    </svg>`;
  }
  function ring(pct, label, color) {
    const r = 54, c = +(2 * Math.PI * r).toFixed(1);
    return `<div class="ring"><svg viewBox="0 0 132 132"><circle class="bg" cx="66" cy="66" r="${r}"/><circle class="fg" cx="66" cy="66" r="${r}" stroke="${color || 'var(--accent)'}" style="--c:${c}" stroke-dasharray="${c}" stroke-dashoffset="${(c * (1 - pct / 100)).toFixed(1)}"/></svg><div class="rv"><div><b data-count="${pct}" data-suf="%">${pct}%</b><span>${esc(label)}</span></div></div></div>`;
  }
  const slims = (items) => `<div class="slims">${items.map((it) => `<div class="b"><span class="tr" style="--h:${it.pct}%"><i style="height:${it.pct}%"></i><em>${it.pct}%</em></span><span class="lb">${esc(it.label)}</span></div>`).join('')}</div>`;
  const meter = (pct, bad) => `<div class="meter ${bad ? 'bad' : ''}"><i style="width:${pct}%"></i></div>`;

  /* ============================================================
     CREDO PROMOTIONS (all facts from data.js)
     ============================================================ */
  const camp = (id) => CR.campuses.find((c) => c.id === id);
  const PROMO = {
    college: () => ({ kick: 'Next at Credo · A Levels', h: 'Credo College — AS & A2', p: `Cambridge centre ${camp('college').centre}. Commerce, Science and Humanities, with merit, need, ECA and sports scholarships from 10% to 100% of tuition.`, img: camp('college').hero, cta: [['Visit the College', camp('college').site, 1], ['Apply on Skoolify', CR.network.skoolify]] }),
    admissions: () => ({ kick: 'Admissions · Credo Network', h: CR.network.session.replace(' · ', ', '), p: 'Four campuses in Block 7, Gulshan-e-Iqbal — from Pre-nursery to A2. Apply online on Credo’s Skoolify form.', img: CR.campuses[0].photos[0], cta: [['Apply on Skoolify', CR.network.skoolify, 1], ['UAN ' + CR.network.uan.split(' ')[0], 'tel:+923111127336']] }),
    school: () => ({ kick: 'Credo School · Grades 6–11', h: 'The no-tuition promise', p: 'The O Level syllabus restarts from scratch every year, past papers are solved and checked in school, and revision workshops replace prep leave.', img: camp('school').hero, cta: [['Visit the School', camp('school').site, 1]] }),
    preschool: () => ({ kick: 'Credo Preschool & Primary', h: 'Little steps, big smiles', p: camp('preschool').visiting + '. Art studio, sensory play, ICT lab, library and an AV room.', img: camp('preschool').photos[0], cta: [['Visit the campus site', camp('preschool').site, 1]] }),
    girls: () => ({ kick: 'Credo School Girls Campus', h: 'Inspiring girls, empowering futures', p: 'Reading Enhancement Program, music, arts & crafts, Moral Value Education and Computer Science Unplugged.', img: camp('girls').hero, cta: [['Visit the Girls Campus', camp('girls').site, 1]] }),
    mun: () => ({ kick: 'Credo Student Enrichment Program', h: 'Debate. MUN. Lead.', p: 'The Debate Society hosts the annual Credo MUN and represents the college at local and international MUNs.', img: CR.ph('college-stage-night'), cta: [['College life', camp('college').site, 1]] }),
    support: () => ({ kick: 'Beyond the classroom', h: 'Aptitude test preparation', p: 'SAT, ECAT, MDCAT or BCAT — a dedicated Credo programme for competitive entrance exams, locally and abroad.', img: CR.ph('college-aptitude'), cta: [['Explore the College', camp('college').site, 1]] }),
    splash: () => ({ kick: 'Fun at Credo', h: 'Sports Day, Splash Day & more', p: 'Discipline and sportsmanship on Sports Day, water play on Splash Day, Grandparents Day, Seerat-un-Nabi and Earth Day.', img: CR.ph('preschool-sports-day'), cta: [['See the Preschool', camp('preschool').site, 1]] }),
    taekwondo: () => ({ kick: 'Credo Preschool & Primary', h: 'Robotics, Taekwondo, Tajweed', p: 'Plus public speaking — and a school clinic with a qualified nurse.', img: CR.ph('preschool-taekwondo'), cta: [['Visit the campus site', camp('preschool').site, 1]] }),
    workshops: () => ({ kick: 'For Credo faculty', h: 'Credo Workshops', p: CR.academics.support[3].text, img: CR.ph('college-study'), cta: [['Credo College', camp('college').site, 1]] })
  };
  function promoCard(k, extra = '') {
    const p = PROMO[k]();
    return `<article class="promo ${extra}"><div class="ph"><img src="${p.img}" alt="" loading="lazy"></div>
      <span class="kick">${esc(p.kick)}</span><h3>${esc(p.h)}</h3><p>${esc(p.p)}</p>
      <div class="cta">${p.cta.map(([t, u, main]) => `<a class="btn ${main ? 'btn-white' : 'btn-glass-w'}" href="${esc(u)}" ${u.startsWith('http') ? 'target="_blank" rel="noopener"' : ''}>${esc(t)}${u.startsWith('http') ? IC.ext : ''}</a>`).join('')}</div></article>`;
  }
  function promoCarousel(keys) {
    return `<div class="carousel" data-carousel>${keys.map((k, i) => `<div class="slide ${i ? '' : 'on'}">${promoCard(k)}</div>`).join('')}
      <div class="dots">${keys.map((k, i) => `<button type="button" data-act="slide" data-v="${i}" aria-label="Slide ${i + 1}" aria-pressed="${!i}"></button>`).join('')}</div></div>`;
  }
  const housesCard = (house) => `<div class="card glass spot"><div class="card-h"><h2>Credo houses</h2>${house ? `<span class="tag solid">You’re in ${esc(house)}</span>` : ''}</div>
    <div class="crests" style="justify-content:space-between">${CR.life.houses.map((h) => `<div style="display:grid;justify-items:center;gap:6px;${house && h.name !== house ? 'opacity:.55' : ''}"><img src="${h.crest}" alt="House ${esc(h.name)} crest"><b style="font-size:.8rem">${esc(h.name)}</b></div>`).join('')}</div>
    <p class="faint" style="font-size:.76rem;margin-top:12px">${esc(CR.life.houseText)}</p></div>`;
  const societies = () => `<div class="card glass spot"><div class="card-h"><h2>School societies</h2><span class="sub">Credo School</span></div>
    <div class="mini-promos">${CR.life.schoolSocieties.map((s) => `<div class="mini"><img src="${s.img}" alt="" style="object-fit:contain;background:#fff"><div><b>${esc(s.name)}</b><span>Society</span></div></div>`).join('')}</div></div>`;
  const TICKER = () => [CR.network.tagline, 'Cambridge centres ' + CR.network.cambridge.map((c) => c.code).join(' & '), 'Four campuses · Block 7, Gulshan-e-Iqbal, Karachi', 'UAN ' + CR.network.uan, 'No-tuition policy · 90% monthly attendance', 'Houses: Cave · Congo · Cape', CR.network.session, 'Scholarships from 10% to 100% at Credo College', CR.network.hashtag];
  const ticker = () => { const t = TICKER(); return `<div class="ticker" aria-label="About Credo"><div class="tk">${[...t, ...t].map((x) => `<span>${esc(x)}</span>`).join('')}</div></div>`; };

  /* ============================================================
     SHARED BLOCKS
     ============================================================ */
  function emergencyBlock(sid, canAck) {
    const list = noticesFor(sid).filter((n) => n.level === 'emergency' && Date.now() - n.at < 2 * 864e5);
    return list.map((n) => {
      const acked = n.ack[session.id];
      return `<div class="alert" role="alert"><span class="ai">${IC.alert}</span><div><b>Emergency note · ${esc(n.title)}</b><p>${esc(n.body)}</p><small>${esc(n.by)} · ${ago(n.at)}</small></div>
        ${canAck ? (acked ? `<span class="tag ok">${IC.check}Acknowledged</span>` : `<button class="btn btn-danger btn-sm" data-act="ack" data-id="${n.id}">Acknowledge</button>`) : '<span></span>'}</div>`;
    }).join('');
  }
  function ttStrip(cls) {
    const np = nowPeriod();
    if (!np.dow) return `<div class="empty">${IC.cal}No classes today. Next school day: <b>${fmtLong(iso(nextSchoolDay(TODAY)))}</b>.</div>`;
    return `<div class="tt">${cls.week[np.dow].map((k, i) => {
      const p = db.PERIODS[i]; const brk = k === 'BREAK';
      const st = i === np.idx ? 'now' : np.doneBefore(i) ? 'done' : '';
      return `<div class="p ${st} ${brk ? 'brk' : ''}" style="--sj:${SJ[k]?.c || 'var(--ink-3)'}"><span class="tm">${p[0]}–${p[1]}</span><b>${brk ? 'Break' : esc(sjName(k))}</b><span>${brk ? 'Recess' : esc(subjTeacher(cls, k)?.name || '')}</span></div>`;
    }).join('')}</div>`;
  }
  function weekGrid(cls, mineSubject) {
    const np = nowPeriod();
    return `<div class="week"><table><thead><tr><th></th>${DAYS.map((d) => `<th class="${d === np.dow ? 'today' : ''}">${d.slice(0, 3)}${d === np.dow ? ' · today' : ''}</th>`).join('')}</tr></thead><tbody>
      ${db.PERIODS.map((p, i) => `<tr><td class="tm">${p[0]}<br>${p[1]}</td>${DAYS.map((d) => { const k = cls.week[d][i]; if (k === 'BREAK') return '<td class="brk">Break</td>'; const cl = [d === np.dow ? 'today' : '', d === np.dow && i === np.idx ? 'now' : '', mineSubject === k ? 'mine' : ''].join(' '); return `<td class="${cl}" style="--sj:${SJ[k].c}"><span class="bar"></span>${esc(sjName(k))}</td>`; }).join('')}</tr>`).join('')}
    </tbody></table></div>`;
  }
  function dayStrip(selected, cls) {
    const list = []; for (let i = -9; i <= 4; i++) list.push(iso(addDays(TODAY, i)));
    return `<div class="days" role="group" aria-label="Choose a day">${list.map((d) => { const dd = parse(d); const has = db.diary.some((e) => e.classId === cls.id && e.date === d); return `<button type="button" data-act="day" data-d="${d}" aria-pressed="${d === selected}" class="${has ? 'has' : ''} ${isSchoolDay(dd) ? '' : 'off'}">${DOW[dd.getDay()]}<b>${dd.getDate()}</b>${d === todayISO ? 'Today' : dd.toLocaleDateString('en-GB', { month: 'short' })}</button>`; }).join('')}</div>`;
  }
  const isUrdu = (t) => /[؀-ۿ]/.test(t);
  function diaryRows(entries, opts = {}) {
    if (!entries.length) return `<div class="empty">${IC.diary}Nothing in the diary for this day.</div>`;
    const roster = (cid) => db.students.filter((s) => s.classId === cid).length;
    return `<div class="rows"><div class="rh"><span>Subject</span><span>Entry</span><span style="text-align:right">Status</span></div>${entries.map((e) => {
      const seen = db.diarySeen[e.id] || {}; const nSeen = Object.keys(seen).length;
      let right = `<span class="tag ${e.type === 'reminder' ? 'info' : 'warn'}">${e.type === 'homework' ? 'Due ' + fmt(e.due) : cap(e.type)}</span>`;
      if (opts.sign) right = seen[session.id] ? `<span class="tag ok">${IC.check}Signed</span>` : `<button class="btn btn-solid btn-sm" data-act="sign" data-id="${e.id}">${IC.sign}Sign</button>`;
      if (opts.teacher) right = `<span class="tag ${nSeen ? 'ok' : ''}">${IC.eye}${nSeen}/${roster(e.classId)} signed</span>${e.teacherId === session.id ? `<button class="icon-btn" style="width:32px;height:32px" data-act="del-diary" data-id="${e.id}" aria-label="Delete entry">${IC.trash}</button>` : ''}`;
      return `<div class="r">${sjTag(e.subject)}<div><div class="t ${isUrdu(e.text) ? 'urdu' : ''}">${esc(e.text)}</div><div class="m"><span>${e.type === 'reminder' ? 'Reminder' : e.type === 'classwork' ? 'Classwork' : 'Homework'}</span><span>${esc(teacher(e.teacherId)?.name || '')}</span></div></div><div class="act">${right}</div></div>`;
    }).join('')}</div>`;
  }
  function attCal(sid, sticker) {
    const a = db.attendance[sid] || {};
    const first = new Date(TODAY.getFullYear(), TODAY.getMonth() - calMonth, 1);
    const last = new Date(first.getFullYear(), first.getMonth() + 1, 0);
    const lead = (first.getDay() + 6) % 7;
    const cells = Array(lead).fill('<span></span>');
    for (let d = 1; d <= last.getDate(); d++) {
      const dt = new Date(first.getFullYear(), first.getMonth(), d); const k = iso(dt); const v = a[k];
      cells.push(`<span class="d ${v || ''} ${isSchoolDay(dt) ? '' : 'off'} ${k === todayISO ? 'today' : ''}" title="${fmt(k)}${v ? ' · ' + ({ P: 'Present', A: 'Absent', L: 'Late', V: 'On leave' })[v] : ''}">${sticker && v === 'P' ? '★' : d}</span>`);
    }
    return `<div class="card-h"><h2>${first.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</h2><div class="seg"><button data-act="cal" data-v="1" aria-label="Previous month">‹</button><button data-act="cal" data-v="-1" aria-label="Next month" ${calMonth === 0 ? 'disabled' : ''}>›</button></div></div>
      <div class="cal ${sticker ? 'sticker-cal' : ''}">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((x) => `<span class="dh">${x}</span>`).join('')}${cells.join('')}</div>
      <div class="legend"><span><i style="background:var(--ok)"></i>${sticker ? 'Star day (present)' : 'Present'}</span><span><i style="background:var(--bad)"></i>Absent</span><span><i style="background:var(--warn)"></i>Late</span><span><i style="background:var(--info)"></i>Leave</span></div>`;
  }
  function noticeRows(list) {
    if (!list.length) return `<div class="empty">${IC.bell}No notices.</div>`;
    return `<div class="rows" style="--cols:auto minmax(0,1fr) auto">${list.map((n) => `<div class="r"><span class="tag ${n.level === 'emergency' ? 'bad' : n.level === 'event' ? 'ok' : 'info'}">${cap(n.level)}</span><div><div class="t">${esc(n.title)}</div><div class="d">${esc(n.body)}</div><div class="m"><span>${esc(n.by)}</span><span>${ago(n.at)}</span><span>${n.scope === 'all' ? 'Whole network' : n.scope.startsWith('class:') ? 'Class ' + n.scope.slice(6) : 'Campus'}</span></div></div><div class="act">${session.role === 'parent' ? (n.ack[session.id] ? `<span class="tag ok">${IC.check}Seen</span>` : `<button class="btn btn-ghost btn-sm" data-act="ack" data-id="${n.id}">Mark seen</button>`) : ''}</div></div>`).join('')}</div>`;
  }
  function leavesCard(sid, canApply) {
    const lv = db.leaves.filter((l) => l.studentId === sid).sort((a, b) => b.at - a.at);
    return `<div class="card glass spot"><div class="card-h"><h2>Leave applications</h2>${canApply ? `<button class="btn btn-solid btn-sm" data-act="leave-new" data-sid="${sid}">${IC.plus}Apply</button>` : ''}</div>
      ${lv.length ? `<div class="rows" style="--cols:minmax(0,1fr) auto">${lv.map((l) => `<div class="r"><div><div class="t">${fmt(l.from)}${l.to !== l.from ? ' – ' + fmt(l.to) : ''}</div><div class="d">${esc(l.reason)}</div><div class="m"><span>Applied ${ago(l.at)}</span></div></div><div class="act"><span class="tag ${l.status === 'approved' ? 'ok' : l.status === 'declined' ? 'bad' : 'warn'}">${cap(l.status)}</span></div></div>`).join('')}</div>` : '<div class="empty">No leave applications.</div>'}
      <p class="faint" style="font-size:.74rem;margin-top:10px">Credo’s no-tuition policy asks for at least 90% attendance every month.</p></div>`;
  }
  function chatPanel(msgs, title, to, thread) {
    return `<div class="card glass"><div class="card-h"><h2>${esc(title)}</h2><span class="live"><i></i>Live</span></div><div class="chat"><div class="chat-log" id="chat-log">${msgs.length ? msgs.map((m) => `<div class="bubble ${m.from === session.id ? 'me' : ''}">${esc(m.text)}<small>${ago(m.at)}</small></div>`).join('') : '<div class="empty">Start the conversation.</div>'}</div>
      <form data-form="msg" data-to="${to}" data-thread="${thread}"><input class="input" name="text" placeholder="Write a message…" autocomplete="off" aria-label="Message"><button class="btn btn-solid" type="submit">Send</button></form></div></div>`;
  }

  /* ============================================================
     SENIOR VIEWS
     ============================================================ */
  let selDay = todayISO, calMonth = 0, noteFilter = 'all', noteQ = '', revealed = false;
  const S = {};
  function idCard(s, cls) {
    const id = s.id;
    return `<div class="idcard" data-tilt>
      <img class="lionmark" src="assets/img/brand/lion-gold-lg.webp" alt="">
      <div class="row"><img src="assets/img/brand/lion-gold.webp" alt="" width="28" style="width:28px"><div class="t"><small>Credo · ${esc(CFG.sessionLabel || '')}</small>Student card ready</div><span class="nfc">${IC.nfc}</span></div>
      <span class="chip"></span>
      <div class="num"><span>${revealed ? esc(id) : '••••• ' + esc(id.slice(-4))}</span><button type="button" class="reveal" data-act="reveal">${revealed ? 'Hide details' : 'Reveal details'}</button></div>
      <div class="meta"><div><span>Student</span><b>${esc(s.name)}</b></div><div><span>Class</span><b>${esc(cls.id)}</b></div>${revealed ? `<div><span>Roll</span><b>${pad(s.roll)}</b></div><div><span>House</span><b>${esc(s.house)}</b></div>` : ''}</div>
    </div>`;
  }
  S.today = (sid) => {
    const s = student(sid), cls = klass(s.classId), parent = session.role === 'parent';
    const today = db.diary.filter((e) => e.classId === cls.id && e.date === todayISO);
    const pend = pendingFor(sid), at = attStats(sid), rs = resultSummary(sid);
    const notices = noticesFor(sid).filter((n) => n.level !== 'emergency').slice(0, 3);
    const uns = parent ? unsignedFor(sid).length : 0;
    const last = rs.byAs[rs.byAs.length - 1], prev = rs.byAs[rs.byAs.length - 2];
    const delta = last && prev ? last.pct - prev.pct : 0;
    return `${emergencyBlock(sid, parent)}
    <div class="grid">
      <div class="glass card hello spot s-5"><img class="lion" src="assets/img/brand/lion-gold-lg.webp" alt="">
        <div><span class="date">${fmtLong(todayISO)}</span><h2 style="margin-top:10px">${parent ? `${esc(firstName(s.name))}’s <em>day</em> at Credo.` : `${greet()},<br><em>${esc(firstName(s.name))}.</em>`}</h2></div>
        <div class="chips"><span class="tag solid">${esc(cls.name)}</span><span class="tag">${esc(cls.campusName)}</span><span class="tag">House ${esc(s.house)}</span>${parent ? `<span class="tag ${uns ? 'warn' : 'ok'}">${uns ? uns + ' to sign' : 'Diary signed'}</span>` : ''}</div></div>
      <div class="s-4">${idCard(s, cls)}</div>
      <div class="glass card spot s-3"><div class="card-h"><h2>Attendance</h2><span class="sub">6 weeks</span></div>${slims(weeklyAttendance(sid))}</div>
    </div>
    <div class="grid">
      <div class="glass card spot s-5"><div class="card-h"><h2>At a glance</h2><span class="sub">${esc(CFG.sessionLabel || '')}</span></div>
        <div class="lenses"><div class="lens"><div><b data-count="${at.pct}" data-suf="%">${at.pct}%</b><span>Attendance</span></div></div><div class="lens hot"><div><b data-count="${rs.overall}" data-suf="%">${rs.overall}%</b><span>Average · ${grade(rs.overall)}</span></div></div><div class="lens"><div><b data-count="${pend.length}">${pend.length}</b><span>Due soon</span></div></div></div>
        <div style="margin-top:6px">${lineChart(rs.byAs, 130)}</div>
        <p class="faint" style="font-size:.74rem;text-align:center;margin-top:6px">${at.pct >= 90 ? 'On track for Credo’s 90% monthly attendance policy.' : 'Below Credo’s 90% monthly attendance requirement.'}${delta ? ` Latest test ${delta > 0 ? 'up' : 'down'} ${Math.abs(delta)} point${Math.abs(delta) === 1 ? '' : 's'}.` : ''}</p></div>
      <div class="glass card spot s-7"><div class="card-h"><h2>Today’s timetable</h2><a class="link" href="#/timetable">Full week ${IC.arrow}</a></div>${ttStrip(cls)}
        <div class="card-h" style="margin:16px 0 8px"><h2>Due soon</h2><a class="link" href="#/assignments">All ${IC.arrow}</a></div>
        ${pend.length ? `<div class="rows" style="--cols:minmax(110px,.9fr) minmax(0,2fr) auto">${pend.slice(0, 3).map((a) => `<div class="r">${sjTag(a.subject)}<div class="t">${esc(a.title)}</div><div class="act"><span class="tag ${a.due <= iso(nextSchoolDay(TODAY)) ? 'warn' : ''}">${a.due === todayISO ? 'Today' : a.due === iso(nextSchoolDay(TODAY)) ? 'Next day' : fmt(a.due)}</span></div></div>`).join('')}</div>` : `<div class="empty">${IC.task}All caught up.</div>`}</div>
    </div>
    <div class="grid">
      <div class="glass card spot s-8"><div class="card-h"><h2>Today’s diary <span class="count">${today.length}</span></h2>${parent && uns ? `<button class="btn btn-solid btn-sm" data-act="sign-all" data-sid="${sid}">${IC.sign}Sign all ${uns}</button>` : `<a class="link" href="#/diary">Open diary ${IC.arrow}</a>`}</div>${diaryRows(today, { sign: parent })}</div>
      <div class="s-4">${promoCarousel(parent ? ['admissions', 'college', 'girls'] : ['college', 'mun', 'support'])}</div>
    </div>
    <div class="grid">
      <div class="glass card spot s-8"><div class="card-h"><h2>Notices</h2><a class="link" href="#/notices">All notices ${IC.arrow}</a></div>${noticeRows(notices)}</div>
      <div class="s-4">${housesCard(s.house)}</div>
    </div>`;
  };
  S.diary = (sid, opts = {}) => {
    const s = student(sid), cls = klass(s.classId);
    const entries = db.diary.filter((e) => e.classId === cls.id && e.date === selDay).sort((a, b) => a.at - b.at);
    const uns = opts.sign ? unsignedFor(sid).length : 0;
    return `<div class="glass card"><div class="card-h"><div><h2>${fmtLong(selDay)}</h2><div class="sub">${esc(cls.name)}</div></div>${opts.sign ? (uns ? `<span class="tag warn">${uns} unsigned</span><button class="btn btn-solid btn-sm" data-act="sign-all" data-sid="${sid}">${IC.sign}Sign all</button>` : '<span class="tag ok">All signed</span>') : ''}</div>${dayStrip(selDay, cls)}<div style="margin-top:14px">${diaryRows(entries, opts)}</div></div>`;
  };
  S.timetable = (sid) => { const cls = klass(student(sid).classId); return `<div class="glass card"><div class="card-h"><h2>Today</h2><span class="sub">${esc(cls.room)}</span></div>${ttStrip(cls)}</div><div class="glass card"><div class="card-h"><h2>The week</h2><span class="sub">${esc(cls.name)}</span></div>${weekGrid(cls)}</div>`; };
  S.assignments = (sid, opts = {}) => {
    const s = student(sid);
    const list = db.assignments.filter((a) => a.classId === s.classId).sort((a, b) => b.due.localeCompare(a.due));
    return `<div class="glass card"><div class="card-h"><h2>Assignments</h2><span class="tag warn">${pendingFor(sid).length} pending</span></div><div class="rows">${list.map((a) => {
      const sub = db.submissions[a.id + ':' + sid]; const over = !sub && a.due < todayISO;
      const status = sub ? (sub.marks != null ? `<span class="tag ok">${sub.marks}/${a.max}</span>` : `<span class="tag ok">${sub.status === 'late' ? 'Submitted late' : 'Submitted'}</span>`) : over ? '<span class="tag bad">Missing</span>' : '<span class="tag warn">Pending</span>';
      const act = !opts.readOnly && !sub ? `<button class="btn btn-solid btn-sm" data-act="submit" data-id="${a.id}">${IC.check}Mark submitted</button>` : '';
      return `<div class="r">${sjTag(a.subject)}<div><div class="t">${esc(a.title)}</div><div class="d">${esc(a.details)}</div><div class="m"><span>${esc(teacher(a.teacherId)?.name || '')}</span><span>Due ${fmt(a.due, { weekday: 'short', day: 'numeric', month: 'short' })}</span><span>Out of ${a.max}</span>${sub?.note ? `<span>Note: “${esc(sub.note)}”</span>` : ''}</div></div><div class="act">${status}${act}</div></div>`;
    }).join('')}</div></div>`;
  };
  function notesList(sid) {
    const s = student(sid);
    let list = db.notes.filter((n) => n.classId === s.classId).sort((a, b) => b.at - a.at);
    if (noteFilter !== 'all') list = list.filter((n) => n.subject === noteFilter);
    if (noteQ) list = list.filter((n) => (n.title + n.body).toLowerCase().includes(noteQ.toLowerCase()));
    return list;
  }
  S.notes = (sid) => {
    const cls = klass(student(sid).classId); const list = notesList(sid);
    return `<div class="glass card"><div class="card-h"><h2>Notes & resources</h2><input class="input" style="max-width:260px;min-height:38px" type="search" placeholder="Search notes…" value="${esc(noteQ)}" data-act="noteq" aria-label="Search notes"></div>
      <div class="seg" style="margin-bottom:14px"><button data-act="notef" data-v="all" aria-pressed="${noteFilter === 'all'}">All</button>${subjectsOf(cls).map((k) => `<button data-act="notef" data-v="${k}" aria-pressed="${noteFilter === k}">${esc(sjName(k))}</button>`).join('')}</div>
      ${list.length ? `<div class="res-grid">${list.map((n) => `<article class="res">${sjTag(n.subject)}<b>${esc(n.title)}</b><p>${esc(n.body)}</p><div class="m"><span class="tag">${esc(n.kind)}</span><span>${esc(teacher(n.teacherId)?.name || '')}</span><span>${ago(n.at)}</span>${n.url ? `<a class="link" href="${esc(n.url)}" target="_blank" rel="noopener">Open ${IC.ext}</a>` : ''}</div></article>`).join('')}</div>` : `<div class="empty">${IC.book}No notes match.</div>`}</div>`;
  };
  S.results = (sid) => {
    const r = resultSummary(sid);
    const as = db.assessments.filter((a) => a.published).sort((a, b) => b.date.localeCompare(a.date));
    const remark = db.remarks[sid];
    return `<div class="grid">
      <div class="card ink s-4" style="display:grid;gap:14px;align-content:space-between"><div class="card-h" style="margin:0"><h2>Overall average</h2><span class="tag" style="background:rgba(255,255,255,.14);color:inherit">${grade(r.overall)}</span></div>
        <div class="kpi"><span class="v" style="font-size:3.2rem" data-count="${r.overall}" data-suf="%">${r.overall}%</span><span class="muted" style="font-size:.78rem">Across ${r.subAvg.length} subjects</span></div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">${r.subAvg.slice(0, 3).map((x) => `<div style="padding:10px;border-radius:12px;background:rgba(255,255,255,.08)"><b style="font-size:1.1rem">${x.pct}%</b><div class="muted" style="font-size:.66rem">${esc(sjName(x.k))}</div></div>`).join('')}</div></div>
      <div class="glass card spot s-8"><div class="card-h"><h2>Progress over time</h2><span class="sub">Overall % per assessment</span></div>${lineChart(r.byAs)}</div>
    </div>
    <div class="glass card spot"><div class="card-h"><h2>Subject averages</h2></div>${barChart(r.subAvg)}</div>
    ${remark ? `<div class="alert calm"><span class="ai">${IC.chat}</span><div><b>Class teacher’s remark</b><p>${esc(remark)}</p></div><span></span></div>` : ''}
    ${as.map((a) => { const rows = r.rs.filter((x) => x.assessment === a.id); if (!rows.length) return ''; const tot = rows.reduce((s, x) => s + x.marks, 0), mx = rows.reduce((s, x) => s + x.max, 0); return `<div class="glass card"><div class="card-h"><div><h2>${esc(a.name)}</h2><div class="sub">${fmt(a.date, { day: 'numeric', month: 'long', year: 'numeric' })}</div></div><span class="tag ok">${tot}/${mx} · ${Math.round((tot / mx) * 100)}%</span></div><div class="tblw"><table class="tbl"><thead><tr><th>Subject</th><th>Marks</th><th>%</th><th>Grade</th></tr></thead><tbody>${rows.map((x) => { const p = Math.round((x.marks / x.max) * 100); return `<tr><td>${sjTag(x.subject)}</td><td class="mono">${x.marks} / ${x.max}</td><td><div style="width:120px">${meter(p, p < 60)}</div></td><td class="grade">${grade(p)}</td></tr>`; }).join('')}</tbody></table></div></div>`; }).join('')}`;
  };
  S.attendance = (sid, opts = {}) => {
    const at = attStats(sid);
    return `<div class="grid keep">
      <div class="glass card spot s-3">${ring(at.pct, 'present', at.pct >= 90 ? 'var(--ok)' : 'var(--bad)')}</div>
      <div class="glass card spot s-3 kpi"><span class="l">Present</span><span class="v" data-count="${at.p}">${at.p}</span><span class="faint" style="font-size:.74rem">of ${at.total} school days</span></div>
      <div class="glass card spot s-3 kpi"><span class="l">Late</span><span class="v" data-count="${at.l}">${at.l}</span><span class="faint" style="font-size:.74rem">counted as present</span></div>
      <div class="card ink s-3 kpi"><span class="l muted">Absent</span><span class="v" data-count="${at.a}">${at.a}</span><span class="muted" style="font-size:.74rem">${at.v} on approved leave</span></div>
    </div>
    <div class="grid"><div class="glass card s-7">${attCal(sid)}</div><div class="s-5">${leavesCard(sid, opts.canApply)}</div></div>`;
  };
  S.notices = (sid) => `<div class="glass card"><div class="card-h"><h2>Notices & emergency notes</h2></div>${noticeRows(noticesFor(sid))}</div>`;
  function messagesView() {
    const p = parentMe(); const s = student(childId); const ct = teacher(klass(s.classId).classTeacher);
    const thread = `${p.id}:${ct.id}`;
    const msgs = db.messages.filter((m) => m.thread === thread).sort((a, b) => a.at - b.at);
    return `<div class="grid"><div class="s-8">${chatPanel(msgs, `Class teacher · ${ct.name}`, ct.id, thread)}</div><div class="s-4 stack">${promoCard(skin() === 'junior' ? 'preschool' : 'school')}</div></div>`;
  }

  /* ============================================================
     JUNIOR VIEWS — sticky notes, folders, stars
     ============================================================ */
  const J = {};
  function stickyNotes(entries, sid, opts = {}) {
    if (!entries.length) return `<div class="empty">${IC.smile}No notes for this day — enjoy!</div>`;
    return `<div class="notes">${entries.map((e, i) => {
      const color = SJ[e.subject]?.note || 'yellow';
      const signed = (db.diarySeen[e.id] || {})[session.id];
      const done = db.done[e.id + ':' + sid];
      let btn = '';
      if (opts.sign) btn = signed ? `<span class="nbtn done">${IC.check}Signed</span>` : `<button class="nbtn" data-act="sign" data-id="${e.id}">${IC.sign}Sign</button>`;
      else if (opts.student && e.type === 'homework') btn = done ? `<span class="nbtn done">${IC.check}Done!</span>` : `<button class="nbtn" data-act="done" data-id="${e.id}">${IC.check}I did it!</button>`;
      return `<article class="note ${color}" style="--i:${i}"><span class="pin"></span><div class="nt">${esc(sjName(e.subject))}</div><div class="nb ${isUrdu(e.text) ? 'urdu' : ''}">${esc(e.text)}</div>${btn}<div class="tags"><span>#${e.type === 'reminder' ? 'Reminder' : 'Homework'}</span>${e.type === 'homework' ? `<span>Due ${fmt(e.due)}</span>` : ''}</div><div class="nd">${esc(teacher(e.teacherId)?.name || '')}</div></article>`;
    }).join('')}</div>`;
  }
  function subjectFolders(cls, clickable = true) {
    return `<div class="folders">${subjectsOf(cls).map((k) => {
      const n = db.notes.filter((x) => x.classId === cls.id && x.subject === k).length;
      const d = db.diary.filter((x) => x.classId === cls.id && x.subject === k && x.date >= iso(prevSchoolDay(TODAY, 5))).length;
      return `<${clickable ? 'button type="button" data-act="folder" data-v="' + k + '"' : 'div'} class="folder" style="--fc:${jcol(k)};--fb:color-mix(in srgb, ${jcol(k)} 70%, #000)"><span class="paper"></span><span class="fi">${GLYPH[k] || GLYPH.ENG}</span><b>${esc(sjName(k))}</b><span>${n} ${n === 1 ? 'sheet' : 'sheets'} · ${d} diary</span></${clickable ? 'button' : 'div'}>`;
    }).join('')}</div>`;
  }
  J.today = (sid) => {
    const s = student(sid), cls = klass(s.classId), parent = session.role === 'parent';
    const today = db.diary.filter((e) => e.classId === cls.id && e.date === todayISO);
    const tomorrow = db.diary.filter((e) => e.classId === cls.id && e.date === iso(nextSchoolDay(TODAY)));
    const at = attStats(sid), rs = resultSummary(sid), pend = pendingFor(sid);
    const uns = parent ? unsignedFor(sid).length : 0;
    const say = parent ? `${uns ? uns + ' diary notes to sign' : 'All signed — thank you!'}` : `You have ${today.length} ${today.length === 1 ? 'note' : 'notes'} today!`;
    return `${emergencyBlock(sid, parent)}
    <div class="grid">
      <div class="glass card hello jr s-8"><img class="lion" src="assets/img/brand/lion-gold-lg.webp" alt=""><span class="bubble-say">${esc(say)}</span>
        <div><span class="date">${fmtLong(todayISO)}</span><h2 style="margin-top:10px;font-size:clamp(1.9rem,3.4vw,2.8rem)">${parent ? `${esc(firstName(s.name))}’s day` : `Assalam-o-Alaikum,<br><em>${esc(firstName(s.name))}!</em>`}</h2></div>
        <div class="chips"><span class="tag solid">${esc(cls.name)}</span><span class="tag">${esc(cls.room)}</span><span class="tag">House ${esc(s.house)}</span></div></div>
      <div class="glass card s-4" style="display:grid;gap:12px;align-content:center">
        <div style="display:flex;align-items:center;gap:14px"><div style="flex:1">${ring(at.pct, 'star days', '#ffc62a')}</div><div class="stack" style="gap:6px;flex:1"><div class="kpi"><span class="l">My stars</span><span class="v">${starsOf(rs.overall)}<small style="font-size:1rem">/5</small></span></div>${starRow(starsOf(rs.overall))}</div></div>
        <a class="btn btn-accent btn-block" href="#/results">${IC.star}See all my stars</a></div>
    </div>
    <div class="glass card"><div class="card-h"><h2>${IC.pin}Pinned for today</h2><span class="sub opt">${fmtLong(todayISO)}</span>${parent && uns ? `<button class="btn btn-accent btn-sm" data-act="sign-all" data-sid="${sid}">${IC.sign}Sign all ${uns}</button>` : `<a class="link" href="#/diary">My diary ${IC.arrow}</a>`}</div>${stickyNotes(today, sid, { sign: parent, student: !parent })}</div>
    <div class="grid">
      <div class="glass card s-8"><div class="card-h"><h2>My folders</h2><a class="link" href="#/notes">Open all ${IC.arrow}</a></div>${subjectFolders(cls)}</div>
      <div class="s-4 stack">
        <div class="glass card"><div class="card-h"><h2>Coming up</h2></div>
          ${pend.length ? `<div class="stack" style="gap:8px">${pend.slice(0, 2).map((a) => `<div class="star-row"><div><b>${esc(a.title)}</b><div class="faint" style="font-size:.74rem">${esc(sjName(a.subject))} · due ${fmt(a.due, { weekday: 'long' })}</div></div><span class="fi" style="width:26px;height:26px;color:${jcol(a.subject)}">${GLYPH[a.subject] || ''}</span><span></span></div>`).join('')}</div>` : `<div class="empty">${IC.smile}Nothing due!</div>`}
          ${tomorrow.length ? `<p class="faint" style="font-size:.78rem;margin-top:10px">Tomorrow: ${tomorrow.map((e) => esc(sjName(e.subject))).join(', ')}</p>` : ''}</div>
        ${promoCarousel(['splash', 'taekwondo', 'preschool'])}
      </div>
    </div>
    <div class="glass card"><div class="card-h"><h2>Today at school</h2><a class="link" href="#/timetable">The week ${IC.arrow}</a></div>${jrTimetable(cls)}</div>
    <div class="glass card"><div class="card-h"><h2>Credo clubs</h2><span class="sub">Credo Preschool & Primary</span></div>${clubs()}</div>`;
  };
  const CLUB_IC = [IC.search, GLYPH.ART, IC.book, IC.heart, GLYPH.SCI, IC.smile];
  const CLUB_G = ['linear-gradient(135deg,#2fc77a,#23a3b2)', 'linear-gradient(135deg,#ff8a6b,#ff5fa2)', 'linear-gradient(135deg,#6c79ff,#8a6bff)', 'linear-gradient(135deg,#ffbe3d,#ff7a1a)', 'linear-gradient(135deg,#55d36f,#1fa864)', 'linear-gradient(135deg,#ff6fae,#8a6bff)'];
  const clubs = () => `<div class="club-grid">${CR.life.preschoolClubs.map((c, i) => `<div class="club"><i style="--cg:${CLUB_G[i % 6]}">${CLUB_IC[i % 6]}</i><b>${esc(c.name)}</b><span>${esc(c.text)}</span></div>`).join('')}</div>`;
  function jrTimetable(cls) {
    const np = nowPeriod();
    if (!np.dow) return `<div class="empty">${IC.smile}No school today — see you on ${fmtLong(iso(nextSchoolDay(TODAY)))}!</div>`;
    return `<div class="jr-tt">${cls.week[np.dow].map((k, i) => {
      const p = db.PERIODS[i]; if (k === 'BREAK') return `<div class="p brk"><b>Break time</b><span>${p[0]}–${p[1]}</span></div>`;
      const st = i === np.idx ? 'now' : np.doneBefore(i) ? 'done' : '';
      return `<div class="p ${st}" style="--sj:${jcol(k)}"><span class="ji">${GLYPH[k] || ''}</span><b>${esc(sjName(k))}</b><span>${p[0]}–${p[1]}</span></div>`;
    }).join('')}</div>`;
  }
  J.diary = (sid, opts = {}) => {
    const s = student(sid), cls = klass(s.classId);
    const entries = db.diary.filter((e) => e.classId === cls.id && e.date === selDay).sort((a, b) => a.at - b.at);
    const uns = opts.sign ? unsignedFor(sid).length : 0;
    return `<div class="glass card"><div class="card-h"><h2>${fmtLong(selDay)}</h2>${opts.sign ? (uns ? `<button class="btn btn-accent btn-sm" data-act="sign-all" data-sid="${sid}">${IC.sign}Sign all ${uns}</button>` : '<span class="tag ok">All signed</span>') : ''}</div>${dayStrip(selDay, cls)}<div style="margin-top:18px">${stickyNotes(entries, sid, { sign: opts.sign, student: !opts.sign })}</div></div>`;
  };
  J.timetable = (sid) => { const cls = klass(student(sid).classId); return `<div class="glass card"><div class="card-h"><h2>Today</h2><span class="sub">${esc(cls.room)}</span></div>${jrTimetable(cls)}</div><div class="glass card"><div class="card-h"><h2>My week</h2></div>${weekGrid(cls)}</div>`; };
  J.homework = (sid, opts = {}) => {
    const s = student(sid);
    const list = db.assignments.filter((a) => a.classId === s.classId).sort((a, b) => a.due.localeCompare(b.due));
    return `<div class="glass card"><div class="card-h"><h2>My projects</h2><span class="tag warn">${pendingFor(sid).length} to do</span></div>
      ${list.length ? `<div class="notes">${list.map((a, i) => { const sub = db.submissions[a.id + ':' + sid]; const c = SJ[a.subject]?.note || 'yellow';
        return `<article class="note ${c}" style="--i:${i}"><span class="pin"></span><div class="nt">${esc(a.title)}</div><div class="nb">${esc(a.details)}</div>${sub ? `<span class="nbtn done">${IC.check}${sub.marks != null ? sub.marks + '/' + a.max : 'Handed in'}</span>` : opts.readOnly ? '' : `<button class="nbtn" data-act="submit" data-id="${a.id}">${IC.check}I handed it in</button>`}<div class="tags"><span>#${esc(sjName(a.subject))}</span><span>Due ${fmt(a.due)}</span></div></article>`; }).join('')}</div>` : `<div class="empty">${IC.smile}No projects right now.</div>`}</div>`;
  };
  J.notes = (sid) => {
    const cls = klass(student(sid).classId); const list = notesList(sid);
    return `<div class="glass card"><div class="card-h"><h2>Folders</h2>${noteFilter !== 'all' ? `<button class="btn btn-ghost btn-sm" data-act="notef" data-v="all">Show all</button>` : ''}</div>${subjectFolders(cls)}</div>
    <div class="glass card"><div class="card-h"><h2>${noteFilter === 'all' ? 'All sheets' : esc(sjName(noteFilter)) + ' sheets'}</h2><span class="sub">${list.length}</span></div>
      ${list.length ? `<div class="notes">${list.map((n, i) => `<article class="note ${SJ[n.subject]?.note || 'yellow'}" style="--i:${i}"><div class="nt">${esc(n.title)}</div><div class="nb">${esc(n.body)}</div><div class="tags"><span>#${esc(sjName(n.subject))}</span><span>${esc(n.kind)}</span></div><div class="nd">${ago(n.at)}</div></article>`).join('')}</div>` : `<div class="empty">${IC.folder}This folder is empty.</div>`}</div>`;
  };
  function badgesFor(sid, rs) {
    const by = Object.fromEntries(rs.subAvg.map((x) => [x.k, x.pct]));
    const a = db.attendance[sid] || {}; const last5 = schoolDays(prevSchoolDay(TODAY, 5), prevSchoolDay(TODAY)).map((d) => a[d]);
    const missing = db.assignments.filter((x) => x.classId === student(sid).classId && x.due < todayISO && !db.submissions[x.id + ':' + sid]).length;
    return [
      { t: 'Super reader', d: 'English 80%+', on: (by.ENG || 0) >= 80, g: 'linear-gradient(135deg,#7cc0ff,#3f7cff)', i: IC.book },
      { t: 'Maths star', d: 'Maths 80%+', on: (by.MATH || 0) >= 80, g: 'linear-gradient(135deg,#ffb24a,#ff7c1c)', i: GLYPH.MATH },
      { t: 'Little scientist', d: 'Science 80%+', on: (by.SCI || 0) >= 80, g: 'linear-gradient(135deg,#8ff0b6,#2fc77a)', i: GLYPH.SCI },
      { t: 'Young artist', d: 'Art 80%+', on: (by.ART || 0) >= 80, g: 'linear-gradient(135deg,#ffb3d6,#ff6fae)', i: GLYPH.ART },
      { t: 'Perfect week', d: 'Present all last week', on: last5.length && last5.every((v) => v === 'P'), g: 'linear-gradient(135deg,#ffe979,#ffc62a)', i: IC.cal },
      { t: 'Homework hero', d: 'Nothing missing', on: !missing, g: 'linear-gradient(135deg,#c8b6ff,#8a6bff)', i: IC.trophy }
    ];
  }
  J.results = (sid) => {
    const rs = resultSummary(sid); const remark = db.remarks[sid];
    return `<div class="grid">
      <div class="glass card s-5" style="display:grid;gap:12px;align-content:center;justify-items:center;text-align:center"><span class="lbl">My stars this term</span><div style="transform:scale(1.6);margin:14px 0">${starRow(starsOf(rs.overall))}</div><div class="kpi"><span class="v" data-count="${rs.overall}" data-suf="%">${rs.overall}%</span><span class="l">Average of my tests</span></div></div>
      <div class="glass card s-7"><div class="card-h"><h2>Stars by subject</h2></div><div class="star-rows">${rs.subAvg.map((x) => `<div class="star-row"><b>${esc(sjName(x.k))}</b>${starRow(starsOf(x.pct))}<span class="faint mono" style="font-size:.74rem">${x.pct}%</span></div>`).join('')}</div></div>
    </div>
    <div class="glass card"><div class="card-h"><h2>My badges</h2><span class="sub">Earned from my marks, attendance and homework</span></div><div class="badges">${badgesFor(sid, rs).map((b) => `<div class="badge ${b.on ? '' : 'locked'}"><span class="med" style="--mg:${b.g}">${b.i}</span><b>${b.t}</b><span>${b.on ? 'Earned!' : b.d}</span></div>`).join('')}</div></div>
    ${remark ? `<div class="alert calm"><span class="ai">${IC.heart}</span><div><b>From my class teacher</b><p>${esc(remark)}</p></div><span></span></div>` : ''}
    ${session.role === 'parent' ? `<div class="glass card"><div class="card-h"><h2>Progress over time</h2><span class="sub">For parents · overall % per test</span></div>${lineChart(rs.byAs)}</div>` : ''}`;
  };
  J.attendance = (sid, opts = {}) => {
    const at = attStats(sid);
    return `<div class="grid"><div class="glass card s-4" style="display:grid;gap:12px;justify-items:center;text-align:center">${ring(at.pct, 'star days', '#ffc62a')}<p class="muted" style="font-size:.86rem">${at.p} star days · ${at.l} late · ${at.a} away</p></div>
      <div class="glass card s-8">${attCal(sid, true)}</div></div>
      ${opts.canApply ? leavesCard(sid, true) : ''}`;
  };
  J.notices = (sid) => `<div class="glass card"><div class="card-h"><h2>Notices</h2></div>${noticeRows(noticesFor(sid))}</div>`;

  /* ============================================================
     TEACHER VIEWS (senior design)
     ============================================================ */
  const myClass = () => klass(teacher(session.id).classTeacherOf);
  let openAssign = null, rollDraft = null, marksDraft = null, openThread = null;
  const T = {};
  T.dash = () => {
    const t = teacher(session.id), cls = myClass();
    const roster = db.students.filter((s) => s.classId === cls.id);
    const taken = roster.every((s) => db.attendance[s.id]?.[todayISO]);
    const cnt = { P: 0, L: 0, A: 0, V: 0 }; roster.forEach((s) => { const v = db.attendance[s.id]?.[todayISO]; if (v) cnt[v]++; });
    const td = db.diary.filter((e) => e.classId === cls.id && e.date === todayISO);
    const pendingLeaves = db.leaves.filter((l) => l.status === 'pending' && student(l.studentId).classId === cls.id);
    const threads = [...new Set(db.messages.filter((m) => m.to === session.id || m.from === session.id).map((m) => m.thread))];
    const week = schoolDays(prevSchoolDay(TODAY, 5), prevSchoolDay(TODAY)).map((d) => { const es = db.diary.filter((e) => e.classId === cls.id && e.date === d); const avg = es.length ? es.reduce((s, e) => s + Object.keys(db.diarySeen[e.id] || {}).length, 0) / es.length : 0; const parents = new Set(roster.flatMap((s) => parentOf(s.id).map((p) => p.id))).size || 1; return { label: DOW[parse(d).getDay()], pct: Math.round((avg / parents) * 100) }; });
    const avgClass = Math.round(roster.reduce((s, st) => s + resultSummary(st.id).overall, 0) / (roster.length || 1));
    return `<div class="grid">
      <div class="glass card hello spot s-5"><img class="lion" src="assets/img/brand/lion-gold-lg.webp" alt=""><div><span class="date">Teacher desk · ${fmtLong(todayISO)}</span><h2 style="margin-top:10px">Welcome,<br><em>${esc(t.name)}.</em></h2></div>
        <div class="chips"><span class="tag solid">Class teacher · ${esc(cls.id)}</span><span class="tag">${esc(SJ[t.subject].name)}</span><span class="tag">${esc(cls.campusName)}</span></div></div>
      <div class="card ink s-4" style="display:grid;gap:14px"><div class="card-h" style="margin:0"><h2>Overall information</h2><a class="link" style="color:inherit" href="#/attendance">${IC.arrow}</a></div>
        <div style="display:flex;gap:26px;align-items:flex-end"><div class="kpi"><span class="v" data-count="${roster.length}">${roster.length}</span><span class="muted" style="font-size:.7rem">Students<br>in ${esc(cls.id)}</span></div><div class="kpi"><span class="v" data-count="${avgClass}" data-suf="%">${avgClass}%</span><span class="muted" style="font-size:.7rem">Class<br>average</span></div></div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">${[['P', 'Present'], ['L', 'Late'], ['A', 'Absent']].map(([k, l]) => `<div style="padding:10px;border-radius:12px;background:rgba(255,255,255,.08);text-align:center"><b style="font-size:1.25rem">${taken ? cnt[k] : '—'}</b><div class="muted" style="font-size:.64rem">${l}</div></div>`).join('')}</div>
        ${taken ? '' : `<a class="btn btn-white btn-sm" href="#/attendance">${IC.roll}Take roll call</a>`}</div>
      <div class="glass card spot s-3"><div class="card-h"><h2>Diary sign-offs</h2><span class="sub">last 5 days</span></div>${slims(week)}</div>
    </div>
    <div class="grid keep">
      <div class="glass card spot s-4 kpi"><span class="l">Leave requests</span><span class="v" style="color:${pendingLeaves.length ? 'var(--bad)' : 'inherit'}">${pendingLeaves.length}</span>${pendingLeaves.length ? `<a class="link" href="#/attendance">Review now ${IC.arrow}</a>` : '<span class="faint" style="font-size:.74rem">None pending</span>'}</div>
      <div class="glass card spot s-4 kpi"><span class="l">Today’s diary entries</span><span class="v">${td.length}</span><a class="link" href="#/diary">Open diary ${IC.arrow}</a></div>
      <div class="glass card spot s-4 kpi"><span class="l">Parent conversations</span><span class="v">${threads.length}</span><a class="link" href="#/messages">Open messages ${IC.arrow}</a></div>
    </div>
    <div class="grid">
      <div class="glass card s-7"><div class="card-h"><h2>Post to today’s diary</h2><span class="live"><i></i>Parents see it instantly</span></div>${diaryForm(cls)}</div>
      <div class="glass card s-5"><div class="card-h"><h2>Today in ${esc(cls.id)}</h2></div>${diaryRows(td, { teacher: true })}</div>
    </div>
    <div class="grid"><div class="glass card s-8"><div class="card-h"><h2>Class timetable</h2><span class="sub">Your ${esc(SJ[t.subject].name)} periods are highlighted</span></div>${weekGrid(cls, t.subject)}</div><div class="s-4">${promoCarousel(['workshops', 'support', 'admissions'])}</div></div>`;
  };
  function diaryForm(cls) {
    const t = teacher(session.id);
    return `<form data-form="diary" class="form-grid">
      <div class="field"><label for="df-sub">Subject</label><select class="input" id="df-sub" name="subject">${subjectsOf(cls).map((k) => `<option value="${k}" ${k === t.subject ? 'selected' : ''}>${SJ[k].name}</option>`).join('')}</select></div>
      <div class="field"><label for="df-type">Type</label><select class="input" id="df-type" name="type"><option value="homework">Homework</option><option value="classwork">Classwork</option><option value="reminder">Reminder</option></select></div>
      <div class="field full"><label for="df-text">Entry</label><textarea class="input" id="df-text" name="text" rows="2" placeholder="e.g. Exercise 8.1, questions 1–10" required></textarea><span class="err"></span></div>
      <div class="field"><label for="df-date">Diary date</label><input class="input" id="df-date" type="date" name="date" value="${todayISO}"></div>
      <div class="field"><label for="df-due">Due</label><input class="input" id="df-due" type="date" name="due" value="${iso(nextSchoolDay(TODAY))}"></div>
      <div class="full"><button class="btn btn-solid" type="submit">${IC.plus}Post to ${esc(cls.id)} diary</button></div>
    </form>`;
  }
  T.diary = () => {
    const cls = myClass();
    const entries = db.diary.filter((e) => e.classId === cls.id && e.date === selDay).sort((a, b) => a.at - b.at);
    return `<div class="grid"><div class="glass card s-5"><div class="card-h"><h2>New diary entry</h2></div>${diaryForm(cls)}</div>
      <div class="glass card s-7"><div class="card-h"><div><h2>${esc(cls.name)}</h2><div class="sub">${fmtLong(selDay)}</div></div></div>${dayStrip(selDay, cls)}<div style="margin-top:14px">${diaryRows(entries, { teacher: true })}</div></div></div>`;
  };
  T.assign = () => {
    const cls = myClass(); const t = teacher(session.id);
    const roster = db.students.filter((s) => s.classId === cls.id);
    const list = db.assignments.filter((a) => a.classId === cls.id).sort((a, b) => b.due.localeCompare(a.due));
    const a = list.find((x) => x.id === openAssign);
    return `<div class="grid">
      <div class="glass card s-5"><div class="card-h"><h2>Set an assignment</h2></div>
        <form data-form="assign" class="form-grid">
          <div class="field full"><label for="af-t">Title</label><input class="input" id="af-t" name="title" required placeholder="e.g. Quadratic equations, set 2"><span class="err"></span></div>
          <div class="field"><label for="af-s">Subject</label><select class="input" id="af-s" name="subject">${subjectsOf(cls).map((k) => `<option value="${k}" ${k === t.subject ? 'selected' : ''}>${SJ[k].name}</option>`).join('')}</select></div>
          <div class="field"><label for="af-m">Out of</label><input class="input" id="af-m" name="max" type="number" min="1" value="20"></div>
          <div class="field full"><label for="af-d">Instructions</label><textarea class="input" id="af-d" name="details" rows="3"></textarea></div>
          <div class="field"><label for="af-due">Due date</label><input class="input" id="af-due" name="due" type="date" value="${iso(nextSchoolDay(TODAY, 3))}"></div>
          <div class="field" style="align-content:end"><button class="btn btn-solid" type="submit">${IC.plus}Publish</button></div>
        </form></div>
      <div class="glass card s-7"><div class="card-h"><h2>Assignments · ${esc(cls.id)}</h2></div><div class="rows">${list.map((x) => { const subs = roster.filter((s) => db.submissions[x.id + ':' + s.id]).length; return `<div class="r">${sjTag(x.subject)}<div><div class="t">${esc(x.title)}</div><div class="m"><span>Due ${fmt(x.due)}</span><span>${subs}/${roster.length} submitted</span></div><div style="margin-top:6px;max-width:220px">${meter(Math.round((subs / roster.length) * 100))}</div></div><div class="act"><button class="btn ${openAssign === x.id ? 'btn-solid' : 'btn-ghost'} btn-sm" data-act="open-assign" data-id="${x.id}">${openAssign === x.id ? 'Close' : 'Review'}</button></div></div>`; }).join('')}</div></div>
    </div>
    ${a ? `<div class="glass card"><div class="card-h"><div><h2>${esc(a.title)}</h2><div class="sub">Enter marks out of ${a.max} and save — students and parents see them immediately.</div></div><button class="btn btn-solid btn-sm" data-act="save-assign-marks" data-id="${a.id}">${IC.check}Save marks</button></div><div class="tblw"><table class="tbl"><thead><tr><th>Roll</th><th>Student</th><th>Status</th><th>Marks</th></tr></thead><tbody>${roster.map((s) => { const sub = db.submissions[a.id + ':' + s.id]; return `<tr><td class="mono">${pad(s.roll)}</td><td><b>${esc(s.name)}</b></td><td>${sub ? `<span class="tag ok">${cap(sub.status)}</span>` : a.due < todayISO ? '<span class="tag bad">Missing</span>' : '<span class="tag">Not yet</span>'}</td><td><input class="input marks-input" type="number" min="0" max="${a.max}" data-am="${s.id}" value="${sub?.marks ?? ''}" aria-label="Marks for ${esc(s.name)}"></td></tr>`; }).join('')}</tbody></table></div></div>` : ''}`;
  };
  T.attendance = () => {
    const cls = myClass(); const roster = db.students.filter((s) => s.classId === cls.id);
    if (!rollDraft) { rollDraft = {}; roster.forEach((s) => { rollDraft[s.id] = db.attendance[s.id]?.[todayISO] || 'P'; }); }
    const leaves = db.leaves.filter((l) => student(l.studentId).classId === cls.id).sort((a, b) => b.at - a.at);
    const saved = roster.every((s) => db.attendance[s.id]?.[todayISO]);
    const c = { P: 0, A: 0, L: 0, V: 0 }; Object.values(rollDraft).forEach((v) => { c[v] = (c[v] || 0) + 1; });
    return `<div class="grid">
      <div class="glass card s-7"><div class="card-h"><div><h2>Roll call · ${esc(cls.name)}</h2><div class="sub">${fmtLong(todayISO)} · ${saved ? 'Saved — edit and save again to correct' : 'Not saved yet'}</div></div><div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center"><span class="tag ok">${c.P} P</span><span class="tag warn">${c.L} L</span><span class="tag bad">${c.A} A</span><button class="btn btn-solid btn-sm" data-act="save-roll" ${isSchoolDay(TODAY) ? '' : 'disabled'}>${IC.check}Save</button></div></div>
        ${isSchoolDay(TODAY) ? `<div class="roll">${roster.map((s) => `<div class="roll-row">${avatar(s.name, 'sm')}<div><b style="font-size:.9rem">${esc(s.name)}</b><div class="faint" style="font-size:.7rem">Roll ${pad(s.roll)} · ${esc(s.house)}</div></div><div class="seg" role="group" aria-label="Attendance for ${esc(s.name)}">${['P', 'L', 'A'].map((v) => `<button type="button" data-act="roll" data-sid="${s.id}" data-v="${v}" aria-pressed="${rollDraft[s.id] === v}">${{ P: 'Present', L: 'Late', A: 'Absent' }[v]}</button>`).join('')}${rollDraft[s.id] === 'V' ? '<span class="tag info">Leave</span>' : ''}</div></div>`).join('')}</div>` : '<div class="empty">No school today.</div>'}</div>
      <div class="glass card s-5"><div class="card-h"><h2>Leave requests</h2></div>${leaves.length ? `<div class="rows" style="--cols:auto minmax(0,1fr) auto">${leaves.map((l) => `<div class="r">${avatar(student(l.studentId).name, 'sm')}<div><div class="t">${esc(student(l.studentId).name)}</div><div class="d">${esc(l.reason)}</div><div class="m"><span>${fmt(l.from)}${l.to !== l.from ? ' – ' + fmt(l.to) : ''}</span><span>${ago(l.at)}</span></div></div><div class="act">${l.status === 'pending' ? `<button class="btn btn-ghost btn-sm" data-act="leave" data-id="${l.id}" data-v="declined">Decline</button><button class="btn btn-solid btn-sm" data-act="leave" data-id="${l.id}" data-v="approved">Approve</button>` : `<span class="tag ${l.status === 'approved' ? 'ok' : 'bad'}">${cap(l.status)}</span>`}</div></div>`).join('')}</div>` : '<div class="empty">No requests.</div>'}</div>
    </div>`;
  };
  T.marks = () => {
    const cls = myClass(); const t = teacher(session.id); const roster = db.students.filter((s) => s.classId === cls.id);
    const mine = [...db.assessments].sort((a, b) => b.date.localeCompare(a.date));
    return `<div class="glass card"><div class="card-h"><div><h2>Enter marks</h2><div class="sub">Publishing adds the marks to every student’s results and their parents’ progress charts.</div></div></div>
      <form data-form="marks"><div class="form-grid" style="grid-template-columns:repeat(auto-fit,minmax(160px,1fr))">
        <div class="field"><label for="mk-n">Assessment</label><input class="input" id="mk-n" name="name" value="${esc(marksDraft?.name || 'November class test')}" required></div>
        <div class="field"><label for="mk-s">Subject</label><select class="input" id="mk-s" name="subject">${subjectsOf(cls).map((k) => `<option value="${k}" ${k === (marksDraft?.subject || t.subject) ? 'selected' : ''}>${SJ[k].name}</option>`).join('')}</select></div>
        <div class="field"><label for="mk-m">Out of</label><input class="input" id="mk-m" name="max" type="number" min="1" value="${marksDraft?.max || 25}"></div>
        <div class="field"><label for="mk-d">Date</label><input class="input" id="mk-d" name="date" type="date" value="${todayISO}"></div>
      </div>
      <div class="tblw" style="margin-top:12px"><table class="tbl"><thead><tr><th>Roll</th><th>Student</th><th>Marks</th></tr></thead><tbody>${roster.map((s) => `<tr><td class="mono">${pad(s.roll)}</td><td><b>${esc(s.name)}</b></td><td><input class="input marks-input" type="number" min="0" name="m:${s.id}" aria-label="Marks for ${esc(s.name)}"></td></tr>`).join('')}</tbody></table></div>
      <button class="btn btn-solid" type="submit" style="margin-top:12px">${IC.check}Publish marks</button></form></div>
      <div class="glass card"><div class="card-h"><h2>Published assessments</h2></div><div class="rows" style="--cols:auto minmax(0,1fr)">${mine.map((a) => `<div class="r"><span class="tag solid">/${a.max}</span><div><div class="t">${esc(a.name)}</div><div class="m"><span>${fmt(a.date, { day: 'numeric', month: 'long' })}</span><span>${new Set(db.results.filter((r) => r.assessment === a.id && student(r.studentId)?.classId === cls.id).map((r) => r.subject)).size} subjects</span></div></div></div>`).join('')}</div></div>`;
  };
  T.notes = () => {
    const cls = myClass(); const t = teacher(session.id);
    return `<div class="grid"><div class="glass card s-5"><div class="card-h"><h2>Share notes</h2></div>
      <form data-form="note" class="form-grid">
        <div class="field full"><label for="nf-t">Title</label><input class="input" id="nf-t" name="title" required><span class="err"></span></div>
        <div class="field"><label for="nf-s">Subject</label><select class="input" id="nf-s" name="subject">${subjectsOf(cls).map((k) => `<option value="${k}" ${k === t.subject ? 'selected' : ''}>${SJ[k].name}</option>`).join('')}</select></div>
        <div class="field"><label for="nf-k">Type</label><select class="input" id="nf-k" name="kind"><option>Notes</option><option>Worksheet</option><option>Past paper</option><option>Video</option></select></div>
        <div class="field full"><label for="nf-b">Description</label><textarea class="input" id="nf-b" name="body" rows="3"></textarea></div>
        <div class="field full"><label for="nf-u">Link (Drive, YouTube, PDF)</label><input class="input" id="nf-u" name="url" type="url" placeholder="https://"></div>
        <div class="full"><button class="btn btn-solid" type="submit">${IC.plus}Share with ${esc(cls.id)}</button></div>
      </form></div>
      <div class="s-7">${S.notes(db.students.find((s) => s.classId === cls.id).id)}</div></div>`;
  };
  T.notices = () => {
    const cls = myClass();
    const list = db.notices.filter((n) => n.scope === 'all' || n.scope === 'class:' + cls.id || n.scope === 'campus:' + cls.campus).sort((a, b) => b.at - a.at);
    const pc = new Set(db.students.filter((s) => s.classId === cls.id).flatMap((s) => parentOf(s.id).map((p) => p.id))).size;
    return `<div class="grid"><div class="glass card s-5"><div class="card-h"><h2>Post a notice</h2></div>
      <form data-form="notice" class="form-grid">
        <div class="field full"><span class="lbl">Level</span><div class="seg" role="radiogroup"><label><input type="radio" name="level" value="notice" checked> Notice</label><label><input type="radio" name="level" value="event"> Event</label><label><input type="radio" name="level" value="emergency"> Emergency</label></div></div>
        <div class="field full"><label for="nt-a">Audience</label><select class="input" id="nt-a" name="scope"><option value="class:${cls.id}">${esc(cls.name)} only</option><option value="campus:${cls.campus}">Whole campus · ${esc(cls.campusName)}</option></select></div>
        <div class="field full"><label for="nt-t">Title</label><input class="input" id="nt-t" name="title" required><span class="err"></span></div>
        <div class="field full"><label for="nt-b">Message</label><textarea class="input" id="nt-b" name="body" rows="3" required></textarea><span class="err"></span></div>
        <div class="full"><button class="btn btn-danger" type="submit">${IC.bell}Send notice</button></div>
      </form><p class="faint" style="font-size:.74rem;margin-top:10px">Emergency notes ring on every student and parent screen and ask parents to acknowledge.</p></div>
      <div class="glass card s-7"><div class="card-h"><h2>Recent notices</h2></div><div class="rows" style="--cols:auto minmax(0,1fr) auto">${list.map((n) => `<div class="r"><span class="tag ${n.level === 'emergency' ? 'bad' : n.level === 'event' ? 'ok' : 'info'}">${cap(n.level)}</span><div><div class="t">${esc(n.title)}</div><div class="d">${esc(n.body)}</div><div class="m"><span>${esc(n.by)}</span><span>${ago(n.at)}</span></div></div><div class="act"><span class="tag">${Object.keys(n.ack).length}/${pc} seen</span></div></div>`).join('')}</div></div></div>`;
  };
  T.messages = () => {
    const cls = myClass();
    const parents = [...new Set(db.students.filter((s) => s.classId === cls.id).flatMap((s) => parentOf(s.id)))];
    const threads = parents.map((p) => { const th = `${p.id}:${session.id}`; const msgs = db.messages.filter((m) => m.thread === th); return { p, th, msgs, last: [...msgs].sort((a, b) => b.at - a.at)[0] }; });
    openThread = openThread || threads[0]?.th;
    const cur = threads.find((t) => t.th === openThread);
    const kidNames = (p) => p.children.map(student).filter((s) => s.classId === cls.id).map((s) => firstName(s.name)).join(', ');
    return `<div class="grid"><div class="glass card s-4"><div class="card-h"><h2>Parents</h2></div><div class="stack" style="gap:6px">${threads.length ? threads.map((t) => `<button class="roll-row" style="text-align:left;width:100%;${t.th === openThread ? 'background:var(--glass-2)' : ''}" data-act="thread" data-id="${t.th}">${avatar(t.p.name, 'sm')}<div><b style="font-size:.86rem">${esc(t.p.name)}</b><div class="faint" style="font-size:.7rem">Parent of ${esc(kidNames(t.p))}</div><div class="muted" style="font-size:.76rem">${t.last ? esc(t.last.text.slice(0, 54)) + (t.last.text.length > 54 ? '…' : '') : 'No messages yet'}</div></div></button>`).join('') : '<div class="empty">No parents linked yet.</div>'}</div></div>
      <div class="s-8">${cur ? chatPanel([...cur.msgs].sort((a, b) => a.at - b.at), cur.p.name, cur.p.id, cur.th) : ''}</div></div>`;
  };

  /* ---------- role & design configuration ---------- */
  function routes() {
    const jr = skin() === 'junior';
    if (session.role === 'student') {
      const sid = session.id, V = jr ? J : S;
      return [
        { id: 'today', label: jr ? 'My day' : 'Overview', icon: jr ? 'home' : 'grid', h: jr ? 'My day' : 'Overview', v: () => V.today(sid) },
        { id: 'diary', label: 'Diary', icon: 'diary', h: jr ? 'My diary' : 'Daily diary', v: () => V.diary(sid) },
        { id: 'timetable', label: 'Timetable', icon: 'clock', h: 'Timetable', v: () => V.timetable(sid) },
        { id: 'assignments', label: jr ? 'Projects' : 'Assignments', icon: 'task', h: jr ? 'My projects' : 'Assignments', v: () => (jr ? J.homework : S.assignments)(sid), badge: () => pendingFor(sid).length },
        { id: 'notes', label: jr ? 'Folders' : 'Notes', icon: jr ? 'folder' : 'book', h: jr ? 'My folders' : 'Notes & resources', v: () => V.notes(sid) },
        { id: 'results', label: jr ? 'My stars' : 'Results', icon: jr ? 'star' : 'chart', h: jr ? 'My stars' : 'Results', v: () => V.results(sid) },
        { id: 'attendance', label: 'Attendance', icon: 'cal', h: 'Attendance', v: () => V.attendance(sid) },
        { id: 'notices', label: 'Notices', icon: 'bell', h: 'Notices', v: () => V.notices(sid), badge: () => noticesFor(sid).filter((n) => Date.now() - n.at < 864e5).length }
      ];
    }
    if (session.role === 'parent') {
      const V = jr ? J : S;
      return [
        { id: 'today', label: 'Overview', icon: jr ? 'home' : 'grid', h: 'Overview', v: () => V.today(childId) },
        { id: 'diary', label: 'Diary', icon: 'diary', h: 'Diary & sign-off', v: () => V.diary(childId, { sign: true }), badge: () => unsignedFor(childId).length },
        { id: 'results', label: jr ? 'Stars & progress' : 'Progress', icon: jr ? 'star' : 'chart', h: jr ? 'Stars & progress' : 'Progress', v: () => V.results(childId) },
        { id: 'attendance', label: 'Attendance', icon: 'cal', h: 'Attendance & leave', v: () => V.attendance(childId, { canApply: true }) },
        { id: 'assignments', label: 'Homework', icon: 'task', h: 'Homework', v: () => (jr ? J.homework : S.assignments)(childId, { readOnly: true }) },
        { id: 'timetable', label: 'Timetable', icon: 'clock', h: 'Timetable', v: () => V.timetable(childId) },
        { id: 'notices', label: 'Notices', icon: 'bell', h: 'Notices', v: () => V.notices(childId), badge: () => noticesFor(childId).filter((n) => !n.ack[session.id] && Date.now() - n.at < 3 * 864e5).length },
        { id: 'messages', label: 'Messages', icon: 'chat', h: 'Messages', v: () => messagesView() }
      ];
    }
    return [
      { id: 'today', label: 'Dashboard', icon: 'grid', h: 'Dashboard', v: () => T.dash() },
      { id: 'diary', label: 'Diary', icon: 'diary', h: 'Class diary', v: () => T.diary() },
      { id: 'attendance', label: 'Attendance', icon: 'roll', h: 'Attendance', v: () => T.attendance(), badge: () => db.leaves.filter((l) => l.status === 'pending' && student(l.studentId).classId === myClass().id).length },
      { id: 'assignments', label: 'Assignments', icon: 'task', h: 'Assignments', v: () => T.assign() },
      { id: 'marks', label: 'Marks', icon: 'grade', h: 'Marks', v: () => T.marks() },
      { id: 'notes', label: 'Notes', icon: 'book', h: 'Notes', v: () => T.notes() },
      { id: 'notices', label: 'Notices', icon: 'bell', h: 'Notices', v: () => T.notices() },
      { id: 'messages', label: 'Messages', icon: 'chat', h: 'Messages', v: () => T.messages() }
    ];
  }
  function who() {
    if (session.role === 'teacher') { const t = teacher(session.id); return { name: t.name, sub: `${SJ[t.subject].name} · ${t.classTeacherOf}` }; }
    if (session.role === 'parent') { const p = parentMe(); return { name: p.name, sub: `Parent · ${p.children.length} children` }; }
    const s = student(session.id); return { name: s.name, sub: klass(s.classId).name };
  }

  /* ============================================================
     SHELL
     ============================================================ */
  const root = $('#root');
  let lastKey = '', booted = false;
  function looksSwitcher() {
    const sk = skin();
    return `<div class="looks" role="group" aria-label="Look">${LOOKS[sk].map(([id, name]) => `<button type="button" data-act="look" data-v="${id}" aria-pressed="${html.dataset.theme === id}" title="${name}" aria-label="${name} look"><i class="sw-${id}"></i></button>`).join('')}</div>`;
  }
  function sidePromo() {
    const sk = skin();
    if (session.role === 'teacher') return { img: CR.ph('college-asp'), k: 'Academic Support Program', b: 'Alumni mentors on tricky topics', u: camp('college').site };
    if (sk === 'junior') return { img: CR.ph('preschool-art-studio'), k: 'Credo Preschool & Primary', b: 'Art studio, library & sensory play', u: camp('preschool').site };
    if (session.role === 'parent') return { img: CR.ph('college-graduates'), k: CR.network.session, b: 'Apply online on Skoolify', u: CR.network.skoolify };
    return { img: CR.ph('college-gowns'), k: 'After O Levels', b: 'Credo College · AS & A2', u: camp('college').site };
  }
  function render() {
    if (!session || !['student', 'parent', 'teacher'].includes(session.role)) { renderLogin(); return; }
    const acct = session.role === 'teacher' ? teacher(session.id) : session.role === 'parent' ? parentMe() : student(session.id);
    if (!acct) { session = null; localStorage.removeItem(SKEY); renderLogin(); return; }
    if (session.role === 'parent' && (!childId || !parentMe().children.includes(childId))) childId = parentMe().children[0];
    const sk = skin();
    if (html.dataset.skin !== sk) applyLook(sk);
    const views = routes();
    const route = (location.hash.match(/^#\/(\w+)/) || [])[1] || 'today';
    const cur = views.find((v) => v.id === route) || views[0];
    const w = who();
    const kids = session.role === 'parent' ? parentMe().children.map(student) : [];
    const fsid = focusSid();
    const bell = fsid ? noticesFor(fsid).filter((n) => Date.now() - n.at < 864e5).length : 0;
    const key = [session.role, session.id, cur.id, childId, sk].join('|');
    const enter = key !== lastKey; lastKey = key;
    const sp = sidePromo();
    const cls = fsid ? klass(student(fsid).classId) : myClass();
    doc.title = `${cur.label} · Credo Portal`;
    const keepScroll = enter ? 0 : scrollY;
    root.innerHTML = `<div class="frame ${booted ? '' : 'boot'}" id="app">
      <span class="prism-line"></span>
      <aside class="side" aria-label="Portal menu">
        <a class="brand" href="#/today"><img src="assets/img/brand/${html.dataset.theme === 'prism' || html.dataset.theme === 'night' ? 'lion-gold' : 'lion-navy'}.webp" alt=""><span><b>CREDO</b><small>${session.role === 'teacher' ? 'Staff portal' : sk === 'junior' ? 'Junior portal' : 'Student portal'}</small></span></a>
        <div class="me glass">${avatar(w.name)}<div style="min-width:0"><b>${esc(w.name)}</b><span>${esc(w.sub)}</span></div></div>
        <div><div class="nav-h">${sk === 'junior' ? 'Navigation' : 'Menu'}</div><nav class="nav">${views.map((v) => { const b = v.badge ? v.badge() : 0; return `<a href="#/${v.id}" ${v.id === cur.id ? 'aria-current="page"' : ''}>${IC[v.icon]}<span>${v.label}</span>${b ? `<span class="count">${b}</span>` : ''}</a>`; }).join('')}</nav></div>
        ${sk === 'junior' && cls ? `<div><div class="nav-h">Folders</div><div class="folders-nav">${subjectsOf(cls).slice(0, 5).map((k) => `<a href="#/notes" data-act="folder" data-v="${k}" style="--fc:${jcol(k)}"><i></i>${esc(sjName(k))}<small>${db.notes.filter((n) => n.classId === cls.id && n.subject === k).length}</small></a>`).join('')}</div></div>` : ''}
        <a class="side-promo" href="${esc(sp.u)}" target="_blank" rel="noopener"><img src="${sp.img}" alt="" loading="lazy"><small>${esc(sp.k)}</small><b>${esc(sp.b)}</b><span>Visit ${esc(sp.u.replace(/^https?:\/\//, '').split('/')[0])} ↗</span></a>
        ${CFG.mode === 'preview' ? `<p class="preview-note"><b>Preview mode.</b> Sample data saved in this browser. <button data-act="reset">Reset sample data</button></p>` : ''}
        <div class="side-foot"><button class="btn btn-ghost btn-sm" style="flex:1" data-act="logout">${IC.out}Sign out</button></div>
      </aside>
      <div class="scrim" data-act="menu"></div>
      <div class="main">
        <header class="topbar">
          <button class="icon-btn show-m" data-act="menu" aria-label="Open menu">${IC.menu}</button>
          <a class="tb-brand" href="#/today"><img src="assets/img/brand/${html.dataset.theme === 'prism' || html.dataset.theme === 'night' ? 'lion-gold' : 'lion-navy'}.webp" alt="">CREDO</a>
          <button class="search hide-m" type="button" data-act="palette">${IC.search}<span>Search diary, notes, pages…</span><kbd>⌘K</kbd></button>
          <div class="tb-right">
            ${kids.length > 1 ? `<div class="view-pick"><span class="vp-l">Viewing</span><div class="kids" role="group" aria-label="Choose child">${kids.map((k) => `<button data-act="child" data-id="${k.id}" aria-pressed="${k.id === childId}">${avatar(k.name, 'sm')}<span>${esc(firstName(k.name))} · ${esc(k.classId)}</span></button>`).join('')}</div></div>` : `<div class="view-pick hide-m"><span class="vp-l">Session</span><b>${esc((CFG.sessionLabel || '').replace('Session ', ''))}</b></div>`}
            ${looksSwitcher()}
            ${fsid ? `<a class="icon-btn" href="#/notices" aria-label="Notices">${IC.bell}${bell ? '<span class="pip"></span>' : ''}</a>` : ''}
          </div>
        </header>
        <div class="page-h"><div><p>${esc(cls ? cls.campusName : '')}</p><h1 class="display">${esc(cur.h)}</h1></div><div class="acts hide-m"><span class="live"><i></i>Live</span></div></div>
        <div class="view ${enter ? 'enter' : ''}" id="main">${cur.v()}</div>
        ${ticker()}
        <p class="nexlyr">Credo School & College Network · Designed & developed by <a href="https://nexlyr.solutions" target="_blank" rel="noopener">Nexlyr Solutions</a></p>
      </div>
      <nav class="tabbar glass strong" aria-label="Quick">${views.slice(0, 4).map((v) => `<a href="#/${v.id}" ${v.id === cur.id ? 'aria-current="page"' : ''}>${IC[v.icon]}${v.id === 'today' ? 'Today' : v.label.replace(/^My /, '').split(' ')[0].replace(/^./, (x) => x.toUpperCase())}</a>`).join('')}<a href="#" data-act="menu">${IC.menu}More</a></nav>
    </div>`;
    booted = true;
    if (keepScroll) scrollTo(0, keepScroll); else if (enter) scrollTo(0, 0);
    const log = $('#chat-log'); if (log) log.scrollTop = log.scrollHeight;
    after(enter);
  }
  /* post-render: stagger, count-ups, carousels */
  function after(enter) {
    const v = $('#main');
    if (v && enter) {
      [...v.children].forEach((el, i) => el.style.setProperty('--i', i));
      $$('.grid > *, .stack > *', v).forEach((el, i) => el.style.setProperty('--i', (i % 6) + 1));
      if (!reduce) $$('[data-count]', v).forEach((el) => {
        const end = +el.dataset.count, suf = el.dataset.suf || ''; const t0 = performance.now(), dur = 1100;
        const step = (t) => { const k = Math.min(1, (t - t0) / dur); el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))) + suf; if (k < 1) requestAnimationFrame(step); };
        requestAnimationFrame(step);
      });
      if (!reduce) $$('.ring .fg', v).forEach((c) => { const off = c.getAttribute('stroke-dashoffset'); c.style.strokeDashoffset = c.style.getPropertyValue('--c'); c.getBoundingClientRect(); requestAnimationFrame(() => { c.style.strokeDashoffset = off; }); });
      if (!reduce) $$('.meter i, .slims .tr i', v).forEach((b) => { const prop = b.closest('.slims') ? 'height' : 'width'; const val = b.style[prop]; b.style[prop] = '0'; b.getBoundingClientRect(); requestAnimationFrame(() => { b.style[prop] = val; }); });
    }
    startCarousels();
  }
  let carT;
  function startCarousels() {
    clearInterval(carT);
    if (reduce) return;
    carT = setInterval(() => $$('[data-carousel]').forEach((c) => { if (c.matches(':hover')) return; const s = $$('.slide', c); const i = s.findIndex((x) => x.classList.contains('on')); goSlide(c, (i + 1) % s.length); }), 6500);
  }
  function goSlide(c, i) { $$('.slide', c).forEach((s, k) => s.classList.toggle('on', k === i)); $$('.dots button', c).forEach((b, k) => b.setAttribute('aria-pressed', k === i)); }

  /* ============================================================
     LOGIN
     ============================================================ */
  let loginRole = 'student', rotT, bgT;
  const DEMO = [
    { role: 'student', id: 'CS-26-0917', name: 'Ayaan Siddiqui', label: 'Student · Grade 9', note: 'Senior glass design' },
    { role: 'student', id: 'CP-26-0311', name: 'Inaya Siddiqui', label: 'Student · Grade 3', note: 'Junior design' },
    { role: 'parent', id: 'P-1001', name: 'Sana Siddiqui', label: 'Parent · 2 children', note: 'Switch between both' },
    { role: 'teacher', id: 'T-301', name: 'Hira Qadri', label: 'Teacher · Class 9-A', note: 'Staff tools' }
  ];
  const WORDS = ['every child.', 'character.', 'leaders of tomorrow.', 'every school day.'];
  const LOGIN_BG = ['college-highfive', 'school-whiteboard', 'preschool-circle-time', 'college-gowns', 'preschool-assembly'];
  function renderLogin() {
    clearInterval(rotT); clearInterval(bgT); clearInterval(carT);
    lastKey = '';
    if (html.dataset.skin !== 'senior') applyLook('senior');
    doc.title = 'Sign in · Credo Portal';
    const fac = CR.faculty.filter((f) => f.img).filter((f, i, a) => a.findIndex((x) => x.name === f.name) === i).slice(0, 24);
    const ROLE_IC = { student: IC.user, parent: IC.users, teacher: IC.teach };
    root.innerHTML = `<div class="login">
      <section class="show" aria-label="About Credo">
        <div class="bgs">${LOGIN_BG.map((n, i) => `<img class="${i ? '' : 'on'}" src="${CR.ph(n)}" alt="" ${i ? 'loading="lazy"' : ''}>`).join('')}</div>
        <div class="top"><span class="brand"><img src="assets/img/brand/lion-gold.webp" alt=""><span><b>CREDO</b><small>School & College Network</small></span></span><span class="tag">${esc(CR.network.hashtag)}</span></div>
        <div class="copy">
          <span class="eyebrow">The Credo Portal · ${esc(CFG.sessionLabel || '')}</span>
          <h1>We believe in<span class="rot"><span>${WORDS[0]}</span></span></h1>
          <p class="lede">Diary, timetable, homework, results and attendance — one live portal for every Credo student, parent and teacher, from Pre-nursery to A2.</p>
          <div class="campus-row">${CR.campuses.map((c) => `<a class="camp" href="${c.site}" target="_blank" rel="noopener"><i>${esc(c.centre || c.grades)}</i><b>${esc(c.name)}</b><span>${esc(c.stage)}</span></a>`).join('')}</div>
          <div class="admit"><span class="prism-line"></span><div><b>${esc(CR.network.session)}</b><span>Four campuses in Block 7, Gulshan-e-Iqbal · UAN ${esc(CR.network.uan)}</span></div><a class="btn btn-white btn-sm" href="${CR.network.skoolify}" target="_blank" rel="noopener">Apply on Skoolify ${IC.ext}</a></div>
          <div class="faculty-strip" aria-label="Credo faculty"><div class="tk">${[...fac, ...fac].map((f) => `<figure><img src="${f.img}" alt="" loading="lazy"><figcaption><b>${esc(f.name)}</b><span>${esc(f.subject)}</span></figcaption></figure>`).join('')}</div></div>
        </div>
      </section>
      <main class="signin" id="main">
        <form class="signin-card glass strong" id="login" method="post" action="#" novalidate>
          <span class="prism-line"></span>
          <div class="head"><div><span class="k">Sign in to</span><h2>Credo Portal</h2></div><div style="margin-left:auto">${looksSwitcherLogin()}</div></div>
          <div class="roles" role="radiogroup" aria-label="I am a"><span class="thumb" style="transform:translateX(calc(${['student', 'parent', 'teacher'].indexOf(loginRole)} * (100% + 4px)))"></span>${['student', 'parent', 'teacher'].map((r) => `<button type="button" role="radio" aria-checked="${r === loginRole}" data-role="${r}">${ROLE_IC[r]}${r[0].toUpperCase() + r.slice(1)}</button>`).join('')}</div>
          <div class="field"><label for="lg-id">${loginRole === 'student' ? 'Student ID' : loginRole === 'parent' ? 'Parent ID' : 'Staff ID'}</label><input class="input" id="lg-id" name="username" autocomplete="username" placeholder="${loginRole === 'student' ? 'e.g. CS-26-0917' : loginRole === 'parent' ? 'e.g. P-1001' : 'e.g. T-301'}" required><span class="err"></span></div>
          <div class="field"><label for="lg-pw">Password</label><div class="pw"><input class="input" id="lg-pw" name="password" type="password" autocomplete="current-password" required><button type="button" data-peek aria-label="Show password">${IC.eye}</button></div><span class="err"></span></div>
          <button class="btn btn-solid btn-block" type="submit" style="min-height:48px;justify-content:space-between">Sign in ${IC.arrow}</button>
          ${CFG.mode === 'preview' ? `<div class="demo"><b>Preview — try a demo account</b><p>Sample data saved on this device only. Open a teacher and a parent in two tabs to watch posts sync live. Password for all: <span class="mono">credo123</span></p><div class="demo-list">${DEMO.map((d, i) => `<button type="button" data-demo="${i}">${avatar(d.name)}<span><b>${esc(d.label)}</b><span>${esc(d.note)}</span></span></button>`).join('')}</div></div>` : ''}
          <div class="foot"><span>Forgot your ID or password? Call your campus office.</span><a class="link" href="https://credo.edu.pk" target="_blank" rel="noopener">credo.edu.pk ${IC.ext}</a></div>
        </form>
      </main>
    </div>`;
    if (!reduce) {
      let wi = 0, bi = 0;
      rotT = setInterval(() => { wi = (wi + 1) % WORDS.length; const r = $('.rot'); if (r) r.innerHTML = `<span>${WORDS[wi]}</span>`; }, 3200);
      bgT = setInterval(() => { const imgs = $$('.show .bgs img'); if (!imgs.length) return; imgs[bi].classList.remove('on'); bi = (bi + 1) % imgs.length; imgs[bi].classList.add('on'); }, 5200);
    }
  }
  function looksSwitcherLogin() { return `<div class="looks" role="group" aria-label="Look">${LOOKS.senior.map(([id, name]) => `<button type="button" data-look="${id}" aria-pressed="${html.dataset.theme === id}" title="${name}" aria-label="${name} look"><i class="sw-${id}"></i></button>`).join('')}</div>`; }
  function doLogin(role, id, pw, origin) {
    const pool = role === 'student' ? db.students : role === 'parent' ? db.parents : db.teachers;
    const acct = pool.find((a) => a.id === id && a.pass);
    const idI = $('#lg-id'), pwI = $('#lg-pw');
    const idErr = idI.closest('.field').querySelector('.err'), pwErr = pwI.closest('.field').querySelector('.err');
    idErr.textContent = ''; pwErr.textContent = ''; idI.removeAttribute('aria-invalid'); pwI.removeAttribute('aria-invalid');
    const fail = (el, err, msg) => { err.textContent = msg; el.setAttribute('aria-invalid', 'true'); pulse('error'); const c = $('#login'); c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake'); };
    if (!id) return fail(idI, idErr, 'Enter your ID.');
    if (!acct) return fail(idI, idErr, `No ${role} account with that ID.`);
    if (acct.pass !== pw) return fail(pwI, pwErr, 'That password doesn’t match.');
    const btn = $('#login button[type="submit"]'); btn.classList.add('is-busy'); pulse('busy');
    setTimeout(() => {
      session = { role, id: acct.id }; localStorage.setItem(SKEY, JSON.stringify(session));
      childId = null; booted = false; history.replaceState(null, '', '#/today');
      pulse('ok');
      withReveal(() => render(), origin?.x, origin?.y);
    }, 650);
  }

  /* ---------- modal & palette ---------- */
  function modal(htmlStr, onSubmit) {
    const m = doc.createElement('div'); m.className = 'modal'; m.innerHTML = `<div class="modal-card glass strong" role="dialog" aria-modal="true">${htmlStr}</div>`;
    doc.body.appendChild(m); requestAnimationFrame(() => m.classList.add('open'));
    const close = () => { m.classList.remove('open'); setTimeout(() => m.remove(), 300); doc.removeEventListener('keydown', onKey); };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    doc.addEventListener('keydown', onKey);
    m.addEventListener('click', (e) => { if (e.target === m || e.target.closest('[data-close]')) close(); });
    m.querySelector('form')?.addEventListener('submit', (e) => { e.preventDefault(); if (onSubmit(new FormData(e.target)) !== false) close(); });
    setTimeout(() => m.querySelector('input,textarea,select')?.focus(), 60);
  }
  function palette() {
    if (!session || $('.palette')) return;
    const sid = focusSid(); const cls = sid ? klass(student(sid).classId) : myClass();
    const items = [
      ...routes().map((r) => ({ t: r.label, s: 'Page', href: '#/' + r.id, i: IC[r.icon] })),
      ...db.notes.filter((n) => n.classId === cls.id).map((n) => ({ t: n.title, s: sjName(n.subject) + ' · ' + n.kind, href: '#/notes', i: IC.book })),
      ...db.assignments.filter((a) => a.classId === cls.id).map((a) => ({ t: a.title, s: 'Due ' + fmt(a.due), href: '#/assignments', i: IC.task })),
      ...db.diary.filter((e) => e.classId === cls.id && e.date >= iso(prevSchoolDay(TODAY, 3))).map((e) => ({ t: e.text, s: sjName(e.subject) + ' · ' + fmt(e.date), href: '#/diary', d: e.date, i: IC.diary })),
      ...CR.campuses.map((c) => ({ t: c.name, s: 'Credo campus · ' + c.stage, href: c.site, ext: 1, i: IC.pin }))
    ];
    const p = doc.createElement('div'); p.className = 'palette';
    p.innerHTML = `<div class="pc glass strong" role="dialog" aria-label="Search"><input placeholder="Search pages, notes, homework, campuses…" aria-label="Search"><ul></ul></div>`;
    doc.body.appendChild(p);
    const inp = $('input', p), ul = $('ul', p); let sel = 0, list = [];
    const draw = () => { const q = inp.value.trim().toLowerCase(); list = items.filter((x) => !q || (x.t + ' ' + x.s).toLowerCase().includes(q)).slice(0, 12); sel = Math.min(sel, Math.max(0, list.length - 1)); ul.innerHTML = list.map((x, i) => `<li><a href="${esc(x.href)}" class="${i === sel ? 'on' : ''}" data-i="${i}" ${x.ext ? 'target="_blank" rel="noopener"' : ''}>${x.i}<span>${esc(x.t)}</span><small>${esc(x.s)}</small></a></li>`).join('') || '<li class="empty">Nothing found.</li>'; };
    const close = () => p.remove();
    const go = (x) => { if (!x) return; if (x.d) selDay = x.d; close(); if (x.ext) open(x.href, '_blank', 'noopener'); else location.hash = x.href; };
    inp.addEventListener('input', () => { sel = 0; draw(); });
    inp.addEventListener('keydown', (e) => { if (e.key === 'ArrowDown') { sel = Math.min(list.length - 1, sel + 1); draw(); e.preventDefault(); } if (e.key === 'ArrowUp') { sel = Math.max(0, sel - 1); draw(); e.preventDefault(); } if (e.key === 'Enter') { go(list[sel]); e.preventDefault(); } if (e.key === 'Escape') close(); });
    p.addEventListener('click', (e) => { const a = e.target.closest('a[data-i]'); if (a) { e.preventDefault(); go(list[+a.dataset.i]); } else if (e.target === p) close(); });
    draw(); inp.focus();
  }

  /* ============================================================
     EVENTS
     ============================================================ */
  doc.addEventListener('click', (e) => {
    /* login screen */
    const lk = e.target.closest('[data-look]');
    if (lk && !session) { withReveal(() => { applyLook('senior', lk.dataset.look); renderLogin(); }, e.clientX, e.clientY); return; }
    const rb = e.target.closest('[data-role]');
    if (rb && !session) { loginRole = rb.dataset.role; const keep = $('#lg-id')?.value; renderLogin(); $('#lg-id').value = keep || ''; $('#lg-id').focus(); return; }
    const dm = e.target.closest('[data-demo]');
    if (dm && !session) { const d = DEMO[+dm.dataset.demo]; loginRole = d.role; renderLogin(); $('#lg-id').value = d.id; $('#lg-pw').value = 'credo123'; doLogin(d.role, d.id, 'credo123', { x: e.clientX, y: e.clientY }); return; }
    if (e.target.closest('[data-peek]')) { const i = $('#lg-pw'); i.type = i.type === 'password' ? 'text' : 'password'; return; }

    const el = e.target.closest('[data-act]'); if (!el || !session) return;
    const a = el.dataset.act, id = el.dataset.id;
    if (a === 'menu') { e.preventDefault(); $('#app')?.classList.toggle('menu-open'); return; }
    if (a === 'palette') { palette(); return; }
    if (a === 'look') { const t = el.dataset.v; withReveal(() => { applyLook(skin(), t); render(); }, e.clientX, e.clientY); return; }
    if (a === 'slide') { goSlide(el.closest('[data-carousel]'), +el.dataset.v); return; }
    if (a === 'logout') { session = null; localStorage.removeItem(SKEY); rollDraft = null; openThread = null; revealed = false; history.replaceState(null, '', location.pathname); withReveal(() => renderLogin(), e.clientX, e.clientY); return; }
    if (a === 'reset') { if (confirm('Reset all sample portal data in this browser?')) { localStorage.removeItem(KEY); load(); commit('Sample data was reset'); rollDraft = null; render(); toast('Sample data reset.', 'ok'); } return; }
    if (a === 'child') { if (childId === id) return; childId = id; selDay = todayISO; noteFilter = 'all'; withReveal(() => render(), e.clientX, e.clientY); return; }
    if (a === 'reveal') { revealed = !revealed; render(); return; }
    if (a === 'day') { selDay = el.dataset.d; render(); return; }
    if (a === 'cal') { calMonth = Math.max(0, calMonth + +el.dataset.v); render(); return; }
    if (a === 'notef') { noteFilter = el.dataset.v; render(); return; }
    if (a === 'folder') { e.preventDefault(); noteFilter = el.dataset.v; $('#app')?.classList.remove('menu-open'); if (location.hash !== '#/notes') location.hash = '#/notes'; else { lastKey = ''; render(); } return; }
    if (a === 'sign') {
      db.diarySeen[id] = { ...(db.diarySeen[id] || {}), [session.id]: Date.now() }; const en = db.diary.find((x) => x.id === id);
      commit(`${who().name} signed the ${SJ[en.subject].name} diary`, 'teacher:' + klass(en.classId).classTeacher); pulse('ok'); if (skin() === 'junior') confetti(e.clientX); render(); return;
    }
    if (a === 'sign-all') {
      const cls = klass(student(el.dataset.sid).classId); let n = 0;
      db.diary.filter((x) => x.classId === cls.id && x.date <= todayISO).forEach((x) => { if (!(db.diarySeen[x.id] || {})[session.id]) { db.diarySeen[x.id] = { ...(db.diarySeen[x.id] || {}), [session.id]: Date.now() }; n++; } });
      commit(`${who().name} signed ${n} diary entries`, 'teacher:' + cls.classTeacher); toast(`Signed ${n} ${n === 1 ? 'entry' : 'entries'}.`, 'ok'); if (skin() === 'junior') confetti(e.clientX); render(); return;
    }
    if (a === 'done') { db.done[id + ':' + session.id] = Date.now(); commit(null); confetti(e.clientX); toast('Well done! ⭐', 'ok'); render(); return; }
    if (a === 'ack') { const n = db.notices.find((x) => x.id === id); n.ack[session.id] = Date.now(); commit(`${who().name} acknowledged “${n.title}”`, 'teacher'); pulse('ok'); render(); return; }
    if (a === 'submit') {
      const as = db.assignments.find((x) => x.id === id);
      modal(`<h2>${skin() === 'junior' ? 'Did you hand in' : 'Mark as submitted'} “${esc(as.title)}”?</h2><p class="muted" style="font-size:.88rem">Hand in the work the way your teacher asked. Add a note if you like.</p><form><div class="field" style="margin-top:12px"><label for="sn">Note to teacher (optional)</label><input class="input" id="sn" name="note" placeholder="e.g. Submitted in class"></div><div class="modal-actions"><button type="button" class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-solid" type="submit">${IC.check}Confirm</button></div></form>`, (fd) => {
        db.submissions[id + ':' + session.id] = { status: as.due < todayISO ? 'late' : 'submitted', at: Date.now(), note: fd.get('note') || '' };
        commit(`${who().name} submitted “${as.title}”`, 'teacher:' + as.teacherId); toast('Marked as submitted.', 'ok'); if (skin() === 'junior') confetti(); render();
      });
      return;
    }
    if (a === 'leave-new') {
      const sid = el.dataset.sid;
      modal(`<h2>Apply for leave · ${esc(student(sid).name)}</h2><form><div class="form-grid" style="margin-top:12px"><div class="field"><label for="lf">From</label><input class="input" id="lf" type="date" name="from" value="${iso(nextSchoolDay(TODAY))}" required></div><div class="field"><label for="lt">To</label><input class="input" id="lt" type="date" name="to" value="${iso(nextSchoolDay(TODAY))}" required></div><div class="field full"><label for="lr">Reason</label><textarea class="input" id="lr" name="reason" rows="3" required></textarea></div></div><div class="modal-actions"><button type="button" class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-solid" type="submit">Send to class teacher</button></div></form>`, (fd) => {
        if (!String(fd.get('reason')).trim()) { toast('Please add a reason.', 'err'); return false; }
        if (fd.get('to') < fd.get('from')) { toast('The end date is before the start date.', 'err'); return false; }
        db.leaves.push({ id: 'l' + Date.now(), studentId: sid, parentId: session.id, from: fd.get('from'), to: fd.get('to'), reason: fd.get('reason'), status: 'pending', at: Date.now() });
        commit(`Leave request for ${student(sid).name}`, 'teacher:' + klass(student(sid).classId).classTeacher); toast('Leave request sent to the class teacher.', 'ok'); render();
      });
      return;
    }
    if (a === 'leave') {
      const l = db.leaves.find((x) => x.id === id); l.status = el.dataset.v;
      if (l.status === 'approved') for (let d = parse(l.from); d <= parse(l.to); d = addDays(d, 1)) if (isSchoolDay(d)) { db.attendance[l.studentId][iso(d)] = 'V'; if (iso(d) === todayISO && rollDraft) rollDraft[l.studentId] = 'V'; }
      commit(`Leave for ${student(l.studentId).name} ${l.status}`, l.studentId + ' ' + l.parentId); pulse('ok'); render(); return;
    }
    if (a === 'roll') { rollDraft[el.dataset.sid] = el.dataset.v; render(); return; }
    if (a === 'save-roll') {
      const cls = myClass(); Object.entries(rollDraft).forEach(([sid, v]) => { db.attendance[sid] = db.attendance[sid] || {}; db.attendance[sid][todayISO] = v; });
      const ab = Object.values(rollDraft).filter((v) => v === 'A').length;
      commit(`Attendance for ${cls.name} saved`, 'class:' + cls.id); toast(`Attendance saved · ${ab} absent.`, 'ok'); render(); return;
    }
    if (a === 'open-assign') { openAssign = openAssign === id ? null : id; render(); return; }
    if (a === 'save-assign-marks') {
      const as = db.assignments.find((x) => x.id === id); let n = 0, bad = false;
      $$('[data-am]').forEach((inp) => { if (inp.value === '') return; const v = +inp.value; if (v < 0 || v > as.max) { inp.setAttribute('aria-invalid', 'true'); bad = true; return; } const k = id + ':' + inp.dataset.am; db.submissions[k] = { ...(db.submissions[k] || { status: 'submitted', at: Date.now(), note: '' }), marks: v }; n++; });
      if (bad) { toast(`Marks must be between 0 and ${as.max}.`, 'err'); return; }
      commit(`Marks for “${as.title}” are out`, 'class:' + as.classId); toast(`Saved marks for ${n} students.`, 'ok'); render(); return;
    }
    if (a === 'del-diary') {
      const en = db.diary.find((x) => x.id === id); const idx = db.diary.indexOf(en); db.diary.splice(idx, 1); commit(null); render();
      toast(`Entry removed. <button class="link" id="undo">Undo</button>`);
      setTimeout(() => $('#undo')?.addEventListener('click', () => { db.diary.splice(idx, 0, en); commit(`${SJ[en.subject].name} diary entry restored`, 'class:' + en.classId); render(); }), 0);
      return;
    }
    if (a === 'thread') { openThread = id; render(); return; }
  });
  doc.addEventListener('input', (e) => {
    if (e.target.matches('[data-act="noteq"]')) { noteQ = e.target.value; const pos = e.target.selectionStart; render(); const i = $('[data-act="noteq"]'); if (i) { i.focus(); i.setSelectionRange(pos, pos); } }
  });
  doc.addEventListener('submit', (e) => {
    if (e.target.matches('#login')) { e.preventDefault(); const sub = e.submitter?.getBoundingClientRect(); doLogin(loginRole, $('#lg-id').value.trim().toUpperCase(), $('#lg-pw').value, sub ? { x: sub.left + sub.width / 2, y: sub.top + sub.height / 2 } : null); return; }
    const f = e.target.closest('[data-form]'); if (!f || !session) return;
    e.preventDefault();
    const fd = new FormData(f); const kind = f.dataset.form;
    const need = (name) => { const el = f.querySelector(`[name="${name}"]`); const ok = !!String(fd.get(name) || '').trim(); el.setAttribute('aria-invalid', String(!ok)); const er = el.closest('.field')?.querySelector('.err'); if (er) er.textContent = ok ? '' : 'Required.'; return ok; };
    if (kind === 'diary') {
      if (!need('text')) { pulse('error'); return; }
      const cls = myClass();
      const en = { id: 'd-' + Date.now(), classId: cls.id, date: fd.get('date') || todayISO, subject: fd.get('subject'), teacherId: session.id, type: fd.get('type'), text: fd.get('text').trim(), due: fd.get('due') || iso(nextSchoolDay(TODAY)), at: Date.now() };
      db.diary.push(en); selDay = en.date;
      commit(`New ${SJ[en.subject].name} diary entry for ${cls.id}`, 'class:' + cls.id);
      toast('Posted to the diary — students and parents can see it now.', 'ok'); render();
    }
    if (kind === 'assign') {
      if (!need('title')) { pulse('error'); return; }
      const cls = myClass();
      const as = { id: 'a' + Date.now(), classId: cls.id, subject: fd.get('subject'), teacherId: session.id, title: fd.get('title').trim(), details: fd.get('details').trim() || '—', due: fd.get('due'), max: Math.max(1, +fd.get('max') || 20) };
      db.assignments.push(as); commit(`New assignment: ${as.title}`, 'class:' + cls.id); toast('Assignment published.', 'ok'); render();
    }
    if (kind === 'note') {
      if (!need('title')) { pulse('error'); return; }
      const cls = myClass(); const url = (fd.get('url') || '').trim();
      if (url && !/^https?:\/\//i.test(url)) { toast('Links must start with https://', 'err'); return; }
      db.notes.push({ id: 'n' + Date.now(), classId: cls.id, subject: fd.get('subject'), kind: fd.get('kind'), title: fd.get('title').trim(), body: fd.get('body').trim(), url, teacherId: session.id, at: Date.now() });
      commit(`New ${fd.get('kind').toLowerCase()}: ${fd.get('title').trim()}`, 'class:' + cls.id); toast('Shared with the class.', 'ok'); render();
    }
    if (kind === 'notice') {
      if (!need('title') | !need('body')) { pulse('error'); return; }
      const n = { id: 'x' + Date.now(), level: fd.get('level'), scope: fd.get('scope'), title: fd.get('title').trim(), body: fd.get('body').trim(), at: Date.now(), by: teacher(session.id).name, ack: {} };
      db.notices.push(n); commit(`${n.level === 'emergency' ? 'EMERGENCY · ' : ''}${n.title}`, n.scope); toast(n.level === 'emergency' ? 'Emergency note sent to every student and parent.' : 'Notice posted.', 'ok'); render();
    }
    if (kind === 'marks') {
      const cls = myClass(); const max = Math.max(1, +fd.get('max') || 25); const subject = fd.get('subject');
      const entries = [...fd.entries()].filter(([k, v]) => k.startsWith('m:') && v !== '');
      if (!entries.length) { toast('Enter at least one student’s marks.', 'err'); return; }
      if (entries.some(([, v]) => +v < 0 || +v > max)) { toast(`Marks must be between 0 and ${max}.`, 'err'); return; }
      const name = fd.get('name').trim() || 'Class test';
      let as = db.assessments.find((x) => x.name === name);
      if (!as) { as = { id: 'as' + Date.now(), name, date: fd.get('date') || todayISO, max, published: true }; db.assessments.push(as); }
      entries.forEach(([k, v]) => { const sid = k.slice(2); db.results = db.results.filter((r) => !(r.studentId === sid && r.assessment === as.id && r.subject === subject)); db.results.push({ studentId: sid, assessment: as.id, subject, marks: +v, max }); });
      marksDraft = { name, subject, max };
      commit(`${SJ[subject].name} marks published: ${name}`, 'class:' + cls.id); toast(`Published ${entries.length} results.`, 'ok'); render();
    }
    if (kind === 'msg') {
      const text = (fd.get('text') || '').trim(); if (!text) return;
      db.messages.push({ id: 'm' + Date.now(), thread: f.dataset.thread, from: session.id, to: f.dataset.to, text, at: Date.now() });
      commit(`New message from ${who().name}`, f.dataset.to); render();
      setTimeout(() => $('[data-form="msg"] input')?.focus(), 0);
    }
  });
  addEventListener('hashchange', () => { if (session) { $('#app')?.classList.remove('menu-open'); render(); scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); } });
  addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); palette(); }
    else if (e.key === '/' && !/input|textarea|select/i.test(doc.activeElement?.tagName || '')) { e.preventDefault(); palette(); }
    else if (e.key === 'Escape') $('.palette')?.remove();
  });
  /* glass spotlight + holographic card tilt */
  let raf = 0;
  addEventListener('pointermove', (e) => {
    if (reduce || e.pointerType === 'touch' || raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const sp = e.target.closest?.('.spot');
      if (sp) { const r = sp.getBoundingClientRect(); sp.style.setProperty('--mx', (e.clientX - r.left) + 'px'); sp.style.setProperty('--my', (e.clientY - r.top) + 'px'); }
      $$('[data-tilt]').forEach((c) => {
        const r = c.getBoundingClientRect();
        const inside = e.clientX > r.left - 40 && e.clientX < r.right + 40 && e.clientY > r.top - 40 && e.clientY < r.bottom + 40;
        const px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
        c.style.setProperty('--rx', inside ? (px * 14).toFixed(2) + 'deg' : '0deg');
        c.style.setProperty('--ry', inside ? (-py * 12).toFixed(2) + 'deg' : '0deg');
        c.style.setProperty('--sx', inside ? (px * 60).toFixed(1) + '%' : '0%');
        c.style.setProperty('--hx', inside ? (px * 180).toFixed(0) : '0');
      });
    });
  }, { passive: true });

  /* ---------- boot ---------- */
  load();
  render();
  metaTheme();
})();
