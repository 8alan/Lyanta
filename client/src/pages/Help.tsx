import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi } from '../services/api.ts'

const FAQS = [
  {
    section: 'Buying',
    questions: [
      {
        q: 'How do I purchase a gift card?',
        a: 'Browse listings on the marketplace, select a card you want, and either buy it instantly at the listed price or make an offer. Once accepted, the card details will be sent to your email.'
      },
      {
        q: 'Is it safe to buy gift cards on Lyanta?',
        a: 'All cards on Lyanta are verified before being listed. We check balances and card validity to ensure you receive what you paid for.'
      },
      {
        q: 'What happens after my offer is accepted?',
        a: 'Once your offer is accepted, the trade is initiated and the card details will be delivered to your email address on file.'
      }
    ]
  },
  {
    section: 'Selling',
    questions: [
      {
        q: 'How do I list a gift card for sale?',
        a: 'Submit your gift card details through the dashboard. Once verified, you can set a price and list it on the marketplace.'
      },
      {
        q: 'How long does verification take?',
        a: 'Most cards are verified within 24 hours. You will receive an email notification once your card has been verified.'
      },
      {
        q: 'When do I get paid?',
        a: 'Once a trade is completed, your earnings are added to your account balance. You can request a payout at any time from your dashboard.'
      }
    ]
  },
  {
    section: 'Account',
    questions: [
      {
        q: 'How do I verify my identity?',
        a: 'Go to your profile settings and click "Verify Identity". You will be guided through a quick ID verification process. Verified users receive a trust badge on their profile.'
      },
      {
        q: 'How do I change my username?',
        a: 'Go to your profile page and click the edit button next to your username.'
      },
      {
        q: 'How do I delete my account?',
        a: 'Contact us using the form below and select "Account" as the subject. We will process your request within 48 hours.'
      }
    ]
  },
  {
    section: 'Report a User',
    questions: [
      {
        q: 'How do I report a suspicious seller?',
        a: 'Use the contact form below, select "Report a User" as the subject, and include their username. Our team will investigate within 24 hours.'
      },
      {
        q: 'What happens after I report someone?',
        a: 'Our team reviews all reports and takes appropriate action, which may include suspending the user\'s account. We take all reports seriously.'
      }
    ]
  }
]

const SUBJECTS = [
  'Buying',
  'Selling',
  'Account',
  'Report a User',
  'Other'
]

export default function Help() {
  const navigate = useNavigate()
  const api = useApi()
  const [openQuestion, setOpenQuestion] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [reportedUser, setReportedUser] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await api.contactSupport({ name, email, subject, message, reportedUser: reportedUser || undefined })
      setSuccess(true)
      setName('')
      setEmail('')
      setSubject('')
      setMessage('')
      setReportedUser('')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F6F3F9] text-[#2e1a47]">

      {/* ── Nav ── */}
      <nav className="flex items-center justify-between px-4 sm:px-8 py-5 border-b border-[#E3DFEF] bg-white shadow-sm">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-xl font-semibold tracking-tight text-[#2e1a47]"
        >
          Lyanta
        </button>
        <button
          onClick={() => navigate('/browse')}
          className="text-sm text-[#7c6992] hover:text-[#2e1a47] transition-colors font-normal"
        >
          ← Back to browse
        </button>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-12 space-y-12">

        {/* ── Header ── */}
        <div>
          <p className="text-xs uppercase tracking-widest text-[#7c6992] mb-2">Support</p>
          <h1 className="text-3xl font-light text-[#2e1a47]">How can we help?</h1>
        </div>

        {/* ── FAQ Sections ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FAQS.map(section => (
            <div
              key={section.section}
              className="bg-white border border-[#E3DFEF] rounded-2xl p-6 space-y-3 shadow-sm"
            >
              <h2 className="text-xs font-semibold uppercase tracking-widest text-[#7c6992] mb-4">
                {section.section}
              </h2>
              {section.questions.map(item => (
                <div key={item.q} className="border-b border-[#E3DFEF] last:border-0 pb-3 last:pb-0">
                  <button
                    onClick={() => setOpenQuestion(openQuestion === item.q ? null : item.q)}
                    className="w-full text-left text-sm text-[#2e1a47] flex justify-between items-start gap-2 font-normal"
                  >
                    <span>{item.q}</span>
                    <span className="text-[#AFABC9] shrink-0 font-light">
                      {openQuestion === item.q ? '−' : '+'}
                    </span>
                  </button>
                  {openQuestion === item.q && (
                    <p className="mt-2 text-sm text-[#7c6992] leading-relaxed">{item.a}</p>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* ── Contact Form ── */}
        <div className="bg-white border border-[#E3DFEF] rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-light text-[#2e1a47] mb-1">Contact us</h2>
          <p className="text-sm text-[#7c6992] mb-6">We typically respond within 24 hours.</p>

          {success ? (
            <div className="bg-[#F6F3F9] border border-[#E3DFEF] rounded-xl p-4">
              <p className="text-sm text-[#2e7d32]">Your message has been sent. We'll get back to you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#7c6992] mb-2 font-semibold">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className="w-full bg-white border border-[#E3DFEF] rounded-lg px-4 py-3 text-sm text-[#2e1a47] placeholder-[#AFABC9] focus:outline-none focus:border-[#72569C] focus:ring-1 focus:ring-[#72569C] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#7c6992] mb-2 font-semibold">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full bg-white border border-[#E3DFEF] rounded-lg px-4 py-3 text-sm text-[#2e1a47] placeholder-[#AFABC9] focus:outline-none focus:border-[#72569C] focus:ring-1 focus:ring-[#72569C] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-[#7c6992] mb-2 font-semibold">
                  Subject
                </label>
                <select
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  required
                  className="w-full bg-white border border-[#E3DFEF] rounded-lg px-4 py-3 text-sm text-[#2e1a47] focus:outline-none focus:border-[#72569C] focus:ring-1 focus:ring-[#72569C] transition-colors"
                >
                  <option value="">Select a subject</option>
                  {SUBJECTS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {subject === 'Report a User' && (
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#7c6992] mb-2 font-semibold">
                    Username to report
                  </label>
                  <input
                    type="text"
                    value={reportedUser}
                    onChange={e => setReportedUser(e.target.value)}
                    placeholder="@username"
                    className="w-full bg-white border border-[#E3DFEF] rounded-lg px-4 py-3 text-sm text-[#2e1a47] placeholder-[#AFABC9] focus:outline-none focus:border-[#72569C] focus:ring-1 focus:ring-[#72569C] transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs uppercase tracking-widest text-[#7c6992] mb-2 font-semibold">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  required
                  rows={5}
                  maxLength={2000}
                  className="w-full bg-white border border-[#E3DFEF] rounded-lg px-4 py-3 text-sm text-[#2e1a47] placeholder-[#AFABC9] focus:outline-none focus:border-[#72569C] focus:ring-1 focus:ring-[#72569C] transition-colors resize-none"
                />
                <p className="text-xs text-[#AFABC9] mt-1 text-right">{message.length}/2000</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#2e1a47] text-white py-3 text-sm font-normal rounded-lg hover:bg-[#72569C] transition-colors disabled:opacity-50"
              >
                {submitting ? 'Sending...' : 'Send message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}