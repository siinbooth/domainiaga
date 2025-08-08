import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  Calendar, 
  Globe, 
  TrendingUp, 
  Eye, 
  Share2, 
  Heart,
  ShoppingCart,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star
} from 'lucide-react'
import Header from '../../components/Layout/Header'
import Footer from '../../components/Layout/Footer'
import DomainCard from '../../components/domain/DomainCard'
import { supabase, Domain } from '../../lib/supabase'
import { formatCurrency, formatDate, getDaysUntilExpiry, generateTransactionId } from '../../lib/utils'
import { makeQRISString, generateQRCode, QRIS_BASE } from '../../lib/qris'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const DomainDetailPage: React.FC = () => {
  const { id } = useParams()
  const [domain, setDomain] = useState<Domain | null>(null)
  const [similarDomains, setSimilarDomains] = useState<Domain[]>([])
  const [loading, setLoading] = useState(true)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [purchaseStep, setPurchaseStep] = useState<'form' | 'payment' | 'confirmation'>('form')
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [transactionId, setTransactionId] = useState('')
  
  const [buyerInfo, setBuyerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    company: ''
  })

  useEffect(() => {
    if (id) {
      fetchDomain()
      incrementViewCount()
    }
  }, [id])

  const fetchDomain = async () => {
    try {
      const { data, error } = await supabase
        .from('domains')
        .select(`
          *,
          domain_categories(*),
          domain_metrics(*)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      setDomain(data)
      
      // Fetch similar domains
      if (data) {
        fetchSimilarDomains(data)
      }
    } catch (error) {
      console.error('Error fetching domain:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSimilarDomains = async (currentDomain: Domain) => {
    try {
      const { data, error } = await supabase
        .from('domains')
        .select(`
          *,
          domain_categories(*),
          domain_metrics(*)
        `)
        .eq('extension', currentDomain.extension)
        .eq('is_sold', false)
        .neq('id', currentDomain.id)
        .limit(3)

      if (error) throw error
      setSimilarDomains(data || [])
    } catch (error) {
      console.error('Error fetching similar domains:', error)
    }
  }

  const incrementViewCount = async () => {
    try {
      await supabase.rpc('increment_domain_views', { domain_uuid: id })
    } catch (error) {
      console.error('Error incrementing view count:', error)
    }
  }

  const handlePurchase = async () => {
    if (!domain) return

    try {
      const newTransactionId = generateTransactionId()
      setTransactionId(newTransactionId)

      // Create transaction record
      const { error } = await supabase
        .from('transactions')
        .insert([{
          domain_id: domain.id,
          transaction_id: newTransactionId,
          amount: domain.price,
          status: 'pending',
          payment_method: 'qris',
          buyer_info: buyerInfo
        }])

      if (error) throw error

      // Generate QRIS
      const qrisString = makeQRISString(QRIS_BASE, domain.price)
      const qrUrl = await generateQRCode(qrisString)
      setQrCodeUrl(qrUrl)

      setPurchaseStep('payment')
      toast.success('Transaksi berhasil dibuat')
    } catch (error) {
      console.error('Error creating transaction:', error)
      toast.error('Gagal membuat transaksi')
    }
  }

  const handlePaymentConfirmation = async () => {
    try {
      // Update transaction status
      await supabase
        .from('transactions')
        .update({ status: 'paid' })
        .eq('transaction_id', transactionId)

      setPurchaseStep('confirmation')
      toast.success('Konfirmasi pembayaran berhasil dikirim')
    } catch (error) {
      console.error('Error confirming payment:', error)
      toast.error('Gagal mengkonfirmasi pembayaran')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
        <Footer />
      </div>
    )
  }

  if (!domain) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Domain Tidak Ditemukan</h1>
          <p className="text-gray-600 mb-8">Domain yang Anda cari tidak tersedia atau sudah terjual.</p>
          <Link to="/" className="btn-primary">
            Kembali ke Beranda
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  const daysUntilExpiry = getDaysUntilExpiry(domain.expiry_date)
  const isExpiringSoon = daysUntilExpiry <= 30

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Domain Header */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-4">
              {domain.is_featured && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  <Star className="w-4 h-4 mr-1" />
                  Unggulan
                </span>
              )}
              {domain.is_popular && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Populer
                </span>
              )}
              {domain.is_sold && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  Terjual
                </span>
              )}
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              {domain.name}
              <span className="text-primary-600">{domain.extension}</span>
            </h1>
            
            {domain.description && (
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                {domain.description}
              </p>
            )}
            
            <div className="flex items-center justify-center space-x-6 text-gray-600">
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>{domain.view_count} views</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Dibuat {formatDate(domain.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Domain Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* SEO Metrics */}
              {domain.domain_metrics && (
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Metrik SEO
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {domain.domain_metrics.da}
                      </div>
                      <div className="text-sm text-gray-600">Domain Authority</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {domain.domain_metrics.pa}
                      </div>
                      <div className="text-sm text-gray-600">Page Authority</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {domain.domain_metrics.ss}
                      </div>
                      <div className="text-sm text-gray-600">Spam Score</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {domain.domain_metrics.dr}
                      </div>
                      <div className="text-sm text-gray-600">Domain Rating</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {domain.domain_metrics.bl}
                      </div>
                      <div className="text-sm text-gray-600">Backlinks</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Domain Information */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Informasi Domain
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Registrar</label>
                    <p className="text-gray-900 font-medium">{domain.registrar}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Kategori</label>
                    <p className="text-gray-900 font-medium">
                      {domain.domain_categories?.name || 'Tidak ada kategori'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tanggal Pendaftaran</label>
                    <p className="text-gray-900 font-medium">{formatDate(domain.registered_date)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tanggal Kedaluwarsa</label>
                    <p className={`font-medium ${isExpiringSoon ? 'text-red-600' : 'text-gray-900'}`}>
                      {formatDate(domain.expiry_date)}
                      {isExpiringSoon && (
                        <span className="ml-2 text-sm">
                          ({daysUntilExpiry} hari lagi)
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Tags */}
                {domain.tags && domain.tags.length > 0 && (
                  <div className="mt-6">
                    <label className="text-sm font-medium text-gray-500 block mb-2">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {domain.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Expiry Warning */}
              {isExpiringSoon && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-lg font-medium text-orange-900">
                        Domain Akan Kedaluwarsa
                      </h4>
                      <p className="text-orange-700 mt-1">
                        Domain ini akan kedaluwarsa dalam {daysUntilExpiry} hari. 
                        Pastikan untuk memperpanjang setelah pembelian.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Purchase Card */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 sticky top-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-primary-600 mb-2">
                    {formatCurrency(domain.price)}
                  </div>
                  <p className="text-gray-600">Harga Final</p>
                </div>

                {domain.is_sold ? (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Domain Terjual
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Domain ini sudah terjual pada {domain.sold_date ? formatDate(domain.sold_date) : 'tanggal tidak diketahui'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <button
                      onClick={() => setShowPurchaseModal(true)}
                      className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      <span>Beli Sekarang</span>
                    </button>
                    
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                        <Heart className="w-4 h-4" />
                        <span>Simpan</span>
                      </button>
                      <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                        <Share2 className="w-4 h-4" />
                        <span>Bagikan</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Trust Indicators */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Domain terverifikasi</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Transfer aman & cepat</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Dukungan 24/7</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Similar Domains */}
          {similarDomains.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                Domain Serupa
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {similarDomains.map((similarDomain) => (
                  <DomainCard key={similarDomain.id} domain={similarDomain} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowPurchaseModal(false)} />

            <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              {purchaseStep === 'form' && (
                <>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Informasi Pembeli
                  </h3>
                  <form onSubmit={(e) => { e.preventDefault(); handlePurchase(); }} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">Nama Lengkap *</label>
                        <input
                          type="text"
                          required
                          value={buyerInfo.name}
                          onChange={(e) => setBuyerInfo({ ...buyerInfo, name: e.target.value })}
                          className="form-input"
                        />
                      </div>
                      <div>
                        <label className="form-label">Email *</label>
                        <input
                          type="email"
                          required
                          value={buyerInfo.email}
                          onChange={(e) => setBuyerInfo({ ...buyerInfo, email: e.target.value })}
                          className="form-input"
                        />
                      </div>
                      <div>
                        <label className="form-label">Nomor Telepon *</label>
                        <input
                          type="tel"
                          required
                          value={buyerInfo.phone}
                          onChange={(e) => setBuyerInfo({ ...buyerInfo, phone: e.target.value })}
                          className="form-input"
                        />
                      </div>
                      <div>
                        <label className="form-label">Perusahaan (Opsional)</label>
                        <input
                          type="text"
                          value={buyerInfo.company}
                          onChange={(e) => setBuyerInfo({ ...buyerInfo, company: e.target.value })}
                          className="form-input"
                        />
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Ringkasan Pembelian</h4>
                      <div className="flex justify-between items-center">
                        <span>{domain.name}{domain.extension}</span>
                        <span className="font-semibold">{formatCurrency(domain.price)}</span>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowPurchaseModal(false)}
                        className="btn-secondary"
                      >
                        Batal
                      </button>
                      <button type="submit" className="btn-primary">
                        Lanjut ke Pembayaran
                      </button>
                    </div>
                  </form>
                </>
              )}

              {purchaseStep === 'payment' && (
                <>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Pembayaran QRIS
                  </h3>
                  <div className="text-center">
                    <div className="bg-primary-50 rounded-lg p-4 mb-6">
                      <p className="text-2xl font-bold text-primary-600">
                        {formatCurrency(domain.price)}
                      </p>
                      <p className="text-sm text-gray-600">ID: {transactionId}</p>
                    </div>
                    
                    {qrCodeUrl && (
                      <div className="mb-6">
                        <img src={qrCodeUrl} alt="QRIS Code" className="mx-auto border rounded-lg" />
                      </div>
                    )}
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                      <div className="flex items-start space-x-3">
                        <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div className="text-left">
                          <h4 className="font-medium text-yellow-900">Instruksi Pembayaran</h4>
                          <ol className="text-sm text-yellow-800 mt-2 space-y-1">
                            <li>1. Buka aplikasi mobile banking atau e-wallet</li>
                            <li>2. Pilih menu QRIS atau Scan QR</li>
                            <li>3. Scan kode QR di atas</li>
                            <li>4. Konfirmasi pembayaran</li>
                            <li>5. Klik "Saya Sudah Bayar" di bawah</li>
                          </ol>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handlePaymentConfirmation}
                      className="w-full btn-primary"
                    >
                      Saya Sudah Bayar
                    </button>
                  </div>
                </>
              )}

              {purchaseStep === 'confirmation' && (
                <>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Pembayaran Dikonfirmasi
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Terima kasih! Pembayaran Anda sedang diverifikasi. Kami akan menghubungi Anda dalam 1x24 jam.
                    </p>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <p className="text-sm text-blue-800">
                        <strong>WhatsApp:</strong> +62 812-3456-7890<br />
                        <strong>Email:</strong> support@domainluxe.com
                      </p>
                    </div>

                    <button
                      onClick={() => setShowPurchaseModal(false)}
                      className="btn-primary"
                    >
                      Tutup
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default DomainDetailPage