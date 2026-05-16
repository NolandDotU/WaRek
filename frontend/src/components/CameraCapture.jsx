import { useEffect, useRef, useState } from 'react'

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = (error) => reject(error)
  })

function CameraCapture({ userId = 'demo-user', onSaveTransactions }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [capturedImage, setCapturedImage] = useState('')
  const [transactions, setTransactions] = useState([])

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }

  const startCamera = async () => {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      })

      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
    } catch (err) {
      setError('Kamera tidak bisa diakses. Silakan gunakan upload foto sebagai alternatif.')
    }
  }

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [])

  const processOCR = async (imageBase64) => {
    setLoading(true)
    setError('')

    try {
      if (!userId) {
        throw new Error('User belum siap')
      }

      let imageUrl = ''
      const uploadResponse = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/upload-photo`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, imageBase64 }),
        },
      )

      if (uploadResponse.ok) {
        const uploadJson = await uploadResponse.json()
        imageUrl = uploadJson.imageUrl || ''
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/ocr`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, imageBase64, imageUrl }),
        },
      )

      if (!response.ok) {
        throw new Error('OCR gagal diproses')
      }

      const json = await response.json()
      setTransactions(json.transactions || [])
      setCapturedImage(imageBase64)
      setReviewOpen(true)
    } catch (err) {
      setError('Gagal membaca catatan. Foto kurang jelas atau server sedang sibuk.')
    } finally {
      setLoading(false)
    }
  }

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current

    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 720

    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    const imageBase64 = canvas.toDataURL('image/jpeg', 0.9)
    await processOCR(imageBase64)
  }

  const uploadFallback = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const base64 = await toBase64(file)
    await processOCR(base64)
  }

  const confirmSave = () => {
    onSaveTransactions?.(transactions)
    setReviewOpen(false)
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800">Scan buku catatan warung</h2>
      <p className="mt-1 text-sm text-slate-500">
        Foto catatan penjualan/pengeluaran. WaRek akan baca otomatis dengan AI.
      </p>

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
        <video ref={videoRef} className="h-64 w-full object-cover" playsInline muted />
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {loading ? (
        <div className="mt-4 animate-pulse space-y-2 rounded-xl border border-slate-200 p-4">
          <div className="h-4 w-32 rounded bg-slate-200" />
          <div className="h-3 w-full rounded bg-slate-200" />
          <div className="h-3 w-5/6 rounded bg-slate-200" />
        </div>
      ) : null}

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      {!userId ? <p className="mt-2 text-xs text-slate-500">Menyiapkan sesi aman Firebase...</p> : null}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={capturePhoto}
          disabled={!userId || loading}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-dark"
        >
          Ambil Foto & Proses OCR
        </button>

        <label className="cursor-pointer rounded-lg border border-primary px-4 py-2 text-center text-sm font-medium text-primary transition hover:bg-emerald-50">
          Upload Foto (Desktop)
          <input type="file" accept="image/*" onChange={uploadFallback} className="hidden" disabled={!userId || loading} />
        </label>
      </div>

      {reviewOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white p-5">
            <h3 className="text-lg font-semibold text-slate-800">Review transaksi hasil OCR</h3>
            <p className="mt-1 text-sm text-slate-500">
              Cek dulu sebelum disimpan ke histori transaksi.
            </p>

            {capturedImage ? (
              <img src={capturedImage} alt="Hasil foto catatan" className="mt-3 rounded-lg border border-slate-200" />
            ) : null}

            <div className="mt-4 space-y-2">
              {transactions.map((tx, index) => (
                <div key={`${tx.tanggal}-${tx.keterangan}-${index}`} className="rounded-lg border border-slate-200 p-3">
                  <p className="text-sm font-medium text-slate-800">{tx.keterangan}</p>
                  <p className="text-xs text-slate-500">
                    {tx.tanggal} • {tx.tipe} • {tx.kategori}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-primary">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      maximumFractionDigits: 0,
                    }).format(Number(tx.jumlah || 0))}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setReviewOpen(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmSave}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
              >
                Simpan Transaksi
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default CameraCapture
