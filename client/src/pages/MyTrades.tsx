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
  listing: {
    giftCard: {
      brand: string
      faceValue: number
      revealed: boolean
      description: string | null
    }
  }
  seller: {
    username: string | null
    name: string | null
  }
  buyer: {
  username: string | null
  name: string | null
}
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

  const statusLabel: Record<string, string> = {
    PENDING: 'Awaiting confirmation',
    COMPLETED: 'Completed',
    FAILED: 'Failed',
    DISPUTED: 'Disputed',
  }

  const statusColor: Record<string, string> = {
    PENDING: 'text-yellow-600',
    COMPLETED: 'text-green-600',
    FAILED: 'text-red-500',
    DISPUTED: 'text-red-500',
  }

  if (claimedCard) {
    return (
      <div className="min-h-screen bg-[#f8f7f4] text-[#1a1a2e]">
        <nav className="flex items-center justify-between px-8 py-5 border-b border-[#e2e0db] bg-white">
          <button onClick={() => navigate('/dashboard')} className="text-xl font-semibold tracking-tight">
            Lantana
          </button>
        </nav>
        <div className="max-w-2xl mx-auto px-8 py-24 text-center">
          <p className="text-xs uppercase tracking-widest text-[#7a7a9a] mb-4">Card claimed</p>
          <h1 className="text-3xl font-semibold text-[#1a1a2e] mb-4">Your card is ready.</h1>
          <p className="text-sm text-[#4a4a6a] mb-8">
            Save these details carefully. These details have also been sent to your email.
          </p>
          <div className="bg-white border border-[#e2e0db] p-8 text-left space-y-4 mb-8">
            <div className="flex justify-between text-sm">
              <span className="text-[#7a7a9a]">Brand</span>
              <span className="font-semibold">
                {claimedCard.brand === 'Other' && claimedCard.description
                  ? claimedCard.description
                  : claimedCard.brand}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#7a7a9a]">Face value</span>
              <span className="font-semibold">${claimedCard.faceValue.toFixed(2)}</span>
            </div>
            <div className="border-t border-[#e2e0db] pt-4 flex justify-between text-sm">
              <span className="text-[#7a7a9a]">Card Number</span>
              <span className="font-semibold font-mono">{claimedCard.cardNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#7a7a9a]">PIN</span>
              <span className="font-semibold font-mono">{claimedCard.pin}</span>
            </div>
          </div>
          <p className="text-xs text-[#7a7a9a] mb-8">
            These details will not be shown again on Lantana for security reasons.
          </p>
          <button
            onClick={() => { setClaimedCard(null); navigate('/dashboard') }}
            className="bg-[#1a1a2e] text-white px-8 py-3 text-sm hover:bg-[#2d2d4e] transition-colors"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    )
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
          <h1 className="text-3xl font-semibold text-[#1a1a2e]">My trades</h1>
          <p className="text-sm text-[#4a4a6a] mt-2">
            Cards you have purchased or traded for.
          </p>
        </div>

        {loading ? (
          <div className="bg-white border border-[#e2e0db] p-8 text-center">
            <p className="text-sm text-[#7a7a9a]">Loading...</p>
          </div>
        ) : trades.length === 0 ? (
          <div className="bg-white border border-[#e2e0db] p-8 text-center">
            <p className="text-sm text-[#7a7a9a] mb-4">You haven't made any trades yet.</p>
            <button
              onClick={() => navigate('/browse')}
              className="text-sm bg-[#1a1a2e] text-white px-6 py-2 hover:bg-[#2d2d4e] transition-colors"
            >
              Browse cards
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {trades.map(trade => {
              const image = getBrandImage(trade.listing.giftCard.brand)
              const seller = trade.seller.username ?? trade.seller.name ?? 'Anonymous'
              const cardName = trade.listing.giftCard.brand === 'Other' && trade.listing.giftCard.description
                ? trade.listing.giftCard.description
                : trade.listing.giftCard.brand

              return (
                <div key={trade.id} className="bg-white border border-[#e2e0db] p-6">
                  <div className="flex gap-4">
                    <img
                      src={image ?? ''}
                      alt={trade.listing.giftCard.brand}
                      className="w-24 h-16 object-cover shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-[#1a1a2e]">
                            {cardName} — ${trade.listing.giftCard.faceValue.toFixed(2)}
                          </p>
                          <p className="text-xs text-[#7a7a9a] mt-1">
                            From @{seller}
                          </p>
                          <p className={`text-xs mt-1 ${statusColor[trade.status] ?? 'text-[#7a7a9a]'}`}>
                            {statusLabel[trade.status] ?? trade.status}
                          </p>
                          {trade.finalPrice && (
                            <p className="text-xs text-[#7a7a9a] mt-1">
                              Paid: ${trade.finalPrice.toFixed(2)}
                            </p>
                          )}
                        </div>
                        <div>
                          {trade.status === 'PENDING' && !trade.listing.giftCard.revealed && (
                            <button
                              onClick={() => handleClaim(trade.listingId)}
                              disabled={claimingId === trade.listingId}
                              className="text-sm bg-[#1a1a2e] text-white px-4 py-2 hover:bg-[#2d2d4e] transition-colors disabled:opacity-50"
                            >
                              {claimingId === trade.listingId ? 'Claiming...' : 'Claim card'}
                            </button>
                          )}
                          {trade.listing.giftCard.revealed && (
                            <span className="text-xs text-[#7a7a9a] border border-[#e2e0db] px-3 py-1">
                              Card details sent to email
                            </span>
                          )}
                        </div>
                      </div>
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