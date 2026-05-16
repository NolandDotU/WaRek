function History({ transactions = [] }) {
  const isIncome = (tipe) => tipe === 'pemasukan'
  const icons = { penjualan: '🛍️', bahan_baku: '📦', gaji: '💼', operasional: '⚙️', lainnya: '💳' }
  const getIcon = (kategori) => icons[kategori] || icons.lainnya

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-500">Catatan Lengkap</p>
        <h1 className="text-3xl font-bold text-gray-900">Riwayat Transaksi</h1>
      </div>

      {transactions.length === 0 ? (
        <div className="card-lg text-center text-gray-500">
          Belum ada data transaksi.
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx, idx) => (
            <div key={idx} className="card flex items-center justify-between gap-4 group hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                  isIncome(tx.tipe)
                    ? 'bg-green-100'
                    : 'bg-red-100'
                }`}>
                  {getIcon(tx.kategori)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{tx.keterangan}</p>
                  <p className="text-xs text-gray-500 mt-1">{tx.tanggal} • {tx.kategori}</p>
                </div>
              </div>
              <div className={`flex-shrink-0 text-sm font-semibold ${
                isIncome(tx.tipe)
                  ? 'text-success'
                  : 'text-error'
              }`}>
                {isIncome(tx.tipe) ? '+' : '−'}{Number(Math.abs(tx.jumlah)).toLocaleString('id-ID')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default History
