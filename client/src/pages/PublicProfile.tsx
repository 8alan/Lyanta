import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApi } from '../services/api.ts'

const avgRating = (reviews: { rating: number }[]) => {
  if (!reviews?.length) return null
  return (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
}

interface PublicProfile {
  username: string | null
  name: string | null
  bio?: string | null
  avatarUrl?: string | null
  createdAt: string
  isVerified: boolean
  completedTrades: number
  reviews?: Review[]
  listings: {
    id: string
    brand: string
    faceValue: number
    description?: string | null
    buyNowPrice?: number | null
    acceptsExchange: boolean
    bidCount: number
    createdAt: string
  }[]
}

interface Review {
  id: string
  rating: number
  comment?: string | null
  createdAt: string
  reviewer: string
  
}

export default function PublicProfile() {
  const { username } = useParams<{ username: string }>()
  const navigate = useNavigate()
  const api = useApi()

  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!username) return
    api.getPublicProfile(username)
      .then(data => setProfile(data.profile))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center">
        <p className="text-sm text-[#7a7a9a]">Loading...</p>
      </div>
    )
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-[#f8f7f4] flex flex-col items-center justify-center gap-4">
        <p className="text-sm text-[#7a7a9a]">User not found.</p>
        <button
          onClick={() => navigate('/browse')}
          className="text-sm text-[#4a4a6a] hover:text-[#1a1a2e] transition-colors"
        >
          ← Back to browse
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-[#1a1a2e]">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-[#e2e0db] bg-white">
        <button onClick={() => navigate('/browse')} className="text-xl font-semibold tracking-tight">
          Lantana
        </button>
        <button
          onClick={() => navigate('/browse')}
          className="text-sm text-[#4a4a6a] hover:text-[#1a1a2e] transition-colors"
        >
          ← Back to browse
        </button>
      </nav>

      <div className="max-w-3xl mx-auto px-8 py-12">

        {/* Profile Card */}
        <div className="bg-white border border-[#e2e0db] p-8 mb-6">
          <div className="flex items-start gap-6 mb-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-[#e2e0db] overflow-hidden border border-[#e2e0db] shrink-0">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl text-[#7a7a9a]">
                  {profile.name?.[0]?.toUpperCase() ?? '?'}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xl font-semibold text-[#1a1a2e]">
                  {profile.username ? `@${profile.username}` : profile.name}
                </p>
                {profile.isVerified && (
                  <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 font-medium">
                    ✓ Verified
                  </span>
                )}
                {profile?.reviews && profile.reviews.length > 0 && (
                <div className="flex items-center gap-1 mt-1">
                    <span className="text-yellow-400 text-sm">★</span>
                    <span className="text-sm font-semibold text-[#1a1a2e]">{avgRating(profile.reviews)}</span>
                    <span className="text-xs text-[#7a7a9a]">({profile.reviews.length} review{profile.reviews.length !== 1 ? 's' : ''})</span>
                    <span className="text-xs text-[#7a7a9a] ml-2">· {profile?.completedTrades} sold</span>
                </div>
                )}
              </div>
              <p className="text-xs text-[#7a7a9a] mt-1">
                Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
              {profile.bio && (
                <p className="text-sm text-[#4a4a6a] mt-3 leading-relaxed">{profile.bio}</p>
              )}
            </div>
          </div>

          {/* Stats */}
            <div className="border-t border-[#e2e0db] pt-6">
                <p className="text-xs uppercase tracking-widest text-[#7a7a9a] mb-1">Completed trades</p>
                <p className="text-3xl font-semibold text-[#1a1a2e]">{profile.completedTrades}</p>
            </div>
            </div>
              {/* Reviews */}
                <div className="bg-white border border-[#e2e0db] p-8 mb-6">
                <p className="text-xs uppercase tracking-widest text-[#7a7a9a] mb-4">
                    Reviews ({profile?.reviews?.length ?? 0})
                </p>
                {!profile?.reviews || profile.reviews.length === 0 ? (
                    <p className="text-sm text-[#b0b0c0]">No reviews yet.</p>
                ) : (
                    <div className="space-y-4">
                    {profile.reviews.map(r => (
                        <div key={r.id} className="border-b border-[#e2e0db] pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map(star => (
                                <span key={star} className={`text-sm ${star <= r.rating ? 'text-yellow-400' : 'text-[#e2e0db]'}`}>
                                ★
                                </span>
                            ))}
                            </div>
                            <p className="text-xs text-[#7a7a9a]">
                            @{r.reviewer} · {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            </p>
                        </div>
                        {r.comment && <p className="text-sm text-[#4a4a6a] leading-relaxed">{r.comment}</p>}
                        </div>
                    ))}
                    </div>
                )}
                </div>
        {/* Shop Tab */}
        <div className="bg-white border border-[#e2e0db]">
          <div className="flex border-b border-[#e2e0db]"></div>

          <div className="p-6">
            {profile.listings.length === 0 ? (
              <p className="text-sm text-[#7a7a9a] text-center py-4">No active listings.</p>
            ) : (
              <div className="space-y-3">
                {profile.listings.map(l => (
                  <div
                    key={l.id}
                    onClick={() => navigate(`/listing/${l.id}`)}
                    className="flex items-center justify-between px-4 py-3 border border-[#e2e0db] cursor-pointer hover:border-[#1a1a2e] transition-colors"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#1a1a2e]">{l.brand} Gift Card</p>
                      <p className="text-xs text-[#7a7a9a]">
                        Face value ${l.faceValue.toFixed(2)} · {l.bidCount} bid{l.bidCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      {l.buyNowPrice && (
                        <p className="text-sm font-semibold text-[#1a1a2e]">${l.buyNowPrice.toFixed(2)}</p>
                      )}
                      {l.acceptsExchange && (
                        <p className="text-xs text-[#7a7a9a]">Accepts exchange</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}