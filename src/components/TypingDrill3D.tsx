import { useRef, useState, useEffect, useMemo, memo, useCallback, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'

import * as THREE from 'three'
import type { User } from 'firebase/auth'
import { submitScore } from '../firebase/leaderboardService'
import { updateGameStats, type Achievement } from '../firebase/achievementsService'

// Load zombie horror fonts
const fontLink = document.createElement('link')
fontLink.href = 'https://fonts.googleapis.com/css2?family=Creepster&family=Nosifer&family=Metal+Mania&family=Special+Elite&display=swap'
fontLink.rel = 'stylesheet'
if (!document.head.querySelector('link[href*="Creepster"]')) {
  document.head.appendChild(fontLink)
}

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

// High Poly Professional Gun with Muzzle Flash
const PlayerGun = memo(function PlayerGun({ recoil }: { recoil: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const muzzleFlashRef = useRef<THREE.PointLight>(null)
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
    
    // Muzzle flash animation
    if (muzzleFlashRef.current) {
      muzzleFlashRef.current.intensity = recoil * 15
    }
  })

  return (
    <group ref={groupRef}>
      {/* Main gun body - receiver - Dark Gunmetal */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.09, 0.09, 0.45]} />
        <meshStandardMaterial color="#2c3539" metalness={0.95} roughness={0.15} />
      </mesh>
      
      {/* Upper rail system - Matte Black */}
      <mesh position={[0, 0.055, -0.05]} castShadow>
        <boxGeometry args={[0.095, 0.015, 0.35]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.95} roughness={0.1} />
      </mesh>
      
      {/* Rail segments (picatinny) - Dark Gray */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <boxGeometry args={[0.08, 0.01, 0.04]} />
        <meshStandardMaterial color="#3a3a3a" metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.05, -0.08]} castShadow>
        <boxGeometry args={[0.08, 0.01, 0.04]} />
        <meshStandardMaterial color="#3a3a3a" metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.05, -0.16]} castShadow>
        <boxGeometry args={[0.08, 0.01, 0.04]} />
        <meshStandardMaterial color="#3a3a3a" metalness={0.85} roughness={0.25} />
      </mesh>
      
      {/* Barrel - Blued Steel Dark */}
      <mesh position={[0, 0.02, -0.3]} castShadow>
        <cylinderGeometry args={[0.018, 0.016, 0.2, 20]} />
        <meshStandardMaterial color="#1a1f26" metalness={0.98} roughness={0.08} />
      </mesh>
      
      {/* Barrel shroud/handguard - Tan/FDE (Flat Dark Earth) */}
      <mesh position={[0, 0.02, -0.18]} castShadow>
        <cylinderGeometry args={[0.035, 0.032, 0.22, 12]} />
        <meshStandardMaterial color="#8b7355" metalness={0.3} roughness={0.6} />
      </mesh>
      
      {/* Handguard ventilation slots */}
      <mesh position={[0.025, 0.02, -0.18]} castShadow>
        <boxGeometry args={[0.005, 0.05, 0.18]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[-0.025, 0.02, -0.18]} castShadow>
        <boxGeometry args={[0.005, 0.05, 0.18]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.2} />
      </mesh>
      
      {/* Handguard rails - Black */}
      <mesh position={[0, 0.055, -0.18]} castShadow>
        <boxGeometry args={[0.04, 0.008, 0.22]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0.03, 0.035, -0.18]} rotation={[0, 0, Math.PI/4]} castShadow>
        <boxGeometry args={[0.025, 0.006, 0.22]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[-0.03, 0.035, -0.18]} rotation={[0, 0, -Math.PI/4]} castShadow>
        <boxGeometry args={[0.025, 0.006, 0.22]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.2} />
      </mesh>
      
      {/* Magazine well - Gunmetal */}
      <mesh position={[0, -0.06, 0.05]} castShadow>
        <boxGeometry args={[0.045, 0.11, 0.09]} />
        <meshStandardMaterial color="#2c3539" metalness={0.9} roughness={0.2} />
      </mesh>
      
      {/* Magazine - Dark Bronze/Copper */}
      <mesh position={[0, -0.12, 0.05]} castShadow>
        <boxGeometry args={[0.04, 0.15, 0.08]} />
        <meshStandardMaterial color="#3d2817" metalness={0.7} roughness={0.4} />
      </mesh>
      
      {/* Magazine window (shows ammo) */}
      <mesh position={[0.021, -0.12, 0.05]} castShadow>
        <boxGeometry args={[0.001, 0.12, 0.06]} />
        <meshStandardMaterial color="#8b6914" metalness={0.8} roughness={0.3} transparent opacity={0.6} />
      </mesh>
      
      {/* Magazine base plate - Black */}
      <mesh position={[0, -0.195, 0.05]} castShadow>
        <boxGeometry args={[0.045, 0.01, 0.085]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.95} roughness={0.15} />
      </mesh>
      
      {/* Trigger guard - Steel */}
      <mesh position={[0, -0.04, 0.08]} castShadow>
        <torusGeometry args={[0.035, 0.008, 10, 20, Math.PI]} />
        <meshStandardMaterial color="#4a5568" metalness={0.95} roughness={0.15} />
      </mesh>
      
      {/* Trigger - Anodized Red */}
      <mesh position={[0, -0.045, 0.08]} castShadow>
        <boxGeometry args={[0.012, 0.03, 0.02]} />
        <meshStandardMaterial color="#8b0000" metalness={0.85} roughness={0.2} />
      </mesh>
      
      {/* Pistol grip - Tan Polymer */}
      <mesh position={[0, -0.08, 0.15]} rotation={[0.3, 0, 0]} castShadow>
        <boxGeometry args={[0.05, 0.12, 0.04]} />
        <meshStandardMaterial color="#8b7355" metalness={0.2} roughness={0.7} />
      </mesh>
      
      {/* Grip texture panels - Black Rubber */}
      <mesh position={[-0.026, -0.08, 0.15]} rotation={[0.3, 0, 0]} castShadow>
        <boxGeometry args={[0.001, 0.1, 0.035]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.1} roughness={0.95} />
      </mesh>
      <mesh position={[0.026, -0.08, 0.15]} rotation={[0.3, 0, 0]} castShadow>
        <boxGeometry args={[0.001, 0.1, 0.035]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.1} roughness={0.95} />
      </mesh>
      
      {/* Stock/buffer tube - Matte Black */}
      <mesh position={[0, 0, 0.25]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.18, 16]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.15} />
      </mesh>
      
      {/* Adjustable stock - Tan */}
      <mesh position={[0, -0.01, 0.35]} castShadow>
        <boxGeometry args={[0.08, 0.08, 0.02]} />
        <meshStandardMaterial color="#8b7355" metalness={0.3} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.02, 0.32]} castShadow>
        <boxGeometry args={[0.06, 0.03, 0.08]} />
        <meshStandardMaterial color="#8b7355" metalness={0.3} roughness={0.6} />
      </mesh>
      
      {/* Cheek rest - Black */}
      <mesh position={[0, 0.04, 0.33]} castShadow>
        <boxGeometry args={[0.055, 0.015, 0.06]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.2} roughness={0.8} />
      </mesh>
      
      {/* Charging handle - Anodized Bronze */}
      <mesh position={[0, 0.04, 0.1]} castShadow>
        <boxGeometry args={[0.025, 0.015, 0.04]} />
        <meshStandardMaterial color="#cd7f32" metalness={0.9} roughness={0.25} />
      </mesh>
      
      {/* Bolt catch - Steel */}
      <mesh position={[-0.048, -0.01, 0.12]} castShadow>
        <boxGeometry args={[0.008, 0.025, 0.015]} />
        <meshStandardMaterial color="#4a5568" metalness={0.95} roughness={0.2} />
      </mesh>
      
      {/* Forward assist - Steel */}
      <mesh position={[0.048, 0.03, 0.05]} castShadow>
        <cylinderGeometry args={[0.01, 0.01, 0.015, 10]} />
        <meshStandardMaterial color="#4a5568" metalness={0.95} roughness={0.2} />
      </mesh>
      
      {/* Ejection port - Dark Interior */}
      <mesh position={[0.046, 0.01, 0.08]} castShadow>
        <boxGeometry args={[0.002, 0.04, 0.06]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.98} roughness={0.05} />
      </mesh>
      
      {/* Dust cover - Gunmetal */}
      <mesh position={[0.045, 0.02, 0.08]} castShadow>
        <boxGeometry args={[0.001, 0.05, 0.08]} />
        <meshStandardMaterial color="#2c3539" metalness={0.95} roughness={0.15} />
      </mesh>
      
      {/* Muzzle device/compensator - Black Steel */}
      <mesh position={[0, 0.02, -0.42]} castShadow>
        <cylinderGeometry args={[0.025, 0.022, 0.04, 12]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.95} roughness={0.2} />
      </mesh>
      
      {/* Muzzle brake ports */}
      <mesh position={[0, 0.035, -0.42]} castShadow>
        <boxGeometry args={[0.015, 0.01, 0.035]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.98} roughness={0.1} />
      </mesh>
      <mesh position={[0.02, 0.02, -0.42]} rotation={[0, 0, Math.PI/2]} castShadow>
        <boxGeometry args={[0.008, 0.01, 0.035]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.98} roughness={0.1} />
      </mesh>
      <mesh position={[-0.02, 0.02, -0.42]} rotation={[0, 0, Math.PI/2]} castShadow>
        <boxGeometry args={[0.008, 0.01, 0.035]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.98} roughness={0.1} />
      </mesh>
      
      {/* Flash hider threads */}
      <mesh position={[0, 0.02, -0.44]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.015, 12]} />
        <meshStandardMaterial color="#2c3539" metalness={0.95} roughness={0.15} />
      </mesh>
      
      {/* Front sight post - Green Tritium */}
      <mesh position={[0, 0.065, -0.25]} castShadow>
        <boxGeometry args={[0.008, 0.025, 0.008]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.08, -0.25]} castShadow>
        <sphereGeometry args={[0.004, 8, 8]} />
        <meshBasicMaterial color="#00ff00" />
      </mesh>
      
      {/* Front sight housing */}
      <mesh position={[0, 0.07, -0.25]} castShadow>
        <boxGeometry args={[0.025, 0.04, 0.02]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.2} />
      </mesh>
      
      {/* Rear sight - Flip-up */}
      <mesh position={[0, 0.07, 0.05]} castShadow>
        <boxGeometry args={[0.03, 0.025, 0.015]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.085, 0.05]} castShadow>
        <boxGeometry args={[0.035, 0.005, 0.02]} />
        <meshStandardMaterial color="#2c3539" metalness={0.95} roughness={0.15} />
      </mesh>
      
      {/* Gas block - Steel */}
      <mesh position={[0, 0.035, -0.15]} castShadow>
        <cylinderGeometry args={[0.022, 0.022, 0.03, 12]} />
        <meshStandardMaterial color="#4a5568" metalness={0.95} roughness={0.15} />
      </mesh>
      
      {/* Gas tube - Stainless */}
      <mesh position={[0, 0.045, -0.05]} castShadow>
        <cylinderGeometry args={[0.004, 0.004, 0.2, 8]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.98} roughness={0.1} />
      </mesh>
      
      {/* Sling mount - Steel */}
      <mesh position={[0.04, -0.02, 0.2]} rotation={[0, 0, Math.PI/2]} castShadow>
        <torusGeometry args={[0.012, 0.004, 8, 12]} />
        <meshStandardMaterial color="#4a5568" metalness={0.95} roughness={0.2} />
      </mesh>
      
      {/* Muzzle flash light */}
      <pointLight 
        ref={muzzleFlashRef}
        position={[0, 0.02, -0.45]} 
        color="#ff8800" 
        intensity={0}
        distance={4}
        decay={2}
      />
      
      {/* Muzzle flash sprite - Multi-layered */}
      {recoil > 0 && (
        <>
          <mesh position={[0, 0.02, -0.45]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial color="#ffaa00" transparent opacity={recoil * 0.9} />
          </mesh>
          <mesh position={[0, 0.02, -0.47]}>
            <sphereGeometry args={[0.03, 6, 6]} />
            <meshBasicMaterial color="#ff6600" transparent opacity={recoil * 0.7} />
          </mesh>
          <mesh position={[0, 0.02, -0.5]}>
            <coneGeometry args={[0.04, 0.1, 6]} />
            <meshBasicMaterial color="#ff8800" transparent opacity={recoil * 0.5} />
          </mesh>
        </>
      )}
    </group>
  )
})

