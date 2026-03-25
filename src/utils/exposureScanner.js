const DEFAULT_TIMEOUT_MS = 5000

function toErrorObject(error, fallbackMessage) {
  return {
    error: true,
    message: error?.message || fallbackMessage,
  }
}

function hashString(input) {
  let hash = 0
  const str = String(input || '')
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return (hash >>> 0).toString(16)
}

function extractIpsFromCandidate(candidate) {
  const ips = []
  if (!candidate) return ips

  const ipv4Matches = candidate.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g) || []
  const ipv6Matches = candidate.match(/\b(?:[a-fA-F0-9]{0,4}:){2,}[a-fA-F0-9]{0,4}\b/g) || []

  ipv4Matches.forEach((ip) => ips.push(ip))
  ipv6Matches.forEach((ip) => ips.push(ip))

  return [...new Set(ips)]
}

function isPrivateIp(ip) {
  if (!ip) return false
  if (ip.includes(':')) return true
  if (ip.startsWith('10.')) return true
  if (ip.startsWith('192.168.')) return true

  if (ip.startsWith('172.')) {
    const secondOctet = Number(ip.split('.')[1])
    if (Number.isInteger(secondOctet) && secondOctet >= 16 && secondOctet <= 31) {
      return true
    }
  }

  return false
}

export function getBrowserFingerprint() {
  try {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return {
        userAgent: null,
        platform: null,
        language: null,
        languages: [],
        cookieEnabled: null,
        doNotTrack: null,
        timezone: null,
        timezoneOffset: null,
        screenResolution: null,
        screenAvailable: null,
        colorDepth: null,
        pixelDepth: null,
        deviceMemory: null,
        hardwareConcurrency: null,
        maxTouchPoints: null,
        vendor: null,
        appVersion: null,
        devicePixelRatio: null,
        innerSize: null,
        outerSize: null,
        online: null,
        pdfViewerEnabled: null,
      }
    }

    const tz = Intl?.DateTimeFormat?.().resolvedOptions?.().timeZone || null

    return {
      userAgent: navigator.userAgent || null,
      platform: navigator.platform || null,
      language: navigator.language || null,
      languages: Array.isArray(navigator.languages) ? navigator.languages : [],
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack || window.doNotTrack || null,
      timezone: tz,
      timezoneOffset: new Date().getTimezoneOffset(),
      screenResolution:
        typeof screen !== 'undefined' ? `${screen.width || 0}x${screen.height || 0}` : null,
      screenAvailable:
        typeof screen !== 'undefined'
          ? `${screen.availWidth || 0}x${screen.availHeight || 0}`
          : null,
      colorDepth: typeof screen !== 'undefined' ? screen.colorDepth : null,
      pixelDepth: typeof screen !== 'undefined' ? screen.pixelDepth : null,
      deviceMemory: navigator.deviceMemory ?? null,
      hardwareConcurrency: navigator.hardwareConcurrency ?? null,
      maxTouchPoints: navigator.maxTouchPoints ?? 0,
      vendor: navigator.vendor || null,
      appVersion: navigator.appVersion || null,
      devicePixelRatio: window.devicePixelRatio || 1,
      innerSize: `${window.innerWidth || 0}x${window.innerHeight || 0}`,
      outerSize: `${window.outerWidth || 0}x${window.outerHeight || 0}`,
      online: navigator.onLine,
      pdfViewerEnabled: navigator.pdfViewerEnabled ?? null,
    }
  } catch (error) {
    return toErrorObject(error, 'Failed to collect browser fingerprint')
  }
}

