import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import HudPanel from '../ui/HudPanel'
import SectionLabel from '../ui/SectionLabel'
import { achievements } from '../../constants/data'

const iconByTitle = {
  'MeitY x IIM Calcutta - 1st Place': '01',
  'IIT Delhi - Finalist': '02',
  'National CTF Champion': '03',
  'C3iHub Finalist': '04',
  'Published Researcher': '05',
}

function Achievements() {
  const sectionRef = useRef(null)
  const headingRef = useRef(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      gsap.fromTo(
        headingRef.current,
        { autoAlpha: 0, y: 26 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.62,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: headingRef.current,
            start: 'top 80%',
            once: true,
          },
        },
      )

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.glory-grid',
          start: 'top 82%',
          once: true,
        },
      })

      tl.fromTo(
        '.glory-card-item',
        { autoAlpha: 0, scale: 0.8, y: 24 },
        {
          autoAlpha: 1,
          scale: 1,
          y: 0,
          duration: 0.56,
          stagger: 0.13,
          ease: 'back.out(1.4)',
          onStart: () => {
            document.querySelectorAll('.glory-card').forEach((card) => {
              card.classList.add('particles-live')
            })
          },
          onComplete: () => {
            window.setTimeout(() => {
              document.querySelectorAll('.glory-card').forEach((card) => {
                card.classList.remove('particles-live')
              })
            }, 380)
          },
        },
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section id="achievements" ref={sectionRef} className="border-b border-accent-blue/25 px-4 py-18 md:px-12">
      <div className="mx-auto w-full max-w-6xl">
        <SectionLabel text="ACHIEVEMENTS_UNLOCKED" />
        <h2
          ref={headingRef}
          data-animate="fadeInUp"
          className="mb-10 font-heading text-4xl tracking-[0.08em] text-white opacity-0 md:text-5xl"
        >
          HALL OF GLORY
        </h2>

        <div data-animate="staggerChildren" className="glory-grid">
          {achievements.map((item) => (
            <div key={item.title} className="glory-card-item opacity-0">
              <HudPanel
                className={`glory-card h-full ${item.cyber ? 'is-cyber' : ''}`}
                glowColor={item.cyber ? 'portal-green' : 'accent-blue'}
                hover
              >
                <span className="glory-icon" aria-hidden="true">
                  {iconByTitle[item.title] || '00'}
                </span>
                {item.cyber ? <span className="glory-cyber-tag">[SECURITY]</span> : null}
                <h3 className="glory-title">{item.title}</h3>
                <p className="glory-detail">{item.detail}</p>
                <span className="glory-particles" aria-hidden="true" />
              </HudPanel>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Achievements