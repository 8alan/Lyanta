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
    avatarUrl: string | null
    verification: { status: string } | null
  }
}

const POPULAR_BRANDS = [
  'Amazon', 'Visa', 'Mastercard', 'Target', 'Walmart',
  'Best Buy', 'Steam', 'Starbucks', 'DoorDash', 'Uber'
]

const SORT_OPTIONS = [
  { value: 'default',    label: 'Popular' },
  { value: 'price-asc',  label: 'Price ↑' },
  { value: 'price-desc', label: 'Price ↓' },
  { value: 'discount',   label: 'Best deal' },
] as const

type SortBy = typeof SORT_OPTIONS[number]['value']

const BRAND_CATEGORIES: Record<string, string[]> = {
  'Gaming': ['Steam', 'Blizzard', 'Roblox', 'Valorant', 'Google Play'],
  'Restaurants': ['DoorDash', 'Chipotle', 'Starbucks', 'Taco Bell', 'Uber'],
  'Retail': ['Amazon', 'Best Buy', 'Sephora', 'Lululemon', 'Macys', 'Kohls', 'Lowes', 'IKEA', 'Staples', 'H&M', 'Abercrombie', 'Banana Republic', 'Pink', 'Nautica', 'Lego'],
}

export default function BrowseCards() {
  const navigate = useNavigate()
  const api = useApi()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sortBy, setSortBy] = useState<SortBy>('default')
  const { user } = useUser()
  const { isSignedIn } = useAuth()

  useEffect(() => {
    api.getActiveListings()
      .then(data => setListings(data.listings))
      .catch(console.error)
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = listings.filter(l => {
    const matchesSearch = search
      ? l.giftCard.brand.toLowerCase().includes(search.toLowerCase())
      : true
    const matchesBrand = selectedBrand
      ? l.giftCard.brand === selectedBrand
      : true
    return matchesSearch && matchesBrand
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price-asc') return (a.buyNowPrice ?? Infinity) - (b.buyNowPrice ?? Infinity)
    if (sortBy === 'price-desc') return (b.buyNowPrice ?? -Infinity) - (a.buyNowPrice ?? -Infinity)
    if (sortBy === 'discount') {
      const aD = a.buyNowPrice ? (a.giftCard.faceValue - a.buyNowPrice) / a.giftCard.faceValue : 0
      const bD = b.buyNowPrice ? (b.giftCard.faceValue - b.buyNowPrice) / b.giftCard.faceValue : 0
      return bD - aD
    }
    const aP = POPULAR_BRANDS.indexOf(a.giftCard.brand)
    const bP = POPULAR_BRANDS.indexOf(b.giftCard.brand)
    if (aP === -1 && bP === -1) return 0
    if (aP === -1) return 1
    if (bP === -1) return -1
    return aP - bP
  })

  return (
    <div className="min-h-screen bg-[#F6F3F9] text-[#2e1a47]">

      {/* ── Nav ── */}
      <nav className="flex items-center justify-between px-4 sm:px-8 py-5 border-b border-[#E3DFEF] bg-white shadow-sm">
        <button
          onClick={() => navigate('/dashboard')}
          className="font-display text-xl text-[#2e1a47] tracking-tight"
        >
          Lantana
        </button>
        <div className="flex items-center gap-3">
          <button
            className="md:hidden text-sm text-[#7c6992] border border-[#E3DFEF] px-3 py-1.5 rounded-lg hover:border-[#2e1a47] transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? 'Hide brands' : 'Filter brands'}
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="hidden sm:block text-sm text-[#7c6992] hover:text-[#2e1a47] transition-colors font-normal"
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

      <div className="flex relative min-h-screen">

        {/* ── Sidebar mobile overlay ── */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar ── */}
        <div className={`
          fixed md:static top-0 left-0 self-stretch z-30 md:z-auto
          w-64 md:w-56 border-r border-[#E3DFEF] bg-white px-4 py-8 shrink-0
          transform transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          overflow-y-auto md:sticky md:top-0 md:max-h-screen
        `}>
          <div className="flex items-center justify-between mb-6 md:block">
            <p className="text-xs uppercase tracking-widest text-[#7c6992] font-semibold mb-0 md:mb-4">
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

            {/* ── All Cards ── */}
            <button
              onClick={() => {
                setSelectedBrand(null)
                setActiveCategory('All Cards')
                setExpandedCategory(prev => prev === 'All Cards' ? null : 'All Cards')
              }}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg font-medium ${
                activeCategory === 'All Cards' || activeCategory === null
                  ? 'bg-[#2e1a47] text-white'
                  : 'text-[#7c6992] hover:bg-[#F6F3F9] hover:text-[#2e1a47]'
              }`}
            >
              All Cards
            </button>

            {expandedCategory === 'All Cards' && (
              <div className="mt-1 ml-2 space-y-0.5">
                {SUPPORTED_BRANDS.filter(b => b !== 'Other').sort().map(brand => (
                  <button
                    key={brand}
                    onClick={() => { setSelectedBrand(brand); setSidebarOpen(false) }}
                    className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${
                      selectedBrand === brand
                        ? 'bg-[#72569C] text-white font-semibold'
                        : 'text-[#7c6992] hover:bg-[#F6F3F9] hover:text-[#2e1a47]'
                    }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            )}

            {/* ── Category dropdowns ── */}
            {(['Gaming', 'Restaurants', 'Retail'] as const).map(category => {
              const brands = BRAND_CATEGORIES[category] ?? []
              const availableBrands = brands.filter(b => SUPPORTED_BRANDS.includes(b))
              const isActive = activeCategory === category
              const isExpanded = expandedCategory === category

              return (
                <div key={category}>
                  <button
                    onClick={() => {
                      setActiveCategory(category)
                      setExpandedCategory(prev => prev === category ? null : category)
                    }}
                    className={`w-full text-left text-sm px-3 py-2 rounded-lg font-medium ${
                      isActive
                        ? 'bg-[#2e1a47] text-white'
                        : 'text-[#7c6992] hover:bg-[#F6F3F9] hover:text-[#2e1a47]'
                    }`}
                  >
                    {category}
                  </button>

                  {isExpanded && (
                    <div className="mt-1 ml-2 space-y-0.5">
                      {availableBrands.map(brand => (
                        <button
                          key={brand}
                          onClick={() => { setSelectedBrand(brand); setSidebarOpen(false) }}
                          className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${
                            selectedBrand === brand
                              ? 'bg-[#72569C] text-white font-semibold'
                              : 'text-[#7c6992] hover:bg-[#F6F3F9] hover:text-[#2e1a47]'
                          }`}
                        >
                          {brand}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Main content ── */}
        <div className="flex-1 px-4 sm:px-8 py-8 min-w-0">

          {/* ── Header row ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#7c6992] mb-1 font-semibold">
                Marketplace
              </p>
              <h1 className="text-2xl font-light text-[#2e1a47]">
                {selectedBrand ? `${selectedBrand} gift cards` : 'All gift cards'}
              </h1>
            </div>

            <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
              <div className="bg-white border border-[#E3DFEF] rounded-xl p-1 flex gap-1 shadow-sm">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setSortBy(opt.value)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                      sortBy === opt.value
                        ? 'bg-[#2e1a47] text-white shadow-sm'
                        : 'text-[#7c6992] hover:text-[#2e1a47] hover:bg-[#F6F3F9]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search brands..."
                className="bg-white border border-[#E3DFEF] rounded-lg px-4 py-2 text-sm text-[#2e1a47] placeholder-[#AFABC9] focus:outline-none focus:border-[#72569C] focus:ring-1 focus:ring-[#72569C] transition-colors w-full sm:w-48"
              />
            </div>
          </div>

          {/* ── Listings Grid ── */}
          {loading ? (
            <div className="bg-white border border-[#E3DFEF] rounded-2xl p-10 text-center shadow-sm">
              <p className="text-sm text-[#7c6992]">Loading...</p>
            </div>
          ) : sorted.length === 0 ? (
            <div className="bg-white border border-[#E3DFEF] rounded-2xl p-10 text-center shadow-sm">
              <p className="text-sm text-[#7c6992]">No cards available in this category right now.</p>
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

                      <div className="p-4 flex flex-col gap-3">

                      {/* Brand + seller */}
                      <div>
                        <p className="text-sm font-semibold text-[#2e1a47] mb-1.5">
                          {listing.giftCard.brand === 'Other' && listing.giftCard.description
                            ? listing.giftCard.description
                            : `${listing.giftCard.brand} Gift Card`}
                        </p>
                        <div className="flex items-center gap-1.5">
                          {listing.user.avatarUrl ? (
                            <img src={listing.user.avatarUrl} alt={seller} className="w-4 h-4 rounded-full object-cover" />
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-[#E3DFEF] flex items-center justify-center text-[9px] text-[#7c6992] font-semibold">
                              {seller[0]?.toUpperCase()}
                            </div>
                          )}
                          <p className="text-xs text-[#AFABC9]">@{seller}</p>
                          {listing.user.verification?.status === 'APPROVED' && (
                            <img src="/verification-badge.png" alt="Verified" className="w-3.5 h-3.5" />
                          )}
                        </div>
                      </div>

                      {/* Face value + price pills */}
                      <div>
                        <p className="text-xs text-[#AFABC9] mb-2">
                          Face value ${listing.giftCard.faceValue.toFixed(2)}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {listing.buyNowPrice && (
                            <span className="text-xs bg-[#F6F3F9] border border-[#E3DFEF] rounded-full px-2.5 py-1 text-[#2e1a47] font-medium">
                              Buy ${listing.buyNowPrice.toFixed(2)}
                            </span>
                          )}
                          {listing.minAcceptPrice && (
                            <span className="text-xs bg-[#F6F3F9] border border-[#E3DFEF] rounded-full px-2.5 py-1 text-[#2e1a47] font-medium">
                              Bids from ${listing.minAcceptPrice.toFixed(2)}
                            </span>
                          )}
                          {listing.acceptsExchange && (
                            <span className="text-xs bg-[#F6F3F9] border border-[#E3DFEF] rounded-full px-2.5 py-1 text-[#2e1a47] font-medium">
                              Trade
                            </span>
                          )}
                        </div>
                      </div>

                      {/* CTA */}
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