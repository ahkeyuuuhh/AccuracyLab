import { useState } from 'react'
import '../style/Auth.css'
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../firebase/config'
import { createUserProfile } from '../firebase/userService'

interface LoginProps {
  onLogin: () => void
  onSwitchToSignup: () => void
  onBackToLanding: () => void
}

export default function Login({ onLogin, onSwitchToSignup, onBackToLanding }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Sign in with email and password
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      
      // Update user profile in Firestore
      await createUserProfile(userCredential.user)
      
      onLogin()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to login. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setLoading(true)

    try {
      const result = await signInWithPopup(auth, googleProvider)
      
      // Create/update user profile in Firestore
      await createUserProfile(result.user)
      
      onLogin()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to login with Google. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page-full">
      <div className="auth-container-full">
        <div className="auth-split-card">
          <div className="auth-left">
            <button className="back-link" onClick={onBackToLanding}>
              ← Back to Home
            </button>
            
            <div className="auth-logo">ACCURACY LAB</div>
            
            <h2 className="auth-heading">Sign In</h2>
            <p className="auth-subheading">Enter your credentials to continue</p>

            {error && <div className="error-message">{error}</div>}

            <form className="auth-form-full" onSubmit={handleSubmit}>
              <div className="input-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
              </div>

              <div className="input-group">
                <label htmlFor="password">Password</label>
                <div className="password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {showPassword ? (
                        <>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </>
                      ) : (
                        <>
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </>
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              <button type="submit" className="cyber-btn" disabled={loading}>
                <span className="shine-effect"></span>
                <span className="cyber-btn-inner">{loading ? 'Signing in...' : 'Login'}</span>
              </button>
            </form>

            <div className="divider">
              <span>OR</span>
            </div>

            <button className="google-btn" onClick={handleGoogleLogin} disabled={loading}>
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {loading ? 'Signing in...' : 'Continue with Google'}
            </button>

            <div className="auth-switch">
              <p>
                Don't have an account yet?{' '}
                <button className="switch-link" onClick={onSwitchToSignup}>
                  Sign up
                </button>
              </p>
            </div>
          </div>

          <div className="auth-right">
            <div className="auth-image-placeholder">
              <div className="image-overlay"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
