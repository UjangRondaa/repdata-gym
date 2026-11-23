-- =====================================================================
-- RepData · skema database Supabase
-- Jalankan SEKALI di Supabase: SQL Editor → New query → tempel → Run.
-- Aman dijalankan ulang (pakai IF NOT EXISTS / CREATE OR REPLACE).
-- =====================================================================

create extension if not exists citext   with schema extensions;
create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------
-- 1. Profil publik: satu baris per akun, berisi username yang tampil
--    di setiap catatan. Username unik tanpa membedakan huruf besar/kecil.
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    extensions.citext not null unique,
  created_at  timestamptz not null default now(),
  constraint username_format check (username::text ~ '^[A-Za-z0-9][A-Za-z0-9_.]{2,19}$')
);
-- is_admin: tampil lencana Admin, boleh menyematkan & menghapus tulisan siapa pun.
--           Hanya bisa diubah lewat dashboard/SQL Editor (lihat README).
-- avatar_v: versi foto profil di Storage (avatars/<id>.jpg); null = tanpa foto.
alter table public.profiles add column if not exists is_admin boolean not null default false;
alter table public.profiles add column if not exists avatar_v bigint;

-- ---------------------------------------------------------------------
-- 2. Catatan & saran. move_id = id gerakan di data.js, '_site' untuk
--    Kotak saran di halaman Saran, atau '_web' untuk komentar di Beranda.
-- ---------------------------------------------------------------------
create table if not exists public.notes (
  id          uuid primary key default gen_random_uuid(),
  move_id     text not null check (char_length(move_id) between 1 and 80),
  kind        text not null,
  body        text not null check (char_length(body) between 1 and 600),
  user_id     uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now()
);
alter table public.notes add column if not exists pinned boolean not null default false;
alter table public.notes drop constraint if exists notes_kind_check;
alter table public.notes add constraint notes_kind_check
  check (kind in ('catatan','saran','alat','gerakan','koreksi','komentar','kritik'));
create index if not exists notes_created_idx on public.notes (created_at desc);
create index if not exists notes_user_idx    on public.notes (user_id);

-- ---------------------------------------------------------------------
-- 3. Aturan akses (Row Level Security)
--    - Semua orang (termasuk tamu) boleh membaca profil dan catatan.
--    - Hanya anggota yang masuk boleh menulis, dan hanya atas namanya sendiri.
--    - Anggota hanya boleh menghapus catatannya sendiri; admin boleh
--      menghapus dan menyematkan tulisan siapa pun.
--    - Dari profil, anggota hanya boleh mengubah avatar_v miliknya.
-- ---------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select p.is_admin from public.profiles p where p.id = (select auth.uid())), false);
$$;
revoke all     on function public.is_admin() from public;
grant  execute on function public.is_admin() to anon, authenticated;

alter table public.profiles enable row level security;
alter table public.notes    enable row level security;

drop policy if exists "Profil bisa dibaca semua orang"   on public.profiles;
drop policy if exists "Anggota mengubah fotonya"         on public.profiles;
drop policy if exists "Catatan bisa dibaca semua orang"  on public.notes;
drop policy if exists "Anggota menulis atas namanya"     on public.notes;
drop policy if exists "Anggota menghapus catatannya"     on public.notes;
drop policy if exists "Admin menyematkan catatan"        on public.notes;

create policy "Profil bisa dibaca semua orang"  on public.profiles
  for select to anon, authenticated using (true);
create policy "Catatan bisa dibaca semua orang" on public.notes
  for select to anon, authenticated using (true);
create policy "Anggota mengubah fotonya"        on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy "Anggota menulis atas namanya"    on public.notes
  for insert to authenticated with check (user_id = (select auth.uid()) and pinned = false);
create policy "Anggota menghapus catatannya"    on public.notes
  for delete to authenticated using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy "Admin menyematkan catatan"       on public.notes
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- Batasi kolom yang boleh diubah: tanpa ini anggota bisa mengubah is_admin
-- miliknya sendiri lewat policy di atas.
revoke update on public.profiles from anon, authenticated;
grant  update (avatar_v) on public.profiles to authenticated;
revoke update on public.notes from anon, authenticated;
grant  update (pinned) on public.notes to authenticated;

-- ---------------------------------------------------------------------
-- 4. Daftar akun dengan USERNAME saja.
--    Supabase Auth butuh email, jadi setiap akun diberi email buatan
--    <username>@users.repdata.invalid (tidak pernah dikirimi email).
--    Domain ini HARUS sama dengan authEmailDomain di config.js.
--    Fungsi ini membuat user langsung di database supaya tidak terkena
--    pemeriksaan domain email saat sign up.
-- ---------------------------------------------------------------------
create or replace function public.register_user(p_username text, p_password text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id    uuid := gen_random_uuid();
  v_email text;
begin
  if p_username is null or p_username !~ '^[A-Za-z0-9][A-Za-z0-9_.]{2,19}$' then
    raise exception 'USERNAME_INVALID' using errcode = '22023';
  end if;
  if p_password is null or char_length(p_password) < 8 or char_length(p_password) > 72 then
    raise exception 'PASSWORD_INVALID' using errcode = '22023';
  end if;
  if exists (select 1 from public.profiles where username = p_username::extensions.citext) then
    raise exception 'USERNAME_TAKEN' using errcode = '23505';
  end if;

  v_email := lower(p_username) || '@users.repdata.invalid';

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) values (
    '00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', v_email,
    extensions.crypt(p_password, extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('username', p_username), now(), now(),
    '', '', '', ''
  );

  insert into auth.identities (
    id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at
  ) values (
    gen_random_uuid(), v_id, v_id::text, 'email',
    jsonb_build_object('sub', v_id::text, 'email', v_email, 'email_verified', true),
    now(), now(), now()
  );

  insert into public.profiles (id, username) values (v_id, p_username);
end;
$$;

revoke all     on function public.register_user(text, text) from public;
grant  execute on function public.register_user(text, text) to anon, authenticated;

-- ---------------------------------------------------------------------
-- 5. Realtime: catatan baru langsung muncul di browser lain.
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notes'
  ) then
    alter publication supabase_realtime add table public.notes;
  end if;
end $$;

-- ---------------------------------------------------------------------
-- 6. Foto profil: bucket publik "avatars", satu file per akun
--    (<id akun>.jpg). Browser sudah mengecilkan foto ke 256 px sebelum
--    diunggah; batas 200 KB di sini mencegah file besar lolos.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 204800, array['image/jpeg'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Avatar: lihat milik sendiri"  on storage.objects;
drop policy if exists "Avatar: unggah milik sendiri" on storage.objects;
drop policy if exists "Avatar: ganti milik sendiri"  on storage.objects;
drop policy if exists "Avatar: hapus milik sendiri"  on storage.objects;

-- (Bucket publik: semua orang bisa melihat foto lewat URL publik tanpa policy.
--  Policy select di bawah dibutuhkan agar pemilik bisa menimpa fotonya.)
create policy "Avatar: lihat milik sendiri"  on storage.objects for select to authenticated
  using (bucket_id = 'avatars' and name = (select auth.uid())::text || '.jpg');
create policy "Avatar: unggah milik sendiri" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and name = (select auth.uid())::text || '.jpg');
create policy "Avatar: ganti milik sendiri"  on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and name = (select auth.uid())::text || '.jpg')
  with check (bucket_id = 'avatars' and name = (select auth.uid())::text || '.jpg');
create policy "Avatar: hapus milik sendiri"  on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and name = (select auth.uid())::text || '.jpg');
