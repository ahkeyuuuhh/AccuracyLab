export default function Settings() {
  return (
    <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '36px',
          fontWeight: '700',
          color: '#f1f5f9',
          marginBottom: '8px'
        }}>Settings</h1>
        <p style={{ fontSize: '16px', color: '#94a3b8' }}>Customize your experience</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Game Settings */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          borderRadius: '20px',
          padding: '32px',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#f1f5f9',
            marginBottom: '24px'
          }}>Game Settings</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#cbd5e1'
                }}>Sound Volume</label>
                <span style={{ fontSize: '14px', color: '#94a3b8' }}>70%</span>
              </div>
              <input type="range" min="0" max="100" defaultValue="70" style={{
                width: '100%',
                height: '6px',
                borderRadius: '3px',
                background: 'rgba(148, 163, 184, 0.2)',
                outline: 'none',
                cursor: 'pointer'
              }} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#cbd5e1'
                }}>Music Volume</label>
                <span style={{ fontSize: '14px', color: '#94a3b8' }}>50%</span>
              </div>
              <input type="range" min="0" max="100" defaultValue="50" style={{
                width: '100%',
                height: '6px',
                borderRadius: '3px',
                background: 'rgba(148, 163, 184, 0.2)',
                outline: 'none',
                cursor: 'pointer'
              }} />
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          borderRadius: '20px',
          padding: '32px',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#f1f5f9',
            marginBottom: '24px'
          }}>Display Settings</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              background: 'rgba(99, 102, 241, 0.05)',
              borderRadius: '10px',
              border: '1px solid rgba(99, 102, 241, 0.1)'
            }}>
              <input type="checkbox" id="effects" defaultChecked style={{
                width: '20px',
                height: '20px',
                cursor: 'pointer'
              }} />
              <label htmlFor="effects" style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#cbd5e1',
                cursor: 'pointer'
              }}>Enable Visual Effects</label>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              background: 'rgba(99, 102, 241, 0.05)',
              borderRadius: '10px',
              border: '1px solid rgba(99, 102, 241, 0.1)'
            }}>
              <input type="checkbox" id="fullscreen" style={{
                width: '20px',
                height: '20px',
                cursor: 'pointer'
              }} />
              <label htmlFor="fullscreen" style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#cbd5e1',
                cursor: 'pointer'
              }}>Fullscreen Mode</label>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          borderRadius: '20px',
          padding: '32px',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#f1f5f9',
            marginBottom: '24px'
          }}>Account</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#cbd5e1',
                marginBottom: '8px'
              }}>Email</label>
              <input type="email" placeholder="your.email@example.com" style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '10px',
                color: '#f1f5f9',
                fontSize: '14px'
              }} />
            </div>
            <button style={{
              padding: '12px 24px',
              background: 'rgba(148, 163, 184, 0.1)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '10px',
              color: '#cbd5e1',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              width: 'fit-content'
            }}>Change Password</button>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          <button style={{
            padding: '14px 28px',
            background: 'rgba(148, 163, 184, 0.1)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '12px',
            color: '#cbd5e1',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}>Reset to Default</button>
          <button style={{
            padding: '14px 28px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            border: 'none',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}>Save Changes</button>
        </div>
      </div>
    </div>
  )
}
