/**
 * Excel model headers registry
 *
 * Central registry combining all retailer-specific header configurations for Excel parsers.
 * Each retailer provides establishment number patterns and field mapping regex.
 */
import { asdaHeaders } from './model-headers/asda.js'
import tjmorrisHeaders from './model-headers/tjmorris.js'

const headers = {
  ...asdaHeaders,
  ...tjmorrisHeaders
  // TODO: Add other Excel model headers as they are migrated
}

export default headers
