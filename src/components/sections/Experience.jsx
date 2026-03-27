import { useEffect, useMemo, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import HudPanel from '../ui/HudPanel'
import SectionLabel from '../ui/SectionLabel'

function Experience() {
  const sectionRef = useRef(null)
  const timelineFillRef = useRef(null)
  const headingRef = useRef(null)
  const nodeRefs = useRef([])
  const cardRefs = useRef([])

  const waypoints = useMemo(
    () => [
      {
        org: 'BOSCH',
        role: 'Research Intern - EV Infrastructure Systems',
        period: 'NOV 2025 - PRESENT',
        current: true,
        bullets: [
          'EV charging demand forecasting and grid load balancing - reduced overload events by ~25%',
          'Async distributed simulation framework - 100+ WebSocket connections, 40% more fault coverage',
          'Implemented security-hardened WebSocket protocols and encrypted OCPP message lifecycle for EV infrastructure',
          'Validated against IIT Delhi real-world datasets - 95%+ behavioural accuracy',
        ],
      },
      {
        org: 'ERNST & YOUNG (EY)',
        role: 'Intern - Technology & GRC | Agartala',
        period: 'MAY 2025 - JUL 2025',
        current: false,
        bullets: [
          'Decision dashboards for PM Gati Shakti - 30% faster reporting cycles',
          'Conducted compliance auditing and data integrity assessments across government digital infrastructure',
          'Drafted Tripura State Minor Mineral Policy provisions',
          'RFP documentation and vendor scoring for 3 govt digital initiatives',
          'Authored specs for Swaagat 2.0 and IPAT governance dashboards',
        ],
      },
      {
        org: 'CDAC, NOIDA',
        role: 'Intern - DevOps & Infrastructure',
        period: 'AUG 2024 - OCT 2024',
        current: false,
        bullets: [
          'Deployed security-hardened Nginx reverse proxy with SSL/TLS termination, response caching, and access control',
          'Bash monitoring tools - surfaced 3 critical bottlenecks, 20% response time improvement',
        ],
      },
    ],
    [],
  )

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const isMobile = window.innerWidth < 768

    const ctx = gsap.context(() => {
      gsap.fromTo(
        headingRef.current,
        { autoAlpha: 0, y: 30 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: headingRef.current,
            start: 'top 80%',
            once: true,
          },
        },
      )

      gsap.fromTo(
        timelineFillRef.current,
        { scaleY: 0, transformOrigin: 'top' },
        {
          scaleY: 1,
          duration: 1.2,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 72%',
            end: 'bottom 35%',
            scrub: true,
          },
        },
      )

      cardRefs.current.forEach((card, index) => {
        const node = nodeRefs.current[index]
        const fromX = isMobile ? 44 : index % 2 === 0 ? -70 : 70

        gsap.fromTo(
          card,
          { autoAlpha: 0, x: fromX },
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.66,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 82%',
              once: true,
            },
          },
        )

        gsap.to(node, {
          '--node-glow': 'rgba(177, 151, 252, 0.95)',
          '--node-scale': 1,
          duration: 0.4,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 82%',
            once: true,
          },
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section id="experience" ref={sectionRef} className="border-b border-[#00d4ff]/25 p-4 md:p-12 lg:p-20">
      <div className="mx-auto w-full max-w-6xl">
        <SectionLabel text="EXPERIENCE" />
        <h2
          ref={headingRef}
          data-animate="fadeInUp"
          className="mb-10 font-heading text-3xl tracking-[0.08em] text-white opacity-0 md:text-5xl"
        >
          CAREER TRAJECTORY
        </h2>

        <div className="flight-timeline">
          <span className="flight-line" aria-hidden="true" />
          <span ref={timelineFillRef} className="flight-line-fill" aria-hidden="true" />

          {waypoints.map((point, index) => (
            <article
              key={point.org}
              className={`flight-waypoint ${index % 2 === 0 ? 'left' : 'right'}`}
            >
              <span
                ref={(node) => {
                  nodeRefs.current[index] = node
                }}
                className="flight-node"
                aria-hidden="true"
              />

              <div
                ref={(card) => {
                  cardRefs.current[index] = card
                }}
                className="flight-card-wrap opacity-0"
              >
                <HudPanel className="flight-card" glowColor={point.current ? 'portal-green' : 'accent-blue'}>
                  <h3 className="flight-card-org">{point.org}</h3>
                  <p className="flight-card-role">{point.role}</p>
                  <span className={`flight-period-badge ${point.current ? 'is-current' : ''}`}>
                    {point.period}
                  </span>

                  <ul className="flight-bullets">
                    {point.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </HudPanel>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Experience