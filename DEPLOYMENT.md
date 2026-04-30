# E-Projexis — Panduan Deploy ke Vercel

## Prasyarat

- Akun [Vercel](https://vercel.com)
- Database PostgreSQL (rekomendasi: [Neon](https://neon.tech))
- Repository sudah di-push ke GitHub

---

## Langkah 1: Setup Database (Neon)

1. Buat project baru di [Neon Console](https://console.neon.tech)
2. Copy connection string (format: `postgresql://user:pass@host/dbname?sslmode=require`)
3. Jalankan migrasi schema dari lokal:

```bash
# Set DATABASE_URL ke connection string Neon production
DATABASE_URL="postgresql://..." npx prisma db push
```

---

## Langkah 2: Deploy ke Vercel

1. Import repository dari GitHub di [Vercel Dashboard](https://vercel.com/new)
2. Set **Environment Variables** berikut di Vercel:

| Variable | Deskripsi | Contoh |
|---|---|---|
| `DATABASE_URL` | Connection string PostgreSQL Neon | `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require` |
| `NEXTAUTH_URL` | URL production aplikasi | `https://e-projexis.vercel.app` |
| `NEXTAUTH_SECRET` | Random secret untuk NextAuth | Generate: `openssl rand -base64 32` |
| `SEED_SECRET` | Secret untuk API seed admin | Bebas, contoh: `my-super-secret-seed-key` |

3. Klik **Deploy**

> **Penting:** Jangan commit file `.env.production` ke repository. Semua env vars harus di-set di Vercel Dashboard.

---

## Langkah 3: Seed Admin User

Setelah deploy berhasil, buat admin pertama dengan memanggil seed API:

```bash
curl -X POST https://YOUR-APP.vercel.app/api/seed \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "YOUR_SEED_SECRET",
    "email": "admin@email.com",
    "password": "password-admin-anda",
    "name": "Admin"
  }'
```

Ganti:
- `YOUR-APP.vercel.app` dengan URL Vercel Anda
- `YOUR_SEED_SECRET` dengan nilai `SEED_SECRET` yang Anda set di Vercel
- `admin@email.com` dengan email admin yang diinginkan
- `password-admin-anda` dengan password yang aman

---

## Langkah 4: Login

Buka `https://YOUR-APP.vercel.app/login` dan login dengan email & password admin yang sudah di-seed.

---

## Troubleshooting

### Build gagal di Vercel
- Pastikan semua environment variables sudah di-set
- Cek build log di Vercel Dashboard

### Database error
- Pastikan `DATABASE_URL` benar dan menggunakan `?sslmode=require`
- Pastikan sudah menjalankan `npx prisma db push` terhadap database production

### NextAuth error
- Pastikan `NEXTAUTH_URL` sesuai dengan URL deployment
- Pastikan `NEXTAUTH_SECRET` sudah di-set

### Seed API gagal
- Pastikan `SEED_SECRET` di env var Vercel cocok dengan yang dikirim di request
- Cek apakah database sudah di-migrasi (schema sudah ada)
