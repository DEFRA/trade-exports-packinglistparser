import { config } from '../../config.js'
import ineligibleItemsData from '../data/data-ineligible-items.json' with { type: 'json' }
import { getIneligibleItemsCache } from '../cache/ineligible-items-cache.js'

const ineligibleIndexCache = {
  source: null,
  byCountry: new Map()
}

function getIneligibleData() {
  let ineligibleData = ineligibleItemsData

  const mdmIntegration = config.get('mdmIntegration')
  if (mdmIntegration?.enabled) {
    const cachedData = getIneligibleItemsCache()
    if (cachedData) {
      ineligibleData = Array.isArray(cachedData)
        ? cachedData
        : cachedData.ineligibleItems || ineligibleItemsData
    }
  }

  return ineligibleData
}

function buildIneligibleIndexByCountry(ineligibleData) {
  const byCountry = new Map()

  for (const item of ineligibleData) {
    if (typeof item?.country_of_origin !== 'string') {
      continue
    }

    const normalizedCountry = item.country_of_origin.toLowerCase().trim()
    if (normalizedCountry === '') {
      continue
    }

    if (!byCountry.has(normalizedCountry)) {
      byCountry.set(normalizedCountry, [])
    }

    byCountry.get(normalizedCountry).push(item)
  }

  return byCountry
}

function getIneligibleIndexByCountry() {
  const ineligibleData = getIneligibleData()

  if (ineligibleIndexCache.source !== ineligibleData) {
    ineligibleIndexCache.source = ineligibleData
    ineligibleIndexCache.byCountry =
      buildIneligibleIndexByCountry(ineligibleData)
  }

  return ineligibleIndexCache.byCountry
}

export { getIneligibleIndexByCountry }
