import { useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SectionLabel from '../ui/SectionLabel'
import { techStack } from '../../constants/data'

const ringConfig = [
  { key: 'coreLanguages', label: 'Core Languages', duration: 26, radius: 105 },
  { key: 'frontendMobile', label: 'Frontend & Mobile', duration: 34, radius: 155 },
  { key: 'backendApis', label: 'Backend & APIs', duration: 42, radius: 205 },
  { key: 'databasesCloud', label: 'Databases & Cloud', duration: 50, radius: 255 },
  { key: 'devopsInfra', label: 'DevOps & Infrastructure', duration: 58, radius: 305 },
  { key: 'mlDataScience', label: 'ML & Data Science', duration: 66, radius: 355 },
  { key: 'securityArsenal', label: 'Security Arsenal', duration: 74, radius: 405, isSecurity: true },
]

function TechStack() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024)
  const sectionRef = useRef(null)
  const headingRef = useRef(null)

  const ringData = useMemo(
    () =>
      ringConfig.map((ring) => ({
        ...ring,
        techs: techStack.rings[ring.key] || [],
      })),
    [],
  )

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1024)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      gsap.fromTo(
        headingRef.current,
        { autoAlpha: 0, y: 26 },
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

      if (!isMobile) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: '.dyson-wrap',
            start: 'top 80%',
            once: true,
          },
        })

        tl.fromTo(
          '.dyson-core',
          { autoAlpha: 0, scale: 0.7 },
          { autoAlpha: 1, scale: 1, duration: 0.45, ease: 'back.out(1.4)' },
        )
          .fromTo(
            '.dyson-ring',
            { autoAlpha: 0, scale: 0.86 },
            { autoAlpha: 1, scale: 1, duration: 0.42, stagger: 0.16, ease: 'power2.out' },
            '-=0.1',
          )
          .fromTo(
            '.dyson-badge',
            { autoAlpha: 0, scale: 0.8, y: 8 },
            { autoAlpha: 1, scale: 1, y: 0, duration: 0.35, stagger: 0.03, ease: 'power2.out' },
            '-=0.18',
          )
      } else {
        gsap.fromTo(
          '.dyson-mobile-group',
          { autoAlpha: 0, y: 18 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.45,
            stagger: 0.12,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.dyson-mobile-grid',
              start: 'top 82%',
              once: true,
            },
          },
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [isMobile])

  return (
    <section id="techstack" ref={sectionRef} className="border-b border-accent-blue/25 px-4 py-18 md:px-12">
      <div className="mx-auto w-full max-w-6xl">
        <SectionLabel text="DYSON_CORE" />
        <h2
          ref={headingRef}
          data-animate="fadeInUp"
          className="mb-10 font-heading text-4xl tracking-[0.08em] text-white opacity-0 md:text-5xl"
        >
          TECHNOLOGIES I HARNESS
        </h2>

        {isMobile ? (
          <div data-animate="staggerChildren" className="dyson-mobile-grid">
            {ringData.map((ring) => (
              <div key={ring.key} className={`dyson-mobile-group opacity-0 ${ring.isSecurity ? 'is-security' : ''}`}>
                <h3>{ring.label}</h3>
                <div className="dyson-mobile-badges">
                  {ring.techs.map((tech) => (
                    <span key={tech} className={`dyson-mobile-badge ${ring.isSecurity ? 'is-security' : ''}`}>
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="dyson-wrap">
            <div className="dyson-core" aria-hidden="true" />

            {ringData.map((ring) => (
              <div
                key={ring.key}
                className={`dyson-ring dyson-ring-${ring.key} ${ring.isSecurity ? 'is-security' : ''}`}
                style={{ '--ring-duration': `${ring.duration}s` }}
              >
                {ring.techs.map((tech, index) => {
                  const angle = (360 / ring.techs.length) * index

                  return (
                    <span
                      key={tech}
                      className={`dyson-badge ${ring.isSecurity ? 'is-security' : ''}`}
                      data-category={ring.label}
                      style={{ '--angle': `${angle}deg`, '--radius': `${ring.radius}px` }}
                    >
                      {tech}
                    </span>
                  )
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default TechStack