import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  Download,
  RefreshCw
} from 'lucide-react'
import { supabase, Transaction } from '../../lib/supabase'
import { formatCurrency, formatDate } from '../../lib/utils'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const AdminTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          domains(name, extension, price, registrar)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTransactions(data || [])
    } catch (error) {
      console.error('Error fetching transactions:', error)
      toast.error('Gagal memuat data transaksi')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (transactionId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus }
      
      if (newStatus === 'verified' || newStatus === 'completed') {
        updateData.verified_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('id', transactionId)

      if (error) throw error

      // If completed, mark domain as sold
      if (newStatus === 'completed') {
        const transaction = transactions.find(t => t.id === transactionId)
        if (transaction) {
          await supabase
            .from('domains')
            .update({ 
              is_sold: true, 
              sold_date: new Date().toISOString(),
              sold_price: transaction.amount 
            })
            .eq('id', transaction.domain_id)
        }
      }

      toast.success('Status transaksi berhasil diperbarui')
      fetchTransactions()
      setShowModal(false)
    } catch (error) {
      console.error('Error updating transaction:', error)
      toast.error('Gagal memperbarui status transaksi')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      paid: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Dibayar' },
      verified: { bg: 'bg-green-100', text: 'text-green-800', label: 'Terverifikasi' },
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Selesai' },
      failed: { bg: 'bg-red-100', text: 'text-red-800', label: 'Gagal' },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Dibatalkan' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    )
  }

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.domains?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.buyer_info?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || transaction.status === filterStatus

    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transaksi</h1>
          <p className="text-gray-600">Kelola semua transaksi pembelian domain</p>
        </div>
        <button
          onClick={fetchTransactions}
          className="btn-primary flex items-center space-x-2 mt-4 sm:mt-0"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari transaksi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Dibayar</option>
              <option value="verified">Terverifikasi</option>
              <option value="completed">Selesai</option>
              <option value="failed">Gagal</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaksi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Domain
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pembeli
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jumlah
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.transaction_id}
                        </div>
                        <div className="text-sm text-gray-500">
                          {transaction.payment_method.toUpperCase()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.domains?.name}{transaction.domains?.extension}
                        </div>
                        <div className="text-sm text-gray-500">
                          {transaction.domains?.registrar}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {transaction.buyer_info?.name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {transaction.buyer_info?.email || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(transaction.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(transaction.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(transaction.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedTransaction(transaction)
                          setShowModal(true)
                        }}
                        className="text-primary-600 hover:text-primary-900"
                        title="Lihat Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Tidak ada transaksi yang ditemukan</p>
            </div>
          )}
        </div>
      )}

      {/* Transaction Detail Modal */}
      {showModal && selectedTransaction && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowModal(false)} />

            <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Detail Transaksi
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Transaction Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">ID Transaksi</label>
                    <p className="text-gray-900">{selectedTransaction.transaction_id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="mt-1">
                      {getStatusBadge(selectedTransaction.status)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Domain</label>
                    <p className="text-gray-900">
                      {selectedTransaction.domains?.name}{selectedTransaction.domains?.extension}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Jumlah</label>
                    <p className="text-gray-900 font-semibold">
                      {formatCurrency(selectedTransaction.amount)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Metode Pembayaran</label>
                    <p className="text-gray-900">{selectedTransaction.payment_method.toUpperCase()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tanggal</label>
                    <p className="text-gray-900">{formatDate(selectedTransaction.created_at)}</p>
                  </div>
                </div>

                {/* Buyer Info */}
                {selectedTransaction.buyer_info && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Informasi Pembeli</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-gray-500">Nama</label>
                          <p className="text-gray-900">{selectedTransaction.buyer_info.name || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Email</label>
                          <p className="text-gray-900">{selectedTransaction.buyer_info.email || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Telepon</label>
                          <p className="text-gray-900">{selectedTransaction.buyer_info.phone || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Status Actions */}
                {selectedTransaction.status !== 'completed' && selectedTransaction.status !== 'cancelled' && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Ubah Status</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTransaction.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(selectedTransaction.id, 'paid')}
                            className="btn-primary flex items-center space-x-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Tandai Dibayar</span>
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(selectedTransaction.id, 'cancelled')}
                            className="btn-danger flex items-center space-x-2"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Batalkan</span>
                          </button>
                        </>
                      )}
                      {selectedTransaction.status === 'paid' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(selectedTransaction.id, 'verified')}
                            className="btn-primary flex items-center space-x-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Verifikasi</span>
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(selectedTransaction.id, 'failed')}
                            className="btn-danger flex items-center space-x-2"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Gagal</span>
                          </button>
                        </>
                      )}
                      {selectedTransaction.status === 'verified' && (
                        <button
                          onClick={() => handleStatusUpdate(selectedTransaction.id, 'completed')}
                          className="btn-primary flex items-center space-x-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Selesaikan</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminTransactions