/**
 * CSV model headers registry
 *
 * Aggregates CSV-specific header configurations from individual retailer modules.
 * Used by CSV parsers to identify and extract field data.
 */
import { csvIcelandHeaders } from './model-headers/iceland.js'
import { csvAsdaHeaders } from './model-headers/asda.js'
import { saversHeadersCsv } from './model-headers/savers.js'

const modelHeadersCsv = {
  ...csvIcelandHeaders,
  ...csvAsdaHeaders,
  ...saversHeadersCsv
}

export default modelHeadersCsv
