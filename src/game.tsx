import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from './firebase/config'
import AimTrainer3D from './components/AimTrainer3D'
import TypingDrill3D from './components/TypingDrill3D'
import './style/App.css'

// Get game type from URL parameter
const urlParams = new URLSearchParams(window.location.search)
const gameType = urlParams.get('type')
const gameDuration = parseInt(urlParams.get('duration') || '60')

// Function to close the game window
const handleExit = () => {
  window.close()
}

// Game wrapper component that handles auth
function GameWrapper() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <div style={{
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontSize: '24px'
      }}>
        Loading...
      </div>
    )
  }

  // Render the appropriate game
  if (gameType === 'aim') {
    return <AimTrainer3D onExit={handleExit} currentUser={currentUser} duration={gameDuration} />
  } else if (gameType === 'typing') {
    return <TypingDrill3D onExit={handleExit} currentUser={currentUser} />
  } else {
    return (
      <div style={{
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontSize: '24px'
      }}>
        Invalid game type
      </div>
    )
  }
}

ReactDOM.createRoot(document.getElementById('game-root')!).render(
  <React.StrictMode>
    <GameWrapper />
  </React.StrictMode>,
)
