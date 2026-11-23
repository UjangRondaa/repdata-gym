/* Koneksi ke Supabase. Ambil nilainya di dashboard Supabase:
   Project Settings → API → "Project URL" dan "anon public" key.

   Anon key memang dirancang untuk dipakai di browser; data tetap aman karena
   dilindungi aturan akses (RLS) di supabase/schema.sql. JANGAN pernah
   menaruh "service_role" key di sini.

   Kalau dua nilai di bawah dibiarkan kosong, website berjalan dalam mode lokal:
   akun dan catatan hanya tersimpan di browser yang sedang dipakai. */
window.REPDATA_CONFIG = {
  supabaseUrl: 'https://osdxkggnawslooaicezv.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zZHhrZ2duYXdzbG9vYWljZXp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM5Nzc1NDgsImV4cCI6MjEwOTU1MzU0OH0.NwfZPOMi3V23r9e9J2zMuHLGWG6j_omF_LAyJ5d7GPA',
  /* Harus sama dengan domain di fungsi register_user (supabase/schema.sql). */
  authEmailDomain: 'users.repdata.invalid'
};
