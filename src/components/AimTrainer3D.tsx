import { useRef, useState, useEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

// Camera Controller - Handle mouse movement only
function CameraController({ sensitivity = 1 }: { sensitivity?: number }) {
  const { camera } = useThree()
  const rotationRef = useRef({ x: 0, y: 0 })
  
  useFrame(() => {
    const canvas = document.querySelector('canvas')
    if (!canvas) return
    
    // Get mouse delta for rotation
    const mouseDeltaX = parseFloat(canvas.getAttribute('data-mouse-delta-x') || '0')
    const mouseDeltaY = parseFloat(canvas.getAttribute('data-mouse-delta-y') || '0')
    
    // Update rotation (full 360 degrees) - apply sensitivity
    rotationRef.current.y -= mouseDeltaX * 0.002 * sensitivity
    rotationRef.current.x -= mouseDeltaY * 0.002 * sensitivity
    
    // Clamp vertical rotation to prevent flipping
    rotationRef.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotationRef.current.x))
    
    camera.rotation.order = 'YXZ'
    camera.rotation.y = rotationRef.current.y
    camera.rotation.x = rotationRef.current.x
    
    // Clear mouse delta after processing
    canvas.setAttribute('data-mouse-delta-x', '0')
    canvas.setAttribute('data-mouse-delta-y', '0')
  })
  
  return null
}

