import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi } from '../services/api.ts'
import { getBrandImage, SUPPORTED_BRANDS } from '../services/brandImages.ts'
import { useUser } from '@clerk/react'
import { useAuth } from '@clerk/react'
import { SignUpButton } from '@clerk/react'

interface Listing {
  id: string
  buyNowPrice: number | null
  minAcceptPrice: number | null
  acceptsExchange: boolean
  preferredBrand: string[]
  status: string
  giftCard: {
    brand: string
    faceValue: number
    description: string | null
  }
  user: {
    username: string | null
    name: string | null
    clerkId: string
  }
}

const POPULAR_BRANDS = [
  'Amazon', 'Visa', 'Mastercard', 'Target', 'Walmart',
  'Best Buy', 'Steam', 'Starbucks', 'DoorDash', 'Uber'
]

export default function BrowseCards() {
  const navigate = useNavigate()
  const api = useApi()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const { user } = useUser()
  const { isSignedIn } = useAuth()
  
  useEffect(() => {
  api.getActiveListings(selectedBrand ?? undefined)
    .then(data => setListings(data.listings))
    .catch(console.error)
    .finally(() => setLoading(false))
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [selectedBrand])

  const filtered = search
    ? listings.filter(l => l.giftCard.brand.toLowerCase().includes(search.toLowerCase()))
    : listings

  const sorted = [...filtered].sort((a, b) => {
    const aPopular = POPULAR_BRANDS.indexOf(a.giftCard.brand)
    const bPopular = POPULAR_BRANDS.indexOf(b.giftCard.brand)
    if (aPopular === -1 && bPopular === -1) return 0
    if (aPopular === -1) return 1
    if (bPopular === -1) return -1
    return aPopular - bPopular
  })

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-[#1a1a2e]">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-[#e2e0db] bg-white">
        <button onClick={() => navigate('/dashboard')} className="text-xl font-semibold tracking-tight">
          Lantana
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-sm text-[#4a4a6a] hover:text-[#1a1a2e] transition-colors"
        >
          ← Back to dashboard
        </button>
      </nav>
      {!isSignedIn && (
        <div className="bg-[#1a1a2e] text-white px-8 py-3 flex items-center justify-between">
          <p className="text-sm">Want to sell your gift cards or make offers? Create a free account.</p>
          <SignUpButton mode="modal">
            <button className="text-sm bg-white text-[#1a1a2e] px-4 py-1.5 hover:bg-gray-100 transition-colors">
              Sign up free
            </button>
          </SignUpButton>
        </div>
      )}

      <div className="flex min-h-[calc(100vh-64px)]">

        {/* Sidebar */}
        <div className="w-56 border-r border-[#e2e0db] bg-white px-4 py-8 shrink-0">
          <p className="text-xs uppercase tracking-widest text-[#7a7a9a] mb-4">Browse by brand</p>
          <div className="space-y-1">
            <button
              onClick={() => setSelectedBrand(null)}
              className={`w-full text-left text-sm px-3 py-2 transition-colors ${
                selectedBrand === null
                  ? 'bg-[#1a1a2e] text-white'
                  : 'text-[#4a4a6a] hover:bg-[#f8f7f4]'
              }`}
            >
              All cards
            </button>
            {SUPPORTED_BRANDS.sort().map(brand => (
              <button
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={`w-full text-left text-sm px-3 py-2 transition-colors ${
                  selectedBrand === brand
                    ? 'bg-[#1a1a2e] text-white'
                    : 'text-[#4a4a6a] hover:bg-[#f8f7f4]'
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 px-8 py-8">

          {/* Header + Search */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#7a7a9a] mb-1">Marketplace</p>
              <h1 className="text-2xl font-semibold text-[#1a1a2e]">
                {selectedBrand ? `${selectedBrand} gift cards` : 'All gift cards'}
              </h1>
            </div>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search brands..."
              className="bg-white border border-[#e2e0db] px-4 py-2 text-sm text-[#1a1a2e] placeholder-[#b0b0c0] focus:outline-none focus:border-[#1a1a2e] transition-colors w-56"
            />
          </div>

          {/* Listings Grid */}
          {loading ? (
            <div className="bg-white border border-[#e2e0db] p-8 text-center">
              <p className="text-sm text-[#7a7a9a]">Loading...</p>
            </div>
          ) : sorted.length === 0 ? (
            <div className="bg-white border border-[#e2e0db] p-8 text-center">
              <p className="text-sm text-[#7a7a9a]">No cards available right now. Check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sorted.map(listing => {
                const image = getBrandImage(listing.giftCard.brand)
                const seller = listing.user.username ?? listing.user.name ?? 'Anonymous'
                const discount = listing.buyNowPrice
                  ? (((listing.giftCard.faceValue - listing.buyNowPrice) / listing.giftCard.faceValue) * 100).toFixed(0)
                  : null

                return (
                  <div
                    key={listing.id}
                    onClick={() => navigate(`/listing/${listing.id}`)}
                    className="bg-white border border-[#e2e0db] hover:border-[#1a1a2e] transition-colors cursor-pointer"
                  >
                    {/* Card Image */}
                    <div className="relative">
                      <img
                        src={image ?? ''}
                        alt={listing.giftCard.brand}
                        className="w-full h-40 object-cover"
                      />
                      {discount && (
                        <span className="absolute top-3 right-3 text-xs bg-white text-green-700 border border-green-200 px-2 py-1 font-semibold">
                          {discount}% off
                        </span>
                      )}
                    </div>

                    {/* Card Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-sm font-semibold text-[#1a1a2e]">
                            {listing.giftCard.brand === 'Other' && listing.giftCard.description
                              ? listing.giftCard.description
                              : listing.giftCard.brand}
                          </p>
                          <p className="text-xs text-[#7a7a9a] mt-0.5">@{seller}</p>
                        </div>
                        <p className="text-xs text-[#7a7a9a] line-through">
                          ${listing.giftCard.faceValue.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          {listing.buyNowPrice && (
                            <span className="text-xs bg-[#f8f7f4] border border-[#e2e0db] px-2 py-1 text-[#1a1a2e]">
                              Buy ${listing.buyNowPrice.toFixed(2)}
                            </span>
                          )}
                          {listing.acceptsExchange && (
                            <span className="text-xs bg-[#f8f7f4] border border-[#e2e0db] px-2 py-1 text-[#1a1a2e]">
                              Trade
                            </span>
                          )}
                          {listing.minAcceptPrice && (
                            <span className="text-xs bg-[#f8f7f4] border border-[#e2e0db] px-2 py-1 text-[#1a1a2e]">
                              Bids from ${listing.minAcceptPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/listing/${listing.id}`)
                        }}
                        disabled={listing.user.clerkId === user?.id}
                        className="w-full mt-4 bg-[#1a1a2e] text-white py-2 text-sm hover:bg-[#2d2d4e] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {listing.user.clerkId === user?.id ? 'Your listing' : 'View listing'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}