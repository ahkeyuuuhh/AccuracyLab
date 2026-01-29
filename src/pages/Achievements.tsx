import { useState, useEffect } from 'react'
import type { User } from 'firebase/auth'
import { Lock, Keyboard, Target, Gamepad2, Users, Trophy, Star, Award, Filter, TrendingUp } from 'lucide-react'
import { getUserAchievements, getAchievementStats, type Achievement } from '../firebase/achievementsService'

interface AchievementsProps {
  currentUser: User | null
}

type CategoryFilter = 'all' | 'typing' | 'aim' | 'general' | 'social'

export default function Achievements({ currentUser }: AchievementsProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalAchievements: 0,
    unlockedAchievements: 0,
    completionPercentage: 0
  })
  const [userStats, setUserStats] = useState({
    totalGamesPlayed: 0,
    totalPlayTime: 0,
    highestWave: 0,
    totalKills: 0,
    bestAccuracy: 0,
    perfectGames: 0
  })
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')

  useEffect(() => {
    if (currentUser) {
      loadAchievements()
    } else {
      setLoading(false)
    }
  }, [currentUser])

  const loadAchievements = async () => {
    if (!currentUser) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      console.log('Loading achievements for user:', currentUser.uid)
      const userData = await getUserAchievements(currentUser.uid)
      console.log('User data loaded:', userData)
      const achievementStats = await getAchievementStats(currentUser.uid)
      console.log('Stats loaded:', achievementStats)
      
      setAchievements(userData.achievements)
      setStats(achievementStats)
      setUserStats(userData.stats)
    } catch (error) {
      console.error('Error loading achievements:', error)
      alert('Failed to load achievements: ' + error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAchievements = categoryFilter === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === categoryFilter)

  const formatPlayTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  if (!currentUser) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        padding: '32px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: '32px',
          padding: '60px',
          textAlign: 'center' as const,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
          maxWidth: '500px'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 20px 40px rgba(245, 158, 11, 0.3)'
          }}>
            <Lock size={40} color="#fff" />
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#fff', marginBottom: '12px' }}>
            Authentication Required
          </h2>
          <p style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.7)' }}>
            Sign in to track your achievements and unlock new milestones
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      padding: '32px 24px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Header Section */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: '32px',
          padding: '40px',
          marginBottom: '32px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
          textAlign: 'center' as const
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 20px 40px rgba(245, 158, 11, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <Trophy size={40} color="#fff" />
          </div>
          <h1 style={{
            fontSize: '36px',
            fontWeight: '800',
            color: '#fff',
            marginBottom: '12px',
            letterSpacing: '-0.025em'
          }}>
            Achievements
          </h1>
          <p style={{
            fontSize: '16px',
            color: 'rgba(255, 255, 255, 0.7)',
            maxWidth: '500px',
            margin: '0 auto'
          }}>
            Track your progress and unlock milestones as you master your skills
          </p>
        </div>

        {loading ? (
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '60px',
            textAlign: 'center' as const,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
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
            <h3 style={{ color: '#fff', fontSize: '20px', marginBottom: '8px' }}>Loading Achievements</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Fetching your progress...</p>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px',
              marginBottom: '32px'
            }}>
              {[
                {
                  title: 'Achievements',
                  value: `${stats.unlockedAchievements}/${stats.totalAchievements}`,
                  subtitle: 'Unlocked',
                  color: '#f59e0b',
                  bgColor: 'rgba(245, 158, 11, 0.1)',
                  icon: <Award size={24} />,
                  progress: stats.completionPercentage
                },
                {
                  title: 'Completion',
                  value: `${stats.completionPercentage}%`,
                  subtitle: 'Progress',
                  color: '#22c55e',
                  bgColor: 'rgba(34, 197, 94, 0.1)',
                  icon: <TrendingUp size={24} />,
                  trend: '+12%'
                },
                {
                  title: 'Games Played',
                  value: userStats.totalGamesPlayed.toLocaleString(),
                  subtitle: 'Training Sessions',
                  color: '#6366f1',
                  bgColor: 'rgba(99, 102, 241, 0.1)',
                  icon: <Gamepad2 size={24} />
                },
                {
                  title: 'Playtime',
                  value: formatPlayTime(userStats.totalPlayTime),
                  subtitle: 'Total Practice',
                  color: '#8b5cf6',
                  bgColor: 'rgba(139, 92, 246, 0.1)',
                  icon: <Star size={24} />
                }
              ].map((stat, index) => (
                <div key={index} style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '24px',
                  padding: '32px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  position: 'relative'
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
                  
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: stat.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: stat.color,
                    marginBottom: '20px',
                    border: `1px solid ${stat.color}30`
                  }}>
                    {stat.icon}
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
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '16px',
                    fontWeight: '600',
                    marginBottom: '4px'
                  }}>
                    {stat.title}
                  </p>
                  
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    {stat.subtitle}
                  </p>
                  
                  {stat.progress !== undefined && (
                    <div style={{ marginTop: '16px' }}>
                      <div style={{
                        width: '100%',
                        height: '6px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '3px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${stat.progress}%`,
                          height: '100%',
                          background: `linear-gradient(90deg, ${stat.color} 0%, ${stat.color}80 100%)`,
                          transition: 'width 0.3s ease'
                        }}></div>
                      </div>
                    </div>
                  )}
                  
                  {stat.trend && (
                    <div style={{
                      position: 'absolute',
                      top: '24px',
                      right: '24px',
                      background: 'rgba(34, 197, 94, 0.1)',
                      color: '#22c55e',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {stat.trend}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Category Filters */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '24px',
              marginBottom: '32px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '20px'
              }}>
                <Filter size={20} color="#6366f1" />
                <span style={{ color: '#fff', fontSize: '18px', fontWeight: '600' }}>Filter by Category</span>
              </div>
              
              <div style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap'
              }}>
                {[
                  { key: 'all', label: 'All', icon: <Trophy size={16} />, color: '#6366f1' },
                  { key: 'aim', label: 'Aim', icon: <Target size={16} />, color: '#ef4444' },
                  { key: 'typing', label: 'Typing', icon: <Keyboard size={16} />, color: '#8b5cf6' },
                  { key: 'general', label: 'General', icon: <Gamepad2 size={16} />, color: '#10b981' },
                  { key: 'social', label: 'Social', icon: <Users size={16} />, color: '#f59e0b' }
                ].map((category) => (
                  <button
                    key={category.key}
                    onClick={() => setCategoryFilter(category.key as CategoryFilter)}
                    style={{
                      background: categoryFilter === category.key 
                        ? `${category.color}20` 
                        : 'rgba(255, 255, 255, 0.05)',
                      border: categoryFilter === category.key 
                        ? `2px solid ${category.color}` 
                        : '2px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '16px',
                      padding: '12px 20px',
                      color: categoryFilter === category.key ? category.color : 'rgba(255, 255, 255, 0.8)',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      if (categoryFilter !== category.key) {
                        e.currentTarget.style.borderColor = `${category.color}60`
                        e.currentTarget.style.background = `${category.color}10`
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (categoryFilter !== category.key) {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                      }
                    }}
                  >
                    {category.icon}
                    {category.label}
                    <span style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '10px',
                      padding: '2px 8px',
                      fontSize: '12px',
                      marginLeft: '4px'
                    }}>
                      {category.key === 'all' 
                        ? achievements.length 
                        : achievements.filter(a => a.category === category.key).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Achievement Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '24px'
            }}>
              {filteredAchievements.map((achievement, index) => (
                <div key={achievement.id} style={{
                  background: achievement.isUnlocked 
                    ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '20px',
                  padding: '28px',
                  border: achievement.isUnlocked 
                    ? '1px solid rgba(34, 197, 94, 0.3)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)'
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)'
                }}>
                  
                  {achievement.isUnlocked && (
                    <div style={{
                      position: 'absolute',
                      top: '20px',
                      right: '20px',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 8px 20px rgba(34, 197, 94, 0.4)'
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <polyline points="20,6 9,17 4,12"></polyline>
                      </svg>
                    </div>
                  )}
                  
                  <div style={{
                    fontSize: '48px',
                    marginBottom: '20px',
                    opacity: achievement.isUnlocked ? 1 : 0.4,
                    filter: achievement.isUnlocked ? 'none' : 'grayscale(100%)',
                    transition: 'all 0.3s ease'
                  }}>
                    {achievement.icon}
                  </div>
                  
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: achievement.isUnlocked ? '#fff' : 'rgba(255, 255, 255, 0.6)',
                    marginBottom: '12px',
                    letterSpacing: '-0.025em'
                  }}>
                    {achievement.title}
                  </h3>
                  
                  <p style={{
                    fontSize: '14px',
                    color: achievement.isUnlocked 
                      ? 'rgba(255, 255, 255, 0.8)' 
                      : 'rgba(255, 255, 255, 0.5)',
                    lineHeight: '1.5',
                    marginBottom: '16px'
                  }}>
                    {achievement.description}
                  </p>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{
                      fontSize: '12px',
                      color: achievement.isUnlocked ? '#22c55e' : 'rgba(255, 255, 255, 0.4)',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                      {achievement.isUnlocked ? 'Unlocked' : 'Locked'}
                    </span>
                    
                    {achievement.unlockedAt && (
                      <span style={{
                        fontSize: '12px',
                        color: 'rgba(255, 255, 255, 0.5)'
                      }}>
                        {new Date(achievement.unlockedAt.toDate()).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
