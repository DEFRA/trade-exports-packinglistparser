# CSV-Based Model Import Guide

## Your Role

You are an expert software engineer tasked with importing a CSV-based packing list parser model from a legacy repository into the current project. You will gather requirements, locate source files, transform code to match the new architecture, create tests, and verify the integration works correctly.

## Task Objective

**Import a specific CSV parser model while preserving exact legacy data structures and logic.**

**Success Criteria:**

- All source files migrated and adapted to new project structure
- Parser constant added to `parser-model.js`
- Matcher and parser implemented with correct imports
- Model registered in `model-parsers.js` under `parsersCsv`
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

## Quick Start Checklist

Before diving into the detailed guide, use this checklist to ensure you have everything ready:

- [ ] **Identify the model** - Know retailer name and model number (e.g., ASDA4, ICELAND2)
- [ ] **Check headers exist** - Verify if headers already defined in `src/services/model-headers/[retailer].js`
- [ ] **Gather legacy files** - Locate matcher, parser, and test data from legacy repo
- [ ] **Correct import paths** - Use `/logger.js` for logging, `model-headers-csv.js` for CSV
- [ ] **Add parser constant** - Update `src/services/parser-model.js` with new constant
- [ ] **Create matcher** - Implement in `src/services/matchers/[retailer]/model[N].js`
- [ ] **Create parser** - Implement in `src/services/parsers/[retailer]/model[N].js`
- [ ] **Register in model-parsers** - Add imports and register in `parsersCsv` object
- [ ] **Create test files** - Matcher test and parser test (`.test.js` files)
- [ ] **Copy test data** - To `test/test-data-and-results/models-csv/` and `results-csv/`
- [ ] **Copy parser-service tests** - To `test/parser-service/[retailer]/` (copy exactly from legacy)
- [ ] **Run tests** - Execute `npm test -- matchers/[retailer]/model[N]` and parsers
- [ ] **Verify integration** - Check parser is discovered by system

**Common Mistakes to Avoid:**

- ❌ Using `logging.js` instead of `logging/logger.js`
- ❌ Putting test data in `test/parser-service/` instead of `test/test-data-and-results/`
- ❌ Forgetting to pass headers (6th parameter) to `combineParser.combine()`
- ❌ Not registering parser in `model-parsers.js`
- ❌ Using `[packingList[0]]` with `matchesHeader()` for CSV

---

## Overview

This guide provides step-by-step instructions for importing a specific CSV-based packing list parser model from the legacy `trade-exportscore-plp` repository into the new `trade-exports-packinglistparser` project structure.

**Reference Document:** [parser-discovery-extraction-generic.md](../../docs/flow/parser-discovery-extraction-generic.md) describes the 5-step parser discovery process that all imported models must follow.

---

## Step 0: Gather Required Information

**Before beginning the import, you MUST gather this information from the user:**

### Required Information:

1. **Model Identifier**

   - Ask: "What CSV model are you importing? (e.g., ASDA4, LIDL1, ICELAND2)"
   - Parse into: `RETAILER` and `MODEL_NUMBER`
   - Example: "ASDA4" → Retailer: "ASDA", Model: "4"

2. **Legacy Repository Location**
   - Ask: "What is the legacy repository URL?"
   - Default: `https://github.com/DEFRA/trade-exportscore-plp`
   - Ask: "Are you using a specific branch? (default: main)"

### Verification Steps:

**Before proceeding to Step 1, YOU MUST verify these files exist:**

1. Check legacy repository for:

   - `app/services/model-headers-csv/[retailer].js` OR `app/services/model-headers/[retailer].js`
   - `app/services/matchers-csv/[retailer]/model[N].js` OR `app/services/matchers/[retailer]/model[N].js`
   - `app/services/parsers-csv/[retailer]/model[N].js` OR `app/services/parsers/[retailer]/model[N].js`
   - `test/unit/test-data-and-results/models-csv/[retailer]/model[N].js` (test data)
   - `test/unit/test-data-and-results/results-csv/[retailer]/model[N].js` (expected results)
   - `test/unit/services/parser-service/[retailer]/model[N].test.js` (parser-service tests)

