import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

function useScrollAnimations(scopeRef, disabled = false) {
  useEffect(() => {
    if (disabled || !scopeRef?.current) {
      return undefined
    }

    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      const elements = gsap.utils.toArray('[data-animate]')

      elements.forEach((element) => {
        const animation = element.getAttribute('data-animate')

        if (animation === 'fadeInUp') {
          gsap.fromTo(
            element,
            { autoAlpha: 0, y: 40 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.55,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: element,
                start: 'top 84%',
                once: true,
              },
            },
          )
        }

        if (animation === 'fadeInLeft') {
          gsap.fromTo(
            element,
            { autoAlpha: 0, x: -42 },
            {
              autoAlpha: 1,
              x: 0,
              duration: 0.6,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: element,
                start: 'top 84%',
                once: true,
              },
            },
          )
        }

        if (animation === 'fadeInRight') {
          gsap.fromTo(
            element,
            { autoAlpha: 0, x: 42 },
            {
              autoAlpha: 1,
              x: 0,
              duration: 0.6,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: element,
                start: 'top 84%',
                once: true,
              },
            },
          )
        }

        if (animation === 'scaleIn') {
          gsap.fromTo(
            element,
            { autoAlpha: 0, scale: 0.8 },
            {
              autoAlpha: 1,
              scale: 1,
              duration: 0.55,
              ease: 'back.out(1.2)',
              scrollTrigger: {
                trigger: element,
                start: 'top 84%',
                once: true,
              },
            },
          )
        }

        if (animation === 'staggerChildren') {
          const targets = element.querySelectorAll('[data-stagger-item], > *')
          if (!targets.length) {
            return
          }

          gsap.fromTo(
            targets,
            { autoAlpha: 0, y: 22 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.45,
              stagger: 0.1,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: element,
                start: 'top 84%',
                once: true,
              },
            },
          )
        }
      })
    }, scopeRef)

    return () => ctx.revert()
  }, [disabled, scopeRef])
}

export default useScrollAnimations