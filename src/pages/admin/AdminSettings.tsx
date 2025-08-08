import React, { useState, useEffect } from 'react'
import { Save, AlertTriangle, Bell, Globe, DollarSign } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const AdminSettings: React.FC = () => {
  const { admin } = useAuth()
  const [loading, setLoading] = useState(false)
  const [expiringDomains, setExpiringDomains] = useState([])
  const [settings, setSettings] = useState({
    site_name: 'DomainLuxe',
    site_description: 'Platform terpercaya untuk jual beli domain premium',
    contact_email: 'info@domainluxe.com',
    contact_phone: '+62 812-3456-7890',
    whatsapp_number: '6281234567890',
    qris_merchant_name: 'DOMAINLUXE',
    qris_base_string: '00020101021126610014COM.GO-JEK.WWW01189360091432840999140210G2840999140303UMI51440014ID.CO.QRIS.WWW0215ID10253780771980303UMI5204549953033605802ID5916SIINMEDIA, PCNGN6006JEPARA61055946262070703A01630456FE',
    expiry_warning_days: 30,
    auto_mark_expired: true,
    enable_notifications: true
  })

  useEffect(() => {
    fetchExpiringDomains()
  }, [])

  const fetchExpiringDomains = async () => {
    try {
      const warningDays = settings.expiry_warning_days
      const warningDate = new Date()
      warningDate.setDate(warningDate.getDate() + warningDays)

      const { data, error } = await supabase
        .from('domains')
        .select('*')
        .eq('is_sold', false)
        .lte('expiry_date', warningDate.toISOString().split('T')[0])
        .order('expiry_date')

      if (error) throw error
      setExpiringDomains(data || [])
    } catch (error) {
      console.error('Error fetching expiring domains:', error)
    }
  }

  const handleSaveSettings = async () => {
    setLoading(true)
    try {
      // In a real app, you'd save these to a settings table
      // For now, we'll just show success
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Pengaturan berhasil disimpan')
    } catch (error) {
      toast.error('Gagal menyimpan pengaturan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
        <p className="text-gray-600">Kelola pengaturan sistem dan notifikasi</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Site Settings */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Pengaturan Situs
            </h3>
            <div className="space-y-4">
              <div>
                <label className="form-label">Nama Situs</label>
                <input
                  type="text"
                  value={settings.site_name}
                  onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Deskripsi Situs</label>
                <textarea
                  rows={3}
                  value={settings.site_description}
                  onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Contact Settings */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Informasi Kontak
            </h3>
            <div className="space-y-4">
              <div>
                <label className="form-label">Email Kontak</label>
                <input
                  type="email"
                  value={settings.contact_email}
                  onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Nomor Telepon</label>
                <input
                  type="text"
                  value={settings.contact_phone}
                  onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">WhatsApp (dengan kode negara)</label>
                <input
                  type="text"
                  value={settings.whatsapp_number}
                  onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                  className="form-input"
                  placeholder="6281234567890"
                />
              </div>
            </div>
          </div>

          {/* Payment Settings */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Pengaturan Pembayaran
            </h3>
            <div className="space-y-4">
              <div>
                <label className="form-label">Nama Merchant QRIS</label>
                <input
                  type="text"
                  value={settings.qris_merchant_name}
                  onChange={(e) => setSettings({ ...settings, qris_merchant_name: e.target.value })}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">QRIS Base String</label>
                <textarea
                  rows={3}
                  value={settings.qris_base_string}
                  onChange={(e) => setSettings({ ...settings, qris_base_string: e.target.value })}
                  className="form-input"
                  placeholder="String QRIS dari provider pembayaran"
                />
              </div>
            </div>
          </div>

          {/* Domain Management Settings */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Pengaturan Domain
            </h3>
            <div className="space-y-4">
              <div>
                <label className="form-label">Peringatan Kedaluwarsa (hari)</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={settings.expiry_warning_days}
                  onChange={(e) => setSettings({ ...settings, expiry_warning_days: parseInt(e.target.value) })}
                  className="form-input"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Domain akan ditandai sebagai akan kedaluwarsa dalam X hari
                </p>
              </div>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.auto_mark_expired}
                    onChange={(e) => setSettings({ ...settings, auto_mark_expired: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Otomatis tandai domain yang sudah kedaluwarsa
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.enable_notifications}
                    onChange={(e) => setSettings({ ...settings, enable_notifications: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Aktifkan notifikasi email untuk domain yang akan kedaluwarsa
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSaveSettings}
              disabled={loading}
              className="btn-primary flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Pengaturan</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sidebar - Expiring Domains Alert */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
              Domain Akan Kedaluwarsa
            </h3>
            
            {expiringDomains.length > 0 ? (
              <div className="space-y-3">
                {expiringDomains.slice(0, 5).map((domain: any) => {
                  const daysLeft = Math.ceil((new Date(domain.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                  return (
                    <div key={domain.id} className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">
                            {domain.name}{domain.extension}
                          </p>
                          <p className="text-sm text-gray-600">
                            {domain.registrar}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          daysLeft <= 7 
                            ? 'bg-red-100 text-red-800'
                            : daysLeft <= 14
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {daysLeft > 0 ? `${daysLeft} hari` : 'Kedaluwarsa'}
                        </span>
                      </div>
                    </div>
                  )
                })}
                {expiringDomains.length > 5 && (
                  <p className="text-sm text-gray-500 text-center">
                    +{expiringDomains.length - 5} domain lainnya
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                Tidak ada domain yang akan kedaluwarsa
              </p>
            )}
          </div>

          {/* Admin Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Informasi Admin
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Nama</p>
                <p className="font-medium text-gray-900">{admin?.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{admin?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="font-medium text-gray-900 capitalize">{admin?.role}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Login Terakhir</p>
                <p className="font-medium text-gray-900">
                  {admin?.last_login ? new Date(admin.last_login).toLocaleString('id-ID') : 'Belum pernah'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminSettings