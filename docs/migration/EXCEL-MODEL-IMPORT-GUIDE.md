# Excel-Based Model Import Guide

## Overview

This guide provides step-by-step instructions for importing a specific Excel-based packing list parser model from the legacy `trade-exportscore-plp` repository into the new `trade-exports-packinglistparser` project structure.

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

## Prerequisites

1. Access to the legacy repository: https://github.com/DEFRA/trade-exportscore-plp
2. Identify the specific retailer model you want to import (e.g., ASDA1, TESCO2, COOP1)
3. Know the model's parser identifier (e.g., `ASDA1`, `MARS1`, `TURNERS1`)

---

## Migration Steps

### Step 1: Gather Source Files from Legacy Repository

For each retailer model, you'll need to collect the following files from the legacy repo:

#### 1.1 Model Headers Configuration

**Old Location:** `app/services/model-headers/[retailer].js`  
**Example:** `app/services/model-headers/asda.js`

This file contains:

- Establishment number regex patterns
- Header column regex mappings
- Optional field configurations
- Validation flags

**What to extract:**

```javascript
// Example from ASDA3
ASDA3: {
  establishmentNumber: {
    regex: /^RMS-GB-000015-\d{3}$/i,
  },
  regex: {
    description: /Description Of All Retail Goods/i,
    nature_of_products: /Nature of Product/i,
    type_of_treatment: /Treatment Type/i,
    number_of_packages: /Number of Packages/i,
    total_net_weight_kg: /Net Weight/i,
  },
  total_net_weight_unit: /kilograms\/grams/i,
  commodity_code: /Commodity Code/i,
  country_of_origin: /Country of Origin/i,
  nirms: /NIRMs\/Non-NIRMs/i,
  validateCountryOfOrigin: true,
}
```

#### 1.2 Matcher Implementation

**Old Location:** `app/services/matchers/[retailer]/model[N].js`  
**Example:** `app/services/matchers/asda/model3.js`

This file implements the `matches()` function that:

- Checks for empty files
- Validates establishment number patterns
- Validates header structure

**What to extract:**

```javascript
function matches(packingList, filename) {
  try {
    let result
    const sheets = Object.keys(packingList)
    if (sheets?.length === 0) {
      return matcherResult.EMPTY_FILE
    }

    for (const sheet of sheets) {
      // check for correct establishment number
      if (
        !regex.test(headers.ASDA3.establishmentNumber.regex, packingList[sheet])
      ) {
        return matcherResult.WRONG_ESTABLISHMENT_NUMBER
      }
      // check for header values
      result = matchesHeader(
        Object.values(headers.ASDA3.regex),
        packingList[sheet]
      )
      if (result === matcherResult.WRONG_HEADER) {
        return result
      }
    }

    if (result === matcherResult.CORRECT) {
      logger.logInfo(
        filenameForLogging,
        'matches()',
        `Packing list matches ASDA Model 3 with filename: ${filename}`
      )
    }

    return result
  } catch (err) {
    logger.logError(filenameForLogging, 'matches()', err)
    return matcherResult.GENERIC_ERROR
  }
}
```

#### 1.3 Parser Implementation

**Old Location:** `app/services/parsers/[retailer]/model[N].js`  
**Example:** `app/services/parsers/asda/model3.js`

This file implements the `parse()` function that:

- Finds establishment numbers
- Locates header rows
- Extracts item data using mapParser
- Combines results

**What to extract:**

