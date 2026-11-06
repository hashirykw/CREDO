-- ============================================================================
-- CREDO PORTAL · Supabase schema (run once in Supabase → SQL Editor)
-- Mirrors the preview data model in assets/js/portal.js so the live adapter is a
-- straight swap. Row Level Security keeps every family to its own children.
-- ============================================================================
create extension if not exists pgcrypto;

create table if not exists campuses (id text primary key, name text not null);
create table if not exists classes (
  id text primary key, name text not null, campus_id text references campuses(id),
  class_teacher text, room text, timetable jsonb not null default '{}'::jsonb,
  grade int not null default 6   -- 0 = preschool; 1–5 get the junior portal design, 6+ the senior glass design
);
create table if not exists profiles (               -- one row per auth user
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('student','parent','teacher','admin')),
  code text unique not null,                        -- CS-26-0917 / P-1001 / T-301
  name text not null, class_id text references classes(id),
  subject text, roll int, house text
);
create table if not exists guardians (parent_code text references profiles(code) on delete cascade,
  student_code text references profiles(code) on delete cascade, primary key (parent_code, student_code));

create table if not exists diary (id uuid primary key default gen_random_uuid(), class_id text references classes(id),
  date date not null, subject text not null, type text not null default 'homework', body text not null,
  due date, teacher_code text references profiles(code), created_at timestamptz default now());
create table if not exists diary_signatures (diary_id uuid references diary(id) on delete cascade,
  parent_code text references profiles(code), signed_at timestamptz default now(), primary key (diary_id, parent_code));
create table if not exists assignments (id uuid primary key default gen_random_uuid(), class_id text references classes(id),
  subject text, title text not null, details text, due date, max_marks int default 20, teacher_code text references profiles(code), created_at timestamptz default now());
create table if not exists submissions (assignment_id uuid references assignments(id) on delete cascade,
  student_code text references profiles(code), status text default 'submitted', note text, marks numeric,
  submitted_at timestamptz default now(), primary key (assignment_id, student_code));
create table if not exists notes (id uuid primary key default gen_random_uuid(), class_id text references classes(id),
  subject text, kind text, title text not null, body text, url text, teacher_code text references profiles(code), created_at timestamptz default now());
create table if not exists notices (id uuid primary key default gen_random_uuid(), level text check (level in ('notice','event','emergency')),
  scope text not null,                               -- 'all' | 'campus:<id>' | 'class:<id>'
  title text not null, body text not null, posted_by text, created_at timestamptz default now());
create table if not exists notice_acks (notice_id uuid references notices(id) on delete cascade, user_code text, acked_at timestamptz default now(), primary key (notice_id, user_code));
create table if not exists attendance (student_code text references profiles(code), date date, status text check (status in ('P','A','L','V')), primary key (student_code, date));
create table if not exists assessments (id uuid primary key default gen_random_uuid(), name text, date date, max_marks int, published boolean default true);
create table if not exists results (assessment_id uuid references assessments(id) on delete cascade, student_code text references profiles(code),
  subject text, marks numeric, max_marks int, primary key (assessment_id, student_code, subject));
create table if not exists leaves (id uuid primary key default gen_random_uuid(), student_code text references profiles(code), parent_code text,
  date_from date, date_to date, reason text, status text default 'pending', created_at timestamptz default now());
create table if not exists messages (id uuid primary key default gen_random_uuid(), thread text, from_code text, to_code text, body text, created_at timestamptz default now());

-- ---------- helpers ----------
create or replace function me() returns profiles language sql stable security definer as $$ select * from profiles where user_id = auth.uid() $$;
create or replace function my_students() returns setof text language sql stable security definer as $$
  select code from profiles where user_id = auth.uid() and role = 'student'
  union select student_code from guardians g join profiles p on p.code = g.parent_code where p.user_id = auth.uid() $$;
create or replace function my_classes() returns setof text language sql stable security definer as $$
  select class_id from profiles where code in (select my_students())
  union select id from classes c where exists (select 1 from profiles p where p.user_id = auth.uid() and p.role in ('teacher','admin')) $$;
create or replace function is_staff() returns boolean language sql stable security definer as $$
  select exists (select 1 from profiles where user_id = auth.uid() and role in ('teacher','admin')) $$;

-- ---------- RLS ----------
do $$ declare t text; begin
  foreach t in array array['campuses','classes','profiles','guardians','diary','diary_signatures','assignments','submissions','notes','notices','notice_acks','attendance','assessments','results','leaves','messages'] loop
    execute format('alter table %I enable row level security', t);
  end loop; end $$;

create policy "read campuses" on campuses for select using (true);
create policy "read classes" on classes for select using (id in (select my_classes()));
create policy "read profiles" on profiles for select using (user_id = auth.uid() or code in (select my_students()) or is_staff());
create policy "read guardians" on guardians for select using (student_code in (select my_students()) or is_staff());
create policy "read diary" on diary for select using (class_id in (select my_classes()));
create policy "staff write diary" on diary for all using (is_staff()) with check (is_staff());
create policy "read signatures" on diary_signatures for select using (parent_code = (me()).code or is_staff());
create policy "parent signs" on diary_signatures for insert with check (parent_code = (me()).code);
create policy "read assignments" on assignments for select using (class_id in (select my_classes()));
create policy "staff write assignments" on assignments for all using (is_staff()) with check (is_staff());
create policy "read submissions" on submissions for select using (student_code in (select my_students()) or is_staff());
create policy "student submits" on submissions for insert with check (student_code = (me()).code and marks is null);
create policy "staff marks" on submissions for update using (is_staff());
create policy "read notes" on notes for select using (class_id in (select my_classes()));
create policy "staff write notes" on notes for all using (is_staff()) with check (is_staff());
create policy "read notices" on notices for select using (scope = 'all' or substr(scope, 7) in (select my_classes())
  or substr(scope, 8) in (select campus_id from classes where id in (select my_classes())) or is_staff());
create policy "staff post notices" on notices for insert with check (is_staff());
create policy "acks" on notice_acks for all using (user_code = (me()).code or is_staff()) with check (user_code = (me()).code);
create policy "read attendance" on attendance for select using (student_code in (select my_students()) or is_staff());
create policy "staff attendance" on attendance for all using (is_staff()) with check (is_staff());
create policy "read assessments" on assessments for select using (published or is_staff());
create policy "staff assessments" on assessments for all using (is_staff()) with check (is_staff());
create policy "read results" on results for select using (student_code in (select my_students()) or is_staff());
create policy "staff results" on results for all using (is_staff()) with check (is_staff());
create policy "read leaves" on leaves for select using (student_code in (select my_students()) or is_staff());
create policy "parent applies" on leaves for insert with check (parent_code = (me()).code and student_code in (select my_students()));
create policy "staff decides" on leaves for update using (is_staff());
create policy "read messages" on messages for select using (from_code = (me()).code or to_code = (me()).code);
create policy "send messages" on messages for insert with check (from_code = (me()).code);

-- live updates for the portal
alter publication supabase_realtime add table diary, notices, assignments, notes, results, attendance, messages, leaves;
