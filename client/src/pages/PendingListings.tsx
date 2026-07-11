import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi } from '../services/api.ts'
import { useStore } from '../store/useStore.ts'
import { getBrandImage } from '../services/brandImages.ts'

const FAILED_PREVIEW_COUNT = 3

interface GiftCard {
  id: string
  brand: string
  faceValue: number
  status: string
  createdAt: string
  rejectionReason?: string | null
}

interface Listing {
  id: string
  buyNowPrice: number | null
  minAcceptPrice: number | null
  acceptsExchange: boolean
  status: string
  createdAt: string
  giftCard: {
    brand: string
    faceValue: number
    status: string
  }
  bids: {
    id: string
    status: string
    bidType: string
    cashAmount: number | null
  }[]
}

export default function PendingListings() {
  const navigate = useNavigate()
  const api = useApi()
  const { cards: cachedCards, setCards, myListings: cachedListings, setMyListings } = useStore()

  const [failedCards, setFailedCards] = useState<GiftCard[]>(
    cachedCards.filter(c => c.status === 'FAILED') as GiftCard[]
  )
  const [pendingListings, setPendingListings] = useState<Listing[]>(
    cachedListings.filter(l => l.status === 'PENDING_VERIFICATION') as Listing[]
  )
  const [loading, setLoading] = useState(cachedCards.length === 0 && cachedListings.length === 0)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [showAllFailed, setShowAllFailed] = useState(false)

  useEffect(() => {
    Promise.all([
      api.getMyCards(),
      api.getMyListings(),
    ]).then(([cardsData, listingsData]) => {
      setFailedCards(cardsData.giftCards.filter((c: GiftCard) => c.status === 'FAILED'))
      setCards(cardsData.giftCards)
      setPendingListings(listingsData.listings.filter((l: Listing) => l.status === 'PENDING_VERIFICATION'))
      setMyListings(listingsData.listings)
    }).catch(console.error)
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCancel = async (id: string) => {
    setCancellingId(id)
    try {
      await api.cancelListing(id)
      setPendingListings(prev => prev.filter(l => l.id !== id))
      setMyListings(cachedListings.filter(l => l.id !== id))
    } catch (err) {
      console.error(err)
    } finally {
      setCancellingId(null)
    }
  }

  const isEmpty = failedCards.length === 0 && pendingListings.length === 0
  const visibleFailed = showAllFailed ? failedCards : failedCards.slice(0, FAILED_PREVIEW_COUNT)
  const hiddenCount = failedCards.length - FAILED_PREVIEW_COUNT

  return (
    <div className="min-h-screen bg-[#F6F3F9] text-[#2e1a47]">

      {/* ── Nav ── */}
      <nav className="flex items-center justify-between px-4 sm:px-8 py-5 border-b border-[#E3DFEF] bg-white shadow-sm">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-xl font-semibold tracking-tight text-[#2e1a47]"
        >
          Lyanta
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-sm text-[#7c6992] hover:text-[#2e1a47] transition-colors font-medium"
        >
          ← Back to dashboard
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-12">

        {/* ── Header ── */}
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-[#7c6992] mb-2 font-semibold">Account</p>
          <h1 className="text-3xl font-light text-[#2e1a47]">Pending Listings</h1>
          <p className="text-sm text-[#7c6992] mt-2">Cards and listings awaiting verification before going live.</p>
        </div>

        {/* ── Loading ── */}
        {loading ? (
          <div className="bg-white border border-[#E3DFEF] rounded-2xl p-10 text-center shadow-sm">
            <div className="w-6 h-6 rounded-full border-2 border-[#E3DFEF] border-t-[#72569C] animate-spin mx-auto mb-4" />
            <p className="text-sm text-[#7c6992]">Loading your listings…</p>
          </div>

        ) : isEmpty ? (
          /* ── Empty state ── */
          <div className="bg-white border border-[#E3DFEF] rounded-2xl p-14 text-center shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#F6F3F9] border border-[#E3DFEF] flex items-center justify-center mx-auto mb-5">
              <div className="w-5 h-5 rounded-full border-2 border-[#E3DFEF]" />
            </div>
            <p className="text-base font-medium text-[#2e1a47] mb-1">Nothing pending</p>
            <p className="text-sm text-[#7c6992] mb-6">You don't have any listings awaiting review.</p>
            <button
              onClick={() => navigate('/submit')}
              className="text-sm bg-[#2e1a47] text-white px-6 py-2.5 rounded-full hover:bg-[#72569C] transition-colors font-semibold"
            >
              Submit a card
            </button>
          </div>

        ) : (
          <div className="space-y-10">

            {/* ── Awaiting Verification ── */}
            {pendingListings.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-5">
                  <p className="text-xs uppercase tracking-widest text-[#7c6992] font-semibold">
                    Awaiting Verification
                  </p>
                  <span className="text-xs bg-[#2e1a47] text-white font-semibold px-2 py-0.5 rounded-full">
                    {pendingListings.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {pendingListings.map(listing => {
                    const image = getBrandImage(listing.giftCard.brand)
                    return (
                      <div
                        key={listing.id}
                        className="bg-white border border-[#E3DFEF] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex gap-4 flex-col sm:flex-row">
                          {/* Brand image */}
                          <div className="w-full sm:w-20 h-14 rounded-xl overflow-hidden shrink-0 bg-[#F6F3F9] border border-[#E3DFEF]">
                            <img
                              src={image ?? ''}
                              alt={listing.giftCard.brand}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 flex-wrap">
                              <div>
                                <p className="text-sm font-semibold text-[#2e1a47]">
                                  {listing.giftCard.brand}
                                  <span className="text-[#7c6992] font-normal"> · </span>
                                  ${listing.giftCard.faceValue.toFixed(2)}
                                </p>
                                <div className="flex items-center gap-1.5 mt-1.5">
                                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400" />
                                  <p className="text-xs font-medium text-amber-600">Under review</p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleCancel(listing.id)}
                                disabled={cancellingId === listing.id}
                                className="text-xs border border-red-200 px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40 font-medium shrink-0"
                              >
                                {cancellingId === listing.id ? 'Cancelling…' : 'Cancel listing'}
                              </button>
                            </div>

                            {/* Pricing tags */}
                            <div className="flex flex-wrap gap-2 mt-3">
                              {listing.buyNowPrice && (
                                <span className="text-xs bg-[#F6F3F9] border border-[#E3DFEF] rounded-full px-2.5 py-1 text-[#2e1a47] font-medium">
                                  Buy now · ${listing.buyNowPrice.toFixed(2)}
                                </span>
                              )}
                              {listing.minAcceptPrice && (
                                <span className="text-xs bg-[#F6F3F9] border border-[#E3DFEF] rounded-full px-2.5 py-1 text-[#2e1a47] font-medium">
                                  Min bid · ${listing.minAcceptPrice.toFixed(2)}
                                </span>
                              )}
                              {listing.acceptsExchange && (
                                <span className="text-xs bg-[#F6F3F9] border border-[#E3DFEF] rounded-full px-2.5 py-1 text-[#2e1a47] font-medium">
                                  Accepts trades
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {/* ── Verification Failed ── */}
            {failedCards.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-5">
                  <p className="text-xs uppercase tracking-widest text-[#7c6992] font-semibold">
                    Verification Failed
                  </p>
                  <span className="text-xs bg-red-100 text-red-500 font-semibold px-2 py-0.5 rounded-full">
                    {failedCards.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {visibleFailed.map(card => {
                    const image = getBrandImage(card.brand)
                    return (
                      <div
                        key={card.id}
                        className="bg-white border border-red-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex gap-4 flex-col sm:flex-row">
                          {/* Brand image */}
                          <div className="w-full sm:w-20 h-14 rounded-xl overflow-hidden shrink-0 bg-[#F6F3F9] border border-red-100">
                            <img
                              src={image ?? ''}
                              alt={card.brand}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 flex-wrap">
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-[#2e1a47]">
                                  {card.brand}
                                  <span className="text-[#7c6992] font-normal"> · </span>
                                  ${card.faceValue.toFixed(2)}
                                </p>
                                <div className="flex items-center gap-1.5 mt-1.5">
                                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400" />
                                  <p className="text-xs font-medium text-red-500">Verification failed</p>
                                </div>
                                {card.rejectionReason && (
                                  <p className="text-xs mt-2 text-[#7c6992] bg-red-50 border border-red-100 rounded-lg px-3 py-2 leading-relaxed">
                                    <span className="font-semibold text-red-500">Reason: </span>
                                    {card.rejectionReason}
                                  </p>
                                )}
                              </div>

                              <div className="flex gap-2 shrink-0">
                                <button
                                  onClick={() => navigate('/submit')}
                                  className="text-xs border border-[#E3DFEF] px-3 py-1.5 rounded-lg text-[#7c6992] hover:border-[#2e1a47] hover:text-[#2e1a47] transition-colors font-medium"
                                >
                                  Resubmit
                                </button>
                                <button
                                  onClick={async () => {
                                    await api.deleteGiftCard(card.id)
                                    setFailedCards(prev => prev.filter(c => c.id !== card.id))
                                    setCards(cachedCards.filter(c => c.id !== card.id))
                                  }}
                                  className="text-xs border border-red-200 px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors font-medium"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>

                            <p className="text-xs text-[#AFABC9] mt-2">
                              Submitted {new Date(card.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Show more / Show less */}
                {failedCards.length > FAILED_PREVIEW_COUNT && (
                  <button
                    onClick={() => setShowAllFailed(prev => !prev)}
                    className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-[#E3DFEF] bg-white hover:bg-[#F6F3F9] text-sm text-[#7c6992] hover:text-[#2e1a47] font-medium transition-all shadow-sm"
                  >
                    {showAllFailed ? (
                      <>
                        <span>Show less</span>
                        <span className="text-xs">↑</span>
                      </>
                    ) : (
                      <>
                        <span>Show {hiddenCount} more</span>
                        <span className="text-xs">↓</span>
                      </>
                    )}
                  </button>
                )}
              </section>
            )}

          </div>
        )}
      </div>
    </div>
  )
}