import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore'
import { db } from './config'

export interface UserCurrency {
  coins: number
  lastUpdated: any
  lifetimeEarned: number
  lifetimeSpent: number
}

export interface DailyTask {
  id: string
  title: string
  description: string
  reward: number
  completed: boolean
  target: number
  progress: number
  category: 'aim' | 'typing' | 'general'
}

export interface UserDailyTasks {
  tasks: DailyTask[]
  lastReset: any
  streak: number
}

const DAILY_TASKS_POOL = [
  { id: 'play_3_games', title: 'Play 3 Games', description: 'Complete 3 games of any type', reward: 50, target: 3, category: 'general' as const },
  { id: 'reach_wave_5', title: 'Reach Wave 5', description: 'Survive to wave 5 in any game mode', reward: 75, target: 1, category: 'general' as const },
  { id: 'score_1000_aim', title: 'Score 1000 in Aim', description: 'Score at least 1000 points in Aim Trainer', reward: 100, target: 1, category: 'aim' as const },
  { id: 'score_1000_typing', title: 'Score 1000 in Typing', description: 'Score at least 1000 points in Typing Drill', reward: 100, target: 1, category: 'typing' as const },
  { id: 'kill_50_zombies', title: 'Kill 50 Zombies', description: 'Eliminate 50 zombies across all games', reward: 80, target: 50, category: 'general' as const },
  { id: 'accuracy_90', title: '90% Accuracy', description: 'Complete a game with 90%+ accuracy', reward: 120, target: 1, category: 'general' as const },
  { id: 'win_streak_3', title: 'Win Streak', description: 'Complete 3 games in a row', reward: 150, target: 3, category: 'general' as const },
]

/**
 * Get user currency
 */
export async function getUserCurrency(userId: string): Promise<UserCurrency> {
  const currencyRef = doc(db, 'currency', userId)
  
  try {
    const currencySnap = await getDoc(currencyRef)
    
    if (currencySnap.exists()) {
      return currencySnap.data() as UserCurrency
    }
    
    // Initialize currency for new user
    const initialCurrency: UserCurrency = {
      coins: 0,
      lastUpdated: serverTimestamp(),
      lifetimeEarned: 0,
      lifetimeSpent: 0
    }
    
    await setDoc(currencyRef, initialCurrency)
    return initialCurrency
  } catch (error) {
    console.error('Error getting user currency:', error)
    return {
      coins: 0,
      lastUpdated: null,
      lifetimeEarned: 0,
      lifetimeSpent: 0
    }
  }
}

/**
 * Add coins to user account
 */
export async function addCoins(userId: string, amount: number, reason: string = 'reward'): Promise<boolean> {
  const currencyRef = doc(db, 'currency', userId)
  
  try {
    const currencySnap = await getDoc(currencyRef)
    
    if (currencySnap.exists()) {
      await updateDoc(currencyRef, {
        coins: increment(amount),
        lifetimeEarned: increment(amount),
        lastUpdated: serverTimestamp()
      })
    } else {
      await setDoc(currencyRef, {
        coins: amount,
        lifetimeEarned: amount,
        lifetimeSpent: 0,
        lastUpdated: serverTimestamp()
      })
    }
    
    console.log(`Added ${amount} coins to user ${userId} (${reason})`)
    return true
  } catch (error) {
    console.error('Error adding coins:', error)
    return false
  }
}

/**
 * Deduct coins from user account
 */
export async function spendCoins(userId: string, amount: number): Promise<boolean> {
  const currencyRef = doc(db, 'currency', userId)
  
  try {
    const currencySnap = await getDoc(currencyRef)
    
    if (!currencySnap.exists()) {
      return false
    }
    
    const currentData = currencySnap.data() as UserCurrency
    
    if (currentData.coins < amount) {
      return false // Not enough coins
    }
    
    await updateDoc(currencyRef, {
      coins: increment(-amount),
      lifetimeSpent: increment(amount),
      lastUpdated: serverTimestamp()
    })
    
    return true
  } catch (error) {
    console.error('Error spending coins:', error)
    return false
  }
}

/**
 * Get or create daily tasks for user
 */
