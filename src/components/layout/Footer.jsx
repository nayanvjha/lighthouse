import { useEffect, useMemo, useState } from 'react'
import HudButton from '../ui/HudButton'

const quotes = [
  'Works on my machine is a deployment strategy only in alternate timelines.',
  'I do not always test my code, but when I do, I do it in production by accident.',
  'The bug was not in your code. It was in this dimension.',
  'Coffee-driven development reached critical mass. Please stand by.',
  '99 little bugs in the code, 99 little bugs. Patch one down, compile around, 127 little bugs in the code.',
]

function Footer() {
  const [toast, setToast] = useState('')

  const socials = useMemo(
    () => [
      { label: 'GitHub', href: 'https://github.com/nayanvjha', variant: 'blue', icon: 'GH' },
      {
        label: 'LinkedIn',
        href: 'https://linkedin.com/in/nayan-kumar-731132296',
        variant: 'green',
        icon: 'IN',
      },
      { label: 'Email', href: 'mailto:jhavatsak217@gmail.com', variant: 'gold', icon: '@' },
      { label: 'WhatsApp', href: 'https://wa.me/918306581102', variant: 'green', icon: 'WA' },
    ],
    [],
  )

  useEffect(() => {
    if (!toast) {
      return undefined
    }

    const timer = window.setTimeout(() => {
      setToast('')
    }, 3200)

    return () => window.clearTimeout(timer)
  }, [toast])

  const triggerQuote = () => {
    const quote = quotes[Math.floor(Math.random() * quotes.length)]
    setToast(quote)
  }

  return (
    <footer
      id="footer"
      className="relative border-t border-accent-blue/45 bg-black/35 px-4 py-12 md:px-12 lg:px-20"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-7 text-center">
        <h3 className="font-heading text-xl tracking-[0.28em] text-white md:text-2xl">NAYAN KUMAR</h3>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {socials.map((social) => (
            <HudButton
              key={social.label}
              href={social.href}
              variant={social.variant}
              icon={social.icon}
              className="text-[11px] md:text-xs"
            >
              {social.label}
            </HudButton>
          ))}
        </div>

        <p className="font-mono text-[11px] tracking-[0.14em] text-white/60 md:text-xs">
          © 2026 Nayan Kumar | Built in Dimension C-137
        </p>
      </div>

      <button
        type="button"
        className="portal-egg"
        onClick={triggerQuote}
        aria-label="Open portal easter egg"
      />

      {toast ? <div className="hud-toast">{toast}</div> : null}
    </footer>
  )
}

export default Footer