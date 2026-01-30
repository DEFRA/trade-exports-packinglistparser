# Excel-Based Model Import Guide

## Your Role

You are an expert software engineer tasked with importing an Excel-based packing list parser model from a legacy repository into the current project. You will gather requirements, locate source files, transform code to match the new architecture, create tests, and verify the integration works correctly.

## Task Objective

**Import a specific Excel parser model while preserving exact legacy data structures and logic.**

**Success Criteria:**

- All source files migrated and adapted to new project structure
- Parser constant added to `parser-model.js`
- Matcher and parser implemented with correct imports
- Model registered in `model-parsers.js` under `parsersExcel`
- Unit tests created and passing (matcher and parser)
- Parser-service integration tests created and passing
- Integration tests verify parser discovery works
- **No modifications to legacy test data or expected results**
- No modifications to legacy data structures or validation logic

**When to Ask for Clarification:**

- If retailer or model name is ambiguous
- If legacy repository structure differs from expected patterns
- If test data is missing or incomplete
- If validation logic conflicts with documented patterns

---

## Overview

This guide provides step-by-step instructions for importing a specific Excel-based packing list parser model from the legacy `trade-exportscore-plp` repository into the new `trade-exports-packinglistparser` project structure.

**Reference Document:** [parser-discovery-extraction-generic.md](../../docs/flow/parser-discovery-extraction-generic.md) describes the 5-step parser discovery process that all imported models must follow.

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

## Step 0: Gather Required Information

**Before beginning the import, you MUST gather this information from the user:**

### Required Information:

1. **Model Identifier**

   - Ask: "What Excel model are you importing? (e.g., ASDA3, SAINSBURYS1, GIOVANNI3)"
   - Parse into: `RETAILER` and `MODEL_NUMBER`
   - Example: "ASDA3" → Retailer: "ASDA", Model: "3"

2. **Legacy Repository Location**
   - Ask: "What is the legacy repository URL?"
   - Default: `https://github.com/DEFRA/trade-exportscore-plp`
   - Ask: "Are you using a specific branch? (default: main)"

### Verification Steps:

**Before proceeding to Step 1, YOU MUST verify these files exist:**

1. Check legacy repository for:

   - `app/services/model-headers/[retailer].js`
   - `app/services/matchers/[retailer]/model[N].js`
   - `app/services/parsers/[retailer]/model[N].js`
   - `test/unit/test-data-and-results/models/[retailer]/model[N].js` (test data)
   - `test/unit/test-data-and-results/results/[retailer]/model[N].js` (expected results)
   - `test/unit/services/parser-service/[retailer]/model[N].test.js` (parser-service tests)

2. If files are NOT in expected locations, search the repository and ask user to confirm correct paths

3. Inform user which files you found and their locations

---

## Prerequisites

### Required Information

Before starting the migration, gather the following information:

1. **Legacy Repository URL**

   - Default: `https://github.com/DEFRA/trade-exportscore-plp`
   - If using a different repository or branch, note the full URL
   - Example: `https://github.com/DEFRA/trade-exportscore-plp/tree/main`

2. **Retailer Model to Import**

   - Identify the specific retailer (e.g., SAINSBURYS, TESCO, COOP)
   - Identify the model variant (e.g., Model 1, Model 2, Model 3)
   - Examples: SAINSBURYS1, TESCO2, COOP1, ASDA3

3. **Parser Identifier**
   - The exact parser model name used in code (e.g., `ASDA1`, `MARS1`, `TURNERS1`)
   - This is typically `[RETAILER][NUMBER]` format
   - Check legacy repository to confirm exact naming

### Access Requirements

- Read access to the legacy repository
- Ability to clone or download files from the repository
- Understanding of the retailer's packing list format

**💡 Tip:** If you don't have this information, browse the legacy repository structure:

- Model headers: `app/services/model-headers/`
- Matchers: `app/services/matchers/[retailer]/`
- Parsers: `app/services/parsers/[retailer]/`

---

## Migration Steps

### Step 1: Gather Source Files from Legacy Repository

For each retailer model, you'll need to collect the following files from the legacy repo:

#### 1.1 Model Headers Configuration

**Old Location:** `app/services/model-headers/[retailer].js`  
**Example:** `app/services/model-headers/sainsburys.js`

This file contains:

- Establishment number regex patterns
- Header column regex mappings
- Optional field configurations
- Validation flags

**What to extract:**

```javascript
// Example from SAINSBURYS1
SAINSBURYS1: {
  establishmentNumber: {
    regex: /^RMS-GB-000094-\d{3}$/i,
  },
  regex: {
    description: /Description/i,
    nature_of_products: /Nature of Products/i,
    type_of_treatment: /Type of Treatment/i,
    number_of_packages: /Number of Packages/i,
    total_net_weight_kg: /Total Net Weight/i,
  },
  commodity_code: /Commodity Code/i,
  country_of_origin: /Country of Origin/i,
  nirms: /NIRMS \(ENTER yes or no\)/i,
  validateCountryOfOrigin: true,
}
```

#### 1.2 Matcher Implementation

