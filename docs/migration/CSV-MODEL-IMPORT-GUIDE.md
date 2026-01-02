# CSV-Based Model Import Guide

## Overview

This guide provides step-by-step instructions for importing a specific CSV-based packing list parser model from the legacy `trade-exportscore-plp` repository into the new `trade-exports-packinglistparser` project structure.

**Reference Document:** [find-parser-to-use.md](./find-parser-to-use.md) describes the 5-step parser discovery process that all imported models must follow.

---

## ⚠️ CRITICAL: Legacy Data Structures Must Be Preserved

**This workspace uses the LEGACY data structures and logic from the original `trade-exportscore-plp` repository.**

When importing models, you MUST maintain:

1. **Legacy Return Structure** - Parser results must use:

   - `registration_approval_number` (NOT `establishmentNumber`)
   - `items` (NOT `packingListData`)
   - `business_checks.all_required_fields_present` (NOT `success`)
   - `parserModel` (NOT `model`)
   - `establishment_numbers` (NOT `establishments`)
   - Validation flags: `unitInHeader`, `validateCountryOfOrigin`, `blanketNirms`

2. **Legacy Helper Functions** - Use existing helpers as-is:

   - `src/services/parser-combine.js` - Returns legacy structure with all 8 fields
   - `src/services/parser-map.js` - Maps both required AND optional fields from headers
   - `src/services/matches-header.js` - Simple pattern matching without complex logic

3. **Legacy Header Structure** - Headers must follow exact pattern:
   - Required fields in `regex` object
   - Optional fields as direct properties with regex values
   - `required` and `optional` arrays listing field names
   - Validation flags at root level

**DO NOT** attempt to "modernize" or "simplify" these structures. The entire system depends on the legacy format for compatibility with downstream services.

---

## CSV vs Excel Differences

CSV packing lists differ from Excel in several important ways:

| Aspect                 | Excel                            | CSV                                  |
| ---------------------- | -------------------------------- | ------------------------------------ |
| **Structure**          | Multi-sheet workbook             | Single flat file                     |
| **Data Format**        | JSON object keyed by sheet names | Array of row arrays                  |
| **Header Location**    | Variable, requires row-finder    | Typically first row (index 0)        |
| **Model Headers File** | `model-headers/[retailer].js`    | `model-headers/[retailer].js` (same) |
| **REMOS Validator**    | `NOREMOS`                        | `NOREMOSCSV`                         |
| **Parser Registry**    | `parsersExcel` object            | `parsersCsv` object                  |
| **Data Row**           | `headerRow + 1`                  | Usually `1` (after index 0)          |

---

## Prerequisites

1. Access to the legacy repository: https://github.com/DEFRA/trade-exportscore-plp
2. Identify the specific retailer CSV model you want to import (e.g., LIDL1)
3. Know the model's parser identifier (e.g., `LIDL1`, `KEPAK2`)

---

## Migration Steps

### Step 1: Gather Source Files from Legacy Repository

For each CSV retailer model, you'll need to collect the following files from the legacy repo:

#### 1.1 Model Headers Configuration

**Old Location:** `app/services/model-headers-csv/[retailer].js` or `app/services/model-headers/[retailer].js`  
**Example:** `app/services/model-headers-csv/lidl.js`

This file contains:

- Establishment number regex patterns
- Header column regex mappings
- Optional field configurations
- Validation flags

**What to extract:**

```javascript
// Example CSV headers
LIDL1: {
  establishmentNumber: {
    regex: /^RMS-GB-000020-\d{3}$/i,
  },
  regex: {
    description: /^Description$/i,
    commodity_code: /^Commodity Code$/i,
    number_of_packages: /^Number of Packages$/i,
    total_net_weight_kg: /^Net Weight$/i,
    country_of_origin: /^Country of Origin$/i,
  },
  // CSV-specific: Often no optional fields
  validateCountryOfOrigin: true,
  findUnitInHeader: false,
}
```

#### 1.2 Matcher Implementation

**Old Location:** `app/services/matchers-csv/[retailer]/model[N].js` or `app/services/matchers/[retailer]/model[N].js`  
**Example:** `app/services/matchers-csv/lidl/model1.js`

This file implements the `matches()` function that:

- Checks for empty files
- Validates establishment number patterns
- Validates header structure (typically first row)

**What to extract:**

```javascript
function matches(packingList, filename) {
  try {
    if (!packingList || packingList.length === 0) {
      return matcherResult.EMPTY_FILE
    }

    // Check for correct establishment number
    if (!regex.test(headers.LIDL1.establishmentNumber.regex, packingList)) {
      return matcherResult.WRONG_ESTABLISHMENT_NUMBER
    }

    // Check header values (first row)
    const result = matchesHeader(
      Object.values(headers.LIDL1.regex),
      [packingList[0]] // CSV header is first row
    )

    if (result === matcherResult.CORRECT) {
      logger.logInfo(
        filenameForLogging,
        'matches()',
        `Packing list matches LIDL Model 1 with filename: ${filename}`
      )
    }

    return result
  } catch (err) {
    logger.logError(filenameForLogging, 'matches()', err)
    return matcherResult.GENERIC_ERROR
  }
}
```

