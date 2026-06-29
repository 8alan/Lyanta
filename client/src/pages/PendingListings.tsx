import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi } from '../services/api.ts'
import { getBrandImage } from '../services/brandImages.ts'

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
  const [failedCards, setFailedCards] = useState<GiftCard[]>([])
  const [pendingListings, setPendingListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      api.getMyCards(),
      api.getMyListings(),
    ]).then(([cardsData, listingsData]) => {
      setFailedCards(cardsData.giftCards.filter((c: GiftCard) => c.status === 'FAILED'))
      setPendingListings(listingsData.listings.filter((l: Listing) => l.status === 'PENDING_VERIFICATION'))
    }).catch(console.error)
    .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCancel = async (id: string) => {
    setCancellingId(id)
    try {
      await api.cancelListing(id)
      setPendingListings(prev => prev.filter(l => l.id !== id))
    } catch (err) {
      console.error(err)
    } finally {
      setCancellingId(null)
    }
  }

  const isEmpty = failedCards.length === 0 && pendingListings.length === 0

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
        <button
          onClick={() => navigate('/dashboard')}
          className="text-sm text-[#7c6992] hover:text-[#2e1a47] transition-colors font-medium"
        >
          ← Back to dashboard
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-12">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-[#7c6992] mb-2 font-semibold">Account</p>
          <h1 className="text-3xl font-light text-[#2e1a47]">Pending Listings</h1>
          <p className="text-sm text-[#7c6992] mt-2">Cards and listings awaiting verification before going live.</p>
        </div>

        {loading ? (
          <div className="bg-white border border-[#E3DFEF] rounded-2xl p-10 text-center shadow-sm">
            <p className="text-sm text-[#7c6992]">Loading...</p>
          </div>
        ) : isEmpty ? (
          <div className="bg-white border border-[#E3DFEF] rounded-2xl p-10 text-center shadow-sm">
            <p className="text-sm text-[#7c6992] mb-4">No pending listings.</p>
            <button
              onClick={() => navigate('/submit')}
              className="text-sm bg-[#2e1a47] text-white px-6 py-2.5 rounded-full hover:bg-[#72569C] transition-colors font-semibold"
            >
              Submit a card
            </button>
          </div>
        ) : (
          <div className="space-y-8">

            {/* Awaiting Verification */}
            {pendingListings.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-widest text-[#7c6992] font-semibold mb-4">Awaiting Verification</p>
                <div className="space-y-4">
                  {pendingListings.map(listing => {
                    const image = getBrandImage(listing.giftCard.brand)
                    return (
                      <div key={listing.id} className="bg-white border border-[#E3DFEF] rounded-2xl p-6 shadow-sm">
                        <div className="flex gap-4 flex-col sm:flex-row">
                          <img
                            src={image ?? ''}
                            alt={listing.giftCard.brand}
                            className="w-full sm:w-24 h-20 sm:h-16 object-cover rounded-xl shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 flex-wrap">
                              <div>
                                <p className="text-sm font-semibold text-[#2e1a47]">
                                  {listing.giftCard.brand} — ${listing.giftCard.faceValue.toFixed(2)}
                                </p>
                                <p className="text-xs mt-1 font-medium text-[#7c6992]">Pending verification</p>
                              </div>
                              <button
                                onClick={() => handleCancel(listing.id)}
                                disabled={cancellingId === listing.id}
                                className="text-xs border border-red-200 px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50 font-medium"
                              >
                                {cancellingId === listing.id ? 'Cancelling...' : 'Cancel'}
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3">
                              {listing.buyNowPrice && (
                                <span className="text-xs bg-[#F6F3F9] border border-[#E3DFEF] rounded-full px-2.5 py-1 text-[#2e1a47] font-medium">
                                  Buy ${listing.buyNowPrice.toFixed(2)}
                                </span>
                              )}
                              {listing.minAcceptPrice && (
                                <span className="text-xs bg-[#F6F3F9] border border-[#E3DFEF] rounded-full px-2.5 py-1 text-[#2e1a47] font-medium">
                                  Min bid ${listing.minAcceptPrice.toFixed(2)}
                                </span>
                              )}
                              {listing.acceptsExchange && (
                                <span className="text-xs bg-[#F6F3F9] border border-[#E3DFEF] rounded-full px-2.5 py-1 text-[#2e1a47] font-medium">
                                  Trade
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Verification Failed */}
            {failedCards.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-widest text-[#7c6992] font-semibold mb-4">Verification Failed</p>
                <div className="space-y-4">
                  {failedCards.map(card => {
                    const image = getBrandImage(card.brand)
                    return (
                      <div key={card.id} className="bg-white border border-red-100 rounded-2xl p-6 shadow-sm">
                        <div className="flex gap-4 flex-col sm:flex-row">
                          <img
                            src={image ?? ''}
                            alt={card.brand}
                            className="w-full sm:w-24 h-20 sm:h-16 object-cover rounded-xl shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 flex-wrap">
                              <div>
                                <p className="text-sm font-semibold text-[#2e1a47]">
                                  {card.brand} — ${card.faceValue.toFixed(2)}
                                </p>
                                <p className="text-xs mt-1 font-medium text-red-500">Verification failed</p>
                                {card.rejectionReason && (
                                  <p className="text-xs mt-1 text-[#7c6992]">
                                    <span className="font-semibold">Reason:</span> {card.rejectionReason}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() => navigate('/submit')}
                                className="text-xs border border-[#E3DFEF] px-3 py-1.5 rounded-lg text-[#7c6992] hover:border-[#2e1a47] hover:text-[#2e1a47] transition-colors font-medium"
                              >
                                Resubmit
                              </button>
                            </div>
                            <p className="text-xs text-[#AFABC9] mt-2">
                              Submitted {new Date(card.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  )
}