**Old Location:** `app/services/matchers/[retailer]/model[N].js`  
**Example:** `app/services/matchers/sainsburys/model1.js`

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
        !regex.test(
          headers.SAINSBURYS1.establishmentNumber.regex,
          packingList[sheet]
        )
      ) {
        return matcherResult.WRONG_ESTABLISHMENT_NUMBER
      }

      // check for header values
      result = matchesHeader(
        Object.values(headers.SAINSBURYS1.regex),
        packingList[sheet]
      )
      if (result === matcherResult.WRONG_HEADER) {
        return result
      }
    }

    if (result === matcherResult.CORRECT) {
      logger.info(
        { filename },
        `Packing list matches Sainsburys Model 1 with filename: ${filename}`
      )
    }

    return result
  } catch (err) {
    logger.error(
      {
        error: {
          message: err.message,
          stack_trace: err.stack
        }
      },
      'Error in Sainsburys 1 matcher'
    )
    return matcherResult.GENERIC_ERROR
  }
}
```

#### 1.3 Parser Implementation

**Old Location:** `app/services/parsers/[retailer]/model[N].js`  
**Example:** `app/services/parsers/sainsburys/model1.js`

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

    const establishmentNumber =
      regex
        .findMatch(
          headers.SAINSBURYS1.establishmentNumber.regex,
          packingListJson[sheets[0]]
        )
        ?.replaceAll(/\u200B/g, '') ?? null

    const headerTitles = Object.values(headers.SAINSBURYS1.regex)
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
        headers.SAINSBURYS1,
        sheet
      )
      packingListContents = packingListContents.concat(packingListContentsTemp)
    }

    return combineParser.combine(
      establishmentNumber,
      packingListContents,
      true,
      parserModel.SAINSBURYS1,
      establishmentNumbers,
      headers.SAINSBURYS1
    )
  } catch (err) {
    logger.error(
      {
        error: {
          message: err.message,
          stack_trace: err.stack
        }
      },
      'Error in Sainsburys 1 parser'
    )
    return combineParser.combine(null, [], false, parserModel.NOMATCH, [])
  }
}
```

#### 1.4 Test Data (Strongly Recommended)

**Old Location:** `test/unit/test-data-and-results/models/[retailer]/model[N].js`  
**Example:** `test/unit/test-data-and-results/models/sainsburys/model1.js`

Contains sample packing list data for testing.

#### 1.5 Expected Test Results (Strongly Recommended)

**Old Location:** `test/unit/test-data-and-results/results/[retailer]/model[N].js`  
**Example:** `test/unit/test-data-and-results/results/sainsburys/model1.js`

Contains expected parser output for validation.

#### 1.6 Parser-Service Tests (Required)

**Old Location:** `test/unit/services/parser-service/[retailer]/model[N].test.js`  
**Example:** `test/unit/services/parser-service/sainsburys/model1.test.js`

Contains integration tests for the parser-service that verify:

- Parser discovery works correctly
- Country of Origin validation with ineligible items
- NIRMS/Non-NIRMS handling
- Multiple items and sheets processing
- Error handling scenarios

⚠️ **CRITICAL:** Copy this test file EXACTLY from legacy. Do not modify:

- Mock data (e.g., `data-ineligible-items.json` mock entries)
- Test data references
- Expected results
- Test case names or structure

---

### Step 2: Create Model Headers in New Project

**New Location:** `src/services/model-headers/[retailer].js`

#### 2.1 Create Retailer Headers File

If the retailer doesn't exist yet, create a new file:

```bash
touch src/services/model-headers/sainsburys.js
```

#### 2.2 Adapt Header Configuration

Transform the old format to match the new project's structure:

```javascript
/**
 * Sainsburys model headers
 *
 * Provides establishment number regexes and header regex mappings
 * for Sainsburys packing list variants used by matchers.
 */

const sainsburysHeaders = {
  SAINSBURYS1: {
    establishmentNumber: {
      regex: /^RMS-GB-000094-\d{3}$/i
    },
    regex: {
      description: /Description/i,
      nature_of_products: /Nature of Products/i,
      type_of_treatment: /Type of Treatment/i,
      number_of_packages: /Number of Packages/i,
      total_net_weight_kg: /Total Net Weight/i
    },
    // Optional fields
    commodity_code: /Commodity Code/i,
    country_of_origin: /Country of Origin/i,
    nirms: /NIRMS \(ENTER yes or no\)/i,
    // Validation flags
    validateCountryOfOrigin: true,
    findUnitInHeader: false,
    // For models with invalid sheets to skip
    invalidSheets: [],
    // Required and optional field lists
    required: [
      'description',
      'nature_of_products',
      'type_of_treatment',
      'number_of_packages',
      'total_net_weight_kg'
    ],
    optional: ['commodity_code', 'country_of_origin', 'nirms'],
    // Deprecated flag (if applicable)
    deprecated: false
  }
}

export default sainsburysHeaders
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
// Import the new retailer's Excel headers
import sainsburysHeaders from './model-headers/sainsburys.js'

const headers = {
  // Existing Excel retailers...
  ...sainsburysHeaders
}

export default headers
```

**Important:** This file aggregates **Excel-only** headers. CSV headers go in `model-headers-csv.js`, PDF headers in `model-headers-pdf.js`.

---

### Step 3: Create Matcher Implementation

