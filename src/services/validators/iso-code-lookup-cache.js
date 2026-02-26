import isoCodesData from '../data/data-iso-codes.json' with { type: 'json' }
import { getIsoCodesCache } from '../cache/iso-codes-cache.js'

const isoCodeLookupCache = {
  source: null,
  normalizedSet: new Set()
}

function getIsoCodesData() {
  const cachedIsoCodes = getIsoCodesCache()
  return (Array.isArray(cachedIsoCodes) ? cachedIsoCodes : null) || isoCodesData
}

function buildNormalizedIsoCodeSet(isoCodes) {
  const normalizedSet = new Set()

  for (const isoCode of isoCodes) {
    if (typeof isoCode === 'string') {
      normalizedSet.add(isoCode.toLowerCase().trim())
    }
  }

  return normalizedSet
}

function getNormalizedIsoCodeSet() {
  const isoCodes = getIsoCodesData()

  if (isoCodeLookupCache.source !== isoCodes) {
    isoCodeLookupCache.source = isoCodes
    isoCodeLookupCache.normalizedSet = buildNormalizedIsoCodeSet(isoCodes)
  }

  return isoCodeLookupCache.normalizedSet
}

export { getNormalizedIsoCodeSet }
