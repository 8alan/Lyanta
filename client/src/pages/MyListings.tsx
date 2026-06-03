import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi } from '../services/api.ts'
import { getBrandImage } from '../services/brandImages.ts'

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

export default function MyListings() {
  const navigate = useNavigate()
  const api = useApi()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  useEffect(() => {
    api.getMyListings()
      .then(data => setListings(data.listings))
      .catch(console.error)
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCancel = async (id: string) => {
    setCancellingId(id)
    try {
      await api.cancelListing(id)
      setListings(prev => prev.map(l =>
        l.id === id ? { ...l, status: 'CANCELLED' } : l
      ))
    } catch (err) {
      console.error(err)
    } finally {
      setCancellingId(null)
    }
  }

  const statusLabel: Record<string, string> = {
    PENDING_VERIFICATION: 'Pending verification',
    ACTIVE: 'Active',
    RESERVED: 'Reserved',
    COMPLETED: 'Sold',
    CANCELLED: 'Cancelled',
  }

  const statusColor: Record<string, string> = {
    PENDING_VERIFICATION: 'text-[#7a7a9a]',
    ACTIVE: 'text-green-600',
    RESERVED: 'text-yellow-600',
    COMPLETED: 'text-[#1a1a2e]',
    CANCELLED: 'text-red-500',
  }

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

      <div className="max-w-4xl mx-auto px-8 py-12">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-[#7a7a9a] mb-2">Account</p>
          <h1 className="text-3xl font-semibold text-[#1a1a2e]">My listings</h1>
        </div>

        {loading ? (
          <div className="bg-white border border-[#e2e0db] p-8 text-center">
            <p className="text-sm text-[#7a7a9a]">Loading...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-white border border-[#e2e0db] p-8 text-center">
            <p className="text-sm text-[#7a7a9a] mb-4">You haven't listed any cards yet.</p>
            <button
              onClick={() => navigate('/submit')}
              className="text-sm bg-[#1a1a2e] text-white px-6 py-2 hover:bg-[#2d2d4e] transition-colors"
            >
              Submit a card
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map(listing => {
              const image = getBrandImage(listing.giftCard.brand)
              const pendingBids = listing.bids.filter(b => b.status === 'PENDING')

              return (
                <div key={listing.id} className="bg-white border border-[#e2e0db] p-6">
                  <div className="flex gap-4">
                    <img
                      src={image ?? ''}
                      alt={listing.giftCard.brand}
                      className="w-24 h-16 object-cover shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-[#1a1a2e]">
                            {listing.giftCard.brand} — ${listing.giftCard.faceValue.toFixed(2)}
                          </p>
                          <p className={`text-xs mt-1 ${statusColor[listing.status] ?? 'text-[#7a7a9a]'}`}>
                            {statusLabel[listing.status] ?? listing.status}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {(listing.status === 'ACTIVE' || listing.status === 'PENDING_VERIFICATION') && (
                            <>
                              <button
                                onClick={() => navigate(`/edit-listing/${listing.id}`)}
                                className="text-xs border border-[#e2e0db] px-3 py-1 text-[#4a4a6a] hover:border-[#1a1a2e] hover:text-[#1a1a2e] transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleCancel(listing.id)}
                                disabled={cancellingId === listing.id}
                                className="text-xs border border-red-200 px-3 py-1 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                              >
                                {cancellingId === listing.id ? 'Cancelling...' : 'Cancel'}
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-4 mt-3 text-xs text-[#7a7a9a]">
                        {listing.buyNowPrice && (
                          <span>Buy now: ${listing.buyNowPrice.toFixed(2)}</span>
                        )}
                        {listing.minAcceptPrice && (
                          <span>Min bid: ${listing.minAcceptPrice.toFixed(2)}</span>
                        )}
                        {listing.acceptsExchange && (
                          <span>Accepts exchange</span>
                        )}
                      </div>

                      {pendingBids.length > 0 && (
                        <div className="mt-3 p-3 bg-[#f8f7f4] border border-[#e2e0db]">
                          <p className="text-xs font-semibold text-[#1a1a2e] mb-2">
                            {pendingBids.length} pending bid{pendingBids.length > 1 ? 's' : ''}
                          </p>
                          {pendingBids.map(bid => (
                            <div key={bid.id} className="flex items-center justify-between text-xs text-[#4a4a6a] py-1">
                              <span>
                                {bid.bidType === 'CASH'
                                  ? `Cash offer: $${bid.cashAmount?.toFixed(2)}`
                                  : 'Exchange offer'}
                              </span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => api.acceptBid(listing.id, bid.id).then(() => {
                                    setListings(prev => prev.map(l =>
                                      l.id === listing.id ? { ...l, status: 'RESERVED' } : l
                                    ))
                                  })}
                                  className="text-green-600 hover:text-green-700 font-semibold"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => api.rejectBid(listing.id, bid.id).then(() => {
                                    setListings(prev => prev.map(l => ({
                                      ...l,
                                      bids: l.bids.map(b =>
                                        b.id === bid.id ? { ...b, status: 'REJECTED' } : b
                                      )
                                    })))
                                  })}
                                  className="text-red-500 hover:text-red-600 font-semibold"
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}