// Animated 3D Zombie Model Component - Uses GLB format (self-contained)
const AnimatedZombieModel = memo(function AnimatedZombieModel({
  positionX,
  positionZ,
  isDead
}: {
  positionX: number
  positionZ: number
  isDead: boolean
}) {
  const groupRef = useRef<THREE.Group>(null)
  
  // Load the walking zombie model from zombie3d folder
  const { scene, animations } = useGLTF('/models/zombie/zombie3d/zombie walk.gltf')
  const { actions } = useAnimations(animations, groupRef)
  
  // Clone the scene to avoid sharing between instances
  const clonedScene = useMemo(() => {
    const clone = scene.clone()
    clone.scale.set(0.5, 0.5, 0.5) // Adjust scale for the zombie3d model
    clone.traverse((child: THREE.Object3D) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        mesh.castShadow = true
        mesh.receiveShadow = true
        // Ensure materials are visible
        if (mesh.material) {
          const material = mesh.material as THREE.MeshStandardMaterial
          material.needsUpdate = true
        }
      }
    })
    return clone
  }, [scene])
  
  // Handle animations
  useEffect(() => {
    if (!actions || Object.keys(actions).length === 0) return
    
    if (isDead) {
      Object.values(actions).forEach(action => action?.stop())
    } else {
      // Play walk animation if available, or first animation
      const walkAction = actions['walk'] || actions['Walk'] || actions['walking'] || Object.values(actions)[0]
      if (walkAction) {
        walkAction.reset().fadeIn(0.2).play()
      }
    }
    
    return () => {
      Object.values(actions).forEach(action => action?.stop())
    }
  }, [isDead, actions])

  return (
    <group ref={groupRef} position={[positionX, 0, positionZ]} rotation={[0, Math.PI, 0]}>
      <primitive object={clonedScene} />
    </group>
  )
})

