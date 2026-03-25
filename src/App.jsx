import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Footer from './components/layout/Footer'
import Navbar from './components/layout/Navbar'
import Hero from './components/sections/Hero'
import PortalTransition from './components/ui/PortalTransition'
import CustomCursor from './components/ui/CustomCursor'
import LoadingScreen from './components/ui/LoadingScreen'
import ConsentBanner from './components/ConsentBanner'
import AdminDashboard from './components/AdminDashboard'
import useReducedMotion from './hooks/useReducedMotion'
import useScrollAnimations from './hooks/useScrollAnimations'
import useIsMobile from './hooks/useIsMobile'
import { runFullScan } from './utils/exposureScanner'
import { initCanaryTraps } from './utils/canaryTraps'
import { saveVisitorScan, saveTrapEvent, updateVisitorBehavior } from './utils/reconStore'

const About = lazy(() => import('./components/sections/About'))
const Services = lazy(() => import('./components/sections/Services'))
const Projects = lazy(() => import('./components/sections/Projects'))
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
  const scanDataRef = useRef(null)
  const behaviorIntervalRef = useRef(null)
  const [showLoading, setShowLoading] = useState(() => !getVisitedFlag())
  const [heroReady, setHeroReady] = useState(() => getVisitedFlag())
  const [konamiActive, setKonamiActive] = useState(false)
  const [konamiToast, setKonamiToast] = useState('')
  const [reconActive, setReconActive] = useState(false)

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

  const activateRecon = useCallback(
    async (consented) => {
      if (!consented || reconActive) {
        return
      }

      setReconActive(true)

      try {
        const scanResult = await runFullScan()
        scanDataRef.current = scanResult

        const savedScan = saveVisitorScan(scanResult)
        const visitorHash = savedScan?.visitorHash || scanResult?.visitorHash || null

        initCanaryTraps((trapEntry) => {
          try {
            if (visitorHash) {
              saveTrapEvent(visitorHash, trapEntry)
            }
          } catch (trapError) {
            console.debug('Trap save failed', trapError)
          }
        })

        if (behaviorIntervalRef.current) {
          window.clearInterval(behaviorIntervalRef.current)
        }

        behaviorIntervalRef.current = window.setInterval(() => {
          try {
            const currentScan = scanDataRef.current
            const behaviorData =
              typeof currentScan?.getBehavior === 'function'
                ? currentScan.getBehavior()
                : currentScan?.behavior || null

            if (visitorHash && behaviorData) {
              updateVisitorBehavior(visitorHash, behaviorData)
            }
          } catch (behaviorError) {
            console.debug('Behavior update failed', behaviorError)
          }
        }, 10000)
      } catch (error) {
        console.debug('Recon activation failed', error)
      }
    },
    [reconActive],
  )

  useEffect(
    () => () => {
      if (behaviorIntervalRef.current) {
        window.clearInterval(behaviorIntervalRef.current)
      }
    },
    [],
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
          <Experience />
          <Achievements />
          <TechStack />
          <Contact />
        </Suspense>
      </main>

      <Footer />

      <div className={`konami-portal ${konamiActive ? 'is-active' : ''}`} aria-hidden="true" />
      <div className={portalToastClassName}>{konamiToast}</div>
      <ConsentBanner onConsent={activateRecon} />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/*" element={<PortfolioContent />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
