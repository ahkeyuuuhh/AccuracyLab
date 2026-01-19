import { useRef, useState, useEffect, useMemo, memo, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'

// Expanded word list - organized by difficulty (length)
const EASY_WORDS = [
  'AIM', 'GUN', 'HIT', 'RUN', 'DIE', 'WAR', 'END', 'WIN', 'RED', 'CUT',
  'JAW', 'AXE', 'BOW', 'FLY', 'JAB', 'ZAP', 'VEX', 'FOX', 'HEX', 'MIX'
]

const MEDIUM_WORDS = [
  'BRAIN', 'SHOOT', 'BLAST', 'QUICK', 'DEATH', 'UNDEAD', 'HORDE', 'SPAWN',
  'SKULL', 'GRAVE', 'CRYPT', 'FLESH', 'DECAY', 'TOXIC', 'VIRUS', 'PLAGUE',
  'CHAOS', 'STORM', 'NIGHT', 'DEMON', 'GHOST', 'CORPSE', 'BONES', 'BLOOD',
  'FRENZY', 'HORROR', 'TERROR', 'MUTANT', 'ATTACK', 'DEFEND', 'ESCAPE'
]

const HARD_WORDS = [
  'ZOMBIE', 'SURVIVE', 'HEADSHOT', 'RAMPAGE', 'OUTBREAK', 'INFECTED',
  'APOCALYPSE', 'NIGHTMARE', 'SLAUGHTER', 'MASSACRE', 'DESTROYER',
  'CARNAGE', 'VENGEANCE', 'DECIMATION', 'ANNIHILATE', 'OBLITERATE',
  'EXTERMINATE', 'EVISCERATE', 'CATASTROPHE', 'DEVASTATION', 'REANIMATED',
  'NECROMANCER', 'GRAVEYARD', 'CEMETERY', 'INFECTION', 'QUARANTINE',
  'BIOHAZARD', 'PANDEMIC', 'CONTAGION', 'EPIDEMIC', 'CONTAMINATE'
]

// Boss paragraphs - longer text to type
const BOSS_PARAGRAPHS = [
  'THE UNDEAD RISE FROM THEIR GRAVES SEEKING VENGEANCE UPON THE LIVING',
  'DARKNESS CONSUMES ALL WHO DARE TO FACE THE ZOMBIE HORDE ALONE',
  'SURVIVE THE NIGHT OR BECOME ONE OF THE WALKING DEAD FOREVER',
  'THE APOCALYPSE HAS BEGUN AND ONLY THE FASTEST FINGERS WILL LIVE',
  'FEAR THE REAPER FOR HE COMMANDS AN ARMY OF ROTTING CORPSES',
  'TYPE FAST OR DIE SLOW IN THIS HELLSCAPE OF UNDEAD NIGHTMARES',
  'THE BOSS ZOMBIE HUNGERS FOR YOUR BRAIN TYPE TO DESTROY IT NOW',
  'INFECTED BLOOD RUNS THROUGH THE VEINS OF THIS MONSTROUS BEAST',
  'ANNIHILATE THE NECROMANCER BEFORE HE RAISES MORE UNDEAD MINIONS',
  'CATASTROPHIC DESTRUCTION AWAITS THOSE WHO FAIL TO TYPE QUICKLY'
]

// Shuffle array utility
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Get words for a wave (non-repeating within session)
function getWaveWords(wave: number, usedWords: Set<string>): string[] {
  const zombieCount = wave + 1
  const words: string[] = []
  
  // Difficulty increases with waves
  let availableWords: string[] = []
  
  if (wave <= 2) {
    availableWords = [...EASY_WORDS, ...MEDIUM_WORDS.slice(0, 10)]
  } else if (wave <= 5) {
    availableWords = [...EASY_WORDS.slice(0, 5), ...MEDIUM_WORDS, ...HARD_WORDS.slice(0, 15)]
  } else {
    availableWords = [...MEDIUM_WORDS, ...HARD_WORDS]
  }
  
  // Filter out already used words
  availableWords = availableWords.filter(w => !usedWords.has(w))
  
  // If we've used too many words, reset the pool
  if (availableWords.length < zombieCount) {
    usedWords.clear()
    availableWords = wave <= 2 
      ? [...EASY_WORDS, ...MEDIUM_WORDS.slice(0, 10)]
      : wave <= 5 
        ? [...EASY_WORDS.slice(0, 5), ...MEDIUM_WORDS, ...HARD_WORDS.slice(0, 15)]
        : [...MEDIUM_WORDS, ...HARD_WORDS]
  }
  
  // Shuffle and pick words
  const shuffled = shuffleArray(availableWords)
  for (let i = 0; i < zombieCount && i < shuffled.length; i++) {
    words.push(shuffled[i])
    usedWords.add(shuffled[i])
  }
  
  return words
}

// Zombie interface
interface ZombieData {
  id: number
  word: string
  typedChars: number
  positionZ: number
  positionX: number
  isDead: boolean
  hasHitPlayer: boolean
}

// Static Player with Gun - Memoized for performance
const PlayerGun = memo(function PlayerGun({ recoil }: { recoil: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const { camera } = useThree()
  const offsetVec = useMemo(() => new THREE.Vector3(), [])

  useFrame(() => {
    if (!groupRef.current) return
    offsetVec.set(0.28, -0.15, -0.35)
    offsetVec.applyQuaternion(camera.quaternion)
    groupRef.current.position.copy(camera.position).add(offsetVec)
    groupRef.current.quaternion.copy(camera.quaternion)
    groupRef.current.position.z += recoil * 0.05
    groupRef.current.rotation.x -= recoil * 0.1
  })

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.08, 0.08, 0.4]} />
        <meshBasicMaterial color="#2a2a2a" />
      </mesh>
      <mesh position={[0, 0.02, -0.25]}>
        <cylinderGeometry args={[0.015, 0.015, 0.15, 8]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0, -0.06, 0.05]}>
        <boxGeometry args={[0.04, 0.1, 0.08]} />
        <meshBasicMaterial color="#3a3a3a" />
      </mesh>
      <mesh position={[0, -0.02, 0.15]}>
        <boxGeometry args={[0.06, 0.06, 0.15]} />
        <meshBasicMaterial color="#2a2a2a" />
      </mesh>
      <mesh position={[0, 0.06, -0.05]}>
        <cylinderGeometry args={[0.02, 0.02, 0.12, 8]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
    </group>
  )
})

