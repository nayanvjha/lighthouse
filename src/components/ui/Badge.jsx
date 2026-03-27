const palette = {
  'accent-blue': 'rgba(0, 212, 255, 0.55)',
  'portal-green': 'rgba(177, 151, 252, 0.55)',
  'stark-gold': 'rgba(0, 212, 255, 0.55)',
}

function Badge({ text, glowColor = 'accent-blue' }) {
  const glow = palette[glowColor] || palette['accent-blue']

  return (
    <span className="hud-badge" style={{ '--badge-glow': glow }}>
      {text}
    </span>
  )
}

export default Badge