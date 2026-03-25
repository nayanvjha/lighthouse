let trapLog = []
let onTrapCallback = null
let cleanupFns = []

function logTrap(type, detail = {}) {
  try {
    const entry = {
      type,
      detail,
      timestamp: new Date().toISOString(),
      time: Date.now(),
    }

    trapLog.push(entry)

    if (typeof onTrapCallback === 'function') {
      onTrapCallback(entry)
    }
  } catch (error) {
    console.debug('Canary log failure', error)
  }
}

function addListener(target, eventName, handler, options) {
  if (!target?.addEventListener) return
  target.addEventListener(eventName, handler, options)
  cleanupFns.push(() => target.removeEventListener(eventName, handler, options))
}

function addInterval(callback, intervalMs) {
  const intervalId = window.setInterval(callback, intervalMs)
  cleanupFns.push(() => window.clearInterval(intervalId))
}

function setupDevToolsDetection() {
  try {
    let wasOpen = false

    const checkBySizeDiff = () => {
      const widthGap = Math.max(0, window.outerWidth - window.innerWidth)
      const heightGap = Math.max(0, window.outerHeight - window.innerHeight)
      const isOpen = widthGap > 160 || heightGap > 160

      if (isOpen && !wasOpen) {
        wasOpen = true
        logTrap('DEVTOOLS_OPENED', {
          method: 'size-diff',
          dimensions: {
            outerWidth: window.outerWidth,
            innerWidth: window.innerWidth,
            outerHeight: window.outerHeight,
            innerHeight: window.innerHeight,
            widthGap,
            heightGap,
          },
        })
      }

      if (!isOpen && wasOpen) {
        wasOpen = false
        logTrap('DEVTOOLS_CLOSED', {
          method: 'size-diff',
        })
      }
    }

    addInterval(checkBySizeDiff, 1000)

    const bait = new Image()
    Object.defineProperty(bait, 'id', {
      get() {
        logTrap('DEVTOOLS_OPENED', {
          method: 'console-getter',
        })
        return 'canary'
      },
    })

    addInterval(() => {
      try {
        console.log('%c', bait)
      } catch (error) {
        console.debug('Devtools console getter check failed', error)
      }
    }, 2000)
  } catch (error) {
    console.debug('DevTools detection setup failed', error)
  }
}

function setupContextMenuDetection() {
  addListener(document, 'contextmenu', (event) => {
    logTrap('RIGHT_CLICK', {
      x: event.clientX,
      y: event.clientY,
      target: event.target?.tagName || 'UNKNOWN',
    })
  })
}

function setupClipboardTrap() {
  addListener(document, 'copy', (event) => {
    try {
      const selection = String(window.getSelection?.() || '')
      const preview = selection.slice(0, 100)
      const timestamp = new Date().toISOString()
      const sourceUrl = window.location.href

      logTrap('CLIPBOARD_COPY', {
        textLength: selection.length,
        preview,
      })

      const watermark = `\n\n[Source: ${sourceUrl} | Copied at: ${timestamp}]`
      const payload = `${selection}${watermark}`

      if (event.clipboardData) {
        event.clipboardData.setData('text/plain', payload)
        event.preventDefault()
      }
    } catch (error) {
      console.debug('Clipboard trap failed', error)
    }
  })
}

function setupBasicDetectors() {
  try {
    setupDevToolsDetection()
    setupContextMenuDetection()
    setupClipboardTrap()

    addListener(document, 'keydown', (event) => {
      const key = (event.key || '').toLowerCase()
      const ctrlOrMeta = event.ctrlKey || event.metaKey
      const devToolsShortcut =
        key === 'f12' ||
        (ctrlOrMeta && event.shiftKey && ['i', 'j', 'c'].includes(key)) ||
        (ctrlOrMeta && key === 'u')

      if (devToolsShortcut) {
        logTrap('DEVTOOLS_OPENED', {
          method: 'keyboard-shortcut',
          key,
          ctrl: event.ctrlKey,
          meta: event.metaKey,
          shift: event.shiftKey,
        })
      }
    })

    addListener(window, 'beforeprint', () => {
      logTrap('PRINT_ATTEMPT', { source: 'beforeprint' })
    })

    addListener(window, 'blur', () => {
      logTrap('TAB_BLUR', {})
    })

    addListener(window, 'focus', () => {
      logTrap('TAB_FOCUS', {})
    })
  } catch (error) {
    console.debug('Canary setup failed', error)
  }
}

export function initCanaryTraps(callback) {
  onTrapCallback = callback || null
  trapLog = []

  cleanupFns.forEach((fn) => {
    try {
      fn()
    } catch (error) {
      console.debug('Canary cleanup failure', error)
    }
  })
  cleanupFns = []

  setupBasicDetectors()

  return {
    getLog: () => [...trapLog],
    getCount: () => trapLog.length,
    cleanup: () => {
      cleanupFns.forEach((fn) => {
        try {
          fn()
        } catch (error) {
          console.debug('Canary cleanup failure', error)
        }
      })
      cleanupFns = []
    },
  }
}

export function getTrapLog() {
  return [...trapLog]
}
