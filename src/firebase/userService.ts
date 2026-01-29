import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './config'
import type { User } from 'firebase/auth'

export interface UserProfile {
  uid: string
  email: string
  displayName: string | null
  photoURL: string | null
  createdAt: any
  lastLogin: any
  stats?: {
    totalGames: number
    highScore: number
    accuracy: number
  }
  friends?: Array<{
    userId: string
    email: string
    displayName: string
    photoURL: string | null
    addedAt: any
  }>
}

/**
 * Create or update user profile in Firestore
 */
export async function createUserProfile(user: User): Promise<void> {
  const userRef = doc(db, 'users', user.uid)
  
  try {
    // Check if user document already exists
    const userSnap = await getDoc(userRef)
    
    if (!userSnap.exists()) {
      // Create new user profile
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        stats: {
          totalGames: 0,
          highScore: 0,
          accuracy: 0
        },
        friends: []
      }
      
      await setDoc(userRef, userProfile)
      console.log('User profile created successfully')
    } else {
      // Update last login and profile info
      await setDoc(userRef, {
        displayName: user.displayName,
        photoURL: user.photoURL,
        lastLogin: serverTimestamp()
      }, { merge: true })
      console.log('User profile updated')
    }
  } catch (error) {
    console.error('Error creating/updating user profile:', error)
    throw error
  }
}

/**
 * Get user profile from Firestore
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userRef = doc(db, 'users', uid)
  
  try {
    const userSnap = await getDoc(userRef)
    
    if (userSnap.exists()) {
      return userSnap.data() as UserProfile
    }
    return null
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
}

/**
 * Update user stats
 */
export async function updateUserStats(
  uid: string, 
  stats: Partial<UserProfile['stats']>
): Promise<void> {
  const userRef = doc(db, 'users', uid)
  
  try {
    await setDoc(userRef, {
      stats: stats
    }, { merge: true })
  } catch (error) {
    console.error('Error updating user stats:', error)
    throw error
  }
}
