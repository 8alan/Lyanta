import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi } from '../services/api.ts'
import { useStore } from '../store/useStore.ts'
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
  const { myListings: cachedListings, setMyListings } = useStore()
  const [listings, setListings] = useState<Listing[]>(
    cachedListings.filter(l => l.status === 'ACTIVE') as Listing[]
  )
  const [loading, setLoading] = useState(cachedListings.length === 0)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  useEffect(() => {
    api.getMyListings()
      .then(data => {
        const active = data.listings.filter((l: Listing) => l.status === 'ACTIVE')
        setListings(active)
        setMyListings(data.listings)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCancel = async (id: string) => {
    setCancellingId(id)
    try {
      await api.cancelListing(id)
      setListings(prev => prev.filter(l => l.id !== id))
      setMyListings(cachedListings.filter(l => l.id !== id))
    } catch (err) {
      console.error(err)
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#F6F3F9] text-[#2e1a47]">

      {/* ── Delete confirmation modal ── */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-xl border border-[#E3DFEF]">
            <h2 className="text-base font-semibold text-[#2e1a47] mb-2">Delete listing?</h2>
            <p className="text-sm text-[#7c6992] mb-6">
              This will permanently remove your listing from the marketplace.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="text-sm px-4 py-2 rounded-lg border border-[#E3DFEF] text-[#7c6992] hover:border-[#2e1a47] hover:text-[#2e1a47] transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleCancel(confirmDeleteId)
                  setConfirmDeleteId(null)
                }}
                disabled={cancellingId === confirmDeleteId}
                className="text-sm px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors font-medium disabled:opacity-50"
              >
                {cancellingId === confirmDeleteId ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

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

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-[#7c6992] mb-2 font-semibold">
            Account
          </p>
          <h1 className="text-3xl font-light text-[#2e1a47]">Active Listings</h1>
        </div>

        {loading ? (
          <div className="bg-white border border-[#E3DFEF] rounded-2xl p-10 text-center shadow-sm">
            <p className="text-sm text-[#7c6992]">Loading...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-white border border-[#E3DFEF] rounded-2xl p-10 text-center shadow-sm">
            <p className="text-sm text-[#7c6992] mb-4">You have no active listings.</p>
            <button
              onClick={() => navigate('/submit')}
              className="text-sm bg-[#2e1a47] text-white px-6 py-2.5 rounded-full hover:bg-[#72569C] transition-colors font-semibold"
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
                <div
                  key={listing.id}
                  className="bg-white border border-[#E3DFEF] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
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
                          <p className="text-xs mt-1 font-medium text-[#2e7d32]">Active</p>
                        </div>

                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => navigate(`/edit-listing/${listing.id}`)}
                            className="text-xs border border-[#AFABC9] px-3 py-1.5 rounded-lg text-[#7c6992] hover:border-[#2e1a47] hover:text-[#2e1a47] transition-colors font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(listing.id)}
                            className="text-xs border border-red-200 px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors font-medium"
                          >
                            Delete
                          </button>
                        </div>
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

                      {pendingBids.length > 0 && (
                        <div className="mt-4 p-4 bg-[#F6F3F9] border border-[#E3DFEF] rounded-xl">
                          <p className="text-xs font-semibold text-[#2e1a47] mb-3 uppercase tracking-widest">
                            {pendingBids.length} pending bid{pendingBids.length > 1 ? 's' : ''}
                          </p>
                          <div className="space-y-2">
                            {pendingBids.map(bid => (
                              <div
                                key={bid.id}
                                className="flex items-center justify-between text-xs text-[#7c6992] py-2 border-b border-[#E3DFEF] last:border-0 last:pb-0"
                              >
                                <span className="font-medium text-[#2e1a47]">
                                  {bid.bidType === 'CASH'
                                    ? `Cash offer: $${bid.cashAmount?.toFixed(2)}`
                                    : 'Exchange offer'}
                                </span>
                                <div className="flex gap-3">
                                  <button
                                    onClick={() => api.acceptBid(listing.id, bid.id).then(() => {
                                      setListings(prev => prev.map(l =>
                                        l.id === listing.id
                                          ? {
                                              ...l,
                                              status: 'RESERVED',
                                              bids: l.bids.map(b =>
                                                b.id === bid.id ? { ...b, status: 'ACCEPTED' } : { ...b, status: 'REJECTED' }
                                              )
                                            }
                                          : l
                                      ))
                                    })}
                                    className="text-[#2e7d32] hover:text-green-700 font-semibold"
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