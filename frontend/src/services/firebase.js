import { initializeApp } from 'firebase/app'
import { getAuth, signInAnonymously } from 'firebase/auth'
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore'
import {
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const hasFirebaseConfig = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

const app = hasFirebaseConfig ? initializeApp(firebaseConfig) : null
const db = app ? getFirestore(app) : null
const auth = app ? getAuth(app) : null

if (db) {
  enableIndexedDbPersistence(db).catch(() => {
    // Abaikan bila browser tidak mendukung atau multi-tab conflict.
  })
}

export async function loginAnon() {
  if (!auth) {
    throw new Error('Konfigurasi Firebase belum lengkap')
  }

  try {
    const result = await signInAnonymously(auth)
    return result.user
  } catch (error) {
    const message = error?.message || 'Gagal login anonim ke Firebase'
    const code = error?.code ? `${error.code}: ` : ''
    throw new Error(`${code}${message}`)
  }
}


// Save a transaction to Firestore under path transactions/{userId}/records
export async function saveTransaction(userId, transaction) {
  if (!db) throw new Error('Firestore belum terkonfigurasi')
  const ref = collection(db, 'transactions', userId, 'records')
  const payload = {
    ...transaction,
    created_at: serverTimestamp(),
  }
  const docRef = await addDoc(ref, payload)
  return docRef.id
}

// Simple fetch of recent transactions (non-realtime). Returns array of docs.
export async function getTransactionsOnce(userId, limit = 200) {
  if (!db) throw new Error('Firestore belum terkonfigurasi')
  const ref = collection(db, 'transactions', userId, 'records')
  const q = query(ref, orderBy('created_at', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

// Realtime listener helper: returns unsubscribe function
export function subscribeTransactions(userId, onUpdate, onError) {
  if (!db) throw new Error('Firestore belum terkonfigurasi')
  const ref = collection(db, 'transactions', userId, 'records')
  const q = query(ref, orderBy('created_at', 'desc'))
  return onSnapshot(q, (snap) => onUpdate(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), onError)
}
export { auth, db }
