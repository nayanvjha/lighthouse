import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import useReducedMotion from '../../hooks/useReducedMotion'

function PortalTransition() {
  const sectionRef = useRef(null)
  const portalRef = useRef(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) {
      return undefined
    }

    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      gsap.fromTo(
        portalRef.current,
        { scale: 0, autoAlpha: 0 },
        {
          scale: 1.5,
          autoAlpha: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        },
      )

      gsap.to(portalRef.current, {
        autoAlpha: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: '55% center',
          end: 'bottom top',
          scrub: true,
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <div ref={sectionRef} className={`portal-transition-zone ${reducedMotion ? 'is-reduced' : ''}`}>
      <div ref={portalRef} className="portal-transition-core" aria-hidden="true" />
    </div>
  )
}

export default PortalTransition