**Key CSV-Specific Differences:**

- `packingList` is an array of rows, not an object with sheets
- Header check uses `packingList[0]` directly
- No sheet iteration needed
- Simpler structure overall

#### 1.3 Parser Implementation

**Old Location:** `app/services/parsers-csv/[retailer]/model[N].js` or `app/services/parsers/[retailer]/model[N].js`  
**Example:** `app/services/parsers-csv/lidl/model1.js`

This file implements the `parse()` function that:

- Finds establishment numbers
- Identifies header row (usually index 0)
- Extracts item data using mapParser
- Combines results

**What to extract:**

```javascript
function parse(packingListCsv) {
  try {
    if (!packingListCsv || packingListCsv.length === 0) {
      return combineParser.combine(null, [], false, parserModel.NOMATCH, [])
    }

    let packingListContents = []
    let establishmentNumbers = []

    // Find establishment number
    const establishmentNumber = regex.findMatch(
      headers.LIDL1.establishmentNumber.regex,
      packingListCsv
    )

    // Find all establishment numbers
    establishmentNumbers = regex.findAllMatches(
      regex.remosRegex,
      packingListCsv,
      establishmentNumbers
    )

    // CSV header is typically first row (index 0)
    const headerRow = 0
    const dataRow = 1

    // Map parser for CSV (no sheet name)
    packingListContents = mapParser(
      packingListCsv,
      headerRow,
      dataRow,
      headers.LIDL1,
      null // No sheet name for CSV
    )

    return combineParser.combine(
      establishmentNumber,
      packingListContents,
      true,
      parserModel.LIDL1,
      establishmentNumbers,
      headers.LIDL1
    )
  } catch (err) {
    logger.logError(filenameForLogging, 'parse()', err)
    return combineParser.combine(null, [], false, parserModel.NOMATCH, [])
  }
}
```

**Key CSV-Specific Differences:**

- No sheet iteration
- Header row is typically `0` (first row)
- Data row is typically `1` (second row)
- `mapParser` receives `null` for sheet name parameter
- Simpler overall structure

#### 1.4 Test Data (Optional but Recommended)

**Old Location:** `test/test-data-and-results/models-csv/[retailer]/model[N].js` or similar  
**Example:** `test/test-data-and-results/models-csv/lidl/model1.js`

Contains sample CSV data (as array of arrays) for testing:

```javascript
export default {
  validModel: [
    [
      'Description',
      'Commodity Code',
      'Number of Packages',
      'Net Weight',
      'Country of Origin'
    ],
    ['Beef Products', '0201100000', '10', '250.5', 'GB'],
    ['Pork Products', '0203190000', '5', '120.0', 'IE']
  ]
}
```

#### 1.5 Expected Test Results (Optional but Recommended)

**Old Location:** `test/test-data-and-results/results-csv/[retailer]/model[N].js` or similar  
**Example:** `test/test-data-and-results/results-csv/lidl/model1.js`

Contains expected parser output for validation.

---

### Step 2: Create Model Headers in New Project

**New Location:** `src/services/model-headers/[retailer].js`

#### 2.1 Create Retailer Headers File

If the retailer doesn't exist yet, create a new file:

```bash
touch src/services/model-headers/lidl.js
```

#### 2.2 Adapt Header Configuration

Transform the old format to match the new project's structure:

```javascript
/**
 * LIDL CSV model headers
 *
 * Provides establishment number regexes and header regex mappings
 * for LIDL CSV packing list variants used by matchers.
 */

const lidlHeaders = {
  LIDL1: {
    establishmentNumber: {
      regex: /^RMS-GB-000020-\d{3}$/i
    },
    regex: {
      description: /^Description$/i,
      commodity_code: /^Commodity Code$/i,
      number_of_packages: /^Number of Packages$/i,
      total_net_weight_kg: /^Net Weight$/i,
      country_of_origin: /^Country of Origin$/i
    },
    // List required fields
    required: [
      'description',
      'commodity_code',
      'number_of_packages',
      'total_net_weight_kg',
      'country_of_origin'
    ],
    // Optional fields (if any)
    optional: [],
    // Validation flags
    validateCountryOfOrigin: true,
    findUnitInHeader: false,
    // CSV-specific flags
    invalidSheets: [], // Not used for CSV but kept for consistency
    deprecated: false
  }
}

export default lidlHeaders
```

**Key Changes:**

- Use ES6 **named exports** (`export { csvRetailerHeaders }`) instead of `module.exports`
- **PRESERVE the exact same structure and regex patterns from legacy**
- Add `required` and `optional` arrays
- Document any CSV-specific quirks in comments

**CSV Header Patterns:**

- CSV headers are often more strict (exact matches)
- Less variation between files
- Typically all required fields, fewer optional fields

#### 2.3 Export Headers in CSV Registry

Update `src/services/model-headers-csv.js` (NOT index.js!):

