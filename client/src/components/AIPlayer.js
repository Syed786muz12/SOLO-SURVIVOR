"use client"

import { useRef, useState, useEffect } from "react"
import { RigidBody, CapsuleCollider } from "@react-three/rapier"
import { useFrame } from "@react-three/fiber"
import { Text, useGLTF, useAnimations } from "@react-three/drei"
import * as THREE from "three"
import AIHitEffect from "./AIHitEffect"
import LootDrop from "./LootDrop"

// Audio setup
const hitSound = new Audio("/sounds/hit.wav")
const killSound = new Audio("/sounds/kill.wav")
const gunshotSound = new Audio("/sounds/gunshot.wav")

const randomRespawn = () => {
  const positions = [
    [5, 2, 5],
    [-5, 2, -5],
    [10, 2, -10],
    [-10, 2, 10],
    [0, 2, 0],
  ]
  return positions[Math.floor(Math.random() * positions.length)]
}

const AIPlayer = ({ id, name, position = [0, 2, 0], targetRef, team = "red", mapBoundaries, onHit }) => {
  const rigidBodyRef = useRef()
  const groupRef = useRef()
  const animationRef = useRef()
  const weaponRef = useRef()

  // AI State
  const [health, setHealth] = useState(100)
  const [floatingText, setFloatingText] = useState([])
  const [isDead, setIsDead] = useState(false)
  const [respawnPos, setRespawnPos] = useState(position)
  const [lootDropped, setLootDropped] = useState(null)
  const [currentAnimation, setCurrentAnimation] = useState("Idle")
  const [hasWeapon, setHasWeapon] = useState(true) // AI starts with weapon
  const [isFiring, setIsFiring] = useState(false)
  const [isJumping, setIsJumping] = useState(false)
  const [isMoving, setIsMoving] = useState(false)
  const [isGrounded, setIsGrounded] = useState(true)

  // Combat state
  const lastFireTime = useRef(0)
  const fireRate = 1200 // ms between shots
  const detectionRange = 15
  const attackRange = 8

  // Movement AI
  const patrolTarget = useRef(new THREE.Vector3())
  const patrolTimer = useRef(0)

  // Load AI character model with animations
  const { scene: aiScene, animations: aiAnimations } = useGLTF("/assets/ai_character1.glb")
  const { actions } = useAnimations(aiAnimations, groupRef)

  // Load weapon model
  const { scene: weaponScene } = useGLTF("/assets/models/akm.glb")

  // Enhanced animation management
  useEffect(() => {
    if (!actions) return

    // Stop all current actions
    Object.values(actions).forEach((action) => action?.stop())

    if (isDead) {
      actions.Death?.reset().fadeIn(0.5).play()
      setCurrentAnimation("Death")
      return
    }

    // Animation priority: Firing > Jumping > Moving > Idle
    if (isFiring && hasWeapon) {
      if (isMoving) {
        actions.RunFire?.reset().fadeIn(0.2).play() || actions.Fire?.reset().fadeIn(0.2).play()
        setCurrentAnimation("RunFire")
      } else {
        actions.Fire?.reset().fadeIn(0.2).play()
        setCurrentAnimation("Fire")
      }
    } else if (isJumping) {
      actions.Jump?.reset().fadeIn(0.2).play()
      setCurrentAnimation("Jump")
    } else if (isMoving) {
      if (hasWeapon) {
        actions.RunWithWeapon?.reset().fadeIn(0.2).play() || actions.Run?.reset().fadeIn(0.2).play()
        setCurrentAnimation("RunWithWeapon")
      } else {
        actions.Run?.reset().fadeIn(0.2).play()
        setCurrentAnimation("Run")
      }
    } else {
      if (hasWeapon) {
        actions.IdleWithWeapon?.reset().fadeIn(0.2).play() || actions.Idle?.reset().fadeIn(0.2).play()
        setCurrentAnimation("IdleWithWeapon")
      } else {
        actions.Idle?.reset().fadeIn(0.2).play()
        setCurrentAnimation("Idle")
      }
    }

    return () => {
      Object.values(actions).forEach((action) => action?.fadeOut(0.2))
    }
  }, [actions, isDead, isFiring, isJumping, isMoving, hasWeapon])

  // Generate patrol target
  const generatePatrolTarget = () => {
    const angle = Math.random() * Math.PI * 2
    const distance = 3 + Math.random() * 5
    const currentPos = rigidBodyRef.current?.translation() || { x: 0, y: 0, z: 0 }

    const target = new THREE.Vector3(
      currentPos.x + Math.cos(angle) * distance,
      currentPos.y,
      currentPos.z + Math.sin(angle) * distance,
    )

    // Keep within boundaries
    if (mapBoundaries) {
      target.x = Math.max(mapBoundaries.minX + 2, Math.min(mapBoundaries.maxX - 2, target.x))
      target.z = Math.max(mapBoundaries.minZ + 2, Math.min(mapBoundaries.maxZ - 2, target.z))
    }

    patrolTarget.current.copy(target)
  }

  // Initialize patrol target
  useEffect(() => {
    generatePatrolTarget()
  }, [])

  // Handle damage and death
  const takeDamage = (damage, type = "normal") => {
    if (isDead) return

    setHealth((prev) => {
      const newHealth = prev - damage

      if (newHealth <= 0) {
        setIsDead(true)
        setHasWeapon(false)
        setIsMoving(false)

        // Drop loot
        const currentPos = rigidBodyRef.current?.translation()
        if (currentPos) {
          setLootDropped([currentPos.x, currentPos.y, currentPos.z])
        }

        // Respawn after delay
        setTimeout(() => {
          setHealth(100)
          setIsDead(false)
          setHasWeapon(true)
          setRespawnPos(randomRespawn())
          setLootDropped(null)
        }, 5000)

        // Notify parent component
        onHit?.({ targetId: id, damage, killerId: "player", type })

        return 0
      } else {
        // Play hit reaction
        actions.Hit?.reset().fadeIn(0.2).play()
        setTimeout(() => {
          actions.Hit?.fadeOut(0.2)
        }, 500)

        return newHealth
      }
    })

    // Show damage text
    const color = type === "headshot" ? "orange" : "red"
    const damageText = `-${damage}`
    const currentPos = rigidBodyRef.current?.translation()

    if (currentPos) {
      const newText = {
        key: `${Date.now()}_${Math.random()}`,
        text: damageText,
        color,
        position: [currentPos.x, currentPos.y + 2, currentPos.z],
      }
      setFloatingText((prev) => [...prev, newText])
    }
  }

  // Enhanced AI behavior and movement
  useFrame((state, delta) => {
    if (!rigidBodyRef.current || isDead) return

    const currentPos = rigidBodyRef.current.translation()
    const velocity = rigidBodyRef.current.linvel()

    // Ground detection
    if (currentPos.y <= 1.2 && Math.abs(velocity.y) < 0.1) {
      setIsGrounded(true)
    } else {
      setIsGrounded(false)
    }

    // Movement detection
    const speed = Math.sqrt(velocity.x ** 2 + velocity.z ** 2)
    setIsMoving(speed > 0.5)

    // Target detection and behavior
    let targetPos = null
    let distanceToTarget = Number.POSITIVE_INFINITY

    if (targetRef?.current) {
      const playerPos = targetRef.current.position
      if (playerPos) {
        targetPos = new THREE.Vector3(playerPos.x, playerPos.y, playerPos.z)
        distanceToTarget = Math.sqrt((playerPos.x - currentPos.x) ** 2 + (playerPos.z - currentPos.z) ** 2)
      }
    }

    // AI Decision Making
    if (targetPos && distanceToTarget < detectionRange) {
      // Combat mode - target detected
      const dirToTarget = new THREE.Vector3(targetPos.x - currentPos.x, 0, targetPos.z - currentPos.z).normalize()

      // Rotate to face target
      if (groupRef.current) {
        const angle = Math.atan2(dirToTarget.x, dirToTarget.z)
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, angle, 0.1)
      }

      // Combat behavior
      if (distanceToTarget < attackRange && hasWeapon) {
        // Stop and fire
        rigidBodyRef.current.setLinvel({ x: 0, y: velocity.y, z: 0 }, true)

        const now = Date.now()
        if (now - lastFireTime.current > fireRate) {
          setIsFiring(true)
          lastFireTime.current = now

          // Simulate firing
          setTimeout(() => setIsFiring(false), 400)

          // Apply damage to player (simplified)
          if (Math.random() < 0.3) {
            // 30% hit chance
            // This would normally be handled by a bullet system
            console.log("AI hit player!")
          }
        }
      } else if (distanceToTarget > 2) {
        // Move toward target
        const moveForce = 6
        rigidBodyRef.current.applyImpulse(
          {
            x: dirToTarget.x * moveForce,
            y: 0,
            z: dirToTarget.z * moveForce,
          },
          true,
        )

        // Limit velocity
        const maxSpeed = 4
        if (Math.abs(velocity.x) > maxSpeed || Math.abs(velocity.z) > maxSpeed) {
          rigidBodyRef.current.setLinvel(
            {
              x: Math.sign(velocity.x) * Math.min(Math.abs(velocity.x), maxSpeed),
              y: velocity.y,
              z: Math.sign(velocity.z) * Math.min(Math.abs(velocity.z), maxSpeed),
            },
            true,
          )
        }
      }

      // Random jumping during combat
      if (Math.random() < 0.005 && isGrounded) {
        // 0.5% chance per frame
        setIsJumping(true)
        rigidBodyRef.current.applyImpulse({ x: 0, y: 15, z: 0 }, true)
        setTimeout(() => setIsJumping(false), 800)
      }
    } else {
      // Patrol mode - no target detected
      patrolTimer.current += delta

      const distanceToPatrol = Math.sqrt(
        (patrolTarget.current.x - currentPos.x) ** 2 + (patrolTarget.current.z - currentPos.z) ** 2,
      )

      // Generate new patrol target if reached or timeout
      if (distanceToPatrol < 1.5 || patrolTimer.current > 6) {
        generatePatrolTarget()
        patrolTimer.current = 0
      }

      // Move toward patrol target
      const dirToPatrol = new THREE.Vector3(
        patrolTarget.current.x - currentPos.x,
        0,
        patrolTarget.current.z - currentPos.z,
      ).normalize()

      // Rotate toward patrol target
      if (groupRef.current && (dirToPatrol.x !== 0 || dirToPatrol.z !== 0)) {
        const angle = Math.atan2(dirToPatrol.x, dirToPatrol.z)
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, angle, 0.05)
      }

      // Apply patrol movement
      const patrolForce = 3
      rigidBodyRef.current.applyImpulse(
        {
          x: dirToPatrol.x * patrolForce,
          y: 0,
          z: dirToPatrol.z * patrolForce,
        },
        true,
      )
    }
  })

  // Handle loot pickup
  const handlePickup = (picked) => {
    if (picked && picked.type === "weapon") {
      setHasWeapon(true)
      actions.Pickup?.reset().fadeIn(0.5).play()
      setTimeout(() => {
        actions.Pickup?.fadeOut(0.5)
      }, 1000)
    }
    setLootDropped(null)
  }

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={respawnPos}
      type="dynamic"
      colliders={false}
      enabledRotations={[false, true, false]} // Only Y-axis rotation
      linearDamping={0.4}
      angularDamping={0.8}
      userData={{ isAI: true, id, team, takeDamage }}
    >
      {/* AI Collider */}
      <CapsuleCollider args={[0.8, 0.4]} position={[0, 0, 0]} />

      <group ref={groupRef}>
        {/* AI Character Model */}
        <group ref={animationRef}>
          {aiScene && (
            <primitive object={aiScene.clone()} scale={[0.5, 0.5, 0.5]} visible={!isDead} castShadow receiveShadow />
          )}
        </group>

        {/* Weapon */}
        {weaponScene && hasWeapon && !isDead && (
          <group ref={weaponRef} position={[0.3, 1.2, 0.2]} rotation={[0, Math.PI / 4, 0]}>
            <primitive object={weaponScene.clone()} scale={[0.6, 0.6, 0.6]} />
          </group>
        )}

        {/* Death representation */}
        {isDead && (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
            <boxGeometry args={[1.5, 0.2, 2]} />
            <meshStandardMaterial color="darkred" />
          </mesh>
        )}

        {/* Team indicator */}
        <mesh position={[0, 2.8, 0]}>
          <sphereGeometry args={[0.1]} />
          <meshBasicMaterial color={team === "blue" ? "#4A90E2" : "#E24A4A"} />
        </mesh>
      </group>

      {/* Name and status display */}
      <Text position={[0, 3.2, 0]} fontSize={0.25} color="white" anchorX="center">
        {name} ({health}HP)
      </Text>

      <Text position={[0, 2.9, 0]} fontSize={0.2} color="yellow" anchorX="center">
        {currentAnimation}
      </Text>

      {/* Floating damage text */}
      {floatingText.map(({ key, text, color, position }) => (
        <AIHitEffect
          key={key}
          text={text}
          color={color}
          position={position}
          onFinish={() => setFloatingText((prev) => prev.filter((t) => t.key !== key))}
        />
      ))}

      {/* Loot drop */}
      {lootDropped && <LootDrop position={lootDropped} onPickup={handlePickup} />}
    </RigidBody>
  )
}

// Preload models
useGLTF.preload("/assets/ai_character1.glb")
useGLTF.preload("/assets/models/akm.glb")

export default AIPlayer