2. If files are NOT in expected locations, search the repository and ask user to confirm correct paths

3. Inform user which files you found and their locations

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

## Critical Import Paths

⚠️ **IMPORTANT:** Use the correct import paths to avoid errors:

### Logging

```javascript
// ✓ CORRECT
import { createLogger } from '../../../common/helpers/logging/logger.js'
const logger = createLogger()

// ✗ INCORRECT
import { createLogger } from '../../../common/helpers/logging.js' // Missing /logger.js
```

### Model Headers (CSV)

```javascript
// For CSV matchers and parsers
import csvHeaders from '../../model-headers-csv.js'

// Access like:
csvHeaders.ASDA4.establishmentNumber.regex
csvHeaders.ASDA4.regex.classification_code
```

### Common Imports Pattern

```javascript
// Matcher imports
import { createLogger } from '../../../common/helpers/logging/logger.js'
import matcherResult from '../../matcher-result.js'
import { matchesHeader } from '../../matches-header.js'
import * as regex from '../../../utilities/regex.js'
import csvHeaders from '../../model-headers-csv.js'

// Parser imports
import { createLogger } from '../../../common/helpers/logging/logger.js'
import combineParser from '../../parser-combine.js'
import parserModel from '../../parser-model.js'
import csvHeaders from '../../model-headers-csv.js'
import { rowFinder } from '../../../utilities/row-finder.js'
import { mapParser } from '../../parser-map.js'
import { matchesHeader } from '../../matches-header.js'
import MatcherResult from '../../matcher-result.js'
import * as regex from '../../../utilities/regex.js'
```

---

## Prerequisites

### Required Information

Before starting the migration, gather the following information:

1. **Legacy Repository URL**

   - Default: `https://github.com/DEFRA/trade-exportscore-plp`
   - If using a different repository or branch, note the full URL
   - Example: `https://github.com/DEFRA/trade-exportscore-plp/tree/main`

2. **CSV Retailer Model to Import**

   - Identify the specific retailer (e.g., LIDL, KEPAK, ICELAND)
   - Identify the model variant (e.g., Model 1, Model 2)
   - Examples: LIDL1, KEPAK2, ICELAND1_CSV

3. **Parser Identifier**
   - The exact CSV parser model name used in code (e.g., `LIDL1`, `KEPAK2`)
   - This is typically `[RETAILER][NUMBER]` format
   - Check legacy repository to confirm exact naming
   - Note: CSV parsers may be in `model-headers-csv` or `model-headers` directory

### Access Requirements

- Read access to the legacy repository
- Ability to clone or download files from the repository
- Understanding of the retailer's CSV packing list format
- Sample CSV files for testing (recommended)

**💡 Tip:** If you don't have this information, browse the legacy repository structure:

- CSV model headers: `app/services/model-headers-csv/` or `app/services/model-headers/`
- CSV matchers: `app/services/matchers-csv/[retailer]/` or `app/services/matchers/[retailer]/`
- CSV parsers: `app/services/parsers-csv/[retailer]/` or `app/services/parsers/[retailer]/`

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
export function matches(packingList, filename) {
  try {
    if (!packingList || packingList.length === 0) {
      return matcherResult.EMPTY_FILE
    }

    // Check for correct establishment number
    if (!regex.test(csvHeaders.LIDL1.establishmentNumber.regex, packingList)) {
      return matcherResult.WRONG_ESTABLISHMENT_NUMBER
    }

    // Check header values (first row)
    const result = matchesHeader(
      Object.values(csvHeaders.LIDL1.regex),
      packingList // Pass entire packingList, not [packingList[0]]
    )

    if (result === matcherResult.WRONG_HEADER) {
      return result
    }

    if (result === matcherResult.CORRECT) {
      logger.info(
        `Packing list matches LIDL Model 1 with filename: ${filename}`
      )
      return matcherResult.CORRECT
    }

    return matcherResult.EMPTY_FILE
  } catch (error) {
    logger.error(`Error in LIDL Model 1 matcher: ${error.message}`)
    return matcherResult.EMPTY_FILE
  }
}
```

**Key CSV-Specific Differences:**

- `packingList` is an array of rows, not an object with sheets
- Header check uses `packingList` directly (matchesHeader handles CSV arrays)
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

#### 1.3 Test Data Structure

**IMPORTANT:** Test data for CSV models has a specific structure:

**Location Pattern:**

- Test data models: `test/test-data-and-results/models-csv/[retailer]/model[N].js`
- Expected results: `test/test-data-and-results/results-csv/[retailer]/model[N].js`

**Example for ASDA4:**

```
test/
  test-data-and-results/
    models-csv/
      asda/
        model4.js      # Test data arrays
    results-csv/
      asda/
        model4.js      # Expected parser output