```javascript
// Import the new retailer's CSV headers (named import)
import { csvLidlHeaders } from './model-headers/lidl.js'

const headers = {
  // Existing CSV retailers...
  ...csvIcelandHeaders,
  ...csvAsdaHeaders,
  ...csvLidlHeaders // Add new retailer
}

export default headers
```

**Important:** This file aggregates **CSV-only** headers. Excel headers go in `model-headers.js`, PDF headers in `model-headers-pdf.js`.

---

### Step 3: Create Matcher Implementation

**New Location:** `src/services/matchers/[retailer]/model[N].js`

#### 3.1 Create Directory Structure

```bash
mkdir -p src/services/matchers/lidl
touch src/services/matchers/lidl/model1.js
```

#### 3.2 Implement Matcher

Adapt the matcher from the legacy repo:

```javascript
/**
 * LIDL Model 1 CSV matcher
 *
 * Detects whether a provided CSV-converted packing list matches
 * the LIDL Model 1 format by checking the establishment number and
 * header row patterns.
 */
import { createLogger } from '../../../common/helpers/logging/logger.js'
import matcherResult from '../../matcher-result.js'
import { matchesHeader } from '../../matches-header.js'
import * as regex from '../../../utilities/regex.js'
import headers from '../../model-headers-csv.js' // CSV headers registry

const logger = createLogger()

/**
 * Check whether the provided CSV packing list matches LIDL Model 1.
 * @param {Array<Array>} packingList - CSV data as array of row arrays
 * @param {string} filename - Source filename for logging
 * @returns {string} - One of matcherResult codes
 */
export function matches(packingList, filename) {
  try {
    // Check for empty file
    if (!packingList || packingList.length === 0) {
      return matcherResult.EMPTY_FILE
    }

    // Check for correct establishment number
    if (!regex.test(headers.LIDL1.establishmentNumber.regex, packingList)) {
      return matcherResult.WRONG_ESTABLISHMENT_NUMBER
    }

    // Check header values (first row)
    const result = matchesHeader(
      Object.values(headers.LIDL1.regex),
      [packingList[0]] // CSV header is first row
    )

    if (result === matcherResult.CORRECT) {
      logger.info({ filename }, 'Packing list matches LIDL Model 1')
    }

    return result
  } catch (err) {
    logger.error(
      {
        filename,
        error: {
          message: err.message,
          stack_trace: err.stack
        }
      },
      'Error in matches()'
    )
    return matcherResult.GENERIC_ERROR
  }
}
```

**Key CSV-Specific Changes:**

- Parameter is `Array<Array>` not `Object` with sheets
- Check `packingList.length === 0` for empty file
- Use `packingList[0]` directly for header row
- No sheet iteration needed
- Simpler overall structure

---

### Step 4: Create Parser Implementation

**New Location:** `src/services/parsers/[retailer]/model[N].js`

#### 4.1 Create Directory Structure

```bash
mkdir -p src/services/parsers/lidl
touch src/services/parsers/lidl/model1.js
```

#### 4.2 Implement Parser

Adapt the parser from the legacy repo:

```javascript
/**
 * LIDL CSV parser - Model 1
 * @module parsers/lidl/model1
 */
import { createLogger } from '../../../common/helpers/logging/logger.js'
import combineParser from '../../parser-combine.js'
import parserModel from '../../parser-model.js'
import headers from '../../model-headers-csv.js' // CSV headers registry
import { mapParser } from '../../parser-map.js'
import * as regex from '../../../utilities/regex.js'

const logger = createLogger()

/**
 * Parse the provided CSV packing list for LIDL model 1.
 * @param {Array<Array>} packingListCsv - CSV data as array of row arrays
 * @returns {Object} Combined parser result.
 */
export function parse(packingListCsv) {
  try {
    // Validate input
    if (!packingListCsv || packingListCsv.length === 0) {
      return combineParser.combine(null, [], false, parserModel.NOMATCH, [])
    }

    let packingListContents = []
    let establishmentNumbers = []

    // Find primary establishment number
    const establishmentNumber = regex.findMatch(
      headers.LIDL1.establishmentNumber.regex,
      packingListCsv
    )

    // Find all establishment numbers
    establishmentNumbers = regex.findAllMatches(
      regex.remosRegex,
      packingListCsv,
      establishmentNumbers
    )

    // CSV header is typically first row (index 0)
    const headerRow = 0
    const dataRow = 1

    // Map parser for CSV (no sheet name)
    packingListContents = mapParser(
      packingListCsv,
      headerRow,
      dataRow,
      headers.LIDL1,
      null // No sheet name for CSV
    )

    // CRITICAL: Include headers parameter (6th parameter) for validation
    return combineParser.combine(
      establishmentNumber,
      packingListContents,
      true,
      parserModel.LIDL1,
      establishmentNumbers,
      headers.LIDL1 // Required for Country of Origin validation
    )
  } catch (err) {
    logger.error(
      {
        error: {
          message: err.message,
          stack_trace: err.stack
        }
      },
      'Error in parse()'
    )
    return combineParser.combine(null, [], false, parserModel.NOMATCH, [])
  }
}
```

