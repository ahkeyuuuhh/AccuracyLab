import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import AimTrainer3D from '../components/AimTrainer3D'
import TypingDrill3D from '../components/TypingDrill3D'

export default function Play() {
  const [view, setView] = useState<'menu' | 'drills' | 'aimtrainer' | 'typingdrill'>('drills')

  // Dispatch events when entering/leaving the actual game
  useEffect(() => {
    if (view === 'aimtrainer' || view === 'typingdrill') {
      window.dispatchEvent(new Event('game-start'))
    } else {
      window.dispatchEvent(new Event('game-stop'))
    }
  }, [view])

  // 3D Aim Trainer View - Render using Portal to bypass sidebar
  if (view === 'aimtrainer') {
    return createPortal(
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: '100vh', 
        zIndex: 10000,
        background: '#000'
      }}>
        <AimTrainer3D onExit={() => setView('drills')} />
      </div>,
      document.body
    )
  }

  // 3D Typing Drill View - Render using Portal to bypass sidebar
  if (view === 'typingdrill') {
    return createPortal(
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: '100vh', 
        zIndex: 10000,
        background: '#000'
      }}>
        <TypingDrill3D onExit={() => setView('drills')} />
      </div>,
      document.body
    )
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
            <button className="drill-start-btn" onClick={() => setView('aimtrainer')}>START</button>
          </div>

          <div className="drill-card">
            <h2>KEY DRILL</h2>
            <p>
              Eliminate zombies by typing words! Each correct letter fires your gun. Test your typing speed and accuracy in 3D combat.
            </p>
            <button className="drill-start-btn" onClick={() => setView('typingdrill')}>START</button>
          </div>
        </div>
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
