# 🧹 TidyList – Minimalist Time-Tracking To-Do Web App

TidyList adalah aplikasi to-do list berbasis web yang berfokus pada **manajemen tugas personal** dengan pendekatan **desain minimalis dan visualisasi waktu**. Aplikasi ini memungkinkan pengguna untuk mencatat tugas-tugas harian berdasarkan kategori (belajar, kerja, olahraga, dll), serta melihat **grafik mingguan** tentang bagaimana waktu mereka digunakan.

## 🚀 Tech Stack

- **Frontend & Backend**: [Next.js](https://nextjs.org/)
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js (Email Login)
- **Charting**: Chart.js (untuk visualisasi data waktu)
- **Deployment**: Vercel

## 📦 Fitur Utama

| Fitur                | Deskripsi                                                                 |
|---------------------|--------------------------------------------------------------------------|
| ✅ To-Do List        | Tambah, ubah, hapus, dan kategorikan tugas harian                        |
| 📊 Visualisasi Waktu| Pie/bar chart mingguan penggunaan waktu berdasarkan kategori             |
| 🤖 TidyBot AI       | Asisten AI untuk insight, saran jadwal, analisis produktivitas           |
| 🔔 Reminder         | Pengingat tugas                                               |
| 📅 Riwayat          | Lihat dan lacak tugas yang telah diselesaikan                            |
| 🎨 Kustomisasi      | Dark mode, kategori fleksibel, urutan tugas bisa diubah                  |
| ☁️ Cloud Sync       | Akses data dari berbagai perangkat (akun login)                          |
| 🔐 Akun Pribadi     | Data pengguna tersimpan aman dan terisolasi dengan login                 |

## 📂 Struktur Proyek

```

tidylist/
├── prisma/                # Prisma schema dan migration
│   └── schema.prisma
├── public/                # Static assets (favicon, dll)
├── src/
│   ├── app/               # API routes & halaman frontend
│   ├── components/        # Reusable UI components
│   ├── lib/               # Prisma client, helper functions
│   ├── styles/            # CSS & Tailwind
│   └── types/             # TypeScript interfaces
├── .env                   # Konfigurasi
├── README.md              # Dokumentasi
└── package.json

````

## 🧪 Cara Menjalankan Secara Lokal

### 1. Clone repo
```bash
git clone https://github.com/beningkumalahaqi/tidylist
````

### 2. Install dependencies

```bash
npm install
# atau
yarn
```

### 3. Setup environment variables

Buat file `.env` dan isi seperti berikut:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/tidylist"
NEXTAUTH_SECRET="yoursecret"
GEMINI_API_KEY="your-gemini-api-key-here"
```

### 4. Setup Prisma dan database

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Jalankan aplikasi

```bash
npm run dev
# atau
yarn dev
```

Akses aplikasi di `http://localhost:3000`

## 🎯 Rencana Pengembangan

* [ ] Fitur kolaborasi tugas tim
* [ ] Reminder dengan push/email
* [ ] Dashboard analitik AI sederhana
* [ ] Gamifikasi (level, poin produktivitas)
* [ ] Progressive Web App (PWA)

## 📘 Dokumentasi Tambahan

### Entity Relationship Diagram (ERD)

* `User` → 1\:M → `Tugas`
* `User` → 1\:M → `Kategori`
* `Tugas` → 1:1 → `RiwayatTugas`
* `User` → 1:1 → `Visualisasi`

### Modul Frontend

* `/dashboard` – Halaman utama dengan visualisasi waktu & daftar tugas
* `/login` – Autentikasi pengguna
* `/kategori` – Pengelolaan kategori
* `/history` – Riwayat tugas

## 🤖 TidyBot - AI Assistant

TidyBot adalah asisten AI yang terintegrasi dengan Google Gemini AI untuk membantu pengguna mengelola tugas dengan lebih efektif.

### Fitur TidyBot:

#### 📊 **Fitur AI Utama**
- **Insight Mingguan**: Analisis performa tugas dan pola produktivitas
- **Saran Jadwal**: Optimalisasi penjadwalan berdasarkan prioritas dan deadline
- **Analisis Keseimbangan**: Evaluasi distribusi waktu antar kategori tugas
- **Tips Produktivitas**: Rekomendasi personal untuk meningkatkan efisiensi

#### 🧠 **Fitur AI Lanjutan**
- **Prioritas Cerdas**: AI menganalisis dan menyarankan prioritas optimal berdasarkan deadline, kompleksitas, dan dampak
- **Prediksi Waktu**: Estimasi waktu pengerjaan yang akurat berdasarkan riwayat dan kompleksitas tugas
- **Deteksi Burnout**: Identifikasi tanda-tanda kelelahan dan saran untuk menjaga keseimbangan
- **Optimasi Energi**: Rekomendasi penjadwalan berdasarkan pola energi dan performa harian
- **Pembentukan Kebiasaan**: Panduan untuk membentuk kebiasaan produktif berkelanjutan

#### 💬 **Chat Interface**
- Chat interaktif dengan TidyBot
- Pertanyaan cepat untuk produktivitas
- Respon contextual berdasarkan data tugas pengguna
- Dashboard insight AI real-time

### Setup TidyBot:

1. Dapatkan API key dari [Google AI Studio](https://aistudio.google.com/)
2. Tambahkan `GEMINI_API_KEY` ke file `.env`
3. TidyBot akan otomatis menganalisis data tugas Anda untuk memberikan insight yang personal

## 🤝 Kontributor

Kelompok 5 - Software Engineering

* Bening Kumala Haqi
* Faiq Naufal Yafi
* Muhammad Fauzi Affrizal Wibisana
* Mhd. Al-Hafidz Abd. Aziz Kurniawan
