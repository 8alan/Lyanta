import { SignInButton, SignUpButton } from '@clerk/react'
import { useNavigate } from 'react-router-dom'
import { getBrandImage, SUPPORTED_BRANDS } from '../services/brandImages.ts'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-[#1a1a2e]">

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-[#e2e0db] bg-[#f8f7f4]">
        <span className="text-lg font-semibold tracking-tight">Lantana</span>
        <div className="flex items-center gap-8">
          <button
            onClick={() => navigate('/browse')}
            className="text-sm text-[#4a4a6a] hover:text-[#1a1a2e] transition-colors"
          >
            Browse cards
          </button>
          <SignInButton mode="modal">
            <button className="text-sm text-[#4a4a6a] hover:text-[#1a1a2e] transition-colors">
              Sign in
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="text-sm bg-[#1a1a2e] text-white px-5 py-2 hover:bg-[#2d2d4e] transition-colors">
              Get started
            </button>
          </SignUpButton>
        </div>
      </nav>

      {/* Hero */}
      <section className="border-b border-[#e2e0db]">
        <div className="max-w-6xl mx-auto px-8 py-24 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#7a7a9a] mb-6">
              Gift Card Exchange
            </p>
            <h1 className="text-5xl font-semibold leading-[1.15] text-[#1a1a2e] mb-6">
              Turn gift cards into money that works for you.
            </h1>
            <p className="text-base text-[#4a4a6a] leading-relaxed mb-10 max-w-md">
              Buy, sell, and trade gift cards directly with other people. 
              Set your own price, place bids, and get fair value every time.
            </p>
            <div className="flex gap-3">
              <SignUpButton mode="modal">
                <button className="bg-[#1a1a2e] text-white px-7 py-3 text-sm font-medium hover:bg-[#2d2d4e] transition-colors">
                  Start exchanging
                </button>
              </SignUpButton>
              <button
                onClick={() => navigate('/browse')}
                className="border border-[#e2e0db] text-[#1a1a2e] px-7 py-3 text-sm font-medium hover:border-[#1a1a2e] transition-colors bg-white"
              >
                Browse listings
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: '29+', label: 'Supported brands' },
              { value: '0%', label: 'Cash advance fees' },
              { value: 'P2P', label: 'Direct trades' },
              { value: 'Fast', label: 'Verified payouts' },
            ].map(({ value, label }) => (
              <div key={label} className="bg-white border border-[#e2e0db] p-8">
                <p className="text-3xl font-semibold text-[#1a1a2e] mb-1">{value}</p>
                <p className="text-xs uppercase tracking-widest text-[#7a7a9a]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scrolling brands — contained */}
      <section className="border-b border-[#e2e0db] bg-white py-6 overflow-hidden">
        <div className="flex gap-4 animate-scroll w-max">
          {[...SUPPORTED_BRANDS, ...SUPPORTED_BRANDS].map((brand, i) => {
            const image = getBrandImage(brand)
            return (
              <div key={`${brand}-${i}`} className="shrink-0 w-36 h-20 border border-[#e2e0db] overflow-hidden">
                <img
                  src={image ?? ''}
                  alt={brand}
                  className="w-full h-full object-cover"
                />
              </div>
            )
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-[#e2e0db]">
        <div className="max-w-6xl mx-auto px-8 py-12">
          <p className="text-xs uppercase tracking-widest text-[#7a7a9a] mb-6">How it works</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-[#e2e0db]">
            {[
              {
                step: '01',
                title: 'List your card',
                desc: 'Submit your gift card details. Set a buy now price, minimum bid, or accept card trades.'
              },
              {
                step: '02',
                title: 'Receive offers',
                desc: 'Buyers browse your listing and place cash bids or offer their own cards in exchange.'
              },
              {
                step: '03',
                title: 'Complete the trade',
                desc: 'Accept the best offer. Card details transfer securely once the deal is confirmed.'
              }
            ].map(({ step, title, desc }, i) => (
              <div
                key={step}
                className={`p-10 bg-white ${i !== 2 ? 'border-r border-[#e2e0db]' : ''}`}
              >
                <p className="text-xs text-[#7a7a9a] mb-6">{step}</p>
                <h3 className="text-base font-semibold text-[#1a1a2e] mb-3">{title}</h3>
                <p className="text-sm text-[#4a4a6a] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust section */}
      <section className="border-b border-[#e2e0db] bg-white">
        <div className="max-w-6xl mx-auto px-8 py-12">
          <p className="text-xs uppercase tracking-widest text-[#7a7a9a] mb-6">Why Lantana</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                title: 'Fair market pricing',
                desc: 'Prices are set by real buyers and sellers, not algorithms. You always get what the market actually pays.'
              },
              {
                title: 'Verified listings',
                desc: 'Every card is reviewed before going live. No scams, no expired cards, no surprises.'
              },
              {
                title: 'No cash advance fees',
                desc: 'Buy gift cards directly without triggering cash advance fees on your credit card.'
              }
            ].map(({ title, desc }) => (
              <div key={title}>
                <h3 className="text-sm font-semibold text-[#1a1a2e] mb-3">{title}</h3>
                <p className="text-sm text-[#4a4a6a] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1a1a2e]">
        <div className="max-w-6xl mx-auto px-8 py-20 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              Ready to get started?
            </h2>
            <p className="text-sm text-gray-400">
              Join thousands of people buying and selling gift cards at fair prices.
            </p>
          </div>
          <SignUpButton mode="modal">
            <button className="bg-white text-[#1a1a2e] px-8 py-3 text-sm font-medium hover:bg-gray-100 transition-colors shrink-0">
              Create free account
            </button>
          </SignUpButton>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e2e0db] px-8 py-8 flex items-center justify-between bg-[#f8f7f4]">
        <span className="text-sm font-semibold text-[#1a1a2e]">Lantana</span>
        <span className="text-xs text-[#7a7a9a]">© 2026 Lantana. Secure. Straightforward. Fast.</span>
      </footer>

    </div>
  )
}