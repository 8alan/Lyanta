import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApi } from '../services/api.ts'
import { getBrandImage } from '../services/brandImages.ts'

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
  const [listingCompleted, setListingCompleted] = useState(false)
  const [hasMarketHistory, setHasMarketHistory] = useState(false)

  useEffect(() => {
    if (!giftCardId) {
      navigate('/dashboard')
      return
    }
    if (brand) {
      api.getMarketRate(brand)
        .then(data => {
          setMarketRate(data.marketRate)
          setHasMarketHistory(data.hasHistory)
          if (data.hasHistory) {
            setBuyNowPrice((faceValue * data.marketRate).toFixed(2))
          }
        })
        .catch(console.error)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!listingCompleted) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [listingCompleted])

  const handleExit = async () => {
    if (listingCompleted) {
      navigate('/dashboard')
      return
    }
    const confirmed = window.confirm('Are you sure? Your card submission will be deleted if you leave.')
    if (confirmed) {
      try {
        await api.deleteGiftCard(giftCardId)
      } catch (err) {
        console.error(err)
      }
      navigate('/dashboard')
    }
  }

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
      setListingCompleted(true)
      navigate('/dashboard')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const brandImage = getBrandImage(brand)
  
  return (
    <div className="min-h-screen bg-[#F6F3F9] text-[#2e1a47]">

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-[#E3DFEF] bg-white shadow-sm">
        <button onClick={handleExit} className="text-xl font-semibold tracking-tight text-[#2e1a47]">
          Lantana
        </button>
        <button onClick={handleExit} className="text-sm text-[#7c6992] hover:text-[#2e1a47] transition-colors font-medium">
          ← Back to dashboard
        </button>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-8 py-12">

        {/* Page heading */}
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-[#7c6992] mb-2">Marketplace</p>
          <h1 className="text-3xl font-light text-[#2e1a47]">List your card</h1>
        </div>

        {/* Card preview */}
        <div className="bg-white border border-[#E3DFEF] rounded-2xl p-6 mb-6 shadow-[0_2px_3px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.06)] flex items-center gap-5">
          <div className="w-20 h-14 rounded-xl overflow-hidden bg-[#E3DFEF] shrink-0">
            {brandImage ? (
              <img src={brandImage} alt={brand} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-xs text-[#AFABC9] font-medium text-center px-1">{brand}</span>
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#2e1a47]">{brand} Gift Card</p>
            <p className="text-xs text-[#7c6992] mt-0.5">Face value: ${faceValue?.toFixed(2)}</p>
            <p className="text-xs text-[#AFABC9] mt-0.5">Submitted for verification</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Buy Now Price */}
          <div className="bg-white border border-[#E3DFEF] rounded-2xl p-6 shadow-[0_2px_3px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.06)]">
            <label className="block text-xs uppercase tracking-widest text-[#7c6992] mb-3">
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
              className="w-full bg-[#F6F3F9] border border-[#E3DFEF] rounded-xl px-4 py-3 text-sm text-[#2e1a47] placeholder-[#AFABC9] focus:outline-none focus:border-[#72569C] transition-colors"
            />
            {hasMarketHistory && (
              <p className="text-xs text-[#AFABC9] mt-2">
                Market rate: {(marketRate * 100).toFixed(0)}% of face value (${(faceValue * marketRate).toFixed(2)})
              </p>
            )}
          </div>

          {/* Minimum Bid */}
          <div className="bg-white border border-[#E3DFEF] rounded-2xl p-6 shadow-[0_2px_3px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.06)]">
            <label className="block text-xs uppercase tracking-widest text-[#7c6992] mb-3">
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
              className="w-full bg-[#F6F3F9] border border-[#E3DFEF] rounded-xl px-4 py-3 text-sm text-[#2e1a47] placeholder-[#AFABC9] focus:outline-none focus:border-[#72569C] transition-colors"
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
                  <label className="block text-xs uppercase tracking-widest text-[#7c6992] mb-3">
                    Preferred brands <span className="text-[#AFABC9] normal-case font-normal">— optional</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {SUPPORTED_BRANDS.filter(b => b !== brand).map(b => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => {
                          setPreferredBrands(prev =>
                            prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]
                          )
                        }}
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
                  <label className="block text-xs uppercase tracking-widest text-[#7c6992] mb-3">
                    Minimum card value ($) <span className="text-[#AFABC9] normal-case font-normal">— optional</span>
                  </label>
                  <input
                    type="number"
                    value={preferredMinValue}
                    onChange={e => setPreferredMinValue(e.target.value)}
                    min="1"
                    step="0.01"
                    placeholder={faceValue?.toFixed(2)}
                    className="w-full bg-[#F6F3F9] border border-[#E3DFEF] rounded-xl px-4 py-3 text-sm text-[#2e1a47] placeholder-[#AFABC9] focus:outline-none focus:border-[#72569C] transition-colors"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-white border border-[#E3DFEF] rounded-2xl p-6 shadow-[0_2px_3px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.06)] space-y-3">
            <p className="text-xs uppercase tracking-widest text-[#7c6992] mb-4">Summary</p>
            <div className="flex justify-between text-sm">
              <span className="text-[#7c6992]">Card</span>
              <span className="font-medium text-[#2e1a47]">{brand} — ${faceValue?.toFixed(2)}</span>
            </div>
            {buyNowPrice && (
              <div className="flex justify-between text-sm">
                <span className="text-[#7c6992]">Buy now price</span>
                <span className="font-medium text-[#2e1a47]">${parseFloat(buyNowPrice).toFixed(2)}</span>
              </div>
            )}
            {minAcceptPrice && (
              <div className="flex justify-between text-sm">
                <span className="text-[#7c6992]">Minimum bid</span>
                <span className="font-medium text-[#2e1a47]">${parseFloat(minAcceptPrice).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-[#7c6992]">Accepts exchange</span>
              <span className="font-medium text-[#2e1a47]">{acceptsExchange ? 'Yes' : 'No'}</span>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 px-1">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2e1a47] text-white py-3.5 text-sm font-semibold rounded-xl hover:bg-[#72569C] transition-colors disabled:opacity-50"
          >
            {loading ? 'Listing...' : 'List card on marketplace'}
          </button>

        </form>
      </div>
    </div>
  )
}