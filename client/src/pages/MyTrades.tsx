import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi } from '../services/api.ts'
import { getBrandImage } from '../services/brandImages.ts'

interface Trade {
  id: string
  status: string
  tradeType: string
  finalPrice: number | null
  createdAt: string
  listingId: string
  hasReviewed: boolean
  listing: {
    giftCard: {
      brand: string
      faceValue: number
      revealed: boolean
      description: string | null
    }
  }
  seller: { username: string | null; name: string | null }
  buyer: { username: string | null; name: string | null }
}

interface CardDetails {
  brand: string
  cardNumber: string
  pin: string
  faceValue: number
  description: string | null
}

export default function MyTrades() {
  const navigate = useNavigate()
  const api = useApi()
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [claimingId, setClaimingId] = useState<string | null>(null)
  const [claimedCard, setClaimedCard] = useState<CardDetails | null>(null)
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState('')

  useEffect(() => {
    api.getMyTrades()
      .then(data => setTrades(data.trades))
      .catch(console.error)
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleClaim = async (listingId: string) => {
    setClaimingId(listingId)
    try {
      const data = await api.getCardDetails(listingId)
      setClaimedCard(data.cardDetails)
      setTrades(prev => prev.map(t =>
        t.listingId === listingId
          ? { ...t, status: 'COMPLETED', listing: { ...t.listing, giftCard: { ...t.listing.giftCard, revealed: true } } }
          : t
      ))
    } catch (err) {
      console.error(err)
    } finally {
      setClaimingId(null)
    }
  }

  const handleSubmitReview = async (tradeId: string) => {
    if (rating === 0) {
      setReviewError('Please select a rating')
      return
    }
    setSubmittingReview(true)
    setReviewError('')
    try {
      await api.submitReview(tradeId, { rating, comment: comment || undefined })
      setTrades(prev => prev.map(t => t.id === tradeId ? { ...t, hasReviewed: true } : t))
      setReviewingId(null)
      setRating(0)
      setComment('')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setReviewError(message)
    } finally {
      setSubmittingReview(false)
    }
  }

  const statusLabel: Record<string, string> = {
    PENDING: 'Awaiting confirmation',
    COMPLETED: 'Completed',
    FAILED: 'Failed',
    DISPUTED: 'Disputed',
  }

  const statusColor: Record<string, string> = {
    PENDING: 'text-yellow-600',
    COMPLETED: 'text-[#2e7d32]',
    FAILED: 'text-red-500',
    DISPUTED: 'text-red-500',
  }

  // ── Claimed card view ──
  if (claimedCard) {
    return (
      <div className="min-h-screen bg-[#F6F3F9] text-[#2e1a47]">

        {/* Nav */}
        <nav className="flex items-center justify-between px-4 sm:px-8 py-5 border-b border-[#E3DFEF] bg-white shadow-sm">
          <button
            onClick={() => navigate('/dashboard')}
            className="font-display text-xl text-[#2e1a47] tracking-tight"
          >
            Lantana
          </button>
        </nav>

        <div className="max-w-2xl mx-auto px-4 sm:px-8 py-24 text-center">
          <p className="text-xs uppercase tracking-widest text-[#7c6992] mb-4">Card claimed</p>
          <h1 className="text-3xl font-light text-[#2e1a47] mb-4">Your card is ready.</h1>
          <p className="text-sm text-[#7c6992] mb-8 leading-relaxed">
            Save these details carefully. These details have also been sent to your email.
          </p>

          <div className="bg-white border border-[#E3DFEF] rounded-2xl p-8 text-left space-y-4 mb-8 shadow-sm">
            <div className="flex justify-between text-sm">
              <span className="text-[#AFABC9]">Brand</span>
              <span className="font-normal text-[#2e1a47]">
                {claimedCard.brand === 'Other' && claimedCard.description
                  ? claimedCard.description
                  : claimedCard.brand}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#AFABC9]">Face value</span>
              <span className="font-normal text-[#2e1a47]">${claimedCard.faceValue.toFixed(2)}</span>
            </div>
            <div className="border-t border-[#E3DFEF] pt-4 flex justify-between text-sm items-center">
              <span className="text-[#AFABC9]">Card Number</span>
              <div className="flex items-center gap-2">
                <span className="font-normal font-mono text-[#2e1a47]">{claimedCard.cardNumber}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(claimedCard.cardNumber)}
                  title="Copy card number"
                  className="text-[#AFABC9] hover:text-[#2e1a47] transition-colors"
                >
                  📋
                </button>
              </div>
            </div>
            <div className="flex justify-between text-sm items-center">
              <span className="text-[#AFABC9]">PIN</span>
              <div className="flex items-center gap-2">
                <span className="font-normal font-mono text-[#2e1a47]">{claimedCard.pin}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(claimedCard.pin)}
                  title="Copy PIN"
                  className="text-[#AFABC9] hover:text-[#2e1a47] transition-colors"
                >
                  📋
                </button>
              </div>
            </div>
          </div>

          <p className="text-xs text-[#AFABC9] mb-8 leading-relaxed">
            These details will not be shown again on Lantana for security reasons.
          </p>

          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={() => {
                const text = [
                  `Brand: ${claimedCard.brand === 'Other' && claimedCard.description ? claimedCard.description : claimedCard.brand}`,
                  `Face Value: $${claimedCard.faceValue.toFixed(2)}`,
                  `Card Number: ${claimedCard.cardNumber}`,
                  `PIN: ${claimedCard.pin}`,
                ].join('\n')
                const blob = new Blob([text], { type: 'text/plain' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `${claimedCard.brand}-gift-card.txt`
                a.click()
                URL.revokeObjectURL(url)
              }}
              className="border border-[#AFABC9] text-[#7c6992] px-6 py-3 text-sm rounded-lg hover:border-[#2e1a47] hover:text-[#2e1a47] transition-colors font-normal"
            >
              ↓ Download details
            </button>
            <button
              onClick={() => { setClaimedCard(null); navigate('/dashboard') }}
              className="bg-[#2e1a47] text-white px-8 py-3 text-sm rounded-lg hover:bg-[#72569C] transition-colors font-normal"
            >
              Back to dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Main trades view ──
  return (
    <div className="min-h-screen bg-[#F6F3F9] text-[#2e1a47]">

      {/* Nav */}
      <nav className="flex items-center justify-between px-4 sm:px-8 py-5 border-b border-[#E3DFEF] bg-white shadow-sm">
        <button
          onClick={() => navigate('/dashboard')}
          className="font-display text-xl text-[#2e1a47] tracking-tight"
        >
          Lantana
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-sm text-[#7c6992] hover:text-[#2e1a47] transition-colors font-normal"
        >
          ← Back to dashboard
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-12">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-[#7c6992] mb-2">Account</p>
          <h1 className="text-3xl font-light text-[#2e1a47]">My trades</h1>
          <p className="text-sm text-[#7c6992] mt-2">Cards you have purchased or traded for.</p>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="bg-white border border-[#E3DFEF] rounded-2xl p-10 text-center shadow-sm">
            <p className="text-sm text-[#7c6992]">Loading...</p>
          </div>

        /* Empty */
        ) : trades.length === 0 ? (
          <div className="bg-white border border-[#E3DFEF] rounded-2xl p-10 text-center shadow-sm">
            <p className="text-sm text-[#7c6992] mb-4">You haven't made any trades yet.</p>
            <button
              onClick={() => navigate('/browse')}
              className="text-sm bg-[#2e1a47] text-white px-6 py-2.5 rounded-full hover:bg-[#72569C] transition-colors font-normal"
            >
              Browse cards
            </button>
          </div>

        /* Trades list */
        ) : (
          <div className="space-y-4">
            {trades.map(trade => {
              const image = getBrandImage(trade.listing.giftCard.brand)
              const seller = trade.seller.username ?? trade.seller.name ?? 'Anonymous'
              const cardName = trade.listing.giftCard.brand === 'Other' && trade.listing.giftCard.description
                ? trade.listing.giftCard.description
                : trade.listing.giftCard.brand
              const isReviewing = reviewingId === trade.id

              return (
                <div
                  key={trade.id}
                  className="bg-white border border-[#E3DFEF] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4 flex-col sm:flex-row">

                    {/* Brand image */}
                    <img
                      src={image ?? ''}
                      alt={trade.listing.giftCard.brand}
                      className="w-full sm:w-24 h-20 sm:h-16 object-cover rounded-xl shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          <p className="text-sm font-normal text-[#2e1a47]">
                            {cardName} — ${trade.listing.giftCard.faceValue.toFixed(2)}
                          </p>
                          <p className="text-xs text-[#AFABC9] mt-1">From @{seller}</p>
                          <p className={`text-xs mt-1 font-normal ${statusColor[trade.status] ?? 'text-[#7c6992]'}`}>
                            {statusLabel[trade.status] ?? trade.status}
                          </p>
                          {trade.finalPrice && (
                            <p className="text-xs text-[#AFABC9] mt-1">Paid: ${trade.finalPrice.toFixed(2)}</p>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          {trade.status === 'PENDING' && !trade.listing.giftCard.revealed && (
                            <button
                              onClick={() => handleClaim(trade.listingId)}
                              disabled={claimingId === trade.listingId}
                              className="text-sm bg-[#2e1a47] text-white px-4 py-2 rounded-lg hover:bg-[#72569C] transition-colors disabled:opacity-50 font-normal"
                            >
                              {claimingId === trade.listingId ? 'Claiming...' : 'Claim card'}
                            </button>
                          )}
                          {trade.listing.giftCard.revealed && (
                            <span className="text-xs text-[#AFABC9] border border-[#E3DFEF] rounded-lg px-3 py-1">
                              Card details sent to email
                            </span>
                          )}
                          {trade.status === 'COMPLETED' && !trade.hasReviewed && (
                            <button
                              onClick={() => {
                                setReviewingId(isReviewing ? null : trade.id)
                                setRating(0)
                                setComment('')
                                setReviewError('')
                              }}
                              className="text-xs border border-[#AFABC9] px-3 py-1.5 rounded-lg text-[#7c6992] hover:border-[#2e1a47] hover:text-[#2e1a47] transition-colors font-normal"
                            >
                              {isReviewing ? 'Cancel' : 'Leave a review'}
                            </button>
                          )}
                          {trade.status === 'COMPLETED' && trade.hasReviewed && (
                            <span className="text-xs text-[#2e7d32]">Review left ✓</span>
                          )}
                        </div>
                      </div>

                      {/* Inline review form */}
                      {isReviewing && (
                        <div className="mt-4 pt-4 border-t border-[#E3DFEF] space-y-3">
                          <p className="text-xs uppercase tracking-widest text-[#7c6992]">Rate this trade</p>

                          {/* Star rating */}
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(star => (
                              <button
                                key={star}
                                onClick={() => setRating(star)}
                                className={`text-2xl transition-colors ${
                                  star <= rating ? 'text-yellow-400' : 'text-[#E3DFEF]'
                                }`}
                              >
                                ★
                              </button>
                            ))}
                          </div>

                          <textarea
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            placeholder="Leave a comment (optional)"
                            maxLength={300}
                            rows={3}
                            className="w-full bg-white border border-[#E3DFEF] rounded-lg px-4 py-3 text-sm text-[#2e1a47] placeholder-[#AFABC9] focus:outline-none focus:border-[#72569C] focus:ring-1 focus:ring-[#72569C] transition-colors resize-none font-normal"
                          />
                          <p className="text-xs text-[#AFABC9] text-right">{comment.length}/300</p>

                          {reviewError && (
                            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                              {reviewError}
                            </p>
                          )}

                          <button
                            onClick={() => handleSubmitReview(trade.id)}
                            disabled={submittingReview}
                            className="text-sm bg-[#2e1a47] text-white px-4 py-2 rounded-lg hover:bg-[#72569C] transition-colors disabled:opacity-50 font-normal"
                          >
                            {submittingReview ? 'Submitting...' : 'Submit review'}
                          </button>
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