**New Location:** `src/services/matchers/[retailer]/model[N].js`

#### 3.1 Create Directory Structure

```bash
mkdir -p src/services/matchers/sainsburys
touch src/services/matchers/sainsburys/model1.js
```

#### 3.2 Implement Matcher

Adapt the matcher from the legacy repo:

```javascript
/**
 * Sainsburys Model 1 matcher
 *
 * Detects whether a provided Excel-converted packing list matches
 * the Sainsburys Model 1 format by checking the establishment number and
 * header row patterns.
 */
import { createLogger } from '../../../common/helpers/logging/logger.js'
import matcherResult from '../../matcher-result.js'
import { matchesHeader } from '../../matches-header.js'
import * as regex from '../../../utilities/regex.js'
import headers from '../../model-headers.js' // Excel headers registry

const logger = createLogger()

/**
 * Check whether the provided packing list matches Sainsburys Model 1.
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
        !regex.test(
          headers.SAINSBURYS1.establishmentNumber.regex,
          packingList[sheet]
        )
      ) {
        return matcherResult.WRONG_ESTABLISHMENT_NUMBER
      }

      // Check for header values
      result = matchesHeader(
        Object.values(headers.SAINSBURYS1.regex),
        packingList[sheet]
      )

      if (result === matcherResult.WRONG_HEADER) {
        return result
      }
    }

    if (result === matcherResult.CORRECT) {
      logger.info(
        { filename },
        `Packing list matches Sainsburys Model 1 with filename: ${filename}`
      )
    }

    return result
  } catch (err) {
    logger.error(
      {
        error: {
          message: err.message,
          stack_trace: err.stack
        }
      },
      'Error in Sainsburys 1 matcher'
    )
    return matcherResult.GENERIC_ERROR
  }
}
```

**Key Changes:**

- Use ES6 imports instead of `require()`
- Import and use Pino logger via `createLogger()` from `common/helpers/logging/logger.js`
- Use structured logging:
  - Info: `logger.info({ context }, 'message')` - context object first, message second
  - Error: `logger.error({ error: { message: err.message, stack_trace: err.stack } }, 'message')`
  - **Legacy format:** `logger.logInfo(file, function, message)` and `logger.logError(file, function, err)`
  - **New format:** Structured logging with context objects
- Keep the same matching logic

---

### Step 4: Create Parser Implementation

**New Location:** `src/services/parsers/[retailer]/model[N].js`

#### 4.1 Create Directory Structure

```bash
mkdir -p src/services/parsers/sainsburys
touch src/services/parsers/sainsburys/model1.js
```

#### 4.2 Implement Parser

Adapt the parser from the legacy repo:

```javascript
/**
 * Sainsburys Excel parser - Model 1
 * @module parsers/sainsburys/model1
 */
import { createLogger } from '../../../common/helpers/logging/logger.js'
import combineParser from '../../parser-combine.js'
import parserModel from '../../parser-model.js'
import headers from '../../model-headers.js' // Excel headers registry
import { rowFinder } from '../../../utilities/row-finder.js'
import { mapParser } from '../../parser-map.js'
import { matchesHeader } from '../../matches-header.js'
import MatcherResult from '../../matcher-result.js'
import * as regex from '../../../utilities/regex.js'

const logger = createLogger()

/**
 * Parse the provided packing list JSON for Sainsburys model 1.
 * @param {Object} packingListJson - Workbook JSON keyed by sheet name.
 * @returns {Object} Combined parser result.
 */
export function parse(packingListJson) {
  try {
    const sheets = Object.keys(packingListJson)
    let packingListContents = []
    let packingListContentsTemp = []
    let establishmentNumbers = []

    // Find primary establishment number and clean zero-width spaces
    const establishmentNumber =
      regex
        .findMatch(
          headers.SAINSBURYS1.establishmentNumber.regex,
          packingListJson[sheets[0]]
        )
        ?.replaceAll(/\u200B/g, '') ?? null

    // Setup header callback
    const headerTitles = Object.values(headers.SAINSBURYS1.regex)
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
        headers.SAINSBURYS1,
        sheet
      )

      packingListContents = packingListContents.concat(packingListContentsTemp)
    }

    // CRITICAL: Include headers parameter (6th parameter) for CoO validation
    return combineParser.combine(
      establishmentNumber,
      packingListContents,
      true,
      parserModel.SAINSBURYS1,
      establishmentNumbers,
      headers.SAINSBURYS1 // Required for Country of Origin validation
    )
  } catch (err) {
    logger.error(
      {
        error: {
          message: err.message,
          stack_trace: err.stack
        }
      },
      'Error in Sainsburys 1 parser'
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

#### 4.3 Verify Validator Logic

**CRITICAL:** Parsers depend on validator utilities that must also be migrated correctly.

**Compare validator implementations:**

```bash
# Fetch legacy validator
curl -o /tmp/legacy-validator.js https://raw.githubusercontent.com/DEFRA/trade-exportscore-plp/main/app/services/validators/packing-list-validator-utilities.js

