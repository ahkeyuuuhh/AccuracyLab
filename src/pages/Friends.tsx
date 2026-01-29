import { useState, useEffect } from 'react'
import type { User } from 'firebase/auth'
import { 
  sendFriendRequest, 
  getPendingFriendRequests, 
  getFriendsList,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  type FriendRequest,
  type Friend
} from '../firebase/friendService'
import { updateFriendCount } from '../firebase/achievementsService'

interface FriendsProps {
  currentUser: User | null
}

export default function Friends({ currentUser }: FriendsProps) {
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'add'>('friends')
  const [friends, setFriends] = useState<Friend[]>([])
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])
  const [emailInput, setEmailInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Load friends and requests
  useEffect(() => {
    if (currentUser) {
      loadFriends()
      loadFriendRequests()
    }
  }, [currentUser])

  const loadFriends = async () => {
    if (!currentUser) return
    const friendsList = await getFriendsList(currentUser.uid)
    setFriends(friendsList)
  }

  const loadFriendRequests = async () => {
    if (!currentUser) return
    const requests = await getPendingFriendRequests(currentUser.uid)
    setFriendRequests(requests)
  }

  const handleSendRequest = async () => {
    if (!currentUser || !emailInput.trim()) {
      setMessage({ type: 'error', text: 'Please enter an email address' })
      return
    }

    setLoading(true)
    setMessage(null)

    const result = await sendFriendRequest(
      currentUser.uid,
      currentUser.email || '',
      currentUser.displayName || 'User',
      currentUser.photoURL || null,
      emailInput.trim()
    )

    setLoading(false)
    setMessage({ type: result.success ? 'success' : 'error', text: result.message })

    if (result.success) {
      setEmailInput('')
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleAcceptRequest = async (requestId: string) => {
    if (!currentUser) return
    setLoading(true)
    const success = await acceptFriendRequest(requestId)
    if (success) {
      await loadFriends()
      await loadFriendRequests()
      // Update achievement progress
      await updateFriendCount(currentUser.uid, friends.length + 1)
      setMessage({ type: 'success', text: 'Friend request accepted!' })
      setTimeout(() => setMessage(null), 3000)
    } else {
      setMessage({ type: 'error', text: 'Failed to accept request' })
    }
    setLoading(false)
  }

  const handleRejectRequest = async (requestId: string) => {
    setLoading(true)
    const success = await rejectFriendRequest(requestId)
    if (success) {
      await loadFriendRequests()
      setMessage({ type: 'success', text: 'Friend request rejected' })
      setTimeout(() => setMessage(null), 3000)
    } else {
      setMessage({ type: 'error', text: 'Failed to reject request' })
    }
    setLoading(false)
  }

  const handleRemoveFriend = async (friendUserId: string, friendName: string) => {
    if (!confirm(`Remove ${friendName} from your friends?`)) return

    if (!currentUser) return
    setLoading(true)
    const success = await removeFriend(currentUser.uid, friendUserId)
    if (success) {
      await loadFriends()
      // Update achievement progress
      await updateFriendCount(currentUser.uid, Math.max(0, friends.length - 1))
      setMessage({ type: 'success', text: 'Friend removed' })
      setTimeout(() => setMessage(null), 3000)
    } else {
      setMessage({ type: 'error', text: 'Failed to remove friend' })
    }
    setLoading(false)
  }

  if (!currentUser) {
    return (
      <div style={{
        padding: '2rem',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(31, 41, 55, 0.95) 100%)',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: '24px',
          padding: '3rem',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🔐</div>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1rem' }}>
            Authentication Required
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Please log in to manage your friends and connect with other players
          </p>
        </div>
      </div>
    )
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
          Friends Network
        </h1>
        <p style={{
          fontSize: '1.25rem',
          color: 'rgba(255, 255, 255, 0.7)',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          Connect with other players and build your gaming community
        </p>
      </div>

      {/* Message */}
      {message && (
        <div style={{
          maxWidth: '600px',
          margin: '0 auto 2rem auto',
          background: message.type === 'success' 
            ? 'rgba(34, 197, 94, 0.1)' 
            : 'rgba(239, 68, 68, 0.1)',
          border: `2px solid ${message.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          borderRadius: '16px',
          padding: '16px 24px',
          color: message.type === 'success' ? '#22c55e' : '#ef4444',
          fontSize: '16px',
          fontWeight: '600',
          textAlign: 'center',
          backdropFilter: 'blur(10px)'
        }}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '8px',
        marginBottom: '2rem',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        gap: '4px',
        maxWidth: '600px',
        margin: '0 auto 2rem auto'
      }}>
        <button
          onClick={() => setActiveTab('friends')}
          style={{
            flex: 1,
            padding: '16px 24px',
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
            boxShadow: activeTab === 'friends' ? '0 4px 20px rgba(99, 102, 241, 0.3)' : 'none',
            position: 'relative'
          }}
        >
          👥 Friends {friends.length > 0 && (
            <span style={{
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              padding: '2px 8px',
              fontSize: '12px',
              marginLeft: '8px'
            }}>
              {friends.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          style={{
            flex: 1,
            padding: '16px 24px',
            background: activeTab === 'requests' 
              ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
              : 'transparent',
            border: 'none',
            borderRadius: '12px',
            color: '#ffffff',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: activeTab === 'requests' ? '0 4px 20px rgba(99, 102, 241, 0.3)' : 'none',
            position: 'relative'
          }}
        >
          📬 Requests
          {friendRequests.length > 0 && (
            <span style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: '#ef4444',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#fff',
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
            }}>
              {friendRequests.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('add')}
          style={{
            flex: 1,
            padding: '16px 24px',
            background: activeTab === 'add' 
              ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
              : 'transparent',
            border: 'none',
            borderRadius: '12px',
            color: '#ffffff',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: activeTab === 'add' ? '0 4px 20px rgba(99, 102, 241, 0.3)' : 'none'
          }}
        >
          ➕ Add Friend
        </button>
      </div>

      {/* Content */}
      <div style={{ minHeight: '400px' }}>
        {/* Friends List */}
        {activeTab === 'friends' && (
          <div>
            {friends.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#666'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
                <p style={{ fontSize: '18px', marginBottom: '8px' }}>No friends yet</p>
                <p style={{ fontSize: '14px', color: '#888' }}>
                  Add friends by email to start playing together!
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '20px'
              }}>
                {friends.map((friend) => (
                  <div key={friend.userId} style={{
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    borderRadius: '12px',
                    padding: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}>
                    <img 
                      src={friend.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.displayName)}&background=6366f1&color=fff&size=128`}
                      alt={friend.displayName}
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        border: '2px solid rgba(99, 102, 241, 0.5)'
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#fff', fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                        {friend.displayName}
                      </div>
                      <div style={{ color: '#aaa', fontSize: '14px' }}>
                        {friend.email}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveFriend(friend.userId, friend.displayName)}
                      disabled={loading}
                      style={{
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid rgba(239, 68, 68, 0.5)',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        color: '#ef4444',
                        fontSize: '14px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.5 : 1
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Friend Requests */}
        {activeTab === 'requests' && (
          <div>
            {friendRequests.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#666'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📬</div>
                <p style={{ fontSize: '18px', marginBottom: '8px' }}>No pending requests</p>
                <p style={{ fontSize: '14px', color: '#888' }}>
                  Friend requests will appear here
                </p>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                {friendRequests.map((request) => (
                  <div key={request.id} style={{
                    background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(239, 68, 68, 0.1) 100%)',
                    border: '1px solid rgba(236, 72, 153, 0.3)',
                    borderRadius: '12px',
                    padding: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}>
                    <img 
                      src={request.fromUserPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(request.fromUserName)}&background=ec4899&color=fff&size=128`}
                      alt={request.fromUserName}
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        border: '2px solid rgba(236, 72, 153, 0.5)'
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#fff', fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                        {request.fromUserName}
                      </div>
                      <div style={{ color: '#aaa', fontSize: '14px', marginBottom: '4px' }}>
                        {request.fromUserEmail}
                      </div>
                      <div style={{ color: '#666', fontSize: '12px' }}>
                        {new Date(request.createdAt.toDate()).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleAcceptRequest(request.id)}
                        disabled={loading}
                        style={{
                          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '10px 20px',
                          color: '#fff',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          opacity: loading ? 0.5 : 1
                        }}
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.id)}
                        disabled={loading}
                        style={{
                          background: 'rgba(239, 68, 68, 0.2)',
                          border: '1px solid rgba(239, 68, 68, 0.5)',
                          borderRadius: '6px',
                          padding: '10px 20px',
                          color: '#ef4444',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          opacity: loading ? 0.5 : 1
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add Friend */}
        {activeTab === 'add' && (
          <div style={{
            maxWidth: '500px',
            margin: '0 auto'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '12px',
              padding: '30px'
            }}>
              <h3 style={{ color: '#fff', fontSize: '20px', marginBottom: '20px', fontWeight: '600' }}>
                Add Friend by Email
              </h3>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ color: '#aaa', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                  Email Address
                </label>
                <input 
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendRequest()}
                  placeholder="friend@example.com"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                />
              </div>
              <button
                onClick={handleSendRequest}
                disabled={loading || !emailInput.trim()}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: loading || !emailInput.trim() 
                    ? 'rgba(99, 102, 241, 0.3)' 
                    : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading || !emailInput.trim() ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                {loading ? 'Sending...' : 'Send Friend Request'}
              </button>
              <p style={{ color: '#666', fontSize: '13px', marginTop: '16px', textAlign: 'center' }}>
                Enter the email address of the person you want to add
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
