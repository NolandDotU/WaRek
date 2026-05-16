# WaRek Deployment - Quick Reference 🚀

Copy-paste commands aja, tinggal replace variable yang perlu.

---

## Prerequisites Check

```bash
# Install CLI tools (Windows: gunakan WSL atau PowerShell dengan admin)
gcloud --version
firebase --version
node --version
npm --version

# Login
gcloud auth login
gcloud config set project YOUR_GCP_PROJECT_ID
firebase login
firebase use YOUR_FIREBASE_PROJECT_ID
```

---

## Setup Environment Variables

### Backend
```bash
cat > backend/.env << EOF
GEMINI_API_KEY=your_actual_gemini_key_from_aistudio.google.com
CORS_ORIGINS=https://YOUR_PROJECT_ID.web.app,http://localhost:5173
GOOGLE_CLOUD_PROJECT=YOUR_GCP_PROJECT_ID
GCS_BUCKET_NAME=optional_bucket_name
EOF
```

### Frontend (setelah Cloud Run deployed)
```bash
# Dapatkan Cloud Run URL dulu:
CLOUD_RUN_URL=$(gcloud run services describe warek-backend \
  --region asia-southeast2 --format 'value(status.url)')

cat > frontend/.env << EOF
VITE_API_BASE_URL=${CLOUD_RUN_URL}/api
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT_ID.firebaseapp.com
VITE_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT_ID.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
EOF
```

---

## Deploy Backend

```bash
# Build & push Docker image, deploy to Cloud Run
cd backend
gcloud builds submit --config ../cloudbuild.yaml

# Tunggu ~3-5 menit...
# Check status
gcloud run services describe warek-backend --region asia-southeast2

# Dapatkan URL
gcloud run services describe warek-backend \
  --region asia-southeast2 \
  --format 'value(status.url)'

# Test
BACKEND_URL=$(gcloud run services describe warek-backend \
  --region asia-southeast2 --format 'value(status.url)')
curl ${BACKEND_URL}/health
```

---

## Deploy Frontend

```bash
# Build
cd frontend
npm install
npm run build
cd ..

# Deploy hosting + firestore rules
firebase deploy --only hosting,firestore:rules

# Tunggu ~1 menit...
# Check
firebase open hosting:site
```

---

## Test Live App

```bash
# Open di browser
FRONTEND_URL=$(cat .firebaserc | grep -o '"[^"]*"' | sed -n '4p' | tr -d '"')
echo "https://${FRONTEND_URL}.web.app"

# Test steps:
# 1. Home tab -> isi form -> simpan
# 2. Firestore Console -> check data di transactions/{uid}/records
# 3. Dashboard tab -> lihat metrics & AI advisor
```

---

## Troubleshooting Commands

```bash
# View backend logs
gcloud run services describe warek-backend --region asia-southeast2

# View Cloud Run logs detailed
gcloud run services logs read warek-backend --region asia-southeast2

# Check Firestore rules
firebase rules:list

# View Firebase Hosting logs
firebase functions:log

# Clear frontend build cache
cd frontend
rm -rf dist/ node_modules/
npm install
npm run build

# Reset Firebase project (destructive!)
firebase use --add
```

---

## Verify Deployment

```bash
# Health check
curl https://warek-backend-xxxxx.run.app/health

# API test
curl -X POST https://warek-backend-xxxxx.run.app/api/advisor \
  -H "Content-Type: application/json" \
  -d '{"transactions": [{"tanggal":"2026-05-09","keterangan":"Test","jumlah":10000,"tipe":"pemasukan","kategori":"penjualan"}]}'

# Frontend status
curl https://YOUR_PROJECT_ID.web.app -I
```

---

## Emergency Rollback

```bash
# Stop Cloud Run service
gcloud run services update warek-backend \
  --region asia-southeast2 \
  --no-traffic

# Rollback Firebase Hosting
firebase hosting:channels:list
firebase hosting:channels:delete CHANNEL_ID
```

---

## Monitoring

```bash
# Cloud Run metrics
gcloud monitoring metrics list | grep run

# Firestore stats
firebase firestore:delete transactions --recursive

# See active deployments
firebase hosting:sites:list
```

---

## One-liner Cheatsheet

```bash
# Deploy all at once (from root project)
cd backend && gcloud builds submit --config ../cloudbuild.yaml && cd ../frontend && npm run build && cd .. && firebase deploy --only hosting,firestore:rules

# Get all URLs
echo "Backend: $(gcloud run services describe warek-backend --region asia-southeast2 --format 'value(status.url)')"
echo "Frontend: https://$(cat .firebaserc | grep -o '"[^"]*"' | sed -n '4p' | tr -d '"').web.app"

# Quick test everything
firebase deploy && npm run build && curl $(gcloud run services describe warek-backend --region asia-southeast2 --format 'value(status.url)')/health
```

---

## Before Presenting to Judges

```bash
# Final checklist
./verify-deploy.sh

# Test advisor notebook
jupyter notebook test_advisor.ipynb

# Open demo browser tabs
firebase open hosting:site
gcloud run services describe warek-backend --region asia-southeast2 --format 'value(status.url)'

# Refresh Firestore sample data
firebase firestore:delete transactions --recursive

# Add fresh test data via UI
# Demo app flow
```

---

## Common Issues & Quick Fixes

| Issue | Fix |
|-------|-----|
| `Permission denied` | `gcloud projects add-iam-policy-binding YOUR_PROJECT_ID --member=user:YOUR_EMAIL --role=roles/editor` |
| `GEMINI_API_KEY not set` | Set in `backend/.env` or Cloud Run environment |
| `CORS error` | Update `CORS_ORIGINS` in `backend/.env` with frontend domain |
| `Firestore permission denied` | Enable Anonymous Auth in Firebase Console |
| `npm install slow` | Run from WSL or Mac terminal (not Windows PowerShell) |
| `Cloud Build timeout` | Check Dockerfile, increase timeout in Cloud Build settings |

---

**🚀 Done! Ready to demo!**
