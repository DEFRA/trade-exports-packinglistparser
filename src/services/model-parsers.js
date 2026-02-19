/**
 * Parser and matcher registry
 *
 * Central registry mapping all retailer matchers and parsers for Excel, CSV, PDF AI,
 * and PDF non-AI formats. Exports grouped collections for parser factory selection.
 *
 * This file provides the structure and placeholders for where models will be added.
 */

// Iceland CSV parsers
import { matches as matchesIceland2 } from './matchers/iceland/model2.js'
import { parse as parseIceland2 } from './parsers/iceland/model2.js'

// ASDA CSV parsers
import { matches as matchesAsda4 } from './matchers/asda/model4.js'
import { parse as parseAsda4 } from './parsers/asda/model4.js'

// ASDA Excel parsers
import { matches as matchesAsda3 } from './matchers/asda/model3.js'
import { parse as parseAsda3 } from './parsers/asda/model3.js'

// B&M Excel parsers
import { matches as matchesBandm1 } from './matchers/bandm/model1.js'
import { parse as parseBandm1 } from './parsers/bandm/model1.js'

// Buffaload Logistics Excel parsers
import { matches as matchesBuffaload1 } from './matchers/buffaload-logistics/model1.js'
import { parse as parseBuffaload1 } from './parsers/buffaload-logistics/model1.js'

//  Booker Excel parsers
import { matches as matchesBooker2 } from './matchers/booker/model2.js'
import { parse as parseBooker2 } from './parsers/booker/model2.js'

// Boots Excel parsers
import { matches as matchesBoots1 } from './matchers/boots/model1.js'
import { parse as parseBoots1 } from './parsers/boots/model1.js'

// Co-op Excel parsers
import { matches as matchesCoop1 } from './matchers/coop/model1.js'
import { parse as parseCoop1 } from './parsers/coop/model1.js'

// Fowler-Welch Excel parsers
import { matches as matchesFowlerwelch2 } from './matchers/fowlerwelch/model2.js'
import { parse as parseFowlerwelch2 } from './parsers/fowlerwelch/model2.js'

// Warrens Excel parsers
import { matches as matchesWarrens2 } from './matchers/warrens/model2.js'
import { parse as parseWarrens2 } from './parsers/warrens/model2.js'

// Giovanni Excel parsers
import { matches as matchesGiovanni1 } from './matchers/giovanni/model1.js'
import { parse as parseGiovanni1 } from './parsers/giovanni/model1.js'

// Giovanni PDF parsers
import { matches as matchesGiovanni3 } from './matchers/giovanni/model3.js'
import { parse as parseGiovanni3 } from './parsers/giovanni/model3.js'

// Kepak Excel parsers
import { matches as matchesKepak1 } from './matchers/kepak/model1.js'
import { parse as parseKepak1 } from './parsers/kepak/model1.js'

// Nisa Excel parsers
import { matches as matchesNisa1 } from './matchers/nisa/model1.js'
import { parse as parseNisa1 } from './parsers/nisa/model1.js'
import { matches as matchesNisa2 } from './matchers/nisa/model2.js'
import { parse as parseNisa2 } from './parsers/nisa/model2.js'

// Sainsburys Excel parsers
import { matches as matchesSainsburys1 } from './matchers/sainsburys/model1.js'
import { parse as parseSainsburys1 } from './parsers/sainsburys/model1.js'

// Savers Excel parsers
import { matches as matchesSavers1 } from './matchers/savers/model1.js'
import { parse as parseSavers1 } from './parsers/savers/model1.js'

// Tesco Excel parsers
import { matches as matchesTesco2 } from './matchers/tesco/model2.js'
import { parse as parseTesco2 } from './parsers/tesco/model2.js'
import { matches as matchesTesco3 } from './matchers/tesco/model3.js'
import { parse as parseTesco3 } from './parsers/tesco/model3.js'

// M&S PDF parsers
import { matches as matchesMands1 } from './matchers/mands/model1.js'
import { parse as parseMands1 } from './parsers/mands/model1.js'

// Mars Excel parsers
import { matches as matchesMars1 } from './matchers/mars/model1.js'
import { parse as parseMars1 } from './parsers/mars/model1.js'

// TJ Morris Excel parsers
import { matches as matchesTjmorris2 } from './matchers/tjmorris/model2.js'
import { parse as parseTjmorris2 } from './parsers/tjmorris/model2.js'

