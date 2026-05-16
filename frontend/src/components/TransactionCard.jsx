const formatRp = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value || 0)

function TransactionCard({ transaction }) {
  return (
    <article className="card hover:shadow-md transition-shadow">
      <p className="font-medium text-gray-900">{transaction.keterangan}</p>
      <p className="mt-1 text-xs text-gray-500">
        {transaction.tanggal} • {transaction.kategori} • {transaction.tipe}
      </p>
      <p className="mt-2 text-sm font-semibold text-primary">{formatRp(Number(transaction.jumlah || 0))}</p>
    </article>
  )
}

export default TransactionCard
