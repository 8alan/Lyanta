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
      .then(data => setListings(data.listings.filter((l: Listing) => l.status === 'ACTIVE')))
      .catch(console.error)
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCancel = async (id: string) => {
    setCancellingId(id)
    try {
      await api.cancelListing(id)
      setListings(prev => prev.filter(l => l.id !== id))
    } catch (err) {
      console.error(err)
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#F6F3F9] text-[#2e1a47]">

      {/* Nav */}
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
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#7c6992] mb-2 font-semibold">Account</p>
            <h1 className="text-3xl font-light text-[#2e1a47]">Active listings</h1>
          </div>
          <button
            onClick={() => navigate('/submit')}
            className="bg-[#2e1a47] text-white px-5 py-2.5 text-sm font-semibold rounded-lg hover:bg-[#72569C] transition-colors"
          >
            + Submit a card
          </button>
        </div>

        {/* Stats row */}
        {!loading && listings.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white border border-[#E3DFEF] rounded-2xl p-5 shadow-sm">
              <p className="text-xs uppercase tracking-widest text-[#7c6992] mb-2 font-semibold">Listed</p>
              <p className="text-2xl font-semibold text-[#2e1a47]">{listings.length}</p>
            </div>
            <div className="bg-white border border-[#E3DFEF] rounded-2xl p-5 shadow-sm">
              <p className="text-xs uppercase tracking-widest text-[#7c6992] mb-2 font-semibold">Pending bids</p>
              <p className="text-2xl font-semibold text-[#2e1a47]">
                {listings.reduce((sum, l) => sum + l.bids.filter(b => b.status === 'PENDING').length, 0)}
              </p>
            </div>
            <div className="bg-white border border-[#E3DFEF] rounded-2xl p-5 shadow-sm">
              <p className="text-xs uppercase tracking-widest text-[#7c6992] mb-2 font-semibold">Total value</p>
              <p className="text-2xl font-semibold text-[#2e1a47]">
                ${listings.reduce((sum, l) => sum + (l.buyNowPrice ?? l.giftCard.faceValue), 0).toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="bg-white border border-[#E3DFEF] rounded-2xl p-10 text-center shadow-sm">
            <p className="text-sm text-[#7c6992]">Loading...</p>
          </div>

        /* Empty */
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

        /* Listings */
        ) : (
          <div className="space-y-4">
            {listings.map(listing => {
              const image = getBrandImage(listing.giftCard.brand)
              const pendingBids = listing.bids.filter(b => b.status === 'PENDING')
              const discount = listing.buyNowPrice
                ? (((listing.giftCard.faceValue - listing.buyNowPrice) / listing.giftCard.faceValue) * 100).toFixed(0)
                : null

              return (
                <div
                  key={listing.id}
                  className="bg-white border border-[#E3DFEF] rounded-2xl overflow-hidden shadow-[0_2px_3px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.06)]"
                >
                  <div className="flex gap-5 p-6">

                    {/* Brand image */}
                    <div className="relative shrink-0">
                      <div className="w-20 h-14 rounded-xl overflow-hidden bg-[#E3DFEF]">
                        {image ? (
                          <img src={image} alt={listing.giftCard.brand} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-xs text-[#AFABC9] font-medium text-center px-1">{listing.giftCard.brand}</span>
                          </div>
                        )}
                      </div>
                      {discount && (
                        <span className="absolute -top-2 -right-2 text-[10px] bg-white border border-[#E3DFEF] text-[#2e7d32] px-1.5 py-0.5 rounded-full font-semibold shadow-sm">
                          {discount}% off
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">

                      {/* Top row */}
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-[#2e1a47]">
                            {listing.giftCard.brand} Gift Card
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-[#AFABC9]">
                              Face value ${listing.giftCard.faceValue.toFixed(2)}
                            </span>
                            {listing.buyNowPrice && (
                              <>
                                <span className="text-xs text-[#E3DFEF]">→</span>
                                <span className="text-xs font-semibold text-[#2e1a47]">
                                  Selling for ${listing.buyNowPrice.toFixed(2)}
                                </span>
                              </>
                            )}
                          </div>
                          <span className="inline-block mt-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#72569C] bg-[#EDE9F6] px-1.5 py-0.5 rounded-full">
                            Active
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => navigate(`/edit-listing/${listing.id}`)}
                            className="text-xs border border-[#E3DFEF] px-3 py-1.5 rounded-lg text-[#7c6992] hover:border-[#2e1a47] hover:text-[#2e1a47] transition-colors font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleCancel(listing.id)}
                            disabled={cancellingId === listing.id}
                            className="text-xs border border-red-200 px-3 py-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:border-red-300 transition-colors disabled:opacity-50 font-medium"
                          >
                            {cancellingId === listing.id ? 'Cancelling...' : 'Cancel'}
                          </button>
                        </div>
                      </div>

                      {/* Pills */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {listing.minAcceptPrice && (
                          <span className="text-xs bg-[#F6F3F9] border border-[#E3DFEF] rounded-full px-2.5 py-1 text-[#2e1a47] font-medium">
                            Bids from ${listing.minAcceptPrice.toFixed(2)}
                          </span>
                        )}
                        {listing.acceptsExchange && (
                          <span className="text-xs bg-[#F6F3F9] border border-[#E3DFEF] rounded-full px-2.5 py-1 text-[#2e1a47] font-medium">
                            Accepts trade
                          </span>
                        )}
                        <span className="text-xs text-[#AFABC9] py-1">
                          Listed {new Date(listing.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>

                    </div>
                  </div>

                  {/* Pending bids */}
                  {pendingBids.length > 0 && (
                    <div className="border-t border-[#E3DFEF] bg-[#F6F3F9] px-6 py-4">
                      <p className="text-xs font-semibold text-[#7c6992] uppercase tracking-widest mb-3">
                        {pendingBids.length} pending bid{pendingBids.length > 1 ? 's' : ''}
                      </p>
                      <div className="space-y-2">
                        {pendingBids.map(bid => (
                          <div
                            key={bid.id}
                            className="flex items-center justify-between bg-white border border-[#E3DFEF] rounded-xl px-4 py-3"
                          >
                            <span className="text-sm font-medium text-[#2e1a47]">
                              {bid.bidType === 'CASH'
                                ? `$${bid.cashAmount?.toFixed(2)} cash offer`
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
                                className="text-xs font-semibold text-[#2e7d32] hover:text-green-700 transition-colors"
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
                                className="text-xs font-semibold text-red-400 hover:text-red-600 transition-colors"
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
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}