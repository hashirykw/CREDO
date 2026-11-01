/* ============================================================================
   CREDO PORTAL · settings
   PREVIEW mode runs the full portal on sample data kept in this browser only —
   every screen says so. Open the portal in two tabs (e.g. teacher + parent) and
   watch posts sync live between them.

   Going live: backend.sql holds the Supabase schema. Paste the Project URL and
   anon/publishable key below (never the service_role key); the Supabase data
   adapter is the next build step. See README.md → "Portal: going live".
   ============================================================================ */
window.CREDO_PORTAL = {
  mode: 'preview',
  SUPABASE_URL: '',
  SUPABASE_ANON_KEY: '',
  schoolStart: '07:45',       // first bell, used for the "now" period marker
  sessionLabel: 'Session 2026–27'
};