**Key CSV-Specific Changes:**

- Parameter is `Array<Array>` not `Object` with sheets
- No sheet iteration
- Header row is typically `0` (first row)
- Data row is typically `1` (second row)
- `mapParser` receives `null` for sheet name (5th parameter)
- **CRITICAL:** Still pass headers as 6th parameter to `combineParser.combine()`

**CSV-Specific Edge Cases:**

Some CSV models may need to:

1. **Find header row dynamically** - If header isn't always first row:

```javascript
import { rowFinder } from '../../../utilities/row-finder.js'
import { matchesHeader } from '../../matchers/matches-header.js'
import MatcherResult from '../../matcher-result.js'

const headerTitles = Object.values(headers.LIDL1.regex)
const headerCallback = (x) =>
  matchesHeader(headerTitles, [x]) === MatcherResult.CORRECT

const headerRow = rowFinder(packingListCsv, headerCallback)
const dataRow = headerRow + 1
```

2. **Handle multiple REMOS sections** - Some CSVs have multiple establishment sections:

```javascript
// Split CSV by establishment number occurrences
// Process each section separately
```

3. **Skip empty rows** - Filter out blank rows:

```javascript
const validRows = packingListCsv.filter((row) =>
  row.some((cell) => cell != null && cell !== '')
)
```

---

### Step 5: Register Parser and Matcher

#### 5.1 Update Parser Model Constants

Add the new model to `src/services/parser-model.js`:

```javascript
export default {
  // Existing models...
  LIDL1: 'LIDL1'
  // ...
}
```

#### 5.2 Update parsers.js

Add the new parser to `src/services/parsers/parsers.js`:

```javascript
// Import new CSV parser
import { parse as parseLidl1 } from './lidl/model1.js'
import { matches as matchesLidl1 } from '../matchers/lidl/model1.js'

// In the parsersCsv object:
const parsersCsv = {
  // Existing parsers...
  LIDL1: {
    parse: parseLidl1,
    matches: matchesLidl1
  }
  // ...
}
```

#### 5.3 Update CSV Parser Getter

Ensure `getCsvParser()` function includes proper REMOS validation:

```javascript
export function getCsvParser(packingList, filename) {
  // Check for REMOS
  if (!regex.test(regex.remosRegex, packingList)) {
    return {
      parserModel: parserModel.NOREMOSCSV,
      parse: parsers.NOREMOSCSV.parse,
      matches: parsers.NOREMOSCSV.matches
    }
  }

  // Loop through CSV parsers
  for (const [model, parser] of Object.entries(parsersCsv)) {
    const matchResult = parser.matches(packingList, filename)
    if (matchResult === matcherResult.CORRECT) {
      return {
        parserModel: model,
        parse: parser.parse,
        matches: parser.matches
      }
    }
  }

  // No match found
  return {
    parserModel: parserModel.UNRECOGNISED,
    parse: parsers.UNRECOGNISED.parse,
    matches: () => matcherResult.WRONG_HEADER
  }
}
```

---

### Step 6: Add Test Data (Optional but Recommended)

#### 6.1 Create Test Data Directory

```bash
mkdir -p test/test-data-and-results/models-csv/lidl
mkdir -p test/test-data-and-results/results-csv/lidl
```

#### 6.2 Copy and Adapt Test Data

Copy test models from legacy repo:

```javascript
// test/test-data-and-results/models-csv/lidl/model1.js
export default {
  validModel: [
    [
      'Description',
      'Commodity Code',
      'Number of Packages',
      'Net Weight',
      'Country of Origin',
      'RMS-GB-000020-001'
    ],
    ['Beef Products', '0201100000', '10', '250.5', 'GB', ''],
    ['Pork Products', '0203190000', '5', '120.0', 'IE', '']
  ],
  emptyModel: [],
  wrongEstablishment: [
    [
      'Description',
      'Commodity Code',
      'Number of Packages',
      'Net Weight',
      'Country of Origin',
      'RMS-GB-999999-999'
    ],
    ['Beef Products', '0201100000', '10', '250.5', 'GB', '']
  ],
  wrongHeader: [
    ['Wrong', 'Headers', 'Here', 'Invalid', 'Columns', 'RMS-GB-000020-001'],
    ['Beef Products', '0201100000', '10', '250.5', 'GB', '']
  ]
}
```

Copy expected results:

```javascript
// test/test-data-and-results/results-csv/lidl/model1.js
import parserModel from '../../../../src/services/parser-model.js'

export default {
  validTestResult: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [
      {
        description: 'Beef Products',
        commodity_code: '0201100000',
        number_of_packages: '10',
        total_net_weight_kg: '250.5',
        country_of_origin: 'GB',
        row_location: 1
      },
      {
        description: 'Pork Products',
        commodity_code: '0203190000',
        number_of_packages: '5',
        total_net_weight_kg: '120.0',
        country_of_origin: 'IE',
        row_location: 2
      }
    ],
    establishment_numbers: ['RMS-GB-000020-001'],
    registration_approval_number: 'RMS-GB-000020-001',
    parserModel: parserModel.LIDL1,
    unitInHeader: false,
    validateCountryOfOrigin: true,
    blanketNirms: false
  }
}
```