# Compare with current implementation
diff /tmp/legacy-validator.js src/services/validators/packing-list-validator-utilities.js
```

**Check for common migration bugs:**

1. **Function call mismatches** - Verify helper functions are called correctly:

   - ✅ Correct: `isInvalidCoO(item.country_of_origin)` - validates CoO value only
   - ❌ Wrong: `hasInvalidCoO(item)` - checks NIRMS AND CoO, causing double-checks

2. **Parameter differences** - Ensure function signatures match:

   ```javascript
   // Legacy
   function hasIneligibleItems(item) {
     return (
       isNirms(item.nirms) &&
       !isInvalidCoO(item.country_of_origin) &&  // ← Note: direct CoO validation
       // ...
     )
   }
   ```

3. **Regex pattern changes** - Verify patterns match exactly:

   - NIRMS patterns: `/^(yes|nirms|green|y|g)$/i` or `/^green lane/i`
   - Non-NIRMS patterns: `/^(no|red|n|r)$/i`, `/^red lane/i`, or `/^non[- ]?nirms/i`

4. **Logic flow changes** - Check conditional statements haven't been reordered or modified

**If tests pass in legacy but fail after migration, validator bugs are the likely cause.**

---

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

### Step 6: Add Test Data (Required)

⚠️ **Test data is critical for validation** - Without it, you cannot verify the migration is correct.

⚠️ **CRITICAL: DO NOT MODIFY TEST DATA OR EXPECTED RESULTS**

Test data and expected results MUST be copied exactly from the legacy repository with only the following changes allowed:

- Converting `module.exports` to `export default`
- Updating import paths to match new project structure

**DO NOT:**

- Add, remove, or modify any test data values
- Change mock data entries
- "Clean up" or "normalize" values
- Add convenience entries that don't exist in legacy
- Modify expected results to match different behavior

If tests fail after migration, fix the CODE (matcher, parser, or service), not the test data.

#### 6.1 Create Test Data Directory

```bash
mkdir -p test/test-data-and-results/models/asda
mkdir -p test/test-data-and-results/results/asda
```

#### 6.2 Copy Test Data Without Modifications

⚠️ **CRITICAL:** Test data variations are intentional - do not "normalize" or "clean up" them.

**Rules for copying test data:**

1. **Copy EXACTLY from legacy** - No modifications to values, row counts, or structure
2. **Preserve all variations** - P value variations test regex pattern matching:
   - NIRMS variations: `'yes'`, `'nirms'`, `'green'`, `'y'`, `'g'`
   - Non-NIRMS variations: `'no'`, `'non-nirms'`, `'non nirms'`, `'red'`, `'r'`, `'n'`
3. **Keep exact row counts** - Don't add/remove rows to "standardize" tests
4. **Maintain row order** - Row positions may be significant for test expectations
5. **Preserve empty/missing fields** - These test validation logic

**Verification:**

```bash
# After copying, verify no unintended changes
cd /path/to/legacy-repo
git diff --no-index \
  test/unit/test-data-and-results/models/[retailer]/model[N].js \
  /path/to/new-repo/test/test-data-and-results/models/[retailer]/model[N].js
```

**Example test data (copied exactly from legacy):**

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
  // ... other test cases - copy ALL exactly as-is
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

### Step 7.5: Create Parser-Service Integration Tests (Required)

**New Location:** `test/parser-service/[retailer]/model[N].test.js`

#### 7.5.1 Copy Parser-Service Test from Legacy

**Old Location:** `test/unit/services/parser-service/[retailer]/model[N].test.js`

⚠️ **CRITICAL:** Copy the parser-service test file EXACTLY from legacy with only these changes:

1. Convert `require()` to ES6 `import`
2. Update import paths to match new project structure
3. Convert `module.exports` to `export default` if applicable
4. **Replace local `'packinglist.wrong'` variables with `INVALID_FILENAME` constant**

**DO NOT modify:**

- Mock data entries (e.g., `vi.mock` for ineligible items)
- Test data references
- Expected results or assertions
- Test case names or describe blocks

#### 7.5.2 Split CoO Validation Tests into Separate Describe Blocks

**To avoid function length linter warnings (> 75 lines), split CoO validation tests into separate describe blocks:**

```javascript
// ❌ WRONG - All CoO tests in one describe block (81 lines → linter error)
describe('MODEL CoO Validation Tests', () => {
  test('NOT within NIRMS Scheme - passes validation', async () => {
    /* ... */
  })
  test('Null NIRMS value - validation errors', async () => {
    /* ... */
  })
  test('Invalid NIRMS value - validation errors', async () => {
    /* ... */
  })
  test('Null CoO Value - validation errors', async () => {
    /* ... */
  })
  test('Invalid CoO Value - validation errors', async () => {
    /* ... */
  })
  test('Ineligible items detected - validation errors', async () => {
    /* ... */
  })
  // ... many more tests
})

// ✅ CORRECT - Split into separate describe blocks by validation type
describe('MODEL CoO Validation Tests - Type 1 - Nirms', () => {
  test('NOT within NIRMS Scheme - passes validation', async () => {
    /* ... */
  })
  test('Null NIRMS value - validation errors', async () => {
    /* ... */
  })
  test('Invalid NIRMS value - validation errors', async () => {
    /* ... */
  })
  test('Null NIRMS value, more than 3 - validation errors with summary', async () => {
    /* ... */
  })
  test('Invalid NIRMS value, more than 3 - validation errors with summary', async () => {
    /* ... */
  })
})