export function detectWebRTCLeak() {
  return new Promise((resolve) => {
    try {
      const PeerConnection =
        window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection

      if (!PeerConnection) {
        resolve({ public: [], private: [], unsupported: true })
        return
      }

      const ipSet = new Set()
      const result = { public: [], private: [] }

      const pc = new PeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      })

      const finalize = () => {
        try {
          pc.onicecandidate = null
          pc.close()
        } catch (closeError) {
          console.debug('WebRTC close error', closeError)
        }

        ipSet.forEach((ip) => {
          if (isPrivateIp(ip)) result.private.push(ip)
          else result.public.push(ip)
        })

        result.public = [...new Set(result.public)]
        result.private = [...new Set(result.private)]
        resolve(result)
      }

      const timeout = window.setTimeout(finalize, DEFAULT_TIMEOUT_MS)

      pc.onicecandidate = (event) => {
        const candidate = event?.candidate?.candidate
        if (candidate) {
          extractIpsFromCandidate(candidate).forEach((ip) => ipSet.add(ip))
        } else {
          clearTimeout(timeout)
          finalize()
        }
      }

      pc.createDataChannel('scan')
      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .catch((offerError) => {
          clearTimeout(timeout)
          resolve({ public: [], private: [], ...toErrorObject(offerError, 'WebRTC offer failed') })
        })
    } catch (error) {
      resolve({ public: [], private: [], ...toErrorObject(error, 'WebRTC detection failed') })
    }
  })
}

export function getCanvasFingerprint() {
  try {
    if (typeof document === 'undefined') {
      return { hash: null, length: 0 }
    }

    const canvas = document.createElement('canvas')
    canvas.width = 280
    canvas.height = 60
    canvas.style.display = 'none'

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return { hash: null, length: 0, unsupported: true }
    }

    ctx.fillStyle = '#FF8C00'
    ctx.fillRect(8, 8, 264, 44)

    ctx.textBaseline = 'top'
    ctx.font = '18px Arial'
    ctx.fillStyle = '#2266FF'
    ctx.fillText('Cwm fjordbank glyphs vext quiz', 12, 12)

    ctx.font = '16px "Times New Roman"'
    ctx.fillStyle = '#00BB66'
    ctx.fillText('Sphinx of black quartz, judge my vow', 14, 33)

    ctx.globalCompositeOperation = 'multiply'
    ctx.fillStyle = '#7A2FFF'
    ctx.beginPath()
    ctx.arc(228, 28, 18, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalCompositeOperation = 'source-over'

    const dataUrl = canvas.toDataURL()

    return {
      hash: hashString(dataUrl),
      length: dataUrl.length,
    }
  } catch (error) {
    return { hash: null, length: 0, ...toErrorObject(error, 'Canvas fingerprint failed') }
  }
}

export function getWebGLFingerprint() {
  try {
    if (typeof document === 'undefined') {
      return {
        vendor: null,
        renderer: null,
        version: null,
        shadingLanguageVersion: null,
        maxTextureSize: null,
        maxRenderbufferSize: null,
        extensions: 0,
      }
    }

    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

    if (!gl) {
      return {
        vendor: null,
        renderer: null,
        version: null,
        shadingLanguageVersion: null,
        maxTextureSize: null,
        maxRenderbufferSize: null,
        extensions: 0,
        unsupported: true,
      }
    }

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
    const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR)
    const renderer = debugInfo
      ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
      : gl.getParameter(gl.RENDERER)

    return {
      vendor: vendor || null,
      renderer: renderer || null,
      version: gl.getParameter(gl.VERSION) || null,
      shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION) || null,
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE) || null,
      maxRenderbufferSize: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE) || null,
      extensions: (gl.getSupportedExtensions() || []).length,
    }
  } catch (error) {
    return {
      vendor: null,
      renderer: null,
      version: null,
      shadingLanguageVersion: null,
      maxTextureSize: null,
      maxRenderbufferSize: null,
      extensions: 0,
      ...toErrorObject(error, 'WebGL fingerprint failed'),
    }
  }
}

