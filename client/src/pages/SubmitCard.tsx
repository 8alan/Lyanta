import { useState, useEffect } from 'react'
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
  const [isDirty, setIsDirty] = useState(false)
  const [showLeaveModal, setShowLeaveModal] = useState(false)

  // Intercept browser back button
  useEffect(() => {
    if (!isDirty) return
    window.history.pushState(null, '', window.location.href)
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href)
      setShowLeaveModal(true)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [isDirty])

  // Intercept refresh / tab close
  useEffect(() => {
    if (!isDirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  const handleChange = (field: string, value: string) => {
    setIsDirty(true)
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleBackClick = () => {
    if (isDirty) {
      setShowLeaveModal(true)
    } else {
      navigate('/dashboard')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await api.submitGiftCard({
        brand: form.brand,
        cardNumber: form.cardNumber,
        pin: form.pin,
        declaredValue: parseFloat(form.declaredValue),
        description: form.description || undefined
      })
      setIsDirty(false)
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
    <div className="min-h-screen bg-[#F6F3F9] text-[#2e1a47]">

      {/* ── Leave confirmation modal ── */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-xl border border-[#E3DFEF]">
            <h2 className="text-base font-semibold text-[#2e1a47] mb-2">Leave this page?</h2>
            <p className="text-sm text-[#7c6992] mb-6">
              Your card submission is still in progress. Changes won't be saved if you leave.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLeaveModal(false)}
                className="text-sm px-4 py-2 rounded-lg border border-[#E3DFEF] text-[#7c6992] hover:border-[#2e1a47] hover:text-[#2e1a47] transition-colors font-medium"
              >
                Stay
              </button>
              <button
                onClick={() => {
                  setIsDirty(false)
                  setShowLeaveModal(false)
                  navigate('/dashboard')
                }}
                className="text-sm px-4 py-2 rounded-lg bg-[#2e1a47] text-white hover:bg-[#72569C] transition-colors font-medium"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Nav ── */}
      <nav className="flex items-center justify-between px-4 sm:px-8 py-5 border-b border-[#E3DFEF] bg-white shadow-sm">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-xl font-semibold tracking-tight text-[#2e1a47]"
        >
          Lantana
        </button>
        <button
          onClick={handleBackClick}
          className="text-sm text-[#7c6992] hover:text-[#2e1a47] transition-colors font-medium"
        >
          ← Back to dashboard
        </button>
      </nav>

      {/* ── Form container ── */}
      <div className="max-w-2xl mx-auto px-4 sm:px-8 py-12">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-[#7c6992] mb-2 font-semibold">
            Exchange
          </p>
          <h1 className="text-3xl font-light text-[#2e1a47]">Submit a gift card</h1>
          <p className="text-sm text-[#7c6992] mt-2 leading-relaxed">
            Enter your card details below. We'll verify the balance before processing.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Brand */}
          <div className="relative">
            <label className="block text-xs uppercase tracking-widest text-[#7c6992] mb-2 font-semibold">
              Brand
            </label>
            <input
              type="text"
              value={form.brand}
              onChange={e => handleChange('brand', e.target.value)}
              required
              placeholder="Search or select a brand"
              className="w-full bg-white border border-[#E3DFEF] rounded-lg px-4 py-3 text-sm text-[#2e1a47] placeholder-[#AFABC9] focus:outline-none focus:border-[#72569C] focus:ring-1 focus:ring-[#72569C] transition-colors"
            />
            {form.brand && SUPPORTED_BRANDS.filter(b =>
              b.toLowerCase().includes(form.brand.toLowerCase()) && b !== form.brand
            ).length > 0 && (
              <div className="absolute z-10 w-full bg-white border border-[#E3DFEF] rounded-b-lg border-t-0 max-h-48 overflow-y-auto shadow-md">
                {SUPPORTED_BRANDS.filter(b =>
                  b.toLowerCase().includes(form.brand.toLowerCase()) && b !== form.brand
                ).map(b => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => handleChange('brand', b)}
                    className="w-full text-left px-4 py-2.5 text-sm text-[#2e1a47] hover:bg-[#F6F3F9] transition-colors"
                  >
                    {b}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Card Number */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-[#7c6992] mb-2 font-semibold">
              Card Number
            </label>
            <input
              type="text"
              value={form.cardNumber}
              onChange={e => handleChange('cardNumber', e.target.value)}
              required
              maxLength={20}
              minLength={8}
              placeholder="Enter card number"
              className="w-full bg-white border border-[#E3DFEF] rounded-lg px-4 py-3 text-sm text-[#2e1a47] placeholder-[#AFABC9] focus:outline-none focus:border-[#72569C] focus:ring-1 focus:ring-[#72569C] transition-colors"
            />
          </div>

          {/* PIN */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-[#7c6992] mb-2 font-semibold">
              PIN
            </label>
            <input
              type="text"
              value={form.pin}
              onChange={e => handleChange('pin', e.target.value)}
              required
              maxLength={8}
              minLength={4}
              placeholder="Enter PIN"
              className="w-full bg-white border border-[#E3DFEF] rounded-lg px-4 py-3 text-sm text-[#2e1a47] placeholder-[#AFABC9] focus:outline-none focus:border-[#72569C] focus:ring-1 focus:ring-[#72569C] transition-colors"
            />
          </div>

          {/* Card Value */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-[#7c6992] mb-2 font-semibold">
              Card Value ($)
            </label>
            <input
              type="number"
              value={form.declaredValue}
              onChange={e => handleChange('declaredValue', e.target.value)}
              required
              min="1"
              max="2000"
              step="0.01"
              placeholder="0.00"
              className="w-full bg-white border border-[#E3DFEF] rounded-lg px-4 py-3 text-sm text-[#2e1a47] placeholder-[#AFABC9] focus:outline-none focus:border-[#72569C] focus:ring-1 focus:ring-[#72569C] transition-colors"
            />
          </div>

          {/* Description — only shown for "Other" brand */}
          {form.brand === 'Other' && (
            <div>
              <label className="block text-xs uppercase tracking-widest text-[#7c6992] mb-2 font-semibold">
                Card Description <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.description}
                onChange={e => handleChange('description', e.target.value)}
                required
                placeholder="e.g. Nordstrom gift card, $50"
                className="w-full bg-white border border-[#E3DFEF] rounded-lg px-4 py-3 text-sm text-[#2e1a47] placeholder-[#AFABC9] focus:outline-none focus:border-[#72569C] focus:ring-1 focus:ring-[#72569C] transition-colors"
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2e1a47] text-white py-3 text-sm font-semibold rounded-lg hover:bg-[#72569C] transition-colors disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit card for verification'}
          </button>

        </form>
      </div>
    </div>
  )
}