---

### Step 7: Create Unit Tests

Create comprehensive unit tests next to the files they're testing:

```javascript
// src/services/matchers/lidl/model1.test.js
import { describe, test, expect } from 'vitest'
import { matches } from './model1.js'
import matcherResult from '../../matcher-result.js'
import model from '../../../../test/test-data-and-results/models-csv/lidl/model1.js'

const filename = 'packinglist.csv'

describe('LIDL Model 1 CSV Matcher', () => {
  test('matches valid LIDL Model 1 CSV file', () => {
    const result = matches(model.validModel, filename)
    expect(result).toBe(matcherResult.CORRECT)
  })

  test('returns EMPTY_FILE for empty csv', () => {
    const result = matches(model.emptyModel, filename)
    expect(result).toBe(matcherResult.EMPTY_FILE)
  })

  test('returns EMPTY_FILE for null input', () => {
    const result = matches(null, filename)
    expect(result).toBe(matcherResult.EMPTY_FILE)
  })

  test('returns WRONG_ESTABLISHMENT_NUMBER for invalid establishment', () => {
    const result = matches(model.wrongEstablishment, filename)
    expect(result).toBe(matcherResult.WRONG_ESTABLISHMENT_NUMBER)
  })

  test('returns WRONG_HEADER for incorrect headers', () => {
    const result = matches(model.wrongHeader, filename)
    expect(result).toBe(matcherResult.WRONG_HEADER)
  })
})
```

```javascript
// src/services/parsers/lidl/model1.test.js
import { describe, test, expect } from 'vitest'
import { parse } from './model1.js'
import model from '../../../../test/test-data-and-results/models-csv/lidl/model1.js'
import expectedResults from '../../../../test/test-data-and-results/results-csv/lidl/model1.js'
import parserModel from '../../parser-model.js'

describe('LIDL Model 1 CSV Parser', () => {
  test('parses valid LIDL Model 1 CSV file correctly', () => {
    const result = parse(model.validModel)
    expect(result).toMatchObject(expectedResults.validTestResult)
  })

  test('returns NOMATCH for empty CSV', () => {
    const result = parse(model.emptyModel)
    expect(result.parserModel).toBe(parserModel.NOMATCH)
    expect(result.business_checks.all_required_fields_present).toBe(false)
  })

  test('returns NOMATCH for null input', () => {
    const result = parse(null)
    expect(result.parserModel).toBe(parserModel.NOMATCH)
  })

  test('extracts all establishment numbers', () => {
    const result = parse(model.validModel)
    expect(result.establishment_numbers).toContain('RMS-GB-000020-001')
  })

  test('extracts correct number of items', () => {
    const result = parse(model.validModel)
    expect(result.items.length).toBe(2)
  })
})
```

---

### Step 8: Verify Integration

#### 8.1 Run Tests

```bash
npm test -- --grep "LIDL Model 1"
```

#### 8.2 Test Parser Discovery

Create an integration test to verify the parser is correctly discovered:

```javascript
// test/integration/csv-parser-discovery.test.js
import { describe, test, expect } from 'vitest'
import { getCsvParser } from '../../src/services/parsers/parsers.js'
import model from '../../test/test-data-and-results/models-csv/lidl/model1.js'

describe('CSV Parser Discovery - LIDL Model 1', () => {
  test('discovers LIDL1 parser for valid CSV packing list', () => {
    const parser = getCsvParser(model.validModel, 'test.csv')
    expect(parser.parserModel).toBe('LIDL1')
  })
})
```

#### 8.3 Verify REMOS Validation

Ensure the parser correctly rejects CSVs without REMOS:

```javascript
test('rejects CSV packing list without REMOS', () => {
  const noRemosModel = [
    ['Description', 'Commodity Code'],
    ['Beef Products', '0201100000']
  ]
  const parser = getCsvParser(noRemosModel, 'test.csv')
  expect(parser.parserModel).toBe('NOREMOSCSV')
})
```

---

## Common CSV Import Patterns

### Pattern 1: Simple CSV Matcher (Single Header Row)

**Examples:** LIDL1, basic CSV formats

**Characteristics:**

- Header is always first row (index 0)
- Standard header validation
- Simple establishment number check
- No special row filtering

**Template:**

```javascript
export function matches(packingList, filename) {
  try {
    if (!packingList || packingList.length === 0) {
      return matcherResult.EMPTY_FILE
    }

    if (!regex.test(headers.MODEL.establishmentNumber.regex, packingList)) {
      return matcherResult.WRONG_ESTABLISHMENT_NUMBER
    }

    const result = matchesHeader(Object.values(headers.MODEL.regex), [
      packingList[0]
    ])

    if (result === matcherResult.CORRECT) {
      logger.info({ filename }, 'Packing list matches MODEL')
    }

    return result
  } catch (err) {
    logger.error(
      {
        filename,
        error: {
          message: err.message,
          stack_trace: err.stack
        }
      },
      'Error in matches()'
    )
    return matcherResult.GENERIC_ERROR
  }
}
```

