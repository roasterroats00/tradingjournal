# Panduan Deployment ke Vercel & Supabase

## 1. Persiapan Database (Supabase)

1.  **Buat Project Baru** di [Supabase](https://supabase.com/).
2.  Masuk ke **Project Settings** -> **Database**.
3.  Salin **Connection String** (Mode: Transaction).
    *   Format: `postgres://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`
    *   Ini akan menjadi `DATABASE_URL` Anda.
4.  Salin **Connection String** (Mode: Session).
    *   Format: `postgres://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres`
    *   Ini akan menjadi `DIRECT_URL` Anda (untuk migrasi Prisma).

---

## 2. Penyesuaian Kode untuk PostgreSQL

Karena saat ini kita menggunakan SQLite, kita perlu mengubah konfigurasi Prisma ke PostgreSQL agar kompatibel dengan Vercel & Supabase.

### A. Update `prisma/schema.prisma`

Ubah blok `datasource` menjadi:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### B. Bersihkan Migrasi Lama (Opsional tapi disarankan)

Hapus folder `prisma/migrations` jika ada, karena format SQLite tidak kompatibel dengan Postgres.

---

## 3. Konfigurasi Environment Variables

Di Dashboard Vercel (Project Settings -> Environment Variables), tambahkan:

| Variable | Value | Deskripsi |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgres://...:6543/postgres` | Connection string dari Supabase (Transaction Mode) |
| `DIRECT_URL` | `postgres://...:5432/postgres` | Connection string dari Supabase (Session Mode) |
| `NEXTAUTH_URL` | `https://nama-project-anda.vercel.app` | Domain Vercel setelah deploy |
| `NEXTAUTH_SECRET` | `(Generate string acak)` | Bisa generate pakai `openssl rand -base64 32` |
| `GEMINI_API_KEY` | `AIzaSy...` | (Opsional) API Key dari Google AI Studio untuk fitur AI |

---

## 4. Langkah Deployment ke Vercel

1.  **Push kode ke GitHub/GitLab/Bitbucket**.
2.  Buka [Vercel](https://vercel.com/) -> **Add New Project**.
3.  Impor repositori Git Anda.
4.  Di bagian **Build & Development Settings**, biarkan default.
5.  Masukkan **Environment Variables** dari langkah nomor 3.
6.  Klik **Deploy**.

---

## 5. Setup Database Schema (Setelah Project dibuat)

Vercel akan mencoba membuild aplikasi. Agar database terisi tabel, Anda punya dua opsi:

**Opsi A: Melalui Command Line Lokal**
Jika Anda sudah mengubah `.env` lokal ke kredensial Supabase:
```bash
npx prisma db push
```

**Opsi B: Build Command Vercel (Otomatis)**
Ubah **Build Command** di Vercel Settings menjadi:
```bash
npx prisma db push && next build
```
*Ini memastikan setiap kali Anda deploy, struktur database akan disinkronisasi.*

---

## 6. Post-Deployment Verification

Setelah deployment berhasil, lakukan testing berikut:

### ✅ Checklist Testing

- [ ] **Authentication**: Register user baru dan login
- [ ] **Dashboard**: Verify KPI cards dan charts load tanpa error
- [ ] **Trade CRUD**: Create, edit, dan delete trade
- [ ] **Settings CRUD**: Update settings dan verify persistence
- [ ] **AI Features**: Test AI Pattern Warning dan AI Trade Insight (jika `GEMINI_API_KEY` diset)
- [ ] **Risk Management**: Test daily loss limit dan trade locking
- [ ] **Responsiveness**: Test di mobile dan desktop
- [ ] **Console Check**: Tidak ada error di browser console

---

## 7. Troubleshooting

### Error: "PrismaClientInitializationError"

**Penyebab**: `DATABASE_URL` atau `DIRECT_URL` tidak valid atau tidak diset.

**Solusi**:
1. Verify environment variables di Vercel Dashboard
2. Pastikan connection string menggunakan format yang benar
3. Redeploy aplikasi setelah update env vars

---

### Error: "Table does not exist"

**Penyebab**: Database schema belum di-push ke Supabase.

**Solusi**:
1. Jalankan `npx prisma db push` dari local (dengan `.env` pointing ke Supabase)
2. Atau update Build Command di Vercel: `npx prisma db push && next build`
3. Redeploy

---

### Error: "NEXTAUTH_URL is not defined"

**Penyebab**: Environment variable `NEXTAUTH_URL` tidak diset di Vercel.

**Solusi**:
1. Tambahkan `NEXTAUTH_URL` di Vercel Environment Variables
2. Value: `https://[your-app-name].vercel.app`
3. Redeploy

---

### AI Features tidak berfungsi

**Penyebab**: `GEMINI_API_KEY` tidak diset atau tidak valid.

**Solusi**:
1. Dapatkan API key dari [Google AI Studio](https://aistudio.google.com/apikey)
2. Tambahkan `GEMINI_API_KEY` di Vercel Environment Variables
3. Redeploy
4. Jika masih tidak berfungsi, check browser console untuk error messages

---

## Catatan Penting

*   Saat beralih ke PostgreSQL, data lama di SQLite (`dev.db`) **tidak akan terbawa otomatis**. Anda akan mulai dengan database kosong di Supabase.
*   Pastikan Variable `NEXTAUTH_URL` di Vercel tidak menggunakan `localhost`.
*   Untuk development lokal, Anda bisa tetap menggunakan SQLite dengan mengubah `DATABASE_URL` di `.env` lokal ke `file:./dev.db` dan `provider` di schema ke `sqlite`.

