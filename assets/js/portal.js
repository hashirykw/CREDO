/* ============================================================================
   CREDO PORTAL · portal.js
   One connected store for Students, Parents and Teachers.
   Anything a teacher posts (diary, homework, notes, marks, attendance, notices)
   appears for the student and their parents at once — across tabs, via
   BroadcastChannel + storage events. Parents sign the diary, acknowledge
   emergency notes, apply for leave and message the class teacher; teachers
   see all of it on their dashboard.
   ============================================================================ */
(function () {
  const CFG = window.CREDO_PORTAL || { mode: 'preview' };
  const C = window.Credo, I = C.I, doc = document;
  const $ = (s, r = doc) => r.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const KEY = 'credo:portal:db:v4';
  const SKEY = 'credo:portal:session';

  /* ---------- icons ---------- */
  const ic = (p) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const IC = {
    home: ic('<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>'),
    diary: ic('<path d="M4 4h12a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3z"/><path d="M8 8h7M8 12h7M8 16h4"/>'),
    clock: ic('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    task: ic('<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 12l3 3 5-6"/>'),
    book: ic('<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/>'),
    chart: ic('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
    cal: ic('<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
    bell: ic('<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/>'),
    alert: ic('<path d="M12 3l10 18H2z"/><path d="M12 10v4M12 17.5v.5"/>'),
    chat: ic('<path d="M21 12a8 8 0 0 1-12 7l-6 2 2-5a8 8 0 1 1 16-4z"/>'),
    users: ic('<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0M17 4a4 4 0 0 1 0 8M22 21a7 7 0 0 0-4-6"/>'),
    plus: ic('<path d="M12 5v14M5 12h14"/>'),
    out: ic('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>'),
    eye: ic('<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
    sign: ic('<path d="M3 17c3-3 5-8 8-8s-1 8 2 8 4-4 6-4"/><path d="M3 21h18"/>'),
    menu: ic('<path d="M4 7h16M4 12h16M4 17h10"/>'),
    check: ic('<path d="M20 6L9 17l-5-5"/>'),
    trash: ic('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
    link: ic('<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>'),
    grade: ic('<path d="M12 3l9 5-9 5-9-5z"/><path d="M7 10.5V16c3 2 7 2 10 0v-5.5"/>'),
    roll: ic('<path d="M9 11l2 2 4-4"/><rect x="3" y="4" width="18" height="16" rx="3"/>')
  };

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

  /* ---------- seeded random ---------- */
  let seed = 20171;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const pick = (a) => a[Math.floor(rnd() * a.length)];

  /* ---------- subjects ---------- */
  const SJ = {
    ENG: { name: 'English', c: 'oklch(55% 0.17 255)' }, MATH: { name: 'Mathematics', c: 'oklch(56% 0.2 22)' }, PHY: { name: 'Physics', c: 'oklch(62% 0.15 200)' },
    CHEM: { name: 'Chemistry', c: 'oklch(65% 0.17 145)' }, CS: { name: 'Computer Science', c: 'oklch(55% 0.18 295)' }, ISL: { name: 'Islamiyat', c: 'oklch(60% 0.12 165)' },
    PST: { name: 'Pakistan Studies', c: 'oklch(70% 0.15 80)' }, URDU: { name: 'Urdu', c: 'oklch(58% 0.14 330)' }, SCI: { name: 'Science', c: 'oklch(65% 0.17 145)' },
    SST: { name: 'Social Studies', c: 'oklch(70% 0.15 80)' }, COMP: { name: 'Computer', c: 'oklch(55% 0.18 295)' }, ART: { name: 'Art', c: 'oklch(68% 0.16 40)' }
  };
  const sj = (k) => `<span class="sj" style="--sj:${SJ[k]?.c || 'var(--brand-gold)'}">${SJ[k]?.name || k}</span>`;

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
      { id: '9-A', name: 'Grade 9 · Section A', campus: 'school', campusName: 'Credo School · O Levels', stream: 'Science', classTeacher: 'T-301', room: 'Room 204',
        week: { Monday: ['ENG', 'MATH', 'PHY', 'CHEM', 'BREAK', 'CS', 'ISL', 'URDU', 'PST'], Tuesday: ['MATH', 'PHY', 'ENG', 'CS', 'BREAK', 'CHEM', 'PST', 'ISL', 'URDU'], Wednesday: ['PHY', 'CHEM', 'MATH', 'ENG', 'BREAK', 'URDU', 'CS', 'PST', 'ISL'], Thursday: ['CHEM', 'ENG', 'CS', 'MATH', 'BREAK', 'PHY', 'URDU', 'ISL', 'PST'], Friday: ['MATH', 'CS', 'ENG', 'PHY', 'BREAK', 'CHEM', 'ISL', 'PST', 'URDU'] } },
      { id: '3-B', name: 'Grade 3 · Section B', campus: 'preschool', campusName: 'Credo Preschool & Primary', classTeacher: 'T-311', room: 'Blue Room',
        week: { Monday: ['ENG', 'MATH', 'SCI', 'URDU', 'BREAK', 'ISL', 'ART', 'SST', 'COMP'], Tuesday: ['MATH', 'ENG', 'URDU', 'SCI', 'BREAK', 'COMP', 'SST', 'ISL', 'ART'], Wednesday: ['ENG', 'SCI', 'MATH', 'SST', 'BREAK', 'URDU', 'ISL', 'COMP', 'ART'], Thursday: ['SCI', 'MATH', 'ENG', 'URDU', 'BREAK', 'ART', 'ISL', 'SST', 'COMP'], Friday: ['MATH', 'ENG', 'ISL', 'SCI', 'BREAK', 'URDU', 'ART', 'COMP', 'SST'] } }
    ];
    const names9 = ['Ayaan Siddiqui', 'Hania Rizvi', 'Zain Merchant', 'Aleena Baig', 'Muhammad Taha', 'Eshal Kazmi', 'Rayyan Junaid', 'Mahnoor Tariq', 'Abdullah Shaikh', 'Zoha Ansari', 'Daniyal Hashmi', 'Fatima Zehra', 'Hamza Qureshi', 'Anaya Malik'];
    const houses = ['Cave', 'Congo', 'Cape'];
    const students = names9.map((n, i) => ({ id: i === 0 ? 'CS-26-0917' : 'CS-26-09' + pad(20 + i), name: n, classId: '9-A', roll: i + 1, house: houses[i % 3], pass: i === 0 ? 'credo123' : null }));
    students.push({ id: 'CP-26-0311', name: 'Inaya Siddiqui', classId: '3-B', roll: 7, house: 'Cape', pass: 'credo123' });
    ['Hadi Raza', 'Sara Imran', 'Ali Abbas', 'Maryam Noman', 'Yusuf Ilyas', 'Alisha Kamran'].forEach((n, i) => students.push({ id: 'CP-26-03' + pad(20 + i), name: n, classId: '3-B', roll: i + 1 + (i >= 6 ? 1 : 0), house: houses[i % 3] }));
    const parents = [{ id: 'P-1001', name: 'Mrs. Sana Siddiqui', children: ['CS-26-0917', 'CP-26-0311'], phone: '03xx xxxxxxx', pass: 'credo123' }];

    // diary across recent and upcoming school days
    const diary = [];
    const hw9 = { ENG: ['Read “The Necklace” and write a 150-word summary', 'Comprehension practice: Paper 1, passage B', 'Learn 15 vocabulary words from the list'], MATH: ['Exercise 7.2 — questions 1 to 12', 'Simultaneous equations worksheet, side A', 'Revise indices; quiz tomorrow'], PHY: ['Draw and label a ray diagram for a convex lens', 'Bring the lab journal for the refraction practical', 'Past paper Q4 (speed–time graphs)'], CHEM: ['Balance the 10 equations on the handout', 'Learn the reactivity series', 'Write up the titration practical'], CS: ['Trace table for the bubble-sort algorithm', 'Binary to hexadecimal conversions, set 3', 'Pseudocode: validate a 4-digit PIN'], ISL: ['Learn the summary of Surah Al-Fatiha', 'Notes: the Treaty of Hudaybiyyah'], PST: ['Map work: rivers of Pakistan', 'Learn the causes of the War of Independence 1857'], URDU: ['مضمون: میرا پسندیدہ کھیل (۱۵۰ الفاظ)', 'Learn the poem by heart for recitation'] };
    const hw3 = { ENG: ['Spelling list 9 — learn for Friday', 'Read pages 20–24 of the reader'], MATH: ['Workbook page 41: two-digit multiplication', 'Times tables of 7 and 8'], SCI: ['Collect three different leaves for class', 'Colour the water-cycle diagram'], URDU: ['حروفِ تہجی سے پانچ الفاظ لکھیں', 'Read story page 12'], ISL: ['Learn the Kalima Tayyiba with meaning'], SST: ['Name the four provinces of Pakistan'], COMP: ['Draw parts of a computer'], ART: ['Bring crayons and an A4 sheet'] };
    const days = [...schoolDays(prevSchoolDay(TODAY, 9), TODAY), iso(nextSchoolDay(TODAY))].filter((v, i, a) => a.indexOf(v) === i);
    days.forEach((d, di) => {
      const dow = DAYS[parse(d).getDay() - 1];
      if (!dow) return;
      classes.forEach((cls) => {
        const subs = cls.week[dow].filter((x) => x !== 'BREAK');
        const bank = cls.id === '9-A' ? hw9 : hw3;
        const count = cls.id === '9-A' ? 3 : 2;
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
      { id: 'a6', classId: '3-B', subject: 'SCI', teacherId: 'T-311', title: 'My plant diary', details: 'Draw your bean plant every day for a week and write one line about how it changed.', due: iso(nextSchoolDay(TODAY, 3)), max: 10 }
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
      { id: 'n8', classId: '3-B', subject: 'ENG', kind: 'Notes', title: 'Spelling lists 9 & 10', body: 'Words for the next two weekly tests.', teacherId: 'T-311', at: Date.now() - 5 * 864e5 }
    ];

    const notices = [
      { id: 'x1', level: 'emergency', scope: 'campus:school', title: 'Early dismissal today', body: 'Due to a heavy-rain advisory, Credo School will close at 11:30 am today. Please arrange early pick-up. Vans will leave at 11:45.', at: Date.now() - 50 * 60e3, by: 'Campus Office', ack: {} },
      { id: 'x2', level: 'notice', scope: 'campus:school', title: 'Mid-term examinations begin in December', body: 'The mid-term examination schedule for Grades 6–11 will be shared in the diary next week. Study kits are available from subject teachers.', at: Date.now() - 2 * 864e5, by: 'Examinations Office', ack: {} },
      { id: 'x3', level: 'event', scope: 'class:9-A', title: 'Inter-house debate: Cave vs Congo', body: 'Thursday after break in the AV room. Congo and Cave teams please meet Ms. Mehreen at 10:25.', at: Date.now() - 3 * 864e5, by: 'Ms. Mehreen Shah', ack: {} },
      { id: 'x4', level: 'notice', scope: 'campus:preschool', title: 'Splash Day — bring a change of clothes', body: 'Grade 3 will enjoy Splash Day this Friday. Please send a towel and a change of clothes in a labelled bag.', at: Date.now() - 864e5, by: 'Ms. Amna Rauf', ack: {} },
      { id: 'x5', level: 'event', scope: 'all', title: 'Parent-teacher meeting', body: 'The first parent-teacher meeting of the session is on Saturday, 9:00 am – 12:00 pm, at every campus.', at: Date.now() - 5 * 864e5, by: 'Credo Network', ack: {} }
    ];

    // attendance since session start
    const start = new Date(TODAY.getFullYear(), TODAY.getMonth() - 2, 18);
    const attendance = {};
    const sdays = schoolDays(start, prevSchoolDay(TODAY));
    students.forEach((s, si) => {
      attendance[s.id] = {};
      sdays.forEach((d) => { const r = rnd(); attendance[s.id][d] = r < (si === 0 ? 0.03 : 0.05) ? 'A' : r < 0.09 ? 'L' : 'P'; });
    });

    // results
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
      { id: 'm-2', thread: 'P-1001:T-301', from: 'T-301', to: 'P-1001', text: 'Walaikum assalam! We started Exercise 7.2 (simultaneous equations). I’ve added the worksheet to Notes — he can ask me in class too.', at: Date.now() - 24 * 3600e3 }
    ];
    const leaves = [{ id: 'l1', studentId: 'CS-26-0917', parentId: 'P-1001', from: iso(nextSchoolDay(TODAY, 6)), to: iso(nextSchoolDay(TODAY, 6)), reason: 'Family wedding out of the city.', status: 'pending', at: Date.now() - 5 * 3600e3 }];

    return { v: 4, PERIODS, teachers, classes, students, parents, diary, diarySeen, assignments, submissions, notes, notices, attendance, results, assessments, remarks, messages, leaves, activity: [], updated: Date.now() };
  }

  /* ---------- store with live sync ---------- */
  let db;
  const chan = 'BroadcastChannel' in window ? new BroadcastChannel('credo-portal') : null;
  function load() { try { db = JSON.parse(localStorage.getItem(KEY)); } catch (e) { db = null; } if (!db || db.v !== 4) { db = seedDB(); persist(); } }
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
    if (msg && msg.summary && msg.by !== session.id && relevant(msg.audience)) C.toast(`<b>Live</b> · ${esc(msg.summary)}`, 'ok');
  }
  chan && chan.addEventListener('message', (e) => onRemote(e.data));
  addEventListener('storage', (e) => { if (e.key === KEY) onRemote(null); });

  /* ---------- helpers on data ---------- */
  const teacher = (id) => db.teachers.find((t) => t.id === id);
  const student = (id) => db.students.find((s) => s.id === id);
  const klass = (id) => db.classes.find((c) => c.id === id);
  const parentOf = (sid) => db.parents.filter((p) => p.children.includes(sid));
  const initials = (n) => n.replace(/^(Ms\.|Mr\.|Mrs\.)\s*/, '').split(' ').map((w) => w[0]).slice(0, 2).join('');
  const subjectsOf = (cls) => [...new Set(Object.values(cls.week).flat())].filter((x) => x !== 'BREAK');
  function noticesFor(sid) {
    const s = student(sid); const cls = klass(s.classId);
    return db.notices.filter((n) => n.scope === 'all' || n.scope === 'class:' + cls.id || n.scope === 'campus:' + cls.campus).sort((a, b) => b.at - a.at);
  }
  function attStats(sid) {
    const a = db.attendance[sid] || {}; const v = Object.values(a);
    const p = v.filter((x) => x === 'P').length, l = v.filter((x) => x === 'L').length, ab = v.filter((x) => x === 'A').length, lv = v.filter((x) => x === 'V').length;
    const total = v.length || 1;
    return { pct: Math.round(((p + l) / total) * 100), p, l, a: ab, v: lv, total: v.length };
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
  function pendingFor(sid) {
    const s = student(sid);
    return db.assignments.filter((a) => a.classId === s.classId && !db.submissions[a.id + ':' + sid] && a.due >= todayISO).sort((a, b) => a.due.localeCompare(b.due));
  }
  function nowPeriod(cls) {
    const dow = DAYS[new Date().getDay() - 1];
    if (!dow) return { dow: null };
    const mins = new Date().getHours() * 60 + new Date().getMinutes();
    const toM = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
    const idx = db.PERIODS.findIndex((p) => mins >= toM(p[0]) && mins < toM(p[1]));
    const doneBefore = (i) => mins >= toM(db.PERIODS[i][1]);
    return { dow, idx, doneBefore };
  }

  /* ---------- session ---------- */
  let session = null;
  try { session = JSON.parse(localStorage.getItem(SKEY)); } catch (e) {}
  let childId = null;
  function relevant(aud) {
    if (!aud || aud === 'all') return true;
    if (session.role === 'teacher') return aud.includes('teacher') || aud.includes(session.id);
    const kids = session.role === 'parent' ? (db.parents.find((p) => p.id === session.id)?.children || []) : [session.id];
    return kids.some((k) => { const s = student(k); return aud.includes('class:' + s.classId) || aud.includes('campus:' + klass(s.classId).campus) || aud.includes(k); }) || aud.includes(session.id);
  }

  /* ---------- charts ---------- */
  function barChart(items, h = 180) {
    const w = 560, pb = 34, pt = 14, bw = Math.min(46, (w - 40) / items.length - 14);
    const gap = (w - 30 - bw * items.length) / Math.max(1, items.length);
    const y = (p) => pt + (h - pt - pb) * (1 - p / 100);
    return `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Average percentage by subject">
      ${[0, 50, 100].map((g) => `<line class="axis" x1="28" x2="${w}" y1="${y(g)}" y2="${y(g)}"/><text x="0" y="${y(g) + 3}">${g}%</text>`).join('')}
      ${items.map((it, i) => { const x = 34 + i * (bw + gap); return `<g><rect class="bar" x="${x}" y="${y(it.pct)}" width="${bw}" height="${h - pb - y(it.pct)}" rx="7" fill="${SJ[it.k]?.c || 'var(--brand-gold)'}"><title>${SJ[it.k]?.name || it.k}: ${it.pct}%</title></rect><text x="${x + bw / 2}" y="${y(it.pct) - 5}" text-anchor="middle" style="fill:var(--color-ink);font-weight:500">${it.pct}</text><text x="${x + bw / 2}" y="${h - 14}" text-anchor="middle">${it.k}</text></g>`; }).join('')}
    </svg>`;
  }
  function lineChart(points, h = 170) {
    if (!points.length) return '<div class="empty">No published assessments yet.</div>';
    const w = 560, pl = 30, pr = 20, pt = 18, pb = 30;
    const x = (i) => pl + (points.length === 1 ? (w - pl - pr) / 2 : (i * (w - pl - pr)) / (points.length - 1));
    const y = (p) => pt + (h - pt - pb) * (1 - (p - 30) / 70);
    const d = points.map((p, i) => `${i ? 'L' : 'M'}${x(i)},${y(p.pct)}`).join(' ');
    return `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Overall percentage over time">
      <defs><linearGradient id="gArea" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="oklch(56% 0.2 22)" stop-opacity=".28"/><stop offset="1" stop-color="oklch(56% 0.2 22)" stop-opacity="0"/></linearGradient></defs>
      ${[40, 70, 100].map((g) => `<line class="axis" x1="${pl}" x2="${w - pr}" y1="${y(g)}" y2="${y(g)}"/><text x="0" y="${y(g) + 3}">${g}%</text>`).join('')}
      <path class="area" d="${d} L${x(points.length - 1)},${h - pb} L${x(0)},${h - pb} Z"/>
      <path class="line" d="${d}"/>
      ${points.map((p, i) => `<circle class="pt" cx="${x(i)}" cy="${y(p.pct)}" r="5"><title>${esc(p.a.name)}: ${p.pct}%</title></circle><text x="${x(i)}" y="${h - 10}" text-anchor="middle">${esc(p.a.name.split(' ')[0])}</text>`).join('')}
    </svg>`;
  }
  function ring(pct, label, color = 'var(--brand-gold)') {
    const r = 52, c = 2 * Math.PI * r;
    return `<div class="ring"><svg viewBox="0 0 120 120" width="120" height="120"><circle cx="60" cy="60" r="${r}" fill="none" stroke="var(--color-rule)" stroke-width="10"/><circle cx="60" cy="60" r="${r}" fill="none" stroke="${color}" stroke-width="10" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct / 100)}" style="transition:stroke-dashoffset 1s var(--ease-out)"/></svg><div class="rv"><div><b>${pct}%</b><span>${label}</span></div></div></div>`;
  }

  /* ---------- shared blocks ---------- */
  function emergencyBlock(sid, canAck) {
    const list = noticesFor(sid).filter((n) => n.level === 'emergency' && Date.now() - n.at < 2 * 864e5);
    return list.map((n) => {
      const acked = n.ack[session.id];
      return `<div class="alert" role="alert"><span class="a-ic">${IC.alert}</span><div><b>Emergency note · ${esc(n.title)}</b><p>${esc(n.body)}</p><small>${esc(n.by)} · ${ago(n.at)}</small></div>
        ${canAck ? (acked ? `<span class="pill ok">${IC.check.replace('<svg', '<svg width="12" height="12"')} Acknowledged</span>` : `<button class="sbtn red" data-act="ack" data-id="${n.id}">Acknowledge</button>`) : ''}</div>`;
    }).join('');
  }
  function timetableStrip(cls) {
    const np = nowPeriod(cls);
    if (!np.dow) return `<div class="empty">${IC.cal}No classes today. Next school day: <b>${fmtLong(iso(nextSchoolDay(TODAY)))}</b>.</div>`;
    return `<div class="tt-strip">${cls.week[np.dow].map((k, i) => {
      const p = db.PERIODS[i]; const brk = k === 'BREAK';
      const cl = i === np.idx ? 'now' : np.doneBefore(i) ? 'done' : '';
      return `<div class="tt-p ${cl} ${brk ? 'brk' : ''}"><span class="t">${p[0]}–${p[1]}</span><b>${brk ? 'Break' : SJ[k].name}</b><span>${brk ? 'Recess' : esc(teacher(cls.id === '3-B' ? 'T-311' : (db.teachers.find((t) => t.subject === k && !t.classTeacherOf) || db.teachers[0]).id)?.name || '')}</span></div>`;
    }).join('')}</div>`;
  }
  function timetableGrid(cls, highlightSubject) {
    const np = nowPeriod(cls);
    return `<div class="tt-wrap"><div class="tt-grid"><div class="h">Time</div>${DAYS.map((d) => `<div class="h ${d === np.dow ? 'today' : ''}">${d}</div>`).join('')}
      ${db.PERIODS.map((p, i) => `<div class="h" style="padding-top:14px">${p[0]}<br>${p[1]}</div>${DAYS.map((d) => { const k = cls.week[d][i]; if (k === 'BREAK') return '<div class="cell brk">Break</div>'; const mine = highlightSubject && k === highlightSubject; return `<div class="cell ${d === np.dow ? 'today' : ''}" style="${mine ? 'background:color-mix(in oklch,var(--brand-gold) 22%,transparent)' : ''}"><b>${SJ[k].name}</b>${d === np.dow && i === np.idx ? '<span class="pill ok" style="margin-top:4px">Now</span>' : ''}</div>`; }).join('')}`).join('')}
    </div></div>`;
  }
  function diaryList(entries, opts = {}) {
    if (!entries.length) return `<div class="empty">${IC.diary}Nothing in the diary for this day.</div>`;
    return `<div class="list">${entries.map((e) => {
      const seen = db.diarySeen[e.id] || {}; const nSeen = Object.keys(seen).length;
      const right = opts.sign ? (seen[session.id] ? `<span class="pill ok">Signed</span>` : `<button class="sbtn gold" data-act="sign" data-id="${e.id}">${IC.sign}Sign</button>`)
        : opts.teacher ? `<span class="pill ${nSeen ? 'ok' : 'mute'}">${IC.eye.replace('<svg', '<svg width="12" height="12"')} ${nSeen}/${db.students.filter((s) => s.classId === e.classId).length} parents</span>${e.teacherId === session.id ? `<button class="icon-btn" data-act="del-diary" data-id="${e.id}" aria-label="Delete entry" style="width:34px;height:34px">${IC.trash}</button>` : ''}` : '';
      return `<div class="li">${sj(e.subject)}<div><div class="li-t">${e.type === 'reminder' ? 'Reminder' : e.type === 'classwork' ? 'Classwork' : 'Homework'}</div><div class="li-d" ${/[؀-ۿ]/.test(e.text) ? 'dir="rtl" style="text-align:right;font-size:1.05rem"' : ''}>${esc(e.text)}</div><div class="li-m"><span>${esc(teacher(e.teacherId)?.name || '')}</span>${e.type === 'homework' ? `<span>Due ${fmt(e.due)}</span>` : ''}</div></div><div class="li-r">${right}</div></div>`;
    }).join('')}</div>`;
  }
  function dayStrip(selected, cls) {
    const list = [];
    for (let i = -9; i <= 4; i++) list.push(iso(addDays(TODAY, i)));
    return `<div class="days" role="group" aria-label="Choose a day">${list.map((d) => { const dd = parse(d); const has = db.diary.some((e) => e.classId === cls.id && e.date === d); return `<button type="button" data-act="day" data-d="${d}" aria-pressed="${d === selected}" class="${has ? 'has' : ''} ${isSchoolDay(dd) ? '' : 'off'}">${DOW[dd.getDay()]}<b>${dd.getDate()}</b>${d === todayISO ? 'Today' : dd.toLocaleDateString('en-GB', { month: 'short' })}</button>`; }).join('')}</div>`;
  }
  function attendanceCal(sid) {
    const a = db.attendance[sid] || {};
    const first = new Date(TODAY.getFullYear(), TODAY.getMonth() - (calMonth), 1);
    const last = new Date(first.getFullYear(), first.getMonth() + 1, 0);
    const lead = (first.getDay() + 6) % 7;
    let cells = Array(lead).fill('<span></span>');
    for (let d = 1; d <= last.getDate(); d++) {
      const dt = new Date(first.getFullYear(), first.getMonth(), d); const k = iso(dt); const v = a[k];
      cells.push(`<span class="d ${v || ''} ${isSchoolDay(dt) ? '' : 'off'} ${k === todayISO ? 'today' : ''}" title="${fmt(k)}${v ? ' · ' + ({ P: 'Present', A: 'Absent', L: 'Late', V: 'On leave' })[v] : ''}">${d}</span>`);
    }
    return `<div class="panel-h"><h2>${first.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</h2><div class="seg"><button data-act="cal" data-v="1" aria-label="Previous month">‹</button><button data-act="cal" data-v="-1" aria-label="Next month" ${calMonth === 0 ? 'disabled' : ''}>›</button></div></div>
      <div class="cal">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((x) => `<span class="dh">${x}</span>`).join('')}${cells.join('')}</div>
      <div class="legend"><span><i style="background:var(--color-ok)"></i>Present</span><span><i style="background:var(--color-danger)"></i>Absent</span><span><i style="background:var(--color-warn)"></i>Late</span><span><i style="background:var(--brand-blue)"></i>Leave</span></div>`;
  }
  let calMonth = 0;

  /* ============================================================
     VIEWS
     ============================================================ */
  let selDay = todayISO;
  const V = {};

  /* ----- student ----- */
  V.s_today = (sid) => {
    const s = student(sid), cls = klass(s.classId);
    const today = db.diary.filter((e) => e.classId === cls.id && e.date === todayISO);
    const pend = pendingFor(sid); const at = attStats(sid); const rs = resultSummary(sid);
    const notices = noticesFor(sid).filter((n) => n.level !== 'emergency').slice(0, 3);
    const hour = new Date().getHours();
    return `${emergencyBlock(sid, session.role === 'parent')}
    <div class="cols">
      <div class="welcome c-8"><img class="lion" src="assets/img/brand/lion-gold.webp" alt=""><span class="mono" style="font-size:.72rem;letter-spacing:.16em;opacity:.8">${fmtLong(todayISO).toUpperCase()}</span><h2>${hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'}, ${esc(s.name.split(' ')[0])}.</h2><p>${esc(cls.name)} · ${esc(cls.campusName)} · ${esc(cls.room)}</p><div class="wl-chips"><span>Roll no. ${s.roll}</span><span>House ${esc(s.house)}</span><span>${esc(s.id)}</span></div></div>
      <div class="stat glass-2 c-4">${ring(at.pct, 'attendance', at.pct >= 90 ? 'var(--color-ok)' : 'var(--brand-crimson-bright)')}<div class="s-f">${at.pct >= 90 ? 'On track for Credo’s 90% monthly attendance policy.' : 'Below Credo’s 90% attendance requirement.'}</div></div>
    </div>
    <div class="panel glass-2"><div class="panel-h"><h2>Today’s timetable</h2><a href="#/timetable">Full week</a></div>${timetableStrip(cls)}</div>
    <div class="cols">
      <div class="panel glass-2 c-7"><div class="panel-h"><h2>Today’s diary</h2><a href="#/diary">Open diary</a></div>${diaryList(today, { sign: session.role === 'parent' })}</div>
      <div class="c-5" style="display:grid;gap:var(--space-md);align-content:start">
        <div class="panel glass-2"><div class="panel-h"><h2>Due soon</h2><a href="#/assignments">All</a></div>${pend.length ? `<div class="list">${pend.slice(0, 3).map((a) => `<div class="li">${sj(a.subject)}<div><div class="li-t">${esc(a.title)}</div><div class="li-m"><span>Due ${fmt(a.due, { weekday: 'short', day: 'numeric', month: 'short' })}</span></div></div><span class="pill ${a.due === todayISO || a.due === iso(nextSchoolDay(TODAY)) ? 'warn' : 'mute'}">${a.due === todayISO ? 'Today' : a.due === iso(nextSchoolDay(TODAY)) ? 'Next day' : fmt(a.due)}</span></div>`).join('')}</div>` : `<div class="empty">${IC.task}All caught up.</div>`}</div>
        <div class="stat glass-2"><div class="s-l"><span>Overall average</span><span>${grade(rs.overall)}</span></div><div class="s-v">${rs.overall}%</div><div class="meter"><i style="width:${rs.overall}%"></i></div><div class="s-f">Across ${rs.subAvg.length} subjects · <a href="#/results" style="color:var(--color-accent);font-weight:700">See results</a></div></div>
      </div>
    </div>
    <div class="panel glass-2"><div class="panel-h"><h2>Notices</h2><a href="#/notices">All notices</a></div>${noticeList(notices, sid)}</div>`;
  };
  V.s_diary = (sid, opts = {}) => {
    const s = student(sid), cls = klass(s.classId);
    const entries = db.diary.filter((e) => e.classId === cls.id && e.date === selDay).sort((a, b) => a.at - b.at);
    const unsigned = opts.sign ? db.diary.filter((e) => e.classId === cls.id && e.date <= todayISO && !(db.diarySeen[e.id] || {})[session.id]).length : 0;
    return `<div class="panel glass-2"><div class="panel-h"><div><h2>Daily diary</h2><div class="sub">${esc(cls.name)} · ${fmtLong(selDay)}</div></div>${opts.sign ? `<div style="display:flex;gap:8px;align-items:center">${unsigned ? `<span class="pill warn">${unsigned} unsigned</span><button class="sbtn gold" data-act="sign-all" data-sid="${sid}">${IC.sign}Sign all</button>` : '<span class="pill ok">All signed</span>'}</div>` : ''}</div>${dayStrip(selDay, cls)}<div style="margin-top:12px">${diaryList(entries, opts)}</div></div>`;
  };
  V.s_timetable = (sid) => { const cls = klass(student(sid).classId); return `<div class="panel glass-2"><div class="panel-h"><div><h2>Weekly timetable</h2><div class="sub">${esc(cls.name)} · ${esc(cls.room)}</div></div></div>${timetableGrid(cls)}</div>`; };
  V.s_assignments = (sid, opts = {}) => {
    const s = student(sid);
    const list = db.assignments.filter((a) => a.classId === s.classId).sort((a, b) => b.due.localeCompare(a.due));
    return `<div class="panel glass-2"><div class="panel-h"><h2>Assignments</h2><span class="sub">${pendingFor(sid).length} pending</span></div><div class="list">${list.map((a) => {
      const sub = db.submissions[a.id + ':' + sid];
      const over = !sub && a.due < todayISO;
      const status = sub ? (sub.marks != null ? `<span class="pill ok">${sub.marks}/${a.max}</span>` : `<span class="pill ok">${sub.status === 'late' ? 'Submitted late' : 'Submitted'}</span>`) : over ? '<span class="pill bad">Missing</span>' : '<span class="pill warn">Pending</span>';
      const act = !opts.readOnly && !sub ? `<button class="sbtn primary" data-act="submit" data-id="${a.id}">${IC.check}Mark as submitted</button>` : '';
      return `<div class="li">${sj(a.subject)}<div><div class="li-t">${esc(a.title)}</div><div class="li-d">${esc(a.details)}</div><div class="li-m"><span>${esc(teacher(a.teacherId)?.name || '')}</span><span>Due ${fmt(a.due, { weekday: 'short', day: 'numeric', month: 'short' })}</span><span>Out of ${a.max}</span>${sub?.note ? `<span>Note: “${esc(sub.note)}”</span>` : ''}</div></div><div class="li-r">${status}${act}</div></div>`;
    }).join('')}</div></div>`;
  };
  let noteFilter = 'all', noteQ = '';
  V.s_notes = (sid) => {
    const s = student(sid), cls = klass(s.classId);
    let list = db.notes.filter((n) => n.classId === s.classId).sort((a, b) => b.at - a.at);
    if (noteFilter !== 'all') list = list.filter((n) => n.subject === noteFilter);
    if (noteQ) list = list.filter((n) => (n.title + n.body).toLowerCase().includes(noteQ.toLowerCase()));
    return `<div class="panel glass-2"><div class="panel-h"><h2>Notes & resources</h2><input class="input" style="max-width:260px;min-height:40px;border-radius:999px" type="search" placeholder="Search notes…" value="${esc(noteQ)}" data-act="noteq" aria-label="Search notes"></div>
      <div class="seg" style="margin-bottom:12px"><button data-act="notef" data-v="all" aria-pressed="${noteFilter === 'all'}">All</button>${subjectsOf(cls).map((k) => `<button data-act="notef" data-v="${k}" aria-pressed="${noteFilter === k}">${SJ[k].name}</button>`).join('')}</div>
      ${list.length ? `<div class="cols">${list.map((n) => `<article class="c-6 glass" style="padding:18px;border-radius:var(--radius-lg);display:grid;gap:8px">${sj(n.subject)}<b style="font-size:1.02rem">${esc(n.title)}</b><p class="ink-2" style="font-size:.9rem">${esc(n.body)}</p><div class="li-m" style="font-size:.72rem;color:var(--color-ink-3);display:flex;gap:10px;flex-wrap:wrap"><span class="pill mute">${esc(n.kind)}</span><span>${esc(teacher(n.teacherId)?.name || '')}</span><span>${ago(n.at)}</span>${n.url ? `<a href="${esc(n.url)}" target="_blank" rel="noopener" style="color:var(--color-accent);font-weight:700">Open link</a>` : ''}</div></article>`).join('')}</div>` : `<div class="empty">${IC.book}No notes match.</div>`}</div>`;
  };
  V.s_results = (sid) => {
    const r = resultSummary(sid);
    const as = db.assessments.filter((a) => a.published).sort((a, b) => b.date.localeCompare(a.date));
    const remark = db.remarks[sid];
    return `<div class="cols">
      <div class="stat glass-2 c-4"><div class="s-l"><span>Overall average</span><span class="pill ok">${grade(r.overall)}</span></div><div class="s-v">${r.overall}%</div><div class="meter"><i style="width:${r.overall}%"></i></div><div class="s-f">Best: ${r.subAvg[0] ? SJ[r.subAvg[0].k].name + ' ' + r.subAvg[0].pct + '%' : '—'}</div></div>
      <div class="panel glass-2 c-8"><div class="panel-h"><h2>Progress over time</h2><span class="sub">Overall % per assessment</span></div>${lineChart(r.byAs)}</div>
    </div>
    <div class="panel glass-2"><div class="panel-h"><h2>Subject averages</h2></div>${barChart(r.subAvg)}</div>
    ${remark ? `<div class="alert notice"><span class="a-ic">${IC.chat}</span><div><b>Class teacher’s remark</b><p>${esc(remark)}</p></div><span></span></div>` : ''}
    ${as.map((a) => { const rows = r.rs.filter((x) => x.assessment === a.id); if (!rows.length) return ''; const tot = rows.reduce((s, x) => s + x.marks, 0), mx = rows.reduce((s, x) => s + x.max, 0); return `<div class="panel glass-2"><div class="panel-h"><div><h2>${esc(a.name)}</h2><div class="sub">${fmt(a.date, { day: 'numeric', month: 'long', year: 'numeric' })}</div></div><span class="pill ok">${tot}/${mx} · ${Math.round((tot / mx) * 100)}%</span></div><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Subject</th><th>Marks</th><th>%</th><th>Grade</th></tr></thead><tbody>${rows.map((x) => { const p = Math.round((x.marks / x.max) * 100); return `<tr><td>${sj(x.subject)}</td><td class="mono">${x.marks} / ${x.max}</td><td><div class="meter ${p < 60 ? 'red' : ''}" style="width:120px"><i style="width:${p}%"></i></div></td><td class="grade">${grade(p)}</td></tr>`; }).join('')}</tbody></table></div></div>`; }).join('')}`;
  };
  V.s_attendance = (sid, opts = {}) => {
    const at = attStats(sid);
    const lv = db.leaves.filter((l) => l.studentId === sid).sort((a, b) => b.at - a.at);
    return `<div class="cols">
      <div class="stat glass-2 c-3">${ring(at.pct, 'present', at.pct >= 90 ? 'var(--color-ok)' : 'var(--brand-crimson-bright)')}</div>
      <div class="stat glass-2 c-3"><div class="s-l"><span>Present</span></div><div class="s-v">${at.p}</div><div class="s-f">of ${at.total} school days</div></div>
      <div class="stat glass-2 c-3"><div class="s-l"><span>Late</span></div><div class="s-v">${at.l}</div><div class="s-f">counted as present</div></div>
      <div class="stat glass-2 c-3"><div class="s-l"><span>Absent</span></div><div class="s-v" style="color:var(--color-danger)">${at.a}</div><div class="s-f">${at.v} on approved leave</div></div>
    </div>
    <div class="cols">
      <div class="panel glass-2 c-7">${attendanceCal(sid)}</div>
      <div class="panel glass-2 c-5"><div class="panel-h"><h2>Leave applications</h2>${opts.canApply ? `<button class="sbtn primary" data-act="leave-new" data-sid="${sid}">${IC.plus}Apply</button>` : ''}</div>
        ${lv.length ? `<div class="list">${lv.map((l) => `<div class="li"><span class="avatar sm">${IC.cal.replace('<svg', '<svg width="16" height="16"')}</span><div><div class="li-t">${fmt(l.from, { day: 'numeric', month: 'short' })}${l.to !== l.from ? ' – ' + fmt(l.to) : ''}</div><div class="li-d">${esc(l.reason)}</div><div class="li-m"><span>Applied ${ago(l.at)}</span></div></div><span class="pill ${l.status === 'approved' ? 'ok' : l.status === 'declined' ? 'bad' : 'warn'}">${l.status}</span></div>`).join('')}</div>` : '<div class="empty">No leave applications.</div>'}
        <p class="ink-3" style="font-size:.78rem;margin-top:12px">Credo’s no-tuition policy asks for at least 90% attendance every month.</p></div>
    </div>`;
  };
  function noticeList(list, sid) {
    if (!list.length) return `<div class="empty">${IC.bell}No notices.</div>`;
    return `<div class="list">${list.map((n) => `<div class="li"><span class="pill ${n.level === 'emergency' ? 'bad' : n.level === 'event' ? 'ok' : 'warn'}">${n.level}</span><div><div class="li-t">${esc(n.title)}</div><div class="li-d">${esc(n.body)}</div><div class="li-m"><span>${esc(n.by)}</span><span>${ago(n.at)}</span><span>${n.scope === 'all' ? 'Whole network' : n.scope.startsWith('class:') ? 'Class ' + n.scope.slice(6) : 'Campus'}</span></div></div>${session.role === 'parent' ? (n.ack[session.id] ? '<span class="pill ok">Seen</span>' : `<button class="sbtn" data-act="ack" data-id="${n.id}">Mark seen</button>`) : '<span></span>'}</div>`).join('')}</div>`;
  }
  V.s_notices = (sid) => `<div class="panel glass-2"><div class="panel-h"><h2>Notices & emergency notes</h2></div>${noticeList(noticesFor(sid), sid)}</div>`;

  /* ----- parent ----- */
  V.p_overview = () => {
    const p = db.parents.find((x) => x.id === session.id);
    const kids = p.children.map(student);
    const s = student(childId);
    const cls = klass(s.classId);
    const at = attStats(s.id), rs = resultSummary(s.id);
    const unsigned = db.diary.filter((e) => e.classId === cls.id && e.date <= todayISO && !(db.diarySeen[e.id] || {})[session.id]);
    const today = db.diary.filter((e) => e.classId === cls.id && e.date === todayISO);
    const ct = teacher(cls.classTeacher);
    return `${kids.map((k) => emergencyBlock(k.id, true)).join('')}
    <div class="cols">
      <div class="welcome c-8"><img class="lion" src="assets/img/brand/lion-gold.webp" alt=""><span class="mono" style="font-size:.72rem;letter-spacing:.16em;opacity:.8">PARENT OVERVIEW · ${fmtLong(todayISO).toUpperCase()}</span><h2>${esc(s.name)}</h2><p>${esc(cls.name)} · ${esc(cls.campusName)} · Class teacher ${esc(ct?.name || '')}</p><div class="wl-chips"><span>Roll no. ${s.roll}</span><span>House ${esc(s.house)}</span><span>${unsigned.length ? unsigned.length + ' diary entries to sign' : 'Diary signed'}</span></div></div>
      <div class="stat glass-2 c-4">${ring(at.pct, 'attendance', at.pct >= 90 ? 'var(--color-ok)' : 'var(--brand-crimson-bright)')}<div class="s-f">${at.a} absent · ${at.l} late · this session</div></div>
    </div>
    <div class="cols">
      <div class="stat glass-2 c-4"><div class="s-l"><span>Average</span><span class="pill ok">${grade(rs.overall)}</span></div><div class="s-v">${rs.overall}%</div><div class="meter"><i style="width:${rs.overall}%"></i></div><div class="s-f">${rs.subAvg[0] ? 'Strongest: ' + SJ[rs.subAvg[0].k].name : ''}</div></div>
      <div class="stat glass-2 c-4"><div class="s-l"><span>Homework pending</span></div><div class="s-v">${pendingFor(s.id).length}</div><div class="s-f">${pendingFor(s.id)[0] ? 'Next: ' + esc(pendingFor(s.id)[0].title) : 'Nothing due'}</div></div>
      <div class="stat glass-2 c-4"><div class="s-l"><span>Diary to sign</span></div><div class="s-v" style="color:${unsigned.length ? 'var(--color-accent)' : 'var(--color-ok)'}">${unsigned.length}</div><div class="s-f">${unsigned.length ? `<button class="sbtn gold" data-act="sign-all" data-sid="${s.id}">${IC.sign}Sign all now</button>` : 'You’re up to date.'}</div></div>
    </div>
    <div class="cols">
      <div class="panel glass-2 c-7"><div class="panel-h"><h2>Today’s diary</h2><a href="#/diary">Diary</a></div>${diaryList(today, { sign: true })}</div>
      <div class="panel glass-2 c-5"><div class="panel-h"><h2>Progress</h2><a href="#/results">Results</a></div>${lineChart(rs.byAs, 150)}</div>
    </div>
    <div class="panel glass-2"><div class="panel-h"><h2>Today at school</h2><a href="#/timetable">Timetable</a></div>${timetableStrip(cls)}</div>`;
  };
  V.p_messages = () => {
    const p = db.parents.find((x) => x.id === session.id);
    const s = student(childId); const ct = teacher(klass(s.classId).classTeacher);
    const thread = `${p.id}:${ct.id}`;
    const msgs = db.messages.filter((m) => m.thread === thread).sort((a, b) => a.at - b.at);
    return chatPanel(msgs, `Class teacher · ${ct.name}`, ct.id, thread);
  };
  function chatPanel(msgs, title, to, thread) {
    return `<div class="panel glass-2"><div class="panel-h"><h2>${esc(title)}</h2><span class="live"><i></i>Live</span></div><div class="chat"><div class="chat-log" id="chat-log">${msgs.length ? msgs.map((m) => `<div class="bubble ${m.from === session.id ? 'me' : ''}">${esc(m.text)}<small>${ago(m.at)}</small></div>`).join('') : '<div class="empty">Start the conversation.</div>'}</div>
      <form data-form="msg" data-to="${to}" data-thread="${thread}"><input class="input" name="text" placeholder="Write a message…" autocomplete="off" aria-label="Message"><button class="sbtn primary" type="submit">Send</button></form></div></div>`;
  }

  /* ----- teacher ----- */
  const myClass = () => klass(teacher(session.id).classTeacherOf);
  V.t_dash = () => {
    const t = teacher(session.id), cls = myClass();
    const roster = db.students.filter((s) => s.classId === cls.id);
    const takenToday = roster.every((s) => db.attendance[s.id]?.[todayISO]);
    const presentToday = roster.filter((s) => ['P', 'L'].includes(db.attendance[s.id]?.[todayISO])).length;
    const todaysDiary = db.diary.filter((e) => e.classId === cls.id && e.date === todayISO);
    const signs = todaysDiary.length ? Math.round(todaysDiary.reduce((s, e) => s + Object.keys(db.diarySeen[e.id] || {}).length, 0) / todaysDiary.length) : 0;
    const pendingLeaves = db.leaves.filter((l) => l.status === 'pending' && student(l.studentId).classId === cls.id);
    const threads = [...new Set(db.messages.filter((m) => m.to === session.id || m.from === session.id).map((m) => m.thread))];
    const np = nowPeriod(cls);
    const mine = np.dow ? cls.week[np.dow].map((k, i) => ({ k, i })).filter((x) => x.k === t.subject) : [];
    return `<div class="cols">
      <div class="welcome c-8"><img class="lion" src="assets/img/brand/lion-gold.webp" alt=""><span class="mono" style="font-size:.72rem;letter-spacing:.16em;opacity:.8">TEACHER DESK · ${fmtLong(todayISO).toUpperCase()}</span><h2>Welcome, ${esc(t.name)}.</h2><p>Class teacher of ${esc(cls.name)} · ${esc(SJ[t.subject].name)} · ${esc(cls.campusName)}</p><div class="wl-chips"><span>${roster.length} students</span><span>${mine.length ? mine.length + ' ' + SJ[t.subject].name + (mine.length === 1 ? ' period' : ' periods') + ' today' : 'No ' + SJ[t.subject].name + ' periods today'}</span></div></div>
      <div class="stat glass-2 c-4"><div class="s-l"><span>Attendance today</span></div><div class="s-v">${takenToday ? presentToday + '/' + roster.length : '—'}</div><div class="s-f">${takenToday ? 'Roll call saved' : `<a href="#/attendance" class="sbtn primary" style="margin-top:6px">${IC.roll}Take roll call</a>`}</div></div>
    </div>
    <div class="cols">
      <div class="stat glass-2 c-4"><div class="s-l"><span>Diary sign-offs today</span></div><div class="s-v">${todaysDiary.length ? signs + '/' + roster.length : '—'}</div><div class="s-f">parents per entry, on average</div></div>
      <div class="stat glass-2 c-4"><div class="s-l"><span>Leave requests</span></div><div class="s-v" style="color:${pendingLeaves.length ? 'var(--color-accent)' : 'inherit'}">${pendingLeaves.length}</div><div class="s-f">${pendingLeaves.length ? '<a href="#/attendance" style="color:var(--color-accent);font-weight:700">Review now</a>' : 'None pending'}</div></div>
      <div class="stat glass-2 c-4"><div class="s-l"><span>Parent conversations</span></div><div class="s-v">${threads.length}</div><div class="s-f"><a href="#/messages" style="color:var(--color-accent);font-weight:700">Open messages</a></div></div>
    </div>
    <div class="cols">
      <div class="panel glass-2 c-7"><div class="panel-h"><h2>Post to today’s diary</h2><span class="live"><i></i>Parents see it instantly</span></div>${diaryForm(cls)}</div>
      <div class="panel glass-2 c-5"><div class="panel-h"><h2>Today in ${esc(cls.id)}</h2><a href="#/diary">Diary</a></div>${diaryList(todaysDiary, { teacher: true })}</div>
    </div>
    <div class="panel glass-2"><div class="panel-h"><h2>Class timetable</h2><span class="sub">Your ${SJ[t.subject].name} periods are highlighted</span></div>${timetableGrid(cls, t.subject)}</div>`;
  };
  function diaryForm(cls) {
    const t = teacher(session.id);
    return `<form data-form="diary" class="form-grid">
      <div class="field"><label for="df-sub">Subject</label><select class="input" id="df-sub" name="subject">${subjectsOf(cls).map((k) => `<option value="${k}" ${k === t.subject ? 'selected' : ''}>${SJ[k].name}</option>`).join('')}</select></div>
      <div class="field"><label for="df-type">Type</label><select class="input" id="df-type" name="type"><option value="homework">Homework</option><option value="classwork">Classwork</option><option value="reminder">Reminder</option></select></div>
      <div class="field full"><label for="df-text">Entry</label><textarea class="input" id="df-text" name="text" rows="2" placeholder="e.g. Exercise 8.1, questions 1–10" required></textarea><span class="err"></span></div>
      <div class="field"><label for="df-date">Diary date</label><input class="input" id="df-date" type="date" name="date" value="${todayISO}"></div>
      <div class="field"><label for="df-due">Due</label><input class="input" id="df-due" type="date" name="due" value="${iso(nextSchoolDay(TODAY))}"></div>
      <div class="full"><button class="sbtn primary" type="submit">${IC.plus}Post to ${esc(cls.id)} diary</button></div>
    </form>`;
  }
  V.t_diary = () => {
    const cls = myClass();
    const entries = db.diary.filter((e) => e.classId === cls.id && e.date === selDay).sort((a, b) => a.at - b.at);
    return `<div class="cols"><div class="panel glass-2 c-5"><div class="panel-h"><h2>New diary entry</h2></div>${diaryForm(cls)}</div>
      <div class="panel glass-2 c-7"><div class="panel-h"><div><h2>${esc(cls.name)} diary</h2><div class="sub">${fmtLong(selDay)}</div></div></div>${dayStrip(selDay, cls)}<div style="margin-top:12px">${diaryList(entries, { teacher: true })}</div></div></div>`;
  };
  let openAssign = null;
  V.t_assign = () => {
    const cls = myClass(); const t = teacher(session.id);
    const roster = db.students.filter((s) => s.classId === cls.id);
    const list = db.assignments.filter((a) => a.classId === cls.id).sort((a, b) => b.due.localeCompare(a.due));
    const a = list.find((x) => x.id === openAssign);
    return `<div class="cols">
      <div class="panel glass-2 c-5"><div class="panel-h"><h2>Set an assignment</h2></div>
        <form data-form="assign" class="form-grid">
          <div class="field full"><label for="af-t">Title</label><input class="input" id="af-t" name="title" required placeholder="e.g. Quadratic equations, set 2"><span class="err"></span></div>
          <div class="field"><label for="af-s">Subject</label><select class="input" id="af-s" name="subject">${subjectsOf(cls).map((k) => `<option value="${k}" ${k === t.subject ? 'selected' : ''}>${SJ[k].name}</option>`).join('')}</select></div>
          <div class="field"><label for="af-m">Out of</label><input class="input" id="af-m" name="max" type="number" min="1" value="20"></div>
          <div class="field full"><label for="af-d">Instructions</label><textarea class="input" id="af-d" name="details" rows="3"></textarea></div>
          <div class="field"><label for="af-due">Due date</label><input class="input" id="af-due" name="due" type="date" value="${iso(nextSchoolDay(TODAY, 3))}"></div>
          <div class="field" style="align-content:end"><button class="sbtn primary" type="submit">${IC.plus}Publish</button></div>
        </form></div>
      <div class="panel glass-2 c-7"><div class="panel-h"><h2>Assignments · ${esc(cls.id)}</h2></div><div class="list">${list.map((x) => { const subs = roster.filter((s) => db.submissions[x.id + ':' + s.id]).length; return `<div class="li">${sj(x.subject)}<div><div class="li-t">${esc(x.title)}</div><div class="li-m"><span>Due ${fmt(x.due)}</span><span>${subs}/${roster.length} submitted</span></div></div><button class="sbtn ${openAssign === x.id ? 'gold' : ''}" data-act="open-assign" data-id="${x.id}">${openAssign === x.id ? 'Open' : 'Review'}</button></div>`; }).join('')}</div></div>
    </div>
    ${a ? `<div class="panel glass-2"><div class="panel-h"><div><h2>${esc(a.title)}</h2><div class="sub">Enter marks out of ${a.max} and save — students and parents see them immediately.</div></div><button class="sbtn primary" data-act="save-assign-marks" data-id="${a.id}">${IC.check}Save marks</button></div><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Roll</th><th>Student</th><th>Status</th><th>Marks</th></tr></thead><tbody>${roster.map((s) => { const sub = db.submissions[a.id + ':' + s.id]; return `<tr><td class="mono">${pad(s.roll)}</td><td><b>${esc(s.name)}</b></td><td>${sub ? `<span class="pill ok">${sub.status}</span>` : a.due < todayISO ? '<span class="pill bad">missing</span>' : '<span class="pill mute">not yet</span>'}</td><td><input class="input marks-input" type="number" min="0" max="${a.max}" data-am="${s.id}" value="${sub?.marks ?? ''}" aria-label="Marks for ${esc(s.name)}"></td></tr>`; }).join('')}</tbody></table></div></div>` : ''}`;
  };
  let rollDraft = null;
  V.t_attendance = () => {
    const cls = myClass(); const roster = db.students.filter((s) => s.classId === cls.id);
    if (!rollDraft) { rollDraft = {}; roster.forEach((s) => { rollDraft[s.id] = db.attendance[s.id]?.[todayISO] || 'P'; }); }
    const leaves = db.leaves.filter((l) => student(l.studentId).classId === cls.id).sort((a, b) => b.at - a.at);
    const saved = roster.every((s) => db.attendance[s.id]?.[todayISO]);
    const counts = { P: 0, A: 0, L: 0, V: 0 }; Object.values(rollDraft).forEach((v) => { counts[v] = (counts[v] || 0) + 1; });
    return `<div class="cols">
      <div class="panel glass-2 c-7"><div class="panel-h"><div><h2>Roll call · ${esc(cls.name)}</h2><div class="sub">${fmtLong(todayISO)} · ${saved ? 'Saved — edit and save again to correct' : 'Not saved yet'}</div></div><div style="display:flex;gap:8px;flex-wrap:wrap"><span class="pill ok">${counts.P} P</span><span class="pill warn">${counts.L} L</span><span class="pill bad">${counts.A} A</span><button class="sbtn primary" data-act="save-roll" ${isSchoolDay(TODAY) ? '' : 'disabled'}>${IC.check}Save attendance</button></div></div>
        ${isSchoolDay(TODAY) ? `<div class="roll">${roster.map((s) => `<div class="roll-row"><span class="avatar sm">${initials(s.name)}</span><div><b style="font-size:.92rem">${esc(s.name)}</b><div class="ink-3" style="font-size:.72rem">Roll ${pad(s.roll)} · ${esc(s.house)}</div></div><div class="seg" role="group" aria-label="Attendance for ${esc(s.name)}">${['P', 'L', 'A'].map((v) => `<button type="button" data-act="roll" data-sid="${s.id}" data-v="${v}" aria-pressed="${rollDraft[s.id] === v}">${{ P: 'Present', L: 'Late', A: 'Absent' }[v]}</button>`).join('')}${rollDraft[s.id] === 'V' ? '<span class="pill" style="background:color-mix(in oklch,var(--brand-blue) 18%,transparent);color:var(--brand-blue)">Leave</span>' : ''}</div></div>`).join('')}</div>` : '<div class="empty">No school today.</div>'}</div>
      <div class="panel glass-2 c-5"><div class="panel-h"><h2>Leave requests</h2></div>${leaves.length ? `<div class="list">${leaves.map((l) => `<div class="li"><span class="avatar sm">${initials(student(l.studentId).name)}</span><div><div class="li-t">${esc(student(l.studentId).name)}</div><div class="li-d">${esc(l.reason)}</div><div class="li-m"><span>${fmt(l.from)}${l.to !== l.from ? ' – ' + fmt(l.to) : ''}</span><span>${ago(l.at)}</span></div></div><div class="li-r">${l.status === 'pending' ? `<button class="sbtn" data-act="leave" data-id="${l.id}" data-v="declined">Decline</button><button class="sbtn primary" data-act="leave" data-id="${l.id}" data-v="approved">Approve</button>` : `<span class="pill ${l.status === 'approved' ? 'ok' : 'bad'}">${l.status}</span>`}</div></div>`).join('')}</div>` : '<div class="empty">No requests.</div>'}</div>
    </div>`;
  };
  let marksDraft = null;
  V.t_marks = () => {
    const cls = myClass(); const t = teacher(session.id); const roster = db.students.filter((s) => s.classId === cls.id);
    const mine = db.assessments.sort((a, b) => b.date.localeCompare(a.date));
    return `<div class="panel glass-2"><div class="panel-h"><div><h2>Enter marks</h2><div class="sub">Publishing adds the marks to every student’s results and their parents’ progress charts.</div></div></div>
      <form data-form="marks"><div class="form-grid" style="grid-template-columns:repeat(4,minmax(0,1fr))">
        <div class="field"><label for="mk-n">Assessment</label><input class="input" id="mk-n" name="name" value="${esc(marksDraft?.name || 'November class test')}" required></div>
        <div class="field"><label for="mk-s">Subject</label><select class="input" id="mk-s" name="subject">${subjectsOf(cls).map((k) => `<option value="${k}" ${k === (marksDraft?.subject || t.subject) ? 'selected' : ''}>${SJ[k].name}</option>`).join('')}</select></div>
        <div class="field"><label for="mk-m">Out of</label><input class="input" id="mk-m" name="max" type="number" min="1" value="${marksDraft?.max || 25}"></div>
        <div class="field"><label for="mk-d">Date</label><input class="input" id="mk-d" name="date" type="date" value="${todayISO}"></div>
      </div>
      <div class="tbl-wrap" style="margin-top:12px"><table class="tbl"><thead><tr><th>Roll</th><th>Student</th><th>Marks</th></tr></thead><tbody>${roster.map((s) => `<tr><td class="mono">${pad(s.roll)}</td><td><b>${esc(s.name)}</b></td><td><input class="input marks-input" type="number" min="0" name="m:${s.id}" aria-label="Marks for ${esc(s.name)}"></td></tr>`).join('')}</tbody></table></div>
      <button class="sbtn primary" type="submit" style="margin-top:12px">${IC.check}Publish marks</button></form></div>
      <div class="panel glass-2"><div class="panel-h"><h2>Published assessments</h2></div><div class="list">${mine.map((a) => `<div class="li"><span class="pill ok">${a.max}</span><div><div class="li-t">${esc(a.name)}</div><div class="li-m"><span>${fmt(a.date, { day: 'numeric', month: 'long' })}</span><span>${new Set(db.results.filter((r) => r.assessment === a.id && student(r.studentId)?.classId === cls.id).map((r) => r.subject)).size} subjects</span></div></div><span></span></div>`).join('')}</div></div>`;
  };
  V.t_notes = () => {
    const cls = myClass(); const t = teacher(session.id);
    return `<div class="cols"><div class="panel glass-2 c-5"><div class="panel-h"><h2>Share notes</h2></div>
      <form data-form="note" class="form-grid">
        <div class="field full"><label for="nf-t">Title</label><input class="input" id="nf-t" name="title" required><span class="err"></span></div>
        <div class="field"><label for="nf-s">Subject</label><select class="input" id="nf-s" name="subject">${subjectsOf(cls).map((k) => `<option value="${k}" ${k === t.subject ? 'selected' : ''}>${SJ[k].name}</option>`).join('')}</select></div>
        <div class="field"><label for="nf-k">Type</label><select class="input" id="nf-k" name="kind"><option>Notes</option><option>Worksheet</option><option>Past paper</option><option>Video</option></select></div>
        <div class="field full"><label for="nf-b">Description</label><textarea class="input" id="nf-b" name="body" rows="3"></textarea></div>
        <div class="field full"><label for="nf-u">Link (Drive, YouTube, PDF)</label><input class="input" id="nf-u" name="url" type="url" placeholder="https://"></div>
        <div class="full"><button class="sbtn primary" type="submit">${IC.plus}Share with ${esc(cls.id)}</button></div>
      </form></div>
      <div class="c-7">${V.s_notes(db.students.find((s) => s.classId === cls.id).id)}</div></div>`;
  };
  V.t_notices = () => {
    const cls = myClass();
    const list = db.notices.filter((n) => n.scope === 'all' || n.scope === 'class:' + cls.id || n.scope === 'campus:' + cls.campus).sort((a, b) => b.at - a.at);
    const parentsCount = new Set(db.students.filter((s) => s.classId === cls.id).flatMap((s) => parentOf(s.id).map((p) => p.id))).size;
    return `<div class="cols"><div class="panel glass-2 c-5"><div class="panel-h"><h2>Post a notice</h2></div>
      <form data-form="notice" class="form-grid">
        <div class="field full"><label>Level</label><div class="seg" role="radiogroup"><label class="sbtn"><input type="radio" name="level" value="notice" checked> Notice</label><label class="sbtn"><input type="radio" name="level" value="event"> Event</label><label class="sbtn"><input type="radio" name="level" value="emergency"> Emergency</label></div></div>
        <div class="field full"><label for="nt-a">Audience</label><select class="input" id="nt-a" name="scope"><option value="class:${cls.id}">${esc(cls.name)} only</option><option value="campus:${cls.campus}">Whole campus · ${esc(cls.campusName)}</option></select></div>
        <div class="field full"><label for="nt-t">Title</label><input class="input" id="nt-t" name="title" required><span class="err"></span></div>
        <div class="field full"><label for="nt-b">Message</label><textarea class="input" id="nt-b" name="body" rows="3" required></textarea><span class="err"></span></div>
        <div class="full"><button class="sbtn red" type="submit">${IC.bell}Send notice</button></div>
      </form><p class="ink-3" style="font-size:.78rem;margin-top:10px">Emergency notes ring on every student and parent screen and ask parents to acknowledge.</p></div>
      <div class="panel glass-2 c-7"><div class="panel-h"><h2>Recent notices</h2></div><div class="list">${list.map((n) => `<div class="li"><span class="pill ${n.level === 'emergency' ? 'bad' : n.level === 'event' ? 'ok' : 'warn'}">${n.level}</span><div><div class="li-t">${esc(n.title)}</div><div class="li-d">${esc(n.body)}</div><div class="li-m"><span>${esc(n.by)}</span><span>${ago(n.at)}</span></div></div><span class="pill mute">${Object.keys(n.ack).length}/${parentsCount} seen</span></div>`).join('')}</div></div></div>`;
  };
  let openThread = null;
  V.t_messages = () => {
    const cls = myClass();
    const parents = [...new Set(db.students.filter((s) => s.classId === cls.id).flatMap((s) => parentOf(s.id)))];
    const threads = parents.map((p) => { const th = `${p.id}:${session.id}`; const msgs = db.messages.filter((m) => m.thread === th); return { p, th, msgs, last: msgs.sort((a, b) => b.at - a.at)[0] }; });
    openThread = openThread || threads[0]?.th;
    const cur = threads.find((t) => t.th === openThread);
    const kidNames = (p) => p.children.map((c) => student(c)).filter((s) => s.classId === cls.id).map((s) => s.name.split(' ')[0]).join(', ');
    return `<div class="cols"><div class="panel glass-2 c-4"><div class="panel-h"><h2>Parents</h2></div><div class="list">${threads.length ? threads.map((t) => `<button class="li" style="text-align:left;width:100%;${t.th === openThread ? 'background:var(--glass-2);border-radius:14px' : ''}" data-act="thread" data-id="${t.th}"><span class="avatar sm">${initials(t.p.name)}</span><div><div class="li-t">${esc(t.p.name)}</div><div class="li-m"><span>Parent of ${esc(kidNames(t.p))}</span></div><div class="li-d" style="font-size:.8rem">${t.last ? esc(t.last.text.slice(0, 60)) : 'No messages yet'}</div></div><span></span></button>`).join('') : '<div class="empty">No parents linked yet.</div>'}</div></div>
      <div class="c-8">${cur ? chatPanel(cur.msgs.sort((a, b) => a.at - b.at), cur.p.name, cur.p.id, cur.th) : ''}</div></div>`;
  };

  /* ---------- role configuration ---------- */
  const ROLES = {
    student: [
      { id: 'today', label: 'Today', icon: 'home', v: () => V.s_today(session.id) },
      { id: 'diary', label: 'Diary', icon: 'diary', v: () => V.s_diary(session.id) },
      { id: 'timetable', label: 'Timetable', icon: 'clock', v: () => V.s_timetable(session.id) },
      { id: 'assignments', label: 'Assignments', icon: 'task', v: () => V.s_assignments(session.id), badge: () => pendingFor(session.id).length },
      { id: 'notes', label: 'Notes', icon: 'book', v: () => V.s_notes(session.id) },
      { id: 'results', label: 'Results', icon: 'chart', v: () => V.s_results(session.id) },
      { id: 'attendance', label: 'Attendance', icon: 'cal', v: () => V.s_attendance(session.id) },
      { id: 'notices', label: 'Notices', icon: 'bell', v: () => V.s_notices(session.id), badge: () => noticesFor(session.id).filter((n) => Date.now() - n.at < 864e5).length }
    ],
    parent: [
      { id: 'today', label: 'Overview', icon: 'home', v: () => V.p_overview() },
      { id: 'diary', label: 'Diary', icon: 'diary', v: () => V.s_diary(childId, { sign: true }), badge: () => db.diary.filter((e) => e.classId === student(childId).classId && e.date <= todayISO && !(db.diarySeen[e.id] || {})[session.id]).length },
      { id: 'results', label: 'Progress', icon: 'chart', v: () => V.s_results(childId) },
      { id: 'attendance', label: 'Attendance', icon: 'cal', v: () => V.s_attendance(childId, { canApply: true }) },
      { id: 'assignments', label: 'Homework', icon: 'task', v: () => V.s_assignments(childId, { readOnly: true }) },
      { id: 'timetable', label: 'Timetable', icon: 'clock', v: () => V.s_timetable(childId) },
      { id: 'notices', label: 'Notices', icon: 'bell', v: () => V.s_notices(childId), badge: () => noticesFor(childId).filter((n) => !n.ack[session.id] && Date.now() - n.at < 3 * 864e5).length },
      { id: 'messages', label: 'Messages', icon: 'chat', v: () => V.p_messages() }
    ],
    teacher: [
      { id: 'today', label: 'Dashboard', icon: 'home', v: () => V.t_dash() },
      { id: 'diary', label: 'Diary', icon: 'diary', v: () => V.t_diary() },
      { id: 'attendance', label: 'Attendance', icon: 'roll', v: () => V.t_attendance(), badge: () => db.leaves.filter((l) => l.status === 'pending' && student(l.studentId).classId === myClass().id).length },
      { id: 'assignments', label: 'Assignments', icon: 'task', v: () => V.t_assign() },
      { id: 'marks', label: 'Marks', icon: 'grade', v: () => V.t_marks() },
      { id: 'notes', label: 'Notes', icon: 'book', v: () => V.t_notes() },
      { id: 'notices', label: 'Notices', icon: 'bell', v: () => V.t_notices() },
      { id: 'messages', label: 'Messages', icon: 'chat', v: () => V.t_messages() }
    ]
  };

  /* ---------- auth screen ---------- */
  const root = $('#portal-root');
  let loginRole = ['student', 'parent', 'teacher'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'student';
  const DEMO = { student: { id: 'CS-26-0917', label: 'Ayaan · Grade 9' }, parent: { id: 'P-1001', label: 'Mrs. Siddiqui · 2 children' }, teacher: { id: 'T-301', label: 'Ms. Hira · Class 9-A' } };
  function renderLogin() {
    doc.title = 'Sign in · Credo Parent & Student Portal';
    root.innerHTML = `<div class="auth">
      <aside class="auth-side">
        <img class="bg" src="assets/img/photos/college-highfive.webp" alt="">
        <a class="brand" href="./" style="color:var(--white)"><img src="assets/img/brand/lion-gold.webp" alt="" width="40"><span class="brand-word"><b>CREDO</b><small style="color:oklch(85% .03 270)">Portal</small></span></a>
        <div><h1>Every school day, <span>connected.</span></h1>
          <ul><li>${IC.check}Daily diary — parents sign with one tap</li><li>${IC.check}Timetable with the current period live</li><li>${IC.check}Assignments, notes and past papers</li><li>${IC.check}Results, progress charts and attendance</li><li>${IC.check}Emergency notes that ring on every screen</li></ul></div>
        <p style="font-size:.78rem;color:oklch(80% .03 270)">${esc(CFG.sessionLabel || '')} · Credo School &amp; College Network</p>
      </aside>
      <main class="auth-main" id="main">
        <form class="auth-card glass-3 gold-edge" id="login" novalidate>
          <div><span class="eyebrow">Parent &amp; Student Portal</span><h2 style="margin-top:8px">Sign in</h2></div>
          <div class="role-switch" role="radiogroup" aria-label="I am a">${['student', 'parent', 'teacher'].map((r) => `<button type="button" role="radio" aria-checked="${r === loginRole}" data-role="${r}">${r[0].toUpperCase() + r.slice(1)}</button>`).join('')}</div>
          <div class="field"><label for="lg-id">${loginRole === 'student' ? 'Student ID' : loginRole === 'parent' ? 'Parent ID' : 'Staff ID'}</label><input class="input" id="lg-id" name="id" autocomplete="username" placeholder="${DEMO[loginRole].id}" required><span class="err"></span></div>
          <div class="field"><label for="lg-pw">Password</label><div class="pw-wrap"><input class="input" id="lg-pw" name="pw" type="password" autocomplete="current-password" required><button type="button" data-act="peek" aria-label="Show password">${IC.eye}</button></div><span class="err"></span></div>
          <button class="btn btn-primary" type="submit" style="justify-content:space-between">Sign in<span class="ic">${I.arrow}</span></button>
          ${CFG.mode === 'preview' ? `<div class="demo-box"><b>Preview mode — sample data on this device only.</b><span>Try each role, or open two tabs (teacher + parent) and watch posts sync live. Password for every demo account: <span class="mono">credo123</span></span><div class="demo-list">${Object.entries(DEMO).map(([r, d]) => `<button type="button" data-demo="${r}">${d.label}</button>`).join('')}</div></div>` : ''}
          <p class="ink-3" style="font-size:.78rem">Forgot your ID or password? Contact your campus office. <a href="./" class="link">Back to website</a></p>
        </form>
      </main>
    </div>`;
    $('.role-switch').addEventListener('click', (e) => { const b = e.target.closest('[data-role]'); if (!b) return; loginRole = b.dataset.role; C.sfx.tap(); renderLogin(); $('#lg-id').focus(); });
    $('#login').addEventListener('click', (e) => {
      const d = e.target.closest('[data-demo]'); if (d) { loginRole = d.dataset.demo; renderLogin(); $('#lg-id').value = DEMO[loginRole].id; $('#lg-pw').value = 'credo123'; $('#login').requestSubmit(); }
      const pk = e.target.closest('[data-act="peek"]'); if (pk) { const i = $('#lg-pw'); i.type = i.type === 'password' ? 'text' : 'password'; }
    });
    $('#login').addEventListener('submit', (e) => {
      e.preventDefault();
      const id = $('#lg-id').value.trim().toUpperCase(); const pw = $('#lg-pw').value;
      const pool = loginRole === 'student' ? db.students : loginRole === 'parent' ? db.parents : db.teachers;
      const acct = pool.find((a) => a.id === id && a.pass);
      const idErr = $('#lg-id').closest('.field').querySelector('.err'), pwErr = $('#lg-pw').closest('.field').querySelector('.err');
      idErr.textContent = ''; pwErr.textContent = '';
      if (!id) { idErr.textContent = 'Enter your ID.'; $('#lg-id').setAttribute('aria-invalid', 'true'); C.sfx.error(); return; }
      if (!acct) { idErr.textContent = `No ${loginRole} account with that ID.`; $('#lg-id').setAttribute('aria-invalid', 'true'); C.sfx.error(); return; }
      if (acct.pass !== pw) { pwErr.textContent = 'That password doesn’t match.'; $('#lg-pw').setAttribute('aria-invalid', 'true'); C.sfx.error(); return; }
      const btn = $('#login button[type="submit"]'); btn.classList.add('is-loading');
      setTimeout(() => {
        session = { role: loginRole, id: acct.id }; localStorage.setItem(SKEY, JSON.stringify(session));
        childId = null; location.hash = '#/today'; C.sfx.success(); render();
      }, 420);
    });
  }

  /* ---------- shell ---------- */
  function who() {
    if (session.role === 'teacher') { const t = teacher(session.id); return { name: t.name, sub: `${SJ[t.subject].name} · ${t.classTeacherOf}` }; }
    if (session.role === 'parent') { const p = db.parents.find((x) => x.id === session.id); return { name: p.name, sub: `${p.children.length} children` }; }
    const s = student(session.id); return { name: s.name, sub: `${klass(s.classId).name}` };
  }
  function render() {
    if (!session || !(session.role in ROLES)) { renderLogin(); return; }
    const acctOk = session.role === 'teacher' ? teacher(session.id) : session.role === 'parent' ? db.parents.find((p) => p.id === session.id) : student(session.id);
    if (!acctOk) { session = null; localStorage.removeItem(SKEY); renderLogin(); return; }
    if (session.role === 'parent' && !childId) childId = db.parents.find((p) => p.id === session.id).children[0];
    const views = ROLES[session.role];
    const route = (location.hash.match(/^#\/(\w+)/) || [])[1] || 'today';
    const cur = views.find((v) => v.id === route) || views[0];
    const w = who();
    const kids = session.role === 'parent' ? db.parents.find((p) => p.id === session.id).children.map(student) : [];
    const bellCount = session.role === 'teacher' ? 0 : noticesFor(session.role === 'parent' ? childId : session.id).filter((n) => Date.now() - n.at < 864e5).length;
    doc.title = `${cur.label} · Credo Portal`;
    const keepScroll = root.querySelector('.app') ? scrollY : 0;
    root.innerHTML = `<div class="app" id="app">
      <aside class="side"><div class="side-in glass-3">
        <a class="brand" href="./"><img class="brand-lion" src="assets/img/brand/${doc.documentElement.dataset.theme === 'dark' ? 'lion-gold' : 'lion-navy'}.webp" alt="" width="36"><span class="brand-word"><b>CREDO</b><small>Portal</small></span></a>
        <div class="side-user"><span class="avatar">${initials(w.name)}</span><div><b>${esc(w.name)}</b><span>${esc(w.sub)}</span><br><span class="role-tag">${session.role}</span></div></div>
        <nav class="side-nav" aria-label="Portal">${views.map((v) => { const b = v.badge ? v.badge() : 0; return `<a href="#/${v.id}" ${v.id === cur.id ? 'aria-current="page"' : ''}>${IC[v.icon]}${v.label}${b ? `<span class="badge">${b}</span>` : ''}</a>`; }).join('')}</nav>
        <div class="side-foot">
          ${CFG.mode === 'preview' ? `<div class="preview-flag"><b>Preview mode.</b> Sample data saved in this browser. <button class="link" data-act="reset" style="font-size:inherit">Reset sample data</button></div>` : ''}
          <div class="row"><button class="icon-btn" data-theme-toggle aria-label="Switch theme">${I.moon}${I.sun}</button><button class="icon-btn" data-sound-toggle aria-pressed="${C.store.get('sound', true)}" aria-label="Sound effects">${I.sound}</button><button class="icon-btn" data-act="logout" aria-label="Sign out" style="margin-left:auto">${IC.out}</button></div>
        </div>
      </div></aside>
      <div class="main">
        <header class="topbar glass-3">
          <button class="icon-btn show-m" data-act="menu" aria-label="Open menu">${IC.menu}</button>
          <div><h1>${cur.label}</h1><div class="date">${fmtLong(todayISO)}</div></div>
          <div class="tb-actions">
            ${kids.length > 1 ? `<div class="child-switch" role="group" aria-label="Choose child">${kids.map((k) => `<button data-act="child" data-id="${k.id}" aria-pressed="${k.id === childId}"><span class="avatar sm">${initials(k.name)}</span><span>${esc(k.name.split(' ')[0])} · ${esc(klass(k.classId).name.split(' · ')[0])}</span></button>`).join('')}</div>` : ''}
            <span class="live hide-m" title="Updates from teachers appear instantly"><i></i>Live</span>
            ${session.role !== 'teacher' ? `<a class="icon-btn bell" href="#/notices" aria-label="Notices">${IC.bell}${bellCount ? '<span class="pip"></span>' : ''}</a>` : ''}
          </div>
        </header>
        <div class="view" id="main">${cur.v()}</div>
      </div>
      <nav class="tabbar glass-3" aria-label="Quick">${views.slice(0, 4).map((v) => `<a href="#/${v.id}" ${v.id === cur.id ? 'aria-current="page"' : ''}>${IC[v.icon]}${v.label}</a>`).join('')}<a href="#" data-act="menu">${IC.menu}More</a></nav>
    </div>`;
    if (keepScroll) scrollTo(0, keepScroll);
    const log = $('#chat-log'); if (log) log.scrollTop = log.scrollHeight;
  }

  /* ---------- modal ---------- */
  function modal(html, onSubmit) {
    const m = doc.createElement('div'); m.className = 'modal'; m.innerHTML = `<div class="modal-card glass-3" role="dialog" aria-modal="true">${html}</div>`;
    doc.body.appendChild(m); requestAnimationFrame(() => m.classList.add('open'));
    const close = () => { m.classList.remove('open'); setTimeout(() => m.remove(), 250); };
    m.addEventListener('click', (e) => { if (e.target === m || e.target.closest('[data-close]')) close(); });
    m.querySelector('form')?.addEventListener('submit', (e) => { e.preventDefault(); if (onSubmit(new FormData(e.target)) !== false) close(); });
    setTimeout(() => m.querySelector('input,textarea,select')?.focus(), 50);
    return m;
  }

  /* ---------- actions ---------- */
  doc.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]'); if (!el || !session) return;
    const a = el.dataset.act, id = el.dataset.id;
    if (a === 'menu') { e.preventDefault(); $('#app')?.classList.toggle('menu-open'); return; }
    if (a === 'logout') { session = null; localStorage.removeItem(SKEY); rollDraft = null; openThread = null; C.sfx.close(); location.hash = ''; renderLogin(); return; }
    if (a === 'reset') { if (confirmReset()) { localStorage.removeItem(KEY); load(); commit('Sample data was reset'); render(); C.toast('Sample data reset.', 'ok'); } return; }
    if (a === 'child') { childId = id; C.sfx.tap(); render(); return; }
    if (a === 'day') { selDay = el.dataset.d; C.sfx.tap(); render(); return; }
    if (a === 'cal') { calMonth = Math.max(0, calMonth + +el.dataset.v); render(); return; }
    if (a === 'notef') { noteFilter = el.dataset.v; render(); return; }
    if (a === 'sign') { db.diarySeen[id] = { ...(db.diarySeen[id] || {}), [session.id]: Date.now() }; const en = db.diary.find((x) => x.id === id); commit(`${who().name} signed the ${SJ[en.subject].name} diary`, 'teacher:' + klass(en.classId).classTeacher); C.sfx.success(); render(); return; }
    if (a === 'sign-all') { const cls = klass(student(el.dataset.sid).classId); let n = 0; db.diary.filter((x) => x.classId === cls.id && x.date <= todayISO).forEach((x) => { if (!(db.diarySeen[x.id] || {})[session.id]) { db.diarySeen[x.id] = { ...(db.diarySeen[x.id] || {}), [session.id]: Date.now() }; n++; } }); commit(`${who().name} signed ${n} diary entries`, 'teacher:' + cls.classTeacher); C.toast(`Signed ${n} ${n === 1 ? 'entry' : 'entries'}.`, 'ok'); render(); return; }
    if (a === 'ack') { const n = db.notices.find((x) => x.id === id); n.ack[session.id] = Date.now(); commit(`${who().name} acknowledged “${n.title}”`, 'teacher'); C.sfx.success(); render(); return; }
    if (a === 'submit') {
      const as = db.assignments.find((x) => x.id === id);
      modal(`<h2>Mark “${esc(as.title)}” as submitted</h2><p class="ink-2" style="font-size:.9rem">Hand in the work as your teacher asked. Add a note if needed.</p><form><div class="field" style="margin-top:12px"><label for="sn">Note to teacher (optional)</label><input class="input" id="sn" name="note" placeholder="e.g. Submitted in class"></div><div class="modal-actions"><button type="button" class="sbtn" data-close>Cancel</button><button class="sbtn primary" type="submit">${IC.check}Confirm</button></div></form>`, (fd) => {
        db.submissions[id + ':' + session.id] = { status: as.due < todayISO ? 'late' : 'submitted', at: Date.now(), note: fd.get('note') || '' };
        commit(`${who().name} submitted “${as.title}”`, 'teacher:' + as.teacherId); C.toast('Marked as submitted.', 'ok'); render();
      });
      return;
    }
    if (a === 'leave-new') {
      const sid = el.dataset.sid;
      modal(`<h2>Apply for leave · ${esc(student(sid).name)}</h2><form><div class="form-grid"><div class="field"><label for="lf">From</label><input class="input" id="lf" type="date" name="from" value="${iso(nextSchoolDay(TODAY))}" required></div><div class="field"><label for="lt">To</label><input class="input" id="lt" type="date" name="to" value="${iso(nextSchoolDay(TODAY))}" required></div><div class="field full"><label for="lr">Reason</label><textarea class="input" id="lr" name="reason" rows="3" required></textarea></div></div><div class="modal-actions"><button type="button" class="sbtn" data-close>Cancel</button><button class="sbtn primary" type="submit">Send to class teacher</button></div></form>`, (fd) => {
        if (!fd.get('reason').trim()) { C.toast('Please add a reason.', 'err'); return false; }
        if (fd.get('to') < fd.get('from')) { C.toast('The end date is before the start date.', 'err'); return false; }
        db.leaves.push({ id: 'l' + Date.now(), studentId: sid, parentId: session.id, from: fd.get('from'), to: fd.get('to'), reason: fd.get('reason'), status: 'pending', at: Date.now() });
        commit(`Leave request for ${student(sid).name}`, 'teacher:' + klass(student(sid).classId).classTeacher); C.toast('Leave request sent to the class teacher.', 'ok'); render();
      });
      return;
    }
    if (a === 'leave') {
      const l = db.leaves.find((x) => x.id === id); l.status = el.dataset.v;
      if (l.status === 'approved') for (let d = parse(l.from); d <= parse(l.to); d = addDays(d, 1)) if (isSchoolDay(d)) { db.attendance[l.studentId][iso(d)] = 'V'; if (iso(d) === todayISO && rollDraft) rollDraft[l.studentId] = 'V'; }
      commit(`Leave for ${student(l.studentId).name} ${l.status}`, l.studentId + ' ' + l.parentId); C.sfx.success(); render(); return;
    }
    if (a === 'roll') { rollDraft[el.dataset.sid] = el.dataset.v; C.sfx.tap(); render(); return; }
    if (a === 'save-roll') {
      const cls = myClass(); Object.entries(rollDraft).forEach(([sid, v]) => { db.attendance[sid] = db.attendance[sid] || {}; db.attendance[sid][todayISO] = v; });
      const ab = Object.values(rollDraft).filter((v) => v === 'A').length;
      commit(`Attendance for ${cls.name} saved`, 'class:' + cls.id); C.toast(`Attendance saved · ${ab} absent.`, 'ok'); render(); return;
    }
    if (a === 'open-assign') { openAssign = openAssign === id ? null : id; render(); return; }
    if (a === 'save-assign-marks') {
      const as = db.assignments.find((x) => x.id === id); let n = 0, bad = false;
      doc.querySelectorAll('[data-am]').forEach((inp) => { if (inp.value === '') return; const v = +inp.value; if (v < 0 || v > as.max) { inp.setAttribute('aria-invalid', 'true'); bad = true; return; } const k = id + ':' + inp.dataset.am; db.submissions[k] = { ...(db.submissions[k] || { status: 'submitted', at: Date.now(), note: '' }), marks: v }; n++; });
      if (bad) { C.toast(`Marks must be between 0 and ${as.max}.`, 'err'); return; }
      commit(`Marks for “${as.title}” are out`, 'class:' + as.classId); C.toast(`Saved marks for ${n} students.`, 'ok'); render(); return;
    }
    if (a === 'del-diary') {
      const en = db.diary.find((x) => x.id === id); const idx = db.diary.indexOf(en); db.diary.splice(idx, 1); commit(null); render();
      C.toast(`Entry removed. <button class="link" id="undo" style="color:var(--color-accent)">Undo</button>`);
      setTimeout(() => $('#undo')?.addEventListener('click', () => { db.diary.splice(idx, 0, en); commit(`${SJ[en.subject].name} diary entry restored`, 'class:' + en.classId); render(); }), 0);
      return;
    }
    if (a === 'thread') { openThread = id; render(); return; }
  });
  function confirmReset() { return window.confirm('Reset all sample portal data in this browser?'); }
  doc.addEventListener('input', (e) => {
    if (e.target.matches('[data-act="noteq"]')) { noteQ = e.target.value; const pos = e.target.selectionStart; render(); const i = $('[data-act="noteq"]'); i.focus(); i.setSelectionRange(pos, pos); }
  });
  doc.addEventListener('submit', (e) => {
    const f = e.target.closest('[data-form]'); if (!f || !session) return;
    e.preventDefault();
    const fd = new FormData(f); const kind = f.dataset.form;
    const need = (name) => { const el = f.querySelector(`[name="${name}"]`); const ok = !!String(fd.get(name) || '').trim(); el.setAttribute('aria-invalid', !ok); const er = el.closest('.field')?.querySelector('.err'); if (er) er.textContent = ok ? '' : 'Required.'; return ok; };
    if (kind === 'diary') {
      if (!need('text')) { C.sfx.error(); return; }
      const cls = myClass();
      const en = { id: 'd-' + Date.now(), classId: cls.id, date: fd.get('date') || todayISO, subject: fd.get('subject'), teacherId: session.id, type: fd.get('type'), text: fd.get('text').trim(), due: fd.get('due') || iso(nextSchoolDay(TODAY)), at: Date.now() };
      db.diary.push(en); selDay = en.date;
      commit(`New ${SJ[en.subject].name} diary entry for ${cls.id}`, 'class:' + cls.id);
      C.toast('Posted to the diary — students and parents can see it now.', 'ok'); render();
    }
    if (kind === 'assign') {
      if (!need('title')) { C.sfx.error(); return; }
      const cls = myClass();
      const as = { id: 'a' + Date.now(), classId: cls.id, subject: fd.get('subject'), teacherId: session.id, title: fd.get('title').trim(), details: fd.get('details').trim() || '—', due: fd.get('due'), max: Math.max(1, +fd.get('max') || 20) };
      db.assignments.push(as); commit(`New assignment: ${as.title}`, 'class:' + cls.id); C.toast('Assignment published.', 'ok'); render();
    }
    if (kind === 'note') {
      if (!need('title')) { C.sfx.error(); return; }
      const cls = myClass(); const url = (fd.get('url') || '').trim();
      if (url && !/^https?:\/\//i.test(url)) { C.toast('Links must start with https://', 'err'); return; }
      db.notes.push({ id: 'n' + Date.now(), classId: cls.id, subject: fd.get('subject'), kind: fd.get('kind'), title: fd.get('title').trim(), body: fd.get('body').trim(), url, teacherId: session.id, at: Date.now() });
      commit(`New ${fd.get('kind').toLowerCase()}: ${fd.get('title').trim()}`, 'class:' + cls.id); C.toast('Shared with the class.', 'ok'); render();
    }
    if (kind === 'notice') {
      if (!need('title') | !need('body')) { C.sfx.error(); return; }
      const n = { id: 'x' + Date.now(), level: fd.get('level'), scope: fd.get('scope'), title: fd.get('title').trim(), body: fd.get('body').trim(), at: Date.now(), by: teacher(session.id).name, ack: {} };
      db.notices.push(n); commit(`${n.level === 'emergency' ? 'EMERGENCY · ' : ''}${n.title}`, n.scope); C.toast(n.level === 'emergency' ? 'Emergency note sent to every student and parent.' : 'Notice posted.', 'ok'); render();
    }
    if (kind === 'marks') {
      const cls = myClass(); const max = Math.max(1, +fd.get('max') || 25); const subject = fd.get('subject');
      const entries = [...fd.entries()].filter(([k, v]) => k.startsWith('m:') && v !== '');
      if (!entries.length) { C.toast('Enter at least one student’s marks.', 'err'); return; }
      if (entries.some(([, v]) => +v < 0 || +v > max)) { C.toast(`Marks must be between 0 and ${max}.`, 'err'); return; }
      const name = fd.get('name').trim() || 'Class test';
      let as = db.assessments.find((a) => a.name === name);
      if (!as) { as = { id: 'as' + Date.now(), name, date: fd.get('date') || todayISO, max, published: true }; db.assessments.push(as); }
      entries.forEach(([k, v]) => { const sid = k.slice(2); db.results = db.results.filter((r) => !(r.studentId === sid && r.assessment === as.id && r.subject === subject)); db.results.push({ studentId: sid, assessment: as.id, subject, marks: +v, max }); });
      marksDraft = { name, subject, max };
      commit(`${SJ[subject].name} marks published: ${name}`, 'class:' + cls.id); C.toast(`Published ${entries.length} results.`, 'ok'); render();
    }
    if (kind === 'msg') {
      const text = (fd.get('text') || '').trim(); if (!text) return;
      db.messages.push({ id: 'm' + Date.now(), thread: f.dataset.thread, from: session.id, to: f.dataset.to, text, at: Date.now() });
      commit(`New message from ${who().name}`, f.dataset.to); C.sfx.tap(); render();
      setTimeout(() => $('[data-form="msg"] input')?.focus(), 0);
    }
  });
  addEventListener('hashchange', () => { if (session) { $('#app')?.classList.remove('menu-open'); render(); scrollTo(0, 0); } });

  /* ---------- boot ---------- */
  load();
  render();
})();
