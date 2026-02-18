/**
 * Excel model headers registry
 *
 * Central registry combining all retailer-specific header configurations for Excel parsers.
 * Each retailer provides establishment number patterns and field mapping regex.
 */
import { asdaHeaders } from './model-headers/asda.js'
import { bandmHeaders } from './model-headers/bandm.js'
import { buffaloadHeaders } from './model-headers/buffaload.js'
import { bookerHeaders } from './model-headers/booker.js'
import { coopHeaders } from './model-headers/coop.js'
import { fowlerwelchHeaders } from './model-headers/fowlerwelch.js'
import { giovanniHeaders } from './model-headers/giovanni.js'
import { kepakHeaders } from './model-headers/kepak.js'
import { marsHeaders } from './model-headers/mars.js'
import { nisaHeaders } from './model-headers/nisa.js'
import { sainsburysHeaders } from './model-headers/sainsburys.js'
import { saversHeaders } from './model-headers/savers.js'
import { tescoHeaders } from './model-headers/tesco.js'
import { tjmorrisHeaders } from './model-headers/tjmorris.js'
import { turnersHeaders } from './model-headers/turners.js'
import { warrensHeaders } from './model-headers/warrens.js'

const modelHeaders = {
  ...asdaHeaders,
  ...bandmHeaders,
  ...buffaloadHeaders,
  ...bookerHeaders,
  ...coopHeaders,
  ...fowlerwelchHeaders,
  ...giovanniHeaders,
  ...kepakHeaders,
  ...marsHeaders,
  ...nisaHeaders,
  ...sainsburysHeaders,
  ...saversHeaders,
  ...tescoHeaders,
  ...tjmorrisHeaders,
  ...turnersHeaders,
  ...warrensHeaders
}

export default modelHeaders
