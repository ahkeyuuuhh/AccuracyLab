import { useState, useEffect } from 'react'
import type { User } from 'firebase/auth'
import { Target, Keyboard, TrendingUp, Award, Clock, Zap, Star, Trophy, BarChart3, Activity, Calendar } from 'lucide-react'
import { getUserProfile, type UserProfile } from '../firebase/userService'
import { getUserAchievements, getAchievementStats, type UserAchievements } from '../firebase/achievementsService'
import { getGlobalLeaderboard, type LeaderboardEntry } from '../firebase/leaderboardService'

export default function Profile({ currentUser }: { currentUser: User | null }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [achievements, setAchievements] = useState<UserAchievements | null>(null)
  const [achievementStats, setAchievementStats] = useState({ totalAchievements: 17, unlockedAchievements: 0, completionPercentage: 0 })
  const [recentGames, setRecentGames] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [bestScores, setBestScores] = useState({ aim: 0, typing: 0 })

  useEffect(() => {
    const loadProfileData = async () => {
      if (!currentUser) {
        setLoading(false)
        return
      }

      try {
        console.log('Loading profile for user:', currentUser.uid)

        // Load user profile
        const profile = await getUserProfile(currentUser.uid)
        setUserProfile(profile)
        console.log('Profile loaded:', profile)

        // Load achievements
        const userAchievements = await getUserAchievements(currentUser.uid)
        setAchievements(userAchievements)
        console.log('Achievements loaded:', userAchievements)

        // Get achievement stats
        const stats = await getAchievementStats(currentUser.uid)
        setAchievementStats(stats)
        console.log('Achievement stats:', stats)

        // Load recent games from leaderboard
        const allGames = await getGlobalLeaderboard('all', 1000)
        const userGames = allGames
          .filter(game => game.userId === currentUser.uid)
          .sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis())
          .slice(0, 10)
        
        setRecentGames(userGames)
        console.log('Recent games loaded:', userGames.length)

        // Calculate best scores
        const aimGames = userGames.filter(g => g.gameType === 'aim')
        const typingGames = userGames.filter(g => g.gameType === 'typing')
        setBestScores({
          aim: aimGames.length > 0 ? Math.max(...aimGames.map(g => g.score)) : 0,
          typing: typingGames.length > 0 ? Math.max(...typingGames.map(g => g.score)) : 0
        })

      } catch (error) {
        console.error('Error loading profile data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProfileData()
  }, [currentUser])

  if (!currentUser) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '48px',
          textAlign: 'center',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>🔒</div>
          <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', marginBottom: '12px' }}>
            Authentication Required
          </h2>
          <p style={{ color: '#64748b', fontSize: '16px', maxWidth: '320px' }}>
            Please sign in to access your profile and view your gaming statistics.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '48px',
          textAlign: 'center',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #6366f1',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 24px'
          }}></div>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
            Loading Profile
          </h2>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            Fetching your gaming statistics...
          </p>
        </div>
      </div>
    )
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown'
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    } catch {
      return 'Unknown'
    }
  }

  const formatTimeAgo = (timestamp: any) => {
    if (!timestamp) return 'Unknown'
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
      
      if (seconds < 60) return 'Just now'
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
      if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
      if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
      return formatDate(timestamp)
    } catch {
      return 'Unknown'
    }
  }

  const totalGames = achievements?.stats.totalGamesPlayed || 0
  const avgAccuracy = achievements?.stats.bestAccuracy?.toFixed(1) || '0.0'
  const totalPlaytime = achievements?.stats.totalPlayTime || 0
  const playtimeHours = Math.floor(totalPlaytime / 3600)
  const playtimeMinutes = Math.floor((totalPlaytime % 3600) / 60)

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      padding: '32px 24px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Enhanced Header Section */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: '32px',
          padding: '40px',
          marginBottom: '32px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background decoration */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}></div>
          
          {/* Coins indicator */}
          <div style={{
            position: 'absolute',
            top: '24px',
            right: '24px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            borderRadius: '20px',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 10px 25px rgba(245, 158, 11, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ color: '#fbbf24', fontSize: '20px' }}>💰</div>
            <div>
              <div style={{ color: '#fff', fontSize: '18px', fontWeight: '700', lineHeight: '1' }}>0</div>
              <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '12px', lineHeight: '1' }}>Coins</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px', position: 'relative', zIndex: 1 }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '32px',
              background: currentUser.photoURL ? `url(${currentUser.photoURL})` : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '4px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
              position: 'relative'
            }}>
              {!currentUser.photoURL && (
                <span style={{ 
                  fontSize: '48px', 
                  fontWeight: '700', 
                  color: '#fff',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' 
                }}>
                  {currentUser.displayName?.[0]?.toUpperCase() || 'C'}
                </span>
              )}
              {/* Status indicator */}
              <div style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                width: '24px',
                height: '24px',
                background: '#22c55e',
                borderRadius: '50%',
                border: '3px solid #fff',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
              }}></div>
            </div>
            
            <div style={{ flex: 1 }}>
              <h1 style={{
                fontSize: '36px',
                fontWeight: '800',
                color: '#fff',
                marginBottom: '8px',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                letterSpacing: '-0.025em'
              }}>
                {currentUser.displayName || 'Anonymous Player'}
              </h1>
              <p style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '16px',
                marginBottom: '16px',
                fontWeight: '500'
              }}>
                {currentUser.email}
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                flexWrap: 'wrap'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '8px 16px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <Calendar size={16} color="rgba(255, 255, 255, 0.8)" />
                  <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px', fontWeight: '500' }}>
                    Member since {formatDate(userProfile?.createdAt)}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(34, 197, 94, 0.2)',
                  borderRadius: '16px',
                  padding: '8px 16px',
                  border: '1px solid rgba(34, 197, 94, 0.3)'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    background: '#22c55e',
                    borderRadius: '50%',
                    boxShadow: '0 0 8px #22c55e'
                  }}></div>
                  <span style={{ color: '#22c55e', fontSize: '14px', fontWeight: '600' }}>Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          {[
            { 
              title: 'Games Played',
              value: totalGames.toLocaleString(),
              icon: <Activity size={24} />,
              color: '#6366f1',
              bgColor: 'rgba(99, 102, 241, 0.1)',
              trend: '+12%'
            },
            {
              title: 'Avg Accuracy', 
              value: `${avgAccuracy}%`,
              icon: <Target size={24} />,
              color: '#10b981',
              bgColor: 'rgba(16, 185, 129, 0.1)',
              trend: '+5.2%'
            },
            {
              title: 'Achievements',
              value: `${achievementStats.unlockedAchievements}/${achievementStats.totalAchievements}`,
              icon: <Trophy size={24} />,
              color: '#f59e0b',
              bgColor: 'rgba(245, 158, 11, 0.1)',
              progress: (achievementStats.unlockedAchievements / achievementStats.totalAchievements) * 100
            },
            {
              title: 'Total Playtime',
              value: `${playtimeHours}h ${playtimeMinutes}m`,
              icon: <Clock size={24} />,
              color: '#8b5cf6',
              bgColor: 'rgba(139, 92, 246, 0.1)',
              trend: '+2.1h'
            }
          ].map((stat, index) => (
            <div key={index} style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: '32px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)'
              e.currentTarget.style.boxShadow = '0 30px 60px rgba(0, 0, 0, 0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, ${stat.color} 0%, transparent 100%)`
              }}></div>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: stat.bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: stat.color,
                  border: `1px solid ${stat.color}30`
                }}>
                  {stat.icon}
                </div>
                
                {stat.trend && (
                  <div style={{
                    background: 'rgba(34, 197, 94, 0.1)',
                    color: '#22c55e',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    border: '1px solid rgba(34, 197, 94, 0.2)'
                  }}>
                    <TrendingUp size={12} />
                    {stat.trend}
                  </div>
                )}
              </div>
              
              <h3 style={{
                fontSize: '32px',
                fontWeight: '800',
                color: '#fff',
                marginBottom: '8px',
                letterSpacing: '-0.025em'
              }}>
                {stat.value}
              </h3>
              
              <p style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '16px',
                fontWeight: '500',
                marginBottom: stat.progress !== undefined ? '16px' : '0'
              }}>
                {stat.title}
              </p>
              
              {stat.progress !== undefined && (
                <div>
                  <div style={{
                    width: '100%',
                    height: '6px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '3px',
                    overflow: 'hidden',
                    marginBottom: '8px'
                  }}>
                    <div style={{
                      width: `${stat.progress}%`,
                      height: '100%',
                      background: `linear-gradient(90deg, ${stat.color} 0%, ${stat.color}80 100%)`,
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                  <span style={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {stat.progress.toFixed(0)}% Complete
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Performance Metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          {[
            { title: 'Best Aim Score', value: bestScores.aim.toLocaleString(), icon: <Target size={20} />, color: '#ef4444' },
            { title: 'Best Typing Score', value: bestScores.typing.toLocaleString(), icon: <Keyboard size={20} />, color: '#8b5cf6' },
            { title: 'Highest Wave', value: (achievements?.stats.highestWave || 0).toLocaleString(), icon: <Zap size={20} />, color: '#f59e0b' },
            { title: 'Total Eliminations', value: (achievements?.stats.totalKills || 0).toLocaleString(), icon: <Star size={20} />, color: '#10b981' }
          ].map((metric, index) => (
            <div key={index} style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `linear-gradient(135deg, ${metric.color}20 0%, ${metric.color}10 100%)`
              e.currentTarget.style.borderColor = `${metric.color}40`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)'
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: `${metric.color}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: metric.color,
                border: `1px solid ${metric.color}30`
              }}>
                {metric.icon}
              </div>
              <div>
                <h4 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#fff',
                  marginBottom: '4px',
                  letterSpacing: '-0.025em'
                }}>
                  {metric.value}
                </h4>
                <p style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  {metric.title}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity Section */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: '32px',
          padding: '40px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '32px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '16px',
              background: 'rgba(99, 102, 241, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(99, 102, 241, 0.3)'
            }}>
              <BarChart3 size={24} color="#6366f1" />
            </div>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#fff',
              letterSpacing: '-0.025em'
            }}>
              Recent Games
            </h2>
          </div>

          {recentGames.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '24px', opacity: 0.5 }}>🎮</div>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: 'rgba(255, 255, 255, 0.9)',
                marginBottom: '12px'
              }}>
                No Games Yet
              </h3>
              <p style={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '16px',
                maxWidth: '400px',
                margin: '0 auto'
              }}>
                Start your accuracy training journey! Your game history and achievements will appear here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {recentGames.map((game, index) => (
                <div key={index} style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '20px',
                  padding: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                  e.currentTarget.style.transform = 'translateX(8px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                  e.currentTarget.style.transform = 'translateX(0)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '14px',
                      background: game.gameType === 'aim' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(139, 92, 246, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `1px solid ${game.gameType === 'aim' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(139, 92, 246, 0.3)'}`
                    }}>
                      {game.gameType === 'aim' ? 
                        <Target size={20} color="#6366f1" /> : 
                        <Keyboard size={20} color="#8b5cf6" />
                      }
                    </div>
                    <div>
                      <h4 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#fff',
                        marginBottom: '4px'
                      }}>
                        {game.gameType === 'aim' ? 'Aim Trainer' : 'Typing Drill'}
                      </h4>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        fontSize: '14px',
                        color: 'rgba(255, 255, 255, 0.7)'
                      }}>
                        <span>Score: <strong style={{ color: '#fff' }}>{game.score.toLocaleString()}</strong></span>
                        <span>•</span>
                        <span>Accuracy: <strong style={{ color: '#22c55e' }}>{game.accuracy.toFixed(1)}%</strong></span>
                        <span>•</span>
                        <span>Wave: <strong style={{ color: '#f59e0b' }}>{game.wave || 0}</strong></span>
                      </div>
                    </div>
                  </div>
                  <div style={{
                    textAlign: 'right'
                  }}>
                    <div style={{
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}>
                      {formatTimeAgo(game.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
