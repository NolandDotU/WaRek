# 🏪 WaRek - Warung Keuangan AI

**WaRek adalah aplikasi web yang membantu pemilik warung/UMKM di Indonesia track keuangan harian dan membuat keputusan finansial lebih baik dengan bantuan AI advisor dalam bahasa Indonesia.**

---

## ⚡ Quick Links

- 📖 **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Step-by-step deploy ke Cloud Run + Firebase
- 🎬 **[JUDGES_DEMO.md](JUDGES_DEMO.md)** - Demo script & checklist untuk juri
- 🧪 **[test_advisor.ipynb](test_advisor.ipynb)** - Test notebook untuk advisor API
- ✅ **[DEPLOY.md](DEPLOY.md)** - Quick deploy instructions

---

## 🎯 Problem

**Pemilik warung/UMKM Indonesia menghadapi:**
1. **Disorganisasi finansial** - catat di buku/notes yang berantakan
2. **Blind decision making** - tidak tahu kemana uang pergi, susah ambil keputusan
3. **Akses ke expertise terbatas** - konsultan keuangan mahal, tidak terjangkau UMKM

---

## 💡 Solution

**WaRek: Dashboard keuangan REAL-TIME + AI Advisor**

### Core Features

#### 1. **TransactionForm - Input Cepat** ⚡
- Input manual tanpa OCR/camera
- Auto-format Rupiah
- Kategori smart-switch (Pemasukan/Pengeluaran)
- Notifikasi sukses instant
- ~15 detik per transaksi

#### 2. **Dashboard - Business Intelligence** 📊
- **Metric Cards:** Laba Bersih, Total Pemasukan, Pengeluaran, Transaksi Hari Ini
- **Revenue Trend:** Chart 7 hari terakhir
- **Expense Breakdown:** Pie chart by kategori (Bahan Baku, Gaji, Operasional, dll)
- **Moving Average Forecast:** Prediksi cashflow berdasarkan historical data

#### 3. **AI Advisor - Gemini 1.5 Flash** 🤖
- Analyze last 30 days transactions
- Generate actionable insights dalam **Bahasa Indonesia santai**
- Format: `{insight, tipe (warning/tip/positive), aksi}`
- **Real examples:**
  - ⚠️ WARNING: "Pengeluaran bahan baku melonjak 40%, cek supplier baru atau naik harga?"
  - 💡 TIP: "Penjualan stabil, coba promosi kategori produk yang untung lebih besar"
  - ✅ POSITIVE: "Cashflow positif 3 hari berturut, bagus! Pertahankan momentum"

#### 4. **History - Track & Filter** 📝
- List semua transaksi (realtime update)
- Filter by tanggal range / kategori
- Search by keterangan
- Swipe-to-delete (mobile-friendly)

#### 5. **PWA - Works Offline** 📱
- Installable ke home screen
- Service worker untuk offline support
- Responsive design (mobile-first)
- Real warung = poor signal → offline capability crucial

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│ Frontend (React + Vite + Tailwind CSS)                  │
│ - TransactionForm                                        │
│ - Dashboard (metrics + charts + advisor)                │
│ - History                                                │
│ - PWA manifest + service worker                         │
└──────────────────────────────────────────────────────────┘
                          ↓↑
        Firebase SDK (Anonymous Auth + Firestore Realtime)
                          ↓↑
┌─────────────────────────────────────────────────────────┐
│ Backend (FastAPI + Google Cloud)                        │
│ - POST /api/advisor (calls Gemini 1.5 Flash)           │
│ - Health check endpoint                                 │
│ - CORS middleware                                       │
└─────────────────────────────────────────────────────────┘
                          ↓↑
┌─────────────────────────────────────────────────────────┐
│ Cloud Infrastructure                                     │
│ - Cloud Run (backend, auto-scale)                       │
│ - Cloud Firestore (realtime database)                   │
│ - Firebase Hosting (static frontend)                    │
│ - Google Gemini API (AI advisor)                        │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Data Model

### Firestore Collection: `transactions/{userId}/records`

```javascript
{
  id: "auto-generated",
  tanggal: "2026-05-09",
  keterangan: "Penjualan nasi goreng 10 porsi",
  jumlah: 150000,
  tipe: "pemasukan" | "pengeluaran",
  kategori: "penjualan" | "bahan_baku" | "gaji" | "operasional" | "lainnya",
  created_at: Timestamp
}
```

### Advisor Request/Response

**Request:** `POST /api/advisor`
```json
{
  "transactions": [
    {
      "tanggal": "2026-05-09",
      "keterangan": "Penjualan nasi goreng",
      "jumlah": 150000,
      "tipe": "pemasukan",
      "kategori": "penjualan"
    }
  ]
}
```

**Response:**
```json
{
  "data": {
    "insight": "Penjualan konsisten bagus, tapi coba nambah produk dessert untuk cashflow sore hari",
    "tipe": "tip",
    "aksi": "Buat menu dessert 3-5 item, test 1 minggu"
  }
}
```

---

## 🚀 Quick Start (Development)

### Prerequisites
```bash
Node.js 18+
Python 3.12+
Git
```

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Create .env
cp .env.example .env
# Edit .env: set GEMINI_API_KEY

# Run
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Open http://localhost:5173
```

### Setup Firebase (Local Testing)
1. Create Firebase project
2. Enable Firestore (Native mode)
3. Enable Anonymous Auth
4. Copy web config ke `frontend/.env`

---

## 🌐 Production Deployment

### Option A: Cloud Run + Firebase (Recommended)
See **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** for step-by-step instructions.

### Option B: Docker + Any Server
```bash
cd backend
docker build -t warek-backend .
docker run -p 8000:8000 \
  -e GEMINI_API_KEY=your_key \
  -e CORS_ORIGINS=your_frontend_domain \
  warek-backend
```

---

## 🧪 Testing

### Test Advisor API
```bash
# Ensure backend running on http://localhost:8000
jupyter notebook test_advisor.ipynb
```

This notebook tests:
- ✅ Health endpoint
- ✅ Advisor endpoint with 3 scenarios (normal, warning, growth)
- ✅ AI response quality

---

## 📈 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite, Tailwind CSS v3, Recharts, dayjs |
| **Backend** | FastAPI, Pydantic v2, Google Generativeai (Gemini 1.5 Flash) |
| **Database** | Cloud Firestore (realtime, NoSQL) |
| **Infrastructure** | Google Cloud Run (serverless backend), Firebase Hosting (CDN frontend) |
| **AI** | Google Gemini 1.5 Flash API |
| **Auth** | Firebase Anonymous Auth |
| **Deployment** | Cloud Build (CI/CD), Cloud Run, Firebase CLI |

---

## 💰 Monetization (Future)

- **Freemium:** Basic features free, premium analytics Rp 10K/month
- **B2B Integration:** Partner dengan banks, e-wallets, UMKM associations
- **White-label:** Customize untuk corporate/bank internal tools

---

## 📞 Support & Contact

**For judges/presenters:**
1. Check [JUDGES_DEMO.md](JUDGES_DEMO.md) for demo script
2. Test locally: follow Quick Start above
3. Deploy & demo: follow [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

**Issues?**
- Backend health: `curl http://localhost:8000/health`
- Firestore connection: Check Firebase config in `frontend/.env`
- Advisor AI: Check `GEMINI_API_KEY` in `backend/.env`

---

## 📝 License

MIT

---

## 🎉 Credits

Made for **Everyone** 🚀

**Team:** CodeIn 
**Status:** MVP Ready ✅

---

**Last Updated:** May 9, 2026  
**Deployment Status:** Ready to deploy to Cloud Run + Firebase Hosting
