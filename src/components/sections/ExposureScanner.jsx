import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import HudButton from '../ui/HudButton'
import HudPanel from '../ui/HudPanel'
import {
  calculateRiskScore,
  detectInstalledFonts,
  detectSocialSessions,
  detectWebRTCLeak,
  getAudioFingerprint,
  getBatteryInfo,
  getBrowserFingerprint,
  getCanvasFingerprint,
  getNetworkInfo,
  getPermissionsStatus,
  getWebGLFingerprint,
  scanLocalPorts,
} from '../../utils/exposureScanner'
import { initCanaryTraps } from '../../utils/canaryTraps'

const delay = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms))

const MODULES = [
  { key: 'browser', label: 'Browser Fingerprint' },
  { key: 'webrtc', label: 'WebRTC IP Leak Detection' },
  { key: 'canvasWebgl', label: 'Canvas & WebGL Fingerprint' },
  { key: 'audio', label: 'Audio Fingerprint' },
  { key: 'ports', label: 'Local Port Scan' },
  { key: 'social', label: 'Social Session Detection' },
  { key: 'system', label: 'System Info Collection' },
  { key: 'headers', label: 'Security Headers Analysis' },
]

function classifyRisk(score) {
  if (score >= 70) return { label: 'HIGH', color: '#ff4757' }
  if (score >= 40) return { label: 'MEDIUM', color: '#facc15' }
  return { label: 'LOW', color: '#00ff88' }
}

function benchmarkPercentile(score) {
  if (score <= 30) return 15
  if (score <= 50) return 40
  if (score <= 70) return 65
  return 85
}

function makeProgressBar(progress) {
  const width = 30
  const filled = Math.round((progress / 100) * width)
  return `[${'#'.repeat(filled)}${' '.repeat(width - filled)}] ${progress}%`
}

function asciiLine(index, label, status) {
  const left = `[${index + 1}/8] ${label}`
  const body = `${left} ${'.'.repeat(Math.max(2, 38 - left.length))} ${status}`
  return `║  ${body.padEnd(48, ' ')}║`
}

function terminalFrame(stepStates, progress, score) {
  const visible = stepStates.filter((step) => step.visible)
  const rows = [
    '╔══════════════════════════════════════════════════╗',
    '║  EXPOSURE SCANNER v2.0                           ║',
    '║  Target: YOUR BROWSER | Mode: PASSIVE RECON      ║',
    '╠══════════════════════════════════════════════════╣',
    ...visible.map((step, idx) => asciiLine(idx, step.label, step.status)),
    `║  ${makeProgressBar(progress).padEnd(48, ' ')}║`,
  ]

  if (score !== null) {
    rows.push(`║  ${`Scan complete. Risk score: ${score}/100`.padEnd(48, ' ')}║`)
  }

  rows.push('╚══════════════════════════════════════════════════╝')
  return rows
}

function securityHeadersScan() {
  const csp = document.head.querySelector('meta[http-equiv="Content-Security-Policy" i]')
  const referrer = document.head.querySelector('meta[name="referrer" i]')
  const frameAncestors = document.head.querySelector('meta[http-equiv="X-Frame-Options" i]')
  const isHttps = window.location.protocol === 'https:'

  return {
    https: isHttps,
    cspPresent: !!csp,
    referrerPolicy: !!referrer,
    frameProtection: !!frameAncestors,
    warnings: [
      !isHttps ? 'HTTPS is not active on this origin.' : null,
      !csp ? 'No CSP meta policy detected.' : null,
      !referrer ? 'No referrer policy meta detected.' : null,
      !frameAncestors ? 'No frame protection meta detected.' : null,
    ].filter(Boolean),
  }
}

