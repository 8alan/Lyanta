import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/react'
import { useApi } from '../services/api.ts'

const ADMIN_CLERK_ID = 'user_3F481w6C6mRIvyVI1yr3dseubnS'

const REJECTION_REASONS = [
  'Card balance does not match declared value',
  'Card number is invalid',
  'Card has already been used or has zero balance',
  'Card appears to be fraudulent',
  'PIN is incorrect',
  'Unsupported card type',
]

interface GiftCard {
  id: string
  brand: string
  description: string | null
  cardNumber: string
  pin: string
  faceValue: number
  status: string
  createdAt: string
  user: { email: string; name: string | null }
  listing: {
    buyNowPrice: number | null
    minAcceptPrice: number | null
    acceptsExchange: boolean
  } | null
}

interface Overview {
  totalUsers: number
  pendingCards: number
  activeListings: number
  completedListings: number
}

export default function Admin() {
  const { user } = useUser()
  const navigate = useNavigate()
  const api = useApi()
  const [pendingCards, setPendingCards] = useState<GiftCard[]>([])
  const [overview, setOverview] = useState<Overview | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [customReason, setCustomReason] = useState('')

  useEffect(() => {
    if (!user) return
    if (user.id !== ADMIN_CLERK_ID) {
      navigate('/dashboard')
      return
    }

    Promise.all([
      api.getAdminOverview(),
      api.getAdminPendingCards()
    ]).then(([overviewData, cardsData]) => {
      setOverview(overviewData)
      setPendingCards(cardsData.giftCards)
    }).catch(console.error)
    .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const handleVerify = async (id: string) => {
    setActionLoading(id)
    try {
      await api.adminVerifyCard(id)
      setPendingCards(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (id: string) => {
    const reason = rejectionReason === 'custom' ? customReason : rejectionReason
    if (!reason) return
    setActionLoading(id)
    try {
      await api.adminRejectCard(id, reason)
      setPendingCards(prev => prev.filter(c => c.id !== id))
      setRejectingId(null)
      setRejectionReason('')
      setCustomReason('')
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center">
        <p className="text-sm text-[#7a7a9a]">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-[#1a1a2e]">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-[#e2e0db] bg-white">
        <span className="text-xl font-semibold tracking-tight">Lyanta Admin</span>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-sm text-[#4a4a6a] hover:text-[#1a1a2e] transition-colors"
        >
          ← Back to dashboard
        </button>
      </nav>

      <div className="max-w-5xl mx-auto px-8 py-12">

        {/* Overview */}
        {overview && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { label: 'Total Users', value: overview.totalUsers },
              { label: 'Pending Cards', value: overview.pendingCards },
              { label: 'Active Listings', value: overview.activeListings },
              { label: 'Completed', value: overview.completedListings },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white border border-[#e2e0db] p-6">
                <p className="text-xs uppercase tracking-widest text-[#7a7a9a] mb-1">{label}</p>
                <p className="text-3xl font-semibold text-[#1a1a2e]">{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Pending Cards */}
        <div>
          <p className="text-xs uppercase tracking-widest text-[#7a7a9a] mb-4">
            Pending Verification ({pendingCards.length})
          </p>

          {pendingCards.length === 0 ? (
            <div className="bg-white border border-[#e2e0db] p-8 text-center">
              <p className="text-sm text-[#7a7a9a]">No cards pending verification.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingCards.map(card => (
                <div key={card.id} className="bg-white border border-[#e2e0db] p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-[#1a1a2e]">
                        {card.brand === 'Other' && card.description ? card.description : card.brand} — ${card.faceValue.toFixed(2)}
                      </p>
                      <p className="text-xs text-[#7a7a9a]">
                        Submitted by {card.user.name ?? card.user.email}
                      </p>
                      <p className="text-xs text-[#7a7a9a]">
                        {new Date(card.createdAt).toLocaleDateString()}
                      </p>
                      <div className="pt-2 space-y-1">
                        <p className="text-xs font-mono text-[#4a4a6a]">
                          Card Number: {card.cardNumber}
                        </p>
                        <p className="text-xs font-mono text-[#4a4a6a]">
                          PIN: {card.pin}
                        </p>
                      </div>
                      {card.listing && (
                        <div className="pt-2 space-y-1">
                          {card.listing.buyNowPrice && (
                            <p className="text-xs text-[#7a7a9a]">
                              Buy now: ${card.listing.buyNowPrice.toFixed(2)}
                            </p>
                          )}
                          {card.listing.minAcceptPrice && (
                            <p className="text-xs text-[#7a7a9a]">
                              Min bid: ${card.listing.minAcceptPrice.toFixed(2)}
                            </p>
                          )}
                          {card.listing.acceptsExchange && (
                            <p className="text-xs text-[#7a7a9a]">Accepts exchange</p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleVerify(card.id)}
                        disabled={actionLoading === card.id}
                        className="text-sm bg-green-600 text-white px-4 py-2 hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        Verify
                      </button>
                      <button
                        onClick={() => setRejectingId(rejectingId === card.id ? null : card.id)}
                        disabled={actionLoading === card.id}
                        className="text-sm bg-red-600 text-white px-4 py-2 hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>

                  {rejectingId === card.id && (
                    <div className="mt-4 pt-4 border-t border-[#e2e0db] space-y-3">
                      <p className="text-xs uppercase tracking-widest text-[#7a7a9a]">Select a reason</p>
                      <div className="flex flex-wrap gap-2">
                        {REJECTION_REASONS.map(reason => (
                          <button
                            key={reason}
                            onClick={() => { setRejectionReason(reason); setCustomReason('') }}
                            className={`text-xs px-3 py-1.5 border rounded-lg transition-colors ${
                              rejectionReason === reason
                                ? 'bg-red-600 text-white border-red-600'
                                : 'bg-white text-[#4a4a6a] border-[#e2e0db] hover:border-red-400 hover:text-red-600'
                            }`}
                          >
                            {reason}
                          </button>
                        ))}
                        <button
                          onClick={() => setRejectionReason('custom')}
                          className={`text-xs px-3 py-1.5 border rounded-lg transition-colors ${
                            rejectionReason === 'custom'
                              ? 'bg-red-600 text-white border-red-600'
                              : 'bg-white text-[#4a4a6a] border-[#e2e0db] hover:border-red-400 hover:text-red-600'
                          }`}
                        >
                          Custom reason
                        </button>
                      </div>

                      {rejectionReason === 'custom' && (
                        <input
                          type="text"
                          value={customReason}
                          onChange={e => setCustomReason(e.target.value)}
                          placeholder="Enter rejection reason..."
                          className="w-full bg-white border border-[#e2e0db] px-4 py-2 text-sm text-[#1a1a2e] focus:outline-none focus:border-[#1a1a2e] transition-colors"
                        />
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReject(card.id)}
                          disabled={!rejectionReason || (rejectionReason === 'custom' && !customReason) || actionLoading === card.id}
                          className="text-sm bg-red-600 text-white px-4 py-2 hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          {actionLoading === card.id ? 'Rejecting...' : 'Confirm rejection'}
                        </button>
                        <button
                          onClick={() => { setRejectingId(null); setRejectionReason(''); setCustomReason('') }}
                          className="text-sm border border-[#e2e0db] px-4 py-2 text-[#4a4a6a] hover:border-[#1a1a2e] transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}