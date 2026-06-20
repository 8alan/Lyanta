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
  const [verifying, setVerifying] = useState(false)
  const [verifyError, setVerifyError] = useState('')

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

  const handleVerifyIdentity = async () => {
    setVerifying(true)
    setVerifyError('')
    try {
      const data = await api.verifyIdentity()
      window.location.href = data.url
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setVerifyError(message)
    } finally {
      setVerifying(false)
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
      <div className="min-h-screen bg-[#F6F3F9] flex items-center justify-center">
        <p className="text-sm text-[#7c6992]">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F6F3F9] text-[#2e1a47]">

      {/* Nav */}
        <nav className="flex items-center justify-between px-8 py-5 border-b border-[#E3DFEF] bg-white shadow-sm">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-xl font-semibold tracking-tight text-[#2e1a47]"
          >
            Lantana
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm text-[#7c6992] hover:text-[#2e1a47] transition-colors font-medium"
          >
            ← Back to dashboard
          </button>
        </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-12">

        {/* Page heading */}
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-[#7c6992] mb-2">Account</p>
          <h1 className="text-3xl font-light text-[#2e1a47]">My profile</h1>
        </div>

        {/* Profile Card */}
        <div className="bg-white border border-[#E3DFEF] rounded-2xl p-8 mb-4 shadow-[0_2px_3px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.06)]">
          <div className="flex items-start gap-6 mb-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div
                className="w-20 h-20 rounded-full bg-[#E3DFEF] overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => fileInputRef.current?.click()}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl text-[#7c6992]">
                    {profile?.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 bg-[#2e1a47] text-white text-xs rounded-full w-6 h-6 flex items-center justify-center hover:bg-[#72569C] transition-colors"
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
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <p className="text-sm text-[#AFABC9]">{profile?.username ? `@${profile.username}` : 'No username set'}</p>
                {profile?.isVerified && (
                  <span className="text-xs bg-[#F6F3F9] text-[#72569C] border border-[#E3DFEF] px-2 py-0.5 rounded-full font-semibold">
                    ✓ Verified
                  </span>
                )}
              </div>
              {profile?.reviews && profile.reviews.length > 0 && (
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-yellow-400 text-sm">★</span>
                  <span className="text-sm font-semibold text-[#2e1a47]">{avgRating(profile.reviews)}</span>
                  <span className="text-xs text-[#7c6992]">({profile.reviews.length} review{profile.reviews.length !== 1 ? 's' : ''})</span>
                  <span className="text-xs text-[#AFABC9] ml-2">· {profile?.completedTrades} sold</span>
                </div>
              )}
              <p className="text-sm text-[#7c6992]">{profile?.name}</p>
              <p className="text-xs text-[#AFABC9] mt-1">
                Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
              </p>
            </div>
          </div>

          {/* Completed Trades */}
          <div className="border-t border-[#E3DFEF] pt-6">
            <p className="text-xs uppercase tracking-widest text-[#7c6992] mb-1">Completed trades</p>
            <p className="text-2xl font-semibold text-[#2e1a47]">{profile?.completedTrades ?? 0}</p>
          </div>
        </div>

        {/* Username */}
        <div className="bg-white border border-[#E3DFEF] rounded-2xl p-8 mb-4 shadow-[0_2px_3px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.06)]">
          <p className="text-xs uppercase tracking-widest text-[#7c6992] mb-4">Username</p>
          {editing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter username"
                maxLength={20}
                className="w-full bg-[#F6F3F9] border border-[#E3DFEF] rounded-xl px-4 py-3 text-sm text-[#2e1a47] placeholder-[#AFABC9] focus:outline-none focus:border-[#72569C] transition-colors"
              />
              <p className="text-xs text-[#AFABC9]">3–20 characters. Letters, numbers and underscores only.</p>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <div className="flex gap-2">
                <button
                  onClick={handleSaveUsername}
                  disabled={saving}
                  className="text-sm bg-[#2e1a47] text-white px-5 py-2 rounded-xl hover:bg-[#72569C] transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => { setEditing(false); setError('') }}
                  className="text-sm border border-[#E3DFEF] rounded-xl px-5 py-2 text-[#7c6992] hover:border-[#2e1a47] hover:text-[#2e1a47] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#AFABC9]">
                {profile?.username ? `@${profile.username}` : 'No username set'}
              </p>
              <button
                onClick={() => setEditing(true)}
                className="text-xs border border-[#E3DFEF] rounded-xl px-3 py-1.5 text-[#7c6992] hover:border-[#2e1a47] hover:text-[#2e1a47] transition-colors"
              >
                {profile?.username ? 'Change' : 'Set username'}
              </button>
            </div>
          )}
          {success && <p className="text-xs text-[#72569C] mt-2">{success}</p>}
        </div>

        {/* About */}
        <div className="bg-white border border-[#E3DFEF] rounded-2xl p-8 mb-4 shadow-[0_2px_3px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.06)]">
          <p className="text-xs uppercase tracking-widest text-[#7c6992] mb-4">About</p>
          {editingBio ? (
            <div className="space-y-3">
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Tell others a little about yourself..."
                maxLength={300}
                rows={4}
                className="w-full bg-[#F6F3F9] border border-[#E3DFEF] rounded-xl px-4 py-3 text-sm text-[#2e1a47] placeholder-[#AFABC9] focus:outline-none focus:border-[#72569C] transition-colors resize-none"
              />
              <p className="text-xs text-[#AFABC9] text-right">{bio.length}/300</p>
              {bioError && <p className="text-xs text-red-500">{bioError}</p>}
              <div className="flex gap-2">
                <button
                  onClick={handleSaveBio}
                  disabled={savingBio}
                  className="text-sm bg-[#2e1a47] text-white px-5 py-2 rounded-xl hover:bg-[#72569C] transition-colors disabled:opacity-50"
                >
                  {savingBio ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => { setEditingBio(false); setBio(profile?.bio ?? ''); setBioError('') }}
                  className="text-sm border border-[#E3DFEF] rounded-xl px-5 py-2 text-[#7c6992] hover:border-[#2e1a47] hover:text-[#2e1a47] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm text-[#2e1a47] leading-relaxed">
                {profile?.bio || <span className="text-[#AFABC9]">No bio yet</span>}
              </p>
              <button
                onClick={() => setEditingBio(true)}
                className="text-xs border border-[#E3DFEF] rounded-xl px-3 py-1.5 text-[#7c6992] hover:border-[#2e1a47] hover:text-[#2e1a47] transition-colors shrink-0"
              >
                {profile?.bio ? 'Edit' : 'Add bio'}
              </button>
            </div>
          )}
        </div>

        {/* Reviews */}
        <div className="bg-white border border-[#E3DFEF] rounded-2xl p-8 mb-4 shadow-[0_2px_3px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.06)]">
          <p className="text-xs uppercase tracking-widest text-[#7c6992] mb-4">
            Reviews ({profile?.reviews?.length ?? 0})
          </p>
          {!profile?.reviews || profile.reviews.length === 0 ? (
            <p className="text-sm text-[#AFABC9]">No reviews yet</p>
          ) : (
            <div className="space-y-4">
              {profile.reviews.map(r => (
                <div key={r.id} className="border-b border-[#E3DFEF] pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <span key={star} className={`text-sm ${star <= r.rating ? 'text-yellow-400' : 'text-[#E3DFEF]'}`}>
                          ★
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-[#AFABC9]">
                      @{r.reviewer} · {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  {r.comment && <p className="text-sm text-[#7c6992] leading-relaxed">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tabs — My Shop & Bids */}
        <div className="bg-white border border-[#E3DFEF] rounded-2xl mb-4 shadow-[0_2px_3px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="flex border-b border-[#E3DFEF]">
            {(['shop', 'bids'] as Tab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-xs uppercase tracking-widest transition-colors ${
                  activeTab === tab
                    ? 'text-[#2e1a47] border-b-2 border-[#2e1a47] -mb-px font-semibold'
                    : 'text-[#7c6992] hover:text-[#2e1a47]'
                }`}
              >
                {tab === 'shop' ? `My Shop (${listings.length})` : `Bids & Offers (${bids.length})`}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'shop' && (
              listings.length === 0 ? (
                <p className="text-sm text-[#AFABC9] text-center py-4">No active listings.</p>
              ) : (
                <div className="space-y-3">
                  {listings.map(l => (
                    <div
                      key={l.id}
                      onClick={() => navigate(`/listing/${l.id}`)}
                      className="flex items-center justify-between px-4 py-3 border border-[#E3DFEF] rounded-xl cursor-pointer hover:border-[#72569C] hover:bg-[#F6F3F9] transition-all"
                    >
                      <div>
                        <p className="text-sm font-semibold text-[#2e1a47]">{l.brand} Gift Card</p>
                        <p className="text-xs text-[#7c6992]">
                          Face value ${l.faceValue.toFixed(2)} · {l.bidCount} bid{l.bidCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        {l.buyNowPrice && (
                          <p className="text-sm font-semibold text-[#2e1a47]">${l.buyNowPrice.toFixed(2)}</p>
                        )}
                        {l.acceptsExchange && (
                          <p className="text-xs text-[#AFABC9]">Accepts exchange</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {activeTab === 'bids' && (
              bids.length === 0 ? (
                <p className="text-sm text-[#AFABC9] text-center py-4">No pending bids or offers.</p>
              ) : (
                <div className="space-y-3">
                  {bids.map(b => (
                    <div
                      key={b.id}
                      onClick={() => navigate(`/listing/${b.listingId}`)}
                      className="flex items-center justify-between px-4 py-3 border border-[#E3DFEF] rounded-xl cursor-pointer hover:border-[#72569C] hover:bg-[#F6F3F9] transition-all"
                    >
                      <div>
                        <p className="text-sm font-semibold text-[#2e1a47]">
                          {b.listing.giftCard.brand} Gift Card
                        </p>
                        <p className="text-xs text-[#7c6992]">
                          {b.bidType === 'CASH' ? `$${b.cashAmount?.toFixed(2)} cash offer` : 'Exchange offer'}
                        </p>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); navigate(`/listing/${b.listingId}`) }}
                        className="text-xs border border-[#E3DFEF] rounded-xl px-3 py-1.5 text-[#7c6992] hover:border-[#2e1a47] hover:text-[#2e1a47] transition-colors"
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
        <div className="bg-[#2e1a47] rounded-2xl p-8 shadow-[0_6px_24px_rgba(46,26,71,0.25)]">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#AFABC9] mb-2">Identity verification</p>
              <p className="text-sm font-semibold text-white mt-2">
                {profile?.isVerified ? 'Verified ✓' : 'Not verified'}
              </p>
              <p className="text-xs text-[#AFABC9] mt-1 max-w-sm leading-relaxed">
                {profile?.isVerified
                  ? 'Your identity has been verified. A badge appears on your listings.'
                  : 'Verify your identity with a government-issued ID to build trust with buyers and sellers.'}
              </p>
              {verifyError && <p className="text-xs text-red-400 mt-2">{verifyError}</p>}
            </div>
            {!profile?.isVerified && (
              <button
                onClick={handleVerifyIdentity}
                disabled={verifying}
                className="text-sm bg-white text-[#2e1a47] px-5 py-2 rounded-xl font-semibold hover:bg-[#F6F3F9] transition-colors shrink-0 disabled:opacity-50 shadow-sm"
              >
                {verifying ? 'Loading...' : 'Get verified'}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}