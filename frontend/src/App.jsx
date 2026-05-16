import { useEffect, useMemo, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'

import Dashboard from './pages/Dashboard'
import History from './pages/History'
import Home from './pages/Home'
import Intro from './pages/Intro'
import { db, loginAnon } from './services/firebase'
import './App.css'

const pageIcons = {
  home: (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  history: (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

function App() {
  const [page, setPage] = useState('home')
  const [transactions, setTransactions] = useState([])
  const [userId, setUserId] = useState('')
  const [syncError, setSyncError] = useState('')
  const [animating, setAnimating] = useState(false)
  const [showIntro, setShowIntro] = useState(true)

  useEffect(() => {
    let unsub = null

    const setupRealtime = async () => {
      try {
        const user = await loginAnon()
        setUserId(user.uid)

        if (!db) throw new Error('Firestore belum siap')

        const recordsRef = collection(db, 'transactions', user.uid, 'records')
        const q = query(recordsRef, orderBy('created_at', 'desc'))

        unsub = onSnapshot(
          q,
          (snapshot) => {
            const items = snapshot.docs.map((doc) => {
              const data = doc.data()
              return {
                id: doc.id,
                tanggal: data.tanggal,
                keterangan: data.keterangan,
                jumlah: data.jumlah,
                tipe: data.tipe,
                kategori: data.kategori,
                image_url: data.image_url || '',
              }
            })
            setTransactions(items)
            setSyncError('')
          },
          (error) => {
            setSyncError(
              `Firestore realtime error: ${error?.code || 'unknown'}${error?.message ? ` - ${error.message}` : ''}`,
            )
          },
        )
      } catch (error) {
        const fallbackUser = import.meta.env.VITE_DEMO_USER_ID || 'demo-user'
        setUserId(fallbackUser)
        setSyncError(
          `Mode demo aktif. Firebase belum siap: ${error?.code || 'unknown'}${error?.message ? ` - ${error.message}` : ''}`,
        )
        console.error('Firebase realtime init failed', error)
      }
    }

    setupRealtime()
    return () => {
      if (unsub) unsub()
    }
  }, [])

  const sortedTransactions = useMemo(
    () =>
      [...transactions].sort((a, b) => {
        if (a.tanggal === b.tanggal) return 0
        return a.tanggal > b.tanggal ? -1 : 1
      }),
    [transactions],
  )

  const handlePageChange = (id) => {
    if (id === page) return
    setAnimating(true)
    setTimeout(() => {
      setPage(id)
      setAnimating(false)
    }, 180)
  }

  const onSaveTransactions = () => handlePageChange('dashboard')

  const navItems = [
    { id: 'home', label: 'Beranda' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'history', label: 'Riwayat' },
  ]

  return (
    <>
      {showIntro && <Intro onStart={() => setShowIntro(false)} />}
      
      {!showIntro && (
        <div className="app-bg min-h-screen overflow-x-hidden">
          <div className="mx-auto w-full max-w-5xl px-4 pt-6 pb-28 sm:px-6 lg:px-8 relative z-10">
            {syncError && (
              <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm font-medium text-yellow-800 animate-pulse flex items-start gap-3">
                <span className="text-lg leading-none">⚠</span>
                <span>{syncError}</span>
              </div>
            )}

            <div className={`page-content ${animating ? 'fade-out' : 'fade-in'}`}>
              {page === 'home' && <Home userId={userId} onSaveTransactions={onSaveTransactions} />}
              {page === 'dashboard' && <Dashboard transactions={sortedTransactions} />}
              {page === 'history' && <History transactions={sortedTransactions} />}
            </div>
          </div>

          <nav className="nav-bar fixed bottom-0 left-0 right-0 z-50">
            <div className="nav-inner mx-auto max-w-5xl flex items-center gap-2 px-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handlePageChange(item.id)}
                  className={`nav-btn flex-1 flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 ${
                    page === item.id
                      ? 'nav-btn-active text-primary-dark bg-primary-light'
                      : 'text-gray-500 bg-transparent hover:text-primary hover:bg-green-100/30'
                  }`}
                >
                  <span className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
                    page === item.id
                      ? 'bg-gradient-to-br from-primary to-primary-dark text-white shadow-md'
                      : 'text-current'
                  }`}>
                    {pageIcons[item.id]}
                  </span>
                  {item.label}
                </button>
              ))}
            </div>
          </nav>
        </div>
      )}
    </>
  )
}

export default App