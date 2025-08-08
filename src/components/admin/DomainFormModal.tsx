import React, { useState, useEffect } from 'react'
import { X, Upload, Save } from 'lucide-react'
import { supabase, Domain, DomainCategory } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../ui/LoadingSpinner'
import toast from 'react-hot-toast'

interface DomainFormModalProps {
  domain?: Domain | null
  onClose: () => void
  onSuccess: () => void
}

const DomainFormModal: React.FC<DomainFormModalProps> = ({
  domain,
  onClose,
  onSuccess
}) => {
  const { admin } = useAuth()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<DomainCategory[]>([])
  
  const [formData, setFormData] = useState({
    name: '',
    extension: '.id',
    price: '',
    category_id: '',
    registrar: '',
    registered_date: '',
    expiry_date: '',
    description: '',
    tags: '',
    is_featured: false,
    is_popular: false,
    status: 'available', // available, hot, promo, sold
    // Metrics
    da: '',
    pa: '',
    ss: '',
    dr: '',
    bl: ''
  })

  useEffect(() => {
    fetchCategories()
    if (domain) {
      setFormData({
        name: domain.name,
        extension: domain.extension,
        price: domain.price.toString(),
        category_id: domain.category_id || '',
        registrar: domain.registrar,
        registered_date: domain.registered_date,
        expiry_date: domain.expiry_date,
        description: domain.description || '',
        tags: domain.tags?.join(', ') || '',
        is_featured: domain.is_featured,
        is_popular: domain.is_popular,
        status: domain.is_sold ? 'sold' : 'available',
        da: domain.domain_metrics?.da.toString() || '',
        pa: domain.domain_metrics?.pa.toString() || '',
        ss: domain.domain_metrics?.ss.toString() || '',
        dr: domain.domain_metrics?.dr.toString() || '',
        bl: domain.domain_metrics?.bl || ''
      })
    }
  }, [domain])

  const fetchCategories = async () => {
    try {
      const { data } = await supabase
        .from('domain_categories')
        .select('*')
        .eq('is_active', true)
        .order('name')
      
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Prepare domain data
      const domainData = {
        name: formData.name.trim(),
        extension: formData.extension,
        price: parseFloat(formData.price),
        category_id: formData.category_id || null,
        registrar: formData.registrar.trim(),
        registered_date: formData.registered_date,
        expiry_date: formData.expiry_date,
        description: formData.description.trim() || null,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : null,
        is_featured: formData.is_featured,
        is_popular: formData.is_popular,
        is_sold: formData.status === 'sold',
        admin_id: admin?.id
      }

      let domainId: string

      if (domain) {
        // Update existing domain
        const { error } = await supabase
          .from('domains')
          .update(domainData)
          .eq('id', domain.id)

        if (error) throw error
        domainId = domain.id
        toast.success('Domain berhasil diperbarui')
      } else {
        // Create new domain
        const { data, error } = await supabase
          .from('domains')
          .insert([domainData])
          .select()
          .single()

        if (error) throw error
        domainId = data.id
        toast.success('Domain berhasil ditambahkan')
      }

      // Update or create metrics
      if (formData.da || formData.pa || formData.ss || formData.dr || formData.bl) {
        const metricsData = {
          domain_id: domainId,
          da: parseInt(formData.da) || 0,
          pa: parseInt(formData.pa) || 0,
          ss: parseInt(formData.ss) || 0,
          dr: parseFloat(formData.dr) || 0,
          bl: formData.bl || '0'
        }

        const { error: metricsError } = await supabase
          .from('domain_metrics')
          .upsert([metricsData])

        if (metricsError) {
          console.error('Error updating metrics:', metricsError)
        }
      }

      onSuccess()
    } catch (error) {
      console.error('Error saving domain:', error)
      toast.error('Gagal menyimpan domain')
    } finally {
      setLoading(false)
    }
  }

  const extensionOptions = [
    { value: '.id', label: '.ID' },
    { value: '.com', label: '.COM' },
    { value: '.org', label: '.ORG' },
    { value: '.ac.id', label: '.AC.ID' },
    { value: '.co.id', label: '.CO.ID' },
    { value: '.or.id', label: '.OR.ID' },
  ]

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              {domain ? 'Edit Domain' : 'Tambah Domain Baru'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Domain Name */}
              <div>
                <label className="form-label">Nama Domain *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                  placeholder="contoh: domainku"
                />
              </div>

              {/* Extension */}
              <div>
                <label className="form-label">Ekstensi *</label>
                <select
                  required
                  value={formData.extension}
                  onChange={(e) => setFormData({ ...formData, extension: e.target.value })}
                  className="form-input"
                >
                  {extensionOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="form-label">Harga (IDR) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1000"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="form-input"
                  placeholder="1500000"
                />
              </div>

              {/* Category */}
              <div>
                <label className="form-label">Kategori</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="form-input"
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Registrar */}
              <div>
                <label className="form-label">Registrar *</label>
                <input
                  type="text"
                  required
                  value={formData.registrar}
                  onChange={(e) => setFormData({ ...formData, registrar: e.target.value })}
                  className="form-input"
                  placeholder="Niagahoster"
                />
              </div>

              {/* Registered Date */}
              <div>
                <label className="form-label">Tanggal Pendaftaran *</label>
                <input
                  type="date"
                  required
                  value={formData.registered_date}
                  onChange={(e) => setFormData({ ...formData, registered_date: e.target.value })}
                  className="form-input"
                />
              </div>

              {/* Expiry Date */}
              <div>
                <label className="form-label">Tanggal Kedaluwarsa *</label>
                <input
                  type="date"
                  required
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="form-label">Deskripsi</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="form-input"
                placeholder="Deskripsi singkat tentang domain ini..."
              />
            </div>

            {/* Tags */}
            <div>
              <label className="form-label">Tags</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="form-input"
                placeholder="bisnis, teknologi, startup (pisahkan dengan koma)"
              />
            </div>

            {/* SEO Metrics */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Metrik SEO</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <label className="form-label">DA</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.da}
                    onChange={(e) => setFormData({ ...formData, da: e.target.value })}
                    className="form-input"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="form-label">PA</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.pa}
                    onChange={(e) => setFormData({ ...formData, pa: e.target.value })}
                    className="form-input"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="form-label">SS</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={formData.ss}
                    onChange={(e) => setFormData({ ...formData, ss: e.target.value })}
                    className="form-input"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="form-label">DR</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.dr}
                    onChange={(e) => setFormData({ ...formData, dr: e.target.value })}
                    className="form-input"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="form-label">BL</label>
                  <input
                    type="text"
                    value={formData.bl}
                    onChange={(e) => setFormData({ ...formData, bl: e.target.value })}
                    className="form-input"
                    placeholder="1K"
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="form-label">Status Domain</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="form-input"
              >
                <option value="available">Tersedia</option>
                <option value="hot">Hot 🔥</option>
                <option value="promo">Promo 💰</option>
                <option value="sold">Terjual</option>
              </select>
            </div>

            {/* Status Options */}
            <div className="flex space-x-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Domain Unggulan</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_popular}
                  onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Domain Populer</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                Batal
              </button>
              <button
                type="submit"
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
                    <span>{domain ? 'Perbarui' : 'Simpan'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default DomainFormModal