export function getAudioFingerprint() {
  return new Promise((resolve) => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext
      if (!AudioContextClass) {
        resolve({ hash: null, sampleRate: null, channelCount: null, supported: false })
        return
      }

      const context = new AudioContextClass()
      const oscillator = context.createOscillator()
      const analyser = context.createAnalyser()
      const gainNode = context.createGain()
      const scriptProcessor = context.createScriptProcessor(4096, 1, 1)

      let resolved = false

      const cleanup = () => {
        try {
          scriptProcessor.disconnect()
          analyser.disconnect()
          oscillator.disconnect()
          gainNode.disconnect()
          context.close()
        } catch (cleanupError) {
          console.debug('Audio cleanup error', cleanupError)
        }
      }

      const finish = (data) => {
        if (resolved) return
        resolved = true
        cleanup()
        resolve(data)
      }

      const timeout = window.setTimeout(() => {
        finish({ hash: null, sampleRate: context.sampleRate, channelCount: 1, timeout: true })
      }, 1800)

      analyser.fftSize = 2048
      oscillator.type = 'triangle'
      oscillator.frequency.value = 10000
      gainNode.gain.value = 0

      oscillator.connect(analyser)
      analyser.connect(scriptProcessor)
      scriptProcessor.connect(gainNode)
      gainNode.connect(context.destination)

      scriptProcessor.onaudioprocess = () => {
        try {
          const frequencyData = new Float32Array(analyser.frequencyBinCount)
          analyser.getFloatFrequencyData(frequencyData)

          let sum = 0
          for (let i = 0; i < frequencyData.length; i += 1) {
            const value = frequencyData[i]
            if (Number.isFinite(value)) {
              sum += Math.abs(value)
            }
          }

          clearTimeout(timeout)
          finish({
            hash: hashString(String(sum)).substring(0, 16),
            sampleRate: context.sampleRate,
            channelCount: scriptProcessor.channelCount || 1,
          })
        } catch (processError) {
          clearTimeout(timeout)
          finish({ hash: null, sampleRate: context.sampleRate, channelCount: 1, ...toErrorObject(processError, 'Audio process failed') })
        }
      }

      oscillator.start(0)
    } catch (error) {
      resolve({ hash: null, sampleRate: null, channelCount: null, ...toErrorObject(error, 'Audio fingerprint failed') })
    }
  })
}

export function detectInstalledFonts() {
  try {
    if (typeof document === 'undefined') {
      return { detected: [], count: 0, profile: [] }
    }

    const testString = 'mmmmmmmmmmlli'
    const testSize = '72px'
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      return { detected: [], count: 0, profile: [], unsupported: true }
    }

    const baselineFont = 'monospace'
    ctx.font = `${testSize} ${baselineFont}`
    const baselineWidth = ctx.measureText(testString).width

    const fonts = [
      'Arial',
      'Helvetica',
      'Verdana',
      'Times New Roman',
      'Courier New',
      'Georgia',
      'Trebuchet MS',
      'Tahoma',
      'Palatino',
      'Garamond',
      'Bookman',
      'Comic Sans MS',
      'Impact',
      'San Francisco',
      'Helvetica Neue',
      'Menlo',
      'Monaco',
      'Futura',
      'Avenir',
      'Avenir Next',
      'Gill Sans',
      'Optima',
      'Segoe UI',
      'Consolas',
      'Calibri',
      'Cambria',
      'Candara',
      'Ubuntu',
      'DejaVu Sans',
      'Liberation Sans',
      'Noto Sans',
      'Myriad Pro',
      'Minion Pro',
      'Source Code Pro',
      'Source Sans Pro',
      'Fira Code',
      'JetBrains Mono',
      'Hack',
      'Cascadia Code',
      'Inconsolata',
      'Roboto',
      'Open Sans',
      'Poppins',
      'Inter',
      'Lato',
      'Montserrat',
      'Nunito',
      'Raleway',
      'PT Sans',
      'Droid Sans',
      'Lucida Grande',
      'Franklin Gothic Medium',
      'Baskerville',
    ]

    const detected = fonts.filter((fontName) => {
      ctx.font = `${testSize} "${fontName}", ${baselineFont}`
      const width = ctx.measureText(testString).width
      return width !== baselineWidth
    })

    const profile = []
    const creativeFonts = ['Myriad Pro', 'Minion Pro', 'Futura', 'Avenir', 'Helvetica Neue']
    const developerFonts = ['Fira Code', 'JetBrains Mono', 'Hack', 'Cascadia Code', 'Source Code Pro', 'Menlo', 'Monaco', 'Consolas']
    const macFonts = ['San Francisco', 'Helvetica Neue', 'Menlo', 'Monaco', 'Avenir', 'Lucida Grande']

    if (creativeFonts.some((font) => detected.includes(font))) profile.push('Creative Professional')
    if (developerFonts.some((font) => detected.includes(font))) profile.push('Developer')
    if (macFonts.some((font) => detected.includes(font))) profile.push('macOS User')

    return {
      detected,
      count: detected.length,
      profile,
    }
  } catch (error) {
    return { detected: [], count: 0, profile: [], ...toErrorObject(error, 'Font detection failed') }
  }
}