describe('MODEL CoO Validation Tests - Type 1 - CoO', () => {
  test('Null CoO Value - validation errors', async () => {
    /* ... */
  })
  test('Invalid CoO Value - validation errors', async () => {
    /* ... */
  })
  test('Null CoO Value, more than 3 - validation errors with summary', async () => {
    /* ... */
  })
  test('Invalid CoO Value, more than 3 - validation errors with summary', async () => {
    /* ... */
  })
  test('CoO Value is X - passes validation', async () => {
    /* ... */
  })
  test('Valid CoO Validation: Complete packing list with all fields valid', async () => {
    /* ... */
  })
})

describe('MODEL CoO Validation Tests - Type 1 - Ineligible Items', () => {
  test('Ineligible items detected - validation errors', async () => {
    /* ... */
  })
})
```

**Split Pattern Guidelines:**

- Use consistent naming: `[MODEL] CoO Validation Tests - Type 1 - [Category]`
- Categories: `Nirms`, `CoO`, `Ineligible Items` (as applicable to the model)
- Order tests by BAC (Business Acceptance Criteria) sequence within each block
- Each describe block should be < 75 lines to pass linter checks

**Benefits:**

- Passes linter function length rules (< 75 lines per function)
- Better test organization and readability
- Easier to locate specific validation test failures
- Consistent with ASDA3, ICELAND2, and COOP1 patterns

#### 7.5.3 Use Test Constants

Always import and use shared test constants instead of creating local variables:

```javascript
// Import test constants
import { INVALID_FILENAME, NO_MATCH_RESULT } from '../../test-constants.js'

// ❌ WRONG - Creating local variables
test("returns 'No Match' for incorrect file extension", async () => {
  const filename = 'packinglist.wrong' // Shadows higher scope variable
  const invalidTestResult_NoMatch = {
    // Duplicates NO_MATCH_RESULT
    business_checks: {
      all_required_fields_present: false,
      failure_reasons: null
    },
    items: [],
    registration_approval_number: null,
    parserModel: parserModel.NOMATCH
  }
  const result = await parserService.findParser(model.validModel, filename)
  expect(result).toMatchObject(invalidTestResult_NoMatch)
})

// ✅ CORRECT - Using shared constants
test("returns 'No Match' for incorrect file extension", async () => {
  const result = await parserService.findParser(
    model.validModel,
    INVALID_FILENAME
  )
  expect(result).toMatchObject(NO_MATCH_RESULT)
})
```

**Available Test Constants:**

- `INVALID_FILENAME` - `'packinglist.wrong'` - For testing parser matching failures
- `NO_MATCH_RESULT` - Expected result structure when no parser matches (includes `parserModel: parserModel.NOMATCH`)
- `ERROR_SUMMARY_TEXT` - `'in addition to'` - Text fragment used in validation error summaries when more than 3 errors occur

**String Formatting Best Practices:**

- **Always use template literals** (backticks) instead of string concatenation with `+`
- Template literals improve readability and avoid ESLint warnings
- Example: `` `${variable} text` `` instead of `variable + ' text'`

**Avoid Magic Numbers in Test Assertions:**

Define constants for numeric values used in assertions to avoid "no magic numbers" linter warnings:

```javascript
const filename = 'packinglist-model1.xlsx'

// Expected row numbers for multi-sheet test
const EXPECTED_FIRST_DATA_ROW = 2
const EXPECTED_SECOND_DATA_ROW = 3

test('matches valid file with multiple sheets where headers are on different rows', async () => {
  const result = await parserService.findParser(
    model.validModelMultipleSheetsHeadersOnDifferentRows,
    filename
  )

  expect(result.business_checks.all_required_fields_present).toBe(true)
  // ❌ WRONG - Magic numbers
  // expect(result.items[0].row_location.rowNumber).toBe(2)
  // expect(result.items[1].row_location.rowNumber).toBe(3)

  // ✅ CORRECT - Use constants
  expect(result.items[0].row_location.rowNumber).toBe(EXPECTED_FIRST_DATA_ROW)
  expect(result.items[1].row_location.rowNumber).toBe(EXPECTED_SECOND_DATA_ROW)
})
```

**When to Define Constants:**

- Row numbers in assertions (e.g., `rowNumber`, `row_location`)
- Expected counts or indices used multiple times
- Any numeric literal that appears in test assertions
- Repeated string literals that trigger duplicate warnings

**Benefits:**

- Passes linter "no magic numbers" rule
- Self-documenting - constant name explains the value's purpose
- Easier to update if expected values change
- Consistent with ASDA3, ICELAND2, COOP1 patterns

#### 7.5.4 Mock Data Must Match Legacy Exactly

If the legacy test mocks `data-ineligible-items.json`, copy the mock EXACTLY:

```javascript
// ❌ WRONG - Adding entries that don't exist in legacy
vi.mock('../../../src/services/data/data-ineligible-items.json', () => ({
  default: [
    {
      country_of_origin: 'INELIGIBLE_ITEM_ISO',
      commodity_code: '012',
      type_of_treatment: 'INELIGIBLE_ITEM_TREATMENT'
    },
    { commodity_code: '1234', type_of_treatment: 'Processed' } // ← DON'T ADD THIS
  ]
}))

