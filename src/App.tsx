import { useState, useEffect, useRef } from 'react'
import { onAuthStateChanged, signOut, type User } from 'firebase/auth'
import { Coins } from 'lucide-react'
import { auth } from './firebase/config'
import { getUserCurrency, type UserCurrency } from './firebase/currencyService'
import './style/App.css'
import LandingPage from './pages/LandingPage.tsx'
import Home from './pages/Home.tsx'
import Play from './pages/Play.tsx'
import Collections from './pages/Collections.tsx'
import Leaderboards from './pages/Leaderboards.tsx'
import Achievements from './pages/Achievements.tsx'
import Store from './pages/Store.tsx'
import Profile from './pages/Profile.tsx'
import Settings from './pages/Settings.tsx'
import Friends from './pages/Friends.tsx'

type Page = 'landing' | 'home' | 'play' | 'collections' | 'leaderboards' | 'achievements' | 'store' | 'profile' | 'settings' | 'friends'

function App() {
  // Check URL parameters to determine initial page
  const urlParams = new URLSearchParams(window.location.search)
  const pageParam = urlParams.get('page') as Page | null
  const initialPage = pageParam && ['landing', 'home', 'play', 'collections', 'leaderboards', 'achievements', 'store', 'profile', 'settings', 'friends'].includes(pageParam) ? pageParam : 'landing'
  
  const [currentPage, setCurrentPage] = useState<Page>(initialPage)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [userCurrency, setUserCurrency] = useState<UserCurrency | null>(null)

  // Track authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      if (user) {
        loadUserCurrency(user.uid)
      } else {
        setUserCurrency(null)
      }
    })
    return () => unsubscribe()
  }, [])

  // Load user currency
  const loadUserCurrency = async (userId: string) => {
    const currency = await getUserCurrency(userId)
    setUserCurrency(currency)
  }

  // Refresh currency (can be called after purchases/rewards)
  const refreshCurrency = () => {
    if (currentUser) {
      loadUserCurrency(currentUser.uid)
    }
  }

  // Auto-refresh currency every 10 seconds when on relevant pages
  useEffect(() => {
    if (!currentUser) return
    
    const interval = setInterval(() => {
      loadUserCurrency(currentUser.uid)
    }, 10000)
    
    return () => clearInterval(interval)
  }, [currentUser])

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth)
      setCurrentPage('landing')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

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
        return <LandingPage 
          onGetStarted={() => setCurrentPage('play')} 
          onLogin={() => setCurrentPage('home')}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      case 'home':
        return <Home />
      case 'play':
        return <Play />
      case 'collections':
        return <Collections />
      case 'leaderboards':
        return <Leaderboards currentUser={currentUser} />
      case 'achievements':
        return <Achievements currentUser={currentUser} />
      case 'store':
        return <Store />
      case 'profile':
        return <Profile currentUser={currentUser} />
      case 'settings':
        return <Settings />
      case 'friends':
        return <Friends currentUser={currentUser} />
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
          <button 
            className={currentPage === 'friends' ? 'active' : ''}
            onClick={() => setCurrentPage('friends')}
          >
            FRIENDS
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Currency Display - Top Right */}
        {currentUser && userCurrency !== null && (
          <div style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 1000,
            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.15) 100%)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(251, 191, 36, 0.4)',
            borderRadius: '16px',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}
          onClick={refreshCurrency}
          title="Click to refresh"
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(251, 191, 36, 0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}
          >
            <Coins size={24} color="#fbbf24" />
            <div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#fbbf24', lineHeight: '1' }}>
                {userCurrency.coins.toLocaleString()}
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Coins</div>
            </div>
          </div>
        )}
        
        {renderPage()}
      </main>
    </div>
  )
}

export default App
