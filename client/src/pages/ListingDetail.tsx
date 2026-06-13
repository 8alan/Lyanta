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
            <span className="text-[#e2e0db]">★</span>
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
        await api.placeBid(id, {
          bidType: 'CASH',
          cashAmount: listing.buyNowPrice!
        })
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
      <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center">
        <p className="text-sm text-[#7a7a9a]">Loading...</p>
      </div>
    )
  }

  if (!listing) return null

  const image = getBrandImage(listing.giftCard.brand)
  const seller = listing.user.username ?? listing.user.name ?? 'Anonymous'
  const discount = listing.buyNowPrice
    ? (((listing.giftCard.faceValue - listing.buyNowPrice) / listing.giftCard.faceValue) * 100).toFixed(0)
    : null

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-[#1a1a2e]">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-[#e2e0db] bg-white">
        <button onClick={() => navigate('/dashboard')} className="text-xl font-semibold tracking-tight">
          Lantana
        </button>
        <button
          onClick={() => navigate('/browse')}
          className="text-sm text-[#4a4a6a] hover:text-[#1a1a2e] transition-colors"
        >
          ← Back to browse
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Left — Card Info */}
          <div>
            <div className="relative mb-6">
              <img
                src={image ?? ''}
                alt={listing.giftCard.brand}
                className="w-full h-56 object-cover"
              />
              {discount && (
                <span className="absolute top-3 right-3 text-xs bg-white text-green-700 border border-green-200 px-2 py-1 font-semibold">
                  {discount}% off
                </span>
              )}
            </div>

            <div className="bg-white border border-[#e2e0db] p-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#7a7a9a]">Brand</span>
                <span className="font-semibold">
                  {listing.giftCard.brand === 'Other' && listing.giftCard.description
                    ? listing.giftCard.description
                    : listing.giftCard.brand}
                </span>
              </div>
              {listing.buyNowPrice && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#7a7a9a]">Buy now</span>
                  <span className="font-semibold text-[#1a1a2e]">${listing.buyNowPrice.toFixed(2)}</span>
                </div>
              )}
              {listing.minAcceptPrice && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#7a7a9a]">Minimum bid</span>
                  <span className="text-[#1a1a2e]">${listing.minAcceptPrice.toFixed(2)}</span>
                </div>
          )}
              <div className="flex justify-between text-sm">
                <span className="text-[#7a7a9a]">Seller</span>
                <div className="flex flex-col items-end gap-1">
                  {listing.user.username ? (
                    <button
                      onClick={() => navigate(`/profile/${listing.user.username}`)}
                      className="text-[#1a1a2e] hover:underline transition-colors"
                    >
                      @{seller}
                    </button>
                  ) : (
                    <span className="text-[#1a1a2e]">{seller}</span>
                  )}
                  {listing.user.avgRating !== null && listing.user.reviewCount > 0 && (
                    <div className="flex items-center gap-1">
                      <StarDisplay avg={listing.user.avgRating} />
                      <span className="text-xs text-[#7a7a9a]">({listing.user.reviewCount})</span>
                    </div>
                  )}
                </div>
              </div>
              {listing.acceptsExchange && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#7a7a9a]">Accepts exchange</span>
                  <span className="text-green-600">Yes</span>
                </div>
              )}
              {listing.preferredBrand.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#7a7a9a]">Wants</span>
                  <span className="text-[#1a1a2e]">{listing.preferredBrand.join(', ')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right — Actions */}
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#7a7a9a] mb-2">Marketplace</p>
              <h1 className="text-2xl font-semibold text-[#1a1a2e]">
                {listing.giftCard.brand === 'Other' && listing.giftCard.description
                  ? listing.giftCard.description
                  : `${listing.giftCard.brand} Gift Card`}
              </h1>
            </div>

            {success && (
              <div className="bg-green-50 border border-green-200 p-4">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {listing.status === 'ACTIVE' && !success && (
              <>
                {/* Buy Now */}
                {listing.buyNowPrice && (
                  <div className="bg-white border border-[#e2e0db] p-6">
                    <p className="text-sm font-semibold text-[#1a1a2e] mb-1">
                      Buy now for ${listing.buyNowPrice.toFixed(2)}
                    </p>
                    <p className="text-xs text-[#7a7a9a] mb-4">
                      Instant purchase — seller confirms and sends card details
                    </p>
                    <button
                      onClick={handleBuyNow}
                      disabled={submitting}
                      className="w-full bg-[#1a1a2e] text-white py-3 text-sm font-semibold hover:bg-[#2d2d4e] transition-colors disabled:opacity-50"
                    >
                      {submitting ? 'Processing...' : `Buy for $${listing.buyNowPrice.toFixed(2)}`}
                    </button>
                  </div>
                )}

                {/* Place Bid / Exchange Offer */}
                <div className="bg-white border border-[#e2e0db] p-6">
                  <p className="text-sm font-semibold text-[#1a1a2e] mb-4">Make an offer</p>

                  {/* Bid Type Toggle */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <button
                      type="button"
                      onClick={() => setBidType('CASH')}
                      className={`py-2 text-sm border transition-colors ${
                        bidType === 'CASH'
                          ? 'bg-[#1a1a2e] text-white border-[#1a1a2e]'
                          : 'bg-white text-[#1a1a2e] border-[#e2e0db] hover:border-[#1a1a2e]'
                      }`}
                    >
                      Cash offer
                    </button>
                    {listing.acceptsExchange && (
                      <button
                        type="button"
                        onClick={() => setBidType('EXCHANGE')}
                        className={`py-2 text-sm border transition-colors ${
                          bidType === 'EXCHANGE'
                            ? 'bg-[#1a1a2e] text-white border-[#1a1a2e]'
                            : 'bg-white text-[#1a1a2e] border-[#e2e0db] hover:border-[#1a1a1e]'
                        }`}
                      >
                        Exchange card
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleBid} className="space-y-4">
                    {bidType === 'CASH' ? (
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-[#7a7a9a] mb-2">
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
                          className="w-full bg-white border border-[#e2e0db] px-4 py-3 text-sm focus:outline-none focus:border-[#1a1a2e] transition-colors"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-[#7a7a9a] mb-2">
                          Select a card to offer
                        </label>
                        {myCards.length === 0 ? (
                          <p className="text-sm text-[#7a7a9a]">
                            You have no verified cards available for exchange.
                          </p>
                        ) : (
                          <select
                            value={offeredCardId}
                            onChange={e => setOfferedCardId(e.target.value)}
                            required
                            className="w-full bg-white border border-[#e2e0db] px-4 py-3 text-sm focus:outline-none focus:border-[#1a1a2e] transition-colors"
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
                      className="w-full bg-white border border-[#1a1a2e] text-[#1a1a2e] py-3 text-sm font-semibold hover:bg-[#f8f7f4] transition-colors disabled:opacity-50"
                    >
                      {submitting ? 'Submitting...' : bidType === 'CASH' ? 'Submit cash offer' : 'Submit exchange offer'}
                    </button>
                  </form>
                </div>
              </>
            )}

            {listing.status !== 'ACTIVE' && !success && (
              <div className="bg-white border border-[#e2e0db] p-6 text-center">
                <p className="text-sm text-[#7a7a9a]">This listing is no longer available.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scam Warning Modal */}
      {showScamWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white max-w-md w-full p-8 space-y-4">
            <h2 className="text-lg font-semibold text-[#1a1a2e]">Before you continue</h2>
            <p className="text-sm text-[#4a4a6a] leading-relaxed">
              <span className="font-semibold text-red-600">Only scammers will tell you to buy a gift card</span> — like a Google Play or Apple Card — and give them the numbers off the back. No matter what they say, that's a scam.
            </p>
            <p className="text-sm text-[#4a4a6a] leading-relaxed">
              No real business or government agency will ever tell you to buy a gift card to pay them. Always keep a copy of your gift card and store receipt so you can report any issues.
            </p>
            <a
              href="https://consumer.ftc.gov/articles/avoiding-and-reporting-gift-card-scams"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-blue-600 hover:underline"
            >
              Learn more about avoiding and reporting gift card scams →
            </a>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setShowScamWarning(false)
                  setPendingAction(null)
                }}
                className="flex-1 py-3 text-sm border border-[#e2e0db] text-[#4a4a6a] hover:border-[#1a1a2e] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleScamWarningConfirm}
                className="flex-1 py-3 text-sm bg-[#1a1a2e] text-white font-semibold hover:bg-[#2d2d4e] transition-colors"
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