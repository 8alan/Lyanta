import { UserButton, useUser } from '@clerk/react'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useApi } from '../services/api.ts'
import { useStore } from '../store/useStore.ts'

interface GiftCard {
  id: string
  brand: string
  faceValue: number
  status: string
  createdAt: string
}

export default function Dashboard() {
  const { user } = useUser()
  const navigate = useNavigate()
  const api = useApi()
  const { setBalance } = useStore()
  const [cards, setCards] = useState<GiftCard[]>([])
  const [loading, setLoading] = useState(true)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  useEffect(() => {
    api.getMyCards()
      .then(data => setCards(data.giftCards))
      .catch(console.error)
      .finally(() => setLoading(false))
    api.getBalance()
      .then(data => setBalance(data.balance))
      .catch(console.error)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const actions = [
    { label: 'Submit a Gift Card', desc: 'Exchange for cash or credits', path: '/submit' },
    { label: 'Browse Cards', desc: 'Trade for a card you want', path: '/browse' },
    // { label: 'Cash Out', desc: 'Transfer your credits to bank', path: '/cashout' },
  ]

  const statusLabel: Record<string, string> = {
    PENDING: 'Pending verification',
    VERIFIED: 'Verified',
    LOCKED: 'Locked',
    AVAILABLE: 'Available',
    TRADED: 'Traded',
    CASHED_OUT: 'Cashed out',
    FLAGGED: 'Flagged',
    FAILED: 'Failed',
  }

  const statusColor: Record<string, string> = {
    PENDING: 'text-[#7a7a9a]',
    VERIFIED: 'text-green-600',
    LOCKED: 'text-yellow-600',
    AVAILABLE: 'text-green-600',
    TRADED: 'text-[#1a1a2e]',
    CASHED_OUT: 'text-[#1a1a2e]',
    FLAGGED: 'text-red-600',
    FAILED: 'text-red-600',
  }

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-[#1a1a2e]">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-[#e2e0db] bg-white">
        <span className="text-xl font-semibold tracking-tight">Lantana</span>
        <div className="flex items-center gap-6">
          <span className="text-sm text-[#4a4a6a]">{user?.emailAddresses[0]?.emailAddress}</span>
          <UserButton />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-12">
        <div className="mb-12">
          <p className="text-xs uppercase tracking-widest text-[#7a7a9a] mb-2">Dashboard</p>
          <h1 className="text-3xl font-semibold text-[#1a1a2e]">
            {greeting}, {user?.firstName ?? 'there'}.
          </h1>
        </div>

        {/* <div className="bg-white border border-[#e2e0db] p-8 mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#7a7a9a] mb-1">Lantana Credits</p>
            <p className="text-4xl font-semibold text-[#1a1a2e]">${balance.toFixed(2)}</p>
          </div>
          <button
            onClick={() => navigate('/buy-credits')}
            className="text-sm bg-[#1a1a2e] text-white px-4 py-2 hover:bg-[#2d2d4e] transition-colors"
          >
            Buy credits
          </button>
        </div> */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {actions.map(({ label, desc, path }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              className="bg-white border border-[#e2e0db] p-6 text-left hover:border-[#1a1a2e] transition-colors"
            >
              <p className="text-sm font-semibold text-[#1a1a2e] mb-1">{label}</p>
              <p className="text-xs text-[#7a7a9a]">{desc}</p>
            </button>
          ))}
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-[#7a7a9a] mb-4">Recent Activity</p>
          <div className="bg-white border border-[#e2e0db]">
            {loading ? (
              <div className="p-8 text-center">
                <p className="text-sm text-[#7a7a9a]">Loading...</p>
              </div>
            ) : cards.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-[#7a7a9a]">No transactions yet.</p>
              </div>
            ) : (
              cards.map((card, i) => (
                <div
                  key={card.id}
                  className={`flex items-center justify-between px-6 py-4 ${i !== cards.length - 1 ? 'border-b border-[#e2e0db]' : ''}`}
                >
                  <div>
                    <p className="text-sm font-semibold text-[#1a1a2e]">{card.brand} Gift Card</p>
                    <p className="text-xs text-[#7a7a9a]">{new Date(card.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#1a1a2e]">${card.faceValue.toFixed(2)}</p>
                    <p className={`text-xs ${statusColor[card.status] ?? 'text-[#7a7a9a]'}`}>
                      {statusLabel[card.status] ?? card.status}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}