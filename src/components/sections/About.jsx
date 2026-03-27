import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import HudPanel from '../ui/HudPanel'
import SectionLabel from '../ui/SectionLabel'
import StatReadout from '../ui/StatReadout'
import Badge from '../ui/Badge'
import { certifications, stats } from '../../constants/data'
import photo from '../../assets/nayan.jpeg'

const ArcReactor = lazy(() => import('../canvas/ArcReactor'))

function About() {
  const [statsStarted, setStatsStarted] = useState(false)
  const [typedIdLine, setTypedIdLine] = useState('')

  const sectionRef = useRef(null)
  const photoWrapRef = useRef(null)
  const photoImageRef = useRef(null)
  const photoScanlineRef = useRef(null)
  const readoutLine2Ref = useRef(null)
  const readoutLine3Ref = useRef(null)
  const reactorWrapRef = useRef(null)
  const contentWrapRef = useRef(null)
  const statsGridRef = useRef(null)
  const certsWrapRef = useRef(null)

  const idLine = 'IDENTIFIED: NAYAN KUMAR'

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      if (!reactorWrapRef.current || !contentWrapRef.current || !statsGridRef.current) {
        return
      }

      gsap.fromTo(
        reactorWrapRef.current,
        { autoAlpha: 0, scale: 0.8 },
        {
          autoAlpha: 1,
          scale: 1,
          duration: 0.75,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: reactorWrapRef.current,
            start: 'top 76%',
            once: true,
          },
        },
      )

      gsap.fromTo(
        contentWrapRef.current,
        { autoAlpha: 0, x: 48 },
        {
          autoAlpha: 1,
          x: 0,
          duration: 0.75,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: contentWrapRef.current,
            start: 'top 75%',
            once: true,
          },
        },
      )

      if (photoWrapRef.current && photoImageRef.current && photoScanlineRef.current) {
        gsap.set(photoImageRef.current, { autoAlpha: 0.08, scale: 0.92 })
        gsap.set([readoutLine2Ref.current, readoutLine3Ref.current], { autoAlpha: 0, y: 7 })
        gsap.set(photoScanlineRef.current, { autoAlpha: 0, yPercent: -120 })

        const photoTl = gsap.timeline({
          scrollTrigger: {
            trigger: photoWrapRef.current,
            start: 'top 80%',
            once: true,
          },
        })

        photoTl
          .fromTo(
            photoScanlineRef.current,
            { autoAlpha: 0, yPercent: -120 },
            { autoAlpha: 1, yPercent: 120, duration: 0.4, ease: 'none' },
            0.1,
          )
          .fromTo(
            photoImageRef.current,
            { autoAlpha: 0, scale: 0.92 },
            { autoAlpha: 1, scale: 1, duration: 0.18, ease: 'power2.out' },
            0.42,
          )
          .to(photoImageRef.current, { autoAlpha: 0.25, duration: 0.05 }, 0.62)
          .to(photoImageRef.current, { autoAlpha: 1, duration: 0.05 }, 0.67)
          .to(photoImageRef.current, { autoAlpha: 0.2, duration: 0.05 }, 0.72)
          .to(photoImageRef.current, { autoAlpha: 1, duration: 0.05 }, 0.77)
          .to(photoImageRef.current, { autoAlpha: 0.35, duration: 0.05 }, 0.82)
          .to(photoImageRef.current, { autoAlpha: 1, duration: 0.05 }, 0.87)
          .to(photoScanlineRef.current, { autoAlpha: 0, duration: 0.08 }, 0.88)
          .add(() => {
            setTypedIdLine('')
          }, 0.95)
          .to(
            { value: 0 },
            {
              value: idLine.length,
              duration: 0.5,
              ease: 'none',
              onUpdate: function onUpdate() {
                setTypedIdLine(idLine.slice(0, Math.floor(this.targets()[0].value)))
              },
            },
            0.95,
          )
          .fromTo(readoutLine2Ref.current, { autoAlpha: 0, y: 7 }, { autoAlpha: 1, y: 0, duration: 0.2 }, 1.26)
          .fromTo(readoutLine3Ref.current, { autoAlpha: 0, y: 7 }, { autoAlpha: 1, y: 0, duration: 0.2 }, 1.38)
      }

      gsap.fromTo(
        '.about-stat-card',
        { autoAlpha: 0, y: 20 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.12,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: statsGridRef.current,
            start: 'top 78%',
            once: true,
            onEnter: () => setStatsStarted(true),
          },
        },
      )

      gsap.fromTo(
        certsWrapRef.current,
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: certsWrapRef.current,
            start: 'top 85%',
            once: true,
          },
        },
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section id="about" ref={sectionRef} className="border-b border-[#00d4ff]/25 p-4 md:p-12 lg:p-20">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-5 lg:items-start lg:gap-8">
          <div ref={photoWrapRef} className="about-photo-col order-1 lg:col-span-2">
            <div className="about-photo-radar" aria-hidden="true">
              <span className="about-photo-radar-ring about-photo-radar-ring-1" />
              <span className="about-photo-radar-ring about-photo-radar-ring-2" />
              <span className="about-photo-radar-ring about-photo-radar-ring-3" />
            </div>

            <div className="about-photo-frame">
              <img ref={photoImageRef} src={photo} alt="Nayan Kumar" className="about-photo-image" />
              <span ref={photoScanlineRef} className="about-photo-scanline" aria-hidden="true" />
            </div>

            <div className="about-photo-readout">
              <p className="about-photo-readout-id">
                {typedIdLine}
                <span className="about-photo-readout-caret" aria-hidden="true">
                  |
                </span>
              </p>
              <p ref={readoutLine2Ref} className="about-photo-readout-status">
                STATUS: AVAILABLE <span className="about-photo-status-dot" aria-hidden="true" />
              </p>
              <p ref={readoutLine3Ref} className="about-photo-readout-clearance">
                CLEARANCE: LEVEL 5
              </p>
            </div>

            <div ref={reactorWrapRef} className="about-reactor-col order-3 mt-8 opacity-0 lg:order-0">
              <Suspense fallback={<div className="mx-auto h-57.5 w-57.5 md:h-75 md:w-75" />}>
                <ArcReactor />
              </Suspense>
            </div>
          </div>

          <div
            ref={contentWrapRef}
            className="about-content-col order-2 opacity-0 lg:col-span-3"
          >
            <SectionLabel text="ABOUT" />
            <h2 data-animate="fadeInUp" className="font-heading text-3xl tracking-[0.08em] text-white md:text-5xl">
              THE PILOT
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-gray-300 md:text-lg">
              I&apos;m Nayan — a builder who ships production systems with a security-first mindset.
              B.Tech CS with Cybersecurity Specialization at NFSU, Research Intern at Bosch, ex-EY,
              ex-CDAC. I&apos;ve built EV simulators handling 100+ concurrent connections, engineered
              post-quantum cryptography platforms for banking infrastructure, and won national
              hackathons and CTF championships. Every system I build is engineered for security from
              day one.
            </p>

            <HudPanel className="mt-5" glowColor="accent-blue">
              <p className="font-mono text-xs tracking-[0.12em] text-[#00d4ff] md:text-sm">
                Research Mentor: Prof. B. K. Panigrahi, Dean, IIT Delhi
              </p>
            </HudPanel>

            <div
              ref={statsGridRef}
              data-animate="staggerChildren"
              className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              {stats.map((stat, index) => (
                <div key={stat.label} className="about-stat-card opacity-0">
                  <StatReadout
                    label={stat.label}
                    value={stat.value}
                    description={stat.desc}
                    start={statsStarted}
                    delay={index * 120}
                  />
                </div>
              ))}
            </div>

            <div ref={certsWrapRef} className="mt-8 opacity-0">
              <div className="about-certs-row no-scrollbar">
                {certifications.map((item) => (
                  <Badge key={item} text={item === 'Blockchain Basics (UB)' ? 'Blockchain Basics' : item} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About