export function scanLocalPorts() {
  return new Promise((resolve) => {
    try {
      const ports = [
        { port: 22, service: 'SSH' },
        { port: 80, service: 'HTTP' },
        { port: 443, service: 'HTTPS' },
        { port: 3000, service: 'React/Node' },
        { port: 3306, service: 'MySQL' },
        { port: 4200, service: 'Angular' },
        { port: 5000, service: 'Flask' },
        { port: 5432, service: 'PostgreSQL' },
        { port: 5500, service: 'Live Server' },
        { port: 6379, service: 'Redis' },
        { port: 8000, service: 'Django' },
        { port: 8080, service: 'Tomcat' },
        { port: 8443, service: 'HTTPS Alt' },
        { port: 8888, service: 'Jupyter' },
        { port: 9200, service: 'Elasticsearch' },
        { port: 27017, service: 'MongoDB' },
      ]

      const probes = ports.map(({ port, service }) =>
        new Promise((probeResolve) => {
          const start = performance.now()
          const img = new Image()
          let done = false

          const finish = (status) => {
            if (done) return
            done = true
            probeResolve({
              port,
              service,
              status,
              latency: Math.round(performance.now() - start),
            })
          }

          const timeout = window.setTimeout(() => finish('closed'), 1500)

          img.onload = () => {
            clearTimeout(timeout)
            finish('open')
          }

          img.onerror = () => {
            clearTimeout(timeout)
            const elapsed = performance.now() - start
            finish(elapsed < 500 ? 'open' : 'closed')
          }

          img.src = `http://127.0.0.1:${port}/favicon.ico?t=${Date.now()}`
        }),
      )

      Promise.all(probes)
        .then((results) => {
          const open = results.filter((r) => r.status === 'open')
          const closed = results.filter((r) => r.status === 'closed').length

          resolve({
            scanned: ports.length,
            open: open.map((r) => ({ port: r.port, service: r.service, latency: r.latency })),
            closed,
            results,
          })
        })
        .catch((error) => {
          resolve({ scanned: ports.length, open: [], closed: ports.length, results: [], ...toErrorObject(error, 'Local port scan failed') })
        })
    } catch (error) {
      resolve({ scanned: 0, open: [], closed: 0, results: [], ...toErrorObject(error, 'Local port scan failed') })
    }
  })
}

export function detectSocialSessions() {
  return new Promise((resolve) => {
    try {
      const services = [
        { name: 'Google', url: 'https://accounts.google.com/favicon.ico' },
        { name: 'Facebook', url: 'https://www.facebook.com/favicon.ico' },
        { name: 'YouTube', url: 'https://www.youtube.com/favicon.ico' },
        { name: 'Twitter/X', url: 'https://x.com/favicon.ico' },
        { name: 'LinkedIn', url: 'https://www.linkedin.com/favicon.ico' },
        { name: 'GitHub', url: 'https://github.com/favicon.ico' },
        { name: 'Reddit', url: 'https://www.reddit.com/favicon.ico' },
        { name: 'Instagram', url: 'https://www.instagram.com/favicon.ico' },
      ]

      const checks = services.map((service) =>
        new Promise((checkResolve) => {
          const img = new Image()
          let settled = false

          const settle = (detected) => {
            if (settled) return
            settled = true
            checkResolve({
              name: service.name,
              detected,
            })
          }

          const timeout = window.setTimeout(() => settle(false), 3000)

          img.onload = () => {
            clearTimeout(timeout)
            settle(true)
          }

          img.onerror = () => {
            clearTimeout(timeout)
            settle(false)
          }

          img.src = `${service.url}?t=${Date.now()}`
        }),
      )

      Promise.all(checks)
        .then((results) => {
          resolve({
            services: results,
            loggedIn: results.filter((r) => r.detected).map((r) => r.name),
          })
        })
        .catch((error) => {
          resolve({ services: [], loggedIn: [], ...toErrorObject(error, 'Social session detection failed') })
        })
    } catch (error) {
      resolve({ services: [], loggedIn: [], ...toErrorObject(error, 'Social session detection failed') })
    }
  })
}