// High-poly professional zombie model with walking animation
const FallbackZombieModel = memo(function FallbackZombieModel({ 
  positionX,
  positionZ,
  isDead
}: { 
  positionX: number
  positionZ: number
  isDead: boolean
}) {
  const groupRef = useRef<THREE.Group>(null)
  const leftLegRef = useRef<THREE.Group>(null)
  const rightLegRef = useRef<THREE.Group>(null)
  const leftArmRef = useRef<THREE.Group>(null)
  const rightArmRef = useRef<THREE.Group>(null)
  const headRef = useRef<THREE.Group>(null)
  const bodyRef = useRef<THREE.Group>(null)
  
  // Zombie colors - realistic undead palette
  const skinColor = isDead ? '#2d4a2d' : '#6b8b6b'
  const darkSkinColor = isDead ? '#1a2e1a' : '#4a6a4a'
  const clothesColor = isDead ? '#3a3a3a' : '#505050'
  const bloodColor = '#5a1010'
  const eyeColor = isDead ? '#220000' : '#ff3333'
  
  // Walking animation
  useFrame((state) => {
    if (isDead || !groupRef.current) return
    
    const time = state.clock.elapsedTime * 3
    const walkCycle = Math.sin(time) * 0.5
    
    // Leg animation - walking
    if (leftLegRef.current && rightLegRef.current) {
      leftLegRef.current.rotation.x = walkCycle
      rightLegRef.current.rotation.x = -walkCycle
    }
    
    // Arm animation - opposite to legs
    if (leftArmRef.current && rightArmRef.current) {
      leftArmRef.current.rotation.x = -walkCycle * 0.8 + 0.5
      rightArmRef.current.rotation.x = walkCycle * 0.8 + 0.5
    }
    
    // Body bob
    if (bodyRef.current) {
      bodyRef.current.position.y = Math.abs(Math.sin(time * 2)) * 0.05
    }
    
    // Head sway
    if (headRef.current) {
      headRef.current.rotation.z = Math.sin(time * 0.5) * 0.08
      headRef.current.rotation.x = Math.sin(time * 1.5) * 0.05
    }
  })
  
  return (
    <group ref={groupRef} position={[positionX, 0, positionZ]}>
      {/* Body group */}
      <group ref={bodyRef} position={[0, 1, 0]}>
        {/* Head */}
        <group ref={headRef} position={[0, 1.6, 0]}>
          {/* Main skull - higher poly sphere */}
          <mesh position={[0, 0, 0]} castShadow>
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshStandardMaterial color={skinColor} roughness={0.9} metalness={0.1} />
          </mesh>
          
          {/* Jaw */}
          <mesh position={[0, -0.12, 0.08]} castShadow>
            <boxGeometry args={[0.18, 0.12, 0.16]} />
            <meshStandardMaterial color={darkSkinColor} roughness={0.9} />
          </mesh>
          
          {/* Eyes - glowing red */}
          <mesh position={[-0.09, 0.05, 0.18]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={isDead ? 0 : 2} />
          </mesh>
          <mesh position={[0.09, 0.05, 0.18]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={isDead ? 0 : 2} />
          </mesh>
          
          {/* Nose */}
          <mesh position={[0, -0.02, 0.2]} castShadow>
            <boxGeometry args={[0.06, 0.08, 0.08]} />
            <meshStandardMaterial color={darkSkinColor} roughness={0.9} />
          </mesh>
          
          {/* Ears */}
          <mesh position={[-0.22, 0, 0]} rotation={[0, 0, Math.PI / 8]} castShadow>
            <boxGeometry args={[0.04, 0.12, 0.08]} />
            <meshStandardMaterial color={skinColor} roughness={0.9} />
          </mesh>
          <mesh position={[0.22, 0, 0]} rotation={[0, 0, -Math.PI / 8]} castShadow>
            <boxGeometry args={[0.04, 0.12, 0.08]} />
            <meshStandardMaterial color={skinColor} roughness={0.9} />
          </mesh>
          
          {/* Blood/wounds on face */}
          {!isDead && (
            <>
              <mesh position={[0.05, 0.08, 0.21]}>
                <sphereGeometry args={[0.03, 8, 8]} />
                <meshStandardMaterial color={bloodColor} roughness={0.7} />
              </mesh>
              <mesh position={[-0.08, -0.05, 0.2]}>
                <sphereGeometry args={[0.025, 8, 8]} />
                <meshStandardMaterial color={bloodColor} roughness={0.7} />
              </mesh>
            </>
          )}
        </group>
        
        {/* Neck */}
        <mesh position={[0, 1.35, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.1, 0.2, 12]} />
          <meshStandardMaterial color={skinColor} roughness={0.9} />
        </mesh>
        
        {/* Upper torso/chest */}
        <mesh position={[0, 0.85, 0]} castShadow>
          <boxGeometry args={[0.5, 0.6, 0.28]} />
          <meshStandardMaterial color={clothesColor} roughness={0.95} />
        </mesh>
        
        {/* Lower torso */}
        <mesh position={[0, 0.35, 0]} castShadow>
          <boxGeometry args={[0.45, 0.4, 0.26]} />
          <meshStandardMaterial color={clothesColor} roughness={0.95} />
        </mesh>
        
        {/* Shoulders */}
        <mesh position={[-0.3, 1.05, 0]} castShadow>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshStandardMaterial color={clothesColor} roughness={0.95} />
        </mesh>
        <mesh position={[0.3, 1.05, 0]} castShadow>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshStandardMaterial color={clothesColor} roughness={0.95} />
        </mesh>
        
        {/* Left Arm */}
        <group ref={leftArmRef} position={[-0.35, 1, 0]}>
          {/* Upper arm */}
          <mesh position={[0, -0.25, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.07, 0.45, 12]} />
            <meshStandardMaterial color={clothesColor} roughness={0.95} />
          </mesh>
          {/* Forearm */}
          <mesh position={[0, -0.65, 0.1]} rotation={[-0.3, 0, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.06, 0.4, 12]} />
            <meshStandardMaterial color={skinColor} roughness={0.9} />
          </mesh>
          {/* Hand */}
          <mesh position={[0, -0.95, 0.2]} castShadow>
            <boxGeometry args={[0.08, 0.12, 0.06]} />
            <meshStandardMaterial color={skinColor} roughness={0.9} />
          </mesh>
          {/* Fingers */}
          <mesh position={[0, -1.05, 0.25]} castShadow>
            <boxGeometry args={[0.06, 0.08, 0.03]} />
            <meshStandardMaterial color={darkSkinColor} roughness={0.9} />
          </mesh>
        </group>
        
        {/* Right Arm */}
        <group ref={rightArmRef} position={[0.35, 1, 0]}>
          {/* Upper arm */}
          <mesh position={[0, -0.25, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.07, 0.45, 12]} />
            <meshStandardMaterial color={clothesColor} roughness={0.95} />
          </mesh>
          {/* Forearm */}
          <mesh position={[0, -0.65, 0.1]} rotation={[-0.3, 0, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.06, 0.4, 12]} />
            <meshStandardMaterial color={skinColor} roughness={0.9} />
          </mesh>
          {/* Hand */}
          <mesh position={[0, -0.95, 0.2]} castShadow>
            <boxGeometry args={[0.08, 0.12, 0.06]} />
            <meshStandardMaterial color={skinColor} roughness={0.9} />
          </mesh>
          {/* Fingers */}
          <mesh position={[0, -1.05, 0.25]} castShadow>
            <boxGeometry args={[0.06, 0.08, 0.03]} />
            <meshStandardMaterial color={darkSkinColor} roughness={0.9} />
          </mesh>
        </group>
        
        {/* Left Leg */}
        <group ref={leftLegRef} position={[-0.15, 0.1, 0]}>
          {/* Thigh */}
          <mesh position={[0, -0.3, 0]} castShadow>
            <cylinderGeometry args={[0.11, 0.09, 0.55, 12]} />
            <meshStandardMaterial color={clothesColor} roughness={0.95} />
          </mesh>
          {/* Knee */}
          <mesh position={[0, -0.6, 0]} castShadow>
            <sphereGeometry args={[0.09, 12, 12]} />
            <meshStandardMaterial color={clothesColor} roughness={0.95} />
          </mesh>
          {/* Lower leg */}
          <mesh position={[0, -0.85, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.07, 0.45, 12]} />
            <meshStandardMaterial color={clothesColor} roughness={0.95} />
          </mesh>
          {/* Foot */}
          <mesh position={[0, -1.1, 0.08]} castShadow>
            <boxGeometry args={[0.12, 0.08, 0.22]} />
            <meshStandardMaterial color={darkSkinColor} roughness={0.95} />
          </mesh>
        </group>
        
        {/* Right Leg */}
        <group ref={rightLegRef} position={[0.15, 0.1, 0]}>
          {/* Thigh */}
          <mesh position={[0, -0.3, 0]} castShadow>
            <cylinderGeometry args={[0.11, 0.09, 0.55, 12]} />
            <meshStandardMaterial color={clothesColor} roughness={0.95} />
          </mesh>
          {/* Knee */}
          <mesh position={[0, -0.6, 0]} castShadow>
            <sphereGeometry args={[0.09, 12, 12]} />
            <meshStandardMaterial color={clothesColor} roughness={0.95} />
          </mesh>
          {/* Lower leg */}
          <mesh position={[0, -0.85, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.07, 0.45, 12]} />
            <meshStandardMaterial color={clothesColor} roughness={0.95} />
          </mesh>
          {/* Foot */}
          <mesh position={[0, -1.1, 0.08]} castShadow>
            <boxGeometry args={[0.12, 0.08, 0.22]} />
            <meshStandardMaterial color={darkSkinColor} roughness={0.95} />
          </mesh>
        </group>
      </group>
    </group>
  )
})

// Error boundary for 3D model loading
const ZombieErrorBoundary = ({ positionX, positionZ, isDead }: { positionX: number, positionZ: number, isDead: boolean }) => {
  const [hasError, setHasError] = useState(false)
  
  if (hasError) {
    return <FallbackZombieModel positionX={positionX} positionZ={positionZ} isDead={isDead} />
  }
  
  return (
    <Suspense fallback={<FallbackZombieModel positionX={positionX} positionZ={positionZ} isDead={isDead} />}>
      <AnimatedZombieModel positionX={positionX} positionZ={positionZ} isDead={isDead} />
    </Suspense>
  )
}

// Zombie wrapper - uses 3D model with Suspense and error boundary fallback
const ZombieWith3D = memo(function ZombieWith3D({ 
  positionX,
  positionZ,
  isDead
}: { 
  positionX: number
  positionZ: number
  isDead: boolean
}) {
  // Use fallback geometric zombies for stability
  return <FallbackZombieModel positionX={positionX} positionZ={positionZ} isDead={isDead} />
})

// 3D Zombie Model Component - Updated to use animated 3D model
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
        
        // Check if reached player - zombie must be very close to camera (at Z=20)
        if (newZ > 18 && !hasReached.current) {
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

  // Simple walking animation using useFrame
  useFrame((state) => {
    if (groupRef.current && !isDead) {
      const time = state.clock.elapsedTime + id * 0.5 // Offset for each zombie
      // Simple bob animation
      groupRef.current.position.y = Math.sin(time * 4) * 0.1 + 0.5 + deathY
      // Simple rotation for walking effect
      groupRef.current.rotation.z = Math.sin(time * 8) * 0.05
    }
  })

  return (
    <group 
      ref={groupRef} 
      position={[positionX, deathY, currentZ]}
      rotation={[deathRotation, 0, 0]}
    >
      {/* Use the new animated 3D zombie */}
      <ZombieWith3D positionX={0} positionZ={0} isDead={isDead} />
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
      
      // Boss must be very close to camera (at Z=20) to deal damage
      if (currentZRef.current > 18 && !hasReachedRef.current) {
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

// Environment types
type EnvironmentType = 'default' | 'nightcity' | 'wasteland' | 'custom3d'

// Environment - Memoized with simple geometric environment
const Environment = memo(function Environment({ environmentType = 'default' }: { environmentType?: EnvironmentType }) {
  // Different configurations for each environment
  const envConfig = useMemo(() => {
    switch (environmentType) {
      case 'nightcity':
        return {
          fog: { color: '#001122', near: 10, far: 50 },
          ambient: '#221133',
          lights: [
            { color: '#ff4444', intensity: 0.3, position: [10, 8, 5] },
            { color: '#4444ff', intensity: 0.2, position: [-8, 6, -10] },
            { color: '#ff8844', intensity: 0.4, position: [0, 12, -5] }
          ],
          groundColor: '#111122'
        }
      case 'wasteland':
        return {
          fog: { color: '#332211', near: 8, far: 40 },
          ambient: '#443322',
          lights: [
            { color: '#ffaa44', intensity: 0.6, position: [15, 10, 0] },
            { color: '#ff6644', intensity: 0.3, position: [-5, 8, 10] }
          ],
          groundColor: '#332211'
        }
      case 'custom3d':
        return {
          fog: { color: '#8b7355', near: 20, far: 150 },
          ambient: '#d4a574',
          lights: [
            { color: '#ffcc88', intensity: 1.2, position: [20, 30, 20] },
            { color: '#ff9966', intensity: 0.6, position: [-15, 20, 10] },
            { color: '#ffffcc', intensity: 0.4, position: [0, 15, -20] }
          ],
          groundColor: '#3d3428'
        }
      default:
        return {
          fog: { color: '#000000', near: 15, far: 50 },
          ambient: '#404040',
          lights: [
            { color: '#ffffff', intensity: 0.4, position: [10, 10, 10] }
          ],
          groundColor: '#333333'
        }
    }
  }, [environmentType])

  return (
    <group>
      {/* Fog */}
      <fog attach="fog" args={[envConfig.fog.color, envConfig.fog.near, envConfig.fog.far]} />
      
      {/* Ambient lighting */}
      <ambientLight color={envConfig.ambient} intensity={0.5} />
      
      {/* Directional sunlight for custom3d environment */}
      {environmentType === 'custom3d' && (
        <directionalLight
          color="#ffdd99"
          intensity={1.5}
          position={[30, 50, 20]}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={100}
          shadow-camera-left={-50}
          shadow-camera-right={50}
          shadow-camera-top={50}
          shadow-camera-bottom={-50}
        />
      )}
      
      {/* Dynamic lights based on environment */}
      {envConfig.lights.map((light, index) => (
        <pointLight
          key={index}
          color={light.color}
          intensity={light.intensity}
          position={light.position}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
      ))}
      
      {/* Render environment based on type */}
      {environmentType === 'custom3d' ? (
        <Custom3DEnvironment />
      ) : (
        <>
          {/* Simple ground plane instead of 3D model */}
          <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[50, 50]} />
            <meshStandardMaterial color={envConfig.groundColor} roughness={0.8} metalness={0.1} />
          </mesh>
          
          {/* Basic walls for structure */}
          <mesh position={[0, 5, -25]} receiveShadow>
            <boxGeometry args={[50, 10, 1]} />
            <meshStandardMaterial color={envConfig.groundColor} roughness={0.9} metalness={0.05} />
          </mesh>
          
          <mesh position={[25, 5, 0]} receiveShadow>
            <boxGeometry args={[1, 10, 50]} />
            <meshStandardMaterial color={envConfig.groundColor} roughness={0.9} metalness={0.05} />
          </mesh>
          
          <mesh position={[-25, 5, 0]} receiveShadow>
            <boxGeometry args={[1, 10, 50]} />
            <meshStandardMaterial color={envConfig.groundColor} roughness={0.9} metalness={0.05} />
          </mesh>
        </>
      )}
      
      {/* Additional night city effects */}
      {environmentType === 'nightcity' && (
        <>
          {/* Burning debris particles effect */}
          {Array.from({ length: 12 }, (_, i) => (
            <mesh key={i} position={[
              (Math.random() - 0.5) * 20,
              Math.random() * 8 + 2,
              (Math.random() - 0.5) * 20
            ]}>
              <sphereGeometry args={[0.1 + Math.random() * 0.1]} />
              <meshBasicMaterial 
                color={Math.random() > 0.5 ? '#ff4400' : '#ffaa00'} 
                transparent
                opacity={0.6 + Math.random() * 0.4}
              />
            </mesh>
          ))}
          
          {/* Smoke/dust clouds */}
          {Array.from({ length: 8 }, (_, i) => (
            <mesh key={`smoke-${i}`} position={[
              (Math.random() - 0.5) * 25,
              Math.random() * 6 + 1,
              (Math.random() - 0.5) * 25
            ]}>
              <sphereGeometry args={[1 + Math.random() * 2]} />
              <meshBasicMaterial 
                color={'#222222'} 
                transparent
                opacity={0.1 + Math.random() * 0.2}
              />
            </mesh>
          ))}
          
          {/* Flickering building lights */}
          {Array.from({ length: 6 }, (_, i) => (
            <pointLight
              key={`building-light-${i}`}
              color={Math.random() > 0.7 ? '#00ffff' : '#ffff00'}
              intensity={0.1 + Math.random() * 0.3}
              position={[
                (Math.random() - 0.5) * 30,
                3 + Math.random() * 8,
                (Math.random() - 0.5) * 30
              ]}
            />
          ))}
        </>
      )}
      
      {/* Wasteland effects */}
      {environmentType === 'wasteland' && (
        <>
          {/* Dust particles */}
          {Array.from({ length: 15 }, (_, i) => (
            <mesh key={i} position={[
              (Math.random() - 0.5) * 35,
              Math.random() * 3,
              (Math.random() - 0.5) * 35
            ]}>
              <sphereGeometry args={[0.05 + Math.random() * 0.1]} />
              <meshBasicMaterial 
                color={'#aa8866'} 
                transparent
                opacity={0.3 + Math.random() * 0.4}
              />
            </mesh>
          ))}
        </>
      )}
    </group>
  )
})

// Custom 3D Environment Loader - actual model loading
const Custom3DEnvironmentModel = memo(function Custom3DEnvironmentModel() {
  const groupRef = useRef<THREE.Group>(null)
  
  // Load your custom 3D environment
  const { scene } = useGLTF('/models/new-environment/scene.gltf')
  
  // Scale and position the environment properly
  useEffect(() => {
    if (scene) {
      // Scale the environment smaller to match real-life character size
      scene.scale.set(0.15, 0.15, 0.15)
      // Position the environment - centered at spawn point
      scene.position.set(0, -1.5, 0)
      // No rotation needed - environment faces correct direction
      scene.rotation.set(0, 0, 0)
      // Enable shadows on all meshes
      scene.traverse((child: any) => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
          if (child.material) {
            child.material.roughness = 0.8
            child.material.metalness = 0.2
          }
        }
      })
    }
  }, [scene])

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  )
})

// Fallback environment while loading or on error
const FallbackEnvironment = memo(function FallbackEnvironment() {
  return (
    <group>
      {/* Ground */}
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#3d3428" roughness={1} metalness={0} />
      </mesh>
      {/* Simple buildings */}
      <mesh position={[-10, 3, -20]}>
        <boxGeometry args={[8, 12, 8]} />
        <meshStandardMaterial color="#5c4a3a" />
      </mesh>
      <mesh position={[10, 5, -25]}>
        <boxGeometry args={[10, 16, 10]} />
        <meshStandardMaterial color="#4a3d32" />
      </mesh>
      <mesh position={[0, 4, -30]}>
        <boxGeometry args={[12, 14, 12]} />
        <meshStandardMaterial color="#6b5344" />
      </mesh>
      <mesh position={[-20, 2, -15]}>
        <boxGeometry args={[6, 8, 6]} />
        <meshStandardMaterial color="#574639" />
      </mesh>
      <mesh position={[20, 3, -18]}>
        <boxGeometry args={[7, 10, 7]} />
        <meshStandardMaterial color="#4f4035" />
      </mesh>
    </group>
  )
})

// Custom 3D Environment Component - with Suspense wrapper
const Custom3DEnvironment = memo(function Custom3DEnvironment() {
  return (
    <Suspense fallback={<FallbackEnvironment />}>
      <Custom3DEnvironmentModel />
    </Suspense>
  )
})

// Models fully converted to geometric shapes - no longer needed
// Preload custom 3D environment for better performance
useGLTF.preload('/models/new-environment/scene.gltf')
// Preload animated zombie model
useGLTF.preload('/models/zombie/zombie3d/zombie%20walk.gltf')

// Camera Controller for testing - move with arrow keys and mouse look
const CameraController = memo(function CameraController() {
  const { camera, gl } = useThree()
  const keys = useRef({ up: false, down: false, left: false, right: false })
  const isPointerLocked = useRef(false)
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'))
  const initialized = useRef(false)
  
  // Initialize camera to face forward on first render
  useEffect(() => {
    if (!initialized.current) {
      camera.rotation.set(0, 0, 0)
      camera.lookAt(0, 1.7, -10)
      initialized.current = true
    }
  }, [camera])
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') keys.current.up = true
      if (e.key === 'ArrowDown') keys.current.down = true
      if (e.key === 'ArrowLeft') keys.current.left = true
      if (e.key === 'ArrowRight') keys.current.right = true
    }
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') keys.current.up = false
      if (e.key === 'ArrowDown') keys.current.down = false
      if (e.key === 'ArrowLeft') keys.current.left = false
      if (e.key === 'ArrowRight') keys.current.right = false
    }
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isPointerLocked.current) return
      
      const sensitivity = 0.002
      euler.current.setFromQuaternion(camera.quaternion)
      euler.current.y -= e.movementX * sensitivity
      euler.current.x -= e.movementY * sensitivity
      euler.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.current.x))
      camera.quaternion.setFromEuler(euler.current)
    }
    
    const handleClick = () => {
      gl.domElement.requestPointerLock()
    }
    
    const handlePointerLockChange = () => {
      isPointerLocked.current = document.pointerLockElement === gl.domElement
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    document.addEventListener('mousemove', handleMouseMove)
    gl.domElement.addEventListener('click', handleClick)
    document.addEventListener('pointerlockchange', handlePointerLockChange)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      document.removeEventListener('mousemove', handleMouseMove)
      gl.domElement.removeEventListener('click', handleClick)
      document.removeEventListener('pointerlockchange', handlePointerLockChange)
    }
  }, [camera, gl])
  
  useFrame((_, delta) => {
    const speed = 10 * delta
    const direction = new THREE.Vector3()
    
    // Get forward/right vectors based on camera rotation
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion)
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion)
    
    // Keep movement horizontal
    forward.y = 0
    forward.normalize()
    right.y = 0
    right.normalize()
    
    // Forward/Backward
    if (keys.current.up) direction.add(forward)
    if (keys.current.down) direction.sub(forward)
    
    // Left/Right strafe
    if (keys.current.left) direction.sub(right)
    if (keys.current.right) direction.add(right)
    
    direction.normalize().multiplyScalar(speed)
    camera.position.add(direction)
  })
  
  return null
})

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
export default function TypingDrill3D({ onExit, currentUser }: { onExit: () => void, currentUser: User | null }) {
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
  
  // Environment selection - Always use custom 3D
  const selectedEnvironment: EnvironmentType = 'custom3d'
  
  // Track game stats for achievements
  const gameStartTimeRef = useRef<number>(0)
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([])

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
    setZombies(prev => {
      const updatedZombies = prev.map(z => 
        z.id === zombieId ? { ...z, hasHitPlayer: true, isDead: true } : z
      )
      
      // Check if all zombies are dead after this one dies
      const aliveZombies = updatedZombies.filter(z => !z.isDead)
      
      if (aliveZombies.length === 0) {
        // All zombies dead, spawn next wave after damage
        setTimeout(() => {
          const nextWave = wave + 1
          setWave(nextWave)
          setWavePoints(0)
          spawnWave(nextWave)
        }, 1000)
        setActiveZombieId(null)
      } else {
        // Set next active zombie
        setActiveZombieId(aliveZombies[0].id)
      }
      
      return updatedZombies
    })
    
    setHealth(prev => {
      const newHealth = prev - 20
      if (newHealth <= 0) {
        setIsPlaying(false)
        setShowGameOver(true)
        submitGameStats()
        return 0
      }
      return newHealth
    })
  }, [wave])

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

  // Submit game stats to leaderboard and achievements
  const submitGameStats = async () => {
    if (!currentUser) return
    
    const gameDuration = Math.floor((Date.now() - gameStartTimeRef.current) / 1000)
    const accuracy = 100 // Typing drill doesn't track accuracy the same way, using 100%
    
    try {
      // Submit to leaderboard
      await submitScore(
        currentUser.uid,
        currentUser.displayName || 'Anonymous',
        currentUser.email || '',
        currentUser.photoURL || null,
        score,
        accuracy,
        'typing',
        wave,
        wordsCompleted
      )
      
      // Update achievements
      const unlockedAchievements = await updateGameStats(
        currentUser.uid,
        'typing',
        {
          wave,
          kills: wordsCompleted,
          accuracy,
          duration: gameDuration
        }
      )
      
      if (unlockedAchievements.length > 0) {
        setNewAchievements(unlockedAchievements)
      }
      
      // Check daily tasks and award currency
      const { checkDailyTasksAfterGame } = await import('../firebase/currencyService')
      await checkDailyTasksAfterGame(currentUser.uid, 'typing', {
        score,
        wave,
        kills: wordsCompleted,
        accuracy
      })
    } catch (error) {
      console.error('Error submitting game stats:', error)
    }
  }

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
    setNewAchievements([])
    gameStartTimeRef.current = Date.now()
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

  // Debug logging
  console.log('TypingDrill3D render - isPlaying:', isPlaying, 'showGameOver:', showGameOver)

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', background: '#b5936b', overflow: 'hidden' }}>
      {/* 3D Canvas - Optimized */}
      <Canvas
        camera={{ position: [0, 1.7, 20], fov: 70 }}
        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
        shadows
        gl={{ alpha: false }}
      >
        <color attach="background" args={['#87CEEB']} />
        <ambientLight intensity={2.5} />
        <directionalLight 
          position={[20, 30, 10]} 
          intensity={3} 
          color="#ffffff" 
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <hemisphereLight args={['#87CEEB', '#6b5344', 1]} />

        {/* Custom 3D Environment from new-environment folder */}
        <Custom3DEnvironment />

        {/* Eerie lights for night atmosphere */}
        <pointLight position={[-10, 3, -10]} color="#3a4a5a" intensity={0.5} distance={15} />
        <pointLight position={[10, 3, -10]} color="#4a3a5a" intensity={0.5} distance={15} />
        <pointLight position={[0, 2, 5]} color="#5a5a3a" intensity={0.4} distance={12} />

        {/* Camera controller for testing - move with arrow keys */}
        <CameraController />

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
          {/* Top HUD - Zombie Horror Theme */}
          <div style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '30px', zIndex: 10, background: 'linear-gradient(135deg, rgba(20, 10, 0, 0.95) 0%, rgba(10, 20, 10, 0.95) 100%)', padding: '15px 30px', borderRadius: '10px', border: '2px solid rgba(139, 0, 0, 0.8)', boxShadow: '0 0 20px rgba(139, 0, 0, 0.4), inset 0 0 20px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#8b0000', fontSize: '14px', fontWeight: 'bold', textShadow: '0 0 5px rgba(139, 0, 0, 0.8)', fontFamily: '"Creepster", "Metal Mania", cursive' }}>WAVE</div>
              <div style={{ color: '#ff4444', fontSize: '28px', fontWeight: 'bold', textShadow: '0 0 10px rgba(255, 68, 68, 0.6)', fontFamily: '"Nosifer", "Metal Mania", cursive' }}>{wave}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#8b0000', fontSize: '14px', fontWeight: 'bold', textShadow: '0 0 5px rgba(139, 0, 0, 0.8)', fontFamily: '"Creepster", "Metal Mania", cursive' }}>SCORE</div>
              <div style={{ color: '#ff4444', fontSize: '28px', fontWeight: 'bold', textShadow: '0 0 10px rgba(255, 68, 68, 0.6)', fontFamily: '"Nosifer", "Metal Mania", cursive' }}>{score}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#8b0000', fontSize: '14px', fontWeight: 'bold', textShadow: '0 0 5px rgba(139, 0, 0, 0.8)', fontFamily: '"Creepster", "Metal Mania", cursive' }}>KILLS</div>
              <div style={{ color: '#ff4444', fontSize: '28px', fontWeight: 'bold', textShadow: '0 0 10px rgba(255, 68, 68, 0.6)', fontFamily: '"Nosifer", "Metal Mania", cursive' }}>{wordsCompleted}</div>
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
            {/* Health Bar Container - Horror Theme */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(20, 10, 0, 0.95) 0%, rgba(10, 20, 10, 0.95) 100%)',
              borderRadius: '8px',
              padding: '8px 12px',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(139, 0, 0, 0.6)',
              boxShadow: '0 4px 20px rgba(139, 0, 0, 0.5), inset 0 0 10px rgba(0, 0, 0, 0.5)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span style={{ color: '#ff4444', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', textShadow: '0 0 5px rgba(255, 68, 68, 0.6)', fontFamily: '"Creepster", "Metal Mania", cursive' }}>Health</span>
                <span style={{ 
                  color: health > 50 ? '#44ff44' : health > 25 ? '#ffaa00' : '#ff0000', 
                  fontSize: '16px', 
                  fontWeight: 'bold',
                  fontFamily: '"Special Elite", monospace',
                  textShadow: '0 0 8px currentColor'
                }}>{health}</span>
              </div>
              <div style={{ 
                width: '200px', 
                height: '12px', 
                background: 'rgba(0, 0, 0, 0.8)', 
                borderRadius: '6px', 
                overflow: 'hidden',
                position: 'relative',
                border: '1px solid rgba(139, 0, 0, 0.5)'
              }}>
                <div style={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100%', 
                  width: `${health}%`, 
                  background: health > 50 
                    ? 'linear-gradient(90deg, #00ff00 0%, #00aa00 100%)' 
                    : health > 25 
                      ? 'linear-gradient(90deg, #ffaa00 0%, #ff6600 100%)' 
                      : 'linear-gradient(90deg, #ff0000 0%, #8b0000 100%)',
                  borderRadius: '6px',
                  transition: 'width 0.3s ease-out',
                  boxShadow: health > 50 
                    ? '0 0 15px rgba(0, 255, 0, 0.8)' 
                    : health > 25 
                      ? '0 0 15px rgba(255, 170, 0, 0.8)' 
                      : '0 0 15px rgba(255, 0, 0, 0.8)'
                }} />
                {/* Blood drip effect */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '50%',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 100%)',
                  borderRadius: '6px 6px 0 0'
                }} />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Current Word Display - Zombie Horror Theme */}
      {isPlaying && !isPaused && !showGameOver && !isBossWave && activeZombie && (
        <div style={{ position: 'absolute', bottom: '100px', left: '50%', transform: 'translateX(-50%)', zIndex: 10, background: 'linear-gradient(135deg, rgba(20, 10, 0, 0.98) 0%, rgba(10, 20, 10, 0.98) 100%)', padding: '20px 40px', borderRadius: '15px', border: '3px solid #8b0000', boxShadow: '0 0 30px rgba(139, 0, 0, 0.8), inset 0 0 20px rgba(0, 0, 0, 0.5)' }}>
          <div style={{ fontSize: '48px', fontWeight: 'bold', letterSpacing: '8px', fontFamily: '"Metal Mania", "Special Elite", cursive' }}>
            {activeZombie.word.split('').map((char, i) => (
              <span key={i} style={{ color: i < activeZombie.typedChars ? '#00ff00' : '#ff4444', textShadow: i < activeZombie.typedChars ? '0 0 15px #00ff00, 0 0 25px #00ff00' : '0 0 10px #8b0000' }}>
                {char}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Boss Paragraph Display - Horror Theme */}
      {isPlaying && !isPaused && !showGameOver && isBossWave && bossHealth > 0 && (
        <div style={{ 
          position: 'absolute', 
          bottom: '80px', 
          left: '50%', 
          transform: 'translateX(-50%)', 
          zIndex: 10, 
          background: 'linear-gradient(135deg, rgba(20, 10, 0, 0.98) 0%, rgba(10, 5, 0, 0.98) 100%)', 
          padding: '25px 40px', 
          borderRadius: '15px', 
          border: '4px solid #8b0000', 
          boxShadow: '0 0 40px rgba(139, 0, 0, 0.9), inset 0 0 30px rgba(0, 0, 0, 0.7)',
          maxWidth: '90%',
          width: '900px'
        }}>
          {/* Boss Wave Indicator */}
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '15px',
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#ff0000',
            textShadow: '0 0 15px rgba(255, 0, 0, 1), 0 0 25px rgba(255, 0, 0, 0.6)',
            letterSpacing: '4px',
            fontFamily: '"Nosifer", "Creepster", cursive'
          }}>
            💀 BOSS WAVE {wave} 💀
          </div>
          {/* Boss Health Bar */}
          <div style={{ 
            width: '100%', 
            height: '20px', 
            background: 'rgba(0, 0, 0, 0.8)', 
            borderRadius: '10px', 
            overflow: 'hidden',
            marginBottom: '20px',
            border: '2px solid #8b0000'
          }}>
            <div style={{ 
              height: '100%', 
              width: `${bossHealth}%`, 
              background: 'linear-gradient(90deg, #ff0000 0%, #8b0000 100%)',
              borderRadius: '8px',
              transition: 'width 0.1s ease-out',
              boxShadow: '0 0 20px rgba(255, 0, 0, 0.9)'
            }} />
          </div>
          {/* Paragraph to type */}
          <div style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            fontFamily: '"Metal Mania", "Special Elite", cursive',
            lineHeight: '1.6',
            textAlign: 'center',
            wordWrap: 'break-word'
          }}>
            {bossParagraph.split('').map((char, i) => (
              <span 
                key={i} 
                style={{ 
                  color: i < bossTypedChars ? '#00ff00' : i === bossTypedChars ? '#ffff00' : '#ff4444',
                  textShadow: i < bossTypedChars ? '0 0 12px #00ff00, 0 0 20px #00ff00' : i === bossTypedChars ? '0 0 15px #ffff00, 0 0 25px #ffff00' : '0 0 8px #8b0000',
                  backgroundColor: i === bossTypedChars ? 'rgba(255, 255, 0, 0.3)' : 'transparent',
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
            color: waveClearedInfo.wave % 10 === 0 ? '#ef4444' : '#8b0000', 
            textShadow: waveClearedInfo.wave % 10 === 0 
              ? '0 0 30px rgba(239, 68, 68, 0.8), 0 0 60px rgba(239, 68, 68, 0.4)'
              : '0 0 30px rgba(139, 0, 0, 0.8), 0 0 60px rgba(139, 0, 0, 0.4)',
            letterSpacing: '8px',
            fontFamily: '"Creepster", "Nosifer", cursive'
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
            <div style={{ fontSize: '72px', fontWeight: 'bold', color: '#ff4444', margin: '30px 0', textShadow: '0 0 30px rgba(255, 68, 68, 0.8)' }}>{score}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
              <div style={{ background: 'rgba(139, 0, 0, 0.25)', padding: '20px', borderRadius: '12px', border: '2px solid rgba(139, 0, 0, 0.6)' }}>
                <div style={{ color: '#ff6666', fontSize: '14px', marginBottom: '5px' }}>WAVES SURVIVED</div>
                <div style={{ color: '#ff4444', fontSize: '36px', fontWeight: 'bold' }}>{wave}</div>
              </div>
              <div style={{ background: 'rgba(139, 0, 0, 0.25)', padding: '20px', borderRadius: '12px', border: '2px solid rgba(139, 0, 0, 0.6)' }}>
                <div style={{ color: '#ff6666', fontSize: '14px', marginBottom: '5px' }}>ZOMBIES KILLED</div>
                <div style={{ color: '#ff4444', fontSize: '36px', fontWeight: 'bold' }}>{wordsCompleted}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button onClick={handleStart} style={{ padding: '16px 32px', fontSize: '18px', fontWeight: 'bold', border: 'none', borderRadius: '10px', cursor: 'pointer', background: 'linear-gradient(135deg, #8b0000 0%, #ff0000 100%)', color: '#fff', boxShadow: '0 4px 20px rgba(139, 0, 0, 0.6)', textShadow: '0 0 10px rgba(0, 0, 0, 0.5)' }}>PLAY AGAIN</button>
              <button onClick={handleExit} style={{ padding: '16px 32px', fontSize: '18px', fontWeight: 'bold', border: '2px solid rgba(139, 0, 0, 0.6)', borderRadius: '10px', cursor: 'pointer', background: 'rgba(139, 0, 0, 0.2)', color: '#ff6666' }}>EXIT</button>
            </div>
            
            {/* New Achievements Unlocked */}
            {newAchievements.length > 0 && (
              <div style={{ marginTop: '30px', padding: '20px', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '12px', border: '2px solid rgba(99, 102, 241, 0.5)' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#6366f1', marginBottom: '15px' }}>
                  🏆 NEW ACHIEVEMENTS UNLOCKED!
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {newAchievements.map(achievement => (
                    <div key={achievement.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255, 255, 255, 0.05)', padding: '12px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '32px' }}>{achievement.icon}</div>
                      <div style={{ textAlign: 'left', flex: 1 }}>
                        <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px' }}>{achievement.title}</div>
                        <div style={{ color: '#aaa', fontSize: '12px' }}>{achievement.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Preload the zombie model for better performance
useGLTF.preload('/models/zombie/zombie3d/zombie walk.gltf')
