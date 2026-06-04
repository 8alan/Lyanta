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

  const statusLabel: Record<string, string> = {
    PENDING: 'Pending verification',
    VERIFIED: 'Verified',
    AVAILABLE: 'Listed',
    TRADED: 'Sold',
    CASHED_OUT: 'Cashed out',
    FLAGGED: 'Flagged',
    FAILED: 'Failed',
  }

  const statusColor: Record<string, string> = {
    PENDING: 'text-[#7a7a9a]',
    VERIFIED: 'text-green-600',
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
          <button
            onClick={() => navigate('/browse')}
            className="text-sm text-[#4a4a6a] hover:text-[#1a1a2e] transition-colors"
          >
            Browse
          </button>
          <span className="text-sm text-[#4a4a6a]">{user?.emailAddresses[0]?.emailAddress}</span>
          <UserButton />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-12">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#7a7a9a] mb-1">Dashboard</p>
            <h1 className="text-3xl font-semibold text-[#1a1a2e]">
              {greeting}, {user?.firstName ?? 'there'}.
            </h1>
          </div>
          <button
            onClick={() => navigate('/submit')}
            className="bg-[#1a1a2e] text-white px-5 py-2 text-sm hover:bg-[#2d2d4e] transition-colors"
          >
            + Submit a card
          </button>
        </div>

        {/* Quick Links */}
        <div className="flex gap-3 mb-10 flex-wrap">
          {[
            { label: 'My Listings', path: '/my-listings' },
            { label: 'My Trades', path: '/my-trades' },
            { label: 'Browse Cards', path: '/browse' },
          ].map(({ label, path }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              className="text-sm border border-[#e2e0db] bg-white px-4 py-2 text-[#4a4a6a] hover:border-[#1a1a2e] hover:text-[#1a1a2e] transition-colors"
            >
              {label}
            </button>
          ))}
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs uppercase tracking-widest text-[#7a7a9a]">My Cards</p>
            <button
              onClick={() => navigate('/submit')}
              className="text-xs text-[#4a4a6a] hover:text-[#1a1a2e] transition-colors"
            >
              Submit new →
            </button>
          </div>
          <div className="bg-white border border-[#e2e0db]">
            {loading ? (
              <div className="p-8 text-center">
                <p className="text-sm text-[#7a7a9a]">Loading...</p>
              </div>
            ) : cards.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-[#7a7a9a] mb-3">No cards submitted yet.</p>
                <button
                  onClick={() => navigate('/submit')}
                  className="text-sm bg-[#1a1a2e] text-white px-5 py-2 hover:bg-[#2d2d4e] transition-colors"
                >
                  Submit your first card
                </button>
              </div>
            ) : (
              cards.map((card, i) => (
                <div
                  key={card.id}
                  className={`group flex items-center justify-between px-6 py-4 ${i !== cards.length - 1 ? 'border-b border-[#e2e0db]' : ''}`}
                >
                  <div>
                    <p className="text-sm font-semibold text-[#1a1a2e]">{card.brand} Gift Card</p>
                    <p className="text-xs text-[#7a7a9a]">{new Date(card.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[#1a1a2e]">${card.faceValue.toFixed(2)}</p>
                      <p className={`text-xs ${statusColor[card.status] ?? 'text-[#7a7a9a]'}`}>
                        {statusLabel[card.status] ?? card.status}
                      </p>
                    </div>
                    {(card.status === 'PENDING' || card.status === 'AVAILABLE') && (
                      <button
                        onClick={async () => {
                          await api.deleteGiftCard(card.id)
                          setCards(prev => prev.filter(c => c.id !== card.id))
                        }}
                        className="text-xs text-red-500 hover:text-red-700 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        Delete
                      </button>
                    )}
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