// Professional 3D Rifle Component - Futuristic Sci-Fi Style
function Rifle() {
  const groupRef = useRef<THREE.Group>(null)
  const { camera } = useThree()
  const [recoil, setRecoil] = useState(0)
  const muzzleFlashRef = useRef(false)
  const flashIntensityRef = useRef(0)
  const [, forceUpdate] = useState(0)
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioBufferRef = useRef<AudioBuffer | null>(null)

  // Preload gun sound using Web Audio API for zero latency
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
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  useFrame((state) => {
    if (!groupRef.current) return
    
    // Smooth recoil animation
    if (recoil > 0) {
      setRecoil(prev => Math.max(0, prev - 0.015))
    }
    
    // Muzzle flash fade - using refs for instant updates
    if (flashIntensityRef.current > 0) {
      flashIntensityRef.current *= 0.7
      if (flashIntensityRef.current < 0.1) {
        flashIntensityRef.current = 0
        muzzleFlashRef.current = false
      }
      forceUpdate(n => n + 1) // Trigger re-render for flash visibility
    }
    
    const time = state.clock.getElapsedTime()
    
    // Position rifle in FPS view (right side)
    const offset = new THREE.Vector3(0.28, -0.15, -0.35)
    offset.applyQuaternion(camera.quaternion)
    groupRef.current.position.copy(camera.position).add(offset)
    groupRef.current.quaternion.copy(camera.quaternion)
    
    // Subtle idle sway animation
    const swayX = Math.sin(time * 1.5) * 0.002
    const swayY = Math.sin(time * 2) * 0.0015
    const swayRot = Math.sin(time * 1.2) * 0.003
    groupRef.current.position.x += swayX
    groupRef.current.position.y += swayY
    groupRef.current.rotation.z += swayRot
    
    // Apply recoil kick
    const recoilQuat = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(-recoil * 0.4, 0, recoil * 0.05)
    )
    groupRef.current.quaternion.multiply(recoilQuat)
    groupRef.current.position.z += recoil * 0.03
  })

  useEffect(() => {
    const handleShoot = () => {
      setRecoil(0.15)
      muzzleFlashRef.current = true
      flashIntensityRef.current = 15
      forceUpdate(n => n + 1) // Trigger immediate re-render
      
      // Play gunshot sound with Web Audio API (instant playback)
      if (audioContextRef.current && audioBufferRef.current) {
        const source = audioContextRef.current.createBufferSource()
        const gainNode = audioContextRef.current.createGain()
        
        source.buffer = audioBufferRef.current
        gainNode.gain.value = 0.4
        
        source.connect(gainNode)
        gainNode.connect(audioContextRef.current.destination)
        source.start(0)
      }
    }

    window.addEventListener('gun-shoot', handleShoot)
    return () => window.removeEventListener('gun-shoot', handleShoot)
  }, [])

  // Futuristic materials
  const darkBlueMaterial = <meshStandardMaterial color="#1a2744" metalness={0.8} roughness={0.3} />
  const navyMaterial = <meshStandardMaterial color="#0d1a2d" metalness={0.9} roughness={0.2} />
  const goldMaterial = <meshStandardMaterial color="#c9a227" metalness={0.95} roughness={0.15} emissive="#c9a227" emissiveIntensity={0.1} />
  const brightGoldMaterial = <meshStandardMaterial color="#ffd700" metalness={0.98} roughness={0.1} emissive="#ffd700" emissiveIntensity={0.2} />
  const glowCyanMaterial = <meshStandardMaterial color="#00ffff" metalness={0.3} roughness={0.2} emissive="#00ffff" emissiveIntensity={0.8} />
  const whiteMaterial = <meshStandardMaterial color="#e8e8e8" metalness={0.7} roughness={0.3} emissive="#ffffff" emissiveIntensity={0.15} />
  const purpleMaterial = <meshStandardMaterial color="#4a1a6b" metalness={0.7} roughness={0.4} />

  return (
    <group ref={groupRef} scale={0.13}>
      {/* ===== MAIN BODY - Angular Futuristic Design ===== */}
      <group position={[0, 0, 0]}>
        {/* Main Body - Dark Blue Base */}
        <mesh position={[0, 0.1, 0.2]}>
          <boxGeometry args={[0.28, 0.24, 1.6]} />
          {darkBlueMaterial}
        </mesh>
        
        {/* Top Angular Cover */}
        <mesh position={[0, 0.24, 0.1]} rotation={[0.15, 0, 0]}>
          <boxGeometry args={[0.3, 0.06, 1.4]} />
          {navyMaterial}
        </mesh>
        
        {/* Gold Top Trim - Front */}
        <mesh position={[0, 0.28, -0.4]}>
          <boxGeometry args={[0.32, 0.025, 0.5]} />
          {goldMaterial}
        </mesh>
        
        {/* Gold Top Trim - Back */}
        <mesh position={[0, 0.26, 0.5]}>
          <boxGeometry args={[0.28, 0.025, 0.4]} />
          {goldMaterial}
        </mesh>
        
        {/* Side Gold Accents - Left */}
        <mesh position={[-0.145, 0.12, 0]}>
          <boxGeometry args={[0.02, 0.08, 1.2]} />
          {brightGoldMaterial}
        </mesh>
        
        {/* Side Gold Accents - Right */}
        <mesh position={[0.145, 0.12, 0]}>
          <boxGeometry args={[0.02, 0.08, 1.2]} />
          {brightGoldMaterial}
        </mesh>
        
        {/* Lower Body Section */}
        <mesh position={[0, -0.04, 0.3]}>
          <boxGeometry args={[0.24, 0.14, 1.2]} />
          {navyMaterial}
        </mesh>
        
        {/* Angular Side Panels - Left */}
        <mesh position={[-0.12, 0.05, 0.1]} rotation={[0, 0, -0.2]}>
          <boxGeometry args={[0.08, 0.2, 0.8]} />
          {darkBlueMaterial}
        </mesh>
        
        {/* Angular Side Panels - Right */}
        <mesh position={[0.12, 0.05, 0.1]} rotation={[0, 0, 0.2]}>
          <boxGeometry args={[0.08, 0.2, 0.8]} />
          {darkBlueMaterial}
        </mesh>
      </group>

      {/* ===== GLOWING ELEMENTS ===== */}
      <group>
        {/* Main Glow Strip - Top */}
        <mesh position={[0, 0.22, -0.15]}>
          <boxGeometry args={[0.08, 0.015, 0.6]} />
          {glowCyanMaterial}
        </mesh>
        
        {/* Side Glow Strips */}
        <mesh position={[-0.14, 0.08, 0]}>
          <boxGeometry args={[0.01, 0.03, 0.8]} />
          {glowCyanMaterial}
        </mesh>
        <mesh position={[0.14, 0.08, 0]}>
          <boxGeometry args={[0.01, 0.03, 0.8]} />
          {glowCyanMaterial}
        </mesh>
        
        {/* Glow point light */}
        <pointLight position={[0, 0.15, 0]} intensity={0.3} color="#00ffff" distance={0.8} />
      </group>

      {/* ===== BARREL ASSEMBLY ===== */}
      <group position={[0, 0.08, -1.0]}>
        {/* Outer Barrel Shroud */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.09, 0.8, 8]} />
          {navyMaterial}
        </mesh>
        
        {/* Inner Barrel */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.2]}>
          <cylinderGeometry args={[0.04, 0.045, 1.2, 12]} />
          {darkBlueMaterial}
        </mesh>
        
        {/* Gold Barrel Rings */}
        {[-0.3, -0.1, 0.1].map((z, i) => (
          <mesh key={`barrel-ring-${i}`} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, z]}>
            <torusGeometry args={[0.085, 0.012, 8, 16]} />
            {goldMaterial}
          </mesh>
        ))}
        
        {/* Muzzle Device */}
        <group position={[0, 0, -0.5]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.06, 0.07, 0.15, 8]} />
            {goldMaterial}
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.1]}>
            <cylinderGeometry args={[0.05, 0.06, 0.1, 8]} />
            {brightGoldMaterial}
          </mesh>
        </group>
        
        {/* Barrel Glow */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.35]}>
          <cylinderGeometry args={[0.025, 0.025, 0.5, 8]} />
          {glowCyanMaterial}
        </mesh>
      </group>

      {/* ===== SCOPE / OPTIC ===== */}
      <group position={[0, 0.4, 0]}>
        {/* Scope Mount Base */}
        <mesh position={[0, -0.06, 0]}>
          <boxGeometry args={[0.2, 0.04, 0.35]} />
          {goldMaterial}
        </mesh>
        
        {/* Main Scope Body */}
        <mesh position={[0, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.5, 12]} />
          {navyMaterial}
        </mesh>
        
        {/* Scope Front Housing */}
        <mesh position={[0, 0.02, -0.3]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.085, 0.12, 12]} />
          {darkBlueMaterial}
        </mesh>
        
        {/* Scope Front Lens */}
        <mesh position={[0, 0.02, -0.37]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.02, 16]} />
          {glowCyanMaterial}
        </mesh>
        
        {/* Scope Rear Housing */}
        <mesh position={[0, 0.02, 0.28]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.07, 0.08, 0.1, 12]} />
          {darkBlueMaterial}
        </mesh>
        
        {/* Gold Scope Rings */}
        <mesh position={[0, 0.02, -0.15]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.085, 0.015, 8, 16]} />
          {brightGoldMaterial}
        </mesh>
        <mesh position={[0, 0.02, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.085, 0.015, 8, 16]} />
          {brightGoldMaterial}
        </mesh>
        
        {/* Scope Top Adjuster */}
        <mesh position={[0, 0.12, 0.05]}>
          <cylinderGeometry args={[0.025, 0.025, 0.04, 8]} />
          {goldMaterial}
        </mesh>
        
        {/* Scope Side Adjuster */}
        <mesh position={[0.1, 0.02, 0.05]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.02, 0.02, 0.03, 8]} />
          {goldMaterial}
        </mesh>
      </group>

      {/* ===== STOCK ===== */}
      <group position={[0, 0.05, 0.95]}>
        {/* Stock Main Body */}
        <mesh position={[0, 0.05, 0.2]} rotation={[0.05, 0, 0]}>
          <boxGeometry args={[0.2, 0.22, 0.55]} />
          {darkBlueMaterial}
        </mesh>
        
        {/* Stock Top Gold Accent */}
        <mesh position={[0, 0.17, 0.2]}>
          <boxGeometry args={[0.22, 0.02, 0.5]} />
          {goldMaterial}
        </mesh>
        
        {/* Stock Bottom Gold Accent */}
        <mesh position={[0, -0.06, 0.25]}>
          <boxGeometry args={[0.18, 0.02, 0.4]} />
          {goldMaterial}
        </mesh>
        
        {/* Buttpad */}
        <mesh position={[0, 0.03, 0.5]}>
          <boxGeometry args={[0.18, 0.26, 0.06]} />
          {navyMaterial}
        </mesh>
        
        {/* Cheek Rest */}
        <mesh position={[0, 0.16, 0.15]}>
          <boxGeometry args={[0.16, 0.04, 0.25]} />
          {purpleMaterial}
        </mesh>
        
        {/* Stock Glow Element */}
        <mesh position={[0, 0.05, 0.48]}>
          <boxGeometry args={[0.1, 0.12, 0.01]} />
          {glowCyanMaterial}
        </mesh>
      </group>

      {/* ===== PISTOL GRIP ===== */}
      <group position={[0, -0.15, 0.5]} rotation={[0.35, 0, 0]}>
        {/* Main Grip */}
        <mesh>
          <boxGeometry args={[0.12, 0.26, 0.1]} />
          {purpleMaterial}
        </mesh>
        
        {/* Grip Gold Accent */}
        <mesh position={[0, 0.02, 0.052]}>
          <boxGeometry args={[0.1, 0.18, 0.01]} />
          {goldMaterial}
        </mesh>
        
        {/* Grip Bottom */}
        <mesh position={[0, -0.14, 0]}>
          <boxGeometry args={[0.13, 0.03, 0.11]} />
          {navyMaterial}
        </mesh>
        
        {/* Grip Texture Lines */}
        {[-0.06, 0, 0.06].map((y, i) => (
          <mesh key={`grip-line-${i}`} position={[0.061, y, 0]}>
            <boxGeometry args={[0.005, 0.04, 0.11]} />
            {darkBlueMaterial}
          </mesh>
        ))}
      </group>

      {/* ===== MAGAZINE ===== */}
      <group position={[0, -0.22, 0.25]}>
        {/* Magazine Body */}
        <mesh>
          <boxGeometry args={[0.12, 0.3, 0.18]} />
          {navyMaterial}
        </mesh>
        
        {/* Magazine Gold Trim */}
        <mesh position={[0, 0.14, 0]}>
          <boxGeometry args={[0.13, 0.025, 0.19]} />
          {goldMaterial}
        </mesh>
        
        {/* Magazine Floor Plate */}
        <mesh position={[0, -0.16, 0]}>
          <boxGeometry args={[0.13, 0.025, 0.19]} />
          {brightGoldMaterial}
        </mesh>
        
        {/* Magazine Window/Indicator */}
        <mesh position={[0.062, 0, 0]}>
          <boxGeometry args={[0.01, 0.15, 0.08]} />
          {glowCyanMaterial}
        </mesh>
      </group>

      {/* ===== TRIGGER ASSEMBLY ===== */}
      <group position={[0, -0.08, 0.38]}>
        {/* Trigger Guard - Angular */}
        <mesh position={[0, -0.04, 0]}>
          <boxGeometry args={[0.14, 0.02, 0.15]} />
          {goldMaterial}
        </mesh>
        <mesh position={[0, -0.02, -0.07]}>
          <boxGeometry args={[0.12, 0.06, 0.02]} />
          {goldMaterial}
        </mesh>
        
        {/* Trigger */}
        <mesh position={[0, 0, -0.02]} rotation={[0.25, 0, 0]}>
          <boxGeometry args={[0.02, 0.07, 0.015]} />
          {brightGoldMaterial}
        </mesh>
      </group>

      {/* ===== FOREGRIP AREA ===== */}
      <group position={[0, -0.06, -0.35]}>
        {/* Foregrip Rail */}
        <mesh>
          <boxGeometry args={[0.18, 0.04, 0.5]} />
          {goldMaterial}
        </mesh>
        
        {/* Foregrip Panels */}
        <mesh position={[0, -0.04, 0]}>
          <boxGeometry args={[0.16, 0.05, 0.45]} />
          {purpleMaterial}
        </mesh>
      </group>

      {/* ===== VALORANT-STYLE FPS HANDS ===== */}
      {/* Glove materials */}
      {(() => {
        const gloveMaterial = <meshStandardMaterial color="#1a1a2e" roughness={0.7} metalness={0.2} />
        const gloveAccentMaterial = <meshStandardMaterial color="#2d2d44" roughness={0.6} metalness={0.3} />
        const skinMaterial = <meshStandardMaterial color="#e8c4a0" roughness={0.9} metalness={0.05} />
        const sleeveMainMaterial = <meshStandardMaterial color="#0d1a2d" roughness={0.8} metalness={0.1} />
        const sleeveAccentMaterial = <meshStandardMaterial color="#c9a227" roughness={0.4} metalness={0.6} />
        
        return (
          <>
            {/* RIGHT HAND - On Pistol Grip (Valorant Style) */}
            <group position={[0.02, -0.22, 0.52]} rotation={[0.5, 0.1, 0.05]}>
              {/* Gloved Palm */}
              <mesh position={[0, 0.05, 0.02]}>
                <boxGeometry args={[0.14, 0.06, 0.12]} />
                {gloveMaterial}
              </mesh>
              
              {/* Back of Hand */}
              <mesh position={[0, 0.08, 0.04]} rotation={[-0.2, 0, 0]}>
                <boxGeometry args={[0.13, 0.03, 0.1]} />
                {gloveAccentMaterial}
              </mesh>
              
              {/* Thumb - Wrapped */}
              <group position={[0.08, 0.06, -0.02]} rotation={[0.2, 0.6, 0.4]}>
                <mesh>
                  <capsuleGeometry args={[0.025, 0.06, 4, 8]} />
                  {gloveMaterial}
                </mesh>
                <mesh position={[0, 0.05, 0]} rotation={[0.3, 0, 0]}>
                  <capsuleGeometry args={[0.022, 0.04, 4, 8]} />
                  {gloveMaterial}
                </mesh>
              </group>
              
              {/* Index Finger - On Trigger */}
              <group position={[0.03, 0, -0.06]} rotation={[0.8, 0, 0.05]}>
                <mesh>
                  <capsuleGeometry args={[0.022, 0.055, 4, 8]} />
                  {gloveMaterial}
                </mesh>
                <mesh position={[0, -0.055, -0.02]} rotation={[0.5, 0, 0]}>
                  <capsuleGeometry args={[0.02, 0.045, 4, 8]} />
                  {gloveMaterial}
                </mesh>
                <mesh position={[0, -0.1, -0.04]} rotation={[0.3, 0, 0]}>
                  <capsuleGeometry args={[0.018, 0.035, 4, 8]} />
                  {gloveMaterial}
                </mesh>
              </group>
              
              {/* Middle Finger - Gripping */}
              <group position={[0, 0, 0.02]} rotation={[1.4, 0, 0]}>
                <mesh>
                  <capsuleGeometry args={[0.024, 0.06, 4, 8]} />
                  {gloveMaterial}
                </mesh>
                <mesh position={[0, -0.06, 0.02]} rotation={[0.5, 0, 0]}>
                  <capsuleGeometry args={[0.022, 0.05, 4, 8]} />
                  {gloveMaterial}
                </mesh>
                <mesh position={[0, -0.11, 0.05]} rotation={[0.4, 0, 0]}>
                  <capsuleGeometry args={[0.02, 0.04, 4, 8]} />
                  {gloveMaterial}
                </mesh>
              </group>
              
              {/* Ring Finger */}
              <group position={[-0.035, 0, 0.02]} rotation={[1.5, 0, -0.05]}>
                <mesh>
                  <capsuleGeometry args={[0.023, 0.055, 4, 8]} />
                  {gloveMaterial}
                </mesh>
                <mesh position={[0, -0.055, 0.02]} rotation={[0.5, 0, 0]}>
                  <capsuleGeometry args={[0.021, 0.045, 4, 8]} />
                  {gloveMaterial}
                </mesh>
                <mesh position={[0, -0.1, 0.05]} rotation={[0.4, 0, 0]}>
                  <capsuleGeometry args={[0.019, 0.035, 4, 8]} />
                  {gloveMaterial}
                </mesh>
              </group>
              
              {/* Pinky Finger */}
              <group position={[-0.065, 0, 0.02]} rotation={[1.6, 0, -0.1]}>
                <mesh>
                  <capsuleGeometry args={[0.02, 0.045, 4, 8]} />
                  {gloveMaterial}
                </mesh>
                <mesh position={[0, -0.045, 0.02]} rotation={[0.5, 0, 0]}>
                  <capsuleGeometry args={[0.018, 0.038, 4, 8]} />
                  {gloveMaterial}
                </mesh>
                <mesh position={[0, -0.08, 0.04]} rotation={[0.4, 0, 0]}>
                  <capsuleGeometry args={[0.016, 0.03, 4, 8]} />
                  {gloveMaterial}
                </mesh>
              </group>
              
              {/* Wrist/Glove Cuff */}
              <mesh position={[0, 0.06, 0.14]} rotation={[0.1, 0, 0]}>
                <boxGeometry args={[0.14, 0.08, 0.08]} />
                {gloveAccentMaterial}
              </mesh>
              
              {/* Gold Accent Band on Wrist */}
              <mesh position={[0, 0.06, 0.19]}>
                <boxGeometry args={[0.145, 0.02, 0.02]} />
                {sleeveAccentMaterial}
              </mesh>
              
              {/* Forearm/Sleeve - Valorant tactical style */}
              <mesh position={[0, 0.05, 0.32]} rotation={[0.08, 0, 0]}>
                <boxGeometry args={[0.13, 0.11, 0.22]} />
                {sleeveMainMaterial}
              </mesh>
              
              {/* Sleeve Detail Stripe */}
              <mesh position={[0, 0.11, 0.32]}>
                <boxGeometry args={[0.135, 0.015, 0.18]} />
                {sleeveAccentMaterial}
              </mesh>
            </group>

            {/* LEFT HAND - On Foregrip (Valorant Style) */}
            <group position={[0, -0.1, -0.32]} rotation={[0.2, 0, 0]}>
              {/* Gloved Palm - C-Clamp Grip Style */}
              <mesh position={[0, 0.02, 0]}>
                <boxGeometry args={[0.14, 0.05, 0.12]} />
                {gloveMaterial}
              </mesh>
              
              {/* Back of Hand */}
              <mesh position={[0, 0.05, 0.02]} rotation={[-0.15, 0, 0]}>
                <boxGeometry args={[0.13, 0.025, 0.1]} />
                {gloveAccentMaterial}
              </mesh>
              
              {/* Thumb - Over the top (C-Clamp) */}
              <group position={[0.08, 0.06, 0.02]} rotation={[-0.3, 0.5, 0.6]}>
                <mesh>
                  <capsuleGeometry args={[0.026, 0.06, 4, 8]} />
                  {gloveMaterial}
                </mesh>
                <mesh position={[0.01, 0.055, 0.01]} rotation={[0.4, 0.2, 0]}>
                  <capsuleGeometry args={[0.023, 0.045, 4, 8]} />
                  {gloveMaterial}
                </mesh>
              </group>
              
              {/* Index Finger - Extended along barrel */}
              <group position={[0.04, 0, -0.08]} rotation={[0.4, 0, 0.1]}>
                <mesh>
                  <capsuleGeometry args={[0.024, 0.06, 4, 8]} />
                  {gloveMaterial}
                </mesh>
                <mesh position={[0, -0.055, -0.025]} rotation={[0.25, 0, 0]}>
                  <capsuleGeometry args={[0.022, 0.05, 4, 8]} />
                  {gloveMaterial}
                </mesh>
                <mesh position={[0, -0.1, -0.04]} rotation={[0.2, 0, 0]}>
                  <capsuleGeometry args={[0.02, 0.04, 4, 8]} />
                  {gloveMaterial}
                </mesh>
              </group>
              
              {/* Middle Finger - Wrapped under */}
              <group position={[0, -0.02, -0.04]} rotation={[1.2, 0, 0]}>
                <mesh>
                  <capsuleGeometry args={[0.025, 0.06, 4, 8]} />
                  {gloveMaterial}
                </mesh>
                <mesh position={[0, -0.06, 0.015]} rotation={[0.5, 0, 0]}>
                  <capsuleGeometry args={[0.023, 0.05, 4, 8]} />
                  {gloveMaterial}
                </mesh>
                <mesh position={[0, -0.11, 0.035]} rotation={[0.4, 0, 0]}>
                  <capsuleGeometry args={[0.021, 0.04, 4, 8]} />
                  {gloveMaterial}
                </mesh>
              </group>
              
              {/* Ring Finger */}
              <group position={[-0.035, -0.02, -0.03]} rotation={[1.3, 0, -0.08]}>
                <mesh>
                  <capsuleGeometry args={[0.024, 0.055, 4, 8]} />
                  {gloveMaterial}
                </mesh>
                <mesh position={[0, -0.055, 0.015]} rotation={[0.5, 0, 0]}>
                  <capsuleGeometry args={[0.022, 0.045, 4, 8]} />
                  {gloveMaterial}
                </mesh>
                <mesh position={[0, -0.1, 0.035]} rotation={[0.4, 0, 0]}>
                  <capsuleGeometry args={[0.02, 0.035, 4, 8]} />
                  {gloveMaterial}
                </mesh>
              </group>
              
              {/* Pinky Finger */}
              <group position={[-0.065, -0.015, -0.02]} rotation={[1.4, 0, -0.12]}>
                <mesh>
                  <capsuleGeometry args={[0.021, 0.045, 4, 8]} />
                  {gloveMaterial}
                </mesh>
                <mesh position={[0, -0.045, 0.015]} rotation={[0.5, 0, 0]}>
                  <capsuleGeometry args={[0.019, 0.038, 4, 8]} />
                  {gloveMaterial}
                </mesh>
                <mesh position={[0, -0.08, 0.03]} rotation={[0.4, 0, 0]}>
                  <capsuleGeometry args={[0.017, 0.03, 4, 8]} />
                  {gloveMaterial}
                </mesh>
              </group>
              
              {/* Wrist/Glove Cuff */}
              <mesh position={[0, 0.03, 0.1]} rotation={[-0.1, 0, 0]}>
                <boxGeometry args={[0.13, 0.07, 0.07]} />
                {gloveAccentMaterial}
              </mesh>
              
              {/* Gold Accent Band */}
              <mesh position={[0, 0.03, 0.145]}>
                <boxGeometry args={[0.135, 0.02, 0.02]} />
                {sleeveAccentMaterial}
              </mesh>
              
              {/* Forearm/Sleeve */}
              <mesh position={[0, 0.04, 0.26]} rotation={[-0.1, 0, 0]}>
                <boxGeometry args={[0.12, 0.1, 0.2]} />
                {sleeveMainMaterial}
              </mesh>
              
              {/* Sleeve Detail Stripe */}
              <mesh position={[0, 0.09, 0.26]}>
                <boxGeometry args={[0.125, 0.015, 0.16]} />
                {sleeveAccentMaterial}
              </mesh>
            </group>
          </>
        )
      })()}

      {/* ===== ENHANCED MUZZLE FLASH ===== */}
      {muzzleFlashRef.current && (
        <group position={[0, 0.08, -1.7]}>
          {/* Core flash light */}
          <pointLight 
            intensity={flashIntensityRef.current * 1.5} 
            color="#00ffff" 
            distance={12} 
          />
          <pointLight 
            intensity={flashIntensityRef.current} 
            color="#ffd700" 
            distance={8} 
          />
          <pointLight 
            intensity={flashIntensityRef.current * 0.8} 
            color="#ffffff" 
            distance={6} 
          />
          
          {/* Central Flash Sphere */}
          <mesh>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshBasicMaterial 
              color="#ffffff" 
              transparent 
              opacity={flashIntensityRef.current / 10} 
            />
          </mesh>
          
          {/* Inner Cyan Glow */}
          <mesh>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshBasicMaterial 
              color="#00ffff" 
              transparent 
              opacity={flashIntensityRef.current / 8} 
            />
          </mesh>
          
          {/* Outer Gold Ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.15, 0.03, 8, 16]} />
            <meshBasicMaterial 
              color="#ffd700" 
              transparent 
              opacity={flashIntensityRef.current / 12} 
            />
          </mesh>
          
          {/* Energy Flash Spikes - Primary */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <mesh 
              key={`flash-primary-${i}`}
              position={[
                Math.cos(angle * Math.PI / 180) * 0.08,
                Math.sin(angle * Math.PI / 180) * 0.08,
                -0.1
              ]}
              rotation={[Math.PI / 2, 0, angle * Math.PI / 180]}
            >
              <coneGeometry args={[0.03, 0.25, 4]} />
              <meshBasicMaterial 
                color="#00ffff" 
                transparent 
                opacity={flashIntensityRef.current / 12} 
              />
            </mesh>
          ))}
          
          {/* Energy Flash Spikes - Secondary (Gold) */}
          {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((angle, i) => (
            <mesh 
              key={`flash-secondary-${i}`}
              position={[
                Math.cos(angle * Math.PI / 180) * 0.06,
                Math.sin(angle * Math.PI / 180) * 0.06,
                -0.08
              ]}
              rotation={[Math.PI / 2, 0, angle * Math.PI / 180]}
            >
              <coneGeometry args={[0.02, 0.18, 4]} />
              <meshBasicMaterial 
                color="#ffd700" 
                transparent 
                opacity={flashIntensityRef.current / 15} 
              />
            </mesh>
          ))}
          
          {/* Forward Flash Beam */}
          <mesh position={[0, 0, -0.2]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.05, 0.35, 8]} />
            <meshBasicMaterial 
              color="#00ffff" 
              transparent 
              opacity={flashIntensityRef.current / 14} 
            />
          </mesh>
          
          {/* Spark Particles */}
          {[...Array(8)].map((_, i) => {
            const randomAngle = (i / 8) * Math.PI * 2
            const randomDist = 0.1 + Math.random() * 0.1
            return (
              <mesh 
                key={`spark-${i}`}
                position={[
                  Math.cos(randomAngle) * randomDist,
                  Math.sin(randomAngle) * randomDist,
                  -0.05 - Math.random() * 0.1
                ]}
              >
                <sphereGeometry args={[0.015, 6, 6]} />
                <meshBasicMaterial 
                  color="#ffd700" 
                  transparent 
                  opacity={flashIntensityRef.current / 10} 
                />
              </mesh>
            )
          })}
        </group>
      )}
    </group>
  )
}