// 3D Zombie Model Component with Walking Animation
function ZombieModel({ 
  id,
  positionX,
  positionZ: initialPositionZ,
  isDead,
  wave,
  onReachPlayer
}: { 
  id: number
  positionX: number
  positionZ: number
  isDead: boolean
  wave: number
  onReachPlayer: () => void
}) {
  const groupRef = useRef<THREE.Group>(null)
  const [currentZ, setCurrentZ] = useState(initialPositionZ)
  const hasReached = useRef(false)
  const deathTime = useRef<number | null>(null)
  const prevId = useRef(id)
  
  // Load 3D zombie model
  const { scene, animations } = useGLTF('/models/zombie/scene.gltf')
  const clonedScene = useMemo(() => scene.clone(), [scene])
  
  const { actions } = useAnimations(animations, groupRef)

  // Reset everything when zombie ID changes (new zombie)
  useEffect(() => {
    if (prevId.current !== id) {
      setCurrentZ(initialPositionZ)
      hasReached.current = false
      deathTime.current = null
      prevId.current = id
    }
  }, [id, initialPositionZ])

  // Handle death timing
  useEffect(() => {
    if (isDead && deathTime.current === null) {
      deathTime.current = Date.now()
    }
    if (!isDead) {
      deathTime.current = null
      hasReached.current = false
    }
  }, [isDead])

  // Play walking animation when alive
  useEffect(() => {
    if (!isDead && actions) {
      const walkAction = actions['Walk'] || actions['walk'] || actions['Walking'] || 
                         actions['walking'] || actions['Run'] || actions['run'] ||
                         Object.values(actions)[0]
      
      if (walkAction) {
        walkAction.reset().fadeIn(0.2).play()
        return () => walkAction.fadeOut(0.2)
      }
    } else if (isDead && actions) {
      Object.values(actions).forEach(action => action?.stop())
    }
  }, [isDead, actions])

  // Movement animation loop
  useEffect(() => {
    if (isDead) return
    
    let animationId: number
    let lastTime = performance.now()
    
    const animate = () => {
      const now = performance.now()
      const delta = (now - lastTime) / 1000
      lastTime = now
      
      const speed = 1.5 + Math.min(wave * 0.15, 1.5)
      
      setCurrentZ(prev => {
        const newZ = prev + speed * delta
        
        // Check if reached player
        if (newZ > 6 && !hasReached.current) {
          hasReached.current = true
          onReachPlayer()
        }
        
        return newZ
      })
      
      animationId = requestAnimationFrame(animate)
    }
    
    animationId = requestAnimationFrame(animate)
    
    return () => cancelAnimationFrame(animationId)
  }, [isDead, wave, onReachPlayer])

  // Death animation
  const deathRotation = isDead && deathTime.current 
    ? Math.min(Math.PI / 2, (Date.now() - deathTime.current) / 1000 * 5)
    : 0
  const deathY = isDead && deathTime.current
    ? Math.max(-2, -(Date.now() - deathTime.current) / 1000 * 3)
    : 0

  return (
    <group 
      ref={groupRef} 
      position={[positionX, deathY, currentZ]}
      rotation={[deathRotation, 0, 0]}
    >
      <primitive 
        object={clonedScene} 
        scale={0.4}
        rotation={[0, Math.PI, 0]}
      />
    </group>
  )
}

