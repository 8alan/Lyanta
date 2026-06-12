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
  const [sidebarOpen, setSidebarOpen] = useState(false)
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
    <div className="min-h-screen bg-[#F6F3F9] text-[#2e1a47]">

      {/* ── Nav ── */}
      <nav className="flex items-center justify-between px-4 sm:px-8 py-5 border-b border-[#E3DFEF] bg-white shadow-sm">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-xl font-semibold tracking-tight text-[#2e1a47]"
        >
          Lantana
        </button>
        <div className="flex items-center gap-3">
          {/* Mobile sidebar toggle */}
          <button
            className="md:hidden text-sm text-[#7c6992] border border-[#E3DFEF] px-3 py-1.5 rounded-lg hover:border-[#2e1a47] transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? 'Hide brands' : 'Filter brands'}
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="hidden sm:block text-sm text-[#7c6992] hover:text-[#2e1a47] transition-colors font-medium"
          >
            ← Back to dashboard
          </button>
        </div>
      </nav>

      {/* ── Sign-up banner ── */}
      {!isSignedIn && (
        <div className="bg-[#2e1a47] text-white px-4 sm:px-8 py-3 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm text-[#AFABC9]">
            Want to sell your gift cards or make offers? Create a free account.
          </p>
          <SignUpButton mode="modal">
            <button className="text-sm bg-white text-[#2e1a47] px-4 py-1.5 rounded-lg font-semibold hover:bg-[#F6F3F9] transition-colors shrink-0">
              Sign up free
            </button>
          </SignUpButton>
        </div>
      )}

      <div className="flex relative">

        {/* ── Sidebar — mobile overlay ── */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar ── */}
        <div className={`
          fixed md:static top-0 left-0 h-full md:h-auto z-30 md:z-auto
          w-64 md:w-56 border-r border-[#E3DFEF] bg-white px-4 py-8 shrink-0
          transform transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          overflow-y-auto md:max-h-[calc(100vh-73px)] md:sticky md:top-0
        `}>
          {/* Mobile close */}
          <div className="flex items-center justify-between mb-4 md:block">
            <p className="text-xs uppercase tracking-widest text-[#7c6992] font-semibold">
              Browse by brand
            </p>
            <button
              className="md:hidden text-[#7c6992] text-lg leading-none"
              onClick={() => setSidebarOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => { setSelectedBrand(null); setSidebarOpen(false) }}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                selectedBrand === null
                  ? 'bg-[#2e1a47] text-white font-semibold'
                  : 'text-[#7c6992] hover:bg-[#F6F3F9] hover:text-[#2e1a47]'
              }`}
            >
              All cards
            </button>
            {SUPPORTED_BRANDS.sort().map(brand => (
              <button
                key={brand}
                onClick={() => { setSelectedBrand(brand); setSidebarOpen(false) }}
                className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                  selectedBrand === brand
                    ? 'bg-[#2e1a47] text-white font-semibold'
                    : 'text-[#7c6992] hover:bg-[#F6F3F9] hover:text-[#2e1a47]'
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>

        {/* ── Main content ── */}
        <div className="flex-1 px-4 sm:px-8 py-8 min-w-0">

          {/* Header + Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#7c6992] mb-1 font-semibold">
                Marketplace
              </p>
              <h1 className="text-2xl font-light text-[#2e1a47]">
                {selectedBrand ? `${selectedBrand} gift cards` : 'All gift cards'}
              </h1>
            </div>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search brands..."
              className="bg-white border border-[#E3DFEF] rounded-lg px-4 py-2 text-sm text-[#2e1a47] placeholder-[#AFABC9] focus:outline-none focus:border-[#72569C] focus:ring-1 focus:ring-[#72569C] transition-colors w-full sm:w-56"
            />
          </div>

          {/* Listings Grid */}
          {loading ? (
            <div className="bg-white border border-[#E3DFEF] rounded-2xl p-10 text-center shadow-sm">
              <p className="text-sm text-[#7c6992]">Loading...</p>
            </div>
          ) : sorted.length === 0 ? (
            <div className="bg-white border border-[#E3DFEF] rounded-2xl p-10 text-center shadow-sm">
              <p className="text-sm text-[#7c6992]">No cards available right now. Check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    className="bg-white border border-[#E3DFEF] rounded-2xl overflow-hidden hover:border-[#72569C] hover:shadow-md transition-all cursor-pointer"
                  >
                    {/* Card Image */}
                    <div className="relative">
                      <img
                        src={image ?? ''}
                        alt={listing.giftCard.brand}
                        className="w-full h-40 object-cover"
                      />
                      {discount && (
                        <span className="absolute top-3 right-3 text-xs bg-white text-[#2e7d32] border border-green-200 px-2 py-1 rounded-full font-semibold shadow-sm">
                          {discount}% off
                        </span>
                      )}
                    </div>

                    {/* Card Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-sm font-semibold text-[#2e1a47]">
                            {listing.giftCard.brand === 'Other' && listing.giftCard.description
                              ? listing.giftCard.description
                              : listing.giftCard.brand}
                          </p>
                          <p className="text-xs text-[#AFABC9] mt-0.5">@{seller}</p>
                        </div>
                        <p className="text-xs text-[#AFABC9] line-through">
                          ${listing.giftCard.faceValue.toFixed(2)}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {listing.buyNowPrice && (
                          <span className="text-xs bg-[#F6F3F9] border border-[#E3DFEF] rounded-full px-2.5 py-1 text-[#2e1a47] font-medium">
                            Buy ${listing.buyNowPrice.toFixed(2)}
                          </span>
                        )}
                        {listing.acceptsExchange && (
                          <span className="text-xs bg-[#F6F3F9] border border-[#E3DFEF] rounded-full px-2.5 py-1 text-[#2e1a47] font-medium">
                            Trade
                          </span>
                        )}
                        {listing.minAcceptPrice && (
                          <span className="text-xs bg-[#F6F3F9] border border-[#E3DFEF] rounded-full px-2.5 py-1 text-[#2e1a47] font-medium">
                            Bids from ${listing.minAcceptPrice.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/listing/${listing.id}`)
                        }}
                        disabled={listing.user.clerkId === user?.id}
                        className="w-full bg-[#2e1a47] text-white py-2 text-sm font-semibold rounded-lg hover:bg-[#72569C] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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