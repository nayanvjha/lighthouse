import { useEffect, useRef, useState } from 'react'

function CustomCursor() {
  const cursorRef = useRef(null)
  const mouseRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
  const posRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
  const rafRef = useRef(0)
  const [enabled, setEnabled] = useState(() => window.matchMedia('(hover: hover) and (pointer: fine)').matches)
  const [hovering, setHovering] = useState(false)
  const [clicking, setClicking] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(hover: hover) and (pointer: fine)')
    const updateEnabled = () => setEnabled(media.matches)
    updateEnabled()
    media.addEventListener('change', updateEnabled)

    return () => media.removeEventListener('change', updateEnabled)
  }, [])

  useEffect(() => {
    if (!enabled) {
      return undefined
    }

    const interactiveSelector = 'a, button, input, textarea, select, label, [role="button"]'

    const onMove = (event) => {
      mouseRef.current.x = event.clientX
      mouseRef.current.y = event.clientY

      const isInteractive = Boolean(event.target.closest(interactiveSelector))
      setHovering(isInteractive)
    }

    const onDown = () => setClicking(true)
    const onUp = () => setClicking(false)

    const animate = () => {
      posRef.current.x += (mouseRef.current.x - posRef.current.x) * 0.22
      posRef.current.y += (mouseRef.current.y - posRef.current.y) * 0.22

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0)`
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
    }
  }, [enabled])

  if (!enabled) {
    return null
  }

  return (
    <div
      ref={cursorRef}
      className={`custom-cursor ${hovering ? 'is-hovering' : ''} ${clicking ? 'is-clicking' : ''}`}
      aria-hidden="true"
    />
  )
}

export default CustomCursor