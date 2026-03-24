import { useState } from 'react'

function ProjectCard({ project, isActive, onClick }) {
  const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg)')

  const missionLabel = `MISSION ${project.mission || '00'}`
  const bullets = isActive ? project.bullets : project.bullets.slice(0, 2)
  const awards = Array.isArray(project.awards)
    ? project.awards
    : project.awards
      ? [project.awards]
      : []

  const handleMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const rotateY = ((x - centerX) / centerX) * 10
    const rotateX = -((y - centerY) / centerY) * 10

    setTransform(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`)
  }

  const handleLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg)')
  }

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`mission-card ${isActive ? 'is-active' : ''}`}
      style={{ transform, transition: 'transform 260ms ease, border-color 260ms ease, opacity 260ms ease' }}
    >
      <div className="mission-card-topbar">
        <span>{missionLabel}</span>
        <span>{project.codename}</span>
      </div>

      <h3 className="mission-card-title">{project.name}</h3>

      <div className="mb-3">
        <span className="mission-client-tag">{project.client || project.type}</span>
      </div>

      <div className="mission-stack-row">
        {project.stack.map((item) => (
          <span key={item} className="mission-stack-pill">
            {item}
          </span>
        ))}
      </div>

      <ul className="mission-bullets">
        {bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>

      <p className="mission-impact">IMPACT: {project.impact}</p>

      {awards.length ? (
        <div className="mission-awards-row">
          {awards.map((award) => (
            <span key={award} className="mission-award-pill">
              {award}
            </span>
          ))}
        </div>
      ) : null}
    </button>
  )
}

export default ProjectCard