function ExposureScanner() {
  const terminalRef = useRef(null)

  const [isScanning, setIsScanning] = useState(false)
  const [hasScanned, setHasScanned] = useState(false)
  const [progress, setProgress] = useState(0)
  const [animatedScore, setAnimatedScore] = useState(0)
  const [copied, setCopied] = useState(false)
  const [scanResults, setScanResults] = useState(null)
  const [expandedCards, setExpandedCards] = useState({})
  const [stepStates, setStepStates] = useState(() =>
    MODULES.map((step) => ({ ...step, status: 'PENDING', visible: false })),
  )

  useEffect(() => {
    if (!terminalRef.current) return
    terminalRef.current.scrollTop = terminalRef.current.scrollHeight
  }, [stepStates, progress, scanResults])

  useEffect(() => {
    if (!scanResults?.risk?.score) {
      setAnimatedScore(0)
      return
    }

    const target = scanResults.risk.score
    const started = performance.now()
    let frame = 0

    const tick = (time) => {
      const elapsed = Math.min((time - started) / 900, 1)
      const eased = 1 - (1 - elapsed) * (1 - elapsed)
      setAnimatedScore(Math.round(target * eased))
      if (elapsed < 1) {
        frame = requestAnimationFrame(tick)
      }
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [scanResults])

  const runScan = useCallback(async () => {
    if (isScanning) return

    setIsScanning(true)
    setHasScanned(false)
    setScanResults(null)
    setExpandedCards({})
    setCopied(false)
    setProgress(0)
    setAnimatedScore(0)
    setStepStates(MODULES.map((step) => ({ ...step, status: 'PENDING', visible: false })))

    const aggregate = {
      browser: null,
      webrtc: null,
      canvas: null,
      webgl: null,
      audio: null,
      ports: null,
      social: null,
      battery: null,
      network: null,
      permissions: null,
      fonts: null,
      security: null,
      canary: null,
    }

    const setStep = (index, status, visible = true) => {
      setStepStates((prev) =>
        prev.map((step, i) => (i === index ? { ...step, status, visible } : step)),
      )
    }

    const runModule = async (index, progressValue, fn) => {
      setStep(index, 'RUNNING')
      try {
        await fn()
        await delay(240)
        setStep(index, 'DONE')
      } catch (error) {
        await delay(240)
        setStep(index, 'ERROR')
        console.debug(`Exposure scanner module ${index + 1} failed`, error)
      } finally {
        setProgress(progressValue)
      }
    }

    try {
      // [1/8] Browser
      await runModule(0, 12, async () => {
        aggregate.browser = getBrowserFingerprint()
      })

      // [2/8] WebRTC
      await runModule(1, 25, async () => {
        aggregate.webrtc = await detectWebRTCLeak()
      })

      // [3/8] Canvas + WebGL
      await runModule(2, 38, async () => {
        aggregate.canvas = getCanvasFingerprint()
        aggregate.webgl = getWebGLFingerprint()
      })

      // [4/8] Audio
      await runModule(3, 50, async () => {
        aggregate.audio = await getAudioFingerprint()
      })

      // [5/8] Ports
      await runModule(4, 63, async () => {
        aggregate.ports = await scanLocalPorts()
      })

      // [6/8] Social
      await runModule(5, 75, async () => {
        aggregate.social = await detectSocialSessions()
      })

      // [7/8] System
      await runModule(6, 88, async () => {
        aggregate.battery = await getBatteryInfo()
        aggregate.network = getNetworkInfo()
        aggregate.permissions = await getPermissionsStatus()
        aggregate.fonts = detectInstalledFonts()
      })

      // [8/8] Security headers + canary trap init check
      await runModule(7, 100, async () => {
        aggregate.security = securityHeadersScan()
        const canary = initCanaryTraps()
        aggregate.canary = {
          active: true,
          trapCount: canary.getCount(),
        }
        canary.cleanup()
      })

      const riskInput = {
        webrtc: aggregate.webrtc,
        ports: aggregate.ports,
        social: aggregate.social,
        battery: aggregate.battery,
        permissions: aggregate.permissions,
        canvas: aggregate.canvas,
      }

      aggregate.risk = calculateRiskScore(riskInput)

      setScanResults(aggregate)
      setHasScanned(true)
    } catch (error) {
      console.debug('Exposure scan failed', error)
    } finally {
      setIsScanning(false)
    }
  }, [isScanning])

  const toggleCard = useCallback((key) => {
    setExpandedCards((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }, [])

  const riskScore = scanResults?.risk?.score ?? null

  const riskMeta = useMemo(() => classifyRisk(riskScore ?? 0), [riskScore])

  const progressBar = useMemo(() => makeProgressBar(progress), [progress])

  const benchmark = useMemo(() => {
    if (riskScore === null) return null
    return benchmarkPercentile(riskScore)
  }, [riskScore])

  const cards = useMemo(() => {
    if (!scanResults) return []

    const browser = scanResults.browser || {}
    const webrtc = scanResults.webrtc || { public: [], private: [] }
    const canvas = scanResults.canvas || {}
    const webgl = scanResults.webgl || {}
    const audio = scanResults.audio || {}
    const ports = scanResults.ports || { open: [] }
    const social = scanResults.social || { loggedIn: [] }
    const battery = scanResults.battery || {}
    const network = scanResults.network || {}
    const permissions = scanResults.permissions || {}
    const fonts = scanResults.fonts || {}
    const security = scanResults.security || {}

    const grantedPermissions = Object.entries(permissions).filter(([, state]) => state === 'granted')

    return [
      {
        key: 'browser',
        title: 'BROWSER FINGERPRINT',
        status: browser?.error ? 'warn' : 'safe',
        summary: `${browser.userAgent ? 'Detailed fingerprint surfaces' : 'Limited fingerprint data'} detected`,
        why: 'Fingerprint entropy can uniquely identify your browser across sessions.',
        protect: 'Use privacy-focused browsers and anti-fingerprinting protections.',
        details: [
          `UA: ${browser.userAgent || 'N/A'}`,
          `Platform: ${browser.platform || 'N/A'}`,
          `Language: ${browser.language || 'N/A'}`,
          `Screen: ${browser.screenResolution || 'N/A'}`,
          `Memory: ${browser.deviceMemory ? `${browser.deviceMemory} GB` : 'N/A'}`,
        ],
      },
      {
        key: 'webrtc',
        title: 'WEBRTC IP LEAK',
        status: (webrtc.public?.length || 0) + (webrtc.private?.length || 0) > 0 ? 'warn' : 'safe',
        summary: `${(webrtc.public?.length || 0) + (webrtc.private?.length || 0)} IP artifacts exposed`,
        why: 'WebRTC can reveal local/public IPs and deanonymize users.',
        protect: 'Disable WebRTC leak paths via browser settings or privacy extensions.',
        details: [
          `Public IPs: ${(webrtc.public || []).join(', ') || 'None detected'}`,
          `Private IPs: ${(webrtc.private || []).join(', ') || 'None detected'}`,
          (webrtc.public || []).length > 0 ? 'Warning: Public IP exposure detected.' : 'No public IP leakage detected.',
        ],
      },
      {
        key: 'canvas',
        title: 'CANVAS & WEBGL',
        status: canvas.hash || webgl.renderer ? 'warn' : 'safe',
        summary: `${canvas.hash ? 'Canvas hash generated' : 'Canvas hash unavailable'} | GPU ${webgl.renderer ? 'exposed' : 'hidden'}`,
        why: 'GPU + canvas signatures are stable identifiers for tracking.',
        protect: 'Limit WebGL exposure and prefer strict privacy modes.',
        details: [
          `Canvas Hash: ${canvas.hash || 'Unavailable'}`,
          `GPU Vendor: ${webgl.vendor || 'Unknown'}`,
          `GPU Renderer: ${webgl.renderer || 'Unknown'}`,
          `WebGL Version: ${webgl.version || 'Unknown'}`,
        ],
      },
      {
        key: 'audio',
        title: 'AUDIO FINGERPRINT',
        status: audio.hash ? 'warn' : 'safe',
        summary: `${audio.hash ? 'Audio signature detected' : 'No signature generated'}`,
        why: 'Audio processing differences create unique fingerprint entropy.',
        protect: 'Use anti-fingerprinting browsers and disable unnecessary audio APIs.',
        details: [
          `Audio Hash: ${audio.hash || 'Unavailable'}`,
          `Sample Rate: ${audio.sampleRate || 'Unknown'}`,
          `Channels: ${audio.channelCount || 'Unknown'}`,
        ],
      },
      {
        key: 'ports',
        title: 'OPEN PORTS',
        status: (ports.open || []).length > 0 ? 'warn' : 'safe',
        summary: `${(ports.open || []).length} local services responded`,
        why: 'Open local services can reveal tooling and increase attack surface.',
        protect: 'Close unused local services and bind dev tools to non-public interfaces.',
        details:
          (ports.open || []).length > 0
            ? ports.open.map((entry) => `Port ${entry.port} (${entry.service}) - ${entry.latency}ms`)
            : ['No open local services detected in scanned range.'],
      },
      {
        key: 'social',
        title: 'SOCIAL SESSIONS',
        status: (social.loggedIn || []).length > 0 ? 'warn' : 'safe',
        summary: `${(social.loggedIn || []).length} active sessions inferred`,
        why: 'Session inference can reveal where you are logged in.',
        protect: 'Use browser container profiles and clear cross-site session data regularly.',
        details:
          (social.loggedIn || []).length > 0
            ? [`Detected active sessions: ${social.loggedIn.join(', ')}`]
            : ['No active social sessions inferred.'],
      },
      {
        key: 'system',
        title: 'SYSTEM INFO',
        status: grantedPermissions.length > 0 || battery.supported ? 'warn' : 'safe',
        summary: `${grantedPermissions.length} granted permissions, ${fonts.count || 0} fonts mapped`,
        why: 'Permissions and hardware/network hints increase profiling confidence.',
        protect: 'Review browser permissions and disable unnecessary API access.',
        details: [
          `Battery API: ${battery.supported ? `Supported (${battery.level || 0}% ${battery.charging ? 'charging' : 'not charging'})` : 'Unsupported'}`,
          `Network: ${network.supported ? `${network.effectiveType || 'unknown'} / ${network.downlink || 'n/a'}Mbps` : 'Unsupported'}`,
          `Granted Permissions: ${grantedPermissions.map(([name]) => name).join(', ') || 'None'}`,
          `Font Profile: ${(fonts.profile || []).join(', ') || 'No profile inferred'}`,
          `Detected Fonts: ${fonts.count || 0}`,
        ],
      },
      {
        key: 'headers',
        title: 'SECURITY HEADERS',
        status: security.warnings?.length ? 'warn' : 'safe',
        summary: security.warnings?.length ? `${security.warnings.length} browser-side hardening gaps` : 'Basic hardening checks passed',
        why: 'Header policies reduce XSS, clickjacking, and mixed-content risks.',
        protect: 'Enforce HTTPS and deploy strict CSP/referrer/frame policies.',
        details: [
          `HTTPS: ${security.https ? 'Enabled' : 'Disabled'}`,
          `CSP Meta: ${security.cspPresent ? 'Present' : 'Missing'}`,
          `Referrer Policy Meta: ${security.referrerPolicy ? 'Present' : 'Missing'}`,
          `Frame Protection Meta: ${security.frameProtection ? 'Present' : 'Missing'}`,
          ...(security.warnings || []),
        ],
      },
    ]
  }, [scanResults])

  const reportText = useMemo(() => {
    if (!scanResults || riskScore === null) return ''
    const lines = [
      'EXPOSURE SCANNER REPORT v2.0',
      `Risk Score: ${riskScore}/100 (${riskMeta.label})`,
      `Benchmark: Higher than ${benchmarkPercentile(riskScore)}% of typical browsers`,
      '',
      'Contributing Factors:',
      ...(scanResults.risk?.details || []),
      '',
      'No data collected, stored, or transmitted.',
    ]
    return lines.join('\n')
  }, [scanResults, riskMeta.label, riskScore])

  const copyReport = useCallback(async () => {
    if (!reportText) return
    try {
      await navigator.clipboard.writeText(reportText)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }, [reportText])

  const terminalLines = useMemo(
    () => terminalFrame(stepStates, progress, riskScore),
    [stepStates, progress, riskScore],
  )

  return (
    <section id="exposure-scanner" className="scanner-section border-b border-[#00d4ff]/25 p-4 md:p-12 lg:p-20">
      <div className="mx-auto w-full max-w-6xl">
        <p className="section-label is-visible">&gt; RECON_MODULE</p>
        <header className="scanner-header">
          <h2 className="scanner-title font-heading text-3xl tracking-[0.08em] text-white md:text-5xl">EXPOSURE SCANNER</h2>
          <p className="scanner-subtitle font-mono text-xs tracking-[0.11em] text-[#b197fc] md:text-sm">
            Active offensive reconnaissance demonstration. Scan your browser&apos;s attack surface — no data leaves your device.
          </p>
          <p className="scanner-disclaimer font-mono text-[11px] tracking-[0.08em] text-white/70">
            All scans run locally in your browser. No data is collected, stored, or transmitted.
          </p>
        </header>

        <div className="scanner-action-wrap">
          <HudButton
            variant="blue"
            onClick={runScan}
            className={`scanner-init-button ${!isScanning ? 'scanner-pulse' : ''}`}
          >
            {isScanning ? 'SCANNING...' : 'INITIATE SCAN'}
          </HudButton>
        </div>

        <HudPanel className="scanner-terminal-shell" glowColor="accent-blue">
          <div ref={terminalRef} className="scanner-terminal" role="log" aria-live="polite">
            <pre className="scanner-terminal-pre">
              {terminalLines.map((line) => `${line}\n`).join('')}
            </pre>
            <div className="scanner-progress-row">
              <span className="scanner-progress-label">PROGRESS</span>
              <span className="scanner-progress-text">{progressBar}</span>
            </div>
          </div>
        </HudPanel>

        {hasScanned && scanResults ? (
          <div className="scanner-results-wrap">
            <HudPanel className="scanner-gauge-panel" glowColor="portal-green">
              <div className="scanner-gauge-layout">
                <div
                  className="scanner-risk-gauge"
                  style={{
                    '--scanner-gauge-value': `${animatedScore * 3.6}deg`,
                    '--scanner-gauge-color': riskMeta.color,
                  }}
                >
                  <div className="scanner-gauge-inner">
                    <span className="scanner-gauge-score">{animatedScore}</span>
                    <span className="scanner-gauge-label">RISK SCORE</span>
                  </div>
                </div>
                <div className="scanner-gauge-copy">
                  <h3 className="font-heading text-xl tracking-[0.06em] text-white md:text-2xl">Exposure Risk Gauge</h3>
                  <p className="font-mono text-xs tracking-[0.1em] text-white/80 md:text-sm">
                    Score bands: 0-39 safe, 40-69 caution, 70-100 high risk.
                  </p>
                  <p className="scanner-benchmark">
                    Your exposure score is {riskScore}/100 — higher than {benchmark}% of typical browsers.
                  </p>
                  <ul className="scanner-factors">
                    {(scanResults.risk?.details || []).map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                  <div className="scanner-actions">
                    <HudButton variant="blue" onClick={copyReport} className="scanner-secondary-btn">
                      {copied ? 'REPORT COPIED' : 'GENERATE REPORT'}
                    </HudButton>
                    <HudButton variant="green" onClick={runScan} className="scanner-secondary-btn">
                      SCAN AGAIN
                    </HudButton>
                  </div>
                </div>
              </div>
            </HudPanel>

            <div className="scanner-cards-grid">
              {cards.map((card) => {
                const expanded = !!expandedCards[card.key]
                const isWarn = card.status === 'warn'

                return (
                  <HudPanel
                    key={card.key}
                    className={`scanner-card ${expanded ? 'is-expanded' : ''}`}
                    glowColor={isWarn ? 'stark-gold' : 'portal-green'}
                  >
                    <button
                      type="button"
                      className="scanner-card-toggle"
                      onClick={() => toggleCard(card.key)}
                      aria-expanded={expanded}
                    >
                      <div className="scanner-card-head">
                        <span className="scanner-status-icon" aria-hidden="true">{isWarn ? '⚠' : '✓'}</span>
                        <h4 className="scanner-card-title">{card.title}</h4>
                      </div>
                      <div className="scanner-card-meta">
                        <span className="scanner-finding-count">{card.summary}</span>
                        <span className="scanner-tooltip" title={card.why}>
                          WHY THIS MATTERS
                        </span>
                      </div>
                    </button>

                    {expanded ? (
                      <div className="scanner-card-details">
                        {card.details.map((detail) => (
                          <p key={`${card.key}-${detail}`} className="scanner-detail-line">
                            {detail}
                          </p>
                        ))}
                        <p className="scanner-protect-tip">HOW TO PROTECT: {card.protect}</p>
                      </div>
                    ) : null}
                  </HudPanel>
                )
              })}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default ExposureScanner