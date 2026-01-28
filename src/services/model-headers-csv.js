/**
 * CSV model headers registry
 *
 * Aggregates CSV-specific header configurations from individual retailer modules.
 * Used by CSV parsers to identify and extract field data.
 */
import { csvIcelandHeaders } from './model-headers/iceland.js'
import { csvAsdaHeaders } from './model-headers/asda.js'

const modelHeadersCsv = {
  ...csvIcelandHeaders,
  ...csvAsdaHeaders
}

export default modelHeadersCsv