export async function getBatteryInfo() {
  try {
    if (!navigator?.getBattery) {
      return { supported: false }
    }

    const battery = await navigator.getBattery()
    return {
      supported: true,
      level: Math.round((battery.level || 0) * 100),
      charging: battery.charging,
      chargingTime: battery.chargingTime,
      dischargingTime: battery.dischargingTime,
    }
  } catch (error) {
    return { supported: false, ...toErrorObject(error, 'Battery info failed') }
  }
}

export function getNetworkInfo() {
  try {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
    if (!connection) {
      return { supported: false }
    }

    return {
      supported: true,
      effectiveType: connection.effectiveType || null,
      downlink: connection.downlink ?? null,
      rtt: connection.rtt ?? null,
      saveData: connection.saveData ?? null,
      type: connection.type || null,
    }
  } catch (error) {
    return { supported: false, ...toErrorObject(error, 'Network info failed') }
  }
}

export async function getPermissionsStatus() {
  try {
    const permissions = ['camera', 'microphone', 'geolocation', 'notifications', 'persistent-storage', 'midi']

    if (!navigator?.permissions?.query) {
      return permissions.reduce((acc, perm) => {
        acc[perm] = 'unsupported'
        return acc
      }, {})
    }

    const results = {}
    await Promise.all(
      permissions.map(async (name) => {
        try {
          if (name === 'notifications' && typeof Notification !== 'undefined') {
            results[name] = Notification.permission || 'prompt'
            return
          }

          const status = await navigator.permissions.query({ name })
          results[name] = status?.state || 'unsupported'
        } catch (queryError) {
          results[name] = 'unsupported'
          console.debug('Permission query failed', name, queryError)
        }
      }),
    )

    return results
  } catch (error) {
    return { error: true, message: error?.message || 'Permission checks failed' }
  }
}

