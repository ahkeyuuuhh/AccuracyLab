import '../style/LandingPage.css'

interface LandingPageProps {
  onGetStarted: () => void
  onLogin: () => void
  onSignup: () => void
}

export default function LandingPage({ onGetStarted, onLogin, onSignup }: LandingPageProps) {
  return (
    <div className="landing-page">
      
      {/* --- HERO SECTION --- */}
      <section id="home" className="hero-viewport">
        <div className="hero-layout">
          
          {/* Top Bar: Logo Tab + Nav Pill + Auth Pill */}
          <header className="hero-header-area">
            <div className="hero-logo-tab">LOGO</div>
            
            <nav className="hero-nav-pill">
              <ul className="hero-nav-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#drills">Drills <small>▼</small></a></li>
                <li><a href="#leadership">Leadership</a></li>
              </ul>
            </nav>

            <div className="hero-auth-pill">
              <button className="hero-btn-login" onClick={onLogin}>Login</button>
              <button className="hero-btn-signup" onClick={onSignup}>Signup</button>
            </div>
          </header>

          {/* Main Hero Content */}
          <div className="hero-main-content">
            <div className="hero-left">
              <h1 className="hero-title">PRECISION MEET PERFORMANCE</h1>
              <div className="hero-subtitle-box">
                <p>
                  Master the perfect synergy between pixel-perfect aim and lightning-fast keystroke accuracy. Our advanced laboratory provides the clinical environment you need to isolate your weaknesses and build elite-level muscle memory.
                </p>
              </div>
              <button className="startNow-btn" onClick={onGetStarted}>
                BEGIN MISSION
              </button>
            </div>

            <div className="hero-right">
              <div className="character-placeholder">
                ELEMENT/CHARACTER
              </div>
            </div>
          </div>


          {/* Bottom Bar: Contact Tab + Social Pill */}
          <footer className="hero-footer-area">
            <div className="hero-contact-tab">CONTACT US</div>
            <div className="hero-social-pill">
              <span className="social-item">
                <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </span>
              <span className="social-item">
                <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                Instagram
              </span>
              <span className="social-item">
                <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                Gmail
              </span>
              <span className="social-item phone-number">
                <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </svg>
                0999-999-9999
              </span>
            </div>
          </footer>

        </div>
      </section>

      {/* --- WHAT MAKES ACCURACY LAB GREAT SECTION --- */}
      <section id="unique" className="unique-section">
        <div className="container">
          <div className="unique-content">
            <div className="unique-left">
              <h1 className="unique-title">WHAT MAKES ACCURACY LAB GREAT.</h1>
            </div>
            <div className="unique-right">
              <h3 className="unique-subtitle">WHAT IS ACCURACY LAB?</h3>
              <p className="unique-description">
                Accuracy Lab is a skill-focused digital platform designed to improve precision, speed, and consistency through interactive training activities. It provides users with game-like exercises that challenge reaction time, focus, and hand-eye coordination, making practice both engaging and effective. 
              </p>
              <div className="checkbox-grid">
                <div className="checkbox-item">
                  <div className="checkbox"></div>
                  <span>Precision</span>
                </div>
                <div className="checkbox-item">
                  <div className="checkbox"></div>
                  <span>Focus</span>
                </div>
                <div className="checkbox-item">
                  <div className="checkbox"></div>
                  <span>Speed</span>
                </div>
                <div className="checkbox-item">
                  <div className="checkbox"></div>
                  <span>Accuracy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section id="features" className="features-section">
        <div className="features-container">
          <h2 className="section-title">FEATURES</h2>
          <p className="features-subtitle">
            Accuracy Lab delivers precision-focused drills designed to improve speed, focus, and accuracy. Train smarter and track real performance growth.          </p>
          <div className="features-grid">
            <div className="feature-card light">
              <div className="feature-content">
                <h3>KEY DRILLS</h3>
                <p>Key Drills combine typing accuracy with fast-paced action as you eliminate zombies by typing the words they carry. Improve speed, focus, and precision under pressure.</p>              </div>
              <button className="feature-btn">PLAY</button>
            </div>
            <div className="feature-card dark">
              <div className="feature-content">
                <h3>AIM DRILLS</h3>
                <p>Sharpen your aim with fast, responsive drills designed to build accuracy and consistency.</p>
              </div>
              <button className="feature-btn">PLAY</button>
            </div>
            <div className="feature-card darkest">
              <div className="feature-content">
                <h3>LEADERBOARD</h3>
                <p>Climb the ranks by proving your precision and speed. See how you stack up against other players in real time.</p>
              </div>
              <button className="feature-btn">VIEW</button>
            </div>
            <div className="feature-card medium">
              <div className="feature-content">
                <h3>SHOP</h3>
                <p>Upgrade your arsenal with unique gun skins and accessories. Stand out in every match with style and precision</p>
              </div>
              <button className="feature-btn">VIEW</button>
            </div>
          </div>
        </div>
      </section>

      {/* --- SHARPEN YOUR ACCURACY SECTION --- */}
      <section id="accuracy" className="accuracy-section">
        <div className="container">
          <h2 className="section-title">SHARPEN YOUR ACCURACY</h2>
          <p className="section-subtitle">
            Enhance your aim and precision with our interactive drills and exclusive gear. Master your skills and enjoy a unique gaming experience
          </p>
          
          <div className="accuracy-content">
            <div className="accuracy-left">
              <div className="accuracy-logo-placeholder">
                LOGO/ELEMENT
              </div>
            </div>
            
            <div className="accuracy-right">
              <div className="accuracy-list-item">
                <div className="accuracy-checkbox"></div>
                <p className="accuracy-item-text">
                  Accuracy Lab helps users improve their precision and aiming skills through interactive exercises and challenges.      
                </p>
              </div>
              <div className="accuracy-list-item">
                <div className="accuracy-checkbox"></div>
                <p className="accuracy-item-text">
                  It enhances focus and concentration by requiring careful attention to targets and timing.             
                </p>
              </div>
              <div className="accuracy-list-item">
                <div className="accuracy-checkbox"></div>
                <p className="accuracy-item-text">
                  It boosts hand-eye coordination by training users to react quickly and accurately to visual cues.
                </p>
              </div>
              <div className="accuracy-list-item">
                <div className="accuracy-checkbox"></div>
                <p className="accuracy-item-text">
                  It tracks progress and improvement over time, giving users clear feedback on their performance.
                </p>
              </div>
              <div className="accuracy-list-item">
                <div className="accuracy-checkbox"></div>
                <p className="accuracy-item-text">
                  It provides a fun and engaging way to practice, making skill development enjoyable and motivating.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section id="cta" className="cta-section">
        <div className="cta-container">
          <div className="cta-badge">DOWNLOAD HERE</div>
          <h2 className="cta-title">START TRAINING TODAY</h2>
          <p className="cta-subtitle">
            Jump into Accuracy Lab and begin improving your precision, focus, and reaction skills. Download now and start challenging yourself with fun and engaging drills designed to track your progress and make training exciting.          
          </p>
          <button className="download-btn" onClick={onGetStarted}>DOWNLOAD</button>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="global-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">ACCURACY LAB</div>
            <p className="footer-description">
              Master your aim and typing skills with our cutting-edge training platform. 
              Join thousands of players improving their accuracy every day.
            </p>
            <div className="footer-socials">
              <a href="#" className="social-link" aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#" className="social-link" aria-label="Discord">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </a>
            </div>
          </div>
          
          <div className="footer-column">
            <h4 className="footer-column-title">Features</h4>
            <a href="#drills" className="footer-link">Training Drills</a>
            <a href="#features" className="footer-link">Features</a>
            <a href="#leadership" className="footer-link">Leaderboard</a>
            <a href="#" className="footer-link">Achievements</a>
          </div>
          
          <div className="footer-column">
            <h4 className="footer-column-title">Company</h4>
            <a href="#" className="footer-link">About Us</a>
            <a href="#" className="footer-link">Careers</a>
            <a href="#" className="footer-link">Blog</a>
            <a href="#" className="footer-link">Contact</a>
          </div>
          
          <div className="footer-column">
            <h4 className="footer-column-title">Support</h4>
            <a href="#" className="footer-link">Help Center</a>
            <a href="#" className="footer-link">Privacy Policy</a>
            <a href="#" className="footer-link">Terms of Service</a>
            <a href="#" className="footer-link">FAQ</a>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p className="footer-copyright">
            © 2026 Accuracy Lab. All rights reserved.
          </p>
          <div className="footer-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Cookies</a>
          </div>
        </div>
      </footer>
    </div>
  )
}