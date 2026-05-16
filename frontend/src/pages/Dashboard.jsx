import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'

import AdvisorPanel from '../components/AdvisorPanel'

const CashflowChart = lazy(() => import('../components/CashflowChart'))

const formatRp = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value || 0)

const categoryLabel = {
  penjualan: 'Penjualan',
  bahan_baku: 'Bahan baku',
  gaji: 'Gaji',
  operasional: 'Operasional',
  lainnya: 'Lainnya',
}

const buildLastNDays = (n, getter) =>
  [...Array.from({ length: n })].map((_, idx) => {
    const date = dayjs().subtract(n - idx - 1, 'day')
    return getter(date)
  })

function Dashboard({ transactions = [] }) {
  const [advisor, setAdvisor] = useState(null)
  const [advisorLoading, setAdvisorLoading] = useState(false)

  const today = dayjs().format('YYYY-MM-DD')

  const metrics = useMemo(() => {
    let pemasukan = 0
    let pengeluaran = 0
    let transaksiHariIni = 0

    transactions.forEach((tx) => {
      if (tx.tipe === 'pemasukan') pemasukan += Number(tx.jumlah || 0)
      if (tx.tipe === 'pengeluaran') pengeluaran += Number(tx.jumlah || 0)
      if (tx.tanggal === today) transaksiHariIni += 1
    })

    return {
      pemasukan,
      pengeluaran,
      labaBersih: pemasukan - pengeluaran,
      transaksiHariIni,
    }
  }, [transactions, today])

  const revenueTrend = useMemo(
    () =>
      buildLastNDays(7, (date) => {
        const total = transactions
          .filter((tx) => tx.tipe === 'pemasukan' && tx.tanggal === date.format('YYYY-MM-DD'))
          .reduce((acc, item) => acc + Number(item.jumlah || 0), 0)

        return {
          label: date.format('DD MMM'),
          revenue: total,
          forecast: 0,
        }
      }),
    [transactions],
  )

  const expenseBreakdown = useMemo(() => {
    const grouped = {}

    transactions.forEach((tx) => {
      if (tx.tipe !== 'pengeluaran') return
      const key = tx.kategori || 'lainnya'
      grouped[key] = (grouped[key] || 0) + Number(tx.jumlah || 0)
    })

    return Object.entries(grouped).map(([name, value]) => ({
      name: categoryLabel[name] || name,
      value,
    }))
  }, [transactions])

  const forecast = useMemo(() => {
    const history14 = buildLastNDays(14, (date) => {
      const dailyNet = transactions
        .filter((tx) => tx.tanggal === date.format('YYYY-MM-DD'))
        .reduce((acc, item) => {
          const amount = Number(item.jumlah || 0)
          return item.tipe === 'pemasukan' ? acc + amount : acc - amount
        }, 0)

      return dailyNet
    })

    const averageNet =
      history14.length > 0
        ? history14.reduce((sum, value) => sum + value, 0) / history14.length
        : 0

    return buildLastNDays(7, (date) => ({
      label: date.add(1, 'day').format('DD MMM'),
      cashflow: Math.round(averageNet),
    }))
  }, [transactions])

  const chartData = useMemo(() => {
    const forecastMap = new Map(forecast.map((item) => [item.label, item.cashflow]))
    return revenueTrend.map((item) => ({
      ...item,
      forecast: forecastMap.get(item.label) || 0,
    }))
  }, [forecast, revenueTrend])

  useEffect(() => {
    const fetchAdvisor = async () => {
      if (!transactions.length) {
        setAdvisor(null)
        return
      }

      const last30 = transactions
        .filter((tx) => dayjs().diff(dayjs(tx.tanggal), 'day') <= 30)
        .map((tx) => ({
          tanggal: tx.tanggal,
          keterangan: tx.keterangan,
          jumlah: Number(tx.jumlah || 0),
          tipe: tx.tipe,
          kategori: tx.kategori,
        }))

      setAdvisorLoading(true)

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/advisor`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transactions: last30 }),
          },
        )

        if (!response.ok) {
          throw new Error('Gagal mengambil insight advisor')
        }

        const json = await response.json()
        setAdvisor(json.data)
      } catch {
        setAdvisor({
          insight: 'Data sudah masuk, tapi insight AI belum bisa dimuat sekarang.',
          tipe: 'tip',
          aksi: 'Coba refresh lagi dalam beberapa saat.',
        })
      } finally {
        setAdvisorLoading(false)
      }
    }

    fetchAdvisor()
  }, [transactions])

  const cards = [
    { label: 'Laba Bersih', value: formatRp(metrics.labaBersih), icon: '📊', color: 'success' },
    { label: 'Total Pemasukan', value: formatRp(metrics.pemasukan), icon: '📈', color: 'success' },
    { label: 'Total Pengeluaran', value: formatRp(metrics.pengeluaran), icon: '📉', color: 'error' },
    { label: 'Transaksi Hari Ini', value: metrics.transaksiHariIni, icon: '📋', color: 'accent' },
  ]

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const colorMap = {
            success: 'text-success',
            error: 'text-error',
            accent: 'text-accent',
          }
          return (
            <div key={card.label} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">{card.label}</p>
                  <p className={`text-2xl font-bold ${colorMap[card.color]}`}>{card.value}</p>
                </div>
                <span className="text-2xl">{card.icon}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div>
        {advisorLoading ? (
          <div className="card-lg h-32 animate-pulse" />
        ) : (
          <AdvisorPanel insight={advisor} />
        )}
      </div>

      <Suspense fallback={<div className="card-lg h-96 animate-pulse" />}>
        <CashflowChart
          revenueTrend={chartData}
          expenseBreakdown={expenseBreakdown.length ? expenseBreakdown : [{ name: 'Belum ada data', value: 1 }]}
          forecast={forecast}
        />
      </Suspense>
    </div>
  )
}

export default Dashboard
