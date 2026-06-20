import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApi } from '../services/api.ts'
import { getBrandImage } from '../services/brandImages.ts'

interface MyCard {
  id: string
  brand: string
  faceValue: number
  status: string
}

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
    avgRating: number | null
    reviewCount: number
  }
  bids: {
    id: string
    bidType: string
    cashAmount: number | null
    createdAt: string
  }[]
}

function StarDisplay({ avg }: { avg: number }) {
  const rounded = Math.ceil(avg * 2) / 2
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => {
        const full = star <= Math.floor(rounded)
        const half = !full && star === Math.ceil(rounded) && rounded % 1 !== 0
        return (
          <span key={star} className="text-sm relative">
            <span className="text-[#E3DFEF]">★</span>
            {(full || half) && (
              <span
                className="absolute inset-0 text-yellow-400 overflow-hidden"
                style={{ width: full ? '100%' : '50%' }}
              >
                ★
              </span>
            )}
          </span>
        )
      })}
    </div>
  )
}

export default function ListingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const api = useApi()
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [bidType, setBidType] = useState<'CASH' | 'EXCHANGE'>('CASH')
  const [cashAmount, setCashAmount] = useState('')
  const [offeredCardId, setOfferedCardId] = useState('')
  const [myCards, setMyCards] = useState<MyCard[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showScamWarning, setShowScamWarning] = useState(false)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)

  useEffect(() => {
    if (!id) return
    Promise.all([
      api.getListingById(id),
      api.getMyCards()
    ]).then(([listingData, cardsData]) => {
      setListing(listingData.listing)
      setMyCards(cardsData.giftCards.filter((c: MyCard) => c.status === 'AVAILABLE'))
    }).catch(() => navigate('/browse'))
    .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleBuyNow = async () => {
    if (!id || !listing?.buyNowPrice) return
    setPendingAction(() => async () => {
      setSubmitting(true)
      setError('')
      try {
        await api.placeBid(id, { bidType: 'CASH', cashAmount: listing.buyNowPrice! })
        setSuccess('Purchase successful! The seller will be notified.')
        setListing(prev => prev ? { ...prev, status: 'RESERVED' } : prev)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Something went wrong'
        setError(message)
      } finally {
        setSubmitting(false)
      }
    })
    setShowScamWarning(true)
  }

  const handleBid = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    setPendingAction(() => async () => {
      setSubmitting(true)
      setError('')
      try {
        await api.placeBid(id, {
          bidType,
          cashAmount: bidType === 'CASH' ? parseFloat(cashAmount) : undefined,
          offeredCardId: bidType === 'EXCHANGE' ? offeredCardId : undefined
        })
        setSuccess(bidType === 'CASH'
          ? 'Bid submitted! The seller will review your offer.'
          : 'Exchange offer submitted! The seller will review your card.'
        )
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Something went wrong'
        setError(message)
      } finally {
        setSubmitting(false)
      }
    })
    setShowScamWarning(true)
  }

  const handleScamWarningConfirm = async () => {
    setShowScamWarning(false)
    if (pendingAction) {
      await pendingAction()
      setPendingAction(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F3F9] flex items-center justify-center">
        <p className="text-sm text-[#7c6992]">Loading...</p>
      </div>
    )
  }

  if (!listing) return null

  const image = getBrandImage(listing.giftCard.brand)
  const seller = listing.user.username ?? listing.user.name ?? 'Anonymous'
  const discount = listing.buyNowPrice
    ? (((listing.giftCard.faceValue - listing.buyNowPrice) / listing.giftCard.faceValue) * 100).toFixed(0)
    : null
  const brandName = listing.giftCard.brand === 'Other' && listing.giftCard.description
    ? listing.giftCard.description
    : `${listing.giftCard.brand} Gift Card`

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
          onClick={() => navigate('/browse')}
          className="text-sm text-[#7c6992] hover:text-[#2e1a47] transition-colors font-medium"
        >
          ← Back to browse
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-12">

        {/* Page heading */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-[#7c6992] mb-2">Marketplace</p>
          <h1 className="text-3xl font-light text-[#2e1a47]">{brandName}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Left — Card Info */}
          <div className="space-y-4">

            {/* Image */}
            <div className="relative rounded-2xl overflow-hidden">
              <img
                src={image ?? ''}
                alt={listing.giftCard.brand}
                className="w-full h-52 object-cover"
              />
              {discount && (
                <span className="absolute top-3 right-3 text-xs bg-white text-[#2e7d32] border border-green-200 px-2.5 py-1 rounded-full font-semibold shadow-sm">
                  {discount}% off
                </span>
              )}
            </div>

            {/* Card details */}
            <div className="bg-white border border-[#E3DFEF] rounded-2xl p-6 shadow-[0_2px_3px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.06)] space-y-3">
              <p className="text-xs uppercase tracking-widest text-[#7c6992] mb-4">Card details</p>

              <div className="flex justify-between text-sm">
                <span className="text-[#7c6992]">Brand</span>
                <span className="font-semibold text-[#2e1a47]">
                  {listing.giftCard.brand === 'Other' && listing.giftCard.description
                    ? listing.giftCard.description
                    : listing.giftCard.brand}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-[#7c6992]">Face value</span>
                <span className="font-semibold text-[#2e1a47]">${listing.giftCard.faceValue.toFixed(2)}</span>
              </div>

              {listing.buyNowPrice && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#7c6992]">Selling for</span>
                  <span className="font-semibold text-[#2e1a47]">${listing.buyNowPrice.toFixed(2)}</span>
                </div>
              )}

              {listing.minAcceptPrice && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#7c6992]">Minimum bid</span>
                  <span className="text-[#2e1a47]">${listing.minAcceptPrice.toFixed(2)}</span>
                </div>
              )}

              {listing.acceptsExchange && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#7c6992]">Accepts exchange</span>
                  <span className="text-[#2e7d32] font-medium">Yes</span>
                </div>
              )}

              {listing.preferredBrand.length > 0 && (
                <div className="flex justify-between text-sm gap-4">
                  <span className="text-[#7c6992] shrink-0">Wants</span>
                  <span className="text-[#2e1a47] text-right">{listing.preferredBrand.join(', ')}</span>
                </div>
              )}
            </div>

            {/* Seller */}
            <div className="bg-white border border-[#E3DFEF] rounded-2xl p-6 shadow-[0_2px_3px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.06)]">
              <p className="text-xs uppercase tracking-widest text-[#7c6992] mb-4">Seller</p>
              <div className="flex items-center justify-between">
                {listing.user.username ? (
                  <button
                    onClick={() => navigate(`/profile/${listing.user.username}`)}
                    className="text-sm font-semibold text-[#2e1a47] hover:text-[#72569C] transition-colors"
                  >
                    @{seller}
                  </button>
                ) : (
                  <span className="text-sm font-semibold text-[#2e1a47]">{seller}</span>
                )}
                {listing.user.avgRating !== null && listing.user.reviewCount > 0 && (
                  <div className="flex items-center gap-1.5">
                    <StarDisplay avg={listing.user.avgRating} />
                    <span className="text-xs text-[#AFABC9]">({listing.user.reviewCount})</span>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right — Actions */}
          <div className="space-y-4">

            {success && (
              <div className="bg-white border border-green-200 rounded-2xl p-5 shadow-sm">
                <p className="text-sm text-[#2e7d32] font-medium">{success}</p>
              </div>
            )}

            {error && (
              <div className="bg-white border border-red-200 rounded-2xl p-5 shadow-sm">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            {listing.status === 'ACTIVE' && !success && (
              <>
                {/* Buy Now */}
                {listing.buyNowPrice && (
                  <div className="bg-[#2e1a47] rounded-2xl p-6 shadow-[0_6px_24px_rgba(46,26,71,0.25)]">
                    <p className="text-xs uppercase tracking-widest text-[#AFABC9] mb-1">Buy now</p>
                    <p className="text-3xl font-light text-white mb-1">${listing.buyNowPrice.toFixed(2)}</p>
                    <p className="text-xs text-[#AFABC9] mb-5">
                      Instant purchase — seller confirms and sends card details
                    </p>
                    <button
                      onClick={handleBuyNow}
                      disabled={submitting}
                      className="w-full bg-white text-[#2e1a47] py-3 text-sm font-semibold rounded-xl hover:bg-[#F6F3F9] transition-colors disabled:opacity-50 shadow-sm"
                    >
                      {submitting ? 'Processing...' : `Buy for $${listing.buyNowPrice.toFixed(2)}`}
                    </button>
                  </div>
                )}

                {/* Make an offer */}
                <div className="bg-white border border-[#E3DFEF] rounded-2xl p-6 shadow-[0_2px_3px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.06)]">
                  <p className="text-xs uppercase tracking-widest text-[#7c6992] mb-4">Make an offer</p>

                  {/* Bid type toggle */}
                  <div className="grid grid-cols-2 gap-2 mb-5">
                    <button
                      type="button"
                      onClick={() => setBidType('CASH')}
                      className={`py-2 text-sm rounded-xl border font-medium transition-colors ${
                        bidType === 'CASH'
                          ? 'bg-[#2e1a47] text-white border-[#2e1a47]'
                          : 'bg-[#F6F3F9] text-[#7c6992] border-[#E3DFEF] hover:border-[#2e1a47] hover:text-[#2e1a47]'
                      }`}
                    >
                      Cash offer
                    </button>
                    {listing.acceptsExchange && (
                      <button
                        type="button"
                        onClick={() => setBidType('EXCHANGE')}
                        className={`py-2 text-sm rounded-xl border font-medium transition-colors ${
                          bidType === 'EXCHANGE'
                            ? 'bg-[#2e1a47] text-white border-[#2e1a47]'
                            : 'bg-[#F6F3F9] text-[#7c6992] border-[#E3DFEF] hover:border-[#2e1a47] hover:text-[#2e1a47]'
                        }`}
                      >
                        Exchange card
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleBid} className="space-y-4">
                    {bidType === 'CASH' ? (
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-[#7c6992] mb-2">
                          Your offer ($)
                        </label>
                        <input
                          type="number"
                          value={cashAmount}
                          onChange={e => setCashAmount(e.target.value)}
                          required
                          min={listing.minAcceptPrice ?? 1}
                          max={listing.buyNowPrice ?? listing.giftCard.faceValue}
                          step="0.01"
                          placeholder={listing.minAcceptPrice ? `Min $${listing.minAcceptPrice}` : '0.00'}
                          className="w-full bg-[#F6F3F9] border border-[#E3DFEF] rounded-xl px-4 py-3 text-sm text-[#2e1a47] placeholder-[#AFABC9] focus:outline-none focus:border-[#72569C] transition-colors"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-[#7c6992] mb-2">
                          Select a card to offer
                        </label>
                        {myCards.length === 0 ? (
                          <p className="text-sm text-[#AFABC9]">
                            You have no verified cards available for exchange.
                          </p>
                        ) : (
                          <select
                            value={offeredCardId}
                            onChange={e => setOfferedCardId(e.target.value)}
                            required
                            className="w-full bg-[#F6F3F9] border border-[#E3DFEF] rounded-xl px-4 py-3 text-sm text-[#2e1a47] focus:outline-none focus:border-[#72569C] transition-colors"
                          >
                            <option value="">Select a card</option>
                            {myCards.map((card: MyCard) => (
                              <option key={card.id} value={card.id}>
                                {card.brand} — ${card.faceValue.toFixed(2)}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting || (bidType === 'EXCHANGE' && myCards.length === 0)}
                      className="w-full border border-[#2e1a47] text-[#2e1a47] py-3 text-sm font-semibold rounded-xl hover:bg-[#2e1a47] hover:text-white transition-colors disabled:opacity-50"
                    >
                      {submitting ? 'Submitting...' : bidType === 'CASH' ? 'Submit cash offer' : 'Submit exchange offer'}
                    </button>
                  </form>
                </div>
              </>
            )}

            {listing.status !== 'ACTIVE' && !success && (
              <div className="bg-white border border-[#E3DFEF] rounded-2xl p-6 text-center shadow-sm">
                <p className="text-sm text-[#AFABC9]">This listing is no longer available.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scam Warning Modal */}
      {showScamWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-xl space-y-4">
            <h2 className="text-lg font-semibold text-[#2e1a47]">Before you continue</h2>
            <p className="text-sm text-[#7c6992] leading-relaxed">
              <span className="font-semibold text-red-500">Only scammers will tell you to buy a gift card</span> — like a Google Play or Apple Card — and give them the numbers off the back. No matter what they say, that's a scam.
            </p>
            <p className="text-sm text-[#7c6992] leading-relaxed">
              No real business or government agency will ever tell you to buy a gift card to pay them. Always keep a copy of your gift card and store receipt so you can report any issues.
            </p>
            <a
              href="https://consumer.ftc.gov/articles/avoiding-and-reporting-gift-card-scams"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-[#72569C] hover:text-[#2e1a47] transition-colors"
            >
              Learn more about avoiding and reporting gift card scams →
            </a>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setShowScamWarning(false); setPendingAction(null) }}
                className="flex-1 py-3 text-sm border border-[#E3DFEF] rounded-xl text-[#7c6992] hover:border-[#2e1a47] hover:text-[#2e1a47] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleScamWarningConfirm}
                className="flex-1 py-3 text-sm bg-[#2e1a47] text-white font-semibold rounded-xl hover:bg-[#72569C] transition-colors"
              >
                I understand, continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}