const variants = {
  blue: {
    color: 'rgba(0, 212, 255, 1)',
    border: 'rgba(0, 212, 255, 0.65)',
    fill: 'rgba(0, 212, 255, 0.14)',
  },
  green: {
    color: 'rgba(177, 151, 252, 1)',
    border: 'rgba(177, 151, 252, 0.65)',
    fill: 'rgba(177, 151, 252, 0.14)',
  },
  gold: {
    color: 'rgba(0, 212, 255, 1)',
    border: 'rgba(0, 212, 255, 0.65)',
    fill: 'rgba(0, 212, 255, 0.14)',
  },
}

function HudButton({ children, onClick, variant = 'blue', href, icon, className = '', type = 'button' }) {
  const tone = variants[variant] || variants.blue
  const sharedProps = {
    className: `hud-button ${className}`.trim(),
    style: {
      '--hud-btn-color': tone.color,
      '--hud-btn-border': tone.border,
      '--hud-btn-fill': tone.fill,
    },
  }

  const content = (
    <>
      <span className="hud-button-bracket">[</span>
      {icon ? <span className="hud-button-icon">{icon}</span> : null}
      <span className="hud-button-label">{children}</span>
      <span className="hud-button-bracket">]</span>
    </>
  )

  if (href) {
    return (
      <a
        {...sharedProps}
        href={href}
        onClick={onClick}
        target="_blank"
        rel="noreferrer"
      >
        {content}
      </a>
    )
  }

  return (
    <button {...sharedProps} type={type} onClick={onClick}>
      {content}
    </button>
  )
}

export default HudButton