```

**Test Data Format:**

```javascript
// test/test-data-and-results/models-csv/asda/model4.js
const validModel = [
  ['', 'classification_code', 'article_description', ...],  // Header row
  [attestationText, '1234567890', 'Test Product 1', ...],   // Data row 1
  ['', '9876543210', 'Test Product 2', ...]                 // Data row 2
]

export default {
  validModel,
  emptyModel,
  wrongEstablishmentNumber,
  wrongHeaders,
  invalidModel_MissingColumnCells
}
```

**Expected Results Format:**

```javascript
// test/test-data-and-results/results-csv/asda/model4.js
import parserModel from '../../../src/services/parser-model.js'

const validTestResult = {
  business_checks: {
    all_required_fields_present: true,
    failure_reasons: null
  },
  items: [
    /* parsed items */
  ],
  registration_approval_number: 'RMS-GB-000015-001',
  parserModel: parserModel.ASDA4
}

export default { validTestResult }
```

#### 1.4 Parser Implementation

**Old Location:** `app/services/parsers-csv/[retailer]/model[N].js` or `app/services/parsers/[retailer]/model[N].js`  
**Example:** `app/services/parsers-csv/lidl/model1.js`

This file implements the `parse()` function that:

- Finds establishment numbers
- Identifies header row (usually index 0)
- Extracts item data using mapParser
- Combines results

**What to extract:**

```javascript
export function parse(packingListCsv) {
  try {
    // Find primary establishment number
    const establishmentNumber = regex.findMatch(
      csvHeaders.LIDL1.establishmentNumber.regex,
      packingListCsv
    )

    // Find all establishment numbers
    const establishmentNumbers = regex.findAllMatches(
      regex.remosRegex,
      packingListCsv,
      []
    )

    // Setup header callback
    const headerTitles = Object.values(csvHeaders.LIDL1.regex)
    const headerCallback = function (x) {
      return matchesHeader(headerTitles, [x]) === MatcherResult.CORRECT
    }

    // Find header row (typically 0 for CSV, but use rowFinder for flexibility)
    const headerRow = rowFinder(packingListCsv, headerCallback)
    const dataRow = headerRow + 1

    // Map data rows (null for sheet name since CSV has no sheets)
    const packingListContents = mapParser(
      packingListCsv,
      headerRow,
      dataRow,
      csvHeaders.LIDL1,
      null
    )

    // CRITICAL: Include headers parameter (6th parameter) for CoO validation
    return combineParser.combine(
      establishmentNumber,
      packingListContents,
      true,
      parserModel.LIDL1,
      establishmentNumbers,
      csvHeaders.LIDL1 // Required for Country of Origin validation
    )
  } catch (err) {
    logger.error(`Error parsing LIDL Model 1: ${err.message}`, {
      stack: err.stack
    })
    return {
      business_checks: {
        all_required_fields_present: false
      },
      items: [],
      registration_approval_number: null,
      parserModel: parserModel.NOMATCH
    }
  }
}
```

**Key CSV-Specific Differences:**

- No sheet iteration
- Header row is typically `0` (first row)
- Data row is typically `1` (second row)
- `mapParser` receives `null` for sheet name parameter
- Simpler overall structure

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

#### 4.3 Verify Validator Logic

**CRITICAL:** CSV parsers depend on the same validator utilities as Excel parsers. Validator bugs affect ALL parser types.

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
mkdir -p test/test-data-and-results/models-csv/lidl
mkdir -p test/test-data-and-results/results-csv/lidl
```

#### 6.2 Copy Test Data Without Modifications

