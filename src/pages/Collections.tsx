import { Palette, Music, Target, Sparkles, Trophy, Gem } from 'lucide-react'

export default function Collections() {
  const collections = [
    { icon: Palette, name: 'Themes', unlocked: 5, total: 12, color: '#6366f1' },
    { icon: Music, name: 'Sound Packs', unlocked: 3, total: 8, color: '#8b5cf6' },
    { icon: Target, name: 'Targets', unlocked: 8, total: 15, color: '#ec4899' },
    { icon: Sparkles, name: 'Effects', unlocked: 6, total: 10, color: '#f59e0b' },
    { icon: Trophy, name: 'Badges', unlocked: 12, total: 20, color: '#10b981' },
    { icon: Gem, name: 'Rare Items', unlocked: 2, total: 6, color: '#06b6d4' },
  ]

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
          Collections
        </h1>
        <p style={{
          fontSize: '1.25rem',
          color: 'rgba(255, 255, 255, 0.7)',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          Showcase your unlocked cosmetics and track your progress
        </p>
      </div>

      {/* Collections Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '2rem',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {collections.map((collection, index) => {
          const percentage = Math.round((collection.unlocked / collection.total) * 100)
          return (
            <div 
              key={index} 
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '24px',
                padding: '32px',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)'
                e.currentTarget.style.boxShadow = '0 30px 60px rgba(0, 0, 0, 0.5)'
                e.currentTarget.style.borderColor = `${collection.color}40`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.4)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
              }}
            >
              {/* Progress bar at top */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '6px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderTopLeftRadius: '24px',
                borderTopRightRadius: '24px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${percentage}%`,
                  background: `linear-gradient(90deg, ${collection.color} 0%, ${collection.color}cc 100%)`,
                  transition: 'width 0.8s ease',
                  boxShadow: `0 0 20px ${collection.color}40`
                }} />
              </div>

              {/* Icon Container */}
              <div style={{
                width: '96px',
                height: '96px',
                borderRadius: '24px',
                background: `linear-gradient(135deg, ${collection.color}20 0%, ${collection.color}10 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px',
                border: `2px solid ${collection.color}30`,
                boxShadow: `0 8px 32px ${collection.color}20`,
                position: 'relative'
              }}>
                <collection.icon size={48} color={collection.color} />
                
                {/* Completion badge for 100% */}
                {percentage === 100 && (
                  <div style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(251, 191, 36, 0.4)'
                  }}>
                    ✓
                  </div>
                )}
              </div>

              {/* Collection Name */}
              <h3 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#ffffff',
                marginBottom: '12px'
              }}>
                {collection.name}
              </h3>

              {/* Progress Info */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ 
                    fontSize: '18px', 
                    fontWeight: '700',
                    color: collection.color 
                  }}>
                    {collection.unlocked}
                  </span>
                  <span style={{ 
                    fontSize: '16px', 
                    color: 'rgba(255, 255, 255, 0.6)' 
                  }}>
                    / {collection.total}
                  </span>
                  <span style={{ 
                    fontSize: '14px', 
                    color: 'rgba(255, 255, 255, 0.5)',
                    marginLeft: '4px'
                  }}>
                    unlocked
                  </span>
                </div>
                <div style={{
                  padding: '6px 12px',
                  background: `${collection.color}20`,
                  borderRadius: '12px',
                  border: `1px solid ${collection.color}30`
                }}>
                  <span style={{ 
                    fontSize: '16px', 
                    fontWeight: '700', 
                    color: collection.color 
                  }}>
                    {percentage}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{
                height: '12px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div style={{
                  height: '100%',
                  width: `${percentage}%`,
                  background: `linear-gradient(90deg, ${collection.color} 0%, ${collection.color}cc 100%)`,
                  borderRadius: '6px',
                  transition: 'width 0.8s ease',
                  boxShadow: `inset 0 2px 4px rgba(255, 255, 255, 0.1), 0 0 20px ${collection.color}30`
                }} />
                
                {/* Progress shimmer effect */}
                {percentage < 100 && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: `${percentage}%`,
                    width: '4px',
                    height: '100%',
                    background: 'rgba(255, 255, 255, 0.6)',
                    borderRadius: '2px',
                    animation: 'shimmer 2s ease-in-out infinite alternate'
                  }} />
                )}
              </div>

              {/* Rarity indicator for rare collections */}
              {collection.name === 'Rare Items' && (
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  padding: '4px 8px',
                  background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                  borderRadius: '8px',
                  fontSize: '10px',
                  fontWeight: '700',
                  color: '#000000',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  ⭐ Rare
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
