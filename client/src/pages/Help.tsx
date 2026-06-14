import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi } from '../services/api.ts'

const FAQS = [
  {
    section: 'Buying',
    icon: '🛒',
    questions: [
      {
        q: 'How do I purchase a gift card?',
        a: 'Browse listings on the marketplace, select a card you want, and either buy it instantly at the listed price or make an offer. Once accepted, the card details will be sent to your email.'
      },
      {
        q: 'Is it safe to buy gift cards on Lantana?',
        a: 'All cards on Lantana are verified before being listed. We check balances and card validity to ensure you receive what you paid for.'
      },
      {
        q: 'What happens after my offer is accepted?',
        a: 'Once your offer is accepted, the trade is initiated and the card details will be delivered to your email address on file.'
      }
    ]
  },
  {
    section: 'Selling',
    icon: '🏷️',
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
    icon: '👤',
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
    icon: '🚩',
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
    <div className="min-h-screen bg-[#f8f7f4] text-[#1a1a2e]">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-[#e2e0db] bg-white">
        <button onClick={() => navigate('/dashboard')} className="text-xl font-semibold tracking-tight">
          Lantana
        </button>
        <button
          onClick={() => navigate('/browse')}
          className="text-sm text-[#4a4a6a] hover:text-[#1a1a2e] transition-colors"
        >
          ← Back to browse
        </button>
      </nav>

      <div className="max-w-3xl mx-auto px-8 py-12 space-y-12">

        {/* Header */}
        <div>
          <p className="text-xs uppercase tracking-widest text-[#7a7a9a] mb-2">Support</p>
          <h1 className="text-3xl font-semibold">How can we help?</h1>
        </div>

        {/* FAQ Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FAQS.map(section => (
            <div key={section.section} className="bg-white border border-[#e2e0db] p-6 space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">{section.icon}</span>
                <h2 className="text-sm font-semibold uppercase tracking-widest text-[#1a1a2e]">{section.section}</h2>
              </div>
              {section.questions.map(item => (
                <div key={item.q} className="border-b border-[#e2e0db] last:border-0 pb-3 last:pb-0">
                  <button
                    onClick={() => setOpenQuestion(openQuestion === item.q ? null : item.q)}
                    className="w-full text-left text-sm text-[#1a1a2e] flex justify-between items-start gap-2"
                  >
                    <span>{item.q}</span>
                    <span className="text-[#7a7a9a] shrink-0">{openQuestion === item.q ? '−' : '+'}</span>
                  </button>
                  {openQuestion === item.q && (
                    <p className="mt-2 text-sm text-[#4a4a6a] leading-relaxed">{item.a}</p>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <div className="bg-white border border-[#e2e0db] p-8">
          <h2 className="text-lg font-semibold mb-1">Contact us</h2>
          <p className="text-sm text-[#7a7a9a] mb-6">We typically respond within 24 hours.</p>

          {success ? (
            <div className="bg-green-50 border border-green-200 p-4">
              <p className="text-sm text-green-700">Your message has been sent. We'll get back to you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#7a7a9a] mb-2">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className="w-full bg-white border border-[#e2e0db] px-4 py-3 text-sm focus:outline-none focus:border-[#1a1a2e] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#7a7a9a] mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full bg-white border border-[#e2e0db] px-4 py-3 text-sm focus:outline-none focus:border-[#1a1a2e] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-[#7a7a9a] mb-2">Subject</label>
                <select
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  required
                  className="w-full bg-white border border-[#e2e0db] px-4 py-3 text-sm focus:outline-none focus:border-[#1a1a2e] transition-colors"
                >
                  <option value="">Select a subject</option>
                  {SUBJECTS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {subject === 'Report a User' && (
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#7a7a9a] mb-2">Username to report</label>
                  <input
                    type="text"
                    value={reportedUser}
                    onChange={e => setReportedUser(e.target.value)}
                    placeholder="@username"
                    className="w-full bg-white border border-[#e2e0db] px-4 py-3 text-sm focus:outline-none focus:border-[#1a1a2e] transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs uppercase tracking-widest text-[#7a7a9a] mb-2">Message</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  required
                  rows={5}
                  maxLength={2000}
                  className="w-full bg-white border border-[#e2e0db] px-4 py-3 text-sm focus:outline-none focus:border-[#1a1a2e] transition-colors resize-none"
                />
                <p className="text-xs text-[#7a7a9a] mt-1 text-right">{message.length}/2000</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 p-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#1a1a2e] text-white py-3 text-sm font-semibold hover:bg-[#2d2d4e] transition-colors disabled:opacity-50"
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