⚠️ **CRITICAL:** Test data variations are intentional - do not "normalize" or "clean up" them.

**Rules for copying CSV test data:**

1. **Copy EXACTLY from legacy** - No modifications to values, row counts, or structure
2. **Preserve all variations** - NIRMS value variations test regex pattern matching:
   - NIRMS variations: `'yes'`, `'nirms'`, `'green'`, `'y'`, `'g'`
   - Non-NIRMS variations: `'no'`, `'non-nirms'`, `'non nirms'`, `'red'`, `'r'`, `'n'`
3. **Keep exact row counts** - Don't add/remove rows to "standardize" tests
4. **Maintain row order** - Row positions may be significant for test expectations
5. **Preserve empty/missing fields** - These test validation logic
6. **Keep array structure** - CSV test data is array of arrays, not objects

**Verification:**

```bash
# After copying, verify no unintended changes
cd /path/to/legacy-repo
git diff --no-index \
  test/unit/test-data-and-results/models-csv/[retailer]/model[N].js \
  /path/to/new-repo/test/test-data-and-results/models-csv/[retailer]/model[N].js
```

**Copy test models from legacy repo:**

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

### Step 7.5: Create Parser-Service Integration Tests (Required)

**New Location:** `test/parser-service/[retailer]/model[N].test.js`

#### 7.5.1 Copy Parser-Service Test from Legacy

**Old Location:** `test/unit/services/parser-service/[retailer]/model[N].test.js`

⚠️ **CRITICAL:** Copy the parser-service test file EXACTLY from legacy with only these changes:

1. Convert `require()` to ES6 `import`
2. Update import paths to match new project structure
3. Convert `module.exports` to `export default` if applicable

**DO NOT modify:**

- Mock data entries (e.g., `vi.mock` for ineligible items)
- Test data references
- Expected results or assertions
- Test case names or describe blocks

#### 7.5.2 Mock Data Must Match Legacy Exactly

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

#### 7.5.3 Parser-Service Test Template

```javascript
// test/parser-service/lidl/model1.test.js
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import parserService from '../../../src/services/parser-service.js'
import parserModel from '../../../src/services/parser-model.js'
import model from '../../test-data-and-results/models-csv/lidl/model1.js'
import expectedResults from '../../test-data-and-results/results-csv/lidl/model1.js'

// Mock ineligible items - COPY EXACTLY FROM LEGACY
vi.mock('../../../src/services/data/data-ineligible-items.json', () => ({
  default: [
    // Copy exact entries from legacy test file
  ]
}))

describe('Parser Service - LIDL Model 1 CSV', () => {
  const filename = 'packinglist.csv'

  describe('Valid packing lists', () => {
    test('should return correct parser model', () => {
      const result = parserService.findParser(model.validModel, filename)
      expect(result.parserModel).toBe(parserModel.LIDL1)
    })

    test('should parse items correctly', () => {
      const result = parserService.findParser(model.validModel, filename)
      expect(result.items).toEqual(expectedResults.validTestResult.items)
    })
  })

  describe('Country of Origin validation', () => {
    // Copy all CoO validation tests from legacy
  })

  describe('Error handling', () => {
    // Copy all error handling tests from legacy
  })
})
```

#### 7.5.4 Verify Test Data Matches Mock

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
npm test -- --grep "LIDL Model 1"

# Run parser-service tests specifically
npm test -- test/parser-service/lidl/model1.test.js
```

#### 9.2 Test Parser Discovery

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

#### 9.3 Verify REMOS Validation

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
   npm test -- test/unit/services/parsers-csv/[retailer]/model[N].test.js
   ```

2. **Compare test data files:**

   ```bash
   # Check CSV test data differences
   diff -u \
     /tmp/legacy-plp/test/unit/test-data-and-results/models-csv/[retailer]/model[N].js \
     test/test-data-and-results/models-csv/[retailer]/model[N].js

   # Check expected results differences
   diff -u \
     /tmp/legacy-plp/test/unit/test-data-and-results/results-csv/[retailer]/model[N].js \
     test/test-data-and-results/results-csv/[retailer]/model[N].js
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
       /tmp/legacy-plp/app/services/model-headers-csv/[retailer].js \
       src/services/model-headers/[retailer].js
     ```

