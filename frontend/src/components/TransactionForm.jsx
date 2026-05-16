import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { saveTransaction } from '../services/firebase'

const currencyFormatter = new Intl.NumberFormat('id-ID')

function TransactionForm({ userId, onSaved }) {
  const [tipe, setTipe] = useState('pemasukan')
  const [keterangan, setKeterangan] = useState('')
  const [jumlah, setJumlah] = useState('')
  const [kategori, setKategori] = useState('penjualan')
  const [tanggal, setTanggal] = useState(dayjs().format('YYYY-MM-DD'))
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    setKategori(tipe === 'pemasukan' ? 'penjualan' : 'bahan_baku')
  }, [tipe])

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!userId) {
      setFeedback({ type: 'error', message: 'Sesi pengguna belum siap. Coba login ulang dulu.' })
      return
    }

    const jumlahInt = Math.max(0, parseInt(String(jumlah || '0').replace(/[^0-9]/g, '')) || 0)
    if (!keterangan || !jumlahInt) {
      setFeedback({ type: 'error', message: 'Lengkapi keterangan dan jumlah transaksi dengan benar.' })
      return
    }

    const payload = {
      tanggal,
      keterangan,
      jumlah: jumlahInt,
      tipe,
      kategori,
    }

    try {
      setLoading(true)
      await saveTransaction(userId, payload)
      setFeedback({ type: 'success', message: 'Transaksi berhasil disimpan ✓' })
      setKeterangan('')
      setJumlah('')
      setTanggal(dayjs().format('YYYY-MM-DD'))
      onSaved && onSaved()
      window.setTimeout(() => setFeedback(null), 2500)
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Gagal menyimpan transaksi' })
      window.setTimeout(() => setFeedback(null), 3000)
    } finally {
      setLoading(false)
    }
  }

  const onJumlahChange = (v) => {
    const raw = String(v).replace(/[^0-9]/g, '')
    setJumlah(raw)
  }

  const incomeCats = [
    { value: 'penjualan', label: 'Penjualan' },
    { value: 'lainnya', label: 'Lainnya' },
  ]

  const expenseCats = [
    { value: 'bahan_baku', label: 'Bahan Baku' },
    { value: 'gaji', label: 'Gaji' },
    { value: 'operasional', label: 'Operasional' },
    { value: 'lainnya', label: 'Lainnya' },
  ]

  const categoryOptions = tipe === 'pemasukan' ? incomeCats : expenseCats

  return (
    <form onSubmit={onSubmit} className="card-lg space-y-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setTipe('pemasukan')}
          className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            tipe === 'pemasukan'
              ? 'bg-success text-white shadow-md'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          📥 Pemasukan
        </button>
        <button
          type="button"
          onClick={() => setTipe('pengeluaran')}
          className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            tipe === 'pengeluaran'
              ? 'bg-error text-white shadow-md'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          📤 Pengeluaran
        </button>
      </div>

      {feedback && (
        <div className={`rounded-lg px-3 py-2.5 text-sm font-medium border ${
          feedback.type === 'success'
            ? 'bg-green-50 text-green-600 border-green-200'
            : 'bg-red-50 text-red-600 border-red-200'
        }`}>
          {feedback.message}
        </div>
      )}

      <div className="space-y-4">
        <label className="flex flex-col gap-1.5">
          <span className="label">Keterangan</span>
          <input
            placeholder={tipe === 'pemasukan' ? 'Penjualan nasi goreng 10 porsi' : 'Beli bahan baku'}
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            className="input"
          />
          <span className="text-xs text-gray-500">Tulis singkat, jelas apa jenis transaksi ini</span>
        </label>

        <div className="grid grid-cols-3 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="label">Jumlah</span>
            <input
              placeholder="25.000"
              value={jumlah ? currencyFormatter.format(Number(jumlah)) : ''}
              onChange={(e) => onJumlahChange(e.target.value)}
              inputMode="numeric"
              className="input"
            />
            <span className="text-xs text-gray-500">Tanpa titik atau koma</span>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="label">Kategori</span>
            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              className="input cursor-pointer"
            >
              {categoryOptions.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="label">Tanggal</span>
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="input"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-2.5 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? '⏳ Menyimpan...' : '✅ Simpan Transaksi'}
        </button>
      </div>
    </form>
  )
}

export default TransactionForm
