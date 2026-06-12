import { SignInButton, SignUpButton } from '@clerk/react'
import { useNavigate } from 'react-router-dom'
import { getBrandImage, SUPPORTED_BRANDS } from '../services/brandImages.ts'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#F6F3F9] text-[#2e1a47]">

      {/* ── Nav ── */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-[#E3DFEF] bg-white shadow-sm">
        <span className="text-lg font-semibold tracking-tight text-[#2e1a47]">Lantana</span>
        <div className="flex items-center gap-8">
          <button
            onClick={() => navigate('/browse')}
            className="text-sm text-[#7c6992] hover:text-[#2e1a47] transition-colors font-medium"
          >
            Browse cards
          </button>
          <SignInButton mode="modal">
            <button className="text-sm text-[#7c6992] hover:text-[#2e1a47] transition-colors font-medium">
              Sign in
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="text-sm bg-[#2e1a47] text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-[#72569C] transition-colors">
              Get started
            </button>
          </SignUpButton>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="border-b border-[#E3DFEF]">
        <div className="max-w-6xl mx-auto px-8 py-24 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#7c6992] mb-6 font-semibold">
              Gift Card Exchange
            </p>
            <h1 className="text-5xl font-light leading-[1.15] text-[#2e1a47] mb-6">
              Turn gift cards into money that works for you.
            </h1>
            <p className="text-base text-[#7c6992] leading-relaxed mb-10 max-w-md">
              Buy, sell, and trade gift cards directly with other people.
              Set your own price, place bids, and get fair value every time.
            </p>
            <div className="flex gap-3 flex-wrap">
              <SignUpButton mode="modal">
                <button className="bg-[#2e1a47] text-white px-7 py-3 text-sm font-semibold rounded-lg hover:bg-[#72569C] transition-colors">
                  Start exchanging
                </button>
              </SignUpButton>
              <button
                onClick={() => navigate('/browse')}
                className="border border-[#AFABC9] text-[#2e1a47] px-7 py-3 text-sm font-semibold rounded-lg hover:border-[#2e1a47] hover:bg-white transition-colors bg-white"
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
              <div
                key={label}
                className="bg-white border border-[#E3DFEF] rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow"
              >
                <p className="text-3xl font-light text-[#2e1a47] mb-1">{value}</p>
                <p className="text-xs uppercase tracking-widest text-[#7c6992] font-semibold">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Scrolling brands ── */}
      <section className="border-b border-[#E3DFEF] bg-white py-6 overflow-hidden">
        <div className="flex gap-4 animate-scroll w-max">
          {[...SUPPORTED_BRANDS, ...SUPPORTED_BRANDS].map((brand, i) => {
            const image = getBrandImage(brand)
            return (
              <div
                key={`${brand}-${i}`}
                className="shrink-0 w-36 h-20 border border-[#E3DFEF] rounded-xl overflow-hidden"
              >
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

      {/* ── How it works ── */}
      <section className="border-b border-[#E3DFEF]">
        <div className="max-w-6xl mx-auto px-8 py-16">
          <p className="text-xs uppercase tracking-widest text-[#7c6992] mb-8 font-semibold">
            How it works
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 border border-[#E3DFEF] rounded-2xl overflow-hidden shadow-sm">
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
                className={`p-10 bg-white hover:bg-[#F6F3F9] transition-colors ${i !== 2 ? 'border-r border-[#E3DFEF]' : ''}`}
              >
                <p className="text-xs text-[#AFABC9] mb-6 font-semibold">{step}</p>
                <h3 className="text-base font-semibold text-[#2e1a47] mb-3">{title}</h3>
                <p className="text-sm text-[#7c6992] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Lantana ── */}
      <section className="border-b border-[#E3DFEF] bg-white">
        <div className="max-w-6xl mx-auto px-8 py-16">
          <p className="text-xs uppercase tracking-widest text-[#7c6992] mb-10 font-semibold">
            Why Lantana
          </p>
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
                <h3 className="text-sm font-semibold text-[#2e1a47] mb-3">{title}</h3>
                <p className="text-sm text-[#7c6992] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="bg-[#2e1a47]">
        <div className="max-w-6xl mx-auto px-8 py-20 flex items-center justify-between gap-8 flex-wrap">
          <div>
            <h2 className="text-2xl font-light text-white mb-2">
              Ready to get started?
            </h2>
            <p className="text-sm text-[#AFABC9]">
              Join thousands of people buying and selling gift cards at fair prices.
            </p>
          </div>
          <SignUpButton mode="modal">
            <button className="bg-white text-[#2e1a47] px-8 py-3 text-sm font-semibold rounded-lg hover:bg-[#F6F3F9] transition-colors shrink-0">
              Create free account
            </button>
          </SignUpButton>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#E3DFEF] px-8 py-8 flex items-center justify-between bg-white">
        <span className="text-sm font-semibold text-[#2e1a47]">Lantana</span>
        <span className="text-xs text-[#AFABC9]">© 2026 Lantana. Secure. Straightforward. Fast.</span>
      </footer>

    </div>
  )
}