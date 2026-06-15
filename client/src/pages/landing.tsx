import { SignInButton, SignUpButton } from '@clerk/react'
import { useNavigate } from 'react-router-dom'
import { getBrandImage, SUPPORTED_BRANDS } from '../services/brandImages.ts'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#F6F3F9] text-[#2e1a47]">

      {/* ── Floating Pill Nav (Modash-style) ── */}
      <div className="sticky top-4 z-50 flex justify-center px-4 sm:px-8">
        <nav className="flex items-center justify-between w-full max-w-5xl bg-white px-5 py-3 rounded-2xl shadow-[0_2px_3px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.10)]">
          <span className="font-display text-xl text-[#2e1a47] tracking-tight">Lantana</span>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => navigate('/browse')}
              className="text-sm text-[#7c6992] hover:text-[#2e1a47] transition-colors font-medium px-3 py-1.5 rounded-lg hover:bg-[#F6F3F9]"
            >
              Browse cards
            </button>
            <SignInButton mode="modal">
              <button className="text-sm text-[#7c6992] hover:text-[#2e1a47] transition-colors font-medium px-3 py-1.5 rounded-lg hover:bg-[#F6F3F9]">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="text-sm bg-[#2e1a47] text-white px-5 py-2 rounded-full font-semibold hover:bg-[#72569C] transition-colors">
                Get started
              </button>
            </SignUpButton>
          </div>
        </nav>
      </div>

      {/* ── Hero ── */}
      <section className="pt-16 pb-24 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            {/* Modash-style pill eyebrow tag */}
            <div className="inline-flex items-center gap-2 bg-white border border-[#E3DFEF] rounded-full px-4 py-1.5 mb-8 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#72569C]" />
              <span className="text-xs font-semibold tracking-widest uppercase text-[#7c6992]">
                Gift Card Exchange
              </span>
            </div>
            <h1 className="font-display text-5xl sm:text-6xl font-normal leading-[1.05] text-[#2e1a47] mb-6">
              Turn gift cards into money that works for you.
            </h1>
            <p className="text-base text-[#7c6992] leading-relaxed mb-10 max-w-md">
              Buy, sell, and trade gift cards directly with other people.
              Set your own price, place bids, and get fair value every time.
            </p>
            <div className="flex gap-3 flex-wrap">
              <SignUpButton mode="modal">
                <button className="bg-[#2e1a47] text-white px-7 py-3 text-sm font-semibold rounded-full hover:bg-[#72569C] transition-colors shadow-sm">
                  Start exchanging
                </button>
              </SignUpButton>
              <button
                onClick={() => navigate('/browse')}
                className="border border-[#AFABC9] text-[#2e1a47] px-7 py-3 text-sm font-semibold rounded-full hover:border-[#2e1a47] hover:bg-white transition-colors bg-white shadow-sm"
              >
                Browse listings
              </button>
            </div>
          </div>

          {/* Modash-style floating stat cards */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: '29+', label: 'Supported brands' },
              { value: '0%',  label: 'Cash advance fees' },
              { value: 'P2P', label: 'Direct trades' },
              { value: 'Fast', label: 'Verified payouts' },
            ].map(({ value, label }) => (
              <div
                key={label}
                className="bg-white border border-[#E3DFEF] rounded-2xl p-8 shadow-[0_2px_3px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.10)] transition-shadow"
              >
                <p className="font-display text-4xl font-normal text-[#2e1a47] mb-1">{value}</p>
                <p className="text-xs uppercase tracking-widest text-[#7c6992] font-semibold">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Scrolling brands ── */}
      <section className="border-y border-[#E3DFEF] bg-white py-6 overflow-hidden">
        <div className="flex gap-4 animate-scroll w-max">
          {[...SUPPORTED_BRANDS, ...SUPPORTED_BRANDS].map((brand, i) => {
            const image = getBrandImage(brand)
            return (
              <div
                key={`${brand}-${i}`}
                className="shrink-0 w-36 h-20 border border-[#E3DFEF] rounded-2xl overflow-hidden shadow-sm"
              >
                <img src={image ?? ''} alt={brand} className="w-full h-full object-cover" />
              </div>
            )
          })}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white border border-[#E3DFEF] rounded-full px-4 py-1.5 mb-8 shadow-sm">
            <span className="text-xs font-semibold tracking-widest uppercase text-[#7c6992]">
              How it works
            </span>
          </div>
          {/* Modash-style card grid with floating shadows */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { step: '01', title: 'List your card',      desc: 'Submit your gift card details. Set a buy now price, minimum bid, or accept card trades.' },
              { step: '02', title: 'Receive offers',      desc: 'Buyers browse your listing and place cash bids or offer their own cards in exchange.' },
              { step: '03', title: 'Complete the trade',  desc: 'Accept the best offer. Card details transfer securely once the deal is confirmed.' },
            ].map(({ step, title, desc }) => (
              <div
                key={step}
                className="bg-white border border-[#E3DFEF] rounded-2xl p-8 shadow-[0_2px_3px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] hover:bg-[#F6F3F9] transition-all"
              >
                <p className="font-display text-4xl font-normal text-[#E3DFEF] mb-6">{step}</p>
                <h3 className="text-base font-semibold text-[#2e1a47] mb-3">{title}</h3>
                <p className="text-sm text-[#7c6992] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Lantana ── */}
      <section className="py-20 px-4 sm:px-8 bg-white border-y border-[#E3DFEF]">
        <div className="max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#F6F3F9] border border-[#E3DFEF] rounded-full px-4 py-1.5 mb-10 shadow-sm">
            <span className="text-xs font-semibold tracking-widest uppercase text-[#7c6992]">
              Why Lantana
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Fair market pricing',    desc: 'Prices are set by real buyers and sellers, not algorithms. You always get what the market actually pays.' },
              { title: 'Verified listings',      desc: 'Every card is reviewed before going live. No scams, no expired cards, no surprises.' },
              { title: 'No cash advance fees',   desc: 'Buy gift cards directly without triggering cash advance fees on your credit card.' },
            ].map(({ title, desc }) => (
              <div
                key={title}
                className="bg-[#F6F3F9] border border-[#E3DFEF] rounded-2xl p-8 shadow-sm"
              >
                {/* Modash-style accent dot */}
                <div className="w-8 h-8 rounded-full bg-[#E3DFEF] flex items-center justify-center mb-5">
                  <div className="w-3 h-3 rounded-full bg-[#72569C]" />
                </div>
                <h3 className="text-sm font-semibold text-[#2e1a47] mb-3">{title}</h3>
                <p className="text-sm text-[#7c6992] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner (Modash dark card style) ── */}
      <section className="py-20 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-[#2e1a47] rounded-3xl px-8 sm:px-16 py-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 shadow-[0_6px_24px_rgba(46,26,71,0.25)]">
            <div>
              <h2 className="font-display text-4xl font-normal text-white mb-3 leading-tight">
                Ready to get started?
              </h2>
              <p className="text-sm text-[#AFABC9] max-w-sm">
                Join thousands of people buying and selling gift cards at fair prices.
              </p>
            </div>
            <SignUpButton mode="modal">
              <button className="bg-white text-[#2e1a47] px-8 py-3 text-sm font-semibold rounded-full hover:bg-[#F6F3F9] transition-colors shrink-0 shadow-sm">
                Create free account
              </button>
            </SignUpButton>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#E3DFEF] px-8 py-8 flex items-center justify-between bg-white">
        <span className="font-display text-lg text-[#2e1a47]">Lantana</span>
        <span className="text-xs text-[#AFABC9]">© 2026 Lantana. Secure. Straightforward. Fast.</span>
      </footer>

    </div>
  )
}