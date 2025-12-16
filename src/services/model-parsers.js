/**
 * Parser and matcher registry
 *
 * Central registry mapping all retailer matchers and parsers for Excel, CSV, PDF AI,
 * and PDF non-AI formats. Exports grouped collections for parser factory selection.
 *
 * TODO: Import actual parser and matcher implementations when available.
 * This file provides the structure and placeholders for where models will be added.
 */

// TODO: Import no-match matchers and parsers
// import * as noMatchMatcher from './matchers/no-match/model1.js'
// import * as noMatchParser from './parsers/no-match/model1.js'

// TODO: Import retailer-specific matchers and parsers
// Example structure:
// import * as asdaMatcher from './matchers/asda/model1.js'
// import * as asdaParser from './parsers/asda/model1.js'
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
  // TODO: Add Excel parser implementations
  // Example:
  // ASDA1: {
  //   matches: (packingList, filename) => asdaMatcher.matches(packingList, filename),
  //   parse: (packingList, filename) => asdaParser.parse(packingList, filename)
  // },
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
  // TODO: Add CSV parser implementations
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
 * Uses text extraction without AI.
 */
const parsersPdfNonAi = {
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
