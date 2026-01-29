import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  query,
  where,
  Timestamp 
} from 'firebase/firestore'
import { db } from './config'

export interface FriendRequest {
  id: string
  fromUserId: string
  fromUserEmail: string
  fromUserName: string
  fromUserPhoto: string | null
  toUserId: string
  toUserEmail: string
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: Timestamp
}

export interface Friend {
  userId: string
  email: string
  displayName: string
  photoURL: string | null
  addedAt: Timestamp
}

// Send friend request by email
export async function sendFriendRequest(
  fromUserId: string,
  fromUserEmail: string,
  fromUserName: string,
  fromUserPhoto: string | null,
  toUserEmail: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Find user by email
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('email', '==', toUserEmail))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return { success: false, message: 'User not found with this email' }
    }

    const toUserDoc = querySnapshot.docs[0]
    const toUserId = toUserDoc.id
    const toUserData = toUserDoc.data()

    // Check if trying to add yourself
    if (fromUserId === toUserId) {
      return { success: false, message: 'You cannot add yourself as a friend' }
    }

    // Check if already friends
    const fromUserRef = doc(db, 'users', fromUserId)
    const fromUserSnap = await getDoc(fromUserRef)
    const friends = fromUserSnap.data()?.friends || []
    
    if (friends.some((f: Friend) => f.userId === toUserId)) {
      return { success: false, message: 'Already friends with this user' }
    }

    // Check if friend request already exists
    const requestId = `${fromUserId}_${toUserId}`
    const reverseRequestId = `${toUserId}_${fromUserId}`
    
    const requestRef = doc(db, 'friendRequests', requestId)
    const reverseRequestRef = doc(db, 'friendRequests', reverseRequestId)
    
    const [requestSnap, reverseRequestSnap] = await Promise.all([
      getDoc(requestRef),
      getDoc(reverseRequestRef)
    ])

    if (requestSnap.exists()) {
      const status = requestSnap.data().status
      if (status === 'pending') {
        return { success: false, message: 'Friend request already sent' }
      }
    }

    if (reverseRequestSnap.exists()) {
      const status = reverseRequestSnap.data().status
      if (status === 'pending') {
        return { success: false, message: 'This user has already sent you a friend request' }
      }
    }

    // Create friend request
    const friendRequest: FriendRequest = {
      id: requestId,
      fromUserId,
      fromUserEmail,
      fromUserName,
      fromUserPhoto,
      toUserId,
      toUserEmail: toUserData.email,
      status: 'pending',
      createdAt: Timestamp.now()
    }

    await setDoc(requestRef, friendRequest)

    return { success: true, message: 'Friend request sent successfully' }
  } catch (error) {
    console.error('Error sending friend request:', error)
    return { success: false, message: 'Failed to send friend request' }
  }
}

// Get pending friend requests (received)
export async function getPendingFriendRequests(userId: string): Promise<FriendRequest[]> {
  try {
    const requestsRef = collection(db, 'friendRequests')
    const q = query(
      requestsRef, 
      where('toUserId', '==', userId),
      where('status', '==', 'pending')
    )
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map(doc => doc.data() as FriendRequest)
  } catch (error) {
    console.error('Error getting friend requests:', error)
    return []
  }
}

// Accept friend request
export async function acceptFriendRequest(requestId: string): Promise<boolean> {
  try {
    const requestRef = doc(db, 'friendRequests', requestId)
    const requestSnap = await getDoc(requestRef)

    if (!requestSnap.exists()) {
      return false
    }

    const request = requestSnap.data() as FriendRequest

    // Add to both users' friend lists
    const fromUserRef = doc(db, 'users', request.fromUserId)
    const toUserRef = doc(db, 'users', request.toUserId)

    const [fromUserSnap, toUserSnap] = await Promise.all([
      getDoc(fromUserRef),
      getDoc(toUserRef)
    ])

    const fromUserData = fromUserSnap.data()
    const toUserData = toUserSnap.data()

    const fromUserFriend: Friend = {
      userId: request.toUserId,
      email: toUserData?.email || '',
      displayName: toUserData?.displayName || '',
      photoURL: toUserData?.photoURL || null,
      addedAt: Timestamp.now()
    }

    const toUserFriend: Friend = {
      userId: request.fromUserId,
      email: request.fromUserEmail,
      displayName: request.fromUserName,
      photoURL: request.fromUserPhoto,
      addedAt: Timestamp.now()
    }

    await Promise.all([
      updateDoc(fromUserRef, {
        friends: arrayUnion(toUserFriend)
      }),
      updateDoc(toUserRef, {
        friends: arrayUnion(fromUserFriend)
      }),
      updateDoc(requestRef, {
        status: 'accepted'
      })
    ])

    return true
  } catch (error) {
    console.error('Error accepting friend request:', error)
    return false
  }
}

// Reject friend request
export async function rejectFriendRequest(requestId: string): Promise<boolean> {
  try {
    const requestRef = doc(db, 'friendRequests', requestId)
    await updateDoc(requestRef, {
      status: 'rejected'
    })
    return true
  } catch (error) {
    console.error('Error rejecting friend request:', error)
    return false
  }
}

// Get friends list
export async function getFriendsList(userId: string): Promise<Friend[]> {
  try {
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      return []
    }

    const friends = userSnap.data().friends || []
    return friends
  } catch (error) {
    console.error('Error getting friends list:', error)
    return []
  }
}

// Remove friend
export async function removeFriend(userId: string, friendUserId: string): Promise<boolean> {
  try {
    const userRef = doc(db, 'users', userId)
    const friendRef = doc(db, 'users', friendUserId)

    const [userSnap, friendSnap] = await Promise.all([
      getDoc(userRef),
      getDoc(friendRef)
    ])

    const userFriends = userSnap.data()?.friends || []
    const friendFriends = friendSnap.data()?.friends || []

    const userFriendToRemove = userFriends.find((f: Friend) => f.userId === friendUserId)
    const friendFriendToRemove = friendFriends.find((f: Friend) => f.userId === userId)

    if (userFriendToRemove && friendFriendToRemove) {
      await Promise.all([
        updateDoc(userRef, {
          friends: arrayRemove(userFriendToRemove)
        }),
        updateDoc(friendRef, {
          friends: arrayRemove(friendFriendToRemove)
        })
      ])
      return true
    }

    return false
  } catch (error) {
    console.error('Error removing friend:', error)
    return false
  }
}
