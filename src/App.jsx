import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import Footer from './components/layout/Footer'
import Navbar from './components/layout/Navbar'
import Hero from './components/sections/Hero'
import PortalTransition from './components/ui/PortalTransition'
import CustomCursor from './components/ui/CustomCursor'
import LoadingScreen from './components/ui/LoadingScreen'
import useReducedMotion from './hooks/useReducedMotion'
import useScrollAnimations from './hooks/useScrollAnimations'
import useIsMobile from './hooks/useIsMobile'

const About = lazy(() => import('./components/sections/About'))
const Services = lazy(() => import('./components/sections/Services'))
const Projects = lazy(() => import('./components/sections/Projects'))
const ExposureScanner = lazy(() => import('./components/sections/ExposureScanner'))
const Experience = lazy(() => import('./components/sections/Experience'))
const Achievements = lazy(() => import('./components/sections/Achievements'))
const TechStack = lazy(() => import('./components/sections/TechStack'))
const Contact = lazy(() => import('./components/sections/Contact'))

const konamiKeys = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
]

function getVisitedFlag() {
  try {
    return sessionStorage.getItem('nk-portfolio-visited') === '1'
  } catch {
    return false
  }
}

function setVisitedFlag() {
  try {
    sessionStorage.setItem('nk-portfolio-visited', '1')
  } catch {
    // Ignore storage failures so startup never blocks rendering.
  }
}

function PortfolioContent() {
  const reducedMotion = useReducedMotion()
  const isMobile = useIsMobile(768)
  const mainRef = useRef(null)
  const [showLoading, setShowLoading] = useState(() => !getVisitedFlag())
  const [heroReady, setHeroReady] = useState(() => getVisitedFlag())
  const [konamiActive, setKonamiActive] = useState(false)
  const [konamiToast, setKonamiToast] = useState('')

  useScrollAnimations(mainRef, reducedMotion || showLoading)

  const completeLoading = () => {
    setVisitedFlag()
    setShowLoading(false)
    setHeroReady(true)
  }

  useEffect(() => {
    if (showLoading) {
      // Lock scroll and pin to top during loading sequence.
      document.body.style.overflow = 'hidden'
      window.scrollTo(0, 0)

      // Fallback so the app can never stay stuck behind the loading layer.
      const fallbackTimer = window.setTimeout(completeLoading, 4200)
      return () => window.clearTimeout(fallbackTimer)
    }

    // Loading just finished — unlock scroll and ensure we're at the top.
    document.body.style.overflow = ''
    window.scrollTo(0, 0)
    // Extra RAF to catch any layout-shift induced scroll.
    const rafId = requestAnimationFrame(() => window.scrollTo(0, 0))
    return () => cancelAnimationFrame(rafId)
  }, [showLoading])

  useEffect(() => {
    const pressed = []

    const handleKey = (event) => {
      pressed.push(event.key)
      if (pressed.length > konamiKeys.length) {
        pressed.shift()
      }

      const normalized = pressed.map((key) => key.toLowerCase())
      const target = konamiKeys.map((key) => key.toLowerCase())
      if (normalized.join('|') === target.join('|')) {
        setKonamiActive(true)
        setKonamiToast('Welcome to Dimension C-137, Morty!')

        window.setTimeout(() => setKonamiActive(false), 2000)
        window.setTimeout(() => setKonamiToast(''), 2800)
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  useEffect(() => {
    // Don't initialise Lenis while the loading screen is active — it can
    // hijack scroll position and push the viewport away from the top.
    if (reducedMotion || isMobile || showLoading) {
      return undefined
    }

    gsap.registerPlugin(ScrollTrigger)

    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
      smoothTouch: false,
    })

    let rafId = 0

    const raf = (time) => {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }

    lenis.on('scroll', ScrollTrigger.update)
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [isMobile, reducedMotion, showLoading])

  const portalToastClassName = useMemo(
    () => `konami-toast ${konamiToast ? 'is-visible' : ''}`,
    [konamiToast],
  )

  return (
    <div className="relative">
      {showLoading ? <LoadingScreen onComplete={completeLoading} /> : null}
      <CustomCursor />
      <div className="scanline-overlay pointer-events-none fixed inset-0 z-50 opacity-20" />
      <Navbar />

      <main ref={mainRef} className="relative z-10 pt-24">
        <Hero ready={heroReady} reducedMotion={reducedMotion} />
        <Suspense fallback={<div className="min-h-[20vh]" />}>
          <PortalTransition />
          <About />
          <PortalTransition />
          <Services />
          <PortalTransition />
          <Projects />
          <PortalTransition />
          <ExposureScanner />
          <Experience />
          <Achievements />
          <TechStack />
          <Contact />
        </Suspense>
      </main>

      <Footer />

      <div className={`konami-portal ${konamiActive ? 'is-active' : ''}`} aria-hidden="true" />
      <div className={portalToastClassName}>{konamiToast}</div>
    </div>
  )
}

function App() {
  return <PortfolioContent />
}

export default App
