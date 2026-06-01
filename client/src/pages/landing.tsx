import { SignInButton, SignUpButton } from '@clerk/react'

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#f8f7f4] text-[#1a1a2e]">

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-[#e2e0db]">
        <span className="text-xl font-semibold tracking-tight text-[#1a1a2e]">Lantana</span>
        <div className="flex items-center gap-6">
          <SignInButton mode="modal">
            <button className="text-sm text-[#4a4a6a] hover:text-[#1a1a2e] transition-colors">
              Sign in
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="text-sm bg-[#1a1a2e] text-white px-4 py-2 hover:bg-[#2d2d4e] transition-colors">
              Get started
            </button>
          </SignUpButton>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-8 pt-24 pb-20">
        <p className="text-xs uppercase tracking-widest text-[#7a7a9a] mb-6">
          Gift Card Exchange
        </p>
        <h1 className="text-5xl font-semibold leading-tight text-[#1a1a2e] mb-6 max-w-2xl">
          Turn gift cards into money that works for you.
        </h1>
        <p className="text-lg text-[#4a4a6a] max-w-xl leading-relaxed mb-10">
          Exchange unwanted gift cards for cash, credits, or other gift cards. 
          Fast, secure, and straightforward.
        </p>
        <SignUpButton mode="modal">
          <button className="bg-[#1a1a2e] text-white px-8 py-3 text-sm hover:bg-[#2d2d4e] transition-colors">
            Start exchanging
          </button>
        </SignUpButton>
      </section>

      {/* Divider */}
      <div className="border-t border-[#e2e0db]" />

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-8 py-20">
        <p className="text-xs uppercase tracking-widest text-[#7a7a9a] mb-12">
          How it works
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            {
              step: '01',
              title: 'Submit your card',
              desc: 'Enter your gift card details. We verify the balance securely.'
            },
            {
              step: '02',
              title: 'Choose your payout',
              desc: 'Trade for another card, collect Lantana credits, or cash out directly.'
            },
            {
              step: '03',
              title: 'Get paid',
              desc: 'Receive funds via ACH, PayPal, crypto, or spend credits instantly.'
            }
          ].map(({ step, title, desc }) => (
            <div key={step}>
              <p className="text-xs text-[#7a7a9a] mb-3">{step}</p>
              <h3 className="text-base font-semibold text-[#1a1a2e] mb-2">{title}</h3>
              <p className="text-sm text-[#4a4a6a] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-[#e2e0db]" />

      {/* Supported brands */}
      <section className="max-w-4xl mx-auto px-8 py-20">
        <p className="text-xs uppercase tracking-widest text-[#7a7a9a] mb-8">
          Accepted brands
        </p>
        <div className="flex flex-wrap gap-3">
          {['Amazon', 'Visa', 'Mastercard', 'Target', 'Walmart', 'Best Buy', 'Steam', 'Apple', 'Google Play', 'Nike', 'Starbucks', 'Sephora'].map(brand => (
            <span key={brand} className="text-sm text-[#4a4a6a] border border-[#e2e0db] px-4 py-2">
              {brand}
            </span>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e2e0db] px-8 py-8 flex items-center justify-between">
        <span className="text-sm text-[#7a7a9a]">© 2026 Lantana</span>
        <span className="text-xs text-[#7a7a9a]">Secure. Straightforward. Fast.</span>
      </footer>

    </div>
  )
}