### Pattern 2: CSV with Dynamic Header Row

**Examples:** CSVs where header isn't always first row

**Characteristics:**

- Header position varies
- Requires row-finder utility
- May have metadata rows before header

**Template:**

```javascript
import { rowFinder } from '../../../utilities/row-finder.js'
import { matchesHeader } from '../../matchers/matches-header.js'
import MatcherResult from '../../matcher-result.js'

export function parse(packingListCsv) {
  try {
    if (!packingListCsv || packingListCsv.length === 0) {
      return combineParser.combine(null, [], false, parserModel.NOMATCH, [])
    }

    const establishmentNumber = regex.findMatch(
      headers.MODEL.establishmentNumber.regex,
      packingListCsv
    )

    // Find header row dynamically
    const headerTitles = Object.values(headers.MODEL.regex)
    const headerCallback = (x) =>
      matchesHeader(headerTitles, [x]) === MatcherResult.CORRECT

    const headerRow = rowFinder(packingListCsv, headerCallback)

    if (headerRow === -1) {
      return combineParser.combine(null, [], false, parserModel.NOMATCH, [])
    }

    const dataRow = headerRow + 1

    let establishmentNumbers = regex.findAllMatches(
      regex.remosRegex,
      packingListCsv,
      []
    )

    const packingListContents = mapParser(
      packingListCsv,
      headerRow,
      dataRow,
      headers.MODEL,
      null
    )

    return combineParser.combine(
      establishmentNumber,
      packingListContents,
      true,
      parserModel.MODEL,
      establishmentNumbers,
      headers.MODEL
    )
  } catch (err) {
    logger.error(
      {
        error: {
          message: err.message,
          stack_trace: err.stack
        }
      },
      'Error in parse()'
    )
    return combineParser.combine(null, [], false, parserModel.NOMATCH, [])
  }
}
```

### Pattern 3: CSV with Row Filtering

**Examples:** CSVs with empty rows or totals to skip

**Characteristics:**

- Contains empty/summary rows
- Requires filtering before parsing
- May have totals or subtotals

**Template:**

```javascript
export function parse(packingListCsv) {
  try {
    if (!packingListCsv || packingListCsv.length === 0) {
      return combineParser.combine(null, [], false, parserModel.NOMATCH, [])
    }

    // Filter out empty rows
    const validRows = packingListCsv.filter((row) =>
      row.some((cell) => cell != null && cell !== '')
    )

    const establishmentNumber = regex.findMatch(
      headers.MODEL.establishmentNumber.regex,
      validRows
    )

    const headerRow = 0
    const dataRow = 1

    let establishmentNumbers = regex.findAllMatches(
      regex.remosRegex,
      validRows,
      []
    )

    const packingListContents = mapParser(
      validRows,
      headerRow,
      dataRow,
      headers.MODEL,
      null
    )

    // Additional filtering for totals/summaries
    const filteredContents = packingListContents.filter((item) => {
      return !(
        item.description?.toLowerCase().includes('total') ||
        item.description?.toLowerCase().includes('subtotal')
      )
    })

    return combineParser.combine(
      establishmentNumber,
      filteredContents,
      true,
      parserModel.MODEL,
      establishmentNumbers,
      headers.MODEL
    )
  } catch (err) {
    logger.error(
      {
        error: {
          message: err.message,
          stack_trace: err.stack
        }
      },
      'Error in parse()'
    )
    return combineParser.combine(null, [], false, parserModel.NOMATCH, [])
  }
}
```

### Pattern 4: Multi-Section CSV

**Examples:** CSVs with multiple establishment sections

**Characteristics:**

- Multiple REMOS numbers in one file
- Each section has its own header/data
- Requires section-by-section processing

**Template:**

```javascript
export function parse(packingListCsv) {
  try {
    if (!packingListCsv || packingListCsv.length === 0) {
      return combineParser.combine(null, [], false, parserModel.NOMATCH, [])
    }

    let allPackingListContents = []
    let establishmentNumbers = []

    // Find all REMOS occurrences
    const remosRows = []
    packingListCsv.forEach((row, index) => {
      if (regex.test(regex.remosRegex, [row])) {
        remosRows.push(index)
      }
    })

    // Process each section
    for (let i = 0; i < remosRows.length; i++) {
      const sectionStart = remosRows[i]
      const sectionEnd =
        i + 1 < remosRows.length ? remosRows[i + 1] : packingListCsv.length
      const section = packingListCsv.slice(sectionStart, sectionEnd)

      const establishmentNumber = regex.findMatch(
        headers.MODEL.establishmentNumber.regex,
        section
      )

      if (establishmentNumber) {
        establishmentNumbers.push(establishmentNumber)
      }

      // Find header in this section
      const headerTitles = Object.values(headers.MODEL.regex)
      const headerCallback = (x) =>
        matchesHeader(headerTitles, [x]) === MatcherResult.CORRECT

      const headerRow = rowFinder(section, headerCallback)
      const dataRow = headerRow + 1

      const sectionContents = mapParser(
        section,
        headerRow,
        dataRow,
        headers.MODEL,
        null
      )

      allPackingListContents = allPackingListContents.concat(sectionContents)
    }

    return combineParser.combine(
      establishmentNumbers[0],
      allPackingListContents,
      true,
      parserModel.MODEL,
      establishmentNumbers,
      headers.MODEL
    )
  } catch (err) {
    logger.error(
      {
        error: {
          message: err.message,
          stack_trace: err.stack
        }
      },
      'Error in parse()'
    )
    return combineParser.combine(null, [], false, parserModel.NOMATCH, [])
  }
}
```