```javascript
function parse(packingListJson) {
  try {
    const sheets = Object.keys(packingListJson)
    let packingListContents = []
    let packingListContentsTemp = []
    let establishmentNumbers = []

    const establishmentNumber = regex.findMatch(
      headers.ASDA3.establishmentNumber.regex,
      packingListJson[sheets[0]]
    )

    const headerTitles = Object.values(headers.ASDA3.regex)
    const headerCallback = function (x) {
      return matchesHeader(headerTitles, [x]) === MatcherResult.CORRECT
    }

    for (const sheet of sheets) {
      establishmentNumbers = regex.findAllMatches(
        regex.remosRegex,
        packingListJson[sheet],
        establishmentNumbers
      )

      const headerRow = rowFinder(packingListJson[sheet], headerCallback)
      const dataRow = headerRow + 1

      packingListContentsTemp = mapParser(
        packingListJson[sheet],
        headerRow,
        dataRow,
        headers.ASDA3,
        sheet
      )
      packingListContents = packingListContents.concat(packingListContentsTemp)
    }

    return combineParser.combine(
      establishmentNumber,
      packingListContents,
      true,
      parserModel.ASDA3,
      establishmentNumbers,
      headers.ASDA3
    )
  } catch (err) {
    logger.logError(filenameForLogging, 'parse()', err)
    return combineParser.combine(null, [], false, parserModel.NOMATCH, [])
  }
}
```

#### 1.4 Test Data (Optional but Recommended)

**Old Location:** `test/unit/test-data-and-results/models/[retailer]/model[N].js`  
**Example:** `test/unit/test-data-and-results/models/asda/model3.js`

Contains sample packing list data for testing.

#### 1.5 Expected Test Results (Optional but Recommended)

**Old Location:** `test/unit/test-data-and-results/results/[retailer]/model[N].js`  
**Example:** `test/unit/test-data-and-results/results/asda/model3.js`

Contains expected parser output for validation.

---

### Step 2: Create Model Headers in New Project

**New Location:** `src/services/model-headers/[retailer].js`

#### 2.1 Create Retailer Headers File

If the retailer doesn't exist yet, create a new file:

```bash
touch src/services/model-headers/asda.js
```

#### 2.2 Adapt Header Configuration

Transform the old format to match the new project's structure:

```javascript
/**
 * ASDA model headers
 *
 * Provides establishment number regexes and header regex mappings
 * for ASDA packing list variants used by matchers.
 */

const asdaHeaders = {
  ASDA3: {
    establishmentNumber: {
      regex: /^RMS-GB-000015-\d{3}$/i
    },
    regex: {
      description: /Description Of All Retail Goods/i,
      nature_of_products: /Nature of Product/i,
      type_of_treatment: /Treatment Type/i,
      number_of_packages: /Number of Packages/i,
      total_net_weight_kg: /Net Weight/i
    },
    // Optional fields
    total_net_weight_unit: /kilograms\/grams/i,
    commodity_code: /Commodity Code/i,
    country_of_origin: /Country of Origin/i,
    nirms: /NIRMs\/Non-NIRMs/i,
    // Validation flags
    validateCountryOfOrigin: true,
    findUnitInHeader: false,
    // For models with invalid sheets to skip
    invalidSheets: [],
    // Deprecated flag (if applicable)
    deprecated: false
  }
}

export default asdaHeaders
```

**Key Changes:**

- Use ES6 `export default` instead of `module.exports`
- **PRESERVE the exact same structure and regex patterns from legacy**
- **DO NOT modify or "improve" the data structure**
- Add `required` and `optional` arrays listing field names
- Document any model-specific quirks in comments

**Header Structure Rules:**

1. **Required fields** → Place in `regex` object
2. **Optional fields** → Place as direct properties (e.g., `country_of_origin: /regex/`)
3. **Both lists** → Add `required: ['field1', 'field2']` and `optional: ['field3']` arrays
4. **Validation flags** → Keep at root level (`validateCountryOfOrigin`, `findUnitInHeader`, etc.)

#### 2.3 Export Headers in Excel Registry

Update `src/services/model-headers.js` (NOT index.js!):

```javascript
// Import the new retailer's Excel headers (named import)
import { asdaHeaders } from './model-headers/asda.js'

const headers = {
  // Existing Excel retailers...
  ...asdaHeaders
}

export default headers
```

**Important:** This file aggregates **Excel-only** headers. CSV headers go in `model-headers-csv.js`, PDF headers in `model-headers-pdf.js`.

---

### Step 3: Create Matcher Implementation

**New Location:** `src/services/matchers/[retailer]/model[N].js`

#### 3.1 Create Directory Structure

```bash
mkdir -p src/services/matchers/asda
touch src/services/matchers/asda/model3.js
```

#### 3.2 Implement Matcher

