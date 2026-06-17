import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', email: '', password: '', cookName: '', cookPhone: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function set(key) {
    return e => setForm(p => ({ ...p, [key]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      await register(form)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-logo">🍳 Cook Planner</h1>
          <p className="auth-sub">Create your account</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label>Your Name</label>
            <input type="text" placeholder="Full name" value={form.name} onChange={set('name')} required autoFocus />
          </div>
          <div className="auth-field">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
          </div>
          <div className="auth-field">
            <label>Password</label>
            <input type="password" placeholder="Min 6 characters" value={form.password} onChange={set('password')} required />
          </div>

          <div className="auth-divider">Cook Profile (optional)</div>

          <div className="auth-field">
            <label>Cook's Name</label>
            <input type="text" placeholder="e.g. Ramesh" value={form.cookName} onChange={set('cookName')} />
          </div>
          <div className="auth-field">
            <label>Cook's WhatsApp Number</label>
            <input type="tel" placeholder="e.g. 919876543210" value={form.cookPhone} onChange={set('cookPhone')} />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
