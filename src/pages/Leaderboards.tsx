import { useState, useEffect } from 'react'
import type { User } from 'firebase/auth'
import {
  getGlobalLeaderboard,
  getFriendsLeaderboard,
  getDailyLeaderboard,
  getWeeklyLeaderboard,
  type LeaderboardEntry
} from '../firebase/leaderboardService'

interface LeaderboardsProps {
  currentUser: User | null
}

type LeaderboardType = 'global' | 'friends' | 'daily' | 'weekly'
type GameFilter = 'all' | 'aim' | 'typing'

export default function Leaderboards({ currentUser }: LeaderboardsProps) {
  const [activeTab, setActiveTab] = useState<LeaderboardType>('global')
  const [gameFilter, setGameFilter] = useState<GameFilter>('all')
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeaderboard()
  }, [activeTab, gameFilter, currentUser])

  const loadLeaderboard = async () => {
    setLoading(true)
    let data: LeaderboardEntry[] = []

    try {
      switch (activeTab) {
        case 'global':
          data = await getGlobalLeaderboard(gameFilter, 100)
          break
        case 'friends':
          if (currentUser) {
            data = await getFriendsLeaderboard(currentUser.uid, gameFilter, 100)
          }
          break
        case 'daily':
          data = await getDailyLeaderboard(gameFilter, 100)
          break
        case 'weekly':
          data = await getWeeklyLeaderboard(gameFilter, 100)
          break
      }

      setLeaderboard(data)
    } catch (error) {
      console.error('Error loading leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      padding: '2rem',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(31, 41, 55, 0.95) 100%)',
      color: '#ffffff'
    }}>
      {/* Hero Section */}
      <div style={{
        textAlign: 'center',
        marginBottom: '3rem'
      }}>
        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: '800',
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '1rem',
          letterSpacing: '-0.02em'
        }}>
          Leaderboards
        </h1>
        <p style={{
          fontSize: '1.25rem',
          color: 'rgba(255, 255, 255, 0.7)',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          Compete with players worldwide and track your ranking across all games
        </p>
      </div>

      {/* Leaderboard Type Tabs */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '8px',
        marginBottom: '2rem',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        gap: '4px'
      }}>
        <button
          onClick={() => setActiveTab('global')}
          style={{
            flex: 1,
            padding: '12px 24px',
            background: activeTab === 'global' 
              ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
              : 'transparent',
            border: 'none',
            borderRadius: '12px',
            color: '#ffffff',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: activeTab === 'global' ? '0 4px 20px rgba(99, 102, 241, 0.3)' : 'none'
          }}
        >
          🌍 Global
        </button>
        <button
          onClick={() => setActiveTab('friends')}
          style={{
            flex: 1,
            padding: '12px 24px',
            background: activeTab === 'friends' 
              ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
              : 'transparent',
            border: 'none',
            borderRadius: '12px',
            color: '#ffffff',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: activeTab === 'friends' ? '0 4px 20px rgba(99, 102, 241, 0.3)' : 'none'
          }}
        >
          👥 Friends
        </button>
        <button
          onClick={() => setActiveTab('daily')}
          style={{
            flex: 1,
            padding: '12px 24px',
            background: activeTab === 'daily' 
              ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
              : 'transparent',
            border: 'none',
            borderRadius: '12px',
            color: '#ffffff',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: activeTab === 'daily' ? '0 4px 20px rgba(99, 102, 241, 0.3)' : 'none'
          }}
        >
          📅 Daily
        </button>
        <button
          onClick={() => setActiveTab('weekly')}
          style={{
            flex: 1,
            padding: '12px 24px',
            background: activeTab === 'weekly' 
              ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
              : 'transparent',
            border: 'none',
            borderRadius: '12px',
            color: '#ffffff',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: activeTab === 'weekly' ? '0 4px 20px rgba(99, 102, 241, 0.3)' : 'none'
          }}
        >
          🗓️ Weekly
        </button>
      </div>

      {/* Game Filter */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '2rem',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => setGameFilter('all')}
          style={{
            padding: '12px 24px',
            background: gameFilter === 'all' 
              ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' 
              : 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)',
            boxShadow: gameFilter === 'all' ? '0 4px 20px rgba(99, 102, 241, 0.3)' : 'none'
          }}
        >
          🎮 All Games
        </button>
        <button
          onClick={() => setGameFilter('aim')}
          style={{
            padding: '12px 24px',
            background: gameFilter === 'aim' 
              ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' 
              : 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)',
            boxShadow: gameFilter === 'aim' ? '0 4px 20px rgba(99, 102, 241, 0.3)' : 'none'
          }}
        >
          🎯 Aim Drill
        </button>
        <button
          onClick={() => setGameFilter('typing')}
          style={{
            padding: '12px 24px',
            background: gameFilter === 'typing' 
              ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' 
              : 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)',
            boxShadow: gameFilter === 'typing' ? '0 4px 20px rgba(99, 102, 241, 0.3)' : 'none'
          }}
        >
          ⌨️ Typing Drill
        </button>
      </div>

      {/* Leaderboard Table */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
      }}>
        {/* Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '80px 1fr 150px 120px',
          gap: '20px',
          padding: '24px 32px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
          borderBottom: '2px solid rgba(99, 102, 241, 0.3)',
          fontWeight: '700',
          fontSize: '14px',
          color: 'rgba(255, 255, 255, 0.8)',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          <div>🏆 Rank</div>
          <div>👤 Player</div>
          <div>⭐ Score</div>
          <div>🎯 Accuracy</div>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{
            padding: '80px',
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.6)'
          }}>
            <div style={{ 
              fontSize: '64px', 
              marginBottom: '24px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>⏳</div>
            <p style={{ fontSize: '18px', fontWeight: '600' }}>Loading leaderboard...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div style={{
            padding: '80px',
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.6)'
          }}>
            <div style={{ 
              fontSize: '64px', 
              marginBottom: '24px',
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>🏆</div>
            <p style={{ 
              fontSize: '24px', 
              marginBottom: '12px',
              fontWeight: '700',
              color: '#ffffff'
            }}>No scores yet</p>
            <p style={{ 
              fontSize: '16px', 
              color: 'rgba(255, 255, 255, 0.5)',
              maxWidth: '400px',
              margin: '0 auto'
            }}>
              {activeTab === 'friends' && !currentUser 
                ? 'Login to see your friends leaderboard'
                : activeTab === 'friends'
                  ? 'Add friends and start playing to see scores'
                  : 'Be the first to set a score!'}
            </p>
          </div>
        ) : (
          leaderboard.map((entry, index) => {
            const isCurrentUser = currentUser && entry.userId === currentUser.uid
            const rank = index + 1
            const medalEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : ''

            return (
              <div 
                key={`${entry.userId}-${entry.timestamp.toMillis()}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 1fr 150px 120px',
                  gap: '20px',
                  padding: '24px 32px',
                  borderBottom: index < leaderboard.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                  background: isCurrentUser 
                    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)' 
                    : 'transparent',
                  transition: 'all 0.3s ease',
                  cursor: 'default',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  if (!isCurrentUser) {
                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isCurrentUser) {
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                {/* Gradient overlay for top 3 */}
                {rank <= 3 && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: rank === 1 
                      ? 'linear-gradient(90deg, rgba(251, 191, 36, 0.1) 0%, transparent 100%)'
                      : rank === 2
                        ? 'linear-gradient(90deg, rgba(192, 192, 192, 0.1) 0%, transparent 100%)'
                        : 'linear-gradient(90deg, rgba(205, 127, 50, 0.1) 0%, transparent 100%)',
                    pointerEvents: 'none'
                  }} />
                )}

                {/* Rank */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '20px',
                  fontWeight: '800',
                  color: rank <= 3 
                    ? (rank === 1 ? '#fbbf24' : rank === 2 ? '#c0c0c0' : '#cd7f32')
                    : '#ffffff',
                  position: 'relative'
                }}>
                  {medalEmoji ? (
                    <span style={{ fontSize: '28px' }}>{medalEmoji}</span>
                  ) : (
                    `#${rank}`
                  )}
                </div>

                {/* Player */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '16px',
                  position: 'relative'
                }}>
                  <img 
                    src={entry.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(entry.displayName)}&background=6366f1&color=fff&size=128`}
                    alt={entry.displayName}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      border: '3px solid rgba(99, 102, 241, 0.5)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                    }}
                  />
                  <div>
                    <div style={{
                      color: '#ffffff',
                      fontSize: '18px',
                      fontWeight: '700',
                      marginBottom: '4px'
                    }}>
                      {entry.displayName} {isCurrentUser && '(You)'}
                    </div>
                    <div style={{
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}>
                      {entry.gameType === 'aim' ? '🎯 Aim Training' : '⌨️ Typing Practice'}
                      {entry.wave && ` • Wave ${entry.wave}`}
                      {entry.kills && ` • ${entry.kills} eliminations`}
                    </div>
                  </div>
                </div>

                {/* Score */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '24px',
                  fontWeight: '800',
                  color: '#fbbf24',
                  position: 'relative'
                }}>
                  {entry.score.toLocaleString()}
                </div>

                {/* Accuracy */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '18px',
                  fontWeight: '700',
                  color: entry.accuracy >= 95 ? '#22c55e' : entry.accuracy >= 85 ? '#eab308' : '#ef4444',
                  position: 'relative'
                }}>
                  {entry.accuracy.toFixed(1)}%
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
