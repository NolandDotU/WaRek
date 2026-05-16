import TransactionForm from '../components/TransactionForm'
import warekLogo from '../assets/warek.png'

function Home({ userId, onSaveTransactions }) {
  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Animated Hero Section */}
      <div>
        <img 
          src={warekLogo} 
          alt="WaRek Logo" 
          className="hero-image sticky top-0 z-10 w-48 h-48 mx-auto object-contain"
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-500">Form Input</p>
        <h1 className="text-3xl font-bold text-gray-900">Tambah Transaksi Baru</h1>
      </div>
      <TransactionForm userId={userId} onSaved={onSaveTransactions} />
    </div>
  )
}

export default Home