// Keep the original Zombie component name for compatibility
const Zombie = ZombieModel

// Boss Zombie Component - Much bigger and scarier
const BossZombie = memo(function BossZombie({ 
  positionZ,
  health,
  wave,
  onReachPlayer
}: { 
  positionZ: number
  health: number
  wave: number
  onReachPlayer: () => void
}) {
  const groupRef = useRef<THREE.Group>(null)
  const currentZRef = useRef(positionZ)
  const hasReachedRef = useRef(false)
  const isDead = health <= 0

  useEffect(() => {
    currentZRef.current = positionZ
    hasReachedRef.current = false
  }, [positionZ])

  useFrame((_, delta) => {
    if (!groupRef.current) return
    
    if (isDead) {
      groupRef.current.rotation.x = Math.min(Math.PI / 2, groupRef.current.rotation.x + delta * 2)
      groupRef.current.position.y = Math.max(-3, groupRef.current.position.y - delta * 2)
    } else {
      // Boss moves slower but is more menacing
      const speed = 0.8 + (wave * 0.05)
      currentZRef.current += speed * delta
      groupRef.current.position.z = currentZRef.current
      
      // Menacing sway
      const time = Date.now() / 500
      groupRef.current.position.x = Math.sin(time) * 0.3
      groupRef.current.rotation.y = Math.sin(time * 0.5) * 0.1
      
      if (currentZRef.current > 5 && !hasReachedRef.current) {
        hasReachedRef.current = true
        onReachPlayer()
      }
    }
  })

  const bossColor = isDead ? '#1a3a1a' : '#004400'
  const bodyColor = isDead ? '#2a4a2a' : '#116611'
  const scale = 2.5

  return (
    <group ref={groupRef} position={[0, 1.5, positionZ]} scale={scale}>
      {/* Head - bigger and meaner */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshLambertMaterial color={bossColor} />
      </mesh>
      {/* Horns */}
      <mesh position={[-0.15, 0.9, 0]} rotation={[0, 0, -0.3]}>
        <coneGeometry args={[0.08, 0.3, 6]} />
        <meshLambertMaterial color="#333" />
      </mesh>
      <mesh position={[0.15, 0.9, 0]} rotation={[0, 0, 0.3]}>
        <coneGeometry args={[0.08, 0.3, 6]} />
        <meshLambertMaterial color="#333" />
      </mesh>
      {/* Glowing Eyes */}
      <mesh position={[-0.1, 0.65, 0.21]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color={isDead ? '#330000' : '#ff0000'} />
      </mesh>
      <mesh position={[0.1, 0.65, 0.21]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color={isDead ? '#330000' : '#ff0000'} />
      </mesh>
      {/* Massive Body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.6, 1, 0.4]} />
        <meshLambertMaterial color={bodyColor} />
      </mesh>
      {/* Muscular Arms */}
      <mesh position={[-0.4, 0, 0.15]} rotation={[-0.6, 0, 0.3]}>
        <boxGeometry args={[0.18, 0.8, 0.18]} />
        <meshLambertMaterial color={bossColor} />
      </mesh>
      <mesh position={[0.4, 0, 0.15]} rotation={[-0.6, 0, -0.3]}>
        <boxGeometry args={[0.18, 0.8, 0.18]} />
        <meshLambertMaterial color={bossColor} />
      </mesh>
      {/* Thick Legs */}
      <mesh position={[-0.15, -0.8, 0]}>
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshLambertMaterial color={bodyColor} />
      </mesh>
      <mesh position={[0.15, -0.8, 0]}>
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshLambertMaterial color={bodyColor} />
      </mesh>
      {/* Health bar above boss */}
      {!isDead && (
        <group position={[0, 1.2, 0]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.8, 0.08, 0.02]} />
            <meshBasicMaterial color="#333" />
          </mesh>
          <mesh position={[(health - 100) / 250, 0, 0.01]}>
            <boxGeometry args={[0.78 * (health / 100), 0.06, 0.02]} />
            <meshBasicMaterial color={health > 50 ? '#22c55e' : health > 25 ? '#eab308' : '#ef4444'} />
          </mesh>
        </group>
      )}
    </group>
  )
})

// Environment - Memoized
const Environment = memo(function Environment() {
  const { scene } = useGLTF('/models/environment/scene.gltf')
  const clonedScene = useMemo(() => scene.clone(), [scene])
  
  return (
    <primitive 
      object={clonedScene} 
      position={[0, 0, 0]}
      rotation={[0, Math.PI / 2, 0]}
      scale={1}
    />
  )
})

useGLTF.preload('/models/environment/scene.gltf')

// Muzzle Flash - Memoized
const MuzzleFlash = memo(function MuzzleFlash({ show }: { show: boolean }) {
  const { camera } = useThree()
  const lightRef = useRef<THREE.PointLight>(null)
  const offsetVec = useMemo(() => new THREE.Vector3(), [])

  useFrame(() => {
    if (!lightRef.current || !show) return
    offsetVec.set(0.28, -0.13, -0.6)
    offsetVec.applyQuaternion(camera.quaternion)
    lightRef.current.position.copy(camera.position).add(offsetVec)
  })

  if (!show) return null

  return <pointLight ref={lightRef} color="#ffaa00" intensity={3} distance={5} decay={2} />
})

// Main Component
export default function TypingDrill3D({ onExit }: { onExit: () => void }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [score, setScore] = useState(0)
  const [health, setHealth] = useState(100)
  const [wave, setWave] = useState(1)
  const [isPaused, setIsPaused] = useState(false)
  const [showGameOver, setShowGameOver] = useState(false)
  const [waveClearedInfo, setWaveClearedInfo] = useState<{ wave: number, points: number } | null>(null)
  const [volume, setVolume] = useState(50)
  const [recoil, setRecoil] = useState(0)
  const [showMuzzleFlash, setShowMuzzleFlash] = useState(false)
  
  const [zombies, setZombies] = useState<ZombieData[]>([])  
  const [activeZombieId, setActiveZombieId] = useState<number | null>(null)
  const [wordsCompleted, setWordsCompleted] = useState(0)
  const [wavePoints, setWavePoints] = useState(0)
  
  // Boss state
  const [isBossWave, setIsBossWave] = useState(false)
  const [bossParagraph, setBossParagraph] = useState('')
  const [bossTypedChars, setBossTypedChars] = useState(0)
  const [bossHealth, setBossHealth] = useState(100)
  const [bossPositionZ, setBossPositionZ] = useState(-15)
  
  // Track used words to prevent repetition
  const usedWordsRef = useRef<Set<string>>(new Set())

  const audioContextRef = useRef<AudioContext | null>(null)
  const audioBufferRef = useRef<AudioBuffer | null>(null)

  // Load gun sound
  useEffect(() => {
    const loadSound = async () => {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        const response = await fetch('/audio/gun sound.mp3')
        const arrayBuffer = await response.arrayBuffer()
        audioBufferRef.current = await audioContextRef.current.decodeAudioData(arrayBuffer)
      } catch (error) {
        console.error('Failed to load gun sound:', error)
      }
    }
    loadSound()
    return () => { audioContextRef.current?.close() }
  }, [])

  const playGunSound = () => {
    if (audioContextRef.current && audioBufferRef.current) {
      const source = audioContextRef.current.createBufferSource()
      const gainNode = audioContextRef.current.createGain()
      source.buffer = audioBufferRef.current
      gainNode.gain.value = volume / 100
      source.connect(gainNode)
      gainNode.connect(audioContextRef.current.destination)
      source.start(0)
    }
  }

  const shootGun = () => {
    setRecoil(1)
    setShowMuzzleFlash(true)
    playGunSound()
    setTimeout(() => {
      setRecoil(0)
      setShowMuzzleFlash(false)
    }, 100)
  }

  // Spawn zombies for a wave - using non-repeating words
  const spawnWave = (waveNum: number) => {
    // Check if boss wave (every 10th wave)
    if (waveNum % 10 === 0) {
      setIsBossWave(true)
      const paragraph = BOSS_PARAGRAPHS[Math.floor(Math.random() * BOSS_PARAGRAPHS.length)]
      setBossParagraph(paragraph)
      setBossTypedChars(0)
      setBossHealth(100)
      setBossPositionZ(-15)
      setZombies([])
      setActiveZombieId(null)
      return
    }
    
    setIsBossWave(false)
    const words = getWaveWords(waveNum, usedWordsRef.current)
    const newZombies: ZombieData[] = words.map((word, i) => ({
      id: Date.now() + i,
      word,
      typedChars: 0,
      positionZ: -8 - (i * 2.5), // Stagger spawn positions
      positionX: (Math.random() - 0.5) * 6, // Random X between -3 and 3
      isDead: false,
      hasHitPlayer: false
    }))
    
    setZombies(newZombies)
    setActiveZombieId(newZombies[0]?.id || null)
  }

  // Handle zombie reaching player - memoized to prevent re-renders
  const handleZombieReachPlayer = useCallback((zombieId: number) => {
    setZombies(prev => prev.map(z => 
      z.id === zombieId ? { ...z, hasHitPlayer: true, isDead: true } : z
    ))
    
    setHealth(prev => {
      const newHealth = prev - 20
      if (newHealth <= 0) {
        setIsPlaying(false)
        setShowGameOver(true)
        return 0
      }
      return newHealth
    })
    
    // Set next active zombie
    setZombies(prev => {
      const aliveZombies = prev.filter(z => !z.isDead && z.id !== zombieId)
      if (aliveZombies.length > 0) {
        setActiveZombieId(aliveZombies[0].id)
      }
      return prev
    })
  }, [])

  // Handle typing
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying || isPaused || waveClearedInfo) return
      
      // Boss wave typing
      if (isBossWave && bossParagraph) {
        const nextChar = bossParagraph[bossTypedChars]
        if (e.key.toUpperCase() === nextChar || (e.key === ' ' && nextChar === ' ')) {
          shootGun()
          const newTypedChars = bossTypedChars + 1
          setBossTypedChars(newTypedChars)
          
          // Calculate boss damage per character
          const damagePerChar = 100 / bossParagraph.length
          setBossHealth(prev => Math.max(0, prev - damagePerChar))
          
          // Add points for each character
          const charPoints = 5
          setScore(prev => prev + charPoints)
          setWavePoints(prev => prev + charPoints)
          
          if (newTypedChars >= bossParagraph.length) {
            // Boss defeated!
            setBossHealth(0)
            setWordsCompleted(prev => prev + 1)
            const bossBonus = 500
            setScore(prev => prev + bossBonus)
            setWavePoints(prev => prev + bossBonus)
            
            setWaveClearedInfo({ wave, points: wavePoints + bossBonus + (newTypedChars * 5) })
            setTimeout(() => {
              setWaveClearedInfo(null)
              setIsBossWave(false)
              const nextWave = wave + 1
              setWave(nextWave)
              setWavePoints(0)
              spawnWave(nextWave)
            }, 2500)
          }
        }
        return
      }
      
      const activeZombie = zombies.find(z => z.id === activeZombieId && !z.isDead)
      if (!activeZombie) return
      
      const nextChar = activeZombie.word[activeZombie.typedChars]
      
      if (e.key.toUpperCase() === nextChar) {
        shootGun()
        
        const newTypedChars = activeZombie.typedChars + 1
        
        if (newTypedChars >= activeZombie.word.length) {
          // Zombie killed
          setZombies(prev => prev.map(z => 
            z.id === activeZombieId ? { ...z, isDead: true, typedChars: newTypedChars } : z
          ))
          // Bonus points for longer words
          const wordBonus = activeZombie.word.length * 10
          const pointsEarned = 100 + wordBonus
          setScore(prev => prev + pointsEarned)
          setWavePoints(prev => prev + pointsEarned)
          setWordsCompleted(prev => prev + 1)
          
          // Find next alive zombie
          const aliveZombies = zombies.filter(z => !z.isDead && z.id !== activeZombieId)
          if (aliveZombies.length > 0) {
            setActiveZombieId(aliveZombies[0].id)
          } else {
            // Wave complete - show text and auto-continue
            setActiveZombieId(null)
            setWaveClearedInfo({ wave, points: wavePoints + pointsEarned })
            setTimeout(() => {
              setWaveClearedInfo(null)
              const nextWave = wave + 1
              setWave(nextWave)
              setWavePoints(0)
              spawnWave(nextWave)
            }, 2000)
          }
        } else {
          setZombies(prev => prev.map(z => 
            z.id === activeZombieId ? { ...z, typedChars: newTypedChars } : z
          ))
        }
      }
    }

    window.addEventListener('keypress', handleKeyPress)
    return () => window.removeEventListener('keypress', handleKeyPress)
  }, [isPlaying, isPaused, zombies, activeZombieId, wave, wavePoints, isBossWave, bossParagraph, bossTypedChars])

  // Start game
  const handleStart = () => {
    usedWordsRef.current.clear() // Reset used words on new game
    setIsPlaying(true)
    setScore(0)
    setHealth(100)
    setWave(1)
    setShowGameOver(false)
    setWaveClearedInfo(null)
    setWordsCompleted(0)
    setWavePoints(0)
    setIsBossWave(false)
    setBossParagraph('')
    setBossTypedChars(0)
    setBossHealth(100)
    spawnWave(1)
  }

  // Pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPlaying && !waveClearedInfo) {
        setIsPaused(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPlaying, waveClearedInfo])

  const handleResume = () => setIsPaused(false)
  const handleExit = () => {
    setIsPlaying(false)
    setIsPaused(false)
    onExit()
  }

  const activeZombie = zombies.find(z => z.id === activeZombieId && !z.isDead)

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', background: '#87CEEB', overflow: 'hidden' }}>
      {/* 3D Canvas - Optimized */}
      <Canvas
        camera={{ position: [0, 1.6, 8], fov: 75 }}
        style={{ background: 'linear-gradient(to bottom, #87CEEB 0%, #E0F6FF 100%)', width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
      >
        <ambientLight intensity={1} />
        <directionalLight position={[50, 50, 25]} intensity={1.2} />

        <Environment />

        {isPlaying && !showGameOver && <PlayerGun recoil={recoil} />}
        <MuzzleFlash show={showMuzzleFlash} />

        {/* Zombies */}
        {zombies.map((zombie) => (
          <Zombie
            key={zombie.id}
            id={zombie.id}
            positionX={zombie.positionX}
            positionZ={zombie.positionZ}
            isDead={zombie.isDead}
            wave={wave}
            onReachPlayer={() => handleZombieReachPlayer(zombie.id)}
          />
        ))}
        
        {/* Boss Zombie */}
        {isBossWave && (
          <BossZombie
            positionZ={bossPositionZ}
            health={bossHealth}
            wave={wave}
            onReachPlayer={() => {
              setHealth(prev => {
                const newHealth = prev - 50 // Boss deals 50 damage
                if (newHealth <= 0) {
                  setIsPlaying(false)
                  setShowGameOver(true)
                  return 0
                }
                return newHealth
              })
              setBossPositionZ(-15) // Reset boss position
            }}
          />
        )}
      </Canvas>

      {/* Start Screen */}
      {!isPlaying && !showGameOver && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', zIndex: 1000 }}>
          <div style={{ textAlign: 'center', color: '#fff', padding: '40px' }}>
            <h1 style={{ fontSize: '64px', marginBottom: '20px', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 'bold' }}>
              ZOMBIE TYPING
            </h1>
            <p style={{ fontSize: '20px', color: '#aaa', marginBottom: '40px' }}>
              Type words to kill zombies before they reach you!<br />
              Each zombie deals 20 damage. Survive the waves!<br />
              <span style={{ color: '#ef4444' }}>Every 10th wave: BOSS FIGHT!</span>
            </p>
            <button
              onClick={handleStart}
              style={{ padding: '16px 48px', fontSize: '24px', fontWeight: 'bold', border: 'none', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: '#fff', cursor: 'pointer', boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)' }}
            >
              START GAME
            </button>
          </div>
        </div>
      )}

      {/* HUD */}
      {isPlaying && !isPaused && !showGameOver && (
        <>
          {/* Top HUD */}
          <div style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '30px', zIndex: 10, background: 'rgba(0, 0, 0, 0.7)', padding: '15px 30px', borderRadius: '10px', border: '2px solid rgba(99, 102, 241, 0.3)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#6366f1', fontSize: '14px', fontWeight: 'bold' }}>WAVE</div>
              <div style={{ color: '#fff', fontSize: '28px', fontWeight: 'bold' }}>{wave}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#6366f1', fontSize: '14px', fontWeight: 'bold' }}>SCORE</div>
              <div style={{ color: '#fff', fontSize: '28px', fontWeight: 'bold' }}>{score}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#6366f1', fontSize: '14px', fontWeight: 'bold' }}>KILLS</div>
              <div style={{ color: '#fff', fontSize: '28px', fontWeight: 'bold' }}>{wordsCompleted}</div>
            </div>
          </div>

          {/* Professional Health Bar - Bottom Left */}
          <div style={{ 
            position: 'absolute', 
            bottom: '30px', 
            left: '30px', 
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            {/* Health Icon */}
            <div style={{
              width: '50px',
              height: '50px',
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(220, 38, 38, 0.3) 100%)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid rgba(239, 68, 68, 0.6)',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
            }}>
              <span style={{ fontSize: '28px' }}>❤️</span>
            </div>
            {/* Health Bar Container */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.8)',
              borderRadius: '8px',
              padding: '8px 12px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Health</span>
                <span style={{ 
                  color: health > 50 ? '#22c55e' : health > 25 ? '#eab308' : '#ef4444', 
                  fontSize: '16px', 
                  fontWeight: 'bold',
                  fontFamily: 'monospace'
                }}>{health}</span>
              </div>
              <div style={{ 
                width: '200px', 
                height: '12px', 
                background: 'rgba(255, 255, 255, 0.1)', 
                borderRadius: '6px', 
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div style={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100%', 
                  width: `${health}%`, 
                  background: health > 50 
                    ? 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)' 
                    : health > 25 
                      ? 'linear-gradient(90deg, #eab308 0%, #ca8a04 100%)' 
                      : 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
                  borderRadius: '6px',
                  transition: 'width 0.3s ease-out',
                  boxShadow: health > 50 
                    ? '0 0 10px rgba(34, 197, 94, 0.5)' 
                    : health > 25 
                      ? '0 0 10px rgba(234, 179, 8, 0.5)' 
                      : '0 0 10px rgba(239, 68, 68, 0.5)'
                }} />
                {/* Shine effect */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '50%',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)',
                  borderRadius: '6px 6px 0 0'
                }} />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Current Word Display - Normal Zombies */}
      {isPlaying && !isPaused && !showGameOver && !isBossWave && activeZombie && (
        <div style={{ position: 'absolute', bottom: '100px', left: '50%', transform: 'translateX(-50%)', zIndex: 10, background: 'rgba(0, 0, 0, 0.9)', padding: '20px 40px', borderRadius: '15px', border: '3px solid #6366f1', boxShadow: '0 0 30px rgba(99, 102, 241, 0.5)' }}>
          <div style={{ fontSize: '48px', fontWeight: 'bold', letterSpacing: '8px', fontFamily: 'monospace' }}>
            {activeZombie.word.split('').map((char, i) => (
              <span key={i} style={{ color: i < activeZombie.typedChars ? '#00ff00' : '#ffffff', textShadow: i < activeZombie.typedChars ? '0 0 10px #00ff00' : 'none' }}>
                {char}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Boss Paragraph Display */}
      {isPlaying && !isPaused && !showGameOver && isBossWave && bossHealth > 0 && (
        <div style={{ 
          position: 'absolute', 
          bottom: '80px', 
          left: '50%', 
          transform: 'translateX(-50%)', 
          zIndex: 10, 
          background: 'rgba(0, 0, 0, 0.95)', 
          padding: '25px 40px', 
          borderRadius: '15px', 
          border: '3px solid #ef4444', 
          boxShadow: '0 0 40px rgba(239, 68, 68, 0.5)',
          maxWidth: '90%',
          width: '900px'
        }}>
          {/* Boss Wave Indicator */}
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '15px',
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#ef4444',
            textShadow: '0 0 10px rgba(239, 68, 68, 0.8)',
            letterSpacing: '4px'
          }}>
            ⚠️ BOSS WAVE {wave} ⚠️
          </div>
          {/* Boss Health Bar */}
          <div style={{ 
            width: '100%', 
            height: '20px', 
            background: 'rgba(255, 255, 255, 0.1)', 
            borderRadius: '10px', 
            overflow: 'hidden',
            marginBottom: '20px',
            border: '2px solid #ef4444'
          }}>
            <div style={{ 
              height: '100%', 
              width: `${bossHealth}%`, 
              background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
              borderRadius: '8px',
              transition: 'width 0.1s ease-out',
              boxShadow: '0 0 15px rgba(239, 68, 68, 0.6)'
            }} />
          </div>
          {/* Paragraph to type */}
          <div style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            fontFamily: 'monospace',
            lineHeight: '1.6',
            textAlign: 'center',
            wordWrap: 'break-word'
          }}>
            {bossParagraph.split('').map((char, i) => (
              <span 
                key={i} 
                style={{ 
                  color: i < bossTypedChars ? '#00ff00' : i === bossTypedChars ? '#ffff00' : '#ffffff',
                  textShadow: i < bossTypedChars ? '0 0 8px #00ff00' : i === bossTypedChars ? '0 0 12px #ffff00' : 'none',
                  backgroundColor: i === bossTypedChars ? 'rgba(255, 255, 0, 0.2)' : 'transparent',
                  padding: char === ' ' ? '0 4px' : '0'
                }}
              >
                {char}
              </span>
            ))}
          </div>
          {/* Progress */}
          <div style={{ 
            textAlign: 'center', 
            marginTop: '15px',
            fontSize: '16px',
            color: '#888'
          }}>
            {bossTypedChars} / {bossParagraph.length} characters
          </div>
        </div>
      )}

      {/* Wave Cleared Text */}
      {waveClearedInfo && (
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)', 
          zIndex: 100,
          textAlign: 'center',
          animation: 'fadeInOut 2s ease-in-out'
        }}>
          {waveClearedInfo.wave % 10 === 0 && (
            <div style={{ 
              fontSize: '36px', 
              fontWeight: 'bold', 
              color: '#ef4444', 
              textShadow: '0 0 20px rgba(239, 68, 68, 0.8)',
              marginBottom: '10px',
              letterSpacing: '4px'
            }}>
              💀 BOSS DEFEATED 💀
            </div>
          )}
          <div style={{ 
            fontSize: '72px', 
            fontWeight: 'bold', 
            color: waveClearedInfo.wave % 10 === 0 ? '#ef4444' : '#22c55e', 
            textShadow: waveClearedInfo.wave % 10 === 0 
              ? '0 0 30px rgba(239, 68, 68, 0.8), 0 0 60px rgba(239, 68, 68, 0.4)'
              : '0 0 30px rgba(34, 197, 94, 0.8), 0 0 60px rgba(34, 197, 94, 0.4)',
            letterSpacing: '8px',
            fontFamily: 'monospace'
          }}>
            WAVE {String(waveClearedInfo.wave).padStart(3, '0')}
          </div>
          <div style={{ 
            fontSize: '48px', 
            fontWeight: 'bold', 
            color: '#fff', 
            textShadow: '0 0 20px rgba(255, 255, 255, 0.5)',
            marginTop: '10px'
          }}>
            CLEARED
          </div>
          <div style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            color: '#fbbf24', 
            textShadow: '0 0 20px rgba(251, 191, 36, 0.6)',
            marginTop: '20px'
          }}>
            +{waveClearedInfo.points} PTS
          </div>
        </div>
      )}

      {/* Pause Menu */}
      {isPaused && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0, 0, 0, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, cursor: 'default' }}>
          <div style={{ background: 'linear-gradient(135deg, #2a2a3e 0%, #1a1a2e 100%)', borderRadius: '16px', padding: '40px', minWidth: '400px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <h2 style={{ color: '#fff', fontSize: '32px', marginBottom: '30px', textAlign: 'center', fontWeight: 'bold' }}>PAUSED</h2>
            <div style={{ marginBottom: '30px' }}>
              <label style={{ color: '#aaa', fontSize: '14px', display: 'block', marginBottom: '8px' }}>Volume: {volume}%</label>
              <input type="range" min="0" max="100" step="5" value={volume} onChange={(e) => setVolume(parseInt(e.target.value))} style={{ width: '100%', height: '8px', borderRadius: '4px', cursor: 'pointer', accentColor: '#6366f1' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button onClick={handleResume} style={{ padding: '14px 24px', fontSize: '16px', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: '#fff' }}>RESUME</button>
              <button onClick={handleExit} style={{ padding: '14px 24px', fontSize: '16px', fontWeight: 'bold', border: '2px solid rgba(255, 255, 255, 0.3)', borderRadius: '8px', cursor: 'pointer', background: 'transparent', color: '#fff' }}>EXIT TO MENU</button>
            </div>
            <p style={{ color: '#666', fontSize: '12px', textAlign: 'center', marginTop: '20px' }}>Press ESC to resume</p>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {showGameOver && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(10px)', background: 'rgba(0, 0, 0, 0.7)', cursor: 'default' }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(30, 30, 40, 0.95) 0%, rgba(20, 20, 30, 0.95) 100%)', padding: '50px 60px', borderRadius: '20px', border: '2px solid rgba(239, 68, 68, 0.5)', boxShadow: '0 0 60px rgba(239, 68, 68, 0.3)', textAlign: 'center', minWidth: '400px' }}>
            <h2 style={{ fontSize: '48px', fontWeight: 'bold', color: '#ef4444', marginBottom: '10px', textShadow: '0 0 20px rgba(239, 68, 68, 0.8)' }}>YOU DIED</h2>
            <div style={{ fontSize: '72px', fontWeight: 'bold', color: '#6366f1', margin: '30px 0', textShadow: '0 0 30px rgba(99, 102, 241, 0.6)' }}>{score}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
              <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                <div style={{ color: '#888', fontSize: '14px', marginBottom: '5px' }}>WAVES SURVIVED</div>
                <div style={{ color: '#6366f1', fontSize: '36px', fontWeight: 'bold' }}>{wave}</div>
              </div>
              <div style={{ background: 'rgba(251, 191, 36, 0.15)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
                <div style={{ color: '#888', fontSize: '14px', marginBottom: '5px' }}>ZOMBIES KILLED</div>
                <div style={{ color: '#fbbf24', fontSize: '36px', fontWeight: 'bold' }}>{wordsCompleted}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button onClick={handleStart} style={{ padding: '16px 32px', fontSize: '18px', fontWeight: 'bold', border: 'none', borderRadius: '10px', cursor: 'pointer', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: '#fff', boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)' }}>PLAY AGAIN</button>
              <button onClick={handleExit} style={{ padding: '16px 32px', fontSize: '18px', fontWeight: 'bold', border: '2px solid rgba(255, 255, 255, 0.3)', borderRadius: '10px', cursor: 'pointer', background: 'rgba(255, 255, 255, 0.05)', color: '#fff' }}>EXIT</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
