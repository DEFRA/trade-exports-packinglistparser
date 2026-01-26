/**
 * Parser and matcher registry
 *
 * Central registry mapping all retailer matchers and parsers for Excel, CSV, PDF AI,
 * and PDF non-AI formats. Exports grouped collections for parser factory selection.
 *
 * TODO: Import actual parser and matcher implementations when available.
 * This file provides the structure and placeholders for where models will be added.
 */

// Iceland CSV parsers
import { matches as matchesIceland2 } from './matchers/iceland/model2.js'
import { parse as parseIceland2 } from './parsers/iceland/model2.js'

// ASDA Excel parsers
import { matches as matchesAsda3 } from './matchers/asda/model3.js'
import { parse as parseAsda3 } from './parsers/asda/model3.js'

// Sainsburys Excel parsers
import { matches as matchesSainsburys1 } from './matchers/sainsburys/model1.js'
import { parse as parseSainsburys1 } from './parsers/sainsburys/model1.js'

// Giovanni PDF parsers
import { matches as matchesGiovanni3 } from './matchers/giovanni/model3.js'
import { parse as parseGiovanni3 } from './parsers/giovanni/model3.js'

// M&S PDF parsers
import { matches as matchesMands1 } from './matchers/mands/model1.js'
import { parse as parseMands1 } from './parsers/mands/model1.js'

// TJ Morris Excel parsers
import { matches as matchesTjmorris2 } from './matchers/tjmorris/model2.js'
import { parse as parseTjmorris2 } from './parsers/tjmorris/model2.js'

// No-match matchers and parsers
import {
  noRemosMatch,
  noRemosMatchCsv,
  noRemosMatchPdf
} from './matchers/no-match/model1.js'
import { noRemosParse, unrecognisedParse } from './parsers/no-match/model1.js'

// TODO: Import retailer-specific matchers and parsers
// Example structure:
// import * as coopMatcher from './matchers/co-op/model1.js'
// import * as coopParser from './parsers/co-op/model1.js'
// ... etc for all retailers

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
  SAINSBURYS1: {
    matches: matchesSainsburys1,
    parse: parseSainsburys1
  },
  TJMORRIS2: {
    matches: matchesTjmorris2,
    parse: parseTjmorris2
  }
  // TODO: Add Excel parser implementations
  // Example:
  // COOP1: {
  //   matches: (packingList, filename) => coopMatcher.matches(packingList, filename),
  //   parse: (packingList, filename) => coopParser.parse(packingList, filename)
  // }
}

/**
 * CSV parsers collection.
 * Maps parser model names to their matcher and parser implementations.
 */
const parsersCsv = {
  ICELAND2: {
    matches: matchesIceland2,
    parse: parseIceland2
  }
  // TODO: Add more CSV parser implementations
  // Example:
  // ASDA4: {
  //   matches: (packingList, filename) => asdaMatcher4.matches(packingList, filename),
  //   parse: (packingList, filename) => asdaParser4.parse(packingList, filename)
  // }
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