5. **Document findings:**

   Create a migration issues log:

   ```markdown
   # Migration Issues - [Retailer] CSV Model [N]

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
  - [ ] Test data (**copy exactly, no modifications**)
  - [ ] Expected results (**copy exactly, no modifications**)
  - [ ] Parser-service tests (**copy exactly, no modifications**)

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

- [ ] **Step 6:** Added test data (**no modifications allowed**)

  - [ ] Created test data directory structure
  - [ ] Copied CSV test models exactly from legacy (only import path changes)
  - [ ] Copied expected results exactly from legacy (only import path changes)
  - [ ] Verified test data matches legacy using diff

- [ ] **Step 7:** Created unit tests

  - [ ] Created matcher tests next to matcher file (same directory)
  - [ ] Created parser tests next to parser file (same directory)
  - [ ] Tests cover all matcher result codes
  - [ ] Tests verify correct parsing output
  - [ ] Tests handle empty/null input

- [ ] **Step 7.5:** Created parser-service tests (**no modifications allowed**)

  - [ ] Created test directory structure (`test/parser-service/[retailer]/`)
  - [ ] Copied parser-service test exactly from legacy
  - [ ] Mock data matches legacy exactly (no added entries)
  - [ ] Test data values match mock requirements
  - [ ] All parser-service tests pass

- [ ] **Step 9:** Verified integration
  - [ ] All unit tests pass
  - [ ] All parser-service tests pass
  - [ ] CSV parser discovery test passes
  - [ ] REMOS validation test passes (NOREMOSCSV)
  - [ ] Tested with real CSV samples (if available)

---

## Troubleshooting

### Common CSV-Specific Issues

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

#### Issue: Tests pass in legacy but fail after migration

**Symptoms:** Legacy tests pass with same data, but migrated CSV tests fail

**Root Cause:** Usually a code migration bug in validator utilities, not CSV-specific issue

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

3. **Verify CSV test data is identical:**

   ```bash
   diff -u \
     /tmp/legacy-plp/test/unit/test-data-and-results/models-csv/[retailer]/model[N].js \
     test/test-data-and-results/models-csv/[retailer]/model[N].js
   ```

4. **Check parser parameters:**

   - Ensure all 6 parameters passed to `combineParser.combine()`
   - Verify `null` passed for sheet name (5th parameter)
   - Verify header config passed as 6th parameter

5. **Run legacy tests to confirm baseline:**
   ```bash
   cd /tmp/legacy-plp
   npm test -- test/unit/services/parsers-csv/[retailer]/model[N].test.js
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

## Common Pitfalls and Solutions

Based on actual import experience (e.g., ASDA4), here are the most common issues and how to avoid them:

### 1. Incorrect Import Paths

**Problem:** Using wrong paths causes "module not found" errors
**Symptoms:**

- `Cannot find module '../../../common/helpers/logging.js'`
- `Cannot find module '../../model-headers.js'` (when you need `model-headers-csv.js`)

**Solution:** Use exact paths from existing CSV implementations:

```javascript
// ✓ CORRECT
import { createLogger } from '../../../common/helpers/logging/logger.js' // Note: /logger.js at end
import csvHeaders from '../../model-headers-csv.js' // For CSV models

// ✗ WRONG
import { createLogger } from '../../../common/helpers/logging.js' // Missing /logger.js
import headers from '../../model-headers.js' // Wrong file for CSV
```

### 2. Test Data Location Mismatch

**Problem:** Tests fail because data is in wrong folder
**Symptoms:**

- `Cannot find module '../../../../test/parser-service/asda/model4.data.js'`

**Solution:** CSV test data goes in `test/test-data-and-results/`, not `test/parser-service/`:

```javascript
// ✓ CORRECT - Test data location
test / test - data - and - results / models - csv / asda / model4.js
test / test - data - and - results / results - csv / asda / model4.js

// ✗ WRONG - Parser service folder is for integration tests
test / parser - service / asda / model4.data.js
test / parser - service / asda / model4.results.js
```

**Test imports should be:**