export function startBehavioralTracking() {
  try {
    const startTime = Date.now()
    const state = {
      scrollDepthMax: 0,
      mouseMovements: 0,
      clicks: 0,
      keyPresses: 0,
      touchEvents: 0,
      tabSwitches: 0,
      idleTime: 0,
      lastActivityAt: Date.now(),
      lastIdleTickAt: Date.now(),
    }

    const markActive = () => {
      state.lastActivityAt = Date.now()
    }

    const onScroll = () => {
      try {
        const doc = document.documentElement
        const body = document.body
        const scrollTop = window.scrollY || doc.scrollTop || body.scrollTop || 0
        const scrollHeight = Math.max(
          body.scrollHeight,
          body.offsetHeight,
          doc.clientHeight,
          doc.scrollHeight,
          doc.offsetHeight,
        )
        const viewportHeight = window.innerHeight || doc.clientHeight || 1
        const maxScrollable = Math.max(scrollHeight - viewportHeight, 1)
        const depth = Math.min(100, Math.max(0, (scrollTop / maxScrollable) * 100))

        if (depth > state.scrollDepthMax) {
          state.scrollDepthMax = Number(depth.toFixed(2))
        }
        markActive()
      } catch (scrollError) {
        console.debug('Scroll tracking error', scrollError)
      }
    }

    const onMouseMove = () => {
      state.mouseMovements += 1
      markActive()
    }

    const onClick = () => {
      state.clicks += 1
      markActive()
    }

    const onKeyDown = () => {
      state.keyPresses += 1
      markActive()
    }

    const onTouchStart = () => {
      state.touchEvents += 1
      markActive()
    }

    const onVisibilityChange = () => {
      if (document.hidden) {
        state.tabSwitches += 1
      }
      markActive()
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('click', onClick, { passive: true })
    window.addEventListener('keydown', onKeyDown, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('visibilitychange', onVisibilityChange)

    const idleInterval = window.setInterval(() => {
      const now = Date.now()
      const inactiveFor = now - state.lastActivityAt
      if (inactiveFor > 5000) {
        const delta = now - state.lastIdleTickAt
        state.idleTime += delta
      }
      state.lastIdleTickAt = now
    }, 1000)

    return function getBehavioralSnapshot() {
      return {
        startTime,
        timeOnPage: Date.now() - startTime,
        scrollDepthMax: state.scrollDepthMax,
        mouseMovements: state.mouseMovements,
        clicks: state.clicks,
        keyPresses: state.keyPresses,
        touchEvents: state.touchEvents,
        tabSwitches: state.tabSwitches,
        idleTime: state.idleTime,
        stop: () => {
          try {
            window.removeEventListener('scroll', onScroll)
            window.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('click', onClick)
            window.removeEventListener('keydown', onKeyDown)
            window.removeEventListener('touchstart', onTouchStart)
            document.removeEventListener('visibilitychange', onVisibilityChange)
            clearInterval(idleInterval)
          } catch (cleanupError) {
            console.debug('Behavior cleanup error', cleanupError)
          }
        },
      }
    }
  } catch (error) {
    return function getBehavioralSnapshotError() {
      return { startTime: Date.now(), timeOnPage: 0, scrollDepthMax: 0, mouseMovements: 0, clicks: 0, keyPresses: 0, touchEvents: 0, tabSwitches: 0, idleTime: 0, ...toErrorObject(error, 'Behavior tracking failed') }
    }
  }
}

export function generateVisitorHash(fingerprint) {
  try {
    const payload = JSON.stringify(fingerprint || {})
    const hash = hashString(payload).toUpperCase().padStart(8, '0').slice(-8)
    return `V-${hash}`
  } catch (error) {
    return `V-ERROR${hashString(error?.message || '0').toUpperCase().slice(0, 3)}`
  }
}

export function calculateRiskScore(scan) {
  try {
    let total = 0
    const details = []

    const publicIps = scan?.webrtc?.public?.length || 0
    const privateIps = scan?.webrtc?.private?.length || 0
    const openPorts = scan?.ports?.open?.length || 0
    const socialSessions = scan?.social?.loggedIn?.length || 0

    if (publicIps > 0) {
      total += 25
      details.push('WebRTC public IP exposed (+25)')
    }

    if (privateIps > 0) {
      total += 15
      details.push('WebRTC private network IP exposed (+15)')
    }

    if (openPorts > 0) {
      const score = Math.min(openPorts * 10, 30)
      total += score
      details.push(`Local services detected on ${openPorts} port(s) (+${score})`)
    }

    if (socialSessions > 0) {
      const score = Math.min(socialSessions * 5, 15)
      total += score
      details.push(`Active social sessions detected (${socialSessions}) (+${score})`)
    }

    if (scan?.battery?.supported) {
      total += 5
      details.push('Battery API exposed (+5)')
    }

    const permissions = scan?.permissions || {}
    const grantedCount = Object.values(permissions).filter((state) => state === 'granted').length
    if (grantedCount > 0) {
      const score = grantedCount * 5
      total += score
      details.push(`Granted browser permissions: ${grantedCount} (+${score})`)
    }

    if (scan?.canvas?.hash) {
      total += 5
      details.push('Canvas fingerprint available (+5)')
    }

    return {
      score: Math.min(total, 100),
      details,
    }
  } catch (error) {
    return {
      score: 0,
      details: ['Risk scoring failed'],
      ...toErrorObject(error, 'Risk score failed'),
    }
  }
}

export async function runFullScan() {
  try {
    const browser = getBrowserFingerprint()
    const canvas = getCanvasFingerprint()
    const webgl = getWebGLFingerprint()
    const network = getNetworkInfo()

    const [webrtc, audio, battery, permissions, ports, social] = await Promise.all([
      detectWebRTCLeak(),
      getAudioFingerprint(),
      getBatteryInfo(),
      getPermissionsStatus(),
      scanLocalPorts(),
      detectSocialSessions(),
    ])

    const fonts = detectInstalledFonts()
    const behaviorTracker = startBehavioralTracking()

    const visitorHash = generateVisitorHash({
      ua: browser?.userAgent || null,
      canvas: canvas?.hash || null,
      renderer: webgl?.renderer || null,
      audio: audio?.hash || null,
    })

    const snapshot = {
      visitorHash,
      timestamp: new Date().toISOString(),
      browser,
      canvas,
      webgl,
      network,
      webrtc,
      audio,
      battery,
      permissions,
      ports,
      social,
      fonts,
      behavior: typeof behaviorTracker === 'function' ? behaviorTracker() : behaviorTracker,
    }

    const risk = calculateRiskScore(snapshot)

    return {
      ...snapshot,
      risk,
    }
  } catch (error) {
    return {
      ...toErrorObject(error, 'Full scan failed'),
      visitorHash: generateVisitorHash({ t: Date.now() }),
      timestamp: new Date().toISOString(),
    }
  }
}
