function AdvisorPanel({ insight }) {
  const getToneClasses = (tipe) => {
    switch (tipe) {
      case 'warning':
        return 'bg-red-50 border-red-200 text-red-600'
      case 'positive':
        return 'bg-green-50 border-green-200 text-green-600'
      case 'tip':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-600'
    }
  }

  if (!insight) {
    return (
      <div className="card-lg">
        <h3 className="font-semibold text-gray-900">💡 Saran AI WaRek</h3>
        <p className="text-sm text-gray-500 mt-3">
          Belum ada insight. Tambahkan transaksi dulu supaya WaRek bisa kasih saran.
        </p>
      </div>
    )
  }

  const toneClasses = getToneClasses(insight.tipe)

  return (
    <div className={`card-lg border-2 ${toneClasses.replace('text-', 'border-')}`}>
      <h3 className={`font-semibold ${toneClasses.split(' ')[2]}`}>💡 Saran AI WaRek</h3>
      <p className={`text-sm mt-3 leading-relaxed ${toneClasses.split(' ')[2]}`}>{insight.insight}</p>
      <p className={`text-xs font-semibold mt-4 ${toneClasses.split(' ')[2]}`}>→ Aksi: {insight.aksi}</p>
    </div>
  )
}

export default AdvisorPanel