// Turners Excel parsers
import { matches as matchesTurners1 } from './matchers/turners/model1.js'
import { parse as parseTurners1 } from './parsers/turners/model1.js'

// No-match matchers and parsers
import {
  noRemosMatch,
  noRemosMatchCsv,
  noRemosMatchPdf
} from './matchers/no-match/model1.js'
import { noRemosParse, unrecognisedParse } from './parsers/no-match/model1.js'

/**
 * Excel parsers collection.
 * Maps parser model names to their matcher and parser implementations.
 *
 * Structure:
 * {
 *   RETAILER1: {
 *     matches: (packingList, filename) => matcherResult,
 *     parse: (packingList, filename) => parsedData
 *   }
 * }
 */
const parsersExcel = {
  ASDA3: {
    matches: matchesAsda3,
    parse: parseAsda3
  },
  BANDM1: {
    matches: matchesBandm1,
    parse: parseBandm1
  },
  BUFFALOAD1: {
    matches: matchesBuffaload1,
    parse: parseBuffaload1
  },
  BOOKER2: {
    matches: matchesBooker2,
    parse: parseBooker2
  },
  BOOTS1: {
    matches: matchesBoots1,
    parse: parseBoots1
  },
  COOP1: {
    matches: matchesCoop1,
    parse: parseCoop1
  },
  FOWLERWELCH2: {
    matches: matchesFowlerwelch2,
    parse: parseFowlerwelch2
  },
  WARRENS2: {
    matches: matchesWarrens2,
    parse: parseWarrens2
  },
  GIOVANNI1: {
    matches: matchesGiovanni1,
    parse: parseGiovanni1
  },
  KEPAK1: {
    matches: matchesKepak1,
    parse: parseKepak1
  },
  MARS1: {
    matches: matchesMars1,
    parse: parseMars1
  },
  NISA1: {
    matches: matchesNisa1,
    parse: parseNisa1
  },
  NISA2: {
    matches: matchesNisa2,
    parse: parseNisa2
  },
  SAINSBURYS1: {
    matches: matchesSainsburys1,
    parse: parseSainsburys1
  },
  SAVERS1: {
    matches: matchesSavers1,
    parse: parseSavers1
  },
  TJMORRIS2: {
    matches: matchesTjmorris2,
    parse: parseTjmorris2
  },
  TURNERS1: {
    matches: matchesTurners1,
    parse: parseTurners1
  },
  TESCO2: {
    matches: matchesTesco2,
    parse: parseTesco2
  },
  TESCO3: {
    matches: matchesTesco3,
    parse: parseTesco3
  }
}

/**
 * CSV parsers collection.
 * Maps parser model names to their matcher and parser implementations.
 */
const parsersCsv = {
  ASDA4: {
    matches: matchesAsda4,
    parse: parseAsda4
  },
  ICELAND2: {
    matches: matchesIceland2,
    parse: parseIceland2
  }
}

/**
 * PDF non-AI parsers collection.
 * Uses coordinate-based text extraction without AI.
 */
const parsersPdfNonAi = {
  GIOVANNI3: {
    matches: matchesGiovanni3,
    parse: parseGiovanni3
  },
  MANDS1: {
    matches: matchesMands1,
    parse: parseMands1
  }
}

/**
 * No-match parsers for documents without REMOS or unrecognized formats.
 */
const missingRemosParserMessage = 'missing remos parser'

const noMatchParsers = {
  UNRECOGNISED: {
    parse: (_packingList, _filename) =>
      unrecognisedParse(_packingList, _filename),
    name: 'unrecognised parser'
  },
  NOREMOS: {
    matches: (packingList, _filename) => noRemosMatch(packingList, _filename),
    parse: (_packingList, _filename) => noRemosParse(_packingList, _filename),
    name: missingRemosParserMessage
  },
  NOREMOSCSV: {
    matches: (packingList) => noRemosMatchCsv(packingList),
    parse: () => noRemosParse(),
    name: missingRemosParserMessage
  },
  NOREMOSPDF: {
    matches: (packingList) => noRemosMatchPdf(packingList),
    parse: () => noRemosParse(),
    name: missingRemosParserMessage
  }
}

export { parsersExcel, parsersCsv, parsersPdfNonAi, noMatchParsers }