Adapt the matcher from the legacy repo:

```javascript
/**
 * ASDA Model 3 matcher
 *
 * Detects whether a provided Excel-converted packing list matches
 * the ASDA Model 3 format by checking the establishment number and
 * header row patterns.
 */
import { createLogger } from '../../../common/helpers/logging/logger.js'
import matcherResult from '../../matcher-result.js'
import { matchesHeader } from '../../matches-header.js'
import * as regex from '../../../utilities/regex.js'
import headers from '../../model-headers.js' // Excel headers registry

const logger = createLogger()

/**
 * Check whether the provided packing list matches ASDA Model 3.
 * @param {Object} packingList - Excel->JSON representation keyed by sheet
 * @param {string} filename - Source filename for logging
 * @returns {string} - One of matcherResult codes
 */
export function matches(packingList, filename) {
  try {
    let result
    const sheets = Object.keys(packingList)

    if (sheets?.length === 0) {
      return matcherResult.EMPTY_FILE
    }

    for (const sheet of sheets) {
      // Check for correct establishment number
      if (
        !regex.test(headers.ASDA3.establishmentNumber.regex, packingList[sheet])
      ) {
        return matcherResult.WRONG_ESTABLISHMENT_NUMBER
      }

      // Check for header values
      result = matchesHeader(
        Object.values(headers.ASDA3.regex),
        packingList[sheet]
      )

      if (result === matcherResult.WRONG_HEADER) {
        return result
      }
    }

    if (result === matcherResult.CORRECT) {
      logger.info({ filename }, 'Packing list matches ASDA Model 3')
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

**Key Changes:**

- Use ES6 imports instead of `require()`
- Import and use Pino logger via `createLogger()` from `common/helpers/logging/logger.js`
- Use structured logging: `logger.info({ context }, 'message')` and `logger.error({ error: { message: err.message, stack_trace: err.stack }, context }, 'message')`
- Keep the same matching logic

---

### Step 4: Create Parser Implementation

**New Location:** `src/services/parsers/[retailer]/model[N].js`

#### 4.1 Create Directory Structure

```bash
mkdir -p src/services/parsers/asda
touch src/services/parsers/asda/model3.js
```

#### 4.2 Implement Parser

Adapt the parser from the legacy repo:

```javascript
/**
 * ASDA Excel parser - Model 3
 * @module parsers/asda/model3
 */
import { createLogger } from '../../../common/helpers/logging/logger.js'
import combineParser from '../../parser-combine.js'
import parserModel from '../../parser-model.js'
import headers from '../../model-headers.js' // Excel headers registry
import { rowFinder } from '../../../utilities/row-finder.js'
import mapParser from '../../parser-map.js'
import { matchesHeader } from '../../matches-header.js'
import MatcherResult from '../../matcher-result.js'
import * as regex from '../../../utilities/regex.js'

const logger = createLogger()

/**
 * Parse the provided packing list JSON for ASDA model 3.
 * @param {Object} packingListJson - Workbook JSON keyed by sheet name.
 * @returns {Object} Combined parser result.
 */
