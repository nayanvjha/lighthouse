import { useEffect, useState } from 'react'
import styled, { keyframes } from 'styled-components'

const slideUp = keyframes`
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`

const Banner = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 24px;
  background: rgba(23, 23, 33, 0.97);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(133, 76, 230, 0.3);
  box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.5);
  animation: ${slideUp} 280ms ease-out;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
    padding: 14px 16px;
  }
`

const Message = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: rgba(242, 243, 244, 0.94);
`

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;

  @media (max-width: 640px) {
    width: 100%;
    justify-content: flex-end;
  }
`

const BaseButton = styled.button`
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 13px;
  line-height: 1;
  font-weight: 600;
  cursor: pointer;
  transition: transform 160ms ease, filter 160ms ease, border-color 160ms ease, color 160ms ease;

  &:hover {
    transform: scale(1.03);
  }
`

const DeclineButton = styled(BaseButton)`
  border: 1px solid rgba(242, 243, 244, 0.35);
  background: transparent;
  color: rgba(230, 231, 233, 0.88);

  &:hover {
    color: rgba(255, 255, 255, 0.98);
    border-color: rgba(242, 243, 244, 0.6);
    filter: brightness(1.1);
  }
`

const AcceptButton = styled(BaseButton)`
  border: none;
  background: linear-gradient(135deg, #854ce6 0%, #6f3bd5 100%);
  color: #ffffff;

  &:hover {
    filter: brightness(1.08);
  }
`

function ConsentBanner({ onConsent }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('analytics_consent')

      if (stored === 'true') {
        setVisible(false)
        if (typeof onConsent === 'function') onConsent(true)
        return
      }

      if (stored === 'false') {
        setVisible(false)
        if (typeof onConsent === 'function') onConsent(false)
        return
      }

      setVisible(true)
    } catch {
      setVisible(true)
    }
  }, [onConsent])

  const handleAccept = () => {
    try {
      window.localStorage.setItem('analytics_consent', 'true')
    } catch {
      // Ignore storage write failures and proceed with callback.
    }
    setVisible(false)
    if (typeof onConsent === 'function') onConsent(true)
  }

  const handleDecline = () => {
    try {
      window.localStorage.setItem('analytics_consent', 'false')
    } catch {
      // Ignore storage write failures and proceed with callback.
    }
    setVisible(false)
    if (typeof onConsent === 'function') onConsent(false)
  }

  if (!visible) return null

  return (
    <Banner role="dialog" aria-live="polite" aria-label="Cookie consent banner">
      <Message>
        We use cookies and analytics to enhance your browsing experience, serve personalized content, and analyze our
        traffic. By clicking 'Accept All', you consent to our use of cookies and analytics technologies.
      </Message>

      <Actions>
        <DeclineButton type="button" onClick={handleDecline}>
          Decline
        </DeclineButton>
        <AcceptButton type="button" onClick={handleAccept}>
          Accept All
        </AcceptButton>
      </Actions>
    </Banner>
  )
}

export default ConsentBanner
