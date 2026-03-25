const STORAGE_KEY = 'recon_visitors'
const TRAP_KEY = 'recon_traps'

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function isQuotaExceeded(error) {
  if (!error) return false
  return (
    error.name === 'QuotaExceededError' ||
    error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    error.code === 22 ||
    error.code === 1014
  )
}

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

function sanitizeForStorage(value) {
  if (typeof value === 'function') return undefined

  if (Array.isArray(value)) {
    return value
      .map((item) => sanitizeForStorage(item))
      .filter((item) => typeof item !== 'undefined')
  }

  if (value && typeof value === 'object') {
    const out = {}
    Object.keys(value).forEach((key) => {
      const cleaned = sanitizeForStorage(value[key])
      if (typeof cleaned !== 'undefined') {
        out[key] = cleaned
      }
    })
    return out
  }

  return value
}

function getVisitors() {
  try {
    if (!canUseStorage()) return []
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = safeJsonParse(raw, [])
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveVisitors(visitors) {
  if (!Array.isArray(visitors)) return
  if (!canUseStorage()) return

  const queue = [...visitors]

  while (queue.length > 0) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(queue))
      return
    } catch (error) {
      if (!isQuotaExceeded(error)) {
        return
      }
      queue.shift()
    }
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
  } catch {
    // Ignore final storage failure.
  }
}

function getTraps() {
  try {
    if (!canUseStorage()) return []
    const raw = window.localStorage.getItem(TRAP_KEY)
    if (!raw) return []
    const parsed = safeJsonParse(raw, [])
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveTraps(traps) {
  try {
    if (!canUseStorage()) return
    window.localStorage.setItem(TRAP_KEY, JSON.stringify(Array.isArray(traps) ? traps : []))
  } catch {
    // Trap persistence should fail silently.
  }
}

export function saveVisitorScan(scanData) {
  try {
    const visitors = getVisitors()
    const nowIso = new Date().toISOString()

    const behaviorSnapshot =
      typeof scanData?.getBehavior === 'function'
        ? sanitizeForStorage(scanData.getBehavior())
        : typeof scanData?.behavior === 'function'
          ? sanitizeForStorage(scanData.behavior())
          : sanitizeForStorage(scanData?.behavior)

    const base = sanitizeForStorage(scanData || {}) || {}
    delete base.getBehavior

    const storable = {
      ...base,
      behavior: behaviorSnapshot,
    }

    const hash = storable.visitorHash
    const existingIndex = visitors.findIndex((v) => v?.visitorHash && v.visitorHash === hash)

    if (existingIndex >= 0) {
      const existing = visitors[existingIndex]
      const updated = {
        ...existing,
        ...storable,
        firstSeen: existing.firstSeen || existing.timestamp || nowIso,
        visitCount: (existing.visitCount || 0) + 1,
        lastSeen: nowIso,
      }
      visitors[existingIndex] = updated
      saveVisitors(visitors)
      return updated
    }

    const created = {
      ...storable,
      firstSeen: storable.timestamp || nowIso,
      lastSeen: nowIso,
      visitCount: 1,
    }

    visitors.push(created)
    saveVisitors(visitors)
    return created
  } catch {
    return sanitizeForStorage(scanData || {}) || {}
  }
}

export function saveTrapEvent(visitorHash, trapEntry) {
  try {
    const traps = getTraps()
    const entry = {
      visitorHash,
      ...(sanitizeForStorage(trapEntry || {}) || {}),
    }

    traps.push(entry)

    if (traps.length > 500) {
      traps.splice(0, traps.length - 500)
    }

    saveTraps(traps)
    return entry
  } catch {
    return {
      visitorHash,
      ...(sanitizeForStorage(trapEntry || {}) || {}),
    }
  }
}

export function getAllVisitors() {
  return getVisitors()
}

export function getAllTraps() {
  return getTraps()
}

export function getVisitorCount() {
  return getVisitors().length
}

export function updateVisitorBehavior(visitorHash, behaviorData) {
  try {
    const visitors = getVisitors()
    const idx = visitors.findIndex((v) => v?.visitorHash === visitorHash)
    if (idx === -1) return null

    const updated = {
      ...visitors[idx],
      behavior: sanitizeForStorage(behaviorData || {}) || {},
      lastSeen: new Date().toISOString(),
    }

    visitors[idx] = updated
    saveVisitors(visitors)
    return updated
  } catch {
    return null
  }
}

export function exportAllData() {
  const visitors = getVisitors()
  const traps = getTraps()

  return {
    visitors,
    traps,
    exportedAt: new Date().toISOString(),
    totalVisitors: visitors.length,
    totalTraps: traps.length,
  }
}

export function exportAsJSON() {
  try {
    if (typeof document === 'undefined' || typeof URL === 'undefined') {
      return null
    }

    const payload = exportAllData()
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    const datePart = new Date().toISOString().slice(0, 10)
    link.href = url
    link.download = `recon-data-${datePart}.json`
    link.style.display = 'none'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    return payload
  } catch {
    return null
  }
}

export function clearAllData() {
  try {
    if (!canUseStorage()) return
    window.localStorage.removeItem(STORAGE_KEY)
    window.localStorage.removeItem(TRAP_KEY)
  } catch {
    // Clearing data should fail silently.
  }
}
