import React from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Eye, TrendingUp, Shield } from 'lucide-react'
import { Domain } from '../../lib/supabase'
import { formatCurrency, formatDateShort, getDaysUntilExpiry } from '../../lib/utils'

interface DomainCardProps {
  domain: Domain
}

const DomainCard: React.FC<DomainCardProps> = ({ domain }) => {
  const daysUntilExpiry = getDaysUntilExpiry(domain.expiry_date)
  const isExpiringSoon = daysUntilExpiry <= 30

  return (
    <div className="domain-card bg-white rounded-xl p-6 border border-gray-200 relative overflow-hidden">
      {domain.is_sold && (
        <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium z-10">
          Terjual
        </div>
      )}
      
      {domain.is_featured && !domain.is_sold && (
        <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium z-10">
          Unggulan
        </div>
      )}
      
      {/* Hot Label */}
      {!domain.is_sold && !domain.is_featured && domain.tags?.includes('hot') && (
        <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium z-10 animate-pulse">
          🔥 Hot
        </div>
      )}
      
      {/* Promo Label */}
      {!domain.is_sold && !domain.is_featured && domain.tags?.includes('promo') && (
        <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium z-10">
          💰 Promo
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {domain.name}
          <span className="text-primary-600">{domain.extension}</span>
        </h3>
        
        {domain.description && (
          <p className="text-gray-600 text-sm line-clamp-2">
            {domain.description}
          </p>
        )}
      </div>

      {/* Metrics */}
      {domain.domain_metrics && (
        <div className="grid grid-cols-5 gap-2 mb-4 text-center">
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="text-xs text-gray-500">DA</div>
            <div className="font-semibold text-gray-900">{domain.domain_metrics.da}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="text-xs text-gray-500">PA</div>
            <div className="font-semibold text-gray-900">{domain.domain_metrics.pa}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="text-xs text-gray-500">SS</div>
            <div className="font-semibold text-gray-900">{domain.domain_metrics.ss}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="text-xs text-gray-500">DR</div>
            <div className="font-semibold text-gray-900">{domain.domain_metrics.dr}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="text-xs text-gray-500">BL</div>
            <div className="font-semibold text-gray-900">{domain.domain_metrics.bl}</div>
          </div>
        </div>
      )}

      {/* Price */}
      <div className="bg-primary-50 rounded-lg p-4 mb-4">
        <div className="text-sm text-primary-600 mb-1">Harga</div>
        <div className="text-2xl font-bold text-primary-700">
          {formatCurrency(domain.price)}
        </div>
      </div>

      {/* Domain Info */}
      <div className="space-y-2 mb-4 text-sm text-gray-600">
        <div className="flex items-center justify-between">
          <span>Registrar</span>
          <span className="font-medium">{domain.registrar}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Terdaftar</span>
          <span className="font-medium">{formatDateShort(domain.registered_date)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Kedaluwarsa</span>
          <span className={`font-medium ${isExpiringSoon ? 'text-red-600' : ''}`}>
            {formatDateShort(domain.expiry_date)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Dilihat</span>
          <span className="font-medium">{domain.view_count}x</span>
        </div>
      </div>

      {/* Tags */}
      {domain.tags && domain.tags.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {domain.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
              >
                {tag}
              </span>
            ))}
            {domain.tags.length > 3 && (
              <span className="text-gray-500 text-xs">
                +{domain.tags.length - 3} lainnya
              </span>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex space-x-2">
        <Link
          to={`/domain/${domain.id}`}
          className={`flex-1 text-center py-2 px-4 rounded-lg font-medium transition-colors ${
            domain.is_sold
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
              : 'bg-primary-500 hover:bg-primary-600 text-white'
          }`}
        >
          {domain.is_sold ? 'Terjual' : 'Lihat Detail'}
        </Link>
        <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors">
          <Eye className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default DomainCard