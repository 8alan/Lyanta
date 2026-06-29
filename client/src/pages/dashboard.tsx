import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useApi } from '../services/api.ts'
import { useStore } from '../store/useStore.ts'
import { getBrandImage } from '../services/brandImages.ts'
import { UserButton, useUser } from '@clerk/react'
interface GiftCard {
  id: string
  brand: string
  faceValue: number
  status: string
  createdAt: string
}

interface Listing {
  id: string
  buyNowPrice: number | null
  minAcceptPrice: number | null
  status: string
  giftCard: {
    brand: string
    faceValue: number
  }
  createdAt: string
}

interface TopCard {
  brand: string
  count: number
}

export default function Dashboard() {
  const { user } = useUser()
  const navigate = useNavigate()
  const api = useApi()
  const { setBalance, listings: cachedListings, setListings, cards: cachedCards, setCards, earnings90: cachedEarnings, setEarnings90, topCards: cachedTopCards, setTopCards, avatarUrl: cachedAvatarUrl, setAvatarUrl } = useStore()
  const [activeTab, setActiveTab] = useState<'overview' | 'active' | 'pending' | 'trades'>('overview')
  const [localCards, setLocalCards] = useState<GiftCard[]>(cachedCards)
  const [localListings, setLocalListings] = useState<Listing[]>(cachedListings)
  const [localEarnings, setLocalEarnings] = useState<number>(cachedEarnings)
  const [localTopCards, setLocalTopCards] = useState<TopCard[]>(cachedTopCards)
  const [loading, setLoading] = useState(cachedListings.length === 0)
  const [avatarUrl, setLocalAvatarUrl] = useState<string | null>(cachedAvatarUrl)
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  useEffect(() => {
    Promise.all([
      api.getMyCards(),
      api.getMyListings(),
      api.getBalance(),
      api.getMyEarnings(),
      api.getTopCards(),
      api.getMyProfile(),
    ]).then(([cardsData, listingsData, balanceData, earningsData, topCardsData, profileData]) => {
      setLocalCards(cardsData.giftCards)
      setCards(cardsData.giftCards)
      setLocalListings(listingsData.listings)
      setListings(listingsData.listings)
      setBalance(balanceData.balance)
      setLocalEarnings(earningsData.total ?? 0)
      setEarnings90(earningsData.total ?? 0)
      setLocalTopCards(topCardsData.topCards ?? [])
      setTopCards(topCardsData.topCards ?? [])
      setAvatarUrl(profileData.profile.avatarUrl ?? null)
      setLocalAvatarUrl(profileData.profile.avatarUrl ?? null)
      setAvatarUrl(profileData.profile.avatarUrl ?? null)
    }).catch(console.error)
    .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const activeListings = localListings.filter(l => l.status === 'ACTIVE')
  const pendingCards = localCards.filter(c => c.status === 'PENDING' || c.status === 'FAILED')

  const statusLabel: Record<string, string> = {
    PENDING: 'Pending verification',
    VERIFIED: 'Verified',
    AVAILABLE: 'Listed',
    TRADED: 'Sold',
    CASHED_OUT: 'Cashed out',
    FLAGGED: 'Flagged',
    FAILED: 'Failed',
  }

  const statusColor: Record<string, string> = {
    PENDING: 'text-[#7c6992]',
    VERIFIED: 'text-[#2e7d32]',
    AVAILABLE: 'text-[#2e7d32]',
    TRADED: 'text-[#2e1a47]',
    CASHED_OUT: 'text-[#2e1a47]',
    FLAGGED: 'text-red-600',
    FAILED: 'text-red-600',
  }

  const maxCount = localTopCards.length > 0 ? Math.max(...localTopCards.map(c => c.count)) : 1

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
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate('/browse')}
            className="text-sm text-[#7c6992] hover:text-[#2e1a47] transition-colors font-medium"
          >
            Browse
          </button>
          <div className="relative">
            <div className="opacity-0 absolute inset-0 z-10 w-8 h-8">
              <UserButton>
                <UserButton.MenuItems>
                  <UserButton.Action
                    label="My Profile"
                    labelIcon={<span style={{ fontSize: '14px' }}>👤</span>}
                    onClick={() => navigate('/profile')}
                  />
                </UserButton.MenuItems>
              </UserButton>
            </div>
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-[#E3DFEF] pointer-events-none" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#E3DFEF] flex items-center justify-center text-sm font-semibold text-[#7c6992] pointer-events-none">
                {user?.firstName?.[0]?.toUpperCase() ?? '?'}
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-12">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#7c6992] mb-1 font-semibold">Dashboard</p>
            <h1 className="text-3xl font-light text-[#2e1a47]">
              {greeting}, {user?.firstName ?? 'there'}.
            </h1>
          </div>
          <button
            onClick={() => navigate('/submit')}
            className="bg-[#2e1a47] text-white px-5 py-2.5 text-sm font-semibold rounded-lg hover:bg-[#72569C] transition-colors"
          >
            + Submit a card
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-10 flex-wrap">
          {[
            { label: 'Overview', key: 'overview' },
            { label: 'Active Listings', key: 'active' },
            { label: 'Pending Listings', key: 'pending' },
            { label: 'My Trades', key: 'trades' },
          ].map(({ label, key }) => (
            <button
              key={key}
              onClick={() => {
                if (key === 'trades') navigate('/my-trades')
                else if (key === 'active') navigate('/my-listings')
                else if (key === 'pending') navigate('/pending-listings')
                else setActiveTab(key as typeof activeTab)
              }}
              className={`text-sm border px-5 py-2 rounded-lg font-medium transition-colors ${
                activeTab === key
                  ? 'bg-[#2e1a47] text-white border-[#2e1a47]'
                  : 'border-[#AFABC9] bg-white text-[#7c6992] hover:border-[#2e1a47] hover:text-[#2e1a47] hover:bg-[#F6F3F9]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Overview Tab ── */}
        {activeTab === 'overview' && (
          <div className="space-y-8">

            {/* Earnings + Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#2e1a47] rounded-2xl p-6 shadow-sm">
                <p className="text-xs uppercase tracking-widest text-[#AFABC9] mb-2 font-semibold">Earnings (90 days)</p>
                <p className="text-4xl font-light text-white">${localEarnings.toFixed(2)}</p>
              </div>
              <div className="bg-white border border-[#E3DFEF] rounded-2xl p-6 shadow-sm">
                <p className="text-xs uppercase tracking-widest text-[#7c6992] mb-2 font-semibold">Active Listings</p>
                <p className="text-4xl font-light text-[#2e1a47]">{activeListings.length}</p>
              </div>
              <div className="bg-white border border-[#E3DFEF] rounded-2xl p-6 shadow-sm">
                <p className="text-xs uppercase tracking-widest text-[#7c6992] mb-2 font-semibold">Pending Cards</p>
                <p className="text-4xl font-light text-[#2e1a47]">{pendingCards.length}</p>
              </div>
            </div>

            {/* Active listings preview */}
            <div>
              <div className="bg-white border border-[#E3DFEF] rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs uppercase tracking-widest text-[#7c6992] font-semibold">Active Listings</p>
                  <button
                    onClick={() => navigate('/my-listings')}
                    className="text-xs text-[#72569C] hover:text-[#2e1a47] transition-colors font-medium"
                  >
                    View all →
                  </button>
                </div>

                {loading ? (
                  <div className="py-8 text-center">
                    <p className="text-sm text-[#7c6992]">Loading...</p>
                  </div>
                ) : activeListings.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-sm text-[#7c6992] mb-4">No active listings yet.</p>
                    <button
                      onClick={() => navigate('/submit')}
                      className="text-sm bg-[#2e1a47] text-white px-6 py-2.5 rounded-lg hover:bg-[#72569C] transition-colors font-semibold"
                    >
                      Submit a card
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
                    {activeListings.map(listing => {
                      const image = getBrandImage(listing.giftCard.brand)
                      return (
                        <div
                          key={listing.id}
                          onClick={() => navigate(`/listing/${listing.id}`)}
                          className="shrink-0 w-36 border border-[#E3DFEF] rounded-xl overflow-hidden cursor-pointer hover:border-[#72569C] hover:shadow-md transition-all bg-[#F6F3F9]"
                        >
                          <div className="w-full h-20 overflow-hidden bg-[#E3DFEF]">
                            {image ? (
                              <img src={image} alt={listing.giftCard.brand} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-xs text-[#AFABC9] font-medium text-center px-2">{listing.giftCard.brand}</span>
                              </div>
                            )}
                          </div>
                          <div className="p-3">
                            <p className="text-xs font-semibold text-[#2e1a47] truncate">{listing.giftCard.brand}</p>
                            <p className="text-xs text-[#AFABC9] mb-1">Face ${listing.giftCard.faceValue.toFixed(2)}</p>
                            <p className="text-sm font-semibold text-[#2e1a47]">
                              {listing.buyNowPrice ? `$${listing.buyNowPrice.toFixed(2)}` : '—'}
                            </p>
                            <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wide text-[#72569C] bg-[#EDE9F6] px-1.5 py-0.5 rounded-full">
                              Active
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Highest Demand */}
            <div className="bg-white border border-[#E3DFEF] rounded-2xl p-6 shadow-sm">
              <p className="text-xs uppercase tracking-widest text-[#7c6992] mb-6 font-semibold">Highest Demand</p>
              {localTopCards.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-[#AFABC9]">No sales data yet — this will populate as cards are sold.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {localTopCards.slice(0, 5).map(card => (
                    <div key={card.brand} className="flex items-center gap-4">
                      <p className="text-sm text-[#2e1a47] w-28 shrink-0 font-medium">{card.brand}</p>
                      <div className="flex-1 bg-[#F6F3F9] rounded-full h-2">
                        <div
                          className="bg-[#72569C] h-2 rounded-full transition-all"
                          style={{ width: `${(card.count / maxCount) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-[#7c6992] w-8 text-right">{card.count}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ── Active Listings Tab ── */}
        {activeTab === 'active' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs uppercase tracking-widest text-[#7c6992] font-semibold">Active Listings</p>
            </div>
            <div className="bg-white border border-[#E3DFEF] rounded-2xl overflow-hidden shadow-sm">
              {loading ? (
                <div className="p-10 text-center">
                  <p className="text-sm text-[#7c6992]">Loading...</p>
                </div>
              ) : activeListings.length === 0 ? (
                <div className="p-10 text-center">
                  <p className="text-sm text-[#7c6992] mb-4">No active listings yet.</p>
                  <button
                    onClick={() => navigate('/submit')}
                    className="text-sm bg-[#2e1a47] text-white px-6 py-2.5 rounded-lg hover:bg-[#72569C] transition-colors font-semibold"
                  >
                    Submit a card
                  </button>
                </div>
              ) : (
                activeListings.map((listing, i) => (
                  <div
                    key={listing.id}
                    className={`group flex items-center justify-between px-6 py-4 hover:bg-[#F6F3F9] transition-colors ${
                      i !== activeListings.length - 1 ? 'border-b border-[#E3DFEF]' : ''
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#2e1a47]">{listing.giftCard.brand} Gift Card</p>
                      <p className="text-xs text-[#AFABC9]">{new Date(listing.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-[#2e1a47]">
                          ${listing.buyNowPrice?.toFixed(2) ?? '—'}
                        </p>
                        <p className="text-xs text-[#2e7d32]">Active</p>
                      </div>
                      <button
                        onClick={() => navigate('/my-listings')}
                        className="text-xs text-[#72569C] hover:text-[#2e1a47] transition-colors opacity-0 group-hover:opacity-100 font-medium"
                      >
                        Edit →
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── Pending Listings Tab ── */}
        {activeTab === 'pending' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs uppercase tracking-widest text-[#7c6992] font-semibold">Pending Cards</p>
            </div>
            <div className="bg-white border border-[#E3DFEF] rounded-2xl overflow-hidden shadow-sm">
              {loading ? (
                <div className="p-10 text-center">
                  <p className="text-sm text-[#7c6992]">Loading...</p>
                </div>
              ) : pendingCards.length === 0 ? (
                <div className="p-10 text-center">
                  <p className="text-sm text-[#7c6992]">No pending cards.</p>
                </div>
              ) : (
                pendingCards.map((card, i) => (
                  <div
                    key={card.id}
                    className={`group flex items-center justify-between px-6 py-4 hover:bg-[#F6F3F9] transition-colors ${
                      i !== pendingCards.length - 1 ? 'border-b border-[#E3DFEF]' : ''
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#2e1a47]">{card.brand} Gift Card</p>
                      <p className="text-xs text-[#AFABC9]">{new Date(card.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-[#2e1a47]">${card.faceValue.toFixed(2)}</p>
                        <p className={`text-xs ${statusColor[card.status] ?? 'text-[#7c6992]'}`}>
                          {statusLabel[card.status] ?? card.status}
                        </p>
                      </div>
                      {(card.status === 'PENDING' || card.status === 'FAILED') && (
                        <button
                          onClick={async () => {
                            await api.deleteGiftCard(card.id)
                            setLocalCards(prev => prev.filter(c => c.id !== card.id))
                            setCards(localCards.filter(c => c.id !== card.id))
                          }}
                          className="text-xs text-red-500 hover:text-red-700 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}