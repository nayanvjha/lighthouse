import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SectionLabel from '../ui/SectionLabel'
import ServiceCard from '../ui/ServiceCard'
import { services } from '../../constants/data'

function Services() {
  const sectionRef = useRef(null)
  const headingRef = useRef(null)
  const underlineRef = useRef(null)
  const cardsRef = useRef(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      gsap.fromTo(
        headingRef.current,
        { autoAlpha: 0, y: 46 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: headingRef.current,
            start: 'top 78%',
            once: true,
          },
        },
      )

      gsap.fromTo(
        underlineRef.current,
        { scaleX: 0, transformOrigin: 'left' },
        {
          scaleX: 1,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: headingRef.current,
            start: 'top 78%',
            once: true,
          },
        },
      )

      gsap.fromTo(
        '.service-card-reveal',
        { autoAlpha: 0, y: 60, rotateX: 10 },
        {
          autoAlpha: 1,
          y: 0,
          rotateX: 0,
          duration: 0.72,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: cardsRef.current,
            start: 'top 82%',
            once: true,
          },
        },
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section id="services" ref={sectionRef} className="border-b border-accent-blue/25 p-4 md:p-12 lg:p-20">
      <div className="mx-auto w-full max-w-6xl">
        <SectionLabel text="SERVICES_DIVISION" />

        <div ref={headingRef} className="mb-10 opacity-0">
          <h2 data-animate="fadeInUp" className="font-heading text-3xl tracking-[0.08em] text-white md:text-5xl">
            WHAT I BUILD
          </h2>
          <p className="mt-3 font-mono text-xs tracking-[0.12em] text-portal-green md:text-sm">
            Security-first engineering for every project.
          </p>
          <span ref={underlineRef} className="services-underline" aria-hidden="true" />
        </div>

        <div
          ref={cardsRef}
          data-animate="staggerChildren"
          className="grid grid-cols-1 gap-6 md:auto-rows-fr md:grid-cols-2 xl:auto-rows-fr xl:grid-cols-4"
        >
          {services.map((service, index) => (
            <div key={service.title} className="service-card-reveal h-full opacity-0">
              <ServiceCard
                icon={service.icon}
                title={service.title}
                features={service.features}
                quote={service.quote}
                cta={service.cta}
                index={index}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Services