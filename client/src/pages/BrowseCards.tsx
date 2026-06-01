import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi } from '../services/api.ts'
import { useStore } from '../store/useStore.ts'

const SUPPORTED_BRANDS = [
  'All', 'Amazon', 'Visa', 'Mastercard', 'Target', 'Walmart',
  'Best Buy', 'Steam', 'Apple', 'Google Play', 'Nike', 'Starbucks', 'Sephora'
]

interface Listing {
  id: string
  askingPrice: number
  listingType: string
  preferredBrand: string | null
  giftCard: {
    brand: string
    faceValue: number
  }
}

export default function BrowseCards() {
  const navigate = useNavigate()
  const api = useApi()
  const { balance } = useStore()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBrand, setSelectedBrand] = useState('All')

  useEffect(() => {
    api.getActiveListings(selectedBrand === 'All' ? undefined : selectedBrand)
      .then(data => setListings(data.listings))
      .catch(console.error)
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBrand])

  const discount = (faceValue: number, askingPrice: number) => {
    return (((faceValue - askingPrice) / faceValue) * 100).toFixed(0)
  }

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-[#1a1a2e]">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-[#e2e0db] bg-white">
        <button onClick={() => navigate('/dashboard')} className="text-xl font-semibold tracking-tight">
          Lantana
        </button>
        <div className="flex items-center gap-6">
          <span className="text-sm text-[#4a4a6a]">{balance.toFixed(2)} credits</span>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm text-[#4a4a6a] hover:text-[#1a1a2e] transition-colors"
          >
            ← Back to dashboard
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-12">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-[#7a7a9a] mb-2">Marketplace</p>
          <h1 className="text-3xl font-semibold text-[#1a1a2e]">Browse gift cards</h1>
          <p className="text-sm text-[#4a4a6a] mt-2">
            Buy discounted gift cards with your Lantana credits.
          </p>
        </div>

        {/* Brand Filter */}
        <div className="flex gap-2 flex-wrap mb-8">
          {SUPPORTED_BRANDS.map(brand => (
            <button
              key={brand}
              onClick={() => setSelectedBrand(brand)}
              className={`text-sm px-4 py-2 border transition-colors ${
                selectedBrand === brand
                  ? 'bg-[#1a1a2e] text-white border-[#1a1a2e]'
                  : 'bg-white text-[#1a1a2e] border-[#e2e0db] hover:border-[#1a1a2e]'
              }`}
            >
              {brand}
            </button>
          ))}
        </div>

        {/* Listings */}
        {loading ? (
          <div className="bg-white border border-[#e2e0db] p-8 text-center">
            <p className="text-sm text-[#7a7a9a]">Loading...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-white border border-[#e2e0db] p-8 text-center">
            <p className="text-sm text-[#7a7a9a]">No cards available right now. Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {listings.map(listing => (
              <div key={listing.id} className="bg-white border border-[#e2e0db] p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-semibold text-[#1a1a2e]">{listing.giftCard.brand}</p>
                    <p className="text-xs text-[#7a7a9a] mt-1">
                      {listing.listingType === 'SELL' ? 'For sale' : listing.listingType === 'EXCHANGE' ? 'For exchange' : 'Sale or exchange'}
                    </p>
                  </div>
                  <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-1">
                    {discount(listing.giftCard.faceValue, listing.askingPrice)}% off
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-[#7a7a9a]">Face value</p>
                    <p className="text-sm text-[#4a4a6a] line-through">${listing.giftCard.faceValue.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#7a7a9a]">Your price</p>
                    <p className="text-xl font-semibold text-[#1a1a2e]">{listing.askingPrice.toFixed(2)} credits</p>
                  </div>
                </div>
                {listing.listingType !== 'SELL' && listing.preferredBrand && (
                  <p className="text-xs text-[#7a7a9a] mt-3">
                    Seller wants: {listing.preferredBrand}
                  </p>
                )}
                <button
                  onClick={() => navigate(`/listing/${listing.id}`)}
                  disabled={balance < listing.askingPrice}
                  className="w-full mt-4 bg-[#1a1a2e] text-white py-2 text-sm hover:bg-[#2d2d4e] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {balance < listing.askingPrice ? 'Insufficient credits' : 'View listing'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}