const FAVORITES_KEY = 'demo-favorite-products'
const VIEWED_KEY = 'demo-viewed-products'
const AI_RECOMMEND_KEY = 'demo-ai-recommended-products'

function safeParse(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback
  } catch (e) {
    return fallback
  }
}

function readIdArray(key) {
  const arr = safeParse(localStorage.getItem(key), [])
  if (!Array.isArray(arr)) return []
  return arr.map(v => Number(v)).filter(v => Number.isFinite(v))
}

function writeIdArray(key, ids) {
  const next = Array.from(new Set((ids || []).map(v => Number(v)).filter(v => Number.isFinite(v))))
  localStorage.setItem(key, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent('demo-product-prefs-changed', { detail: { key } }))
  return next
}

function toggleId(key, id) {
  const n = Number(id)
  if (!Number.isFinite(n)) return readIdArray(key)
  const list = readIdArray(key)
  const idx = list.indexOf(n)
  if (idx >= 0) list.splice(idx, 1)
  else list.unshift(n)
  return writeIdArray(key, list)
}

function addId(key, id) {
  const n = Number(id)
  if (!Number.isFinite(n)) return readIdArray(key)
  const list = readIdArray(key)
  if (!list.includes(n)) list.unshift(n)
  return writeIdArray(key, list)
}

function removeId(key, id) {
  const n = Number(id)
  if (!Number.isFinite(n)) return readIdArray(key)
  const list = readIdArray(key).filter(v => v !== n)
  return writeIdArray(key, list)
}

export function readFavorites() {
  return readIdArray(FAVORITES_KEY)
}

export function toggleFavorite(id) {
  return toggleId(FAVORITES_KEY, id)
}

export function readViewedProducts() {
  return readIdArray(VIEWED_KEY)
}

export function addViewedProduct(id) {
  return addId(VIEWED_KEY, id)
}

export function writeAiRecommendations(payload) {
  const obj = payload && typeof payload === 'object' ? payload : {}
  const ids = Array.from(new Set((obj.productIds || []).map(v => Number(v)).filter(v => Number.isFinite(v))))
  const next = {
    productIds: ids,
    time: Number(obj.time) || Date.now(),
    requirements: obj.requirements && typeof obj.requirements === 'object' ? obj.requirements : null
  }
  localStorage.setItem(AI_RECOMMEND_KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent('demo-product-prefs-changed', { detail: { key: AI_RECOMMEND_KEY } }))
  return next
}

export function readAiRecommendations() {
  const obj = safeParse(localStorage.getItem(AI_RECOMMEND_KEY), null)
  if (!obj || typeof obj !== 'object') return null
  const ids = Array.from(new Set((obj.productIds || []).map(v => Number(v)).filter(v => Number.isFinite(v))))
  return {
    productIds: ids,
    time: Number(obj.time) || 0,
    requirements: obj.requirements && typeof obj.requirements === 'object' ? obj.requirements : null
  }
}