---

## Checklist

Use this checklist when importing a new CSV model:

- [ ] **Step 1:** Gathered all source files from legacy repo

  - [ ] Model headers configuration (model-headers-csv or model-headers)
  - [ ] Matcher implementation (matchers-csv or matchers)
  - [ ] Parser implementation (parsers-csv or parsers)
  - [ ] Test data (optional)
  - [ ] Expected results (optional)

- [ ] **Step 2:** Created model headers

  - [ ] Created/updated retailer headers file
  - [ ] Adapted header configuration to new format
  - [ ] Added required and optional field arrays
  - [ ] Exported headers in index.js
  - [ ] Verified regex patterns match legacy exactly

- [ ] **Step 3:** Created matcher implementation

  - [ ] Created directory structure
  - [ ] Implemented matches() function
  - [ ] Updated imports to ES6 format
  - [ ] Used `packingList[0]` for header check (CSV-specific)
  - [ ] Verified matching logic matches legacy

- [ ] **Step 4:** Created parser implementation

  - [ ] Created directory structure
  - [ ] Implemented parse() function
  - [ ] Updated imports to ES6 format
  - [ ] Set headerRow appropriately (usually 0 for CSV)
  - [ ] Set dataRow appropriately (usually 1 for CSV)
  - [ ] Passed `null` for sheet name to mapParser
  - [ ] **Verified 6th parameter (headers) passed to combineParser.combine()**
  - [ ] Verified parsing logic matches legacy

- [ ] **Step 5:** Registered parser and matcher

  - [ ] Added model to parser-model.js
  - [ ] Updated parsers.js (parsersCsv object)
  - [ ] Verified getCsvParser() includes new parser

- [ ] **Step 6:** Added test data

  - [ ] Created test data directory structure
  - [ ] Copied and adapted CSV test models (array of arrays)
  - [ ] Copied and adapted expected results

- [ ] **Step 7:** Created unit tests

  - [ ] Created matcher tests next to matcher file (same directory)
  - [ ] Created parser tests next to parser file (same directory)
  - [ ] Tests cover all matcher result codes
  - [ ] Tests verify correct parsing output
  - [ ] Tests handle empty/null input

- [ ] **Step 8:** Verified integration
  - [ ] All unit tests pass
  - [ ] CSV parser discovery test passes
  - [ ] REMOS validation test passes (NOREMOSCSV)
  - [ ] Tested with real CSV samples (if available)

---

## Troubleshooting

### Common CSV-Specific Issues

#### Issue: Parser not discovering CSV model

**Symptoms:** Parser returns `UNRECOGNISED` even with valid CSV

**Solutions:**

1. Verify CSV is being parsed as array of arrays
2. Check establishment number regex matches exactly
3. Verify header regex patterns match first row
4. Ensure model is registered in `parsersCsv` object
5. Check `getCsvParser()` function is calling CSV matchers

#### Issue: Headers not matching in CSV

**Symptoms:** Matcher returns `WRONG_HEADER`

**Solutions:**

1. CSV headers are often case-sensitive - verify exact match
2. Check for extra whitespace in CSV headers
3. Verify `packingList[0]` contains header row
4. Test header regex patterns independently
5. Check if header row is at different index

#### Issue: Empty cells causing errors

**Symptoms:** Parser fails or returns incorrect data

**Solutions:**

1. Filter out empty rows before processing
2. Handle null/undefined cells in mapParser
3. Add validation for minimum row length
4. Check for trailing empty columns

#### Issue: Data rows not extracted

**Symptoms:** Parser returns empty items array

**Solutions:**

1. Verify headerRow is found (not -1)
2. Check dataRow calculation (usually headerRow + 1)
3. Ensure CSV has rows after header
4. Verify mapParser is receiving correct parameters
5. Check sheet name parameter is `null` for CSV

#### Issue: Multiple REMOS numbers not detected

**Symptoms:** Only first establishment number found

**Solutions:**

1. Use `findAllMatches()` not `findMatch()`
2. Search entire CSV array, not just first section
3. Verify REMOS regex pattern is correct
4. Check if REMOS numbers are in different columns

---

## CSV-Specific Best Practices

1. **Header Detection:** Most CSVs have header at index 0, but always verify. Some may have metadata rows first.

2. **Empty Row Handling:** CSVs often have trailing empty rows. Filter these before processing:

```javascript
const validRows = csv.filter((row) =>
  row.some((cell) => cell != null && cell !== '')
)
```

