# 🤖 Panduan Integrasi AI (Gemini)

## Fitur AI yang Tersedia

### 1. **AI Trading Coach** ✨
Memberikan feedback otomatis untuk setiap trade yang Anda input:
- Analisis kualitas trade berdasarkan data historis
- Identifikasi pola berbahaya (revenge trading, overtrading, FOMO)
- Saran konkret untuk perbaikan

### 2. **Pattern Detector** ⚠️
Mendeteksi kebiasaan buruk secara real-time:
- **Revenge Trading**: Trade terlalu cepat setelah loss
- **Overtrading**: Terlalu banyak trade dalam 24 jam
- **FOMO**: Trade tanpa checklist lengkap

### 3. **Weekly Summary** 📊 (Coming Soon)
Laporan mingguan otomatis dengan insight mendalam.

---

## Setup API Key

### 1. Dapatkan Gemini API Key

1. Buka [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Login dengan akun Google Anda
3. Klik **"Get API Key"** atau **"Create API Key"**
4. Salin API Key yang dihasilkan

### 2. Tambahkan ke Environment Variables

Buka file `.env` di root project Anda dan tambahkan:

```env
GEMINI_API_KEY=your_api_key_here
```

**Contoh:**
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
GEMINI_API_KEY="AIzaSyA..."
```

### 3. Restart Development Server

```bash
npm run dev
```

---

## Cara Menggunakan Fitur AI

### AI Pattern Warning (Dashboard)

Fitur ini **otomatis aktif** di dashboard. Jika sistem mendeteksi pola berbahaya, akan muncul peringatan kuning di bagian atas dashboard.

**Contoh Peringatan:**
- *"⚠️ Terdeteksi revenge trading! Kamu melakukan trade terlalu cepat setelah loss."*
- *"⚠️ Overtrading detected! Terlalu banyak trade dalam 24 jam terakhir."*

### AI Trade Insight (Recent Trades)

1. Buka **Dashboard**
2. Scroll ke bagian **"Aktivitas Terakhir"**
3. Klik tombol **"AI Insight"** di bawah setiap trade
4. AI akan menganalisis trade tersebut dan memberikan:
   - 💡 **Feedback**: Analisis singkat tentang trade
   - ⚠️ **Peringatan**: Jika ada red flag
   - ✅ **Saran**: Rekomendasi konkret

**Catatan:** Analisis pertama kali akan memakan waktu 2-5 detik. Setelah itu, hasil akan di-cache.

---

## Troubleshooting

### Error: "GEMINI_API_KEY is not defined"

**Solusi:**
1. Pastikan file `.env` ada di root project
2. Pastikan variabel `GEMINI_API_KEY` sudah ditambahkan
3. Restart development server (`Ctrl+C` lalu `npm run dev`)

### Error: "Failed to generate AI response"

**Kemungkinan Penyebab:**
1. API Key tidak valid atau expired
2. Quota API habis (Free tier: 60 requests/minute)
3. Koneksi internet bermasalah

**Solusi:**
- Cek API Key di [Google AI Studio](https://aistudio.google.com/app/apikey)
- Tunggu beberapa menit jika quota habis
- Pastikan koneksi internet stabil

### AI Insight tidak muncul

**Solusi:**
1. Pastikan ada minimal 3 trade di database
2. Refresh halaman dashboard
3. Cek console browser untuk error (F12)

---

## Quota & Pricing

### Free Tier (Gemini 2.0 Flash)
- **60 requests per minute**
- **1,500 requests per day**
- **Gratis selamanya**

Untuk aplikasi personal trading journal, quota ini **lebih dari cukup**.

### Upgrade (Opsional)
Jika Anda butuh lebih banyak request, bisa upgrade ke:
- **Gemini Pro**: Lebih akurat, quota lebih besar
- **Pay-as-you-go**: Bayar per request

Info lengkap: [Google AI Pricing](https://ai.google.dev/pricing)

---

## Tips Penggunaan

1. **Gunakan AI Insight untuk Review Mingguan**
   - Klik AI Insight di semua trade minggu ini
   - Catat pola yang sering muncul
   - Buat action plan berdasarkan saran AI

2. **Jangan Abaikan Pattern Warning**
   - Jika muncul warning revenge trading, **STOP** trading hari itu
   - Ambil napas, review jurnal, dan kembali besok

3. **Kombinasikan dengan Checklist**
   - AI hanya alat bantu, bukan pengganti disiplin
   - Tetap isi checklist pre-trade dengan jujur

---

## Roadmap Fitur AI

- [x] AI Trading Coach (Post-Trade Analysis)
- [x] Pattern Detector (Behavioral Alerts)
- [ ] Weekly Performance Summary
- [ ] Pre-Trade Advisor (Second Opinion)
- [ ] Journaling Assistant (Guided Notes)
- [ ] Loss Recovery Consultant

---

**Butuh bantuan?** Buka issue di GitHub atau hubungi developer.