// ✅ CORRECT - Exact copy from legacy
vi.mock('../../../src/services/data/data-ineligible-items.json', () => ({
  default: [
    {
      country_of_origin: 'INELIGIBLE_ITEM_ISO',
      commodity_code: '012',
      type_of_treatment: 'INELIGIBLE_ITEM_TREATMENT'
    }
  ]
}))
```

#### 7.5.5 Parser-Service Test Template

```javascript
// test/parser-service/asda/model3.test.js
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import parserService from '../../../src/services/parser-service.js'
import parserModel from '../../../src/services/parser-model.js'
import model from '../../test-data-and-results/models/asda/model3.js'
import expectedResults from '../../test-data-and-results/results/asda/model3.js'
import { INVALID_FILENAME, NO_MATCH_RESULT } from '../../test-constants.js'

// Mock ineligible items - COPY EXACTLY FROM LEGACY
vi.mock('../../../src/services/data/data-ineligible-items.json', () => ({
  default: [
    // Copy exact entries from legacy test file
  ]
}))

describe('Parser Service - ASDA Model 3', () => {
  const filename = 'packinglist-asda-model3.xls'

  describe('Valid packing lists', () => {
    test('should return correct parser model', () => {
      const result = parserService.findParser(model.validModel, filename)
      expect(result.parserModel).toBe(parserModel.ASDA3)
    })

    test('should parse items correctly', () => {
      const result = parserService.findParser(model.validModel, filename)
      expect(result.items).toEqual(expectedResults.validTestResult.items)
    })
  })

  test("returns 'No Match' for incorrect file extension", async () => {
    const result = await parserService.findParser(
      model.validModel,
      INVALID_FILENAME
    )
    expect(result).toMatchObject(NO_MATCH_RESULT)
  })

  describe('Country of Origin validation', () => {
    // Copy all CoO validation tests from legacy
  })

  describe('Error handling', () => {
    // Copy all error handling tests from legacy
  })
})
```

#### 7.5.6 Verify Test Data Matches Mock

If the test uses ineligible items validation, ensure test data matches the mock:

```javascript
// If mock has: { commodity_code: '012', type_of_treatment: 'INELIGIBLE_ITEM_TREATMENT' }
// Then test data must use these exact values:
{
  commodity_code: '0123456789',  // Must START with '012' to match
  type_of_treatment: 'INELIGIBLE_ITEM_TREATMENT'  // Must match exactly
}
```

---

### Step 9: Verify Integration

#### 9.1 Run Tests

```bash
# Run all tests for the model
npm test -- --grep "ASDA Model 3"

