const glowPalette = {
  'accent-blue': 'rgba(0, 163, 255, 0.7)',
  'portal-green': 'rgba(57, 255, 20, 0.72)',
  'stark-gold': 'rgba(255, 215, 0, 0.72)',
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