import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  Timestamp
} from 'firebase/firestore'
import { db } from './config'
import { addCoins } from './currencyService'

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: Timestamp
  progress?: number
  target?: number
  category: 'typing' | 'aim' | 'general' | 'social'
  coinReward?: number
}

export interface UserAchievements {
  userId: string
  achievements: Achievement[]
  stats: {
    totalGamesPlayed: number
    totalPlayTime: number // in seconds
    highestWave: number
    totalKills: number
    bestAccuracy: number
    perfectGames: number
    gamesOver95Accuracy: number
    totalFriends: number
  }
  updatedAt: Timestamp
}

// Define all available achievements
export const ALL_ACHIEVEMENTS: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = [
  // Typing Achievements
  {
    id: 'typing_first_game',
    title: 'First Words',
    description: 'Complete your first typing drill game',
    icon: '⌨️',
    category: 'typing',
    progress: 0,
    target: 1,
    coinReward: 50
  },
  {
    id: 'typing_wave_5',
    title: 'Survivor',
    description: 'Survive to wave 5 in typing drill',
    icon: '🏆',
    category: 'typing',
    progress: 0,
    target: 5,
    coinReward: 100
  },
  {
    id: 'typing_wave_10',
    title: 'Boss Slayer',
    description: 'Defeat your first boss (wave 10)',
    icon: '💀',
    category: 'typing',
    progress: 0,
    target: 10,
    coinReward: 200
  },
  {
    id: 'typing_wave_20',
    title: 'Unstoppable',
    description: 'Reach wave 20 in typing drill',
    icon: '🔥',
    category: 'typing',
    progress: 0,
    target: 20,
    coinReward: 500
  },
  {
    id: 'typing_100_kills',
    title: 'Zombie Hunter',
    description: 'Kill 100 zombies total',
    icon: '🎯',
    category: 'typing',
    progress: 0,
    target: 100,
    coinReward: 150
  },
  {
    id: 'typing_500_kills',
    title: 'Exterminator',
    description: 'Kill 500 zombies total',
    icon: '💪',
    category: 'typing',
    progress: 0,
    target: 500,
    coinReward: 300
  },
  
  // Aim Achievements
  {
    id: 'aim_first_game',
    title: 'First Shot',
    description: 'Complete your first aim drill game',
    icon: '🎯',
    category: 'aim',
    progress: 0,
    target: 1,
    coinReward: 50
  },
  {
    id: 'aim_95_accuracy',
    title: 'Accuracy Master',
    description: 'Achieve 95% accuracy in aim drill',
    icon: '🎖️',
    category: 'aim',
    progress: 0,
    target: 1,
    coinReward: 150
  },
  {
    id: 'aim_perfect',
    title: 'Perfect Shot',
    description: 'Get 100% accuracy in aim drill',
    icon: '💯',
    category: 'aim',
    progress: 0,
    target: 1,
    coinReward: 250
  },
  {
    id: 'aim_speed_demon',
    title: 'Speed Demon',
    description: 'Hit 50 targets in under 30 seconds',
    icon: '⚡',
    category: 'aim',
    progress: 0,
    target: 1,
    coinReward: 200
  },
  
  // General Achievements
  {
    id: 'general_10_games',
    title: 'Getting Started',
    description: 'Play 10 games total',
    icon: '🎮',
    category: 'general',
    progress: 0,
    target: 10,
    coinReward: 100
  },
  {
    id: 'general_50_games',
    title: 'Dedicated Player',
    description: 'Play 50 games total',
    icon: '🏅',
    category: 'general',
    progress: 0,
    target: 50,
    coinReward: 300
  },
  {
    id: 'general_100_games',
    title: 'Veteran',
    description: 'Play 100 games total',
    icon: '👑',
    category: 'general',
    progress: 0,
    target: 100,
    coinReward: 500
  },
  {
    id: 'general_5_hours',
    title: 'Marathon Runner',
    description: 'Play for 5 hours total',
    icon: '🏃',
    category: 'general',
    progress: 0,
    target: 18000, // 5 hours in seconds
    coinReward: 400
  },
  
  // Social Achievements
  {
    id: 'social_first_friend',
    title: 'Making Friends',
    description: 'Add your first friend',
    icon: '👋',
    category: 'social',
    progress: 0,
    target: 1,
    coinReward: 75
  },
  {
    id: 'social_5_friends',
    title: 'Popular',
    description: 'Have 5 friends',
    icon: '🌟',
    category: 'social',
    progress: 0,
    target: 5,
    coinReward: 200
  },
  {
    id: 'social_10_friends',
    title: 'Social Butterfly',
    description: 'Have 10 friends',
    icon: '🦋',
    category: 'social',
    progress: 0,
    target: 10,
    coinReward: 350
  }
]

