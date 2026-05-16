# Deploy WaRek (Firebase + Cloud Run)

## 1) Backend ke Cloud Run

1. Isi environment variable di Cloud Run:
   - `GEMINI_API_KEY`
   - `GCS_BUCKET_NAME`
   - `CORS_ORIGINS` (contoh: `https://your-project.web.app`)
2. Build dan deploy otomatis via Cloud Build:

```bash
gcloud builds submit --config cloudbuild.yaml
```

3. Catat URL service Cloud Run, lalu set ke frontend:
   - `VITE_API_BASE_URL=https://<cloud-run-url>/api`

## 2) Frontend ke Firebase Hosting

1. Salin env:

```bash
cp frontend/.env.example frontend/.env
```

2. Isi semua variabel `VITE_FIREBASE_*` dan `VITE_API_BASE_URL`.
3. Build frontend:

```bash
cd frontend
npm install
npm run build
cd ..
```

4. Deploy Hosting + Firestore rules:

```bash
firebase deploy --only hosting,firestore:rules
```

## 3) Catatan realtime Firestore

Aplikasi login anonim ke Firebase Auth, lalu membaca data path:
`transactions/{uid}/records`

Pastikan Firebase Authentication (Anonymous) diaktifkan di project Firebase.
