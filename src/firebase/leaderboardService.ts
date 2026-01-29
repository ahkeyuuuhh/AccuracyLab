import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  getDoc
} from 'firebase/firestore'
import { db } from './config'
import type { Friend } from './friendService'

export interface LeaderboardEntry {
  userId: string
  displayName: string
  email: string
  photoURL: string | null
  score: number
  accuracy: number
  gameType: 'aim' | 'typing'
  timestamp: Timestamp
  wave?: number
  kills?: number
}

// Submit score to leaderboard
export async function submitScore(
  userId: string,
  displayName: string,
  email: string,
  photoURL: string | null,
  score: number,
  accuracy: number,
  gameType: 'aim' | 'typing',
  wave?: number,
  kills?: number
): Promise<void> {
  try {
    const scoreId = `${userId}_${Date.now()}`
    const scoreRef = doc(db, 'leaderboard', scoreId)

    const entry: LeaderboardEntry = {
      userId,
      displayName,
      email,
      photoURL,
      score,
      accuracy,
      gameType,
      timestamp: Timestamp.now(),
      wave,
      kills
    }

    await setDoc(scoreRef, entry)
  } catch (error) {
    console.error('Error submitting score:', error)
  }
}

// Get global leaderboard
export async function getGlobalLeaderboard(
  gameType: 'aim' | 'typing' | 'all' = 'all',
  limitCount: number = 100
): Promise<LeaderboardEntry[]> {
  try {
    const leaderboardRef = collection(db, 'leaderboard')
    
    let q = query(
      leaderboardRef,
      orderBy('score', 'desc'),
      limit(limitCount)
    )

    if (gameType !== 'all') {
      q = query(
        leaderboardRef,
        where('gameType', '==', gameType),
        orderBy('score', 'desc'),
        limit(limitCount)
      )
    }

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => doc.data() as LeaderboardEntry)
  } catch (error) {
    console.error('Error getting global leaderboard:', error)
    return []
  }
}

// Get friends leaderboard
export async function getFriendsLeaderboard(
  userId: string,
  gameType: 'aim' | 'typing' | 'all' = 'all',
  limitCount: number = 100
): Promise<LeaderboardEntry[]> {
  try {
    // Get user's friends list
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)
    
    if (!userSnap.exists()) {
      return []
    }

    const friends: Friend[] = userSnap.data().friends || []
    const friendIds = friends.map(f => f.userId)
    
    // Add current user to the list
    friendIds.push(userId)

    if (friendIds.length === 0) {
      return []
    }

    // Get all leaderboard entries
    const leaderboardRef = collection(db, 'leaderboard')
    let q = query(leaderboardRef, orderBy('score', 'desc'))

    if (gameType !== 'all') {
      q = query(
        leaderboardRef,
        where('gameType', '==', gameType),
        orderBy('score', 'desc')
      )
    }

    const querySnapshot = await getDocs(q)
    
    // Filter by friend IDs and get best score for each user
    const userBestScores = new Map<string, LeaderboardEntry>()
    
    querySnapshot.docs.forEach(doc => {
      const entry = doc.data() as LeaderboardEntry
      if (friendIds.includes(entry.userId)) {
        const existing = userBestScores.get(entry.userId)
        if (!existing || entry.score > existing.score) {
          userBestScores.set(entry.userId, entry)
        }
      }
    })

    // Convert to array and sort
    const entries = Array.from(userBestScores.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limitCount)

    return entries
  } catch (error) {
    console.error('Error getting friends leaderboard:', error)
    return []
  }
}

// Get daily leaderboard (last 24 hours)
export async function getDailyLeaderboard(
  gameType: 'aim' | 'typing' | 'all' = 'all',
  limitCount: number = 100
): Promise<LeaderboardEntry[]> {
  try {
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)
    const timestamp = Timestamp.fromDate(oneDayAgo)

    const leaderboardRef = collection(db, 'leaderboard')
    
    let q = query(
      leaderboardRef,
      where('timestamp', '>=', timestamp),
      orderBy('timestamp', 'desc'),
      orderBy('score', 'desc'),
      limit(limitCount)
    )

    if (gameType !== 'all') {
      q = query(
        leaderboardRef,
        where('gameType', '==', gameType),
        where('timestamp', '>=', timestamp),
        orderBy('timestamp', 'desc'),
        orderBy('score', 'desc'),
        limit(limitCount)
      )
    }

    const querySnapshot = await getDocs(q)
    const entries = querySnapshot.docs.map(doc => doc.data() as LeaderboardEntry)
    
    // Sort by score descending
    return entries.sort((a, b) => b.score - a.score).slice(0, limitCount)
  } catch (error) {
    console.error('Error getting daily leaderboard:', error)
    return []
  }
}

// Get weekly leaderboard (last 7 days)
export async function getWeeklyLeaderboard(
  gameType: 'aim' | 'typing' | 'all' = 'all',
  limitCount: number = 100
): Promise<LeaderboardEntry[]> {
  try {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const timestamp = Timestamp.fromDate(oneWeekAgo)

    const leaderboardRef = collection(db, 'leaderboard')
    
    let q = query(
      leaderboardRef,
      where('timestamp', '>=', timestamp),
      orderBy('timestamp', 'desc'),
      orderBy('score', 'desc'),
      limit(limitCount)
    )

    if (gameType !== 'all') {
      q = query(
        leaderboardRef,
        where('gameType', '==', gameType),
        where('timestamp', '>=', timestamp),
        orderBy('timestamp', 'desc'),
        orderBy('score', 'desc'),
        limit(limitCount)
      )
    }

    const querySnapshot = await getDocs(q)
    const entries = querySnapshot.docs.map(doc => doc.data() as LeaderboardEntry)
    
    // Sort by score descending
    return entries.sort((a, b) => b.score - a.score).slice(0, limitCount)
  } catch (error) {
    console.error('Error getting weekly leaderboard:', error)
    return []
  }
}

// Get user's best score
export async function getUserBestScore(
  userId: string,
  gameType: 'aim' | 'typing' | 'all' = 'all'
): Promise<LeaderboardEntry | null> {
  try {
    const leaderboardRef = collection(db, 'leaderboard')
    
    let q = query(
      leaderboardRef,
      where('userId', '==', userId),
      orderBy('score', 'desc'),
      limit(1)
    )

    if (gameType !== 'all') {
      q = query(
        leaderboardRef,
        where('userId', '==', userId),
        where('gameType', '==', gameType),
        orderBy('score', 'desc'),
        limit(1)
      )
    }

    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      return null
    }

    return querySnapshot.docs[0].data() as LeaderboardEntry
  } catch (error) {
    console.error('Error getting user best score:', error)
    return null
  }
}
