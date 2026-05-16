import {
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts'

const PIE_COLORS = ['#10b981', '#047857', '#f59e0b', '#3b82f6', '#64748b']

const formatRp = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value || 0)

function CashflowChart({ revenueTrend, expenseBreakdown, forecast }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card-lg">
        <div className="mb-2">
          <h3 className="text-base font-semibold text-gray-900">📈 Tren Pemasukan 7 Hari</h3>
          <p className="text-sm text-gray-500 mt-1">Pantau hari paling ramai dalam seminggu</p>
        </div>
        <div className="mt-6 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueTrend}>
              <XAxis dataKey="label" stroke="#d1d5db" />
              <YAxis stroke="#d1d5db" tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
              <Tooltip 
                formatter={(value) => formatRp(Number(value))}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                name="Pemasukan"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="forecast"
                name="Forecast"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="6 6"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card-lg">
        <div className="mb-2">
          <h3 className="text-base font-semibold text-gray-900">🥧 Komposisi Pengeluaran</h3>
          <p className="text-sm text-gray-500 mt-1">Lihat biaya terbesar per kategori</p>
        </div>
        <div className="mt-6 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={expenseBreakdown}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
              >
                {expenseBreakdown.map((entry, index) => (
                  <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatRp(Number(value))} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card-lg lg:col-span-2">
        <div className="mb-2">
          <h3 className="text-base font-semibold text-gray-900">🔮 Prediksi Cash-Flow 7 Hari</h3>
          <p className="text-sm text-gray-500 mt-1">Menggunakan rata-rata bergerak sederhana dari 14 hari terakhir</p>
        </div>
        <div className="mt-6 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={forecast}>
              <XAxis dataKey="label" stroke="#d1d5db" />
              <YAxis stroke="#d1d5db" tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
              <Tooltip 
                formatter={(value) => formatRp(Number(value))}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
              />
              <Line
                type="monotone"
                dataKey="cashflow"
                name="Prediksi cash-flow"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default CashflowChart
