# RepData Gym

Database gerakan gym per alat: cara memakai alat, semua variasi gerakannya, otot yang bekerja (peta otot depan & belakang), tempo, dan animasi figur. Anggota yang sudah masuk bisa menulis catatan dan saran di setiap gerakan.

- **Tanpa akun**: bisa membuka database dan membaca semua catatan.
- **Dengan akun** (daftar pakai username + password): bisa menulis catatan, saran, usulan alat/gerakan, dan menghapus tulisan sendiri.

Website ini statis (HTML, CSS, JavaScript biasa, tanpa proses build). Data akun dan catatan disimpan di [Supabase](https://supabase.com).

## Isi folder

| File | Isi |
|---|---|
| `index.html` | Kerangka halaman |
| `style.css` | Tampilan (tema gelap & terang) |
| `data.js` | Data alat dan gerakan. Tambah atau ubah alat di array `EQ`. |
| `dataset.js` | 1.324 gerakan dari exercises-dataset (dibuat otomatis, jangan diedit manual) |
| `tools/import_dataset.py` | Skrip yang membuat `dataset.js` |
| `photos.js` | Daftar foto gerakan dari free-exercise-db (dibuat otomatis) |
| `tools/import_photos.py` | Skrip yang membuat `photos.js` |
| `serve.py` | Server lokal tanpa cache untuk development |
| `anim.js` | Animasi figur per gerakan |
| `app.js` | Halaman, pencarian, akun, dan catatan |
| `config.js` | Alamat dan anon key Supabase |
| `supabase/schema.sql` | Tabel, aturan akses, dan fungsi daftar akun untuk Supabase |

## Menjalankan di komputer

Buka `index.html` langsung di browser, atau jalankan server kecil dari folder ini:

```bash
python3 serve.py
# lalu buka http://localhost:8000
```

`serve.py` sama seperti `python3 -m http.server`, tetapi melarang browser menyimpan cache, jadi setiap perubahan file langsung terlihat saat halaman di-refresh.

Selama `config.js` masih kosong, website berjalan dalam **mode lokal**: akun dan catatan hanya tersimpan di browser yang sedang dipakai. Mode ini cocok untuk mencoba tampilan, tetapi tidak dibagikan ke orang lain.

## Gerakan dari exercises-dataset

Selain 56 gerakan buatan sendiri di `data.js`, RepData memuat 1.324 gerakan dari [exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset) karya Hasan Emir Yıldırım (lisensi MIT; teks lisensinya ada di kepala `dataset.js`).

- Yang diambil hanya teks: nama, alat, otot target dan sekunder, serta langkah dalam bahasa Inggris. Gambar dan GIF di dataset itu milik Gym visual dan tidak termasuk lisensi MIT, jadi tidak dipakai.
- Level, rep, tempo, istirahat, kesalahan umum, dan tips tidak ada di sumbernya, jadi ditampilkan sebagai `—`. Gerakan ini diberi tag **Dataset** dan id berawalan `ds-`.
- Untuk memperbarui dari versi terbaru dataset:

```bash
curl -L -o /tmp/exercises.json https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/data/exercises.json
python3 tools/import_dataset.py /tmp/exercises.json
```

Pemetaan alat dan otot ada di bagian atas skrip. Kalau dataset menambah alat atau otot baru, skripnya berhenti dan menyebutkan nama yang belum dipetakan.

## Foto gerakan dari free-exercise-db

373 gerakan (41 buatan sendiri, 332 dari dataset) punya dua foto dari [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (Unlicense / domain publik). Catatan: foto aslinya berasal dari proyek lain (wrkout/exercises.json) dan asal-usul awalnya tidak terdokumentasi, jadi pertimbangkan lagi bila RepData dipakai untuk komersial.

- Foto tidak disimpan di repo ini. Halaman memuatnya lewat jsDelivr dari commit yang dikunci di `tools/import_photos.py`, jadi isinya tidak berubah diam-diam. Kalau jsDelivr tidak bisa diakses, fotonya disembunyikan dan halaman tetap berjalan.
- Pencocokan sengaja ketat: nama harus sama dan jenis alatnya juga harus sama. Gerakan yang tidak punya pasangan pasti tidak diberi foto.
- Gerakan buatan sendiri yang namanya berbeda dicocokkan lewat tabel `MANUAL` di skrip; pasangan yang ternyata salah dimasukkan ke `SKIP`.
- Untuk membuat ulang (jalankan setelah `import_dataset.py`):

```bash
curl -L -o /tmp/fedb.json https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json
python3 tools/import_photos.py /tmp/fedb.json
```

## Menyiapkan Supabase

1. Buat akun di [supabase.com](https://supabase.com), lalu **New project**. Pilih region **Southeast Asia (Singapore)** supaya cepat dari Indonesia. Simpan database password-nya.
2. Buka **SQL Editor → New query**, tempel seluruh isi `supabase/schema.sql`, lalu klik **Run**. Perintah ini membuat:
   - tabel `profiles` (username) dan `notes` (catatan & saran),
   - aturan akses: semua orang bisa membaca; hanya anggota yang masuk bisa menulis; tiap anggota hanya bisa menghapus tulisannya sendiri,
   - fungsi `register_user` untuk daftar dengan username,
   - realtime, supaya catatan baru langsung muncul di browser lain.
3. Buka **Authentication → Sign In / Providers**:
   - Pastikan provider **Email** aktif (dipakai untuk login di belakang layar).
   - Matikan **Allow new users to sign up**. Pendaftaran tetap jalan lewat fungsi `register_user`, dan pengaturan ini mencegah orang membuat akun tanpa username lewat API.
4. Buka **Project Settings → API**, salin **Project URL** dan **anon public key** ke `config.js`:

   ```js
   window.REPDATA_CONFIG = {
     supabaseUrl: 'https://xxxxxxxx.supabase.co',
     supabaseAnonKey: 'eyJhbGciOi...',
     authEmailDomain: 'users.repdata.invalid'
   };
   ```

   Anon key memang dirancang untuk dipakai di browser; data dilindungi aturan akses di `schema.sql`. **Jangan pernah** menaruh `service_role` key di `config.js`.
5. Buka website (lokal atau sudah di-hosting), lalu coba **Daftar**, tulis satu catatan, dan cek tabel `notes` di **Table Editor**.

### Cara kerja login dengan username

Supabase Auth membutuhkan email, jadi setiap akun diberi email buatan `<username>@users.repdata.invalid`. Email ini tidak pernah dikirimi apa pun dan tidak terlihat oleh pengguna. Domainnya harus sama di `config.js` (`authEmailDomain`) dan di fungsi `register_user` pada `schema.sql`.

## Hosting di Vercel

Website ini tidak butuh build, jadi Vercel cukup menyajikan file apa adanya.

### Cara A: lewat GitHub (disarankan)

1. Masuk ke [vercel.com](https://vercel.com) dengan akun GitHub.
2. Klik **Add New… → Project**.
3. Cari repo **repdata**. Karena repo ini privat, kalau belum muncul klik **Adjust GitHub App Permissions** dan beri Vercel akses ke repo `repdata`.
4. Klik **Import**, lalu atur:
   - **Framework Preset**: `Other`
   - **Root Directory**: `./`
   - **Build Command** dan **Output Directory**: biarkan kosong
5. Klik **Deploy**. Setelah selesai, website tersedia di alamat seperti `https://repdata-xxxx.vercel.app`.

Setiap `git push` ke branch `main` otomatis membuat Vercel deploy ulang.

### Cara B: lewat Vercel CLI

```bash
cd repdata
npx vercel          # pertama kali: login, lalu jawab pertanyaan setup (pilih default)
npx vercel --prod   # deploy ke alamat produksi
```

### Setelah online

- Tidak ada pengaturan Supabase tambahan untuk domain Vercel, karena login memakai username + password (tanpa redirect).
- Kalau `config.js` diubah, push lagi (Cara A) atau jalankan `npx vercel --prod` lagi (Cara B).
- Domain sendiri bisa ditambahkan di Vercel: **Project → Settings → Domains**.

## Admin & moderasi

### Menjadikan akun sebagai admin

Admin mendapat lencana **Admin** di setiap tulisannya, bisa **menyematkan** komentar di Beranda (tombol *Sematkan*, komentar yang disematkan selalu tampil paling atas), dan bisa menghapus tulisan siapa pun langsung dari website. Jalankan di SQL Editor, ganti `namauser`:

```sql
update public.profiles set is_admin = true where username = 'namauser';
```

Anggota tidak bisa menjadikan dirinya admin: kolom `is_admin` hanya bisa diubah dari dashboard.

### Lewat dashboard Supabase

- **Menghapus catatan**: Table Editor → `notes` → pilih baris → Delete.
- **Menghapus akun**: Authentication → Users → pilih user → Delete user. Profil dan semua catatannya ikut terhapus.
- **Mengatur ulang password anggota** (karena tidak ada email untuk pemulihan): jalankan di SQL Editor, ganti `namauser` dan password barunya:

  ```sql
  update auth.users
  set encrypted_password = extensions.crypt('PasswordBaru123', extensions.gen_salt('bf'))
  where email = lower('namauser') || '@users.repdata.invalid';
  ```

  Setelah itu anggota bisa masuk dengan password baru, lalu menggantinya sendiri di halaman Akun → **Ganti password**.

## Komentar di Beranda

Bagian **Komentar** di Beranda untuk kritik, komentar, dan saran tentang website. Tersimpan di tabel `notes` dengan `move_id = '_web'` dan jenis `komentar`, `kritik`, atau `saran`.

- Hanya anggota yang sudah masuk yang bisa menulis; tamu tetap bisa membaca.
- **Foto profil** (opsional, maks. 5 MB) dipotong persegi dan dikecilkan ke 256 px (sekitar 20 KB) di browser, lalu disimpan di bucket Storage `avatars` sebagai `<id akun>.jpg`. Foto ini tampil di semua tulisan anggota tersebut dan bisa diganti atau dihapus dari form komentar maupun halaman Akun.
- **Setelah memperbarui kode ini, jalankan ulang `supabase/schema.sql`** di SQL Editor (aman dijalankan ulang; data lama tidak hilang). Sebelum itu, kolom komentar menampilkan pesan "belum aktif" dan fitur lain tetap berjalan.
- Menghapus foto yang tidak pantas: Storage → `avatars` → hapus file `<id akun>.jpg`, lalu di Table Editor `profiles` kosongkan `avatar_v` akun itu.

## Batasan yang perlu diketahui

- Tanpa email, anggota tidak bisa memulihkan password sendiri; admin yang mengatur ulang.
- Username tidak bisa diganti setelah akun dibuat.
- Fungsi `register_user` belum punya batas jumlah pendaftaran per menit. Kalau ada pendaftaran spam, hapus akunnya di Authentication → Users.
- Fungsi `register_user` menulis langsung ke tabel internal Supabase Auth. Kalau suatu saat Supabase mengubah struktur tabel itu dan daftar akun gagal, cek pesan error di SQL Editor.
