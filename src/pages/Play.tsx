import { useState } from 'react'
import { createPortal } from 'react-dom'

export default function Play() {
  const [view, setView] = useState<'menu' | 'drills'>('drills')
  const [showTimeModal, setShowTimeModal] = useState(false)

  // Open game in new tab with selected time
  const openGameInNewTab = (gameType: 'aim' | 'typing', duration?: number) => {
    const baseUrl = window.location.origin
    const timeParam = duration ? `&duration=${duration}` : ''
    const gameUrl = `${baseUrl}/game.html?type=${gameType}${timeParam}`
    window.open(gameUrl, '_blank', 'width=1920,height=1080')
  }

  // Handle aim drill click - show time selection
  const handleAimDrillClick = () => {
    setShowTimeModal(true)
  }

  // Select time and start game
  const selectTimeAndStart = (seconds: number) => {
    setShowTimeModal(false)
    openGameInNewTab('aim', seconds)
  }

  if (view === 'drills') {
    return (
      <div className="drills-page">
        <button className="back-button" onClick={() => setView('menu')}>
          ← BACK
        </button>
        
        <div className="drills-header">
          <div className="drills-logo">
         
            <h1>ACCURACY LAB</h1>
          </div>
        </div>

        <div className="drills-container">
          <div className="drill-card">
            <h2>AIM DRILL</h2>
            <p>
              Train your mouse accuracy by clicking on targets in 3D space. Click as many targets as you can within 60 seconds!
            </p>
            <button className="drill-start-btn" onClick={handleAimDrillClick}>START</button>
          </div>

          <div className="drill-card">
            <h2>KEY DRILL</h2>
            <p>
              Eliminate zombies by typing words! Each correct letter fires your gun. Test your typing speed and accuracy in 3D combat.
            </p>
            <button className="drill-start-btn" onClick={() => openGameInNewTab('typing')}>START</button>
          </div>
        </div>

        {/* Time Selection Modal */}
        {showTimeModal && createPortal(
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              padding: '40px 50px',
              borderRadius: '20px',
              border: '2px solid rgba(99, 102, 241, 0.5)',
              boxShadow: '0 0 60px rgba(99, 102, 241, 0.3)',
              textAlign: 'center',
              minWidth: '400px'
            }}>
              <h2 style={{
                color: '#fff',
                fontSize: '28px',
                marginBottom: '10px',
                fontWeight: 'bold'
              }}>SELECT DURATION</h2>
              <p style={{
                color: '#888',
                fontSize: '14px',
                marginBottom: '30px'
              }}>How long do you want to train?</p>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '15px',
                marginBottom: '25px'
              }}>
                {[
                  { label: '15 SEC', value: 15 },
                  { label: '30 SEC', value: 30 },
                  { label: '45 SEC', value: 45 },
                  { label: '1 MIN', value: 60 }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => selectTimeAndStart(option.value)}
                    style={{
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      color: '#fff',
                      border: 'none',
                      padding: '20px 30px',
                      borderRadius: '12px',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)'
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(99, 102, 241, 0.5)'
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.4)'
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setShowTimeModal(false)}
                style={{
                  background: 'transparent',
                  color: '#888',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  padding: '12px 30px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)'
                  e.currentTarget.style.color = '#fff'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                  e.currentTarget.style.color = '#888'
                }}
              >
                CANCEL
              </button>
            </div>
          </div>,
          document.body
        )}
      </div>
    )
  }

  return (
    <div className="page-container">
      <h1 className="page-title">PLAY</h1>
      <div className="page-content">
        <div className="game-modes">
          <div className="game-mode-card">
            <h3>Quick Match</h3>
            <p>Jump into a quick game and test your accuracy</p>
            <button className="btn btn-primary" onClick={() => setView('drills')}>Start Game</button>
          </div>
          <div className="game-mode-card">
            <h3>Challenge Mode</h3>
            <p>Take on increasingly difficult challenges</p>
            <button className="btn btn-primary">Start Challenge</button>
          </div>
          <div className="game-mode-card">
            <h3>Time Trial</h3>
            <p>Race against the clock for the highest score</p>
            <button className="btn btn-primary">Start Trial</button>
          </div>
          <div className="game-mode-card">
            <h3>Multiplayer</h3>
            <p>Compete against other players online</p>
            <button className="btn btn-primary">Find Match</button>
          </div>
        </div>
      </div>
    </div>
  )
}
