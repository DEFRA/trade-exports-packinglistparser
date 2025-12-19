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

// Giovanni PDF parsers
import { matches as matchesGiovanni3 } from './matchers/giovanni/model3.js'
import { parse as parseGiovanni3 } from './parsers/giovanni/model3.js'

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
 * PDF AI-based parsers collection.
 * Uses Document Intelligence for parsing.
 */
const parsersPdf = {
  // TODO: Add PDF AI parser implementations
  // Example:
  // MANDS1: {
  //   matches: (packingList, filename) => mandsMatcher.matches(packingList, filename),
  //   parse: (packingList, filename) => mandsParser.parse(packingList, filename)
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
  }
  // TODO: Add PDF non-AI parser implementations
  // Example:
  // BOOKER1: {
  //   matches: (packingList, filename) => bookerMatcher.matches(packingList, filename),
  //   parse: (packingList, filename) => bookerParser.parse(packingList, filename)
  // }
}

/**
 * No-match parsers for documents without REMOS or unrecognized formats.
 */
const noMatchParsers = {
  NOREMOS: {
    matches: (packingList, _filename) => {
      // TODO: Implement REMOS validation
      return false
    },
    parse: () => ({
      parserModel: 'NOREMOS',
      registration_approval_number: null,
      items: [],
      business_checks: {
        all_required_fields_present: false
      },
      establishment_numbers: []
    }),
    name: 'Missing REMOS'
  },
  NOREMOSCSV: {
    matches: (packingList) => {
      // TODO: Implement CSV REMOS validation
      return false
    },
    parse: () => ({
      parserModel: 'NOREMOSCSV',
      registration_approval_number: null,
      items: [],
      business_checks: {
        all_required_fields_present: false
      },
      establishment_numbers: []
    }),
    name: 'Missing REMOS CSV'
  },
  NOREMOSPDF: {
    matches: async (packingList) => {
      // TODO: Implement PDF REMOS validation
      return false
    },
    parse: () => ({
      parserModel: 'NOREMOSPDF',
      registration_approval_number: null,
      items: [],
      business_checks: {
        all_required_fields_present: false
      },
      establishment_numbers: []
    }),
    name: 'Missing REMOS PDF'
  },
  UNRECOGNISED: {
    matches: () => true,
    parse: () => ({
      parserModel: 'NOMATCH',
      registration_approval_number: null,
      items: [],
      business_checks: {
        all_required_fields_present: false
      },
      establishment_numbers: []
    }),
    name: 'Unrecognised format'
  }
}

export { parsersExcel, parsersCsv, parsersPdf, parsersPdfNonAi, noMatchParsers }
