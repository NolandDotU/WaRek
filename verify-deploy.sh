#!/bin/bash
# WaRek Pre-Deployment Verification Script
# Run this sebelum deploy untuk pastikan semua setup benar

set -e

echo "🔍 WaRek Pre-Deployment Verification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_cmd() {
  if command -v $1 &> /dev/null; then
    echo -e "${GREEN}✓${NC} $1 installed"
    return 0
  else
    echo -e "${RED}✗${NC} $1 NOT installed"
    return 1
  fi
}

check_file() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✓${NC} $1 exists"
    return 0
  else
    echo -e "${RED}✗${NC} $1 NOT found"
    return 1
  fi
}

check_env_var() {
  local var_name=$1
  local file_path=$2
  
  if grep -q "^$var_name=" "$file_path" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} $var_name set in $file_path"
    return 0
  else
    echo -e "${YELLOW}⚠${NC} $var_name NOT set or empty in $file_path"
    return 1
  fi
}

echo "📦 Checking Prerequisites..."
echo ""

# Check CLI tools
check_cmd "node" || exit 1
check_cmd "npm" || exit 1
check_cmd "gcloud" || exit 1
check_cmd "firebase" || exit 1
check_cmd "git" || exit 1

echo ""
echo "📁 Checking Project Structure..."
echo ""

# Check project files
check_file "backend/Dockerfile"
check_file "backend/requirements.txt"
check_file "backend/main.py"
check_file "cloudbuild.yaml"
check_file "firebase.json"
check_file "firestore.rules"
check_file "frontend/package.json"
check_file "frontend/vite.config.js"

echo ""
echo "🔧 Checking Configuration Files..."
echo ""

# Check backend .env
echo "Backend config (backend/.env):"
if [ -f "backend/.env" ]; then
  check_env_var "GEMINI_API_KEY" "backend/.env" || echo -e "${YELLOW}⚠${NC} Set GEMINI_API_KEY before deploy!"
  check_env_var "CORS_ORIGINS" "backend/.env" || true
  check_env_var "GOOGLE_CLOUD_PROJECT" "backend/.env" || true
else
  echo -e "${RED}✗${NC} backend/.env not found. Copy from backend/.env.example"
fi

echo ""

# Check frontend .env
echo "Frontend config (frontend/.env):"
if [ -f "frontend/.env" ]; then
  check_env_var "VITE_API_BASE_URL" "frontend/.env" || echo -e "${YELLOW}⚠${NC} Set VITE_API_BASE_URL to Cloud Run URL"
  check_env_var "VITE_FIREBASE_PROJECT_ID" "frontend/.env" || true
  check_env_var "VITE_FIREBASE_API_KEY" "frontend/.env" || true
else
  echo -e "${RED}✗${NC} frontend/.env not found. Copy from frontend/.env.example"
fi

echo ""
echo "📝 Checking GCP/Firebase Setup..."
echo ""

# Check gcloud auth
if gcloud auth list --filter=status:ACTIVE --format="value(account)" &>/dev/null; then
  echo -e "${GREEN}✓${NC} gcloud authenticated"
else
  echo -e "${RED}✗${NC} gcloud NOT authenticated. Run: gcloud auth login"
  exit 1
fi

# Check active project
PROJECT=$(gcloud config get-value project 2>/dev/null || echo "")
if [ -n "$PROJECT" ]; then
  echo -e "${GREEN}✓${NC} GCP Project: $PROJECT"
else
  echo -e "${RED}✗${NC} No active GCP project. Run: gcloud config set project YOUR_PROJECT_ID"
  exit 1
fi

# Check Firebase setup
if [ -f ".firebaserc" ]; then
  FIREBASE_PROJECT=$(cat .firebaserc | grep '"default"' | awk -F'"' '{print $4}')
  if [ -n "$FIREBASE_PROJECT" ]; then
    echo -e "${GREEN}✓${NC} Firebase Project: $FIREBASE_PROJECT"
  else
    echo -e "${RED}✗${NC} .firebaserc invalid. Run: firebase use YOUR_PROJECT_ID"
    exit 1
  fi
else
  echo -e "${RED}✗${NC} .firebaserc not found. Run: firebase init"
  exit 1
fi

echo ""
echo "🚀 All Checks Passed!"
echo ""
echo "Next steps:"
echo "1. cd backend && gcloud builds submit --config ../cloudbuild.yaml"
echo "2. Wait for Cloud Run deployment (~3-5 min)"
echo "3. Get Cloud Run URL: gcloud run services describe warek-backend --region asia-southeast2 --format 'value(status.url)'"
echo "4. Update frontend/.env VITE_API_BASE_URL with Cloud Run URL + /api"
echo "5. cd frontend && npm run build"
echo "6. firebase deploy --only hosting,firestore:rules"
echo ""
