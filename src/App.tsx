import { useState, useEffect, useRef } from 'react'
import './App.css'
import LandingPage from './pages/LandingPage.tsx'
import Home from './pages/Home.tsx'
import Play from './pages/Play.tsx'
import Collections from './pages/Collections.tsx'
import Leaderboards from './pages/Leaderboards.tsx'
import Achievements from './pages/Achievements.tsx'
import Store from './pages/Store.tsx'
import Profile from './pages/Profile.tsx'
import Settings from './pages/Settings.tsx'

type Page = 'landing' | 'home' | 'play' | 'collections' | 'leaderboards' | 'achievements' | 'store' | 'profile' | 'settings'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)

  // Menu music auto-play
  useEffect(() => {
    // Create audio element
    audioRef.current = new Audio('/audio/Assault Fire： Three Minutes of Glory performed by Razorback.mp3')
    audioRef.current.loop = true
    audioRef.current.volume = 0.5
    audioRef.current.currentTime = 14 // Start at 14 seconds

    // Auto-play music
    const playMusic = () => {
      if (audioRef.current) {
        audioRef.current.play()
          .then(() => setIsMusicPlaying(true))
          .catch(() => {
            // Browser blocked autoplay, play on first interaction
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
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  // Listen for game start/stop events to control music
  useEffect(() => {
    const handleGameStart = () => {
      audioRef.current?.pause()
    }
    
    const handleGameStop = () => {
      if (audioRef.current && isMusicPlaying) {
        audioRef.current.play().catch(() => {})
      }
    }

    window.addEventListener('game-start', handleGameStart)
    window.addEventListener('game-stop', handleGameStop)
    
    return () => {
      window.removeEventListener('game-start', handleGameStart)
      window.removeEventListener('game-stop', handleGameStop)
    }
  }, [isMusicPlaying])

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

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onGetStarted={() => setCurrentPage('home')} />
      case 'home':
        return <Home />
      case 'play':
        return <Play />
      case 'collections':
        return <Collections />
      case 'leaderboards':
        return <Leaderboards />
      case 'achievements':
        return <Achievements />
      case 'store':
        return <Store />
      case 'profile':
        return <Profile />
      case 'settings':
        return <Settings />
      default:
        return <Home />
    }
  }

  if (currentPage === 'landing') {
    return renderPage()
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
         
          <h2>ACCURACY LAB</h2>
        </div>
        
        {/* Music Toggle */}
        <button 
          className="music-toggle-sidebar"
          onClick={toggleMusic}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '8px',
            padding: '8px 16px',
            margin: '0 16px 16px 16px',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s ease'
          }}
        >
          {isMusicPlaying ? '🔊' : '🔇'} {isMusicPlaying ? 'Music On' : 'Music Off'}
        </button>

        <nav className="sidebar-nav">
          <button 
            className={currentPage === 'home' ? 'active' : ''}
            onClick={() => setCurrentPage('home')}
          >
            HOME
          </button>
          <button 
            className={currentPage === 'play' ? 'active' : ''}
            onClick={() => setCurrentPage('play')}
          >
            PLAY
          </button>
          <button 
            className={currentPage === 'collections' ? 'active' : ''}
            onClick={() => setCurrentPage('collections')}
          >
            COLLECTIONS
          </button>
          <button 
            className={currentPage === 'leaderboards' ? 'active' : ''}
            onClick={() => setCurrentPage('leaderboards')}
          >
            LEADERBOARDS
          </button>
          <button 
            className={currentPage === 'achievements' ? 'active' : ''}
            onClick={() => setCurrentPage('achievements')}
          >
            ACHIEVEMENTS
          </button>
          <button 
            className={currentPage === 'store' ? 'active' : ''}
            onClick={() => setCurrentPage('store')}
          >
            STORE
          </button>
          <button 
            className={currentPage === 'profile' ? 'active' : ''}
            onClick={() => setCurrentPage('profile')}
          >
            PROFILE
          </button>
          <button 
            className={currentPage === 'settings' ? 'active' : ''}
            onClick={() => setCurrentPage('settings')}
          >
            SETTINGS
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  )
}

export default App
