# Credo School & College Network · website + portal

A multi-page website for the Credo School & College Network (Gulshan-e-Iqbal, Karachi) and a connected **Student · Parent · Teacher portal**.
Static HTML/CSS/JS — no build step. Every asset (photos, logos, fonts, libraries) is a separate file in this repo; nothing loads from another site.

Live domain: `credoschoolingsystem.nexlyr.solutions`

## Pages

| File | What it is |
|---|---|
| `index.html` | Home: rotating “We believe…” hero, fanned campus card stack, network facts, the **pinned Pre-nursery → A2 pathway** (scroll-driven, horizontal), four-campus bento, the no-tuition method, a moving wall of 48 faculty, the Dean’s message, the three houses, a portal preview, student voices, university placements, admissions CTA |
| `about.html` | Meaning of “Credo”, statement of belief, three core values, timeline, full Dean & Director message, founding members, management, university placements |
| `campuses.html` | All four campuses: logo, address, phones, email, socials, directions, WhatsApp, photo strip with lightbox, highlights; shared facilities |
| `academics.html` | Preschool classes & ages, teaching principles, O Level Science/Commerce/compulsory subjects, A Level subject groups (tabs), the six no-tuition commitments, academic support, counselling |
| `faculty.html` | Searchable directory of 64 teachers (filter by campus, search by name/subject, `?q=` deep links) |
| `admissions.html` | Four steps, documents for school and college, eligibility, scholarships, FAQ, enquiry form (opens WhatsApp or email ready-written), link to Credo’s Skoolify form |
| `life.html` | Houses, Student Council, CSEP societies, school societies, preschool clubs, life skills, sports, competitions, 14 events, photo gallery, student writing |
| `contact.html` | Contact cards for every campus, enquiry form, Work at Credo, vendor relations |
| `portal.html` | The portal (see below) |
| `404.html` | Not-found page |

Site-wide: glass navigation with a campus mega-menu, preloader (first visit per session), page-curtain transitions, light/dark theme, synthesised sound effects (toggle), ⌘K / `/` search across pages, campuses and teachers, “Ask Credo” helper that answers only from Credo’s published information, Lenis smooth scroll, reduced-motion support, Nexlyr credit strip.

## The portal

Sign in as a **Student**, **Parent** or **Teacher**. One shared data store, so what a teacher posts appears for the student and their parents straight away — open two tabs and watch it sync.

- **Students:** today view (live timetable with the current period, today’s diary, due work, average, attendance ring), daily diary by date, weekly timetable, assignments (mark as submitted), notes & resources by subject, results with progress and subject charts, attendance calendar, notices.
- **Parents:** overview per child (switch between siblings), **sign the diary** (one entry or all), acknowledge **emergency notes**, progress & results, attendance with **leave applications**, homework, timetable, notices, messages to the class teacher.
- **Teachers:** dashboard, post to the diary (and see how many parents signed), roll call (Present / Late / Absent), approve leave, set assignments and mark them, publish test marks, share notes and links, post notices or **emergency notes** (class or whole campus), message parents.

**Preview mode (now):** runs on clearly labelled sample data saved in the visitor’s browser. Demo logins — password `credo123` for all:
`CS-26-0917` (student) · `P-1001` (parent of two) · `T-301` (class teacher, 9-A). “Reset sample data” is in the sidebar.

### Portal: going live
`backend.sql` is the full Supabase schema with row-level security (families see only their own children; staff write) and realtime enabled. To launch: create a Supabase project, run `backend.sql`, add users and the guardian links, put the URL and anon key in `assets/js/portal-config.js`. The data adapter that swaps the preview store for Supabase is the next build step.

## Content sources — confirm with Credo before launch

All text, names, photos and logos come from Credo’s own public sites (credo.edu.pk, school., college., preschool., girlsschool.credo.edu.pk) and its Skoolify admissions form, collected 1 Nov 2026. Nothing is estimated.

1. **Fees** are not published anywhere, so the site sends fee questions to the campus phones.
2. **Faculty:** 64 names from the college, school and girls-campus pages. Saifullah Ajaz has no published photo and shows initials.
3. **Photos** are Credo’s own website images. Higher-resolution originals from Credo would look sharper on large screens.
4. **University list** is drawn from the logos on Credo College’s counselling page.
5. **Domain:** canonical URLs and `sitemap.xml` use `https://credoschoolingsystem.nexlyr.solutions`.

## Structure

```
assets/css   core.css (tokens, glass, chrome) · site.css (pages) · portal.css
assets/js    data.js (all Credo content) · core.js (chrome) · pages.js · portal.js · portal-config.js
assets/img   photos/ · faculty/ · brand/ (Credo logos, lions, house crests, society logos, Nexlyr logo)
assets/fonts Bodoni Moda · Manrope · DM Mono (self-hosted)
assets/vendor GSAP + ScrollTrigger · Lenis
```

Deploy on Vercel: import the repo, Framework preset **Other**, no build command. `vercel.json` turns on clean URLs (`/about` serves `about.html`).

Designed & developed by Nexlyr Solutions.
