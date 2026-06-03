import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApi } from '../services/api.ts'
import { SUPPORTED_BRANDS } from '../services/brandImages.ts'

export default function EditListing() {
  const { id } = useParams()
  const navigate = useNavigate()
  const api = useApi()

  const [buyNowPrice, setBuyNowPrice] = useState('')
  const [minAcceptPrice, setMinAcceptPrice] = useState('')
  const [acceptsExchange, setAcceptsExchange] = useState(false)
  const [preferredBrands, setPreferredBrands] = useState<string[]>([])
  const [preferredMinValue, setPreferredMinValue] = useState('')
  const [faceValue, setFaceValue] = useState(0)
  const [brand, setBrand] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    api.getListingById(id)
      .then(data => {
        const l = data.listing
        setBuyNowPrice(l.buyNowPrice?.toString() ?? '')
        setMinAcceptPrice(l.minAcceptPrice?.toString() ?? '')
        setAcceptsExchange(l.acceptsExchange)
        setPreferredBrands(l.preferredBrand ?? [])
        setPreferredMinValue(l.preferredMinValue?.toString() ?? '')
        setFaceValue(l.giftCard.faceValue)
        setBrand(l.giftCard.brand)
      })
      .catch(() => navigate('/my-listings'))
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    setSaving(true)
    setError('')
    try {
      await api.editListing(id, {
        buyNowPrice: buyNowPrice ? parseFloat(buyNowPrice) : undefined,
        minAcceptPrice: minAcceptPrice ? parseFloat(minAcceptPrice) : undefined,
        acceptsExchange,
        preferredBrand: preferredBrands,
        preferredMinValue: preferredMinValue ? parseFloat(preferredMinValue) : undefined,
      })
      navigate('/my-listings')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
    } finally {
      setSaving(false)
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
        <button onClick={() => navigate('/my-listings')} className="text-xl font-semibold tracking-tight">
          Lantana
        </button>
        <button
          onClick={() => navigate('/my-listings')}
          className="text-sm text-[#4a4a6a] hover:text-[#1a1a2e] transition-colors"
        >
          ← Back to my listings
        </button>
      </nav>

      <div className="max-w-2xl mx-auto px-8 py-12">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-[#7a7a9a] mb-2">Marketplace</p>
          <h1 className="text-3xl font-semibold text-[#1a1a2e]">Edit listing</h1>
          <p className="text-sm text-[#4a4a6a] mt-2">
            {brand} gift card — ${faceValue.toFixed(2)}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Buy Now Price */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-[#7a7a9a] mb-2">
              Buy now price ($)
            </label>
            <input
              type="number"
              value={buyNowPrice}
              onChange={e => setBuyNowPrice(e.target.value)}
              min="1"
              max={faceValue}
              step="0.01"
              placeholder="0.00"
              className="w-full bg-white border border-[#e2e0db] px-4 py-3 text-sm text-[#1a1a2e] placeholder-[#b0b0c0] focus:outline-none focus:border-[#1a1a2e] transition-colors"
            />
          </div>

          {/* Minimum Bid */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-[#7a7a9a] mb-2">
              Minimum bid ($) <span className="text-[#b0b0c0] normal-case">(optional)</span>
            </label>
            <input
              type="number"
              value={minAcceptPrice}
              onChange={e => setMinAcceptPrice(e.target.value)}
              min="1"
              max={buyNowPrice || faceValue}
              step="0.01"
              placeholder="0.00"
              className="w-full bg-white border border-[#e2e0db] px-4 py-3 text-sm text-[#1a1a2e] placeholder-[#b0b0c0] focus:outline-none focus:border-[#1a1a2e] transition-colors"
            />
          </div>

          {/* Accept Exchange */}
          <div className="bg-white border border-[#e2e0db] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#1a1a2e]">Accept card exchanges</p>
                <p className="text-xs text-[#7a7a9a] mt-1">
                  Allow buyers to offer their own gift card instead of cash
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAcceptsExchange(!acceptsExchange)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  acceptsExchange ? 'bg-[#1a1a2e]' : 'bg-[#e2e0db]'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full mx-auto transition-transform ${
                  acceptsExchange ? 'translate-x-3' : '-translate-x-2'
                }`} />
              </button>
            </div>

            {acceptsExchange && (
              <div className="mt-6 space-y-4 pt-4 border-t border-[#e2e0db]">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#7a7a9a] mb-2">
                    Preferred brands <span className="text-[#b0b0c0] normal-case">(optional)</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-[#e2e0db] bg-white p-3">
                    {SUPPORTED_BRANDS.filter(b => b !== brand).map(b => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setPreferredBrands(prev =>
                          prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]
                        )}
                        className={`text-left text-sm px-3 py-2 border transition-colors ${
                          preferredBrands.includes(b)
                            ? 'bg-[#1a1a2e] text-white border-[#1a1a2e]'
                            : 'bg-white text-[#1a1a2e] border-[#e2e0db] hover:border-[#1a1a2e]'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#7a7a9a] mb-2">
                    Minimum card value ($) <span className="text-[#b0b0c0] normal-case">(optional)</span>
                  </label>
                  <input
                    type="number"
                    value={preferredMinValue}
                    onChange={e => setPreferredMinValue(e.target.value)}
                    min="1"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full bg-white border border-[#e2e0db] px-4 py-3 text-sm text-[#1a1a2e] placeholder-[#b0b0c0] focus:outline-none focus:border-[#1a1a2e] transition-colors"
                  />
                </div>
              </div>
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[#1a1a2e] text-white py-3 text-sm font-semibold hover:bg-[#2d2d4e] transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>

        </form>
      </div>
    </div>
  )
}