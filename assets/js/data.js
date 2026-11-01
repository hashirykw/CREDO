/* ============================================================================
   CREDO SCHOOL & COLLEGE NETWORK · site content
   Every line below comes from Credo's own public websites (credo.edu.pk,
   school., college., preschool., girlsschool.credo.edu.pk) and Credo's
   Skoolify admissions portal, collected 1 Nov 2026. Nothing is estimated.
   Edit here and every page updates.
   ============================================================================ */
(function () {
  const IMG = 'assets/img/';
  const ph = (n) => IMG + 'photos/' + n + '.webp';
  const fac = (i) => IMG + 'faculty/f' + String(i).padStart(2, '0') + '.webp';

  const network = {
    name: 'Credo School & College Network',
    short: 'Credo',
    founded: 2017,
    hashtag: '#WeBelieve',
    meaning: 'The word “Credo” comes from the Latin for creed — belief. That belief drives everything Credo does: belief in its students, their potential, and the future they are destined to create.',
    tagline: 'Building character. Grooming leaders of tomorrow.',
    values: [
      { name: 'Excellence', text: 'Not a goal but the standard. Experienced faculty, modern teaching methods and high expectations that prepare students for top CAIE results and leading universities worldwide.' },
      { name: 'Empowerment', text: 'Mentorship, skill-building workshops and diverse co-curriculars nurture confidence, leadership and responsibility — every student owns their journey.' },
      { name: 'Innovation', text: 'Technology, interactive learning and hands-on experience — from STEM to entrepreneurial ventures — so students think ahead and lead change.' }
    ],
    belief: 'Credo School aspires to bring about a social change through the words and deeds of students which personify consideration for every person, integrity and an all-round discipline in daily life.',
    belief2: 'The examples set by teachers and the management intend to build character and nurture the personality of students; steering them on the path of academic success and instilling leadership, communication and resilient life skills.',
    cambridge: [{ code: 'P6012', name: 'Credo College' }, { code: 'PK741', name: 'Credo School (O Level)' }],
    uan: '03-11-11-CREDO (27336)',
    area: 'Block 7, Gulshan-e-Iqbal, Karachi — near Maskan / Disco Bakers',
    domain: 'https://credoschoolingsystem.nexlyr.solutions',
    skoolify: 'https://credo.skoolify.app/admissions-college/apply',
    session: 'Early Bird Admissions · Session 2027–29'
  };

  const campuses = [
    {
      id: 'college', name: 'Credo College', label: 'A Levels · Head Office', stage: 'AS & A2 Level',
      grades: 'AS · A2', ages: 'Post O Level / Matric', accent: 'gold',
      logo: IMG + 'brand/credo-college.webp', logoDark: true, mark: IMG + 'brand/lion-gold.webp',
      address: 'E-136–141, Main Abul Hasan Isphahani Road, Block 7, Gulshan-e-Iqbal, Karachi',
      phones: ['0339 1127336', '03-11-11-CREDO (27336)'], tel: '+923391127336', whatsapp: '923391127336',
      email: 'info@credo.edu.pk', site: 'https://college.credo.edu.pk', centre: 'P6012',
      social: { instagram: 'https://www.instagram.com/credo_college/', facebook: 'https://www.facebook.com/CredoCollege/', youtube: 'https://www.youtube.com/channel/UCDFXt_cJbX65oLO2g6vaKoQ', x: 'https://twitter.com/college_credo' },
      hero: ph('college-highfive'),
      photos: [ph('college-graduates'), ph('college-student-council'), ph('college-gowns'), ph('college-laptops'), ph('college-orientation'), ph('college-peer-tutoring'), ph('college-stage-night'), ph('college-concert')],
      intro: 'Where potential meets opportunity. A vibrant community where ambition flourishes, curiosity thrives and dreams transform into reality — designed for dreamers, achievers and the leaders of tomorrow.',
      highlights: ['Cambridge AS & A2 across Commerce, Science and Humanities', 'Merit, need, ECA and sports scholarships — 10% to 100% tuition waivers', 'Peer Tutoring, Academic Support Program and aptitude test preparation', 'Academic and career counselling through to university placement', 'Student Council, three houses and the Credo Student Enrichment Program']
    },
    {
      id: 'school', name: 'Credo School', label: 'Middle School & O Levels', stage: 'Grades 6 – 11',
      grades: '6 – 11', ages: 'Middle & O Level', accent: 'crimson',
      logo: IMG + 'brand/credo-school.webp', mark: IMG + 'brand/lion-navy.webp',
      address: 'E-131, Block 7, Gulshan-e-Iqbal, Karachi 75300',
      phones: ['021-34830086', '0310-0002122'], tel: '+922134830086', whatsapp: '923100002122',
      email: 'info@school.credo.edu.pk', site: 'https://school.credo.edu.pk', centre: 'PK741',
      social: { instagram: 'https://www.instagram.com/credogulshan/' },
      hero: ph('school-whiteboard'),
      photos: [ph('school-group'), ph('school-trio'), ph('school-computer-lab'), ph('school-library'), ph('school-podium'), ph('school-projection'), ph('school-guarantee-wall'), ph('school-corridor')],
      intro: 'A safe and productive environment where learning takes place at a fast pace. Every child, irrespective of background, is entitled to quality education — and a rigorous programme here encourages students to think deeply and independently.',
      highlights: ['Science and Commerce streams in O Level classes 9, 10 and 11', 'No-tuition policy: the syllabus restarts from scratch every year', 'Past papers solved and checked in school, not just handed out', 'Mandatory revision workshops after mocks instead of prep leave', 'Life skill modules: PE, AV classes, public speaking, coding & robotics']
    },
    {
      id: 'preschool', name: 'Credo Preschool & Primary', label: 'Early Years & Primary', stage: 'Pre-nursery – Grade 5',
      grades: 'PN – 5', ages: 'Ages 2.5 – 10.5', accent: 'blue',
      logo: IMG + 'brand/credo-preschool.webp', mark: IMG + 'brand/lion-navy.webp',
      address: 'D-175, Block 7, Gulshan-e-Iqbal, Karachi 75300',
      phones: ['0311-1778924', '021-37458051'], tel: '+923111778924', whatsapp: '923111778924',
      email: 'info@preschool.credo.edu.pk', site: 'https://preschool.credo.edu.pk',
      social: { instagram: 'https://www.instagram.com/credopreschoolprimary/', facebook: 'https://www.facebook.com/credopreschoolprimary', youtube: 'https://www.youtube.com/channel/UCLKTRQa9ES8Dabk2toxg-Tw' },
      hero: ph('preschool-learning'),
      photos: [ph('preschool-engaging'), ph('preschool-classroom'), ph('preschool-art-studio'), ph('preschool-library'), ph('preschool-play-area'), ph('preschool-taekwondo'), ph('preschool-sports-day'), ph('preschool-seerat')],
      intro: 'Little steps, big smiles. A holistic education that nurtures body, mind and spirit — inquiry-based, play-based learning in a safe, nurturing and stimulating campus.',
      highlights: ['Pre-nursery, Nursery, Kindergarten and Grades 1–5', 'Learner profiles track each child’s progress', 'Art studio, sensory play area, ICT lab, library and AV room', 'Robotics, Taekwondo, Tajweed and public speaking', 'School clinic with a qualified nurse'],
      visiting: 'Campus visits Monday – Friday, 8:30 am – 12:30 pm'
    },
    {
      id: 'girls', name: 'Credo School Girls Campus', label: 'Girls Campus', stage: 'Cambridge · Girls',
      grades: 'Girls', ages: 'Middle & O Level', accent: 'maroon',
      logo: IMG + 'brand/credo-girls.webp', logoDark: true, mark: IMG + 'brand/lion-navy.webp',
      address: 'Plot D-145, Block 7, Gulshan-e-Iqbal, Karachi 75300',
      phones: ['0332-2423893'], tel: '+923322423893', whatsapp: '923322423893',
      email: 'info@girlsschool.credo.edu.pk', site: 'https://girlsschool.credo.edu.pk',
      social: { instagram: 'https://www.instagram.com/credogirlscampus', facebook: 'https://www.facebook.com/people/Credogirlscampus/61558658987985/' },
      hero: ph('girls-public-speaking'),
      photos: [ph('girls-science-fair'), ph('girls-market-day'), ph('girls-trophy-wall'), ph('girls-corridor'), ph('girls-reading')],
      intro: 'Inspiring girls, empowering futures. A vibrant, inclusive community where girls pursue their passions, explore their potential and become confident leaders of tomorrow.',
      highlights: ['A nurturing environment tailored to the needs of girls', 'Reading Enhancement Program, music, arts & crafts', 'Moral Value Education and Computer Science Unplugged', 'Debate, Community Welfare, Fusion and Sports societies', 'Inter-house debates and English & Urdu Literacy Week'],
    }
  ];

  const leadership = {
    dean: {
      name: 'Air Vice Marshal (R) Syed Razi-ul-Hasan Nawab', honour: 'HI-M', role: 'Dean & Director', img: ph('dean-razi-nawab'),
      message: [
        'After having successfully contributed to Pakistan at the highest national and international levels in multiple fields, I realise that this is a give-back time to society through imparting quality education to the next generation. And Credo gives me that opportunity through a set of talented students, devoted faculty, and involved parents.',
        'Remember, we will attempt to enrich our students to face the multiple situations they are likely to face in their lives ahead.',
        'My advice to all would be to let go of your aims in our hands. Let the “Credo Team” contribute in empowering your child to become a better human being.'
      ]
    },
    founders: [
      { name: 'Rohail Ahmed', role: 'Founding Member · Director · Head of Accounting', img: fac(0),
        quote: 'By the Grace of God, the journey at Credo has been most fulfilling — a continuous learning process based on the very notion of imparting quality education for all. Our students are the future; together let’s mould them into fine learned individuals.' },
      { name: 'Shahab Yakoob', role: 'Founding Member · Director · Mathematics', img: fac(14),
        quote: 'A sphere has no edges. But metaphorically speaking, at Credo we continuously strive to find an edge on the sphere — we aim for perfection in everything we say and do, and improve with each passing day.' },
      { name: 'Sohail Ahmed', role: 'Founding Member · Director · Business', img: fac(4),
        quote: 'We believe in turning challenges into opportunities — just like in the world of business. Our goal is to shape individuals who are academically strong, confident, responsible and ready to lead in the real world.' },
      { name: 'Murtaza Zai', role: 'Founding Member · Economics', img: fac(13),
        quote: 'Each passing year turns out to be beautiful for all of us at Credo. I believe Credo School is destined to etch its name among those few institutes committed to a change that is sustainable — one that will catapult our students and nation towards a brighter tomorrow.' }
    ],
    management: [
      { name: 'AVM (R) Syed Razi Nawab', role: 'Dean & Director' },
      { name: 'Shahab Yakoob', role: 'Director' },
      { name: 'Rohail Ahmed', role: 'Director' },
      { name: 'Sohail Ahmed', role: 'Director' },
      { name: 'Qurat ul Ain', role: 'Managing Director · Preschool & Primary' }
    ]
  };

  /* faculty: [name, subject, department, campus, photo index or null] */
  const F = (name, subject, dept, campus, i) => ({ name, subject, dept, campus, img: i == null ? null : fac(i) });
  const faculty = [
    F('Rohail Ahmed', 'Accounting', 'Commerce', 'college', 0), F('Adeel Paperwala', 'Accounting', 'Commerce', 'college', 1),
    F('Ammar Samana', 'Accounting', 'Commerce', 'college', 2), F('Zeeshan Malik', 'Accounting', 'Commerce', 'college', 3),
    F('Sohail Ahmed', 'Business', 'Commerce', 'college', 4), F('Kamran Abdul Salam', 'Business', 'Commerce', 'college', 5),
    F('Danish Tabassum', 'Business', 'Commerce', 'college', 6), F('Saeed Surti', 'Business', 'Commerce', 'college', 7),
    F('Sajid Kapadia', 'Business', 'Commerce', 'college', 8), F('Qubair Bhoot', 'Business', 'Commerce', 'college', 9),
    F('Asif Farooq', 'Economics', 'Commerce', 'college', 10), F('Anas Sheikh', 'Economics', 'Commerce', 'college', 11),
    F('Daniyal Aslam', 'Economics', 'Commerce', 'college', 12), F('Murtaza Zai', 'Economics', 'Commerce', 'college', 13),
    F('Shahab Yakoob', 'Mathematics', 'Science & Mathematics', 'college', 14), F('Saud Barlas', 'Mathematics', 'Science & Mathematics', 'college', 15),
    F('Shahzaib Latafat', 'Mathematics', 'Science & Mathematics', 'college', 16), F('Yousuf Panwala', 'Mathematics', 'Science & Mathematics', 'college', 17),
    F('Murad Sesodia', 'Mathematics', 'Science & Mathematics', 'college', 18), F('Ahsan Abdullah', 'Mathematics', 'Science & Mathematics', 'college', 19),
    F('Waqas Khan', 'Mathematics', 'Science & Mathematics', 'college', 20), F('Faizan Mirza', 'Biology', 'Science & Mathematics', 'college', 21),
    F('Dr. Yahya Khan', 'Biology', 'Science & Mathematics', 'college', 22), F('Kashan Rashid', 'Physics', 'Science & Mathematics', 'college', 23),
    F('Mehboob Khan', 'Physics', 'Science & Mathematics', 'college', 24), F('Syed Fahad Ali', 'Physics', 'Science & Mathematics', 'college', 25),
    F('M. Immad Ullah', 'Physics', 'Science & Mathematics', 'college', 26), F('Talha Shahab', 'Physics', 'Science & Mathematics', 'college', 27),
    F('Altamash Meher', 'Physics', 'Science & Mathematics', 'college', 28), F('Moosa Bin Hashmat', 'Chemistry', 'Science & Mathematics', 'college', 29),
    F('Ghazi Hassan', 'Chemistry', 'Science & Mathematics', 'college', 30), F('Dr. Noor Muhammad', 'Chemistry', 'Science & Mathematics', 'college', 31),
    F('Aaqib Khan', 'Computer Science', 'Science & Mathematics', 'college', 32), F('Muhammad Wasiq', 'Computer Science', 'Science & Mathematics', 'college', 33),
    F('Afham Saya', 'Computer Science', 'Science & Mathematics', 'college', 34), F('Sami Khatri', 'Computer Science', 'Science & Mathematics', 'college', 35),
    F('Kashif Anwar', 'Computer Science', 'Science & Mathematics', 'college', 36), F('Bilal Zindani', 'Law', 'Humanities', 'college', 37),
    F('Talal Muhammad Arif', 'Law', 'Humanities', 'college', 38), F('Alee Rajput', 'Art & Design', 'Humanities', 'college', 39),
    F('Fareeha Kanwal', 'English', 'Humanities', 'college', 40), F('Jaweria Amir', 'English', 'Humanities', 'college', 41),
    F('Samiullah Pathan', 'Sociology', 'Humanities', 'college', 42), F('Khurram Rizvi', 'Media Studies', 'Humanities', 'college', 43),
    F('Bilal Hassan', 'Psychology', 'Humanities', 'college', 44), F('Maaz Saleem', 'Psychology', 'Humanities', 'college', 45),
    F('Jameel Ansari', 'Urdu', 'Humanities', 'college', 46), F('Abid Ali Umang', 'Urdu', 'Humanities', 'college', 47),
    F('Faizan Pasha', 'Physics', 'Science', 'school', 48), F('Sana Farooq', 'Biology & Chemistry', 'Science', 'school', 49),
    F('Jawwad Aftab', 'Chemistry', 'Science', 'school', 50), F('Raheel Khan', 'Physics', 'Science', 'school', 51),
    F('Aaqib Khan', 'Computer Science', 'Science', 'school', 32), F('Mustafa Saleem', 'Accounting', 'Commerce', 'school', 52),
    F('S. M. Hammad', 'Accounting', 'Commerce', 'school', 53), F('Sohail Ahmed', 'Business Studies', 'Commerce', 'school', 4),
    F('Saifullah Ajaz', 'Economics', 'Commerce', 'school', null), F('Sidra Sultana', 'English', 'Compulsory Subjects', 'school', 54),
    F('Zafar Alam', 'Islamiyat', 'Compulsory Subjects', 'school', 55), F('Shahid Ansari', 'Islamiyat', 'Compulsory Subjects', 'school', 56),
    F('Bilal Yaseen', 'Math & Add. Math', 'Compulsory Subjects', 'school', 57), F('Saad Raza', 'Mathematics', 'Compulsory Subjects', 'school', 58),
    F('Shabnam Kamal', 'Urdu', 'Compulsory Subjects', 'school', 59), F('Tariq Ali Hassan', 'Pakistan Studies', 'Compulsory Subjects', 'school', 60),
    F('Haider Ali Khan', 'Pakistan Studies', 'Compulsory Subjects', 'school', 61), F('Junaid Akhter', 'Pakistan Studies', 'Compulsory Subjects', 'school', 62),
    F('Rohail Ahmed', 'Accounting · Head of Department', 'Heads of Department', 'girls', 0), F('Murtaza Zai', 'Economics · Head of Department', 'Heads of Department', 'girls', 13),
    F('Shahab Yakoob', 'Math & Science · Head of Department', 'Heads of Department', 'girls', 14), F('Sohail Ahmed', 'Business Studies · Head of Department', 'Heads of Department', 'girls', 4)
  ];

  const pathway = [
    { stage: 'Pre-nursery', ages: '2.5 – 3.5 yrs', campus: 'preschool', text: 'A safe, nurturing first step — exploring, playing and building social and emotional skills.' },
    { stage: 'Nursery', ages: '3.5 – 4.5 yrs', campus: 'preschool', text: 'Learning through play: language, motor and cognitive skills that lay the foundation.' },
    { stage: 'Kindergarten', ages: '4.5 – 5.5 yrs', campus: 'preschool', text: 'Literacy, numeracy and social skills through stories, hands-on activity and interactive lessons.' },
    { stage: 'Primary · Grades 1–5', ages: '5.5 – 10.5 yrs', campus: 'preschool', text: 'Critical thinking, communication and character — ready for the challenges of middle school.' },
    { stage: 'Middle School · 6–8', ages: 'Grades 6 – 8', campus: 'school', text: 'Cambridge foundations, life skill modules, houses and societies at the O Level campus.' },
    { stage: 'O Level · 9–11', ages: 'Grades 9 – 11', campus: 'school', text: 'Science or Commerce stream with English, Islamiyat, Mathematics, Pakistan Studies and Urdu.' },
    { stage: 'AS Level', ages: 'Year 1', campus: 'college', text: 'Flexible subject combinations across Commerce, Science and Humanities, with scholarships up to 100%.' },
    { stage: 'A2 Level', ages: 'Year 2', campus: 'college', text: 'Workshops, counselling and aptitude preparation for top universities in Pakistan and abroad.' }
  ];

  const academics = {
    preschoolClasses: [
      { name: 'Pre-nursery', ages: 'Age 2.5 – 3.5', text: 'Embracing the wonder of discovery in a safe, nurturing environment. Experienced teachers guide little ones as they explore, play and develop essential social and emotional skills.' },
      { name: 'Nursery', ages: 'Age 3.5 – 4.5', text: 'Building on curiosity and creativity — children learn through play while engaging activities develop language, motor and cognitive skills.' },
      { name: 'Kindergarten', ages: 'Age 4.5 – 5.5', text: 'Interactive lessons, hands-on activities and storytelling develop literacy, numeracy and social skills in a fun, engaging environment.' },
      { name: 'Primary', ages: 'Grades 1 – 5 · Age 5.5 – 10.5', text: 'A comprehensive education fostering academic excellence, creativity and character — critical thinking, problem-solving and confident communication.' }
    ],
    teachingPrinciples: ['Promoting language skills through engaging activities and conversations', 'Guiding children to take care of each other', 'Mentoring essential self-care skills and independence', 'Developing critical thinking, problem-solving and cognitive skills', 'Activities for gross and fine motor development', 'Encouraging overall growth, well-being and development'],
    oLevel: {
      science: ['Biology', 'Chemistry', 'Computer Science', 'Physics'],
      commerce: ['Business Studies', 'Economics', 'Principles of Accounts'],
      compulsory: ['English', 'Islamiyat', 'Mathematics', 'Pakistan Studies', 'Urdu (Second Language)'],
      note: 'As per the requirement of A Level and future career paths, a Science candidate chooses either Biology or Computer Science.'
    },
    aLevel: {
      Commerce: ['Accounting', 'Business', 'Economics', 'Mathematics'],
      Science: ['Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Physics'],
      Humanities: ['Art & Design', 'Media Studies', 'English Language', 'Law', 'Psychology', 'Sociology', 'Urdu']
    },
    policies: [
      { title: 'No Tuition Policy', text: 'Credo believes a child does not need private tuition when the school provides a durable method of education. It starts with the finest faculty in Karachi — and unlike most schools, the O Level syllabus is started from scratch every year, so knowledge is reinforced and the need for tuition never arises.' },
      { title: '90% attendance', text: 'For the tuition-free strategy to work, parents ensure their child maintains a minimum of 90% attendance every month and that home-study is followed with commitment.' },
      { title: 'Examinations', text: 'Two examinations a year — mid-terms in December and finals or mocks in April — besides monthly subject assessments that carry weight in the overall grade.' },
      { title: 'Homework & Past Papers', text: 'Homework in every class, two parent-teacher meetings a year, and past papers solved in school and then checked — because only checked answers let a student adjust their effort.' },
      { title: 'Study Kits', text: 'Teachers’ notes, booklets, handouts and past papers — study material that strengthens the tuition-free strategy.' },
      { title: 'Workshops', text: 'No preparatory leave after the mocks. Instead, revision workshops in every subject are mandatory — capping off the overall exam preparation.' }
    ],
    support: [
      { title: 'Academic Support Program', text: 'Accomplished alumni, rigorously selected for CAIE excellence, mentor current students with diverse teaching strategies on tricky topics.', img: ph('college-asp') },
      { title: 'Peer Tutoring', text: 'Stronger together: high-achieving students mentor their peers, reinforcing their own knowledge while helping others catch up.', img: ph('college-peer-tutoring') },
      { title: 'Aptitude Test Preparation', text: 'SAT, ECAT, MDCAT or BCAT — a dedicated programme for competitive entrance exams locally and internationally.', img: ph('college-aptitude') },
      { title: 'Credo Workshops', text: 'Pre-exam sessions led by top educators: key concepts, doubts cleared, and paper-attempting technique.', img: ph('college-study') }
    ],
    counselling: ['Subject selection vis-à-vis career choices', 'Home study planning', 'Handling exam anxiety', 'Personality assessment', 'Motivational and inspirational sessions', 'Student profile development', 'Character building', 'Discipline and respect'],
    integrated: 'Integrated learning combines academic rigour with real-world relevance — interdisciplinary approaches that connect ideas across subjects for an interconnected world.'
  };

  const admissions = {
    steps: [
      { title: 'Apply', text: 'Fill in the online admission form — every field complete and correct — or visit the campus to fill a printed form.' },
      { title: 'Review', text: 'The admissions department reviews the application against Credo’s criteria.' },
      { title: 'Interview & assessment', text: 'Shortlisted students are called for an interview with a parent. Grades 1–5 sit an admission test; preschoolers have a friendly, observation-based assessment.' },
      { title: 'Offer & confirmation', text: 'Selected students receive an acceptance or offer letter. On payment of the admission fee, a confirmation letter follows with the student ID and subject details.' }
    ],
    schoolDocs: ['Copy of NADRA B-Form*', 'Copy of Birth Certificate*', 'Photographs (passport size × 3)', 'Copies of parents’ CNIC', 'Copy of child’s last progress report*', 'Copies of extra/co-curricular and sports certificates*'],
    collegeDocs: ['Attested copies of 9th, 10th and 11th grade school reports (mid-year and final-year)', 'Attested copies of CAIE O Level statement of results and certificate', 'Three identical passport photographs (white background) with your name in block letters on the back', 'Attested letters of commendation or ECA certificates', 'Copy of Smartcard or CNIC of student', 'Copy of CNIC of parents and visiting card of parent(s)'],
    eligibility: [
      { title: 'O Level students', text: 'Completed or completing O Levels, with their latest results.' },
      { title: 'Grade requirements', text: 'Students with A+, A, B or C grades are encouraged to apply.' },
      { title: 'Matric students', text: '80% or above, plus extracurricular involvement.' },
      { title: 'Ungraded subjects', text: 'Must commit to retaking the exams and sign an undertaking at admission.' },
      { title: 'Exceptional talents', text: 'Strong extracurricular or sports achievements are considered an asset.' }
    ],
    scholarships: [
      { title: 'Merit based', text: 'Among the most rewarding in town: 10% to 100% tuition fee waivers for AS students, on academic performance, non-academic achievement and sports & ECA participation.' },
      { title: 'Extra / co-curricular', text: 'Talent-based scholarships for extracurricular achievement — two ECAs are taken into account.' },
      { title: 'Sports', text: 'Recognition for students who excel in sport.' },
      { title: 'Need based', text: 'Financial limits should never hold back potential. Documents are reviewed for authenticity; the final percentage is set by Admissions with the Board of Directors.' }
    ],
    scholarshipNote: 'Scholarships granted at admission are valid for one academic year and are reviewed for A2.',
    collegeDay: 'The interview day opens with an orientation by Team Credo — A Level programme details, subject choices, campus life, extracurriculars, scholarships and counselling — followed by the interview panel.',
    faq: [
      { q: 'Is Credo registered with Cambridge?', a: 'Yes — Credo College is Cambridge centre P6012 and Credo School (O Level) is PK741. The Preschool & Primary campus is completing its registration as Credo’s third branch.' },
      { q: 'Where are the campuses?', a: 'All four campuses are in Block 7, Gulshan-e-Iqbal, Karachi, near Maskan / Disco Bakers — the College on Main Abul Hasan Isphahani Road (E-136–141), the O Level school at E-131, the Girls Campus at D-145 and Preschool & Primary at D-175.' },
      { q: 'When can we visit?', a: 'The Preschool & Primary campus welcomes visits Monday to Friday, 8:30 am – 12:30 pm, or by appointment on 0311-1778924. Every campus is happy to arrange a tour — call the campus directly.' },
      { q: 'Is there an admission test?', a: 'Grades 1–5 sit an admission test of academic readiness. Preschoolers have an observation-based assessment in a friendly, interactive setting. Older students are interviewed with a parent.' },
      { q: 'What documents do we bring?', a: 'For school: B-Form, birth certificate, 3 photographs, parents’ CNICs, last progress report and ECA/sports certificates — originals are checked and returned. College documents are listed on the Admissions page.' },
      { q: 'Does Credo offer scholarships?', a: 'Credo College offers merit (10–100% tuition waivers), ECA, sports and need-based scholarships, valid for a year and reviewed for A2.' },
      { q: 'Do students need tuition?', a: 'No. Credo’s no-tuition policy rests on its faculty, restarting the syllabus every year, in-school past papers, study kits and revision workshops — with 90% monthly attendance.' }
    ]
  };

  const life = {
    houses: [
      { name: 'Cave', crest: IMG + 'brand/house-cave.webp', tone: 'violet' },
      { name: 'Congo', crest: IMG + 'brand/house-congo.webp', tone: 'blue' },
      { name: 'Cape', crest: IMG + 'brand/house-cape.webp', tone: 'ember' }
    ],
    houseText: 'Students are divided into three houses — Cave, Congo and Cape — built to inspire teamwork, leadership and friendly competition through sports, academics and extracurricular challenges.',
    council: 'Leadership isn’t a title — it’s a mission. Led by the Head Boy and Head Girl with their deputies and House Captains, the council is elected through a transparent, fair vote, and leads event volunteering and discipline.',
    collegeSocieties: [
      { name: 'Event Management Society', text: 'Freshers’ Night, Mehfil-e-Qawwali, the beach trip and the farewell party — unforgettable events and a strong sense of community.' },
      { name: 'Debate Society', text: 'Critical thinking, public speaking and diplomacy. Hosts the annual Credo MUN and represents the college at local and international MUNs.' },
      { name: 'Legal Society', text: 'Court visits and moot courts — hands-on insight for aspiring lawyers.' },
      { name: 'Fusion Club', text: 'Musicians, singers, artists, photographers and videographers — event coverage, artistic displays and performances across campus.' },
      { name: 'Game-On Society', text: 'ROAR, CSL and e-Gaming, plus futsal, football, cricket and basketball tournaments.' }
    ],
    schoolSocieties: [
      { name: 'Debate', img: IMG + 'brand/society-academic.webp' },
      { name: 'Community Welfare', img: IMG + 'brand/society-community.webp' },
      { name: 'Fusion', img: IMG + 'brand/society-fusion.webp' },
      { name: 'Game On · Sports', img: IMG + 'brand/society-game-on.webp' }
    ],
    preschoolClubs: [
      { name: 'Little Explorers Club', text: 'Science experiments, nature walks and sensory play.' },
      { name: 'Art Studio', text: 'Painting, drawing and crafts for self-expression.' },
      { name: 'Storytelling Club', text: 'Interactive sessions, puppet shows and book readings.' },
      { name: 'Little Chefs Club', text: 'Cooking and baking for fine motor skills and healthy habits.' },
      { name: 'Eco-Warriors Club', text: 'Conservation and sustainability, hands-on.' },
      { name: 'Drama & Role-Play Club', text: 'Creativity, empathy and social skills through drama and puppetry.' }
    ],
    modules: ['Physical Education', 'AV Classes', 'Public Speaking', 'Islamic Education', 'Community Service', 'Coding & Robotics', 'Reading Enhancement Program', 'Music', 'Arts & Crafts', 'Moral Value Education', 'Computer Science Unplugged'],
    sports: ['Cricket', 'Basketball', 'Football', 'Futsal', 'Badminton', 'Table Tennis', 'Throw Ball'],
    events: [
      { name: 'Inter-house Debate', text: 'Three houses argue for and against a motion — judged on clarity, content, delivery and counter-argument.' },
      { name: 'English & Urdu Literacy Week', text: 'Storytelling, poetry, essay writing and drama in both languages, with special assemblies and guest speakers.' },
      { name: 'Credo MUN', text: 'The Debate Society’s annual Model United Nations.' },
      { name: 'Science Fair', text: 'Student-built science and innovation showcase.' },
      { name: 'Eid Festival', text: 'Cultural understanding, empathy and respect.' },
      { name: 'Earth Day', text: 'Environmental awareness and sustainable practice.' },
      { name: 'Sci-Fi Day', text: 'Creativity and curiosity in science and innovation.' },
      { name: 'Frolic Day', text: 'Teamwork and joyful participation.' },
      { name: 'Coffee Morning', text: 'Communication, confidence and presentation skills.' },
      { name: 'Grandparents Day', text: 'Respect and bonding across generations.' },
      { name: 'Sports Day', text: 'Discipline, leadership and sportsmanship.' },
      { name: 'Seerat-un-Nabi', text: 'Moral values and spiritual learning.' },
      { name: 'Splash Day', text: 'Sensory exploration and coordination through water play.' },
      { name: 'Freshers’ Night & Farewell', text: 'College traditions run by the Event Management Society.' }
    ],
    csep: 'The Credo Student Enrichment Program takes learning beyond the classroom — societies, co-curriculars and community service that nurture personal growth in a vibrant, inclusive community.',
    competitions: ['Science & Mathematics competitions', 'Debate, public speaking and MUN', 'Sports events', 'Art and writing', 'Creative and innovation challenges'],
    gallery: ['college-graduates', 'preschool-engaging', 'girls-science-fair', 'college-stage-night', 'school-group', 'preschool-taekwondo', 'college-highfive', 'girls-market-day', 'preschool-art-studio', 'college-concert', 'school-computer-lab', 'preschool-sports-day', 'college-gowns', 'girls-public-speaking', 'preschool-seerat', 'college-craft-workshop', 'school-library', 'college-art'].map((n) => ({ src: ph(n), alt: n.replace(/-/g, ' ') }))
  };

  const universities = {
    international: ['Deakin University', 'University of Manitoba', 'Jacobs University', 'University of Nottingham', 'Sabancı University', 'American University', 'University at Buffalo', 'University of Chicago', 'Clarkson University', 'University of Dayton', 'Hofstra University', 'University of Maine', 'Quinnipiac University', 'Stony Brook University', 'La Trobe University'],
    pakistan: ['LUMS', 'IBA Karachi', 'NUST', 'GIKI', 'Habib University', 'NED University', 'FAST-NUCES', 'IoBM', 'Indus Valley School', 'SZABIST', 'Bahria University']
  };

  const voices = [
    { name: 'Zoya Khalid', role: 'A Level student', quote: 'Credo makes students aware of the problems of the 21st century and makes them global citizens.' },
    { name: 'Syeda Omaima Imran', role: 'A Level student', quote: 'Seek to enable each individual to achieve their goals while also being in servitude to others in the community.' },
    { name: 'Hamza Yaseen', role: 'A Level student', quote: 'Develop independence and progress swiftly in core subjects as well as CAIE courses.' }
  ];

  const writing = [
    { title: 'An Ode to Mother', by: 'Amna Waqar', url: 'https://college.credo.edu.pk/an-ode-to-mother/' },
    { title: 'Distractions and how to end them', url: 'https://college.credo.edu.pk/distractions-and-how-to-end-them/' },
    { title: 'Who is a leader, and what does it mean to lead?', url: 'https://college.credo.edu.pk/who-is-a-leader-and-what-does-it-mean-to-lead/' },
    { title: 'Ruler or leader?', url: 'https://college.credo.edu.pk/ruler-or-leader/' },
    { title: 'On being content with who you are', url: 'https://college.credo.edu.pk/on-being-content-with-who-you-are/' }
  ];

  const facilities = [
    { name: 'Play Areas', text: 'Spacious, well-equipped areas for activity, exploration and creativity.', img: ph('preschool-play-area') },
    { name: 'Classrooms', text: 'Bright, air-conditioned and well-resourced.', img: ph('preschool-classroom') },
    { name: 'Library', text: 'Books, resources and digital media that spark a love of reading.', img: ph('preschool-library') },
    { name: 'Art Studio', text: 'A creative space for every form of self-expression.', img: ph('preschool-art-studio') },
    { name: 'Sensory Play Area', text: 'Sensory exploration, fine motor skills and cognitive growth.', img: ph('preschool-learning') },
    { name: 'ICT Lab', text: 'Hands-on programming, coding and digital literacy.', img: ph('school-computer-lab') },
    { name: 'Audio Visual Room', text: 'Presentations, workshops and multimedia learning.', img: ph('school-projection') },
    { name: 'School Clinic', text: 'A qualified nurse for students’ health and well-being.', img: null }
  ];

  window.CREDO = { network, campuses, leadership, faculty, pathway, academics, admissions, life, universities, voices, writing, facilities, ph };
})();
