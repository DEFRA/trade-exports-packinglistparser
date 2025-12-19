/**
 * Model Headers - Central Export
 *
 * This file exports all retailer header definitions.
 * Add new retailer headers here as they are implemented.
 */

import csvIcelandHeaders from './iceland.js'
import asdaHeaders from './asda.js'

export default {
  ...csvIcelandHeaders,
  ...asdaHeaders
}
