import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import HudButton from '../ui/HudButton'
import HudPanel from '../ui/HudPanel'
import ErrorBoundary from '../ui/ErrorBoundary'

const preheadlineText = '> SYSTEM ONLINE // DIMENSION C-137'
const HeroScene = lazy(() => import('../canvas/HeroScene'))

function Hero({ ready = true, reducedMotion = false }) {
  const [typedPreheadline, setTypedPreheadline] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [introPlayed, setIntroPlayed] = useState(false)

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

  // --- Entrance animation (runs once when ready becomes true) ---
  useEffect(() => {
    if (!ready || introPlayed) {
      return undefined
    }

    setIntroPlayed(true)
    setTypedPreheadline('') // reset before typing

    if (reducedMotion) {
      setTypedPreheadline(preheadlineText)
      return undefined
    }

    const words = headlineWordRefs.current.filter(Boolean)
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    // Animate elements from slightly offset to their natural position.
    gsap.set(words, { y: 30, opacity: 0 })
    gsap.set([subtitleRef.current, actionsRef.current], { y: 20, opacity: 0 })
    gsap.set(badgeRef.current, { x: 40, opacity: 0 })

    const typeState = { value: 0 }

    tl.to(
      typeState,
      {
        value: preheadlineText.length,
        duration: 0.6,
        ease: 'none',
        onUpdate: () => {
          setTypedPreheadline(preheadlineText.slice(0, Math.floor(typeState.value)))
        },
      },
      0,
    )
      .to(
        words,
        {
          y: 0,
          opacity: 1,
          duration: 0.4,
          stagger: 0.07,
        },
        0.1,
      )
      .to(
        subtitleRef.current,
        { y: 0, opacity: 1, duration: 0.35 },
        0.55,
      )
      .to(
        actionsRef.current,
        { y: 0, opacity: 1, duration: 0.35 },
        0.75,
      )
      .to(
        badgeRef.current,
        { x: 0, opacity: 1, duration: 0.35 },
        0.85,
      )

    return () => {
      tl.kill()
      // If killed early, force everything visible so content is never hidden.
      gsap.set(words, { clearProps: 'all' })
      gsap.set([subtitleRef.current, actionsRef.current, badgeRef.current], { clearProps: 'all' })
    }
  }, [ready, reducedMotion, introPlayed])

  const scrollTo = (id) => {
    const target = document.getElementById(id)
    if (!target) {
      return
    }

    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const headlineWords = ['I', 'BUILD', 'THINGS', 'FOR', 'THE', 'FUTURE.']

  // Show pre-headline text immediately if intro already played or ready hasn't triggered yet
  const displayPreheadline = introPlayed || !ready ? (typedPreheadline || preheadlineText) : typedPreheadline

  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pb-12 pt-20 md:px-12 md:pb-16 md:pt-24 lg:px-20"
      style={{
        background:
          'radial-gradient(circle at 50% 38%, rgba(123, 47, 190, 0.34), rgba(5, 5, 16, 0.95) 56%, rgba(3, 3, 10, 1) 100%)',
      }}
    >
      <div ref={sceneLayerRef} className="absolute inset-0 z-1 pointer-events-none">
        <ErrorBoundary fallback={<div className="h-full w-full" />}>
          <Suspense fallback={<div className="h-full w-full" />}>
            <HeroScene className="h-full w-full" reducedMotion={reducedMotion} />
          </Suspense>
        </ErrorBoundary>
      </div>

      <div
        className="hero-content-layer relative z-20 mx-auto flex w-full max-w-6xl flex-col items-center text-center"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(5,5,16,0.85) 0%, rgba(5,5,16,0.5) 60%, transparent 100%)',
        }}
      >
        <p className="hero-typewriter font-mono text-xs tracking-[0.18em] text-portal-green md:text-sm">
          {displayPreheadline}
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
    </section>
  )
}

export default Hero