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

function App() {
  const reducedMotion = useReducedMotion()
  const isMobile = useIsMobile(768)
  const mainRef = useRef(null)
  const [showLoading, setShowLoading] = useState(() => !sessionStorage.getItem('nk-portfolio-visited'))
  const [heroReady, setHeroReady] = useState(() => sessionStorage.getItem('nk-portfolio-visited') === '1')
  const [konamiActive, setKonamiActive] = useState(false)
  const [konamiToast, setKonamiToast] = useState('')

  useScrollAnimations(mainRef, reducedMotion || showLoading)

  const completeLoading = () => {
    sessionStorage.setItem('nk-portfolio-visited', '1')
    setShowLoading(false)
    setHeroReady(true)
  }

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
    if (reducedMotion || isMobile) {
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
  }, [isMobile, reducedMotion])

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

export default App
