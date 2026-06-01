import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApi } from '../services/api.ts'

const SUPPORTED_BRANDS = [
  'Amazon', 'Visa', 'Mastercard', 'Target', 'Walmart',
  'Best Buy', 'Steam', 'Apple', 'Google Play', 'Nike', 'Starbucks', 'Sephora'
]

export default function CreateListing() {
  const navigate = useNavigate()
  const location = useLocation()
  const api = useApi()

  const { giftCardId, brand, faceValue } = location.state ?? {}

  const [listingType, setListingType] = useState<'SELL' | 'EXCHANGE' | 'BOTH'>('SELL')
  const [askingPrice, setAskingPrice] = useState<string>('')
  const [preferredBrand, setPreferredBrand] = useState<string>('')
  const [marketRate, setMarketRate] = useState<number>(0.90)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!giftCardId) {
      navigate('/dashboard')
      return
    }
    if (brand) {
      api.getMarketRate(brand)
        .then(data => {
          setMarketRate(data.marketRate)
          setAskingPrice((faceValue * data.marketRate).toFixed(2))
        })
        .catch(console.error)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await api.createListing({
        giftCardId,
        listingType,
        askingPrice: parseFloat(askingPrice),
        preferredBrand: preferredBrand || undefined,
        maxExchangeValue: faceValue
      })
      navigate('/dashboard')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
    } finally {
      setLoading(false)
    }
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

      <div className="max-w-2xl mx-auto px-8 py-12">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-[#7a7a9a] mb-2">Marketplace</p>
          <h1 className="text-3xl font-semibold text-[#1a1a2e]">List your card</h1>
          <p className="text-sm text-[#4a4a6a] mt-2">
            Your {brand} gift card worth ${faceValue?.toFixed(2)} has been submitted. 
            Choose how you'd like to list it.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Listing Type */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-[#7a7a9a] mb-3">
              What do you want?
            </label>
            <div className="grid grid-cols-3 gap-3">
              {([
                { value: 'SELL', label: 'Sell it', desc: 'Get credits' },
                { value: 'EXCHANGE', label: 'Exchange it', desc: 'Get a different card' },
                { value: 'BOTH', label: 'Either', desc: 'Whatever comes first' },
              ] as const).map(({ value, label, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setListingType(value)}
                  className={`p-4 border text-left transition-colors ${
                    listingType === value
                      ? 'bg-[#1a1a2e] text-white border-[#1a1a2e]'
                      : 'bg-white text-[#1a1a2e] border-[#e2e0db] hover:border-[#1a1a2e]'
                  }`}
                >
                  <p className="text-sm font-semibold">{label}</p>
                  <p className={`text-xs mt-1 ${listingType === value ? 'text-gray-300' : 'text-[#7a7a9a]'}`}>
                    {desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Asking Price */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-[#7a7a9a] mb-2">
              Asking price (in credits)
            </label>
            <input
              type="number"
              value={askingPrice}
              onChange={e => setAskingPrice(e.target.value)}
              required
              min="1"
              max={faceValue}
              step="0.01"
              className="w-full bg-white border border-[#e2e0db] px-4 py-3 text-sm text-[#1a1a2e] focus:outline-none focus:border-[#1a1a2e] transition-colors"
            />
            <p className="text-xs text-[#7a7a9a] mt-1">
              Market rate: {(marketRate * 100).toFixed(0)}% of face value 
              (${(faceValue * marketRate).toFixed(2)})
            </p>
          </div>

          {/* Preferred Brand (only for EXCHANGE or BOTH) */}
          {(listingType === 'EXCHANGE' || listingType === 'BOTH') && (
            <div>
              <label className="block text-xs uppercase tracking-widest text-[#7a7a9a] mb-2">
                Preferred brand (optional)
              </label>
              <select
                value={preferredBrand}
                onChange={e => setPreferredBrand(e.target.value)}
                className="w-full bg-white border border-[#e2e0db] px-4 py-3 text-sm text-[#1a1a2e] focus:outline-none focus:border-[#1a1a2e] transition-colors"
              >
                <option value="">Any brand</option>
                {SUPPORTED_BRANDS.filter(b => b !== brand).map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          )}

          {/* Summary */}
          <div className="bg-white border border-[#e2e0db] p-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[#4a4a6a]">Card</span>
              <span className="text-[#1a1a2e]">{brand} — ${faceValue?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#4a4a6a]">Listing type</span>
              <span className="text-[#1a1a2e]">{listingType === 'BOTH' ? 'Sell or Exchange' : listingType === 'SELL' ? 'Sell' : 'Exchange'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#4a4a6a]">Asking price</span>
              <span className="text-[#1a1a2e]">{askingPrice} credits</span>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1a1a2e] text-white py-3 text-sm font-semibold hover:bg-[#2d2d4e] transition-colors disabled:opacity-50"
          >
            {loading ? 'Listing...' : 'List card on marketplace'}
          </button>

        </form>
      </div>
    </div>
  )
}