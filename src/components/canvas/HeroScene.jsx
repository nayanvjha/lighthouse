import { Suspense, memo, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Stars, Text, Torus, useDetectGPU } from '@react-three/drei'
import useIsMobile from '../../hooks/useIsMobile'

function OrbitingObject({ speed, radius, y, offset, children }) {
  const groupRef = useRef(null)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed + offset
    if (!groupRef.current) {
      return
    }

    groupRef.current.position.x = Math.cos(t) * radius
    groupRef.current.position.z = Math.sin(t) * radius
    groupRef.current.position.y = y + Math.sin(t * 1.3) * 0.35
  })

  return (
    <group ref={groupRef}>
      <Float speed={1.5} rotationIntensity={0.6} floatIntensity={0.8}>
        {children}
      </Float>
    </group>
  )
}

const Scene = memo(function Scene({ isMobile, reducedMotion, mouse }) {
  const rootRef = useRef(null)
  const starsRef = useRef(null)
  const coreRef = useRef(null)
  const ringsRef = useRef([])

  const orbitingObjects = useMemo(() => {
    const base = [
      {
        key: 'bracket',
        speed: 0.42,
        radius: 6.8,
        y: 1,
        offset: 0,
        type: 'text',
      },
      {
        key: 'octa',
        speed: 0.54,
        radius: 7.2,
        y: -0.7,
        offset: 2,
        type: 'octa',
      },
      {
        key: 'cone',
        speed: 0.32,
        radius: 6.4,
        y: 0.1,
        offset: 4,
        type: 'cone',
      },
    ]

    if (reducedMotion) {
      return base.slice(0, 1)
    }

    return isMobile ? base.slice(0, 2) : base
  }, [isMobile, reducedMotion])

  useFrame((state, delta) => {
    if (rootRef.current) {
      const drift = reducedMotion ? 0.01 : 0.08
      rootRef.current.rotation.y +=
        ((mouse.current.x * 0.1 - rootRef.current.rotation.y) * 0.6 + drift) * delta
      rootRef.current.rotation.x += (mouse.current.y * 0.1 - rootRef.current.rotation.x) * 0.9 * delta
    }

    if (starsRef.current) {
      starsRef.current.rotation.y += (reducedMotion ? 0.006 : 0.018) * delta
    }

    if (coreRef.current) {
      coreRef.current.rotation.x += (reducedMotion ? 0.08 : 0.21) * delta
      coreRef.current.rotation.y += (reducedMotion ? 0.1 : 0.28) * delta
      coreRef.current.rotation.z += (reducedMotion ? 0.06 : 0.16) * delta
    }

    ringsRef.current.forEach((ring, idx) => {
      if (!ring) {
        return
      }

      const speedFactor = reducedMotion ? 0.45 : 1
      ring.rotation.x += (0.15 + idx * 0.05) * speedFactor * delta
      ring.rotation.y += (0.12 + idx * 0.06) * speedFactor * delta
    })
  })

  return (
    <group ref={rootRef}>
      <group ref={starsRef}>
        <Stars
          radius={55}
          depth={50}
          count={reducedMotion ? 700 : isMobile ? 1600 : 4000}
          factor={2.2}
          fade
          speed={reducedMotion ? 0.4 : 0.8}
        />
      </group>

      <ambientLight intensity={0.28} />
      <pointLight color="#7feaff" intensity={2} distance={22} position={[0, 0, 0]} />

      <group ref={coreRef} position={[1.2, 0.9, 0]} scale={0.8}>
        <mesh>
          <icosahedronGeometry args={[2, 0]} />
          <meshStandardMaterial color="#00d4ff" emissive="#00a8cc" emissiveIntensity={0.4} wireframe />
        </mesh>

        <mesh>
          <sphereGeometry args={[0.8, 48, 48]} />
          <meshStandardMaterial
            color="#b9f5ff"
            emissive="#00d4ff"
            emissiveIntensity={1.5}
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>

        {[0, 1, 2].map((index) => (
          <Torus
            key={index}
            args={[2.65 + index * 0.2, 0.03, 18, 90]}
            rotation={
              index === 0
                ? [0.4, 0, 0.3]
                : index === 1
                  ? [1.2, 0.45, 0]
                  : [0.1, 1.2, 0.65]
            }
            ref={(node) => {
              ringsRef.current[index] = node
            }}
          >
            <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.55} />
          </Torus>
        ))}
      </group>

      {orbitingObjects.map((obj) => (
        <OrbitingObject
          key={obj.key}
          speed={obj.speed}
          radius={obj.radius}
          y={obj.y}
          offset={obj.offset}
        >
          {obj.type === 'text' ? (
            <Text
              fontSize={0.6}
              color="#b197fc"
              anchorX="center"
              anchorY="middle"
              outlineBlur={0.4}
              outlineColor="#00d4ff"
            >
              {'< />'}
            </Text>
          ) : null}

          {obj.type === 'octa' ? (
            <mesh>
              <octahedronGeometry args={[0.35, 0]} />
              <meshStandardMaterial color="#00d4ff" emissive="#008bb8" emissiveIntensity={0.8} />
            </mesh>
          ) : null}

          {obj.type === 'cone' ? (
            <mesh rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.24, 0.7, 24]} />
              <meshStandardMaterial color="#00d4ff" emissive="#0099c7" emissiveIntensity={0.45} />
            </mesh>
          ) : null}
        </OrbitingObject>
      ))}
    </group>
  )
})

function HeroScene({ className = '', reducedMotion = false }) {
  const mouse = useRef({ x: 0, y: 0 })
  const isMobile = useIsMobile(768)
  const [hasCrashed, setHasCrashed] = useState(false)
  const gpu = useDetectGPU()
  const gpuTier = gpu?.tier ?? 3

  const handlePointerMove = (event) => {
    const x = (event.clientX / window.innerWidth) * 2 - 1
    const y = (event.clientY / window.innerHeight) * 2 - 1
    mouse.current.x = x
    mouse.current.y = -y
  }

  if (hasCrashed || reducedMotion || isMobile || gpuTier < 2) {
    return <div className={`${className} hero-scene-fallback`} />
  }

  return (
    <Canvas
      className={className}
      gl={{ alpha: true, antialias: true, failIfMajorPerformanceCaveat: true }}
      style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}
      dpr={isMobile ? [1, 1] : [1, 1.25]}
      camera={{ position: [0, 0.5, 9], fov: isMobile ? 55 : 45 }}
      onPointerMove={handlePointerMove}
      onCreated={({ gl }) => {
        gl.setClearColor('#000000', 0)

        // Handle WebGL context loss gracefully.
        const canvas = gl.domElement
        const handleContextLost = (event) => {
          event.preventDefault()
          console.warn('[HeroScene] WebGL context lost — falling back to static hero.')
          setHasCrashed(true)
        }

        canvas.addEventListener('webglcontextlost', handleContextLost)
      }}
    >
      <Suspense fallback={null}>
        <Scene
          isMobile={isMobile}
          reducedMotion={reducedMotion}
          mouse={mouse}
        />
      </Suspense>
    </Canvas>
  )
}

export default HeroScene