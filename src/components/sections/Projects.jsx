import { useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SectionLabel from '../ui/SectionLabel'
import HudPanel from '../ui/HudPanel'
import ProjectCard from '../ui/ProjectCard'
import { projects } from '../../constants/data'

function Projects() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)

  const sectionRef = useRef(null)
  const headingRef = useRef(null)
  const selectorRef = useRef(null)
  const detailRef = useRef(null)
  const scanRef = useRef(null)

  const current = useMemo(() => projects[activeIndex], [activeIndex])

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      gsap.fromTo(
        headingRef.current,
        { autoAlpha: 0, y: 34 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.65,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: headingRef.current,
            start: 'top 78%',
            once: true,
          },
        },
      )

      gsap.fromTo(
        '.mission-selector-card',
        { autoAlpha: 0, x: 54 },
        {
          autoAlpha: 1,
          x: 0,
          duration: 0.62,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: selectorRef.current,
            start: 'top 82%',
            once: true,
            onEnter: () => {
              if (!hasStarted) {
                setActiveIndex(0)
                setHasStarted(true)
              }
            },
          },
        },
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [hasStarted])

  useEffect(() => {
    if (!detailRef.current || !scanRef.current) {
      return
    }

    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })
    tl.fromTo(detailRef.current, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.35 })
      .fromTo(
        scanRef.current,
        { y: -14, autoAlpha: 0 },
        { y: 480, autoAlpha: 1, duration: 0.42, ease: 'none' },
        '<',
      )
      .set(scanRef.current, { autoAlpha: 0 })

    return () => tl.kill()
  }, [activeIndex])

  const switchProject = (index) => {
    if (index === activeIndex || !detailRef.current) {
      return
    }

    gsap.to(detailRef.current, {
      autoAlpha: 0,
      y: 10,
      duration: 0.16,
      onComplete: () => setActiveIndex(index),
    })
  }

  const detailAwards = Array.isArray(current.awards)
    ? current.awards
    : current.awards
      ? [current.awards]
      : []

  return (
    <section id="projects" ref={sectionRef} className="border-b border-accent-blue/25 px-4 py-18 md:px-12">
      <div className="mx-auto w-full max-w-6xl">
        <SectionLabel text="MISSION_LOG" />

        <h2
          ref={headingRef}
          data-animate="fadeInUp"
          className="mb-9 font-heading text-4xl tracking-[0.08em] text-white opacity-0 md:text-5xl"
        >
          COMPLETED MISSIONS
        </h2>

        <div className="grid gap-6 lg:grid-cols-5">
          <aside ref={selectorRef} className="order-1 lg:order-2 lg:col-span-2">
            <div data-animate="staggerChildren" className="mission-selector-list no-scrollbar">
              {projects.map((project, index) => (
                <div key={project.codename} className="mission-selector-card opacity-0">
                  <ProjectCard
                    project={project}
                    isActive={activeIndex === index}
                    onClick={() => switchProject(index)}
                  />
                </div>
              ))}
            </div>
          </aside>

          <div className="order-2 lg:order-1 lg:col-span-3">
            <HudPanel className="mission-feature-panel" glowColor="accent-blue">
              <span ref={scanRef} className="mission-feature-scanline" aria-hidden="true" />
              <div ref={detailRef}>
                <div className="mission-card-topbar mb-4">
                  <span>{`MISSION ${current.mission}`}</span>
                  <span>{current.codename}</span>
                </div>

                <h3 className="mission-feature-title">{current.name}</h3>

                <div className="mb-4 mt-3 flex flex-wrap gap-2">
                  <span className="mission-client-tag">{current.client || current.type}</span>
                  {detailAwards.map((award) => (
                    <span key={award} className="mission-award-pill">
                      {award}
                    </span>
                  ))}
                </div>

                <div className="mission-stack-row mb-5">
                  {current.stack.map((item) => (
                    <span key={item} className="mission-stack-pill">
                      {item}
                    </span>
                  ))}
                </div>

                <ul className="mission-bullets mission-bullets-detail">
                  {current.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>

                <p className="mission-impact mt-5">IMPACT: {current.impact}</p>
              </div>
            </HudPanel>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Projects