# WaRek - Deployment Guide 🚀

Deploy WaRek ke Google Cloud Run (backend) + Firebase Hosting (frontend) untuk presentasi juri.

---

## Prerequisites

Pastikan sudah punya:
- [ ] Google Cloud Project (dengan billing enabled)
- [ ] Firebase Project (linked ke GCP project yang sama)
- [ ] `gcloud` CLI installed & authenticated
- [ ] `firebase` CLI installed & authenticated
- [ ] Gemini API Key (dapatkan dari Google AI Studio)

**Setup awal (kalau belum):**
```bash
# Install gcloud
# https://cloud.google.com/sdk/docs/install

# Install firebase CLI
npm install -g firebase-tools

# Login & set project
gcloud auth login
gcloud config set project YOUR_GCP_PROJECT_ID
firebase login
firebase use YOUR_FIREBASE_PROJECT_ID
```

---

## Step 1: Setup GCP Project & Firestore

### 1.1 Enable APIs
```bash
gcloud services enable \
  run.googleapis.com \
  firestore.googleapis.com \
  cloudbuild.googleapis.com \
  cloudresourcemanager.googleapis.com
```

### 1.2 Create Firestore Database
```bash
# Buat Firestore di mode Datastore/Native
# Via Console: Firestore > Create Database > Native mode
# Region: asia-southeast2 (Indonesia)
```

### 1.3 Enable Anonymous Authentication di Firebase
1. Firebase Console > Authentication > Sign-in method
2. Enable "Anonymous"
3. Save

---

## Step 2: Deploy Backend ke Cloud Run

### 2.1 Set Backend Environment Variables

Edit `backend/.env` dengan value sebenarnya:

```bash
cat > backend/.env << 'EOF'
GEMINI_API_KEY=your_actual_gemini_api_key_here
GCS_BUCKET_NAME=your_gcs_bucket_name_optional
CORS_ORIGINS=https://your-firebase-project.web.app,http://localhost:5173
GOOGLE_CLOUD_PROJECT=YOUR_GCP_PROJECT_ID
EOF
```

**Dapatkan GEMINI_API_KEY:**
1. Buka https://aistudio.google.com/app/apikey
2. Klik "Create API key"
3. Copy key ke file `.env`

### 2.2 Build & Deploy via Cloud Build

```bash
# Dari root project
cd backend
gcloud builds submit --config ../cloudbuild.yaml
```

Cloud Build akan:
- Build Docker image
- Push ke Google Container Registry
- Deploy ke Cloud Run (region: asia-southeast2)

**Tunggu ~3-5 menit hingga selesai.**

### 2.3 Dapatkan Cloud Run URL

```bash
gcloud run services describe warek-backend \
  --region asia-southeast2 \
  --format 'value(status.url)'
```

Catat URL ini, misalnya: `https://warek-backend-xxxxx.run.app`

### 2.4 Verifikasi Backend

```bash
curl https://warek-backend-xxxxx.run.app/health
# Expected: {"status":"ok","service":"warek-backend"}
```

---

## Step 3: Deploy Frontend ke Firebase Hosting

### 3.1 Set Frontend Environment Variables

Buat file `frontend/.env` dengan:

```bash
cat > frontend/.env << 'EOF'
VITE_API_BASE_URL=https://warek-backend-xxxxx.run.app/api
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
EOF
```

**Dapatkan Firebase config:**
1. Firebase Console > Project Settings > Your apps
2. Copy nilai dari config object

### 3.2 Build Frontend

```bash
cd frontend
npm install
npm run build
```

Output akan di `frontend/dist/`

### 3.3 Deploy ke Firebase Hosting

```bash
# Dari root project
firebase deploy --only hosting,firestore:rules
```

**Tunggu hingga selesai (~1 menit)**

### 3.4 Dapatkan Hosting URL

```bash
firebase open hosting:site
# atau lihat di Firebase Console > Hosting
```

