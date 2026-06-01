import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApi } from '../services/api.ts'
import { useStore } from '../store/useStore.ts'

interface Listing {
  id: string
  askingPrice: number
  listingType: string
  preferredBrand: string | null
  status: string
  giftCard: {
    brand: string
    faceValue: number
  }
}

export default function ListingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const api = useApi()
  const { balance, setBalance } = useStore()
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [error, setError] = useState('')
  const [purchased, setPurchased] = useState<{
    brand: string
    cardNumber: string
    pin: string
    faceValue: number
  } | null>(null)

  useEffect(() => {
    if (!id) return
    api.getListingById(id)
      .then(data => setListing(data.listing))
      .catch(() => navigate('/browse'))
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handlePurchase = async () => {
    if (!id) return
    setPurchasing(true)
    setError('')
    try {
      const result = await api.purchaseListing(id)
      setBalance(balance - (listing?.askingPrice ?? 0))
      setPurchased(result.giftCard)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
    } finally {
      setPurchasing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center">
        <p className="text-sm text-[#7a7a9a]">Loading...</p>
      </div>
    )
  }

  if (purchased) {
    return (
      <div className="min-h-screen bg-[#f8f7f4] text-[#1a1a2e]">
        <nav className="flex items-center justify-between px-8 py-5 border-b border-[#e2e0db] bg-white">
          <button onClick={() => navigate('/dashboard')} className="text-xl font-semibold tracking-tight">
            Lantana
          </button>
        </nav>
        <div className="max-w-2xl mx-auto px-8 py-24 text-center">
          <p className="text-xs uppercase tracking-widest text-[#7a7a9a] mb-4">Purchase complete</p>
          <h1 className="text-3xl font-semibold text-[#1a1a2e] mb-4">Your card is ready.</h1>
          <p className="text-sm text-[#4a4a6a] mb-8">
            Save these details — they won't be shown again.
          </p>
          <div className="bg-white border border-[#e2e0db] p-8 text-left space-y-4 mb-8">
            <div className="flex justify-between text-sm">
              <span className="text-[#7a7a9a]">Brand</span>
              <span className="font-semibold">{purchased.brand}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#7a7a9a]">Card Number</span>
              <span className="font-semibold font-mono">{purchased.cardNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#7a7a9a]">PIN</span>
              <span className="font-semibold font-mono">{purchased.pin}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#7a7a9a]">Face Value</span>
              <span className="font-semibold">${purchased.faceValue.toFixed(2)}</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-[#1a1a2e] text-white px-8 py-3 text-sm hover:bg-[#2d2d4e] transition-colors"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!listing) return null

  const discount = (((listing.giftCard.faceValue - listing.askingPrice) / listing.giftCard.faceValue) * 100).toFixed(0)

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

      <div className="max-w-2xl mx-auto px-8 py-12">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-[#7a7a9a] mb-2">Marketplace</p>
          <h1 className="text-3xl font-semibold text-[#1a1a2e]">{listing.giftCard.brand} Gift Card</h1>
        </div>

        <div className="bg-white border border-[#e2e0db] p-8 mb-6 space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-[#7a7a9a]">Face value</span>
            <span className="line-through text-[#4a4a6a]">${listing.giftCard.faceValue.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#7a7a9a]">Discount</span>
            <span className="text-green-600">{discount}% off</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#7a7a9a]">Listing type</span>
            <span className="text-[#1a1a2e]">
              {listing.listingType === 'SELL' ? 'For sale' : listing.listingType === 'EXCHANGE' ? 'For exchange' : 'Sale or exchange'}
            </span>
          </div>
          {listing.preferredBrand && (
            <div className="flex justify-between text-sm">
              <span className="text-[#7a7a9a]">Seller wants</span>
              <span className="text-[#1a1a2e]">{listing.preferredBrand}</span>
            </div>
          )}
          <div className="border-t border-[#e2e0db] pt-4 flex justify-between">
            <span className="text-sm font-semibold text-[#1a1a2e]">Your price</span>
            <span className="text-xl font-semibold text-[#1a1a2e]">{listing.askingPrice.toFixed(2)} credits</span>
          </div>
        </div>

        <div className="bg-white border border-[#e2e0db] p-6 mb-6 flex justify-between items-center">
          <span className="text-sm text-[#4a4a6a]">Your balance</span>
          <span className="text-sm font-semibold text-[#1a1a2e]">{balance.toFixed(2)} credits</span>
        </div>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        <button
          onClick={handlePurchase}
          disabled={purchasing || balance < listing.askingPrice || listing.status !== 'ACTIVE'}
          className="w-full bg-[#1a1a2e] text-white py-3 text-sm font-semibold hover:bg-[#2d2d4e] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {purchasing ? 'Processing...' : balance < listing.askingPrice ? 'Insufficient credits' : `Purchase for ${listing.askingPrice.toFixed(2)} credits`}
        </button>
      </div>
    </div>
  )
}