import { Target, Trophy, Users, TrendingUp, Play, Gamepad2, Medal, BarChart3, Clock, Zap } from 'lucide-react'

export default function Home() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      padding: '32px 24px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Enhanced Hero Section */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: '32px',
          padding: '60px 50px',
          marginBottom: '40px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          overflow: 'hidden',
          textAlign: 'center'
        }}>
          {/* Background decoration */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}></div>
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 32px',
              boxShadow: '0 20px 40px rgba(99, 102, 241, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <Target size={40} color="#fff" />
            </div>
            
            <h1 style={{
              fontSize: '48px',
              fontWeight: '800',
              color: '#fff',
              marginBottom: '20px',
              letterSpacing: '-0.025em',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}>Welcome to AccuracyLab</h1>
            
            <p style={{
              fontSize: '20px',
              color: 'rgba(255, 255, 255, 0.8)',
              maxWidth: '600px',
              lineHeight: '1.6',
              margin: '0 auto 32px',
              fontWeight: '500'
            }}>
              Master your aim and typing skills through immersive 3D training experiences designed for gamers and professionals alike.
            </p>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '20px',
              flexWrap: 'wrap'
            }}>
              <button style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: '#fff',
                border: 'none',
                padding: '16px 32px',
                borderRadius: '16px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 15px 35px rgba(99, 102, 241, 0.5)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(99, 102, 241, 0.4)'
              }}>
                <Play size={20} />
                Start Training
              </button>
              
              <button style={{
                background: 'transparent',
                color: 'rgba(255, 255, 255, 0.9)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                padding: '16px 32px',
                borderRadius: '16px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)'
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                e.currentTarget.style.background = 'transparent'
              }}>
                <BarChart3 size={20} />
                View Stats
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Quick Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '40px'
        }}>
          {[
            { 
              title: 'Games Played',
              value: '0',
              icon: <Gamepad2 size={24} />,
              color: '#6366f1',
              bgColor: 'rgba(99, 102, 241, 0.1)',
              description: 'Training sessions completed'
            },
            {
              title: 'Achievements', 
              value: '0/17',
              icon: <Medal size={24} />,
              color: '#f59e0b',
              bgColor: 'rgba(245, 158, 11, 0.1)',
              description: 'Milestones unlocked',
              progress: 0
            },
            {
              title: 'Global Rank',
              value: '--',
              icon: <Trophy size={24} />,
              color: '#10b981',
              bgColor: 'rgba(16, 185, 129, 0.1)',
              description: 'Worldwide ranking'
            },
            {
              title: 'Training Time',
              value: '0h 0m',
              icon: <Clock size={24} />,
              color: '#8b5cf6',
              bgColor: 'rgba(139, 92, 246, 0.1)',
              description: 'Total practice time'
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
              position: 'relative',
              overflow: 'hidden'
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
                marginBottom: '8px'
              }}>
                {stat.title}
              </p>
              
              <p style={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {stat.description}
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
            </div>
          ))}
        </div>

        {/* Enhanced Getting Started Section */}
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
              <Zap size={24} color="#6366f1" />
            </div>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#fff',
              letterSpacing: '-0.025em'
            }}>
              Quick Start Guide
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '20px'
          }}>
            {[
              {
                icon: <Target size={24} />,
                title: 'Start Training',
                description: 'Choose between Aim Drill for precision training or Typing Drill for speed enhancement',
                color: '#6366f1',
                action: 'Begin Now'
              },
              {
                icon: <Trophy size={24} />,
                title: 'Track Progress',
                description: 'Monitor your improvement through detailed statistics and unlock achievement milestones',
                color: '#8b5cf6',
                action: 'View Progress'
              },
              {
                icon: <Users size={24} />,
                title: 'Connect & Compete',
                description: 'Add friends, compare scores, and climb the global leaderboards together',
                color: '#10b981',
                action: 'Add Friends'
              }
            ].map((item, index) => (
              <div key={index} style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '20px',
                padding: '28px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${item.color}15`
                e.currentTarget.style.borderColor = `${item.color}40`
                e.currentTarget.style.transform = 'translateY(-4px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: `${item.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: item.color,
                  marginBottom: '20px',
                  border: `1px solid ${item.color}30`
                }}>
                  {item.icon}
                </div>
                
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#fff',
                  marginBottom: '12px'
                }}>
                  {item.title}
                </h3>
                
                <p style={{
                  fontSize: '15px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  lineHeight: '1.5',
                  marginBottom: '20px'
                }}>
                  {item.description}
                </p>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: item.color,
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'gap 0.3s ease'
                }}>
                  <span>{item.action}</span>
                  <TrendingUp size={16} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