```javascript
// ✓ CORRECT
import model from '../../../../test/test-data-and-results/models-csv/asda/model4.js'
import expectedResults from '../../../../test/test-data-and-results/results-csv/asda/model4.js'
```

### 3. Using Object.freeze() Instead of export default

**Problem:** Parser model constants not accessible
**Symptoms:** `Cannot read property 'ASDA4' of undefined`

**Solution:** Check `parser-model.js` exports properly:

```javascript
// ✓ CORRECT
export default Object.freeze({
  ASDA4: 'ASDA4'
})

// ✗ WRONG
const parserModel = Object.freeze({
  ASDA4: 'ASDA4'
})
// Missing: export default parserModel
```

### 4. Incorrect matchesHeader Usage for CSV

**Problem:** Matcher returns WRONG_HEADER for valid files
**Symptoms:** Tests fail even though headers look correct

**Solution:** CSV uses different matchesHeader pattern:

```javascript
// ✓ CORRECT - Pass entire packingList array
const result = matchesHeader(Object.values(csvHeaders.ASDA4.regex), packingList)

// ✗ WRONG - Don't wrap in extra array
const result = matchesHeader(Object.values(csvHeaders.ASDA4.regex), [
  packingList[0]
])
```

### 5. Missing CRITICAL Headers Parameter in combineParser

**Problem:** Country of Origin validation doesn't work
**Symptoms:** Tests pass but validation logic fails in production

**Solution:** Always pass headers as 6th parameter to combineParser.combine():

```javascript
// ✓ CORRECT - Includes headers parameter
return combineParser.combine(
  establishmentNumber,
  packingListContents,
  true,
  parserModel.ASDA4,
  establishmentNumbers,
  csvHeaders.ASDA4 // CRITICAL: Required for CoO validation
)

// ✗ WRONG - Missing headers
return combineParser.combine(
  establishmentNumber,
  packingListContents,
  true,
  parserModel.ASDA4,
  establishmentNumbers
)
```

### 6. Test Expectations Too Strict

**Problem:** Parser works but tests fail on minor differences
**Symptoms:**

- Expected 2 items but got 3 (empty row at end)
- Missing `total_net_weight_unit` field

**Solution:** Use flexible assertions or adjust expectations:

```javascript
// ✓ BETTER - Test key behaviors, not exact structure
expect(result.business_checks.all_required_fields_present).toBe(true)
expect(result.registration_approval_number).toBe('RMS-GB-000015-001')
expect(result.parserModel).toBe('ASDA4')
expect(result.items.length).toBeGreaterThan(0)
expect(result.items[0]).toMatchObject({
  commodity_code: '1234567890',
  description: 'Test Product 1'
})

// ✗ TOO STRICT - Fails on minor variations
expect(result).toEqual(exactExpectedObject) // Breaks if any field differs
```

### 7. Wrong Logging Pattern

**Problem:** Logger calls fail
**Symptoms:** `logger.logInfo is not a function`

**Solution:** Use pino-style logging (new pattern), not legacy pattern:

```javascript
// ✓ CORRECT - Pino logger style
logger.info(`Packing list matches ASDA Model 4 with filename: ${filename}`)
logger.error(`Error in matcher: ${error.message}`, { stack: error.stack })

// ✗ WRONG - Legacy logger style
logger.logInfo(filename, 'matches()', 'message')
logger.logError(filename, 'matches()', error)
```

### 8. Forgetting to Export Functions

**Problem:** Tests can't import matcher/parser functions
**Symptoms:** `matches is not a function`, `parse is not a function`

**Solution:** Always export functions:

```javascript
// ✓ CORRECT
export function matches(packingList, filename) {
  // ...
}

export function parse(packingListCsv) {
  // ...
}

// ✗ WRONG
function matches(packingList, filename) {
  // ...
}
// Missing: export
```

### 9. Not Registering in model-parsers.js

**Problem:** Parser never discovered by system
**Symptoms:** Always falls back to NOREMOSCSV or UNRECOGNISED

**Solution:** Register in BOTH places:

