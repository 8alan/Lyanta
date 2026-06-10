import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi } from '../services/api.ts'

const avgRating = (reviews: { rating: number }[]) => {
  if (!reviews?.length) return null
  return (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
}

interface Profile {
  id?: string
  username: string | null
  name: string | null
  email?: string
  bio?: string | null
  avatarUrl?: string | null
  createdAt: string
  isVerified: boolean
  completedTrades: number
  reviews?: Review[]
}

interface Listing {
  id: string
  brand: string
  faceValue: number
  description?: string | null
  buyNowPrice?: number | null
  acceptsExchange: boolean
  bidCount: number
  createdAt: string
}

interface Review {
  id: string
  rating: number
  comment?: string | null
  createdAt: string
  reviewer: string
}

interface Bid {
  id: string
  listingId: string
  bidType: 'CASH' | 'EXCHANGE'
  cashAmount?: number | null
  createdAt: string
  listing: {
    giftCard: { brand: string; faceValue: number }
  }
  bidder: { username: string | null; name: string | null }
}

interface RawBid {
  id: string
  status: string
  bidType: 'CASH' | 'EXCHANGE'
  cashAmount?: number | null
  createdAt: string
}

interface RawListing {
  id: string
  status: string
  buyNowPrice?: number | null
  minAcceptPrice?: number | null
  acceptsExchange: boolean
  createdAt: string
  giftCard: { brand: string; faceValue: number; description?: string | null }
  bids: RawBid[]
}

type Tab = 'shop' | 'bids'

export default function Profile() {
  const navigate = useNavigate()
  const api = useApi()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [profile, setProfile] = useState<Profile | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [bids, setBids] = useState<Bid[]>([])
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('shop')
  const [editing, setEditing] = useState(false)
  const [editingBio, setEditingBio] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingBio, setSavingBio] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [bioError, setBioError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    Promise.all([
      api.getMyProfile(),
      api.getMyListings()
    ])
      .then(([profileData, listingsData]) => {
        setProfile(profileData.profile)
        setUsername(profileData.profile.username ?? '')
        setBio(profileData.profile.bio ?? '')
        setAvatarPreview(profileData.profile.avatarUrl ?? null)
        // Only show active listings with their bids
        const activeListings = listingsData.listings.filter((l: RawListing) => l.status === 'ACTIVE')
          setListings(activeListings.map((l: RawListing) => ({
            id: l.id,
            brand: l.giftCard.brand,
            faceValue: l.giftCard.faceValue,
            buyNowPrice: l.buyNowPrice,
            acceptsExchange: l.acceptsExchange,
            bidCount: l.bids?.length ?? 0,
            createdAt: l.createdAt
          })))

          const pendingBids = activeListings.flatMap((l: RawListing) =>
            (l.bids ?? [])
              .filter((b: RawBid) => b.status === 'PENDING')
              .map((b: RawBid) => ({ ...b, listing: { giftCard: l.giftCard }, listingId: l.id }))
          )
        setBids(pendingBids)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSaveUsername = async () => {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await api.updateUsername(username)
      setProfile(prev => prev ? { ...prev, username } : prev)
      setEditing(false)
      setSuccess('Username updated successfully')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveBio = async () => {
    setSavingBio(true)
    setBioError('')
    try {
      await api.updateBio(bio)
      setProfile(prev => prev ? { ...prev, bio } : prev)
      setEditingBio(false)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setBioError(message)
    } finally {
      setSavingBio(false)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarPreview(URL.createObjectURL(file))
    setUploadingAvatar(true)
    try {
      const data = await api.uploadAvatar(file)
      setProfile(prev => prev ? { ...prev, avatarUrl: data.avatarUrl } : prev)
    } catch (err) {
      console.error(err)
    } finally {
      setUploadingAvatar(false)
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

      <div className="max-w-3xl mx-auto px-8 py-12">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-[#7a7a9a] mb-2">Account</p>
          <h1 className="text-3xl font-semibold text-[#1a1a2e]">My profile</h1>
        </div>

        {/* Profile Card */}
        <div className="bg-white border border-[#e2e0db] p-8 mb-6">
          <div className="flex items-start gap-6 mb-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div
                className="w-20 h-20 rounded-full bg-[#e2e0db] overflow-hidden cursor-pointer border border-[#e2e0db] hover:opacity-80 transition-opacity"
                onClick={() => fileInputRef.current?.click()}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl text-[#7a7a9a]">
                    {profile?.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 bg-[#1a1a2e] text-white text-xs rounded-full w-6 h-6 flex items-center justify-center hover:bg-[#2d2d4e] transition-colors"
              >
                {uploadingAvatar ? '…' : '+'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xl font-semibold text-[#1a1a2e]">
                  {profile?.username ? `@${profile.username}` : 'No username set'}
                </p>
                {profile?.isVerified && (
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
              <p className="text-sm text-[#7a7a9a]">{profile?.name}</p>
              <p className="text-xs text-[#7a7a9a] mt-1">
                Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
              </p>
            </div>
          </div>

          {/* Completed Trades */}
          <div className="border-t border-[#e2e0db] pt-6">
            <p className="text-xs uppercase tracking-widest text-[#7a7a9a] mb-1">Completed trades</p>
            <p className="text-3xl font-semibold text-[#1a1a2e]">{profile?.completedTrades ?? 0}</p>
          </div>
        </div>

        {/* Username */}
        <div className="bg-white border border-[#e2e0db] p-8 mb-6">
          <p className="text-xs uppercase tracking-widest text-[#7a7a9a] mb-4">Username</p>
          {editing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter username"
                maxLength={20}
                className="w-full bg-white border border-[#e2e0db] px-4 py-3 text-sm text-[#1a1a2e] placeholder-[#b0b0c0] focus:outline-none focus:border-[#1a1a2e] transition-colors"
              />
              <p className="text-xs text-[#7a7a9a]">3–20 characters. Letters, numbers and underscores only.</p>
              {error && <p className="text-xs text-red-600">{error}</p>}
              <div className="flex gap-2">
                <button onClick={handleSaveUsername} disabled={saving} className="text-sm bg-[#1a1a2e] text-white px-4 py-2 hover:bg-[#2d2d4e] transition-colors disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => { setEditing(false); setError('') }} className="text-sm border border-[#e2e0db] px-4 py-2 text-[#4a4a6a] hover:border-[#1a1a2e] transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#1a1a2e]">{profile?.username ? `@${profile.username}` : 'No username set'}</p>
              <button onClick={() => setEditing(true)} className="text-xs border border-[#e2e0db] px-3 py-1 text-[#4a4a6a] hover:border-[#1a1a2e] hover:text-[#1a1a2e] transition-colors">
                {profile?.username ? 'Change' : 'Set username'}
              </button>
            </div>
          )}
          {success && <p className="text-xs text-green-600 mt-2">{success}</p>}
        </div>

        {/* About */}
        <div className="bg-white border border-[#e2e0db] p-8 mb-6">
          <p className="text-xs uppercase tracking-widest text-[#7a7a9a] mb-4">About</p>
          {editingBio ? (
            <div className="space-y-3">
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Tell others a little about yourself..."
                maxLength={300}
                rows={4}
                className="w-full bg-white border border-[#e2e0db] px-4 py-3 text-sm text-[#1a1a2e] placeholder-[#b0b0c0] focus:outline-none focus:border-[#1a1a2e] transition-colors resize-none"
              />
              <p className="text-xs text-[#7a7a9a] text-right">{bio.length}/300</p>
              {bioError && <p className="text-xs text-red-600">{bioError}</p>}
              <div className="flex gap-2">
                <button onClick={handleSaveBio} disabled={savingBio} className="text-sm bg-[#1a1a2e] text-white px-4 py-2 hover:bg-[#2d2d4e] transition-colors disabled:opacity-50">
                  {savingBio ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => { setEditingBio(false); setBio(profile?.bio ?? ''); setBioError('') }} className="text-sm border border-[#e2e0db] px-4 py-2 text-[#4a4a6a] hover:border-[#1a1a2e] transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm text-[#1a1a2e] leading-relaxed">
                {profile?.bio || <span className="text-[#b0b0c0]">No bio yet</span>}
              </p>
              <button onClick={() => setEditingBio(true)} className="text-xs border border-[#e2e0db] px-3 py-1 text-[#4a4a6a] hover:border-[#1a1a2e] hover:text-[#1a1a2e] transition-colors shrink-0">
                {profile?.bio ? 'Edit' : 'Add bio'}
              </button>
            </div>
          )}
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
        {/* Tabs — My Shop & Bids */}
        <div className="bg-white border border-[#e2e0db] mb-6">
          <div className="flex border-b border-[#e2e0db]">
            {(['shop', 'bids'] as Tab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-xs uppercase tracking-widest transition-colors ${
                  activeTab === tab
                    ? 'text-[#1a1a2e] border-b-2 border-[#1a1a2e] -mb-px'
                    : 'text-[#7a7a9a] hover:text-[#1a1a2e]'
                }`}
              >
                {tab === 'shop' ? `My Shop (${listings.length})` : `Bids & Offers (${bids.length})`}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'shop' && (
              listings.length === 0 ? (
                <p className="text-sm text-[#7a7a9a] text-center py-4">No active listings.</p>
              ) : (
                <div className="space-y-3">
                  {listings.map(l => (
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
              )
            )}

            {activeTab === 'bids' && (
              bids.length === 0 ? (
                <p className="text-sm text-[#7a7a9a] text-center py-4">No pending bids or offers.</p>
              ) : (
                <div className="space-y-3">
                  {bids.map(b => (
                    <div
                      key={b.id}
                      onClick={() => navigate(`/listing/${b.listingId}`)}
                      className="flex items-center justify-between px-4 py-3 border border-[#e2e0db] cursor-pointer hover:border-[#1a1a2e] transition-colors"
                    >
                      <div>
                        <p className="text-sm font-semibold text-[#1a1a2e]">
                          {b.listing.giftCard.brand} Gift Card
                        </p>
                        <p className="text-xs text-[#7a7a9a]">
                          {b.bidType === 'CASH' ? `$${b.cashAmount?.toFixed(2)} cash offer` : 'Exchange offer'}
                        </p>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); navigate(`/listing/${b.listingId}`) }}
                        className="text-xs border border-[#e2e0db] px-3 py-1 text-[#4a4a6a] hover:border-[#1a1a2e] hover:text-[#1a1a2e] transition-colors"
                      >
                        Review
                      </button>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>

        {/* Identity Verification */}
        <div className="bg-white border border-[#e2e0db] p-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#7a7a9a] mb-1">Identity verification</p>
              <p className="text-sm text-[#1a1a2e] font-semibold mt-2">
                {profile?.isVerified ? 'Verified ✓' : 'Not verified'}
              </p>
              <p className="text-xs text-[#7a7a9a] mt-1">
                {profile?.isVerified
                  ? 'Your identity has been verified. A badge appears on your listings.'
                  : 'Verify your identity with a government-issued ID to build trust with buyers and sellers.'}
              </p>
            </div>
            {!profile?.isVerified && (
              <button
                className="text-sm bg-[#1a1a2e] text-white px-4 py-2 hover:bg-[#2d2d4e] transition-colors shrink-0"
                onClick={() => alert('Identity verification coming soon.')}
              >
                Get verified
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}