# Credo Portal · students, parents & teachers

The portal for the Credo School & College Network (Gulshan-e-Iqbal, Karachi). It is portal-only: the old marketing pages are gone, and Credo is promoted inside the portal instead.
Static HTML/CSS/JS, no build step. Every asset (photos, logos, fonts) is a file in this repo; nothing loads from another site.

Live domain: `credoschoolingsystem.nexlyr.solutions`

## Two designs, five looks

| Who | Design | Looks (switcher in the top bar) |
|---|---|---|
| Grade 6 and above, parents viewing a senior child, all teachers | **Senior glass** — holographic student card, merged-lens stats, slim bar charts, glass bento | **Mist** (soft periwinkle glass) · **Mono** (silver glass, ink cards) · **Prism** (holographic dark) |
| Pre-nursery to Grade 5, parents viewing a junior child | **Junior** — sticky-note diary, subject folders, stars, badges, colourful timetable, confetti | **Day** (cream) · **Night** (deep navy) |

The design follows the student being viewed. When a parent switches between children, the whole portal changes design with a circular reveal animation. The cut-off grade is `juniorUpTo` in `assets/js/portal-config.js`, and `classes.grade` holds each class's grade in `backend.sql`.

Throughout: a prism stripe that also shows state (it sweeps while busy, glows green on success, red on error, and pulses when a live update arrives), glass spotlight on hover, a tilting holographic card, count-up numbers, staggered entrances, ⌘K / `/` search, mobile tab bar and drawer, and reduced-motion support.

## Credo promotion inside the portal

The sign-in screen has rotating campus photos, all four campuses with Cambridge centre codes, Early Bird Admissions with the Skoolify link and UAN, and a strip of real faculty photos.
Inside the portal:
- **Seniors:** Credo College (AS & A2, scholarships), Credo MUN and the Debate Society, aptitude test preparation, the three houses.
- **Juniors:** Sports Day, Splash Day and other events, Robotics, Taekwondo and Tajweed, the six preschool clubs, the campus site.
- **Parents:** Early Bird Admissions.
- **Teachers:** Credo Workshops and the Academic Support Program.

There's also a Credo ticker at the foot of every page. All of this comes from `assets/js/data.js`, which holds text collected from Credo's own public sites (credo.edu.pk and its campus sub-sites, plus the Skoolify form) on 1 Nov 2026. None of it is invented.

## What each role can do

- **Students:** overview, daily diary, timetable with the current period, assignments (mark as submitted), notes and resources, results with charts, attendance, notices. Juniors also get "I did it!" on homework notes, subject folders, stars and badges.
- **Parents:** switch between children, sign the diary (one entry or all), acknowledge emergency notes, progress, attendance and leave applications, homework, timetable, notices, messages to the class teacher.
- **Teachers:** dashboard, diary posting with parent sign-off counts, roll call, leave approval, assignments with marking, publishing test marks, notes and links, notices and emergency notes, parent messages.

## Preview mode (now)

The portal runs on clearly labelled sample data saved in each visitor's browser. Open a teacher and a parent in two tabs and posts sync live between them. The password for every demo account is `credo123`:
`CS-26-0917` (Grade 9 student, senior) · `CP-26-0311` (Grade 3 student, junior) · `P-1001` (parent of both) · `T-301` (class teacher 9-A) · `T-311` (class teacher 3-B). "Reset sample data" is in the sidebar.

## Going live

`backend.sql` is the full Supabase schema, with row-level security and realtime enabled. Families see only their own children; staff can write.
1. Create a Supabase project and run `backend.sql`.
2. Add the users and the guardian links.
3. Put the project URL and anon key in `assets/js/portal-config.js`.

The next build step is the data adapter that swaps the preview store for Supabase.

## Structure

```
index.html            the portal (sign-in + app)
portal.html           redirect to / for old links
404.html
assets/css/portal.css every style: tokens, five looks, components, junior design, responsive
assets/js/data.js     Credo content (campuses, admissions, houses, clubs, events, faculty)
assets/js/portal.js   the app
assets/js/portal-config.js
assets/img            photos/ · faculty/ · brand/
assets/fonts          Bodoni Moda · Manrope · DM Mono · Fredoka (junior)
```

Deploy on Vercel: import the repo, Framework preset **Other**, no build command. `vercel.json` redirects the old website URLs (`/about`, `/admissions` …) and `/portal` to `/`.

Designed & developed by Nexlyr Solutions.