// Initialize user achievements
export async function initializeUserAchievements(userId: string): Promise<UserAchievements> {
  console.log('Initializing achievements for user:', userId)
  const achievementsRef = doc(db, 'achievements', userId)
  
  try {
    const achievementsDoc = await getDoc(achievementsRef)

    if (achievementsDoc.exists()) {
      console.log('Achievements already exist')
      return achievementsDoc.data() as UserAchievements
    }

    console.log('Creating new achievements document')
    // Create initial achievements data
    const initialData: UserAchievements = {
      userId,
      achievements: ALL_ACHIEVEMENTS.map(a => ({
        ...a,
        unlocked: false,
        progress: 0
      })),
      stats: {
        totalGamesPlayed: 0,
        totalPlayTime: 0,
        highestWave: 0,
        totalKills: 0,
        bestAccuracy: 0,
        perfectGames: 0,
        gamesOver95Accuracy: 0,
        totalFriends: 0
      },
      updatedAt: Timestamp.now()
    }

    await setDoc(achievementsRef, initialData)
    console.log('Achievements initialized successfully')
    return initialData
  } catch (error) {
    console.error('Error in initializeUserAchievements:', error)
    throw error
  }
}

// Get user achievements
export async function getUserAchievements(userId: string): Promise<UserAchievements> {
  console.log('Getting achievements for user:', userId)
  try {
    const achievementsRef = doc(db, 'achievements', userId)
    const achievementsDoc = await getDoc(achievementsRef)

    if (!achievementsDoc.exists()) {
      console.log('Achievements not found, initializing...')
      return await initializeUserAchievements(userId)
    }

    console.log('Achievements found')
    return achievementsDoc.data() as UserAchievements
  } catch (error) {
    console.error('Error in getUserAchievements:', error)
    throw error
  }
}

// Update game stats and check for achievements
export async function updateGameStats(
  userId: string,
  gameType: 'aim' | 'typing',
  stats: {
    wave?: number
    kills?: number
    accuracy: number
    duration: number // in seconds
  }
): Promise<Achievement[]> {
  const achievementsRef = doc(db, 'achievements', userId)
  const userData = await getUserAchievements(userId)
  
  const newlyUnlocked: Achievement[] = []
  
  // Update stats
  userData.stats.totalGamesPlayed += 1
  userData.stats.totalPlayTime += stats.duration
  
  if (stats.wave && stats.wave > userData.stats.highestWave) {
    userData.stats.highestWave = stats.wave
  }
  
  if (stats.kills) {
    userData.stats.totalKills += stats.kills
  }
  
  if (stats.accuracy > userData.stats.bestAccuracy) {
    userData.stats.bestAccuracy = stats.accuracy
  }
  
  if (stats.accuracy === 100) {
    userData.stats.perfectGames += 1
  }
  
  if (stats.accuracy >= 95) {
    userData.stats.gamesOver95Accuracy += 1
  }
  
  // Check and unlock achievements
  userData.achievements = userData.achievements.map(achievement => {
    if (achievement.unlocked) return achievement
    
    let shouldUnlock = false
    let currentProgress = achievement.progress || 0
    
    switch (achievement.id) {
      // Typing achievements
      case 'typing_first_game':
        if (gameType === 'typing') {
          currentProgress = 1
          shouldUnlock = true
        }
        break
        
      case 'typing_wave_5':
        if (gameType === 'typing' && stats.wave && stats.wave >= 5) {
          currentProgress = Math.max(currentProgress, stats.wave)
          shouldUnlock = currentProgress >= 5
        }
        break
        
      case 'typing_wave_10':
        if (gameType === 'typing' && stats.wave && stats.wave >= 10) {
          currentProgress = Math.max(currentProgress, stats.wave)
          shouldUnlock = currentProgress >= 10
        }
        break
        
      case 'typing_wave_20':
        if (gameType === 'typing' && stats.wave && stats.wave >= 20) {
          currentProgress = Math.max(currentProgress, stats.wave)
          shouldUnlock = currentProgress >= 20
        }
        break
        
      case 'typing_100_kills':
        currentProgress = userData.stats.totalKills
        shouldUnlock = currentProgress >= 100
        break
        
      case 'typing_500_kills':
        currentProgress = userData.stats.totalKills
        shouldUnlock = currentProgress >= 500
        break
        
      // Aim achievements
      case 'aim_first_game':
        if (gameType === 'aim') {
          currentProgress = 1
          shouldUnlock = true
        }
        break
        
      case 'aim_95_accuracy':
        if (gameType === 'aim' && stats.accuracy >= 95) {
          currentProgress = 1
          shouldUnlock = true
        }
        break
        
      case 'aim_perfect':
        if (gameType === 'aim' && stats.accuracy === 100) {
          currentProgress = 1
          shouldUnlock = true
        }
        break
        
      case 'aim_speed_demon':
        // This would need to be passed in stats, for now just checking duration
        if (gameType === 'aim' && stats.duration <= 30) {
          currentProgress = 1
          shouldUnlock = true
        }
        break
        
      // General achievements
      case 'general_10_games':
        currentProgress = userData.stats.totalGamesPlayed
        shouldUnlock = currentProgress >= 10
        break
        
      case 'general_50_games':
        currentProgress = userData.stats.totalGamesPlayed
        shouldUnlock = currentProgress >= 50
        break
        
      case 'general_100_games':
        currentProgress = userData.stats.totalGamesPlayed
        shouldUnlock = currentProgress >= 100
        break
        
      case 'general_5_hours':
        currentProgress = userData.stats.totalPlayTime
        shouldUnlock = currentProgress >= 18000
        break
    }
    
    if (shouldUnlock && !achievement.unlocked) {
      const unlockedAchievement = {
        ...achievement,
        unlocked: true,
        unlockedAt: Timestamp.now(),
        progress: currentProgress
      }
      
      newlyUnlocked.push(unlockedAchievement)
      
      // Award coins for achievement
      if (achievement.coinReward) {
        addCoins(userId, achievement.coinReward, `Achievement: ${achievement.title}`).catch(err => 
          console.error('Error awarding coins:', err)
        )
      }
      
      return unlockedAchievement
    }
    
    return {
      ...achievement,
      progress: currentProgress
    }
  })
  
  userData.updatedAt = Timestamp.now()
  
  // Save to Firestore
  await updateDoc(achievementsRef, userData as any)
  
  return newlyUnlocked
}