// Environment Component
function Environment() {
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
}

// Preload the environment model
useGLTF.preload('/models/environment/scene.gltf')

// Professional Target Dummy Component
interface TargetProps {
  position: [number, number, number]
  onMount?: (mesh: THREE.Mesh) => void
  onHit?: () => void
  index: number
}

function Target({ position, onMount, onHit, index }: TargetProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  useEffect(() => {
    if (meshRef.current && onMount) {
      onMount(meshRef.current)
    }
  }, [onMount])

  // Plain red sphere - no animations
  return (
    <mesh ref={meshRef} position={position} userData={{ targetIndex: index }}>
      <sphereGeometry args={[0.4, 32, 32]} />
      <meshBasicMaterial color="#ff3333" />
    </mesh>
  )
}

// Main Aim Trainer Component
interface AimTrainer3DProps {
  onExit?: () => void
}

export default function AimTrainer3D({ onExit }: AimTrainer3DProps) {
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [isCountingDown, setIsCountingDown] = useState(false)
  const [showGameOver, setShowGameOver] = useState(false)
  const [totalShots, setTotalShots] = useState(0)
  const [targets, setTargets] = useState<[number, number, number][]>([])
  const targetMeshes = useRef<THREE.Mesh[]>([])
  
  // Settings
  const [sensitivity, setSensitivity] = useState(1)
  const [volume, setVolume] = useState(50)

  // Handle ESC key for pause menu and R for restart
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        if (isPlaying) {
          setIsPaused(prev => !prev)
          // Exit pointer lock when pausing
          if (!isPaused && document.pointerLockElement) {
            document.exitPointerLock()
          }
        }
      }
      // R key to restart (only during active play, not countdown)
      if (e.key === 'r' || e.key === 'R') {
        if (isPlaying && !isPaused && !isCountingDown) {
          startGame()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPlaying, isPaused, isCountingDown])

  // Handle resume - re-lock pointer
  const handleResume = () => {
    setIsPaused(false)
    const canvas = document.querySelector('canvas')
    if (canvas) {
      canvas.requestPointerLock()
    }
  }

  // Handle exit to menu
  const handleExit = () => {
    setIsPaused(false)
    setIsPlaying(false)
    if (document.fullscreenElement) {
      document.exitFullscreen()
    }
    if (onExit) {
      onExit()
    }
  }

  // Handle target hit - reposition specific target
  const handleHit = (targetIndex: number) => {
    setTargets(prev => {
      const newTargets = [...prev]
      const otherTargets = prev.filter((_, i) => i !== targetIndex)
      newTargets[targetIndex] = generateRandomPosition(undefined, otherTargets)
      return newTargets
    })
  }

  // Shooting system component
  function ShootingSystem() {
    const { camera, scene } = useThree()

    useEffect(() => {
      const handleShootEvent = () => {
        // Create raycaster from camera
        const raycaster = new THREE.Raycaster()
        raycaster.setFromCamera(new THREE.Vector2(0, 0), camera)

        // Check if ray hits any target
        const intersects = raycaster.intersectObjects(targetMeshes.current.filter(Boolean), true)

        if (intersects.length > 0) {
          // Hit a target! Get which one from userData
          const hitTarget = intersects[0].object as THREE.Mesh
          const targetIndex = hitTarget.userData.targetIndex
          if (targetIndex !== undefined) {
            // Increment score immediately
            setScore(prev => prev + 1)
            
            // Reposition target immediately (no delay)
            handleHit(targetIndex)
          }
        }
      }

      window.addEventListener('gun-shoot', handleShootEvent)
      return () => window.removeEventListener('gun-shoot', handleShootEvent)
    }, [camera, scene, handleHit])

    return null
  }

  // Shoot handler - trigger gun shoot event
  const handleShoot = () => {
    setTotalShots(prev => prev + 1)
    window.dispatchEvent(new Event('gun-shoot'))
  }

  // Mouse movement for camera
  useEffect(() => {
    if (!isPlaying || isPaused) return

    const canvas = document.querySelector('canvas')
    if (!canvas) return

    const handleMouseMove = (e: MouseEvent) => {
      // Store mouse delta for smooth camera rotation
      canvas.setAttribute('data-mouse-delta-x', String(e.movementX))
      canvas.setAttribute('data-mouse-delta-y', String(e.movementY))
    }

    // Lock pointer for FPS-style camera control
    canvas.addEventListener('click', () => {
      if (canvas.requestPointerLock) {
        canvas.requestPointerLock()
      }
    })

    window.addEventListener('mousemove', handleMouseMove)
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (document.pointerLockElement) {
        document.exitPointerLock()
      }
    }
  }, [isPlaying, isPaused])

  // Generate random position within visible corridor bounds
  const generateRandomPosition = (zone?: number, existingPositions?: [number, number, number][]): [number, number, number] => {
    let x: number, y: number, z: number
    let attempts = 0
    const maxAttempts = 20
    
    do {
      if (zone !== undefined) {
        // Divide space into 3 zones: left, center, right (very spread out)
        if (zone === 0) {
          x = Math.random() * 1.2 - 2.5  // -2.5 to -1.3 (far left)
        } else if (zone === 1) {
          x = Math.random() * 1.4 - 0.7  // -0.7 to 0.7 (center)
        } else {
          x = Math.random() * 1.2 + 1.3  // 1.3 to 2.5 (far right)
        }
      } else {
        x = (Math.random() - 0.5) * 5  // -2.5 to 2.5 (full width)
      }
      
      y = Math.random() * 0.8 + 1.0  // 1.0 to 1.8 (more height variation)
      z = Math.random() * 8 - 8  // -8 to 0 (full depth of corridor)
      
      // Check minimum distance from existing targets
      if (existingPositions && existingPositions.length > 0) {
        const minDistance = 3.5  // Large minimum distance to spread them out
        const tooClose = existingPositions.some(pos => {
          const dx = pos[0] - x
          const dy = pos[1] - y
          const dz = pos[2] - z
          return Math.sqrt(dx * dx + dy * dy + dz * dz) < minDistance
        })
        
        if (!tooClose) break
      } else {
        break
      }
      
      attempts++
    } while (attempts < maxAttempts)
    
    return [x, y, z]
  }

  // Start game with countdown
  const startGame = () => {
    setScore(0)
    setTimeLeft(60)
    setTotalShots(0)
    setShowGameOver(false)
    setIsCountingDown(true)
    setCountdown(3)
    
    // Generate targets with zone separation
    const target1 = generateRandomPosition(0)  // Left zone
    const target2 = generateRandomPosition(1, [target1])  // Center zone
    const target3 = generateRandomPosition(2, [target1, target2])  // Right zone
    
    setTargets([target1, target2, target3])
    targetMeshes.current = []
    
    // Request fullscreen
    const element = document.documentElement
    if (element.requestFullscreen) {
      element.requestFullscreen()
    }
  }

  // Countdown timer
  useEffect(() => {
    if (!isCountingDown) return
    
    if (countdown <= 0) {
      setIsCountingDown(false)
      setIsPlaying(true)
      // Lock pointer when game actually starts
      const canvas = document.querySelector('canvas')
      if (canvas) {
        canvas.requestPointerLock()
      }
      return
    }
    
    const timer = setTimeout(() => {
      setCountdown(prev => prev - 1)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [isCountingDown, countdown])

  // Timer
  useEffect(() => {
    if (!isPlaying || isPaused) return

    if (timeLeft <= 0) {
      setIsPlaying(false)
      setShowGameOver(true)
      // Exit pointer lock when game ends
      if (document.pointerLockElement) {
        document.exitPointerLock()
      }
      return
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [isPlaying, isPaused, timeLeft])

  return (
    <div className="aim-trainer-container">
      {/* HUD */}
      <div className="aim-trainer-hud">
        <div className="hud-item">
          <span className="hud-label">Score:</span>
          <span className="hud-value">{score}</span>
        </div>
        <div className="hud-item">
          <span className="hud-label">Time:</span>
          <span className="hud-value">{timeLeft}s</span>
        </div>
      </div>

      {/* Restart hint */}
      {isPlaying && !isPaused && !isCountingDown && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(0, 0, 0, 0.6)',
          padding: '8px 16px',
          borderRadius: '8px',
          zIndex: 100
        }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            background: 'linear-gradient(180deg, #4a4a4a 0%, #2a2a2a 100%)',
            border: '2px solid #666',
            borderRadius: '6px',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 'bold',
            fontFamily: 'monospace',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
          }}>R</span>
          <span style={{ color: '#fff', fontSize: '14px' }}>Restart</span>
        </div>
      )}

      {/* Start/Restart Button */}
      {!isPlaying && !isCountingDown && !showGameOver && (
        <div className="aim-trainer-overlay">
          <button onClick={startGame} className="aim-trainer-start-btn">
            START
          </button>
        </div>
      )}

      {/* Countdown Overlay */}
      {isCountingDown && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(8px)',
          background: 'rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px'
          }}>
            <span 
              key={countdown}
              className="countdown-number"
              style={{
                fontSize: '140px',
                fontWeight: 'bold',
                color: '#fff',
                textShadow: '0 0 40px rgba(99, 102, 241, 0.8), 0 0 80px rgba(99, 102, 241, 0.5)',
                fontFamily: 'monospace'
              }}>
              {countdown}
            </span>
            <span style={{
              fontSize: '24px',
              color: '#aaa',
              textTransform: 'uppercase',
              letterSpacing: '4px'
            }}>
              Get Ready
            </span>
          </div>
        </div>
      )}

      {/* Game Over Summary */}
      {showGameOver && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(10px)',
          background: 'rgba(0, 0, 0, 0.7)',
          cursor: 'default'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(30, 30, 40, 0.95) 0%, rgba(20, 20, 30, 0.95) 100%)',
            padding: '50px 60px',
            borderRadius: '20px',
            border: '2px solid rgba(99, 102, 241, 0.5)',
            boxShadow: '0 0 60px rgba(99, 102, 241, 0.3)',
            textAlign: 'center',
            minWidth: '400px',
            cursor: 'default'
          }}>
            <h2 style={{
              fontSize: '42px',
              fontWeight: 'bold',
              color: '#fff',
              marginBottom: '10px',
              textShadow: '0 0 20px rgba(99, 102, 241, 0.8)'
            }}>
              GAME OVER
            </h2>
            <p style={{
              color: '#888',
              fontSize: '16px',
              marginBottom: '30px',
              textTransform: 'uppercase',
              letterSpacing: '3px'
            }}>
              Session Complete
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              marginBottom: '35px'
            }}>
              <div style={{
                background: 'rgba(99, 102, 241, 0.15)',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid rgba(99, 102, 241, 0.3)'
              }}>
                <div style={{ color: '#888', fontSize: '14px', marginBottom: '5px', textTransform: 'uppercase' }}>Total Score</div>
                <div style={{ color: '#fff', fontSize: '36px', fontWeight: 'bold' }}>{score}</div>
              </div>
              <div style={{
                background: 'rgba(34, 197, 94, 0.15)',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid rgba(34, 197, 94, 0.3)'
              }}>
                <div style={{ color: '#888', fontSize: '14px', marginBottom: '5px', textTransform: 'uppercase' }}>Accuracy</div>
                <div style={{ color: '#22c55e', fontSize: '36px', fontWeight: 'bold' }}>
                  {totalShots > 0 ? Math.round((score / totalShots) * 100) : 0}%
                </div>
              </div>
              <div style={{
                background: 'rgba(251, 191, 36, 0.15)',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid rgba(251, 191, 36, 0.3)'
              }}>
                <div style={{ color: '#888', fontSize: '14px', marginBottom: '5px', textTransform: 'uppercase' }}>Shots Fired</div>
                <div style={{ color: '#fbbf24', fontSize: '36px', fontWeight: 'bold' }}>{totalShots}</div>
              </div>
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid rgba(239, 68, 68, 0.3)'
              }}>
                <div style={{ color: '#888', fontSize: '14px', marginBottom: '5px', textTransform: 'uppercase' }}>Misses</div>
                <div style={{ color: '#ef4444', fontSize: '36px', fontWeight: 'bold' }}>{totalShots - score}</div>
              </div>
            </div>
            
            <div style={{
              background: 'rgba(99, 102, 241, 0.1)',
              padding: '15px 25px',
              borderRadius: '10px',
              marginBottom: '30px'
            }}>
              <span style={{ color: '#888', fontSize: '14px' }}>Targets per minute: </span>
              <span style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>{score}</span>
            </div>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button 
                onClick={startGame}
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  color: '#fff',
                  border: 'none',
                  padding: '15px 40px',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Play Again
              </button>
              <button 
                onClick={() => {
                  setShowGameOver(false)
                  if (document.fullscreenElement) {
                    document.exitFullscreen()
                  }
                  if (onExit) {
                    onExit()
                  }
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  padding: '15px 40px',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pause Menu */}
      {isPaused && (
        <div className="pause-menu-overlay" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          cursor: 'default'
        }}>
          <div className="pause-menu" style={{
            background: 'linear-gradient(135deg, #2a2a3e 0%, #1a1a2e 100%)',
            borderRadius: '16px',
            padding: '40px',
            minWidth: '400px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h2 style={{
              color: '#fff',
              fontSize: '32px',
              marginBottom: '30px',
              textAlign: 'center',
              fontWeight: 'bold'
            }}>PAUSED</h2>
            
            {/* Settings */}
            <div style={{ marginBottom: '30px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ color: '#aaa', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                  Sensitivity: {sensitivity.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={sensitivity}
                  onChange={(e) => setSensitivity(parseFloat(e.target.value))}
                  style={{
                    width: '100%',
                    height: '8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    accentColor: '#6366f1'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ color: '#aaa', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                  Volume: {volume}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={volume}
                  onChange={(e) => setVolume(parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    height: '8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    accentColor: '#6366f1'
                  }}
                />
              </div>
            </div>
            
            {/* Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={handleResume}
                style={{
                  padding: '14px 24px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  color: '#fff',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
              >
                RESUME
              </button>
              <button
                onClick={handleExit}
                style={{
                  padding: '14px 24px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: 'transparent',
                  color: '#fff',
                  transition: 'transform 0.2s, background 0.2s'
                }}
              >
                EXIT TO MENU
              </button>
            </div>
            
            <p style={{
              color: '#666',
              fontSize: '12px',
              textAlign: 'center',
              marginTop: '20px'
            }}>Press ESC to resume</p>
          </div>
        </div>
      )}

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 1.6, 8], fov: 75 }}
        style={{ background: 'linear-gradient(to bottom, #87CEEB 0%, #E0F6FF 100%)' }}        onClick={() => {
          if (isPlaying && !isPaused) {
            handleShoot()
          }
        }}      >
        {/* Daylight Lighting */}
        <ambientLight intensity={0.8} />
        <directionalLight 
          position={[50, 50, 25]} 
          intensity={1.5} 
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <directionalLight position={[-50, 30, -25]} intensity={0.5} />
        <hemisphereLight args={['#87CEEB', '#E8DCC0', 0.6]} />

        {/* 3D Environment */}
        <Environment />

        {/* Targets */}
        {isPlaying && targets.map((pos, index) => (
          <Target 
            key={index} 
            position={pos} 
            index={index}
            onMount={(mesh) => {
              targetMeshes.current[index] = mesh
            }}
          />
        ))}

        {/* Shooting System */}
        {isPlaying && <ShootingSystem />}

        {/* 3D Rifle with Muzzle Flash */}
        {isPlaying && <Rifle />}

        {/* Camera Controller for mouse movement */}
        <CameraController sensitivity={sensitivity} />
      </Canvas>

      {/* Crosshair */}
      <div className="crosshair">
        <div className="crosshair-line crosshair-horizontal"></div>
        <div className="crosshair-line crosshair-vertical"></div>
      </div>
    </div>
  )
}
