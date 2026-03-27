const glowPalette = {
  'accent-blue': 'rgba(0, 212, 255, 0.7)',
  'portal-green': 'rgba(177, 151, 252, 0.72)',
  'stark-gold': 'rgba(0, 212, 255, 0.72)',
}

function HudPanel({ children, className = '', glowColor = 'accent-blue', hover = false }) {
  const glow = glowPalette[glowColor] || glowPalette['accent-blue']

  return (
    <div
      className={`hud-panel-frame ${hover ? 'hud-panel-hover' : ''} ${className}`.trim()}
      style={{ '--hud-glow': glow }}
    >
      <div className="hud-panel-inner">{children}</div>
    </div>
  )
}

export default HudPanel