// Update friend count (called when friends are added/removed)
export async function updateFriendCount(userId: string, friendCount: number): Promise<Achievement[]> {
  const achievementsRef = doc(db, 'achievements', userId)
  const userData = await getUserAchievements(userId)
  
  const newlyUnlocked: Achievement[] = []
  
  userData.stats.totalFriends = friendCount
  
  userData.achievements = userData.achievements.map(achievement => {
    if (achievement.unlocked) return achievement
    
    let shouldUnlock = false
    let currentProgress = achievement.progress || 0
    
    switch (achievement.id) {
      case 'social_first_friend':
        currentProgress = friendCount
        shouldUnlock = friendCount >= 1
        break
        
      case 'social_5_friends':
        currentProgress = friendCount
        shouldUnlock = friendCount >= 5
        break
        
      case 'social_10_friends':
        currentProgress = friendCount
        shouldUnlock = friendCount >= 10
        break
    }
    
    if (shouldUnlock && !achievement.unlocked) {
      const unlockedAchievement = {
        ...achievement,
        unlocked: true,
        unlockedAt: Timestamp.now(),
        progress: currentProgress
      }
      
      newlyUnlocked.push(unlockedAchievement)
      
      // Award coins for achievement
      if (achievement.coinReward) {
        addCoins(userId, achievement.coinReward, `Achievement: ${achievement.title}`).catch(err => 
          console.error('Error awarding coins:', err)
        )
      }
      
      return unlockedAchievement
    }
    
    return {
      ...achievement,
      progress: currentProgress
    }
  })
  
  userData.updatedAt = Timestamp.now()
  
  await updateDoc(achievementsRef, userData as any)
  
  return newlyUnlocked
}

// Get achievement statistics
export async function getAchievementStats(userId: string): Promise<{
  totalAchievements: number
  unlockedAchievements: number
  completionPercentage: number
}> {
  const userData = await getUserAchievements(userId)
  const totalAchievements = userData.achievements.length
  const unlockedAchievements = userData.achievements.filter(a => a.unlocked).length
  const completionPercentage = Math.round((unlockedAchievements / totalAchievements) * 100)
  
  return {
    totalAchievements,
    unlockedAchievements,
    completionPercentage
  }
}
