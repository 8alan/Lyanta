import { useState } from 'react'
import { useApi } from '../services/api.ts'

export default function SetupUsername() {
  const api = useApi()
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.updateUsername(username)
      window.location.href = '/dashboard'
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F6F3F9] flex items-center justify-center px-4">
      <div className="bg-white border border-[#E3DFEF] rounded-2xl p-8 w-full max-w-md shadow-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[#2e1a47] mb-2">Welcome to Lyanta</h1>
          <p className="text-sm text-[#7c6992]">Choose a username to get started. This is how other users will see you on the marketplace.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-[#7c6992] mb-2 font-semibold">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              minLength={3}
              maxLength={20}
              placeholder="e.g. johndoe"
              className="w-full bg-white border border-[#E3DFEF] rounded-lg px-4 py-3 text-sm text-[#2e1a47] placeholder-[#AFABC9] focus:outline-none focus:border-[#72569C] focus:ring-1 focus:ring-[#72569C] transition-colors"
            />
            <p className="text-xs text-[#AFABC9] mt-2">3–20 characters. Letters, numbers and underscores only.</p>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[#2e1a47] text-white py-3 text-sm font-semibold rounded-lg hover:bg-[#72569C] transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Continue to dashboard'}
          </button>
        </form>
      </div>
    </div>
  )
}