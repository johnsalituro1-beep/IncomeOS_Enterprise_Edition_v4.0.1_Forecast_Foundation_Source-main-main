import { useState, type FormEvent, type MouseEvent } from 'react'
import { useAuth } from '../features/auth/AuthContext'

export function LoginPage() {
  const { signIn, signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement> | MouseEvent<HTMLButtonElement>, mode: 'signin' | 'signup') {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    const error = mode === 'signin' ? await signIn(email, password) : await signUp(email, password)
    setMessage(error ?? (mode === 'signup' ? 'Account created. Check your email to confirm access.' : 'Signed in.'))
    setBusy(false)
  }

  return <main className="login-shell">
    <section className="login-brand">
      <img className="login-logo" src="/favicon.png" alt="ETF Dividend Calendar Pro"/>
      <p className="eyebrow">ETF DIVIDEND CALENDAR PRO</p>
      <h1>The operating system for income investors.</h1>
      <p>Track cash flow, manage portfolios, and plan the path to your income goal from one professional command center.</p>
    </section>
    <form className="login-card" onSubmit={(e) => submit(e, 'signin')}>
      <span className="terminal-label">SECURE ACCESS</span>
      <h2>Welcome back</h2>
      <label>Email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
      <label>Password<input required minLength={6} type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
      {message && <div className="form-message">{message}</div>}
      <button className="button primary" disabled={busy}>{busy ? 'Connecting…' : 'Sign in'}</button>
      <button className="button ghost" type="button" disabled={busy} onClick={(e) => submit(e, 'signup')}>Create account</button>
    </form>
  </main>
}