Atau check di `.firebaserc`:
```bash
cat .firebaserc
# hosting URL: https://YOUR_PROJECT_ID.web.app
```

---

## Step 4: Verification

### 4.1 Test Backend Health
```bash
curl https://warek-backend-xxxxx.run.app/health
```

### 4.2 Test Frontend
1. Buka: `https://YOUR_PROJECT_ID.web.app`
2. Lihat halaman home dengan TransactionForm
3. Klik tab "Dashboard" - lihat if advisor panel ada

### 4.3 Test Transaksi Simpan
1. Di Home tab, isi form:
   - Keterangan: "Penjualan nasi goreng"
   - Jumlah: 25000
   - Tipe: Pemasukan
   - Kategori: Penjualan
2. Klik "Simpan Transaksi"
3. Cek:
   - ✅ Notifikasi sukses muncul di UI
   - ✅ Data muncul di Firestore: `transactions/{uid}/records`
   - ✅ Dashboard update dengan metric baru

### 4.4 Test Advisor AI
1. Tambah beberapa transaksi
2. Ke tab Dashboard
3. Lihat AdvisorPanel - muncul insight dari Gemini 1.5 Flash

---

## Step 5: Optional Optimization

### 5.1 Custom Domain (Optional)
```bash
firebase hosting:channel:deploy main \
  --expires 7d \
  --public frontend/dist
```

### 5.2 Monitor Performance
```bash
# View Cloud Run logs
gcloud run services describe warek-backend \
  --region asia-southeast2

# View Firebase Hosting logs
firebase functions:log
```

---

## Troubleshooting

### "Permission denied" saat deploy
```bash
# Update IAM permissions
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member=user:YOUR_EMAIL \
  --role=roles/editor
```

### Frontend tidak konek ke backend
- Check `VITE_API_BASE_URL` di `frontend/.env` sudah benar
- Check CORS di `backend/.env` include domain hosting
- Rebuild frontend: `npm run build`

### Firestore realtime tidak muncul
- Check Anonymous Auth enabled di Firebase Console
- Check Firestore rules allow read/write dari auth.uid
- Buka DevTools > Application > Local Storage > firebase:...

### Advisor AI response kosong
- Check `GEMINI_API_KEY` valid dan punya quota
- Check `gemini-1.5-flash` model accessible
- Cek logs: `gcloud run services describe warek-backend --region asia-southeast2`

---

## Quick Deploy Commands (Cheatsheet)

```bash
# Backend
cd backend
gcloud builds submit --config ../cloudbuild.yaml

# Frontend
cd frontend
npm run build
cd ..
firebase deploy --only hosting,firestore:rules

# Check status
gcloud run services describe warek-backend --region asia-southeast2
firebase open hosting:site
```

---

## Environment Variables Checklist

### Backend (`backend/.env`)
- [ ] `GEMINI_API_KEY` - dari https://aistudio.google.com/app/apikey
- [ ] `CORS_ORIGINS` - Firebase Hosting domain + localhost dev
- [ ] `GOOGLE_CLOUD_PROJECT` - GCP project ID

### Frontend (`frontend/.env`)
- [ ] `VITE_API_BASE_URL` - Cloud Run service URL + `/api`
- [ ] `VITE_FIREBASE_PROJECT_ID` - dari Firebase Console
- [ ] `VITE_FIREBASE_API_KEY` - dari Firebase Web Config
- [ ] `VITE_FIREBASE_AUTH_DOMAIN` - `your_project.firebaseapp.com`
- [ ] `VITE_FIREBASE_STORAGE_BUCKET` - `your_project.appspot.com`
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID` - dari Firebase Console
- [ ] `VITE_FIREBASE_APP_ID` - dari Firebase Console

---

## Done! 🎉

WaRek sudah live di:
- **Backend API:** `https://warek-backend-xxxxx.run.app`
- **Frontend:** `https://YOUR_PROJECT_ID.web.app`

Ready untuk presentasi juri! 🚀