export async function getDailyTasks(userId: string): Promise<UserDailyTasks> {
  const tasksRef = doc(db, 'dailyTasks', userId)
  
  try {
    const tasksSnap = await getDoc(tasksRef)
    
    if (tasksSnap.exists()) {
      const data = tasksSnap.data() as UserDailyTasks
      
      // Check if tasks need to be reset (new day)
      const lastReset = data.lastReset?.toDate()
      const now = new Date()
      const needsReset = !lastReset || 
        (now.getDate() !== lastReset.getDate() || 
         now.getMonth() !== lastReset.getMonth() || 
         now.getFullYear() !== lastReset.getFullYear())
      
      if (needsReset) {
        return await resetDailyTasks(userId, data.streak)
      }
      
      return data
    }
    
    // Create initial daily tasks
    return await resetDailyTasks(userId, 0)
  } catch (error) {
    console.error('Error getting daily tasks:', error)
    return {
      tasks: [],
      lastReset: null,
      streak: 0
    }
  }
}

/**
 * Reset daily tasks with new random selection
 */
async function resetDailyTasks(userId: string, currentStreak: number): Promise<UserDailyTasks> {
  const tasksRef = doc(db, 'dailyTasks', userId)
  
  // Select 4 random tasks from the pool
  const shuffled = [...DAILY_TASKS_POOL].sort(() => Math.random() - 0.5)
  const selectedTasks = shuffled.slice(0, 4).map(task => ({
    ...task,
    completed: false,
    progress: 0
  }))
  
  const newTasks: UserDailyTasks = {
    tasks: selectedTasks,
    lastReset: serverTimestamp(),
    streak: currentStreak
  }
  
  await setDoc(tasksRef, newTasks)
  return newTasks
}

/**
 * Update daily task progress
 */
export async function updateDailyTaskProgress(
  userId: string,
  taskId: string,
  progressIncrement: number = 1
): Promise<{ completed: boolean; reward: number }> {
  const tasksRef = doc(db, 'dailyTasks', userId)
  
  try {
    const tasksSnap = await getDoc(tasksRef)
    
    if (!tasksSnap.exists()) {
      return { completed: false, reward: 0 }
    }
    
    const data = tasksSnap.data() as UserDailyTasks
    const taskIndex = data.tasks.findIndex(t => t.id === taskId)
    
    if (taskIndex === -1 || data.tasks[taskIndex].completed) {
      return { completed: false, reward: 0 }
    }
    
    const task = data.tasks[taskIndex]
    task.progress = Math.min(task.progress + progressIncrement, task.target)
    
    if (task.progress >= task.target && !task.completed) {
      task.completed = true
      
      // Award coins
      await addCoins(userId, task.reward, `Daily Task: ${task.title}`)
      
      // Update streak if all tasks completed
      const allCompleted = data.tasks.every(t => t.completed)
      if (allCompleted) {
        data.streak += 1
      }
      
      await setDoc(tasksRef, data)
      
      return { completed: true, reward: task.reward }
    }
    
    await setDoc(tasksRef, data)
    return { completed: false, reward: 0 }
  } catch (error) {
    console.error('Error updating daily task:', error)
    return { completed: false, reward: 0 }
  }
}

/**
 * Check and update daily tasks based on game completion
 */
export async function checkDailyTasksAfterGame(
  userId: string,
  gameType: 'aim' | 'typing',
  stats: {
    score: number
    wave: number
    kills: number
    accuracy: number
  }
): Promise<number> {
  try {
    const tasks = await getDailyTasks(userId)
    let totalReward = 0
    
    for (const task of tasks.tasks) {
      if (task.completed) continue
      
      let shouldUpdate = false
      let increment = 1
      
      switch (task.id) {
        case 'play_3_games':
          shouldUpdate = true
          break
        case 'reach_wave_5':
          shouldUpdate = stats.wave >= 5
          break
        case 'score_1000_aim':
          shouldUpdate = gameType === 'aim' && stats.score >= 1000
          break
        case 'score_1000_typing':
          shouldUpdate = gameType === 'typing' && stats.score >= 1000
          break
        case 'kill_50_zombies':
          shouldUpdate = true
          increment = stats.kills
          break
        case 'accuracy_90':
          shouldUpdate = stats.accuracy >= 90
          break
        case 'win_streak_3':
          shouldUpdate = true
          break
      }
      
      if (shouldUpdate) {
        const result = await updateDailyTaskProgress(userId, task.id, increment)
        if (result.completed) {
          totalReward += result.reward
        }
      }
    }
    
    return totalReward
  } catch (error) {
    console.error('Error checking daily tasks:', error)
    return 0
  }
}
