import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SectionLabel from '../ui/SectionLabel'
import HudPanel from '../ui/HudPanel'
import HudButton from '../ui/HudButton'
import { personalInfo } from '../../constants/data'

function Contact() {
  const [formData, setFormData] = useState({
    callsign: '',
    frequency: '',
    brief: '',
    budget: '< ₹50K',
  })
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)

  const sectionRef = useRef(null)
  const headingRef = useRef(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      gsap.fromTo(
        headingRef.current,
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: headingRef.current,
            start: 'top 82%',
            once: true,
          },
        },
      )

      gsap.fromTo(
        '.mars-form-row',
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.mars-form',
            start: 'top 82%',
            once: true,
          },
        },
      )

      gsap.fromTo(
        '.mars-side-panel',
        { autoAlpha: 0, x: 40 },
        {
          autoAlpha: 1,
          x: 0,
          duration: 0.62,
          ease: 'power3.out',
          stagger: 0.12,
          scrollTrigger: {
            trigger: '.mars-side',
            start: 'top 82%',
            once: true,
          },
        },
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const updateField = (key) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [key]: event.target.value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const endpoint = import.meta.env.VITE_FORMSPREE_ENDPOINT

    if (endpoint) {
      try {
        setSending(true)
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.callsign,
            email: formData.frequency,
            message: formData.brief,
            budget: formData.budget,
          }),
        })

        if (response.ok) {
          setSubmitted(true)
          return
        }
      } catch {
        // Falls back to mailto when endpoint submission fails.
      } finally {
        setSending(false)
      }
    }

    const subject = encodeURIComponent(`Mission Request from ${formData.callsign || 'Unknown Callsign'}`)
    const body = encodeURIComponent(
      [
        `Callsign: ${formData.callsign}`,
        `Frequency: ${formData.frequency}`,
        `Budget: ${formData.budget}`,
        '',
        `Mission Brief:\n${formData.brief}`,
      ].join('\n'),
    )

    window.location.href = `mailto:${personalInfo.email}?subject=${subject}&body=${body}`
    setSubmitted(true)
  }

  const contactLines = [
    { key: 'EMAIL', label: personalInfo.email, href: `mailto:${personalInfo.email}` },
    { key: 'PHONE', label: personalInfo.phone, href: `https://wa.me/918306581102` },
    { key: 'LINKEDIN', label: 'linkedin.com/in/nayan-kumar-731132296', href: `https://${personalInfo.linkedin}` },
    { key: 'GITHUB', label: 'github.com/nayanvjha', href: `https://${personalInfo.github}` },
  ]

  return (
    <section id="contact" ref={sectionRef} className="mars-section border-b border-accent-blue/25 p-4 md:p-12 lg:p-20">
      <div className="mars-noise" aria-hidden="true" />

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <SectionLabel text="MARS_COLONY_COMMS" />
        <div ref={headingRef} className="opacity-0">
          <h2 data-animate="fadeInUp" className="font-heading text-3xl tracking-[0.08em] text-white md:text-5xl">
            LET&apos;S BUILD THE FUTURE
          </h2>
          <p className="mt-4 max-w-2xl text-base text-gray-300 md:text-lg">
            Specializing in secure app development, web platforms, and cybersecurity solutions.
            Let&apos;s build something bulletproof.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <HudPanel className="mars-form-panel" glowColor="accent-blue">
              <form data-animate="staggerChildren" className="mars-form" onSubmit={handleSubmit}>
                <label className="mars-form-row">
                  <span>CALLSIGN</span>
                  <input
                    value={formData.callsign}
                    onChange={updateField('callsign')}
                    required
                    placeholder="Nayan Kumar"
                  />
                </label>

                <label className="mars-form-row">
                  <span>FREQUENCY</span>
                  <input
                    type="email"
                    value={formData.frequency}
                    onChange={updateField('frequency')}
                    required
                    placeholder="you@domain.com"
                  />
                </label>

                <label className="mars-form-row">
                  <span>MISSION BRIEF</span>
                  <textarea
                    rows={4}
                    value={formData.brief}
                    onChange={updateField('brief')}
                    required
                    placeholder="Tell me about your project..."
                  />
                </label>

                <label className="mars-form-row">
                  <span>BUDGET RANGE</span>
                  <select value={formData.budget} onChange={updateField('budget')}>
                    <option>{'< ₹50K'}</option>
                    <option>₹50K - ₹1L</option>
                    <option>₹1L - ₹3L</option>
                    <option>₹3L+</option>
                  </select>
                </label>

                <div className="mars-form-row">
                  <HudButton
                    type="submit"
                    variant="green"
                    className={`mars-submit ${submitted ? 'is-sent' : ''}`}
                  >
                    {submitted ? 'TRANSMITTED ✓' : sending ? 'TRANSMITTING...' : 'TRANSMIT MESSAGE'}
                  </HudButton>
                </div>
              </form>

              {submitted ? (
                <HudPanel className="mt-4" glowColor="portal-green">
                  <p className="font-mono text-sm text-portal-green">
                    Message received. I&apos;ll respond within 24 hours.
                  </p>
                </HudPanel>
              ) : null}
            </HudPanel>
          </div>

          <div data-animate="staggerChildren" className="mars-side space-y-4 lg:col-span-2">
            <HudPanel className="mars-side-panel opacity-0" glowColor="accent-blue">
              <div className="mars-lines">
                {contactLines.map((line) => (
                  <a key={line.label} href={line.href} target="_blank" rel="noreferrer" className="mars-line-item">
                    <span className="mars-line-key">{line.key}:</span>
                    <span>{line.label}</span>
                  </a>
                ))}
              </div>
            </HudPanel>

            <HudPanel className="mars-side-panel opacity-0" glowColor="portal-green">
              <p className="font-mono text-xs tracking-[0.12em] text-portal-green md:text-sm">
                <span className="availability-dot" aria-hidden="true" /> CURRENTLY AVAILABLE FOR FREELANCE MISSIONS
              </p>
            </HudPanel>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact