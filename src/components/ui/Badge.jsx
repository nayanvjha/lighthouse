const palette = {
  'accent-blue': 'rgba(0, 163, 255, 0.55)',
  'portal-green': 'rgba(57, 255, 20, 0.55)',
  'stark-gold': 'rgba(255, 215, 0, 0.55)',
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