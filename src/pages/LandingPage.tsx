import { useEffect, useRef, useState } from 'react'

interface LandingPageProps {
  onGetStarted: () => void
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)

  useEffect(() => {
    // Create audio element
    audioRef.current = new Audio('/audio/Assault Fire： Three Minutes of Glory performed by Razorback.mp3')
    audioRef.current.loop = true
    audioRef.current.volume = 0.5 // 50% volume

    // Auto-play music when page loads
    const playMusic = () => {
      if (audioRef.current) {
        audioRef.current.play()
          .then(() => {
            setIsMusicPlaying(true)
          })
          .catch(() => {
            // Browser blocked autoplay, will play on first user interaction
            const playOnInteraction = () => {
              if (audioRef.current) {
                audioRef.current.play()
                  .then(() => setIsMusicPlaying(true))
                  .catch(() => {})
              }
              document.removeEventListener('click', playOnInteraction)
            }
            document.addEventListener('click', playOnInteraction)
          })
      }
    }
    
    playMusic()

    return () => {
      // Cleanup on unmount
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsMusicPlaying(!isMusicPlaying)
    }
  }

  return (
    <div className="landing-page">
      {/* Music Toggle Button */}
      <button 
        className="music-toggle"
        onClick={toggleMusic}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.8) 0%, rgba(139, 92, 246, 0.8) 100%)',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          cursor: 'pointer',
          fontSize: '20px',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)'
        }}
      >
        {isMusicPlaying ? '🔊' : '🔇'}
      </button>

      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">AccuracyLab</div>
          <ul className="nav-menu">
            <li><a href="#home">Home</a></li>
            <li><a href="#features">Features</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to AccuracyLab</h1>
          <p className="hero-subtitle">
            Precision meets innovation. Transform your workflow with cutting-edge solutions.
          </p>
          <div className="hero-buttons">
            <button className="btn btn-primary" onClick={onGetStarted}>Get Started</button>
            <button className="btn btn-secondary">Learn More</button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <h2 className="section-title">Our Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Lightning Fast</h3>
              <p>Experience blazing fast performance with our optimized solutions.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure</h3>
              <p>Your data is protected with enterprise-grade security measures.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Accurate</h3>
              <p>Precision-engineered tools that deliver consistent results.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Analytics</h3>
              <p>Comprehensive insights to help you make data-driven decisions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about">
        <div className="container">
          <h2 className="section-title">About AccuracyLab</h2>
          <p className="about-text">
            AccuracyLab is dedicated to providing the most precise and reliable solutions 
            for your business needs. With years of experience and a commitment to excellence, 
            we help you achieve your goals with confidence.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="cta">
        <div className="container">
          <h2 className="cta-title">Ready to Get Started?</h2>
          <p className="cta-text">Join thousands of satisfied customers today.</p>
          <button className="btn btn-large" onClick={onGetStarted}>Contact Us</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; 2025 AccuracyLab. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
