/**
 * Excel model headers registry
 *
 * Central registry combining all retailer-specific header configurations for Excel parsers.
 * Each retailer provides establishment number patterns and field mapping regex.
 */
import { asdaHeaders } from './model-headers/asda.js'
import buffaloadHeaders from './model-headers/buffaload.js'
import { sainsburysHeaders } from './model-headers/sainsburys.js'
import { tescoHeaders } from './model-headers/tesco.js'

const headers = {
  ...asdaHeaders,
  ...buffaloadHeaders,
  ...sainsburysHeaders,
  ...tescoHeaders
}

export default headers