```javascript
// 1. Import at top of model-parsers.js
import { matches as matchesAsda4 } from './matchers/asda/model4.js'
import { parse as parseAsda4 } from './parsers/asda/model4.js'

// 2. Add to parsersCsv object
const parsersCsv = {
  // ... existing parsers
  ASDA4: {
    matches: matchesAsda4,
    parse: parseAsda4
  }
}
```

### 10. Using rowFinder Incorrectly

**Problem:** Headers not found even though they exist
**Symptoms:** Parser returns NOMATCH

**Solution:** For CSV, header is usually row 0, but use rowFinder for consistency:

```javascript
// ✓ CORRECT - Use rowFinder with proper callback
const headerTitles = Object.values(csvHeaders.ASDA4.regex)
const headerCallback = function (x) {
  return matchesHeader(headerTitles, [x]) === MatcherResult.CORRECT
}
const headerRow = rowFinder(packingListCsv, headerCallback)

// ✗ RISKY - Hardcoding may fail on variant formats
const headerRow = 0 // What if there's a title row first?
```

---

## CSV-Specific Best Practices

1. **Compare with Legacy First:** When tests fail, always check the legacy repository for differences in CODE before modifying TEST DATA. Validator bugs affect all parser types (Excel, CSV, PDF).

2. **NEVER Modify Test Data or Expected Results:** Test data and expected results must be copied exactly from legacy. If tests fail, fix the code (matcher, parser, or validator), not the test data. The only allowed changes are:

   - Converting `module.exports` to `export default`
   - Updating import paths

3. **NEVER Add Mock Entries That Don't Exist in Legacy:** When copying parser-service tests, copy mock data exactly. Do not add "convenience" entries that weren't in the original test.

4. **Preserve Test Data Exactly:** Don't "normalize" or "clean up" CSV test data - variations are intentional to test regex patterns.

5. **Verify Validator Logic:** Compare validator utility functions line-by-line with legacy - subtle function call differences cause bugs across all parsers.

6. **Header Detection:** Most CSVs have header at index 0, but always verify. Some may have metadata rows first.

7. **Empty Row Handling:** CSVs often have trailing empty rows. Filter these before processing:

```javascript
const validRows = csv.filter((row) =>
  row.some((cell) => cell != null && cell !== '')
)
```

8. **Cell Value Sanitization:** CSV cells may have extra whitespace:

```javascript
const cleanValue = cell?.toString().trim()
```

9. **Array Bounds Checking:** Always verify row exists before accessing:

```javascript
if (headerRow >= 0 && headerRow < csv.length) {
  // Process header
}
```

10. **REMOS Format:** Verify REMOS follows `RMS-GB-XXXXXX-XXX` pattern

11. **Sheet Name:** Always pass `null` for sheet name in CSV parsers (5th parameter to mapParser)

12. **Test Data Format:** CSV test data should be array of arrays, not objects:

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

13. **Performance:** CSVs are typically smaller than Excel files, but still validate input size

14. **Encoding:** Be aware of CSV encoding issues (UTF-8, BOM markers, etc.)

15. **Delimiter Handling:** Verify CSV uses standard comma delimiter

16. **Include Parser-Service Tests:** Always copy and include the parser-service integration tests from legacy - these validate the complete parsing workflow including CoO validation.

---

## Reference Links

- **Legacy Repository:** https://github.com/DEFRA/trade-exportscore-plp
- **Parser Discovery Process:** [parser-discovery-extraction-generic.md](../../docs/flow/parser-discovery-extraction-generic.md)
- **Detailed Flow:** [parser-discovery-extraction-detailed.md](../../docs/flow/parser-discovery-extraction-detailed.md)
- **Excel Import Guide:** [EXCEL-MODEL-IMPORT-GUIDE.prompt.md](./EXCEL-MODEL-IMPORT-GUIDE.prompt.md)
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

1. Review this guide and the [Excel Import Guide](./EXCEL-MODEL-IMPORT-GUIDE.prompt.md)
2. Check [parser-discovery-extraction-detailed.md](../../docs/flow/parser-discovery-extraction-detailed.md) for CSV flow
3. Review existing CSV implementations for patterns
4. Check unit tests in the legacy repo for expected behavior
5. Consult with the development team for architecture decisions
