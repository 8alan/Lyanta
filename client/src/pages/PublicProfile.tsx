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

  // ── Loading state ──
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F3F9] flex items-center justify-center">
        <p className="text-sm text-[#7c6992]">Loading...</p>
      </div>
    )
  }

  // ── Not found state ──
  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-[#F6F3F9] flex flex-col items-center justify-center gap-4">
        <p className="text-sm text-[#7c6992]">User not found.</p>
        <button
          onClick={() => navigate('/browse')}
          className="text-sm text-[#7c6992] hover:text-[#2e1a47] transition-colors font-medium"
        >
          ← Back to browse
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F6F3F9] text-[#2e1a47]">

      {/* ── Nav ── */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-[#E3DFEF] bg-white shadow-sm">
        <button
          onClick={() => navigate('/browse')}
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

      <div className="max-w-3xl mx-auto px-8 py-12">

        {/* ── Profile Card ── */}
        <div className="bg-white border border-[#E3DFEF] rounded-2xl p-8 mb-6 shadow-sm">
          <div className="flex items-start gap-6 mb-6">

            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-[#E3DFEF] overflow-hidden border-2 border-[#AFABC9] shrink-0">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl text-[#7c6992] font-semibold">
                  {profile.name?.[0]?.toUpperCase() ?? '?'}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <p className="text-xl font-semibold text-[#2e1a47]">
                  {profile.username ? `@${profile.username}` : profile.name}
                </p>
                {profile.isVerified && (
                  <img src="/verification-badge.png" alt="Verified" className="w-5 h-5" />
                )}
              </div>

              {profile?.reviews && profile.reviews.length > 0 && (
                <div className="flex items-center gap-1 mt-1 flex-wrap">
                  <span className="text-yellow-400 text-sm">★</span>
                  <span className="text-sm font-semibold text-[#2e1a47]">{avgRating(profile.reviews)}</span>
                  <span className="text-xs text-[#7c6992]">
                    ({profile.reviews.length} review{profile.reviews.length !== 1 ? 's' : ''})
                  </span>
                  <span className="text-xs text-[#AFABC9] ml-2">· {profile?.completedTrades} sold</span>
                </div>
              )}

              <p className="text-xs text-[#AFABC9] mt-1">
                Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>

              {profile.bio && (
                <p className="text-sm text-[#7c6992] mt-3 leading-relaxed">{profile.bio}</p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="border-t border-[#E3DFEF] pt-6">
            <p className="text-xs uppercase tracking-widest text-[#7c6992] mb-1 font-semibold">
              Completed trades
            </p>
            <p className="text-3xl font-light text-[#2e1a47]">{profile.completedTrades}</p>
          </div>
        </div>

        {/* ── Reviews ── */}
        <div className="bg-white border border-[#E3DFEF] rounded-2xl p-8 mb-6 shadow-sm">
          <p className="text-xs uppercase tracking-widest text-[#7c6992] mb-6 font-semibold">
            Reviews ({profile?.reviews?.length ?? 0})
          </p>
          {!profile?.reviews || profile.reviews.length === 0 ? (
            <p className="text-sm text-[#AFABC9]">No reviews yet.</p>
          ) : (
            <div className="space-y-4">
              {profile.reviews.map(r => (
                <div key={r.id} className="border-b border-[#E3DFEF] pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <span
                          key={star}
                          className={`text-sm ${star <= r.rating ? 'text-yellow-400' : 'text-[#E3DFEF]'}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-[#AFABC9]">
                      @{r.reviewer} · {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  {r.comment && (
                    <p className="text-sm text-[#7c6992] leading-relaxed">{r.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Listings ── */}
        <div className="bg-white border border-[#E3DFEF] rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-[#E3DFEF]">
            <p className="text-xs uppercase tracking-widest text-[#7c6992] font-semibold">
              Active Listings
            </p>
          </div>

          <div className="p-6">
            {profile.listings.length === 0 ? (
              <p className="text-sm text-[#AFABC9] text-center py-4">No active listings.</p>
            ) : (
              <div className="space-y-3">
                {profile.listings.map(l => (
                  <div
                    key={l.id}
                    onClick={() => navigate(`/listing/${l.id}`)}
                    className="flex items-center justify-between px-4 py-3 border border-[#E3DFEF] rounded-lg cursor-pointer hover:border-[#72569C] hover:bg-[#F6F3F9] transition-colors"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#2e1a47]">{l.brand} Gift Card</p>
                      <p className="text-xs text-[#AFABC9]">
                        Face value ${l.faceValue.toFixed(2)} · {l.bidCount} bid{l.bidCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      {l.buyNowPrice && (
                        <p className="text-sm font-semibold text-[#2e1a47]">${l.buyNowPrice.toFixed(2)}</p>
                      )}
                      {l.acceptsExchange && (
                        <p className="text-xs text-[#7c6992]">Accepts exchange</p>
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