# Run parser-service tests specifically
npm test -- test/parser-service/asda/model3.test.js
```

#### 9.2 Test Parser Discovery

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

#### 9.3 Verify REMOS Validation

Ensure the parser correctly rejects files without REMOS:

```javascript
test('rejects packing list without REMOS', () => {
  const parser = getExcelParser(model.noRemosModel, 'test.xlsx')
  expect(parser.parserModel).toBe('NOREMOS')
})
```

#### 9.4 Compare with Legacy Repository on Test Failures

⚠️ **If migrated tests fail but legacy tests pass, check CODE first, then DATA.**

**Step-by-step debugging process:**

1. **Fetch and run legacy tests:**

   ```bash
   # Clone legacy repo if not already available
   git clone https://github.com/DEFRA/trade-exportscore-plp.git /tmp/legacy-plp
   cd /tmp/legacy-plp

   # Install and run tests for the specific model
   npm install
   npm test -- test/unit/services/parsers/[retailer]/model[N].test.js
   ```

2. **Compare test data files:**

   ```bash
   # Check test data differences
   diff -u \
     /tmp/legacy-plp/test/unit/test-data-and-results/models/[retailer]/model[N].js \
     test/test-data-and-results/models/[retailer]/model[N].js

   # Check expected results differences
   diff -u \
     /tmp/legacy-plp/test/unit/test-data-and-results/results/[retailer]/model[N].js \
     test/test-data-and-results/results/[retailer]/model[N].js
   ```

3. **Compare validator implementations:**

   ```bash
   # Fetch legacy validator
   curl -o /tmp/legacy-validator.js \
     https://raw.githubusercontent.com/DEFRA/trade-exportscore-plp/main/app/services/validators/packing-list-validator-utilities.js

   # Compare with migrated version
   diff -u /tmp/legacy-validator.js \
     src/services/validators/packing-list-validator-utilities.js | less
   ```

4. **Check for common migration bugs:**

   - **Validator function calls:** Search for function name mismatches
     ```bash
     # Check for hasInvalidCoO vs isInvalidCoO usage
     grep -n "hasInvalidCoO\|isInvalidCoO" src/services/validators/*.js
     ```
   - **Missing parameters:** Verify 6th parameter in combineParser.combine() calls
     ```bash
     grep -A 7 "combineParser.combine" src/services/parsers/[retailer]/*.js
     ```
   - **Regex pattern changes:** Compare header regex patterns
     ```bash
     diff -u \
       /tmp/legacy-plp/app/services/model-headers/[retailer].js \
       src/services/model-headers/[retailer].js
     ```

5. **Document findings:**

   Create a migration issues log:

   ```markdown
   # Migration Issues - [Retailer] Model [N]

   ## Test Failures

   - Test: [test name]
   - Expected: [expected result]
   - Actual: [actual result]

   ## Root Cause

   - [ ] Test data mismatch (copied incorrectly)
   - [ ] Validator logic bug (function call mismatch)
   - [ ] Parser logic bug (missing parameters)
   - [ ] Regex pattern change (header mismatch)

   ## Resolution

   [Describe fix applied]
   ```

**Priority order for investigation:**

1. ✅ Validator utilities logic (most common cause)
2. ✅ Test data exact match with legacy
3. ✅ Parser combineParser.combine() parameters
4. ✅ Header regex patterns and validation flags
5. ✅ Helper function parameter signatures

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
  - [ ] Test data (**copy exactly, no modifications**)
  - [ ] Expected results (**copy exactly, no modifications**)
  - [ ] Parser-service tests (**copy exactly, no modifications**)

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

- [ ] **Step 6:** Added test data (**no modifications allowed**)

  - [ ] Created test data directory structure
  - [ ] Copied test models exactly from legacy (only import path changes)
  - [ ] Copied expected results exactly from legacy (only import path changes)
  - [ ] Verified test data matches legacy using diff

- [ ] **Step 7:** Created unit tests

  - [ ] Created matcher tests next to matcher file (same directory)
  - [ ] Created parser tests next to parser file (same directory)
  - [ ] Tests cover all matcher result codes
  - [ ] Tests verify correct parsing output

- [ ] **Step 7.5:** Created parser-service tests (**no modifications allowed**)

  - [ ] Created test directory structure (`test/parser-service/[retailer]/`)
  - [ ] Copied parser-service test exactly from legacy
  - [ ] Mock data matches legacy exactly (no added entries)
  - [ ] Test data values match mock requirements
  - [ ] All parser-service tests pass

- [ ] **Step 9:** Verified integration
  - [ ] All unit tests pass
  - [ ] All parser-service tests pass
  - [ ] Parser discovery test passes
  - [ ] REMOS validation test passes
  - [ ] Tested with real packing list samples (if available)

---

## Troubleshooting

### Common Issues

#### Issue: Parser-service tests fail with ineligible items validation

**Symptoms:** Tests expecting ineligible items to be detected fail

**Solutions:**

1. **Verify mock data matches legacy exactly** - Do not add extra mock entries
2. **Check test data uses correct values** - commodity_code and type_of_treatment must match mock
3. **Ensure mock is placed correctly** - `vi.mock()` must be before imports that use the data

**Example:**

```javascript
// Mock from legacy - copy EXACTLY, don't add entries
vi.mock('../../../src/services/data/data-ineligible-items.json', () => ({
  default: [
    {
      country_of_origin: 'INELIGIBLE_ITEM_ISO',
      commodity_code: '012',
      type_of_treatment: 'INELIGIBLE_ITEM_TREATMENT'
    }
  ]
}))

// Test data must use values that match the mock
// commodity_code: '0123456789' starts with '012' ✓
// type_of_treatment: 'INELIGIBLE_ITEM_TREATMENT' matches exactly ✓
```

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

#### Issue: Tests pass in legacy but fail after migration

**Symptoms:** Legacy tests pass with same data, but migrated tests fail

**Root Cause:** Usually a code migration bug, not test data issue

**Debugging Steps:**

1. **Compare validator logic first:**

   ```bash
   # Fetch legacy validator
   curl -o /tmp/legacy-validator.js https://raw.githubusercontent.com/DEFRA/trade-exportscore-plp/main/app/services/validators/packing-list-validator-utilities.js

   # Search for the specific validation function
   grep -A 20 "function hasIneligibleItems" /tmp/legacy-validator.js
   grep -A 20 "function hasIneligibleItems" src/services/validators/packing-list-validator-utilities.js
   ```

2. **Check for function call mismatches:**

   - Legacy: `!isInvalidCoO(item.country_of_origin)` ✅
   - Migrated: `!hasInvalidCoO(item)` ❌ (double-checks NIRMS)

3. **Verify test data is identical:**

   ```bash
   diff -u \
     /tmp/legacy-plp/test/unit/test-data-and-results/models/[retailer]/model[N].js \
     test/test-data-and-results/models/[retailer]/model[N].js
   ```

4. **Check parser parameters:**

   - Ensure all 6 parameters passed to `combineParser.combine()`
   - Verify parameter order matches legacy

5. **Run legacy tests to confirm baseline:**
   ```bash
   cd /tmp/legacy-plp
   npm test -- test/unit/services/parsers/[retailer]/model[N].test.js
   ```

**Example Bug:**

```javascript
// ❌ WRONG - Double-checks NIRMS status
function hasIneligibleItems(item) {
  return (
    isNirms(item.nirms) &&
    !hasInvalidCoO(item) &&  // hasInvalidCoO internally checks isNirms again
    // ...
  )
}

// ✅ CORRECT - Validates only CoO value
function hasIneligibleItems(item) {
  return (
    isNirms(item.nirms) &&
    !isInvalidCoO(item.country_of_origin) &&  // Just validates CoO
    // ...
  )
}
```

---

## Best Practices

1. **Keep Regex Patterns Identical:** Don't modify regex patterns from the legacy repo unless absolutely necessary. Any changes may break parsing.

2. **Test with Real Data:** Always test with actual packing list samples from the retailer if available.

3. **Compare with Legacy First:** When tests fail, always check the legacy repository for differences in CODE before modifying TEST DATA.

4. **NEVER Modify Test Data or Expected Results:** Test data and expected results must be copied exactly from legacy. If tests fail, fix the code (matcher, parser, or validator), not the test data. The only allowed changes are:

   - Converting `module.exports` to `export default`
   - Updating import paths

5. **NEVER Add Mock Entries That Don't Exist in Legacy:** When copying parser-service tests, copy mock data exactly. Do not add "convenience" entries that weren't in the original test.

6. **Preserve Test Data Exactly:** Don't "normalize" or "clean up" test data - variations are intentional to test regex patterns.

7. **Verify Validator Logic:** Compare validator utility functions line-by-line with legacy - subtle function call differences cause bugs.

8. **Document Quirks:** Add comments explaining any model-specific behaviors or edge cases.

9. **Version Control:** Commit after each major step (headers, matcher, parser) to make debugging easier.

10. **Code Review:** Have another developer review the implementation, especially regex patterns and matching logic.

11. **Performance:** If a model processes very large files, consider adding performance optimizations like early returns or sheet filtering.

12. **Logging:** Include meaningful log messages for debugging parser discovery and matching issues.

13. **Error Handling:** Always return appropriate error codes (EMPTY_FILE, WRONG_ESTABLISHMENT_NUMBER, WRONG_HEADER, GENERIC_ERROR) for troubleshooting.

14. **Include Parser-Service Tests:** Always copy and include the parser-service integration tests from legacy - these validate the complete parsing workflow including CoO validation.

---

## Reference Links

- **Legacy Repository:** https://github.com/DEFRA/trade-exportscore-plp
- **Parser Discovery Process:** [parser-discovery-extraction-generic.md](../../docs/flow/parser-discovery-extraction-generic.md)
- **Model Headers README:** `src/services/model-headers/README.md`
- **Parsers README:** `src/services/parsers/README.md`
- **Matchers README:** `src/services/matchers/README.md`

---

## Quick Reference: File Mapping

| Legacy Location                                                  | New Location                                                | Purpose                             |
| ---------------------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------- |
| `app/services/model-headers/[retailer].js`                       | `src/services/model-headers/[retailer].js`                  | Header configurations               |
| `app/services/matchers/[retailer]/model[N].js`                   | `src/services/matchers/[retailer]/model[N].js`              | Matcher implementation              |
| `app/services/parsers/[retailer]/model[N].js`                    | `src/services/parsers/[retailer]/model[N].js`               | Parser implementation               |
| `test/unit/test-data-and-results/models/[retailer]/model[N].js`  | `test/test-data-and-results/models/[retailer]/model[N].js`  | Test data (copy exactly)            |
| `test/unit/test-data-and-results/results/[retailer]/model[N].js` | `test/test-data-and-results/results/[retailer]/model[N].js` | Expected results (copy exactly)     |
| `test/unit/services/parser-service/[retailer]/model[N].test.js`  | `test/parser-service/[retailer]/model[N].test.js`           | Parser-service tests (copy exactly) |
| `app/services/model-headers.js`                                  | `src/services/model-headers.js`                             | Excel headers registry              |
| `app/services/parsers.js`                                        | `src/services/parsers/parsers.js`                           | Parser routing                      |
| `app/services/parser-model.js`                                   | `src/services/parser-model.js`                              | Model constants                     |

---

## Example: Complete Import of ASDA Model 3

This is a complete walkthrough of importing ASDA Model 3:

1. **Gather from legacy repo:**

   - `app/services/model-headers/asda.js` → Extract ASDA3 object
   - `app/services/matchers/asda/model3.js` → Copy entire file
   - `app/services/parsers/asda/model3.js` → Copy entire file
   - `test/unit/test-data-and-results/models/asda/model3.js` → Copy EXACTLY (no modifications)
   - `test/unit/test-data-and-results/results/asda/model3.js` → Copy EXACTLY (no modifications)
   - `test/unit/services/parser-service/asda/model3.test.js` → Copy EXACTLY (no modifications)

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
   mkdir -p test/parser-service/asda
   touch test/parser-service/asda/model3.test.js
   ```

3. **Convert imports:** Replace `require()` with ES6 `import`

4. **Register:** Add to `model-parsers.js`, and export in `model-headers.js`

5. **Test:** Run unit tests, parser-service tests, and integration tests

   ```bash
   npm test -- test/parser-service/asda/model3.test.js
   npm test
   ```

6. **Verify:** All tests pass, including parser-service tests

---

## Support

For questions or issues during migration:

1. Review the [parser-discovery-extraction-generic.md](../../docs/flow/parser-discovery-extraction-generic.md) document
2. Check existing implementations for similar patterns
3. Review unit tests in the legacy repo for expected behavior
4. Consult with the development team for architecture decisions