export function parse(packingListJson) {
  try {
    const sheets = Object.keys(packingListJson)
    let packingListContents = []
    let packingListContentsTemp = []
    let establishmentNumbers = []

    // Find primary establishment number
    const establishmentNumber = regex.findMatch(
      headers.ASDA3.establishmentNumber.regex,
      packingListJson[sheets[0]]
    )

    // Setup header callback
    const headerTitles = Object.values(headers.ASDA3.regex)
    const headerCallback = function (x) {
      return matchesHeader(headerTitles, [x]) === MatcherResult.CORRECT
    }

    // Process each sheet
    for (const sheet of sheets) {
      // Find all establishment numbers
      establishmentNumbers = regex.findAllMatches(
        regex.remosRegex,
        packingListJson[sheet],
        establishmentNumbers
      )

      // Find header row
      const headerRow = rowFinder(packingListJson[sheet], headerCallback)
      const dataRow = headerRow + 1

      // Map data rows
      packingListContentsTemp = mapParser(
        packingListJson[sheet],
        headerRow,
        dataRow,
        headers.ASDA3,
        sheet
      )

      packingListContents = packingListContents.concat(packingListContentsTemp)
    }

    // CRITICAL: Include headers parameter (6th parameter) for CoO validation
    return combineParser.combine(
      establishmentNumber,
      packingListContents,
      true,
      parserModel.ASDA3,
      establishmentNumbers,
      headers.ASDA3 // Required for Country of Origin validation
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

**Key Changes:**

- Use ES6 imports instead of `require()`
- Import and use Pino logger via `createLogger()` from `common/helpers/logging/logger.js`
- Use structured logging: `logger.error({ error: { message: err.message, stack_trace: err.stack } }, 'message')` for errors
- **CRITICAL:** Ensure the 6th parameter (headers) is passed to `combineParser.combine()` - this is required for validation flags
- **DO NOT modify the parsing logic** - keep the same flow and structure from legacy
- **DO NOT change parameter names** - `combineParser.combine()` expects legacy parameter names:
  1. `establishmentNumber` (or `registration_approval_number`)
  2. `packingListContents` (or `items`)
  3. `allRequiredFieldsPresent` (boolean)
  4. `ParserModel` (model identifier)
  5. `establishmentNumbers` (array)
  6. `header` (header config object)

**Parser Return Structure:**
The parser MUST return the legacy structure via `combineParser.combine()`:

```javascript
{
  registration_approval_number: string,
  items: Array,
  business_checks: {
    all_required_fields_present: boolean,
    failure_reasons: null
  },
  parserModel: string,
  establishment_numbers: Array,
  unitInHeader: boolean,
  validateCountryOfOrigin: boolean,
  blanketNirms: boolean
}
```

---

### Step 5: Register Parser and Matcher

#### 5.1 Update Parser Model Constants

Add the new model to `src/services/parser-model.js` (or equivalent):

```javascript
export default {
  // Existing models...
  ASDA3: 'ASDA3'
  // ...
}
```

#### 5.2 Update parsers.js

Add the new parser to `src/services/parsers/parsers.js`:

```javascript
// Import new parser
import { parse as parseAsda3 } from './asda/model3.js'
import { matches as matchesAsda3 } from '../matchers/asda/model3.js'

// In the parsersExcel object:
const parsersExcel = {
  // Existing parsers...
  ASDA3: {
    parse: parseAsda3,
    matches: matchesAsda3
  }
  // ...
}
```

#### 5.3 Update model-parsers.js (if separate)

If you have a separate `model-parsers.js` file that exports parser collections:

```javascript
import { parse as parseAsda3 } from './parsers/asda/model3.js'
import { matches as matchesAsda3 } from './matchers/asda/model3.js'

export const parsersExcel = {
  ASDA3: {
    parse: parseAsda3,
    matches: matchesAsda3,
    type: 'excel',
    parserModel: 'ASDA3'
  }
  // ... other parsers
}
```

---

### Step 6: Add Test Data (Optional but Recommended)

#### 6.1 Create Test Data Directory

```bash
mkdir -p test/test-data-and-results/models/asda
mkdir -p test/test-data-and-results/results/asda
```

#### 6.2 Copy and Adapt Test Data

Copy test models from legacy repo:

```javascript
// test/test-data-and-results/models/asda/model3.js
export default {
  validModel: {
    Page1_1: [
      {
        B: 'Description Of All Retail Goods',
        C: 'Nature of Product',
        D: 'Treatment Type',
        E: 'Number Of Establishment',
        F: 'Destination Store Establishment Number',
        G: 'Number of Packages',
        H: 'Net Weight',
        I: 'kilograms/grams',
        J: 'NIRMs/Non-NIRMs'
      },
      {
        B: 'Test Product',
        C: 'Fresh Produce',
        D: 'Chilled',
        E: 'RMS-GB-000015-006',
        F: 'RMS-NI-000008-017',
        G: 1,
        H: 0.5,
        I: 'kgs',
        J: 'Non-NIRMS'
      }
    ]
  }
  // ... other test cases
}
```

Copy expected results:

```javascript
// test/test-data-and-results/results/asda/model3.js
import parserModel from '../../../../src/services/parser-model.js'

export default {
  validTestResult: {
    business_checks: {
      all_required_fields_present: true,
      failure_reasons: null
    },
    items: [
      {
        description: 'Test Product',
        nature_of_products: 'Fresh Produce',
        type_of_treatment: 'Chilled',
        number_of_packages: 1,
        total_net_weight_kg: 0.5
      }
    ],
    establishment_numbers: ['RMS-GB-000015-006'],
    registration_approval_number: 'RMS-GB-000015-006',
    parserModel: parserModel.ASDA3
  }
}
```

---

### Step 7: Create Unit Tests

Create comprehensive unit tests next to the files they're testing:

```javascript
// src/services/matchers/asda/model3.test.js
import { describe, test, expect } from 'vitest'
import { matches } from './model3.js'
import matcherResult from '../matcher-result.js'
import model from '../../../../test/unit/test-data-and-results/models/asda/model3.js'

const filename = 'packinglist.xlsx'

describe('ASDA Model 3 Matcher', () => {
  test('matches valid ASDA Model 3 file', () => {
    const result = matches(model.validModel, filename)
    expect(result).toBe(matcherResult.CORRECT)
  })

  test('returns EMPTY_FILE for empty json', () => {
    const result = matches({}, filename)
    expect(result).toBe(matcherResult.EMPTY_FILE)
  })

  test('returns WRONG_ESTABLISHMENT_NUMBER for invalid establishment', () => {
    const result = matches(model.wrongEstablishment, filename)
    expect(result).toBe(matcherResult.WRONG_ESTABLISHMENT_NUMBER)
  })

  test('returns WRONG_HEADER for incorrect headers', () => {
    const result = matches(model.incorrectHeader, filename)
    expect(result).toBe(matcherResult.WRONG_HEADER)
  })
})
```

```javascript
// src/services/parsers/asda/model3.test.js
import { describe, test, expect } from 'vitest'
import { parse } from './model3.js'
import model from '../../../../test/unit/test-data-and-results/models/asda/model3.js'
import expectedResults from '../../../../test/unit/test-data-and-results/results/asda/model3.js'

describe('ASDA Model 3 Parser', () => {
  test('parses valid ASDA Model 3 file correctly', () => {
    const result = parse(model.validModel)
    expect(result).toMatchObject(expectedResults.validTestResult)
  })

  test('handles missing required fields gracefully', () => {
    const result = parse(model.invalidModel_MissingColumnCells)
    expect(result.business_checks.all_required_fields_present).toBe(false)
  })
})
```

---

### Step 8: Verify Integration

#### 8.1 Run Tests

```bash
npm test -- --grep "ASDA Model 3"
```

#### 8.2 Test Parser Discovery

Create an integration test to verify the parser is correctly discovered:

```javascript
// test/integration/parser-discovery.test.js
import { describe, test, expect } from 'vitest'
import { getExcelParser } from '../../src/services/parsers/parsers.js'
import model from '../test-data-and-results/models/asda/model3.js'

describe('Parser Discovery - ASDA Model 3', () => {
  test('discovers ASDA3 parser for valid packing list', () => {
    const parser = getExcelParser(model.validModel, 'test.xlsx')
    expect(parser.parserModel).toBe('ASDA3')
  })
})
```

#### 8.3 Verify REMOS Validation

Ensure the parser correctly rejects files without REMOS:

```javascript
test('rejects packing list without REMOS', () => {
  const parser = getExcelParser(model.noRemosModel, 'test.xlsx')
  expect(parser.parserModel).toBe('NOREMOS')
})
```

---

## Common Import Patterns

### Pattern 1: Simple Matcher (Single Sheet, Standard Headers)

**Examples:** COOP1, TURNERS1, MARS1

**Characteristics:**

- Single sheet processing
- Standard header validation
- Simple establishment number check
- No special sheet filtering

**Template:**

```javascript
export function matches(packingList, filename) {
  try {
    const sheets = Object.keys(packingList)
    if (!sheets?.length) return matcherResult.EMPTY_FILE

    for (const sheet of sheets) {
      if (
        !regex.test(headers.MODEL.establishmentNumber.regex, packingList[sheet])
      ) {
        return matcherResult.WRONG_ESTABLISHMENT_NUMBER
      }

      const result = matchesHeader(
        Object.values(headers.MODEL.regex),
        packingList[sheet]
      )

      if (result === matcherResult.WRONG_HEADER) {
        return result
      }
    }

    return matcherResult.CORRECT
  } catch (err) {
    return matcherResult.GENERIC_ERROR
  }
}
```

### Pattern 2: Multi-Sheet with Invalid Sheets

**Examples:** SAVERS1, DAVENPORT2

**Characteristics:**

- Multiple sheets
- Some sheets should be skipped
- Uses `invalidSheets` configuration

**Template:**

```javascript
export function matches(packingList, filename) {
  try {
    let result = matcherResult.EMPTY_FILE
    const sheets = Object.keys(packingList)

    if (!sheets?.length) {
      return matcherResult.EMPTY_FILE
    }

    for (const sheet of sheets) {
      // Skip invalid sheets
      if (headers.MODEL.invalidSheets.includes(sheet)) {
        continue
      }

      if (
        !regex.test(headers.MODEL.establishmentNumber.regex, packingList[sheet])
      ) {
        return matcherResult.WRONG_ESTABLISHMENT_NUMBER
      }

      result = matchesHeader(
        Object.values(headers.MODEL.regex),
        packingList[sheet]
      )

      if (result === matcherResult.WRONG_HEADER) {
        return result
      }
    }

    return result
  } catch (err) {
    return matcherResult.GENERIC_ERROR
  }
}
```

### Pattern 3: Reusable Matcher Helper

**Examples:** GIOVANNI1, FOWLERWELCH1 (shared logic)

**Characteristics:**

- Shared matching logic between models
- Uses a helper function
- Different establishment regex per variant

**Template:**

```javascript
// Shared helper
export function matchesModel(packingList, filename, regexExpression) {
  try {
    const sheets = Object.keys(packingList)
    if (!sheets?.length) return matcherResult.EMPTY_FILE

    for (const sheet of sheets) {
      if (!regex.test(regexExpression, packingList[sheet])) {
        return matcherResult.WRONG_ESTABLISHMENT_NUMBER
      }

      const result = matchesHeader(
        Object.values(headers.MODEL.regex),
        packingList[sheet]
      )

      if (result === matcherResult.WRONG_HEADER) {
        return result
      }
    }

    return matcherResult.CORRECT
  } catch (err) {
    return matcherResult.GENERIC_ERROR
  }
}

// Specific model wrapper
export function matches(packingList, filename) {
  return matchesModel(
    packingList,
    filename,
    headers.MODEL1.establishmentNumber.regex
  )
}
```

### Pattern 4: Parser with Row Filtering

**Examples:** FOWLERWELCH1, KEPAK1

**Characteristics:**

- Filters out drag-down/empty rows
- Uses custom validation callbacks
- Removes totals or summary rows

**Template:**

```javascript
export function parse(packingListJson) {
  try {
    const sheets = Object.keys(packingListJson)
    let packingListContents = []
    let establishmentNumbers = []

    const establishmentNumber = regex.findMatch(
      headers.MODEL.establishmentNumber.regex,
      packingListJson[sheets[0]]
    )

    const headerTitles = Object.values(headers.MODEL.regex)
    const headerCallback = (x) =>
      matchesHeader(headerTitles, [x]) === MatcherResult.CORRECT

    // Filter callback for drag-down rows
    const notDragDownCallback = (item) => {
      return !(
        item.description === 0 &&
        item.commodity_code === 0 &&
        item.number_of_packages === 0 &&
        item.total_net_weight_kg === 0
      )
    }

    for (const sheet of sheets) {
      establishmentNumbers = regex.findAllMatches(
        regex.remosRegex,
        packingListJson[sheet],
        establishmentNumbers
      )

      const headerRow = rowFinder(packingListJson[sheet], headerCallback)
      const dataRow = headerRow + 1

      let packingListContentsTemp = mapParser(
        packingListJson[sheet],
        headerRow,
        dataRow,
        headers.MODEL,
        sheet
      )

      // Filter out invalid rows
      packingListContentsTemp =
        packingListContentsTemp.filter(notDragDownCallback)
      packingListContents = packingListContents.concat(packingListContentsTemp)
    }

    return combineParser.combine(
      establishmentNumber,
      packingListContents,
      true,
      parserModel.MODEL,
      establishmentNumbers,
      headers.MODEL
    )
  } catch (err) {
    console.error(`Error in parse():`, err)
    return combineParser.combine(null, [], false, parserModel.NOMATCH, [])
  }
}
```

---

## Checklist

Use this checklist when importing a new Excel model:

- [ ] **Step 1:** Gathered all source files from legacy repo

  - [ ] Model headers configuration
  - [ ] Matcher implementation
  - [ ] Parser implementation
  - [ ] Test data (optional)
  - [ ] Expected results (optional)

- [ ] **Step 2:** Created model headers

  - [ ] Created/updated retailer headers file
  - [ ] Adapted header configuration to new format
  - [ ] Exported headers in index.js
  - [ ] Verified regex patterns match legacy exactly

- [ ] **Step 3:** Created matcher implementation

  - [ ] Created directory structure
  - [ ] Implemented matches() function
  - [ ] Updated imports to ES6 format
  - [ ] Verified matching logic matches legacy

- [ ] **Step 4:** Created parser implementation

  - [ ] Created directory structure
  - [ ] Implemented parse() function
  - [ ] Updated imports to ES6 format
  - [ ] **Verified 6th parameter (headers) passed to combineParser.combine()**
  - [ ] Verified parsing logic matches legacy

- [ ] **Step 5:** Registered parser and matcher

  - [ ] Added model to parser-model.js
  - [ ] Updated parsers.js
  - [ ] Updated model-parsers.js (if separate)

- [ ] **Step 6:** Added test data

  - [ ] Created test data directory structure
  - [ ] Copied and adapted test models
  - [ ] Copied and adapted expected results

- [ ] **Step 7:** Created unit tests

  - [ ] Created matcher tests next to matcher file (same directory)
  - [ ] Created parser tests next to parser file (same directory)
  - [ ] Tests cover all matcher result codes
  - [ ] Tests verify correct parsing output

- [ ] **Step 8:** Verified integration
  - [ ] All unit tests pass
  - [ ] Parser discovery test passes
  - [ ] REMOS validation test passes
  - [ ] Tested with real packing list samples (if available)

---

## Troubleshooting

### Common Issues

#### Issue: Parser not being discovered

**Symptoms:** Parser returns `UNRECOGNISED` even with valid packing list

**Solutions:**

1. Verify establishment number regex matches exactly
2. Check header regex patterns are correct
3. Ensure model is registered in `parsers.js`
4. Verify headers are exported in `model-headers.js`

#### Issue: Headers not matching

**Symptoms:** Matcher returns `WRONG_HEADER`

**Solutions:**

1. Compare header regex patterns with sample packing list
2. Check for case sensitivity in regex patterns
3. Verify column positions match expected structure
4. Use `matchesHeader()` directly in tests to debug

#### Issue: Establishment number not matching

**Symptoms:** Matcher returns `WRONG_ESTABLISHMENT_NUMBER`

**Solutions:**

1. Verify establishment number format in sample file
2. Check regex pattern includes all valid establishment numbers
3. Test regex pattern independently
4. Ensure REMOS format is `RMS-GB-XXXXXX-XXX`

#### Issue: Parser returns NOMATCH

**Symptoms:** `combineParser.combine()` returns NOMATCH model

**Solutions:**

1. Check for exceptions in parser try/catch
2. Verify headerRow is found (not -1)
3. Ensure sheets array is not empty
4. Check dataRow calculation (should be headerRow + 1)

#### Issue: Missing headers parameter

**Symptoms:** Country of Origin validation fails, items missing optional fields

**Solutions:**

1. Verify 6th parameter passed to `combineParser.combine()`
2. Check headers object includes all optional field patterns
3. Ensure headers parameter is the model's headers object, not the values

---

## Best Practices

1. **Keep Regex Patterns Identical:** Don't modify regex patterns from the legacy repo unless absolutely necessary. Any changes may break parsing.

2. **Test with Real Data:** Always test with actual packing list samples from the retailer if available.

3. **Document Quirks:** Add comments explaining any model-specific behaviors or edge cases.

4. **Version Control:** Commit after each major step (headers, matcher, parser) to make debugging easier.

5. **Code Review:** Have another developer review the implementation, especially regex patterns and matching logic.

6. **Performance:** If a model processes very large files, consider adding performance optimizations like early returns or sheet filtering.

7. **Logging:** Include meaningful log messages for debugging parser discovery and matching issues.

8. **Error Handling:** Always return appropriate error codes (EMPTY_FILE, WRONG_ESTABLISHMENT_NUMBER, WRONG_HEADER, GENERIC_ERROR) for troubleshooting.

---

## Reference Links

- **Legacy Repository:** https://github.com/DEFRA/trade-exportscore-plp
- **Parser Discovery Process:** [find-parser-to-use.md](./find-parser-to-use.md)
- **Model Headers README:** `src/services/model-headers/README.md`
- **Parsers README:** `src/services/parsers/README.md`
- **Matchers README:** `src/services/matchers/README.md`

---

## Quick Reference: File Mapping

| Legacy Location                                                  | New Location                                                | Purpose                |
| ---------------------------------------------------------------- | ----------------------------------------------------------- | ---------------------- |
| `app/services/model-headers/[retailer].js`                       | `src/services/model-headers/[retailer].js`                  | Header configurations  |
| `app/services/matchers/[retailer]/model[N].js`                   | `src/services/matchers/[retailer]/model[N].js`              | Matcher implementation |
| `app/services/parsers/[retailer]/model[N].js`                    | `src/services/parsers/[retailer]/model[N].js`               | Parser implementation  |
| `test/unit/test-data-and-results/models/[retailer]/model[N].js`  | `test/test-data-and-results/models/[retailer]/model[N].js`  | Test data              |
| `test/unit/test-data-and-results/results/[retailer]/model[N].js` | `test/test-data-and-results/results/[retailer]/model[N].js` | Expected results       |
| `app/services/model-headers.js`                                  | `src/services/model-headers.js`                             | Excel headers registry |
| `app/services/parsers.js`                                        | `src/services/parsers/parsers.js`                           | Parser routing         |
| `app/services/parser-model.js`                                   | `src/services/parser-model.js`                              | Model constants        |

---

## Example: Complete Import of ASDA Model 3

This is a complete walkthrough of importing ASDA Model 3:

1. **Gather from legacy repo:**

   - `app/services/model-headers/asda.js` → Extract ASDA3 object
   - `app/services/matchers/asda/model3.js` → Copy entire file
   - `app/services/parsers/asda/model3.js` → Copy entire file
   - `test/unit/test-data-and-results/models/asda/model3.js` → Copy entire file
   - `test/unit/test-data-and-results/results/asda/model3.js` → Copy entire file

2. **Create in new repo:**

   ```bash
   touch src/services/model-headers/asda.js
   mkdir -p src/services/matchers/asda
   touch src/services/matchers/asda/model3.js
   touch src/services/matchers/asda/model3.test.js
   mkdir -p src/services/parsers/asda
   touch src/services/parsers/asda/model3.js
   touch src/services/parsers/asda/model3.test.js
   mkdir -p test/test-data-and-results/models/asda
   touch test/test-data-and-results/models/asda/model3.js
   mkdir -p test/test-data-and-results/results/asda
   touch test/test-data-and-results/results/asda/model3.js
   ```

3. **Convert imports:** Replace `require()` with ES6 `import`

4. **Register:** Add to `model-parsers.js`, and export in `model-headers.js`

5. **Test:** Run unit tests and integration tests

6. **Verify:** Test with real ASDA packing list sample

---

## Support

For questions or issues during migration:

1. Review the [find-parser-to-use.md](./find-parser-to-use.md) document
2. Check existing implementations for similar patterns
3. Review unit tests in the legacy repo for expected behavior
4. Consult with the development team for architecture decisions
