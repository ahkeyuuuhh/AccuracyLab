import { Palette, Music, Target, Crown, Sparkles, Frame, Coins } from 'lucide-react'

export default function Store() {
  const storeItems = [
    { name: 'Premium Theme Pack', price: 500, icon: Palette, type: 'Theme', featured: true },
    { name: 'Elite Sound Pack', price: 300, icon: Music, type: 'Audio', featured: false },
    { name: 'Golden Target Set', price: 750, icon: Target, type: 'Target', featured: false },
    { name: 'VIP Badge', price: 1000, icon: Crown, type: 'Badge', featured: true },
    { name: 'Particle Effects Pro', price: 600, icon: Sparkles, type: 'Effects', featured: false },
    { name: 'Exclusive Avatar Frame', price: 450, icon: Frame, type: 'Cosmetic', featured: false },
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
          Premium Store
        </h1>
        <p style={{
          fontSize: '1.25rem',
          color: 'rgba(255, 255, 255, 0.7)',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          Enhance your gaming experience with premium cosmetics and effects
        </p>
      </div>

      {/* Currency Display */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '3rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '20px 32px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Coins size={24} />
            </div>
            <span style={{ 
              fontSize: '28px', 
              fontWeight: '800', 
              color: '#fbbf24' 
            }}>
              2,340
            </span>
          </div>
          <button style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            border: 'none',
            borderRadius: '12px',
            color: '#ffffff',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 6px 25px rgba(99, 102, 241, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(99, 102, 241, 0.3)'
          }}>
            💎 Buy Coins
          </button>
        </div>
      </div>

      {/* Store Items Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '2rem',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {storeItems.map((item, index) => (
          <div 
            key={index} 
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: item.featured 
                ? '2px solid rgba(251, 191, 36, 0.5)' 
                : '1px solid rgba(255, 255, 255, 0.1)',
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
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.4)'
            }}
          >
            {item.featured && (
              <>
                {/* Featured glow effect */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(45deg, rgba(251, 191, 36, 0.1) 0%, transparent 100%)',
                  pointerEvents: 'none'
                }} />
                
                {/* Featured badge */}
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                  padding: '6px 16px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#000000',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  boxShadow: '0 4px 12px rgba(251, 191, 36, 0.4)'
                }}>
                  ⭐ Featured
                </div>
              </>
            )}

            {/* Item Icon */}
            <div style={{
              width: '96px',
              height: '96px',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px',
              border: '2px solid rgba(99, 102, 241, 0.3)',
              boxShadow: '0 8px 24px rgba(99, 102, 241, 0.2)'
            }}>
              <item.icon size={48} color="#818cf8" />
            </div>

            {/* Item Type Badge */}
            <div style={{
              display: 'inline-block',
              padding: '6px 16px',
              background: 'rgba(99, 102, 241, 0.2)',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '600',
              color: '#818cf8',
              marginBottom: '16px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {item.type}
            </div>

            {/* Item Name */}
            <h3 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#ffffff',
              marginBottom: '24px',
              lineHeight: '1.2'
            }}>
              {item.name}
            </h3>

            {/* Purchase Section */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '24px',
              borderTop: '2px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Coins size={16} />
                </div>
                <span style={{ 
                  fontSize: '24px', 
                  fontWeight: '800', 
                  color: '#fbbf24' 
                }}>
                  {item.price.toLocaleString()}
                </span>
              </div>
              
              <button style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                border: 'none',
                borderRadius: '12px',
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 25px rgba(99, 102, 241, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(99, 102, 241, 0.3)'
              }}>
                🛒 Purchase
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
