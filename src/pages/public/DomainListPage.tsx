import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Filter, SortAsc, SortDesc, Grid, List } from 'lucide-react'
import Header from '../../components/Layout/Header'
import Footer from '../../components/Layout/Footer'
import DomainCard from '../../components/domain/DomainCard'
import SearchBar from '../../components/search/SearchBar'
import { supabase, Domain } from '../../lib/supabase'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const DomainListPage: React.FC = () => {
  const { extension } = useParams()
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('q')
  
  const [domains, setDomains] = useState<Domain[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    fetchDomains()
  }, [extension, searchQuery, sortBy, sortOrder])

  const fetchDomains = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('domains')
        .select(`
          *,
          domain_categories(*),
          domain_metrics(*)
        `)
        .eq('is_sold', false)

      // Filter by extension
      if (extension && extension !== 'search') {
        const ext = getExtensionFromParam(extension)
        if (ext) {
          query = query.eq('extension', ext)
        }
      }

      // Filter by search query
      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,tags.cs.{${searchQuery}}`)
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })

      const { data, error } = await query

      if (error) throw error
      setDomains(data || [])
    } catch (error) {
      console.error('Error fetching domains:', error)
    } finally {
      setLoading(false)
    }
  }

  const getExtensionFromParam = (param: string): string | null => {
    const extensionMap: { [key: string]: string } = {
      'id': '.id',
      'com': '.com',
      'org': '.org',
      'ac-id': '.ac.id',
      'co-id': '.co.id',
      'or-id': '.or.id',
      'popular': '',
      'featured': ''
    }
    return extensionMap[param] || null
  }

  const getPageTitle = (): string => {
    if (searchQuery) return `Hasil Pencarian: "${searchQuery}"`
    
    const titles: { [key: string]: string } = {
      'id': 'Domain .ID',
      'com': 'Domain .COM',
      'org': 'Domain .ORG',
      'ac-id': 'Domain .AC.ID',
      'co-id': 'Domain .CO.ID',
      'or-id': 'Domain .OR.ID',
      'popular': 'Domain Populer',
      'featured': 'Domain Unggulan'
    }
    
    return titles[extension || ''] || 'Semua Domain'
  }

  const getPageDescription = (): string => {
    if (searchQuery) return `Menampilkan hasil pencarian untuk "${searchQuery}"`
    
    const descriptions: { [key: string]: string } = {
      'id': 'Koleksi domain .ID berkualitas tinggi untuk identitas digital Indonesia',
      'com': 'Domain .COM premium untuk bisnis global dan komersial',
      'org': 'Domain .ORG terpercaya untuk organisasi dan komunitas',
      'ac-id': 'Domain .AC.ID khusus untuk institusi akademik Indonesia',
      'co-id': 'Domain .CO.ID untuk perusahaan dan bisnis Indonesia',
      'or-id': 'Domain .OR.ID untuk organisasi resmi Indonesia',
      'popular': 'Domain dengan tingkat pencarian dan minat tertinggi',
      'featured': 'Domain pilihan dengan kualitas dan metrik SEO terbaik'
    }
    
    return descriptions[extension || ''] || 'Temukan domain berkualitas untuk kebutuhan Anda'
  }

  const filteredDomains = domains.filter(domain => {
    if (priceRange.min && domain.price < parseFloat(priceRange.min)) return false
    if (priceRange.max && domain.price > parseFloat(priceRange.max)) return false
    
    // Special filters for popular and featured
    if (extension === 'popular' && !domain.is_popular) return false
    if (extension === 'featured' && !domain.is_featured) return false
    
    return true
  })

  const sortOptions = [
    { value: 'created_at', label: 'Terbaru' },
    { value: 'price', label: 'Harga' },
    { value: 'name', label: 'Nama' },
    { value: 'view_count', label: 'Populer' },
    { value: 'expiry_date', label: 'Kedaluwarsa' }
  ]

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {getPageTitle()}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {getPageDescription()}
            </p>
          </div>
          
          {!searchQuery && <SearchBar />}
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters and Controls */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filter</span>
                </button>
                
                <div className="flex items-center space-x-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {filteredDomains.length} domain ditemukan
                </span>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-primary-100 text-primary-600' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-primary-100 text-primary-600' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Harga Minimum
                    </label>
                    <input
                      type="number"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Harga Maksimum
                    </label>
                    <input
                      type="number"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      placeholder="10000000"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => setPriceRange({ min: '', max: '' })}
                      className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                    >
                      Reset Filter
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Domain Grid/List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredDomains.length > 0 ? (
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }>
              {filteredDomains.map((domain) => (
                <DomainCard key={domain.id} domain={domain} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Filter className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Tidak ada domain ditemukan
                </h3>
                <p className="text-gray-600 mb-4">
                  Coba ubah filter atau kata kunci pencarian Anda
                </p>
                <button
                  onClick={() => {
                    setPriceRange({ min: '', max: '' })
                    setSortBy('created_at')
                    setSortOrder('desc')
                  }}
                  className="btn-primary"
                >
                  Reset Semua Filter
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default DomainListPage