3. **Cell Value Sanitization:** CSV cells may have extra whitespace:

```javascript
const cleanValue = cell?.toString().trim()
```

4. **Array Bounds Checking:** Always verify row exists before accessing:

```javascript
if (headerRow >= 0 && headerRow < csv.length) {
  // Process header
}
```

5. **REMOS Format:** Verify REMOS follows `RMS-GB-XXXXXX-XXX` pattern

6. **Sheet Name:** Always pass `null` for sheet name in CSV parsers (5th parameter to mapParser)

7. **Test Data Format:** CSV test data should be array of arrays, not objects:

```javascript
// Correct
;[
  ['Header1', 'Header2'],
  ['Value1', 'Value2']
]

// Wrong
{
  Sheet1: [['Header1', 'Header2']]
}
```

8. **Performance:** CSVs are typically smaller than Excel files, but still validate input size

9. **Encoding:** Be aware of CSV encoding issues (UTF-8, BOM markers, etc.)

10. **Delimiter Handling:** Verify CSV uses standard comma delimiter

---

## Reference Links

- **Legacy Repository:** https://github.com/DEFRA/trade-exportscore-plp
- **Parser Discovery Process:** [find-parser-to-use.md](./find-parser-to-use.md)
- **Detailed Flow:** [parser-discovery-extraction-detailed.md](./parser-discovery-extraction-detailed.md)
- **Excel Import Guide:** [EXCEL-MODEL-IMPORT-GUIDE.md](./EXCEL-MODEL-IMPORT-GUIDE.md)
- **Model Headers README:** `src/services/model-headers/README.md`
- **Parsers README:** `src/services/parsers/README.md`
- **Matchers README:** `src/services/matchers/README.md`

---

## Quick Reference: CSV File Mapping

| Legacy Location                                                      | New Location                                                    | Purpose                    |
| -------------------------------------------------------------------- | --------------------------------------------------------------- | -------------------------- |
| `app/services/model-headers-csv/[retailer].js`                       | `src/services/model-headers/[retailer].js`                      | CSV header configurations  |
| `app/services/matchers-csv/[retailer]/model[N].js`                   | `src/services/matchers/[retailer]/model[N].js`                  | CSV matcher implementation |
| `app/services/parsers-csv/[retailer]/model[N].js`                    | `src/services/parsers/[retailer]/model[N].js`                   | CSV parser implementation  |
| `test/unit/test-data-and-results/models-csv/[retailer]/model[N].js`  | `test/test-data-and-results/models-csv/[retailer]/model[N].js`  | CSV test data              |
| `test/unit/test-data-and-results/results-csv/[retailer]/model[N].js` | `test/test-data-and-results/results-csv/[retailer]/model[N].js` | Expected results           |
| `app/services/model-headers-csv.js`                                  | `src/services/model-headers/index.js`                           | Headers registry           |
| `app/services/parsers.js` (getCsvParser)                             | `src/services/parsers/parsers.js` (getCsvParser)                | CSV parser routing         |

---

## Example: Complete Import of LIDL Model 1

This is a complete walkthrough of importing a CSV model:

1. **Gather from legacy repo:**

   - `app/services/model-headers-csv/lidl.js` → Extract LIDL1 object
   - `app/services/matchers-csv/lidl/model1.js` → Copy entire file
   - `app/services/parsers-csv/lidl/model1.js` → Copy entire file
   - `test/test-data-and-results/models-csv/lidl/model1.js` → Copy entire file
   - `test/test-data-and-results/results-csv/lidl/model1.js` → Copy entire file

2. **Create in new repo:**

   ```bash
   touch src/services/model-headers/lidl.js
   mkdir -p src/services/matchers/lidl
   touch src/services/matchers/lidl/model1.js
   touch src/services/matchers/lidl/model1.test.js
   mkdir -p src/services/parsers/lidl
   touch src/services/parsers/lidl/model1.js
   touch src/services/parsers/lidl/model1.test.js
   mkdir -p test/test-data-and-results/models-csv/lidl
   touch test/test-data-and-results/models-csv/lidl/model1.js
   mkdir -p test/test-data-and-results/results-csv/lidl
   touch test/test-data-and-results/results-csv/lidl/model1.js
   ```

3. **Convert imports:** Replace `require()` with ES6 `import`

4. **Adapt for CSV:**

   - Matcher: Use `packingList[0]` for header check
   - Parser: Set `headerRow = 0`, `dataRow = 1`, pass `null` for sheet name

5. **Register:** Add to `parsersCsv` object in `parsers.js`, export in `model-headers/index.js`

6. **Test:** Run unit tests and integration tests

7. **Verify:** Test with real CSV sample

---

## Support

For questions or issues during CSV migration:

1. Review this guide and the [Excel Import Guide](./EXCEL-MODEL-IMPORT-GUIDE.md)
2. Check [parser-discovery-extraction-detailed.md](./parser-discovery-extraction-detailed.md) for CSV flow
3. Review existing CSV implementations for patterns
4. Check unit tests in the legacy repo for expected behavior
5. Consult with the development team for architecture decisions
