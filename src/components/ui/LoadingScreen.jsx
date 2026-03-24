import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import useReducedMotion from '../../hooks/useReducedMotion'

function LoadingScreen({ onComplete }) {
  const [step, setStep] = useState('T-3')
  const overlayRef = useRef(null)
  const contentRef = useRef(null)
  const leftPanelRef = useRef(null)
  const rightPanelRef = useRef(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) {
      const quick = window.setTimeout(onComplete, 120)
      return () => window.clearTimeout(quick)
    }

    const labels = ['T-3', 'T-2', 'T-1', 'LAUNCH']
    const timeline = gsap.timeline({
      defaults: { ease: 'power2.out' },
      onComplete,
    })

    timeline
      .set(overlayRef.current, { autoAlpha: 1 })
      .fromTo(contentRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.22 })

    labels.forEach((label, index) => {
      timeline
        .call(() => setStep(label))
        .fromTo('.loading-step', { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1, duration: 0.2 })
        .to('.loading-step', { autoAlpha: 0.55, duration: 0.2 })

      if (index === labels.length - 1) {
        timeline.to('.loading-flash', { autoAlpha: 1, duration: 0.08 }).to('.loading-flash', {
          autoAlpha: 0,
          duration: 0.2,
        })
      }
    })

    timeline
      .to(leftPanelRef.current, { xPercent: -100, duration: 0.42, ease: 'power3.inOut' })
      .to(rightPanelRef.current, { xPercent: 100, duration: 0.42, ease: 'power3.inOut' }, '<')
      .to(overlayRef.current, { autoAlpha: 0, duration: 0.2 })

    return () => timeline.kill()
  }, [onComplete, reducedMotion])

  return (
    <div ref={overlayRef} className="loading-overlay" role="status" aria-live="polite">
      <div className="loading-split loading-left" ref={leftPanelRef} />
      <div className="loading-split loading-right" ref={rightPanelRef} />
      <div className="loading-flash" />

      <div ref={contentRef} className="loading-content">
        <h1>NK</h1>
        <p className="loading-step">{step}</p>
      </div>
    </div>
  )
}

export default LoadingScreen