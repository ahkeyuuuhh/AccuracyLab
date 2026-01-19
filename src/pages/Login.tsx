import { useState } from 'react'
import '../style/Auth.css'

interface LoginProps {
  onLogin: () => void
  onSwitchToSignup: () => void
  onBackToLanding: () => void
}

export default function Login({ onLogin, onSwitchToSignup, onBackToLanding }: LoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement actual login logic
    console.log('Login attempt:', { username, password })
    onLogin()
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

            <form className="auth-form-full" onSubmit={handleSubmit}>
              <div className="input-group">
                <label htmlFor="username">Login</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
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

              <button type="submit" className="cyber-btn">
                <span className="shine-effect"></span>
                <span className="cyber-btn-inner">Login</span>
              </button>
            </form>

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
