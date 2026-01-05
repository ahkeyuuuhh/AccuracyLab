interface LandingPageProps {
  onGetStarted: () => void
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {

  return (
    <div className="landing-page">
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
            <button className="btn btn-primary" onClick={() => window.open(window.location.origin + '?page=home', '_blank')}>Get Started</button>
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
          <button className="btn btn-large" onClick={() => window.open(window.location.origin + '?page=home', '_blank')}>Contact Us</button>
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
