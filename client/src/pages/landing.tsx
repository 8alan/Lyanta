import { SignInButton, SignUpButton } from '@clerk/react'
import { useNavigate } from 'react-router-dom'
import { getBrandImage, SUPPORTED_BRANDS } from '../services/brandImages.ts'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#F6F3F9] text-[#2e1a47]">

      {/* ── Floating Pill Nav ── */}
      <div className="sticky top-4 z-50 flex justify-center px-4 sm:px-8">
        <nav className="flex items-center justify-between w-full max-w-5xl bg-white px-5 py-3 rounded-2xl shadow-[0_2px_3px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.10)]">
          <span className="font-display text-xl text-[#2e1a47] tracking-tight">Lantana</span>
          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={() => navigate('/browse')} className="text-sm text-[#7c6992] hover:text-[#2e1a47] transition-colors font-medium px-3 py-1.5 rounded-lg hover:bg-[#F6F3F9]">
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
            <div className="inline-flex items-center gap-2 bg-white border border-[#E3DFEF] rounded-full px-4 py-1.5 mb-8 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#72569C]" />
              <span className="text-xs font-semibold tracking-widest uppercase text-[#7c6992]">
                Gift Card Exchange
              </span>
            </div>
            <h1 className="font-display text-5xl sm:text-6xl font-normal leading-[1.05] text-[#2e1a47] mb-6">
              Don't let your value sit.
            </h1>
            <p className="text-base text-[#7c6992] leading-relaxed mb-10 max-w-md">
              Buy, sell, and trade gift cards directly with real people.
              Set your own price, place bids, and put your cards to work.
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

          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: 'Dozens', label: 'Supported brands' },
              { value: '0%',     label: 'Cash advance fees' },
              { value: 'P2P',    label: 'Direct trades' },
              { value: 'Fast',   label: 'Verified payouts' },
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

      {/* ── Scrolling brands — dual row with fade ── */}
      <section className="relative bg-[#F6F3F9] py-8 overflow-hidden">
        {/* Left fade — very strong */}
        <div
          className="absolute left-0 top-0 h-full w-64 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, #F6F3F9 0%, #F6F3F9 30%, transparent 100%)' }}
        />
        {/* Right fade — very strong */}
        <div
          className="absolute right-0 top-0 h-full w-64 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, #F6F3F9 0%, #F6F3F9 30%, transparent 100%)' }}
        />

        {/* Row 1 — left to right */}
        <div className="flex gap-3 animate-scroll w-max mb-3">
          {[...SUPPORTED_BRANDS, ...SUPPORTED_BRANDS].map((brand, i) => {
            const image = getBrandImage(brand)
            return (
              <div
                key={`row1-${brand}-${i}`}
                className="shrink-0 w-28 h-16 border border-[#E3DFEF] rounded-xl overflow-hidden shadow-sm"
              >
                <img src={image ?? ''} alt={brand} className="w-full h-full object-cover" />
              </div>
            )
          })}
        </div>

        {/* Row 2 — right to left */}
        <div className="flex gap-3 animate-scroll-reverse w-max">
          {[...SUPPORTED_BRANDS, ...SUPPORTED_BRANDS].reverse().map((brand, i) => {
            const image = getBrandImage(brand)
            return (
              <div
                key={`row2-${brand}-${i}`}
                className="shrink-0 w-28 h-16 border border-[#E3DFEF] rounded-xl overflow-hidden shadow-sm"
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
            <span className="text-xs font-semibold tracking-widest uppercase text-[#7c6992]">How it works</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { step: '01', title: 'List your card',     desc: 'Submit your gift card details. Set a buy now price, minimum bid, or accept card trades.' },
              { step: '02', title: 'Receive offers',     desc: 'Buyers browse your listing and place cash bids or offer their own cards in exchange.' },
              { step: '03', title: 'Complete the trade', desc: 'Accept the best offer. Card details transfer securely once the deal is confirmed.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="bg-white border border-[#E3DFEF] rounded-2xl p-8 shadow-[0_2px_3px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] hover:bg-[#F6F3F9] transition-all">
                <p className="font-display text-4xl font-normal text-[#E3DFEF] mb-6">{step}</p>
                <h3 className="text-base font-semibold text-[#2e1a47] mb-3">{title}</h3>
                <p className="text-sm text-[#7c6992] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── The Gift Card Problem (replaces Why Lantana) ── */}
      <section className="py-20 px-4 sm:px-8 bg-white border-y border-[#E3DFEF]">
        <div className="max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#F6F3F9] border border-[#E3DFEF] rounded-full px-4 py-1.5 mb-10 shadow-sm">
            <span className="text-xs font-semibold tracking-widest uppercase text-[#7c6992]">The problem</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="font-display text-4xl sm:text-5xl font-normal text-[#2e1a47] leading-tight mb-6">
                Billions in gift cards go to waste every year.
              </h2>
              <p className="text-base text-[#7c6992] leading-relaxed">
                Roughly <span className="font-semibold text-[#2e1a47]">43% of American adults</span> are currently sitting on unused or partially spent gift cards. Between <span className="font-semibold text-[#2e1a47]">10–19% of all gift card balances</span> are never redeemed — and up to <span className="font-semibold text-[#2e1a47]">6% are never touched at all</span>. That's real money collecting dust.
              </p>
              <p className="text-base text-[#7c6992] leading-relaxed mt-4">
                Lantana exists so your value doesn't go to waste.
              </p>
            </div>

            {/* Visual stat blocks — Modash bento style */}
            <div className="grid grid-cols-2 gap-4">
              {/* Big stat card */}
              <div className="col-span-2 bg-[#2e1a47] rounded-2xl p-8 flex flex-col justify-between shadow-[0_4px_16px_rgba(46,26,71,0.20)]">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#AFABC9] mb-3">Americans with unused cards</p>
                <p className="font-display text-6xl font-normal text-white leading-none">43%</p>
                <p className="text-sm text-[#AFABC9] mt-3">of adults are holding gift card value they haven't spent</p>
              </div>
              {/* Small stat card 1 */}
              <div className="bg-[#F6F3F9] border border-[#E3DFEF] rounded-2xl p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#7c6992] mb-2">Never used</p>
                <p className="font-display text-4xl font-normal text-[#2e1a47] leading-none">~6%</p>
                <p className="text-xs text-[#AFABC9] mt-2">of all cards never redeemed</p>
              </div>
              {/* Small stat card 2 */}
              <div className="bg-[#F6F3F9] border border-[#E3DFEF] rounded-2xl p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#7c6992] mb-2">Unspent balance</p>
                <p className="font-display text-4xl font-normal text-[#2e1a47] leading-none">19%</p>
                <p className="text-xs text-[#AFABC9] mt-2">of gift card value left unspent</p>
              </div>
            </div>
          </div>

          {/* Value props row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Fair market pricing',  desc: 'Prices set by real buyers and sellers, not algorithms. You always get what the market actually pays.' },
              { title: 'Verified listings',    desc: 'Every card is reviewed before going live. No scams, no expired cards, no surprises.' },
              { title: 'No cash advance fees', desc: 'Buy gift cards directly without triggering cash advance fees on your credit card.' },
            ].map(({ title, desc }) => (
              <div key={title} className="bg-[#F6F3F9] border border-[#E3DFEF] rounded-2xl p-8 shadow-sm">
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

      {/* ── CTA Banner ── */}
      <section className="py-20 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-[#2e1a47] rounded-3xl px-8 sm:px-16 py-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 shadow-[0_6px_24px_rgba(46,26,71,0.25)]">
            <div>
              <h2 className="font-display text-4xl font-normal text-white mb-3 leading-tight">
                Ready to get started?
              </h2>
              <p className="text-sm text-[#AFABC9] max-w-sm">
                Join thousands of people turning unused gift cards into real value.
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
      <footer className="border-t border-[#E3DFEF] bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-16">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 mb-12">

            {/* Brand col */}
            <div className="col-span-2 sm:col-span-1">
              <span className="font-display text-xl text-[#2e1a47] block mb-3">Lantana</span>
              <p className="text-xs text-[#AFABC9] leading-relaxed max-w-xs">
                The P2P gift card exchange. Trade smarter, waste nothing.
              </p>
            </div>

            {/* Product */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#2e1a47] mb-4">Product</p>
              <ul className="space-y-3">
                {['Browse cards', 'Sell a card', 'How it works', 'Pricing'].map(link => (
                  <li key={link}>
                    <button onClick={() => navigate('/browse')} className="text-sm text-[#7c6992] hover:text-[#2e1a47] transition-colors text-left">
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#2e1a47] mb-4">Company</p>
              <ul className="space-y-3">
                {['About us', 'Blog', 'Careers', 'Contact us'].map(link => (
                  <li key={link}>
                    <button className="text-sm text-[#7c6992] hover:text-[#2e1a47] transition-colors text-left">
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#2e1a47] mb-4">Legal</p>
              <ul className="space-y-3">
                {['Privacy policy', 'Terms of service', 'Cookie policy', 'Security'].map(link => (
                  <li key={link}>
                    <button className="text-sm text-[#7c6992] hover:text-[#2e1a47] transition-colors text-left">
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Footer bottom bar */}
          <div className="border-t border-[#E3DFEF] pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <span className="text-xs text-[#AFABC9]">© 2026 Lantana. Secure. Straightforward. Fast.</span>
            <div className="flex items-center gap-6">
              <button className="text-xs text-[#AFABC9] hover:text-[#7c6992] transition-colors">Privacy</button>
              <button className="text-xs text-[#AFABC9] hover:text-[#7c6992] transition-colors">Terms</button>
              <button className="text-xs text-[#AFABC9] hover:text-[#7c6992] transition-colors">Contact</button>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}