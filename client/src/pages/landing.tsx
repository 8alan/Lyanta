import { SignInButton, SignUpButton } from '@clerk/react'
import { useNavigate } from 'react-router-dom'
import { getBrandImage, SUPPORTED_BRANDS } from '../services/brandImages.ts'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#F6F3F9] text-[#2e1a47]">

      {/* ── Floating Pill Nav ── */}
      <div className="sticky top-4 z-50 flex justify-center px-4 sm:px-8 pt-8">
        <nav className="flex items-center justify-between w-full max-w-5xl bg-white px-4 py-3 rounded-2xl shadow-[0_2px_3px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.10)]">
          <span className="font-display text-xl text-[#2e1a47] tracking-tight shrink-0">Lyanta</span>
          <div className="flex items-center gap-1 sm:gap-4">
            <button onClick={() => navigate('/browse')} className="hidden sm:block text-sm text-[#7c6992] hover:text-[#2e1a47] transition-colors font-medium px-3 py-1.5 rounded-lg hover:bg-[#F6F3F9]">
              Browse cards
            </button>
            <SignInButton mode="modal">
              <button className="text-sm text-[#7c6992] hover:text-[#2e1a47] transition-colors font-medium px-3 py-1.5 rounded-lg hover:bg-[#F6F3F9] whitespace-nowrap">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="text-sm bg-[#2e1a47] text-white px-4 py-2 rounded-full font-semibold hover:bg-[#72569C] transition-colors whitespace-nowrap">
                Get started
              </button>
            </SignUpButton>
          </div>
        </nav>
      </div>

      {/* ── Hero ── */}
      <section className="px-3 pt-2 pb-8">
        <div className="px-3 -mt-16 relative z-0">
          <div
            className="bg-[#2e1a47] rounded-3xl shadow-[0_6px_24px_rgba(46,26,71,0.25)]"
            style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '8rem 1.5rem 4rem' }}
          >
            <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto">
              <h1
                className="font-display font-normal text-white tracking-tight mb-6 uppercase"
                style={{ fontSize: 'clamp(2.2rem, 8vw, 6rem)', letterSpacing: '-0.02em', lineHeight: '90%' }}
              >
                <span className="block">Stop letting your</span>
                <span className="block">money go to waste</span>
              </h1>
              <p className="text-base sm:text-lg font-semibold text-white leading-relaxed max-w-lg px-2">
                Buy, sell, and trade gift cards directly with real people.<br className="hidden sm:block"/>
                Set your own price, place bids, and put your cards to work.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10 w-full sm:w-auto">
                <SignUpButton mode="modal">
                  <button className="bg-white text-[#2e1a47] px-6 py-3 text-sm font-bold rounded-xl hover:bg-[#F6F3F9] transition-colors shadow-sm w-full sm:w-auto">
                    Start exchanging
                  </button>
                </SignUpButton>
                <button
                  onClick={() => navigate('/browse')}
                  className="bg-[#4a3566] text-white px-6 py-3 text-sm font-semibold rounded-xl hover:bg-[#5a4178] transition-colors w-full sm:w-auto"
                >
                  Browse listings
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Scrolling brands ── */}
      <section className="relative bg-[#F6F3F9] py-8 overflow-hidden">
        <div className="flex justify-center mb-8 relative z-20 px-4">
          <p className="font-display text-2xl sm:text-3xl font-normal text-[#2e1a47] text-center">
            Support for dozens of brands
          </p>
        </div>
        <div
          className="absolute left-0 top-0 h-full z-10 pointer-events-none"
          style={{ width: 'clamp(60px, 15vw, 400px)', background: 'linear-gradient(to right, #F6F3F9 0%, #F6F3F9 80%, transparent 100%)' }}
        />
        <div
          className="absolute right-0 top-0 h-full z-10 pointer-events-none"
          style={{ width: 'clamp(60px, 15vw, 400px)', background: 'linear-gradient(to left, #F6F3F9 0%, #F6F3F9 80%, transparent 100%)' }}
        />
        <div className="flex gap-3 animate-scroll w-max mb-3">
          {[...SUPPORTED_BRANDS, ...SUPPORTED_BRANDS].map((brand, i) => {
            const image = getBrandImage(brand)
            return (
              <div key={`row1-${brand}-${i}`} className="shrink-0 w-24 sm:w-28 h-14 sm:h-16 border border-[#E3DFEF] rounded-xl overflow-hidden shadow-sm">
                <img src={image ?? ''} alt={brand} className="w-full h-full object-cover" />
              </div>
            )
          })}
        </div>
        <div className="flex gap-3 animate-scroll-reverse w-max">
          {[...SUPPORTED_BRANDS, ...SUPPORTED_BRANDS].reverse().map((brand, i) => {
            const image = getBrandImage(brand)
            return (
              <div key={`row2-${brand}-${i}`} className="shrink-0 w-24 sm:w-28 h-14 sm:h-16 border border-[#E3DFEF] rounded-xl overflow-hidden shadow-sm">
                <img src={image ?? ''} alt={brand} className="w-full h-full object-cover" />
              </div>
            )
          })}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-16 sm:py-20 px-4 sm:px-8">
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
              <div key={step} className="bg-white border border-[#E3DFEF] rounded-2xl p-6 sm:p-8 shadow-[0_2px_3px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)] hover:bg-[#F6F3F9] transition-all">
                <p className="font-display text-4xl font-normal text-[#E3DFEF] mb-6">{step}</p>
                <h3 className="text-base font-semibold text-[#2e1a47] mb-3">{title}</h3>
                <p className="text-sm text-[#7c6992] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── The Gift Card Problem ── */}
      <section className="py-16 sm:py-20 px-4 sm:px-8 bg-white border-y border-[#E3DFEF]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-12 items-center mb-12 sm:mb-16">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-normal text-[#2e1a47] leading-tight mb-6">
                Billions in gift cards go to waste every year.
              </h2>
              <p className="text-base text-[#7c6992] leading-relaxed">
                Roughly <span className="font-semibold text-[#2e1a47]">43% of American adults</span> are currently sitting on unused or partially spent gift cards. Between <span className="font-semibold text-[#2e1a47]">10–19% of all gift card balances</span> are never redeemed — and up to <span className="font-semibold text-[#2e1a47]">6% are never touched at all</span>. That's real money collecting dust.
              </p>
              <p className="text-base text-[#7c6992] leading-relaxed mt-4">
                Lyanta exists so your value doesn't go to waste.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 bg-[#2e1a47] rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-[0_4px_16px_rgba(46,26,71,0.20)]">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#AFABC9] mb-3">Americans with unused cards</p>
                <p className="font-display text-5xl sm:text-6xl font-normal text-white leading-none">43%</p>
                <p className="text-sm text-[#AFABC9] mt-3">of adults are holding gift card value they haven't spent</p>
              </div>
              <div className="bg-[#F6F3F9] border border-[#E3DFEF] rounded-2xl p-4 sm:p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#7c6992] mb-2">Never used</p>
                <p className="font-display text-3xl sm:text-4xl font-normal text-[#2e1a47] leading-none">~6%</p>
                <p className="text-xs text-[#AFABC9] mt-2">of all cards never redeemed</p>
              </div>
              <div className="bg-[#F6F3F9] border border-[#E3DFEF] rounded-2xl p-4 sm:p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#7c6992] mb-2">Unspent balance</p>
                <p className="font-display text-3xl sm:text-4xl font-normal text-[#2e1a47] leading-none">19%</p>
                <p className="text-xs text-[#AFABC9] mt-2">of gift card value left unspent</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Fair market pricing',  desc: 'Prices set by real buyers and sellers, not algorithms. You always get what the market actually pays.' },
              { title: 'Verified listings',    desc: 'Every card is reviewed before going live. No scams, no expired cards, no surprises.' },
              { title: 'No cash advance fees', desc: 'Buy gift cards directly without triggering cash advance fees on your credit card.' },
            ].map(({ title, desc }) => (
              <div key={title} className="bg-[#F6F3F9] border border-[#E3DFEF] rounded-2xl p-6 sm:p-8 shadow-sm">
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
      <div className="relative z-10 bg-[#F6F3F9]">
        <section className="py-16 sm:py-20 px-4 sm:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-[#2e1a47] rounded-3xl px-6 sm:px-16 py-12 sm:py-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 shadow-[0_6px_24px_rgba(46,26,71,0.25)]">
              <div>
                <h2 className="font-display text-3xl sm:text-4xl font-normal text-white mb-3 leading-tight">
                  Ready to get started?
                </h2>
                <p className="text-sm text-[#AFABC9] max-w-sm">
                  Join thousands of people turning unused gift cards into real value.
                </p>
              </div>
              <SignUpButton mode="modal">
                <button className="bg-white text-[#2e1a47] px-8 py-3 text-sm font-semibold rounded-full hover:bg-[#F6F3F9] transition-colors w-full sm:w-auto shadow-sm">
                  Create free account
                </button>
              </SignUpButton>
            </div>
          </div>
        </section>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-[#E3DFEF] bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-10 mb-10 sm:mb-12">
            <div className="col-span-2 sm:col-span-1">
              <span className="font-display text-xl text-[#2e1a47] block mb-3">Lyanta</span>
              <p className="text-xs text-[#AFABC9] leading-relaxed max-w-xs">
                The P2P gift card exchange. Trade smarter, waste nothing.
              </p>
            </div>
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
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#2e1a47] mb-4">Company</p>
              <ul className="space-y-3">
                {['About us', 'Blog', 'Careers', 'Contact us'].map(link => (
                  <li key={link}>
                    <button
                      onClick={() => link === 'Contact us' ? navigate('/help') : undefined}
                      className="text-sm text-[#7c6992] hover:text-[#2e1a47] transition-colors text-left"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#2e1a47] mb-4">Legal</p>
              <ul className="space-y-3">
                {['Privacy policy', 'Terms of service', 'Cookie policy', 'Security'].map(link => (
                  <li key={link}>
                    <button
                      onClick={() => link === 'Privacy policy' ? navigate('/privacy-policy') : undefined}
                      className="text-sm text-[#7c6992] hover:text-[#2e1a47] transition-colors text-left"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-[#E3DFEF] pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <span className="text-xs text-[#AFABC9]">© 2026 Lyanta. Secure. Straightforward. Fast.</span>
            <div className="flex items-center gap-6">
              <button onClick={() => navigate('/privacy-policy')} className="text-xs text-[#AFABC9] hover:text-[#7c6992] transition-colors">Privacy</button>
              <button className="text-xs text-[#AFABC9] hover:text-[#7c6992] transition-colors">Terms</button>
              <button onClick={() => navigate('/help')} className="text-xs text-[#AFABC9] hover:text-[#7c6992] transition-colors">Contact</button>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}