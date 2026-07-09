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
      <div className="min-h-screen bg-[#F6F3F9] flex items-center justify-center">
        <p className="text-sm text-[#7c6992]">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F6F3F9] text-[#2e1a47]">

      {/* Nav */}
      <nav className="flex items-center justify-between px-4 sm:px-8 py-5 border-b border-[#E3DFEF] bg-white shadow-sm">
        <button
          onClick={() => navigate('/my-listings')}
          className="text-xl font-semibold tracking-tight text-[#2e1a47]"
        >
          Lantana
        </button>
        <button
          onClick={() => navigate('/my-listings')}
          className="text-sm text-[#7c6992] hover:text-[#2e1a47] transition-colors font-medium"
        >
          ← Back to my listings
        </button>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-8 py-12">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-[#7c6992] mb-2 font-semibold">Marketplace</p>
          <h1 className="text-3xl font-light text-[#2e1a47]">Edit listing</h1>
          <p className="text-sm text-[#7c6992] mt-2">
            {brand} gift card — ${faceValue.toFixed(2)}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Buy Now Price */}
          <div className="bg-white border border-[#E3DFEF] rounded-2xl p-6 shadow-[0_2px_3px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.06)]">
            <label className="block text-xs uppercase tracking-widest text-[#7c6992] mb-3 font-semibold">
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
              className="w-full bg-[#F6F3F9] border border-[#E3DFEF] rounded-xl px-4 py-3 text-sm text-[#2e1a47] placeholder-[#AFABC9] focus:outline-none focus:border-[#72569C] focus:ring-1 focus:ring-[#72569C] transition-colors"
            />
          </div>

          {/* Minimum Bid */}
          <div className="bg-white border border-[#E3DFEF] rounded-2xl p-6 shadow-[0_2px_3px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.06)]">
            <label className="block text-xs uppercase tracking-widest text-[#7c6992] mb-3 font-semibold">
              Minimum bid ($) <span className="text-[#AFABC9] normal-case font-normal">— optional</span>
            </label>
            <input
              type="number"
              value={minAcceptPrice}
              onChange={e => setMinAcceptPrice(e.target.value)}
              min="1"
              max={buyNowPrice || faceValue}
              step="0.01"
              placeholder="0.00"
              className="w-full bg-[#F6F3F9] border border-[#E3DFEF] rounded-xl px-4 py-3 text-sm text-[#2e1a47] placeholder-[#AFABC9] focus:outline-none focus:border-[#72569C] focus:ring-1 focus:ring-[#72569C] transition-colors"
            />
            <p className="text-xs text-[#AFABC9] mt-2">
              Bids below this amount will be automatically rejected
            </p>
          </div>

          {/* Accept Exchange */}
          <div className="bg-white border border-[#E3DFEF] rounded-2xl p-6 shadow-[0_2px_3px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#2e1a47]">Accept card exchanges</p>
                <p className="text-xs text-[#7c6992] mt-1">
                  Allow buyers to offer their own gift card instead of cash
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAcceptsExchange(!acceptsExchange)}
                className={`w-12 h-6 rounded-full transition-colors shrink-0 ${
                  acceptsExchange ? 'bg-[#2e1a47]' : 'bg-[#E3DFEF]'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full mx-auto transition-transform shadow-sm ${
                  acceptsExchange ? 'translate-x-3' : '-translate-x-2'
                }`} />
              </button>
            </div>

            {acceptsExchange && (
              <div className="mt-6 space-y-5 pt-5 border-t border-[#E3DFEF]">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#7c6992] mb-3 font-semibold">
                    Preferred brands <span className="text-[#AFABC9] normal-case font-normal">— optional</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {SUPPORTED_BRANDS.filter(b => b !== brand).map(b => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setPreferredBrands(prev =>
                          prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]
                        )}
                        className={`text-xs px-3 py-2 rounded-xl border font-medium transition-colors ${
                          preferredBrands.includes(b)
                            ? 'bg-[#2e1a47] text-white border-[#2e1a47]'
                            : 'bg-[#F6F3F9] text-[#7c6992] border-[#E3DFEF] hover:border-[#2e1a47] hover:text-[#2e1a47]'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                  {preferredBrands.length > 0 && (
                    <p className="text-xs text-[#7c6992] mt-2">
                      Selected: {preferredBrands.join(', ')}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#7c6992] mb-3 font-semibold">
                    Minimum card value ($) <span className="text-[#AFABC9] normal-case font-normal">— optional</span>
                  </label>
                  <input
                    type="number"
                    value={preferredMinValue}
                    onChange={e => setPreferredMinValue(e.target.value)}
                    min="1"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full bg-[#F6F3F9] border border-[#E3DFEF] rounded-xl px-4 py-3 text-sm text-[#2e1a47] placeholder-[#AFABC9] focus:outline-none focus:border-[#72569C] focus:ring-1 focus:ring-[#72569C] transition-colors"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[#2e1a47] text-white py-3.5 text-sm font-semibold rounded-xl hover:bg-[#72569C] transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>

        </form>
      </div>
    </div>
  )
}