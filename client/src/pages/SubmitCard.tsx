import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi } from '../services/api.ts'
import { SUPPORTED_BRANDS } from '../services/brandImages.ts'

export default function SubmitCard() {
  const navigate = useNavigate()
  const api = useApi()
  const [form, setForm] = useState({
    brand: '',
    cardNumber: '',
    pin: '',
    declaredValue: '',
    description: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // const fee = form.declaredValue ? parseFloat(form.declaredValue) * 0.07 : 0
  // const creditValue = form.declaredValue ? parseFloat(form.declaredValue) - fee : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await api.submitGiftCard({
        brand: form.brand,
        cardNumber: form.cardNumber,
        pin: form.pin,
        declaredValue: parseFloat(form.declaredValue)
      })
      navigate('/create-listing', {
        state: {
          giftCardId: result.giftCard.id,
          brand: form.brand,
          faceValue: parseFloat(form.declaredValue)
        }
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
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
          <p className="text-xs uppercase tracking-widest text-[#7a7a9a] mb-2">Exchange</p>
          <h1 className="text-3xl font-semibold text-[#1a1a2e]">Submit a gift card</h1>
          <p className="text-sm text-[#4a4a6a] mt-2">
            Enter your card details below. We'll verify the balance before processing.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Brand */}
            <div className="relative">
              <label className="block text-xs uppercase tracking-widest text-[#7a7a9a] mb-2">Brand</label>
              <input
                type="text"
                value={form.brand}
                onChange={e => setForm({ ...form, brand: e.target.value })}
                required
                placeholder="Search or select a brand"
                className="w-full bg-white border border-[#e2e0db] px-4 py-3 text-sm text-[#1a1a2e] placeholder-[#b0b0c0] focus:outline-none focus:border-[#1a1a2e] transition-colors"
              />
              {form.brand && SUPPORTED_BRANDS.filter(b =>
                b.toLowerCase().includes(form.brand.toLowerCase()) && b !== form.brand
              ).length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-[#e2e0db] border-t-0 max-h-48 overflow-y-auto">
                  {SUPPORTED_BRANDS.filter(b =>
                    b.toLowerCase().includes(form.brand.toLowerCase()) && b !== form.brand
                  ).map(b => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setForm({ ...form, brand: b })}
                      className="w-full text-left px-4 py-2 text-sm text-[#1a1a2e] hover:bg-[#f8f7f4] transition-colors"
                    >
                      {b}
                    </button>
                  ))}
                </div>
              )}
            </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-[#7a7a9a] mb-2">Card Number</label>
                        <input
                            type="text"
                            value={form.cardNumber}
                            onChange={e => setForm({ ...form, cardNumber: e.target.value })}
                            required
                            maxLength={20}
                            minLength={8}
                            placeholder="Enter card number"
                            className="w-full bg-white border border-[#e2e0db] px-4 py-3 text-sm text-[#1a1a2e] placeholder-[#b0b0c0] focus:outline-none focus:border-[#1a1a2e] transition-colors"
                            />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-[#7a7a9a] mb-2">PIN</label>
                        <input
                            type="text"
                            value={form.pin}
                            onChange={e => setForm({ ...form, pin: e.target.value })}
                            required
                            maxLength={8}
                            minLength={4}
                            placeholder="Enter PIN"
                            className="w-full bg-white border border-[#e2e0db] px-4 py-3 text-sm text-[#1a1a2e] placeholder-[#b0b0c0] focus:outline-none focus:border-[#1a1a2e] transition-colors"
                            />
                      </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-[#7a7a9a] mb-2">Card Value ($)</label>
            <input
                type="number"
                value={form.declaredValue}
                onChange={e => setForm({ ...form, declaredValue: e.target.value })}
                required
                min="1"
                max="2000"
                step="0.01"
                placeholder="0.00"
                className="w-full bg-white border border-[#e2e0db] px-4 py-3 text-sm text-[#1a1a2e] placeholder-[#b0b0c0] focus:outline-none focus:border-[#1a1a2e] transition-colors"
                />
          </div>

          {form.brand === 'Other' && (
            <div>
              <label className="block text-xs uppercase tracking-widest text-[#7a7a9a] mb-2">
                Card Description <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                required
                placeholder="e.g. Nordstrom gift card, $50"
                className="w-full bg-white border border-[#e2e0db] px-4 py-3 text-sm text-[#1a1a2e] placeholder-[#b0b0c0] focus:outline-none focus:border-[#1a1a2e] transition-colors"
              />
            </div>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1a1a2e] text-white py-3 text-sm font-semibold hover:bg-[#2d2d4e] transition-colors disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit card for verification'}
          </button>
        </form>
      </div>
    </div>
  )
}