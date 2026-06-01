import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useApi } from '../services/api.ts'
import { useStore } from '../store/useStore.ts'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
const PRESET_AMOUNTS = [25, 50, 100, 250, 500]

function CheckoutForm({ amount, onSuccess }: { amount: number, onSuccess: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    setError('')

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/dashboard` },
      redirect: 'if_required'
    })

    if (result.error) {
      setError(result.error.message ?? 'Payment failed')
      setLoading(false)
    } else {
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading || !stripe}
        className="w-full bg-[#1a1a2e] text-white py-3 text-sm font-semibold hover:bg-[#2d2d4e] transition-colors disabled:opacity-50"
      >
        {loading ? 'Processing...' : `Purchase $${amount} in credits`}
      </button>
    </form>
  )
}

export default function BuyCredits() {
  const navigate = useNavigate()
  const api = useApi()
  const { setBalance } = useStore()
  const [amount, setAmount] = useState(50)
  const [customAmount, setCustomAmount] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const selectedAmount = customAmount ? parseFloat(customAmount) : amount

  const handleContinue = async () => {
    if (!selectedAmount || selectedAmount < 1 || selectedAmount > 10000) {
      setError('Amount must be between $1 and $10,000')
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = await api.createPaymentIntent(selectedAmount)
      setClientSecret(data.clientSecret)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleSuccess = async () => {
    try {
      const data = await api.getBalance()
      setBalance(data.balance)
    } catch {
      // balance will update on next dashboard load
    }
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#f8f7f4] text-[#1a1a2e]">
        <nav className="flex items-center justify-between px-8 py-5 border-b border-[#e2e0db] bg-white">
          <button onClick={() => navigate('/dashboard')} className="text-xl font-semibold tracking-tight">
            Lantana
          </button>
        </nav>
        <div className="max-w-2xl mx-auto px-8 py-24 text-center">
          <p className="text-xs uppercase tracking-widest text-[#7a7a9a] mb-4">Complete</p>
          <h1 className="text-3xl font-semibold text-[#1a1a2e] mb-4">Credits added.</h1>
          <p className="text-sm text-[#4a4a6a] mb-8">
            ${selectedAmount.toFixed(2)} in Lantana credits have been added to your account.
          </p>
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
          <p className="text-xs uppercase tracking-widest text-[#7a7a9a] mb-2">Credits</p>
          <h1 className="text-3xl font-semibold text-[#1a1a2e]">Buy Lantana credits</h1>
          <p className="text-sm text-[#4a4a6a] mt-2">
            Credits can be used to purchase gift cards in the marketplace. No cash advance fees.
          </p>
        </div>

        {!clientSecret ? (
          <div className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-[#7a7a9a] mb-3">
                Select amount
              </label>
              <div className="grid grid-cols-5 gap-2 mb-4">
                {PRESET_AMOUNTS.map(a => (
                  <button
                    key={a}
                    onClick={() => { setAmount(a); setCustomAmount('') }}
                    className={`py-3 text-sm border transition-colors ${
                      amount === a && !customAmount
                        ? 'bg-[#1a1a2e] text-white border-[#1a1a2e]'
                        : 'bg-white text-[#1a1a2e] border-[#e2e0db] hover:border-[#1a1a2e]'
                    }`}
                  >
                    ${a}
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={customAmount}
                onChange={e => setCustomAmount(e.target.value)}
                placeholder="Or enter custom amount"
                min="1"
                max="10000"
                className="w-full bg-white border border-[#e2e0db] px-4 py-3 text-sm text-[#1a1a2e] placeholder-[#b0b0c0] focus:outline-none focus:border-[#1a1a2e] transition-colors"
              />
            </div>

            <div className="bg-white border border-[#e2e0db] p-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[#4a4a6a]">Credits purchased</span>
                <span className="text-[#1a1a2e]">${selectedAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#4a4a6a]">Processing fee</span>
                <span className="text-[#1a1a2e]">${(selectedAmount * 0.029 + 0.30).toFixed(2)}</span>
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              onClick={handleContinue}
              disabled={loading}
              className="w-full bg-[#1a1a2e] text-white py-3 text-sm font-semibold hover:bg-[#2d2d4e] transition-colors disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Continue to payment'}
            </button>
          </div>
        ) : (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm amount={selectedAmount} onSuccess={handleSuccess} />
          </Elements>
        )}
      </div>
    </div>
  )
}