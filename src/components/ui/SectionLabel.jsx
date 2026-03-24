import { useEffect, useRef, useState } from 'react'

function SectionLabel({ text }) {
  const labelRef = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = labelRef.current
    if (!node) {
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true)
          }
        })
      },
      {
        threshold: 0.25,
      },
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [])

  return (
    <p
      ref={labelRef}
      data-animate="fadeInUp"
      className={`section-label ${visible ? 'is-visible' : ''}`}
      aria-label={`Section label ${text}`}
    >
      {`// ${text}`}
      <span className="section-label-cursor" aria-hidden="true">
        _
      </span>
    </p>
  )
}

export default SectionLabel