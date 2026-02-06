/**
 * Excel model headers registry
 *
 * Central registry combining all retailer-specific header configurations for Excel parsers.
 * Each retailer provides establishment number patterns and field mapping regex.
 */
import { asdaHeaders } from './model-headers/asda.js'
import { buffaloadHeaders } from './model-headers/buffaload.js'
import { bookerHeaders } from './model-headers/booker.js'
import { coopHeaders } from './model-headers/coop.js'
import { kepakHeaders } from './model-headers/kepak.js'
import { marsHeaders } from './model-headers/mars.js'
import { nisaHeaders } from './model-headers/nisa.js'
import { sainsburysHeaders } from './model-headers/sainsburys.js'
import { saversHeaders } from './model-headers/savers.js'
import { tescoHeaders } from './model-headers/tesco.js'
import { tjmorrisHeaders } from './model-headers/tjmorris.js'

const modelHeaders = {
  ...asdaHeaders,
  ...buffaloadHeaders,
  ...bookerHeaders,
  ...coopHeaders,
  ...kepakHeaders,
  ...marsHeaders,
  ...nisaHeaders,
  ...sainsburysHeaders,
  ...saversHeaders,
  ...tescoHeaders,
  ...tjmorrisHeaders
}

export default modelHeaders
