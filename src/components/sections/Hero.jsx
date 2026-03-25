import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import HudButton from '../ui/HudButton'
import HudPanel from '../ui/HudPanel'

const preheadlineText = '> SYSTEM ONLINE // DIMENSION C-137'
const HeroScene = lazy(() => import('../canvas/HeroScene'))

function Hero({ ready = true, reducedMotion = false }) {
  const [typedPreheadline, setTypedPreheadline] = useState('')
  const [scrolled, setScrolled] = useState(false)

  const blackScreenRef = useRef(null)
  const sceneLayerRef = useRef(null)
  const subtitleRef = useRef(null)
  const actionsRef = useRef(null)
  const badgeRef = useRef(null)
  const headlineWordRefs = useRef([])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!ready) {
      return undefined
    }

    const forceReveal = () => {
      if (blackScreenRef.current) {
        gsap.set(blackScreenRef.current, { autoAlpha: 0, pointerEvents: 'none' })
      }
    }

    // Failsafe so first-visit intro can never leave a black screen over content.
    const revealFallback = window.setTimeout(forceReveal, 2600)

    if (reducedMotion) {
      setTypedPreheadline(preheadlineText)
      gsap.set(sceneLayerRef.current, { autoAlpha: 1 })
      gsap.set(headlineWordRefs.current.filter(Boolean), { autoAlpha: 1, y: 0 })
      gsap.set([subtitleRef.current, actionsRef.current, badgeRef.current], { autoAlpha: 1, x: 0, y: 0 })
      forceReveal()
      return () => window.clearTimeout(revealFallback)
    }

    const words = headlineWordRefs.current.filter(Boolean)
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    gsap.set(sceneLayerRef.current, { autoAlpha: 0 })
    gsap.set(words, { y: 36, autoAlpha: 0 })
    gsap.set([subtitleRef.current, actionsRef.current], { y: 24, autoAlpha: 0 })
    gsap.set(badgeRef.current, { x: 50, autoAlpha: 0 })
    gsap.set(blackScreenRef.current, { autoAlpha: 1 })

    const typeState = { value: 0 }

    tl.to(blackScreenRef.current, { duration: 0.3, autoAlpha: 1 })
      .to(
        sceneLayerRef.current,
        {
          duration: 1.6,
          autoAlpha: 1,
        },
        'sceneIn',
      )
      .to(
        typeState,
        {
          value: preheadlineText.length,
          duration: 0.5,
          ease: 'none',
          onUpdate: () => {
            setTypedPreheadline(preheadlineText.slice(0, Math.floor(typeState.value)))
          },
        },
        'sceneIn',
      )
      .to(
        words,
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.35,
          stagger: 0.08,
        },
        'sceneIn+=0.5',
      )
      .to(
        subtitleRef.current,
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.3,
        },
        'sceneIn+=1.05',
      )
      .to(
        actionsRef.current,
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.3,
        },
        'sceneIn+=1.25',
      )
      .to(
        badgeRef.current,
        {
          x: 0,
          autoAlpha: 1,
          duration: 0.3,
        },
        'sceneIn+=1.35',
      )
      .to(
        blackScreenRef.current,
        {
          duration: 0.2,
          autoAlpha: 0,
          pointerEvents: 'none',
        },
        'sceneIn+=0.22',
      )

    tl.eventCallback('onComplete', forceReveal)

    return () => {
      window.clearTimeout(revealFallback)
      tl.kill()
    }
  }, [ready, reducedMotion])

  const scrollTo = (id) => {
    const target = document.getElementById(id)
    if (!target) {
      return
    }

    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const headlineWords = ['I', 'BUILD', 'THINGS', 'FOR', 'THE', 'FUTURE.']

  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pb-12 pt-20 md:px-12 md:pb-16 md:pt-24 lg:px-20"
      style={{
        background:
          'radial-gradient(circle at 50% 38%, rgba(123, 47, 190, 0.34), rgba(5, 5, 16, 0.95) 56%, rgba(3, 3, 10, 1) 100%)',
      }}
    >
      <div ref={sceneLayerRef} className="absolute inset-0 z-1 opacity-0 pointer-events-none">
        <Suspense fallback={<div className="h-full w-full" />}>
          <HeroScene className="h-full w-full" reducedMotion={reducedMotion} />
        </Suspense>
      </div>

      <div
        className="hero-content-layer relative z-20 mx-auto flex w-full max-w-6xl flex-col items-center text-center"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(5,5,16,0.85) 0%, rgba(5,5,16,0.5) 60%, transparent 100%)',
        }}
      >
        <p className="hero-typewriter font-mono text-xs tracking-[0.18em] text-portal-green md:text-sm">
          {typedPreheadline}
          <span className="hero-caret" aria-hidden="true">
            |
          </span>
        </p>

        <h1 className="mt-5 flex flex-wrap justify-center gap-x-2 gap-y-1 wrap-break-word px-1 font-heading text-[2rem] leading-[1.05] tracking-[0.08em] text-white drop-shadow-[0_0_16px_rgba(0,163,255,0.45)] sm:text-[2.5rem] md:text-[5rem]">
          {headlineWords.slice(0, 3).map((word, index) => (
            <span
              key={word}
              ref={(node) => {
                headlineWordRefs.current[index] = node
              }}
            >
              {word}
            </span>
          ))}
          <span className="w-full" aria-hidden="true" />
          {headlineWords.slice(3).map((word, index) => (
            <span
              key={word}
              ref={(node) => {
                headlineWordRefs.current[index + 3] = node
              }}
            >
              {word}
            </span>
          ))}
        </h1>

        <p
          ref={subtitleRef}
          data-animate="fadeInUp"
          className="mt-5 max-w-2xl text-sm leading-relaxed text-gray-300 sm:text-base md:text-[1.15rem]"
          style={{ textShadow: '0 0 20px rgba(5,5,16,0.8), 0 2px 4px rgba(0,0,0,0.5)' }}
        >
          Full-stack developer &amp; cybersecurity specialist building secure apps, web platforms
          &amp; intelligent systems. Research Intern at Bosch. Formerly EY &amp; CDAC.
        </p>

        <div
          ref={actionsRef}
          className="mt-8 flex w-full max-w-md flex-col gap-3 pointer-events-auto md:flex-row md:justify-center"
        >
          <HudButton variant="blue" onClick={() => scrollTo('projects')} className="w-full justify-center md:w-auto">
            EXPLORE MISSIONS
          </HudButton>
          <HudButton variant="green" onClick={() => scrollTo('contact')} className="w-full justify-center md:w-auto">
            INITIATE CONTACT
          </HudButton>
        </div>
      </div>

      <div ref={badgeRef} className="absolute right-4 top-24 z-20 md:right-8 md:top-28">
        <HudPanel className="min-w-55" glowColor="portal-green">
          <div className="flex items-center gap-2">
            <span className="hero-status-dot" aria-hidden="true" />
            <span className="font-mono text-[10px] tracking-[0.16em] text-portal-green md:text-xs">
              AVAILABLE FOR FREELANCE
            </span>
          </div>
        </HudPanel>
      </div>

      <button
        type="button"
        onClick={() => scrollTo('about')}
        className={`hero-scroll-indicator ${scrolled ? 'is-hidden' : ''}`}
      >
        SCROLL TO LAUNCH ▼
      </button>

      <div ref={blackScreenRef} className="pointer-events-none absolute inset-0 z-30 bg-black" />
    </section>
  )
}

export default Hero