import { useState } from 'react'
import HudButton from './HudButton'
import HudPanel from './HudPanel'

function ServiceCard({ icon, title, features, quote, cta = 'DISCUSS A PROJECT →', index = 0 }) {
  const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg)')
  const [isHovering, setIsHovering] = useState(false)
  const [scanKey, setScanKey] = useState(0)

  const handleMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateY = ((x - centerX) / centerX) * 10
    const rotateX = -((y - centerY) / centerY) * 10

    setTransform(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`)
  }

  const handleLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg)')
    setIsHovering(false)
  }

  const handleEnter = () => {
    setIsHovering(true)
    setScanKey((prev) => prev + 1)
  }

  const discussProject = () => {
    const contact = document.getElementById('contact')
    if (contact) {
      contact.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div
      className={`service-card-tilt h-full ${isHovering ? 'is-hovering' : ''}`}
      style={{ transform, transition: isHovering ? 'transform 120ms linear' : 'transform 320ms ease-out' }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onMouseEnter={handleEnter}
      data-service-index={index}
    >
      <HudPanel className="service-card h-full" hover glowColor="accent-blue">
        <span key={scanKey} className="service-card-scanline" aria-hidden="true" />

        <header className="mb-5 flex items-center gap-4">
          <span className="service-card-icon" aria-hidden="true">
            {icon}
          </span>
          <h3 className="service-card-title">{title}</h3>
        </header>

        <ul className="service-card-features">
          {features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>

        <p className="service-card-quote">{quote}</p>

        <footer className="mt-6">
          <HudButton variant="gold" onClick={discussProject} className="service-card-cta">
            {cta}
          </HudButton>
        </footer>
      </HudPanel>
    </div>
  )
}

export default ServiceCard