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

  const [buyNowPrice, setBuyNowPrice] = useState<string>('')
  const [minAcceptPrice, setMinAcceptPrice] = useState<string>('')
  const [acceptsExchange, setAcceptsExchange] = useState(false)
  const [preferredBrands, setPreferredBrands] = useState<string[]>([])
  const [preferredMinValue, setPreferredMinValue] = useState<string>('')
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
          setBuyNowPrice((faceValue * data.marketRate).toFixed(2))
        })
        .catch(console.error)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!buyNowPrice && !acceptsExchange) {
      setError('You must set a buy now price or accept exchanges')
      return
    }

    setLoading(true)
    try {
      await api.createListing({
        giftCardId,
        buyNowPrice: buyNowPrice ? parseFloat(buyNowPrice) : undefined,
        minAcceptPrice: minAcceptPrice ? parseFloat(minAcceptPrice) : undefined,
        acceptsExchange,
        preferredBrand: preferredBrands,
        preferredMinValue: preferredMinValue ? parseFloat(preferredMinValue) : undefined,
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
            Your {brand} gift card worth ${faceValue?.toFixed(2)} has been submitted for verification.
            Set your listing terms below.
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
            <p className="text-xs text-[#7a7a9a] mt-1">
              Market rate: {(marketRate * 100).toFixed(0)}% of face value (${(faceValue * marketRate).toFixed(2)})
            </p>
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
            <p className="text-xs text-[#7a7a9a] mt-1">
              Bids below this amount will be automatically rejected
            </p>
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
                    Preferred brands <span className="text-[#b0b0c0] normal-case">(optional — select all that apply)</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-[#e2e0db] bg-white p-3">
                    {SUPPORTED_BRANDS.filter(b => b !== brand).map(b => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => {
                          setPreferredBrands(prev =>
                            prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]
                          )
                        }}
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
                  {preferredBrands.length > 0 && (
                    <p className="text-xs text-[#7a7a9a] mt-1">
                      Selected: {preferredBrands.join(', ')}
                    </p>
                  )}
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
                    placeholder={faceValue?.toFixed(2)}
                    className="w-full bg-white border border-[#e2e0db] px-4 py-3 text-sm text-[#1a1a2e] placeholder-[#b0b0c0] focus:outline-none focus:border-[#1a1a2e] transition-colors"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-white border border-[#e2e0db] p-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[#4a4a6a]">Card</span>
              <span className="text-[#1a1a2e]">{brand} — ${faceValue?.toFixed(2)}</span>
            </div>
            {buyNowPrice && (
              <div className="flex justify-between text-sm">
                <span className="text-[#4a4a6a]">Buy now price</span>
                <span className="text-[#1a1a2e]">${parseFloat(buyNowPrice).toFixed(2)}</span>
              </div>
            )}
            {minAcceptPrice && (
              <div className="flex justify-between text-sm">
                <span className="text-[#4a4a6a]">Minimum bid</span>
                <span className="text-[#1a1a2e]">${parseFloat(minAcceptPrice).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-[#4a4a6a]">Accepts exchange</span>
              <span className="text-[#1a1a2e]">{acceptsExchange ? 'Yes' : 'No'}</span>
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