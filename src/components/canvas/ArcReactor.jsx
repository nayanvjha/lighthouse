import { Suspense, memo, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sparkles, Torus, useDetectGPU } from '@react-three/drei'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import useReducedMotion from '../../hooks/useReducedMotion'
import useIsMobile from '../../hooks/useIsMobile'

const ReactorGroup = memo(function ReactorGroup({ mouse, reducedMotion, effectsEnabled }) {
  const rootRef = useRef(null)
  const innerRingRef = useRef(null)
  const middleRingRef = useRef(null)
  const outerRingRef = useRef(null)

  const nodes = useMemo(() => {
    return Array.from({ length: 12 }, (_, index) => {
      const angle = (index / 12) * Math.PI * 2
      return {
        x: Math.cos(angle) * 2.2,
        y: Math.sin(angle) * 2.2,
      }
    })
  }, [])

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime()

    if (rootRef.current) {
      const pulse = 1 + Math.sin(t * 1.9) * (reducedMotion ? 0.02 : 0.05)
      rootRef.current.scale.setScalar(pulse)

      const easing = reducedMotion ? 0.04 : 0.08
      rootRef.current.rotation.x += (mouse.current.y * 0.087 - rootRef.current.rotation.x) * easing
      rootRef.current.rotation.y += (mouse.current.x * 0.087 - rootRef.current.rotation.y) * easing
    }

    if (innerRingRef.current) {
      innerRingRef.current.rotation.z += (reducedMotion ? 0.5 : 1.25) * delta
    }

    if (middleRingRef.current) {
      middleRingRef.current.rotation.z -= (reducedMotion ? 0.35 : 0.85) * delta
    }

    if (outerRingRef.current) {
      outerRingRef.current.rotation.z += (reducedMotion ? 0.18 : 0.38) * delta
    }
  })

  return (
    <group ref={rootRef}>
      <ambientLight intensity={0.24} />
      <pointLight color="#d9f0ff" intensity={2.2} distance={8} position={[0, 0, 1]} />

      <mesh>
        <sphereGeometry args={[0.3, 48, 48]} />
        <meshStandardMaterial
          color="#e8f7ff"
          emissive="#00A3FF"
          emissiveIntensity={2}
          roughness={0.15}
          metalness={0.2}
        />
      </mesh>

      <Torus args={[0.82, 0.028, 18, 100]} ref={innerRingRef} rotation={[0.5, 0.2, 0.1]}>
        <meshStandardMaterial color="#00A3FF" emissive="#00A3FF" emissiveIntensity={1} />
      </Torus>

      <Torus args={[1.35, 0.035, 18, 100]} ref={middleRingRef} rotation={[1.1, 0.9, 0.2]}>
        <meshStandardMaterial
          color="#8fd8ff"
          emissive="#00A3FF"
          emissiveIntensity={0.7}
          transparent
          opacity={0.55}
        />
      </Torus>

      <group ref={outerRingRef} rotation={[0.3, 0.6, 0]}>
        <Torus args={[2.2, 0.06, 18, 120]}>
          <meshStandardMaterial color="#2eb6ff" emissive="#008fd6" emissiveIntensity={0.55} />
        </Torus>

        {nodes.map((node, index) => (
          <mesh key={index} position={[node.x, node.y, 0]}>
            <sphereGeometry args={[0.08, 20, 20]} />
            <meshStandardMaterial color="#8de8ff" emissive="#00A3FF" emissiveIntensity={1.2} />
          </mesh>
        ))}
      </group>

      <Sparkles
        count={reducedMotion ? 14 : 36}
        speed={reducedMotion ? 0.2 : 0.5}
        size={1.8}
        scale={[3.7, 3.7, 3.7]}
        color="#7cd8ff"
      />

      {!reducedMotion && effectsEnabled ? (
        <EffectComposer>
          <Bloom luminanceThreshold={0.2} intensity={1.7} mipmapBlur />
        </EffectComposer>
      ) : null}
    </group>
  )
})

function ArcReactor() {
  const mouse = useRef({ x: 0, y: 0 })
  const reducedMotion = useReducedMotion()
  const isMobile = useIsMobile(768)
  const [gpuTier, setGpuTier] = useState(3)
  const gpu = useDetectGPU()

  useEffect(() => {
    if (!gpu) {
      return
    }

    setGpuTier(gpu.tier ?? 3)
  }, [gpu])

  const effectsEnabled = !reducedMotion && gpuTier >= 2

  const handlePointerMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    const y = ((event.clientY - rect.top) / rect.height) * 2 - 1
    mouse.current.x = x
    mouse.current.y = -y
  }

  return (
    <div className="mx-auto h-57.5 w-57.5 md:h-75 md:w-75" onPointerMove={handlePointerMove}>
      <Canvas
        dpr={isMobile ? [1, 1.4] : [1, 2]}
        camera={{ position: [0, 0, 4.9], fov: 46 }}
        gl={{ alpha: true, antialias: true }}
        onCreated={({ gl }) => gl.setClearColor('#000000', 0)}
      >
        <Suspense fallback={null}>
          <ReactorGroup mouse={mouse} reducedMotion={reducedMotion} effectsEnabled={effectsEnabled} />
        </Suspense>
      </Canvas>
    </div>
  )
}

export default ArcReactor