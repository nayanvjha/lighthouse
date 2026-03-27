import { useEffect, useRef, useState } from 'react'

function StatReadout({ label, value, description, start = false, delay = 0 }) {
  const [typedLabel, setTypedLabel] = useState('')
  const [displayValue, setDisplayValue] = useState('0')
  const [isAnimating, setIsAnimating] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const hasStartedRef = useRef(false)

  useEffect(() => {
    if (!start || hasStartedRef.current) {
      return undefined
    }

    hasStartedRef.current = true

    const timeoutId = window.setTimeout(() => {
      setIsAnimating(true)
      let labelTick = 0
      const labelSpeed = Math.max(14, Math.floor(500 / Math.max(label.length, 1)))
      const labelTimer = window.setInterval(() => {
        labelTick += 1
        setTypedLabel(label.slice(0, labelTick))
        if (labelTick >= label.length) {
          window.clearInterval(labelTimer)
        }
      }, labelSpeed)

      const numericMatch = value.match(/\d+/)
      if (!numericMatch) {
        setDisplayValue(value)
        setIsAnimating(false)
        setIsComplete(true)
        return
      }

      const target = Number.parseInt(numericMatch[0], 10)
      const suffix = value.replace(/\d+/g, '')
      const duration = 850
      const startTime = performance.now()

      const animateNumber = (time) => {
        const elapsed = Math.min((time - startTime) / duration, 1)
        const eased = 1 - (1 - elapsed) * (1 - elapsed)
        const currentValue = Math.round(target * eased)
        setDisplayValue(`${currentValue}${suffix}`)

        if (elapsed < 1) {
          requestAnimationFrame(animateNumber)
        } else {
          setDisplayValue(value)
          setIsAnimating(false)
          setIsComplete(true)
        }
      }

      requestAnimationFrame(animateNumber)
    }, delay)

    return () => window.clearTimeout(timeoutId)
  }, [delay, label, start, value])

  return (
    <article
      className={`stat-readout ${isAnimating ? 'is-animating' : ''} ${isComplete ? 'is-complete' : ''}`}
    >
      <p className="stat-readout-label">{typedLabel || '...'}</p>
      <p className="stat-readout-value">{displayValue}</p>
      <p className="stat-readout-desc">{description}</p>
      <span className="stat-readout-scanline" aria-hidden="true" />
      <span className="stat-readout-pulse" aria-hidden="true" />
    </article>
  )
}

export default StatReadout