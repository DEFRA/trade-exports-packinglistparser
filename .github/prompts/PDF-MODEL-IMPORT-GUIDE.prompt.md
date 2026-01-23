# PDF-Based Model Import Guide

## Your Role

You are an expert software engineer tasked with importing a PDF-based packing list parser model from a legacy repository into the current project. PDF parsers use coordinate-based extraction to extract structured data. You will gather requirements, locate source files (including coordinate data), transform code to match the new architecture, create tests, and verify the integration works correctly.

## Task Objective

**Import a specific PDF parser model while preserving exact legacy data structures and coordinate mappings.**

**Success Criteria:**

- All source files migrated including PDF headers with coordinates
- Parser constant added to `parser-model.js`
- Matcher and parser implemented with correct imports
- Model registered in `model-parsers.js` under `parsersPdf`
- Coordinate-based extraction logic preserved exactly
- Unit tests created and passing with PDF data
- Integration tests verify parser discovery works
- No modifications to legacy data structures or validation logic

**When to Ask for Clarification:**

- If retailer or model name is ambiguous
- If coordinate data is missing or unclear
- If legacy repository structure differs from expected patterns
- If test data is missing or incomplete

---

## Overview

This guide provides step-by-step instructions for importing a specific PDF-based packing list parser model from the legacy `trade-exportscore-plp` repository into the new `trade-exports-packinglistparser` project structure.

**PDF parsers use coordinate-based extraction to extract structured data from PDF documents.** They differ significantly from Excel/CSV parsers in their data structures and processing logic.

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
   - PDF-specific utilities for coordinate-based field extraction

3. **Legacy Header Structure** - PDF headers must follow exact pattern:
   - `headers` object with field coordinate definitions
   - `x`, `x1`, `x2` properties for horizontal positioning
   - `minHeadersY`, `maxHeadersY` for vertical positioning
   - Optional `totals` regex to identify summary rows
   - Validation flags at root level

**DO NOT** attempt to "modernize" or "simplify" these structures. The entire system depends on the legacy format for compatibility with downstream services.

---

## PDF Parser Characteristics

### Key Differences from Excel/CSV Parsers

1. **Data Structure:**

   - Excel/CSV: Array of arrays or object with sheet keys
   - PDF: Structured data with coordinate-based field positioning

2. **Header Matching:**

   - Excel/CSV: Regex patterns match cell values
   - PDF: Coordinate-based matching with `x1`/`x2` boundaries and regex validation

3. **Field Extraction:**

   - Excel/CSV: Cell-based extraction by column index
   - PDF: Coordinate-based extraction using bounding boxes

4. **Validation:**

   - Excel/CSV: Header row validation
   - PDF: Coordinate validation, header Y-position validation, totals filtering

5. **Models:**
   - PDF models often have variants (e.g., BOOKER1, BOOKER1L) for different page layouts

---

## Step 0: Gather Required Information

**Before beginning the import, you MUST gather this information from the user:**

### Required Information:

1. **Model Identifier**

   - Ask: "What PDF model are you importing? (e.g., MANDS1, BOOKER1L, GIOVANNI3)"
   - Parse into: `RETAILER`, `MODEL_NUMBER`, and `VARIANT` (if present)
   - Example: "BOOKER1L" → Retailer: "BOOKER", Model: "1", Variant: "L" (landscape)

2. **Legacy Repository Location**

   - Ask: "What is the legacy repository URL?"
   - Default: `https://github.com/DEFRA/trade-exportscore-plp`
   - Ask: "Are you using a specific branch? (default: main)"

### Verification Steps:

**Before proceeding to Step 1, YOU MUST verify these files exist:**

1. Check legacy repository for:

   - `app/services/model-headers/[retailer].js` (should contain PDF headers with coordinates)
   - `app/services/matchers/[retailer]/model[N].js` OR `model[N]-pdf.js`
   - `app/services/parsers/[retailer]/model[N].js` OR `model[N]-pdf.js`

2. Verify the headers file contains PDF-specific data (coordinate values like `x1`, `x2`, `minHeadersY`)

3. If files are NOT in expected locations, search the repository and ask user to confirm correct paths

4. Inform user which files you found and their locations

---

## Prerequisites

### Required Information

Before starting the migration, gather the following information:

1. **Legacy Repository URL**

   - Default: `https://github.com/DEFRA/trade-exportscore-plp`
   - If using a different repository or branch, note the full URL
   - Example: `https://github.com/DEFRA/trade-exportscore-plp/tree/main`

2. **PDF Retailer Model to Import**

   - Identify the specific retailer (e.g., MANDS, BOOKER, GIOVANNI)
   - Identify the model variant (e.g., Model 1, Model 1 Landscape)
   - Examples: MANDS1, BOOKER1, BOOKER1L, GIOVANNI1
   - Note: PDF models often have layout variants (portrait vs landscape)

3. **Parser Identifier**

   - The exact PDF parser model name used in code (e.g., `MANDS1`, `BOOKER1`, `BOOKER1L`)
   - This is typically `[RETAILER][NUMBER]` or `[RETAILER][NUMBER]L` format
   - Check legacy repository to confirm exact naming

### Access Requirements

- Read access to the legacy repository
- Ability to clone or download files from the repository
- Sample PDF files for testing (recommended)

**💡 Tip:** If you don't have this information, browse the legacy repository structure:

- PDF model headers: `app/services/model-headers/` (look for coordinate definitions)
- PDF matchers: `app/services/matchers/[retailer]/model[N].js`
- PDF parsers: `app/services/parsers/[retailer]/model[N].js`
- Test data: `test/unit/test-data-and-results/models/[retailer]/model[N].js`

---

## Migration Steps

### Step 1: Gather Source Files from Legacy Repository

For each PDF retailer model, you'll need to collect the following files from the legacy repo:

#### 1.1 Model Headers Configuration

**Old Location:** `app/services/model-headers/[retailer].js`  
**Example:** `app/services/model-headers/mands.js`

This file contains PDF-specific header configurations with coordinate data.

**What to extract:**

```javascript
// Example from MANDS1
const pdfMandsHeaders = {
  MANDS1: {
    establishmentNumber: {
      regex: /RMS-GB-000008-\d{3}/i,
      establishmentRegex: /RMS-GB-000008-\d{3}/i
    },
    headers: {
      description: {
        x1: 75,
        x2: 200,
        regex: /Description of Goods/i
      },
      commodity_code: {
        x1: 255,
        x2: 330,
        regex: /EU Commodity Code/i
      },
      type_of_treatment: {
        x1: 335,
        x2: 395,
        regex: /Treatment Type/i
      },
      number_of_packages: {
        x1: 440,
        x2: 480,
        regex: /Trays\/Ctns/i
      },
      total_net_weight_kg: {
        x1: 550,
        x2: 600,
        regex: /Tot Net Weight/i
      }
    },
    minHeadersY: 214,
    maxHeadersY: 225,
    validateCountryOfOrigin: true,
    findUnitInHeader: true,
    footer: /Delivery IDs|\* see certification/
  }
}
```

#### 1.2 Matcher Implementation

**Old Location:** `app/services/matchers/[retailer]/model[N].js`  
**Example:** `app/services/matchers/mands/model1.js` (if exists)

**Note:** Many PDF parsers may not have separate matcher files in the legacy repo. The matching logic is often integrated into the parser itself or uses a generic PDF matcher.

**Common PDF Matcher Pattern:**

```javascript
function matches(packingList, filename) {
  try {
    // Check for valid PDF data structure
    if (!packingList || !packingList.data) {
      return matcherResult.EMPTY_FILE
    }

    // Validate establishment number in PDF text
    const text = extractTextFromData(packingList.data)
    if (!regex.test(headers.MANDS1.establishmentNumber.regex, text)) {
      return matcherResult.WRONG_ESTABLISHMENT_NUMBER
    }

    // Validate required fields exist
    const requiredFields = Object.keys(headers.MANDS1.headers)
    const hasRequiredFields = validatePdfFields(
      packingList.data,
      requiredFields
    )

    if (!hasRequiredFields) {
      return matcherResult.WRONG_HEADER
    }

    return matcherResult.CORRECT
  } catch (err) {
    logger.logError(filenameForLogging, 'matches()', err)
    return matcherResult.GENERIC_ERROR
  }
}
```

#### 1.3 Parser Implementation

**Old Location:** `app/services/parsers/[retailer]/model[N].js` or AI-specific directory  
**Example:** `app/services/parsers/mands/model1.js`

PDF parsers extract data from PDF output and map it to the legacy structure.

**What to extract:**

```javascript
function parse(pdfData) {
  try {
    if (!pdfData || !pdfData.data) {
      return combineParser.combine(null, [], false, parserModel.NOMATCH, [])
    }

    const data = pdfData.data
    let packingListContents = []
    let establishmentNumbers = []

    // Extract establishment number
    const establishmentNumber = extractEstablishmentNumber(
      data,
      headers.MANDS1.establishmentNumber
    )

    // Extract items from table data
    const items = extractTableItems(data, headers.MANDS1.headers)

    // Filter out total rows if configured
    if (headers.MANDS1.totals) {
      packingListContents = items.filter(
        (item) => !regex.test(headers.MANDS1.totals, item.description)
      )
    } else {
      packingListContents = items
    }

    // Find all establishment numbers
    establishmentNumbers = extractAllEstablishments(
      data,
      headers.MANDS1.establishmentNumber.establishmentRegex
    )

    return combineParser.combine(
      establishmentNumber,
      packingListContents,
      true,
      parserModel.MANDS1,
      establishmentNumbers,
      headers.MANDS1
    )
  } catch (err) {
    logger.logError(filenameForLogging, 'parse()', err)
    return combineParser.combine(null, [], false, parserModel.NOMATCH, [])
  }
}
```

#### 1.4 Test Data (Optional but Recommended)

**Old Location:** `test/unit/test-data-and-results/models-pdf/[retailer]/model[N].js`  
**Example:** `test/unit/test-data-and-results/models-pdf/mands/model1.js`

Contains sample PDF data for testing. This is typically a structured object with coordinate and field information.

#### 1.5 Expected Test Results (Optional but Recommended)

**Old Location:** `test/unit/test-data-and-results/results-pdf/[retailer]/model[N].js`  
**Example:** `test/unit/test-data-and-results/results-pdf/mands/model1.js`

Contains expected parser output for validation.

---

### Step 2: Create Model Headers in New Project

**New Location:** `src/services/model-headers/[retailer].js`

#### 2.1 Create or Update Retailer Headers File

If the retailer doesn't exist yet, create a new file:

```bash
touch src/services/model-headers/mands.js
```

If the retailer already has Excel/CSV headers, add PDF headers to the same file.

#### 2.2 Adapt PDF Header Configuration

Transform the old format to match the new project's structure:

**PDF Headers Example:**

```javascript
/**
 * M&S model headers
 *
 * Provides establishment number patterns and field mappings
 * for M&S packing list variants.
 */

// PDF headers
const pdfMandsHeaders = {
  MANDS1: {
    establishmentNumber: {
      regex: /RMS-GB-000008-\d{3}/i,
      establishmentRegex: /RMS-GB-000008-\d{3}/i
    },
    headers: {
      description: {
        x1: 75,
        x2: 200,
        regex: /Description of Goods/i
      },
      commodity_code: {
        x1: 255,
        x2: 330,
        regex: /EU Commodity Code/i
      },
      type_of_treatment: {
        x1: 335,
        x2: 395,
        regex: /Treatment Type/i
      },
      number_of_packages: {
        x1: 440,
        x2: 480,
        regex: /Trays\/Ctns/i
      },
      total_net_weight_kg: {
        x1: 550,
        x2: 600,
        regex: /Tot Net Weight/i
      }
    },
    // Required fields list
    required: [
      'description',
      'commodity_code',
      'type_of_treatment',
      'number_of_packages',
      'total_net_weight_kg'
    ],
    // Optional fields
    optional: ['country_of_origin', 'nirms'],
    // Y-coordinate range for header row
    minHeadersY: 214,
    maxHeadersY: 225,
    // Validation flags
    validateCountryOfOrigin: true,
    findUnitInHeader: true,
    // Footer pattern to identify end of data
    footer: /Delivery IDs|\* see certification/,
    // Deprecated flag (if applicable)
    deprecated: false
  }
}

export { pdfMandsHeaders }
```

**Key Changes:**

- Use ES6 **named exports** (`export { pdfRetailerHeaders }`) instead of `module.exports`
- **PRESERVE the exact same structure and coordinate values from legacy**
- Add `required` and `optional` arrays listing field names
- Keep coordinate data (`x1`, `x2`, `minHeadersY`, `maxHeadersY`) exactly as in legacy

**PDF Header Structure Rules:**

1. **Simple headers:** Field name → String mapping (e.g., `description: "Part Description"`)
2. **Coordinate headers:** Field name → Object with `x`, `x1`, `x2`, `regex` properties
3. **Totals filtering:** Add `totals` regex if summary rows need to be excluded
4. **Y-position validation:** Add `minHeadersY` and `maxHeadersY` if header position varies

#### 2.3 Export Headers in PDF Registry

Update `src/services/model-headers-pdf.js`:

```javascript
/**
 * PDF model headers registry
 *
 * Aggregates PDF-specific header configurations from individual retailer modules.
 * Used by PDF parsers to map extracted fields.
 */
import { pdfMandsHeaders } from './model-headers/mands.js'
import { pdfBookerHeaders } from './model-headers/booker.js'

const headers = {
  ...pdfMandsHeaders,
  ...pdfBookerHeaders
  // Add new PDF retailers here
}

export default headers
```

**Important:** This file aggregates **PDF-only** headers. Excel headers go in `model-headers.js`, CSV headers in `model-headers-csv.js`.

---

### Step 3: Create Matcher Implementation

**New Location:** `src/services/matchers/[retailer]/model[N].js`

#### 3.1 Create Directory Structure

```bash
mkdir -p src/services/matchers/mands
touch src/services/matchers/mands/model1.js
```

#### 3.2 Implement PDF Matcher

Adapt the matcher from the legacy repo:

```javascript
/**
 * M&S Model 1 PDF matcher
 *
 * Detects whether a provided PDF data matches
 * the M&S Model 1 PDF format by checking the establishment number
 * and required field presence.
 */
import { createLogger } from '../../../common/helpers/logging/logger.js'
import matcherResult from '../../matcher-result.js'
import * as regex from '../../../utilities/regex.js'
import headers from '../../model-headers-pdf.js' // PDF headers registry

const logger = createLogger()

/**
 * Check whether the provided PDF data matches M&S Model 1 PDF.
 * @param {Object} pdfData - PDF data object
 * @param {string} filename - Source filename for logging
 * @returns {string} - One of matcherResult codes
 */
export function matches(pdfData, filename) {
  try {
    // Check for valid PDF data structure
    if (!pdfData || !pdfData.data) {
      return matcherResult.EMPTY_FILE
    }

    const data = pdfData.data

    // Extract text content for establishment number validation
    const textContent = extractAllText(data)

    // Check for correct establishment number
    if (!regex.test(headers.MANDS1.establishmentNumber.regex, textContent)) {
      return matcherResult.WRONG_ESTABLISHMENT_NUMBER
    }

    // Validate required fields are present
    const requiredFieldNames = Object.keys(headers.MANDS1.headers)
    const hasRequiredFields = validateRequiredPdfFields(
      data,
      requiredFieldNames
    )

    if (!hasRequiredFields) {
      return matcherResult.WRONG_HEADER
    }

    logger.info({ filename }, 'Packing list matches M&S Model 1 PDF')

    return matcherResult.CORRECT
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

/**
 * Extract all text content from PDF data
 * @param {Object} data - PDF data object
 * @returns {string} - Concatenated text content
 */
function extractAllText(data) {
  // Implementation depends on PDF data structure
  // This is a simplified example
  let text = ''

  if (data.tables && Array.isArray(data.tables)) {
    data.tables.forEach((table) => {
      if (table.cells) {
        table.cells.forEach((cell) => {
          text += (cell.text || '') + ' '
        })
      }
    })
  }

  return text
}

/**
 * Validate that required PDF fields are present
 * @param {Object} data - PDF data object
 * @param {Array<string>} requiredFields - List of required field names
 * @returns {boolean} - True if all required fields present
 */
function validateRequiredPdfFields(data, requiredFields) {
  // Implementation depends on how fields are structured
  // This is a simplified example
  return requiredFields.every((fieldName) => {
    // Check if field exists in PDF data
    return data[fieldName] !== undefined
  })
}
```

**Key Changes:**

- Use ES6 imports instead of `require()`
- Import from `model-headers-pdf.js` (not `model-headers.js`)
- Import and use Pino logger via `createLogger()`
- Use structured logging
- Adapt validation logic for PDF data structure

**PDF-Specific Considerations:**

- PDF data has different structure than Excel/CSV (tables, cells, coordinates)
- May need to extract text from multiple pages
- Coordinate-based validation if using advanced headers
- Field confidence scores can be checked for quality validation (if available)

---

### Step 4: Create Parser Implementation

**New Location:** `src/services/parsers/[retailer]/model[N].js`

#### 4.1 Create Directory Structure

```bash
mkdir -p src/services/parsers/mands
touch src/services/parsers/mands/model1.js
```

#### 4.2 Implement PDF Parser

Adapt the parser from the legacy repo:

**PDF Parser Example:**

```javascript
/**
 * M&S PDF parser - Model 1
 * @module parsers/mands/model1
 */
import { createLogger } from '../../../common/helpers/logging/logger.js'
import combineParser from '../../parser-combine.js'
import parserModel from '../../parser-model.js'
import headers from '../../model-headers-pdf.js' // PDF headers registry
import * as regex from '../../../utilities/regex.js'

const logger = createLogger()

/**
 * Parse the provided PDF data for M&S PDF model 1.
 * @param {Object} pdfData - PDF data object
 * @returns {Object} Combined parser result.
 */
export function parse(pdfData) {
  try {
    if (!pdfData || !pdfData.data) {
      return combineParser.combine(null, [], false, parserModel.NOMATCH, [])
    }

    const data = pdfData.data
    let packingListContents = []
    let establishmentNumbers = []

    // Extract primary establishment number
    const establishmentNumber = extractEstablishmentNumber(
      data,
      headers.MANDS1.establishmentNumber
    )

    // Extract all establishment numbers
    establishmentNumbers = extractAllEstablishments(
      data,
      headers.MANDS1.establishmentNumber.establishmentRegex
    )

    // Extract items from table data
    packingListContents = extractTableItems(data, headers.MANDS1.headers)

    // CRITICAL: Include headers parameter (6th parameter)
    return combineParser.combine(
      establishmentNumber,
      packingListContents,
      true,
      parserModel.MANDS1,
      establishmentNumbers,
      headers.MANDS1
    )
  } catch (err) {
    logger.error({ err }, 'Error in parse()')
    return combineParser.combine(null, [], false, parserModel.NOMATCH, [])
  }
}

/**
 * Extract establishment number from PDF data
 * @param {Object} data - PDF data
 * @param {Object} config - Establishment number configuration
 * @returns {string|null} - Establishment number or null
 */
function extractEstablishmentNumber(data, config) {
  // Extract text and search for establishment number
  const text = extractAllText(data)
  const match = text.match(config.regex)
  return match ? match[0] : config.value || null
}

/**
 * Extract all establishment numbers from data
 * @param {Object} data - PDF data
 * @param {RegExp} regex - Establishment number pattern
 * @returns {Array<string>} - Array of establishment numbers
 */
function extractAllEstablishments(data, regex) {
  const text = extractAllText(data)
  const matches = text.match(regex)
  return matches ? [...new Set(matches)] : []
}

/**
 * Extract table items from PDF data
 * @param {Object} data - PDF data
 * @param {Object} headerConfig - Header field configuration
 * @returns {Array<Object>} - Array of packing list items
 */
function extractTableItems(data, headerConfig) {
  const items = []

  // Process tables from PDF data
  if (data.tables && Array.isArray(data.tables)) {
    data.tables.forEach((table) => {
      if (table.cells) {
        // Group cells by row
        const rows = groupCellsByRow(table.cells)

        // Find header row
        const headerRow = findHeaderRow(rows, headerConfig)

        // Extract data rows
        rows.forEach((row, index) => {
          if (index > headerRow) {
            const item = extractItemFromRow(row, headerConfig)
            if (item && isValidItem(item)) {
              items.push(item)
            }
          }
        })
      }
    })
  }

  return items
}

/**
 * Extract all text from PDF data
 * @param {Object} data - PDF data
 * @returns {string} - Concatenated text
 */
function extractAllText(data) {
  let text = ''

  if (data.tables && Array.isArray(data.tables)) {
    data.tables.forEach((table) => {
      if (table.cells) {
        table.cells.forEach((cell) => {
          text += (cell.text || '') + ' '
        })
      }
    })
  }

  return text
}

/**
 * Group table cells by row number
 * @param {Array} cells - Array of table cells
 * @returns {Array<Array>} - Cells grouped by row
 */
function groupCellsByRow(cells) {
  const rowMap = new Map()

  cells.forEach((cell) => {
    const rowIndex = cell.rowIndex
    if (!rowMap.has(rowIndex)) {
      rowMap.set(rowIndex, [])
    }
    rowMap.get(rowIndex).push(cell)
  })

  return Array.from(rowMap.values())
}

/**
 * Find the header row in table rows
 * @param {Array<Array>} rows - Table rows
 * @param {Object} headerConfig - Header configuration
 * @returns {number} - Header row index
 */
function findHeaderRow(rows, headerConfig) {
  const headerFieldNames = Object.values(headerConfig)

  for (let i = 0; i < rows.length; i++) {
    const rowText = rows[i].map((cell) => cell.text).join(' ')
    const matchCount = headerFieldNames.filter((fieldName) =>
      rowText.includes(fieldName)
    ).length

    if (matchCount >= headerFieldNames.length * 0.5) {
      return i
    }
  }

  return -1
}

/**
 * Extract item data from a table row
 * @param {Array} row - Table row cells
 * @param {Object} headerConfig - Header configuration
 * @returns {Object|null} - Extracted item or null
 */
function extractItemFromRow(row, headerConfig) {
  const item = {}

  // Map header config field names to cell positions
  // This is simplified - actual implementation depends on
  // how the PDF data structures the output

  Object.entries(headerConfig).forEach(([fieldName, headerText]) => {
    const cell = row.find(
      (c) => c.columnIndex === getColumnIndexForHeader(headerText, row)
    )
    item[fieldName] = cell ? cell.text : null
  })

  return item
}

/**
 * Get column index for a header field
 * @param {string} headerText - Header text to find
 * @param {Array} row - Table row
 * @returns {number} - Column index
 */
function getColumnIndexForHeader(headerText, row) {
  // Simplified - actual implementation would map headers to columns
  return 0
}

/**
 * Validate that an item has required data
 * @param {Object} item - Parsed item
 * @returns {boolean} - True if valid
 */
function isValidItem(item) {
  return item.description && item.description.trim().length > 0
}
```

**Key Changes:**

- Use ES6 imports instead of `require()`
- Import from `model-headers-pdf.js`
- Import and use Pino logger
- **CRITICAL:** Pass headers as 6th parameter to `combineParser.combine()`
- Handle PDF data structure (tables, cells, boundingBox)

#### 4.3 Verify Validator Logic

**CRITICAL:** PDF parsers depend on the same validator utilities as Excel/CSV parsers. Validator bugs affect ALL parser types.

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

### Step 5: Register Parser and Matcher

#### 5.1 Update Parser Model Constants

Add the new PDF model to `src/services/parser-model.js`:

```javascript
export default {
  // Existing models...
  MANDS1: 'MANDS1' // PDF model
  // ...
}
```

#### 5.2 Update parsers.js or model-parsers.js

Add the new PDF parser:

```javascript
// Import new PDF parser
import { parse as parseMands1 } from './mands/model1.js'
import { matches as matchesMands1 } from '../matchers/mands/model1.js'

// In the parsersPdf object (or create if doesn't exist):
const parsersPdf = {
  MANDS1: {
    parse: parseMands1,
    matches: matchesMands1,
    type: 'pdf',
    parserModel: 'MANDS1'
  }
  // ... other PDF parsers
}
```

---

### Step 6: Copy Test Data and Results (Required)

⚠️ **Test data is critical for validation** - Without it, you cannot verify the migration is correct.

#### 6.1 Create Test Data Directory

```bash
mkdir -p test/test-data-and-results/models-pdf/mands
mkdir -p test/test-data-and-results/results-pdf/mands
```

#### 6.2 Copy Test Data and Results WITHOUT ANY Modifications

🚫 **CRITICAL: DO NOT MODIFY TEST DATA OR EXPECTED RESULTS**

The test data (`models-pdf/`) and expected results (`results-pdf/`) files must be copied **exactly** from the legacy repository. These files represent real-world packing list data and the validated expected outputs - any modification would invalidate the tests.

**What NOT to do:**

- ❌ Do not "clean up" or "normalize" test data
- ❌ Do not fix apparent "typos" in test data (they may be intentional variations)
- ❌ Do not modify expected result values
- ❌ Do not add new test cases to these files
- ❌ Do not remove test cases from these files
- ❌ Do not reformat or restructure the data

**What TO do:**

- ✅ Copy test data files exactly as they are in legacy
- ✅ Copy expected results files exactly as they are in legacy
- ✅ Only update import paths if the directory structure differs

**Rules for copying PDF test data:**

1. **Copy EXACTLY from legacy** - No modifications to PDF data structure or expected results
2. **Preserve all variations** - Field value variations test regex pattern matching:
   - NIRMS variations: `'yes'`, `'nirms'`, `'green'`, `'y'`, `'g'`
   - Non-NIRMS variations: `'no'`, `'non-nirms'`, `'non nirms'`, `'red'`, `'r'`, `'n'`
3. **Keep exact item counts** - Don't add/remove items to "standardize" tests
4. **Maintain coordinate data** - Preserve boundingBox values exactly
5. **Preserve confidence scores** - These may be used for validation (if available)
6. **Keep PDF data structure** - Don't simplify the JSON structure
7. **Preserve expected results exactly** - The results files define what correct parsing looks like

**Verification:**

```bash
# After copying, verify no unintended changes
cd /path/to/legacy-repo
git diff --no-index \
  test/unit/test-data-and-results/models-pdf/[retailer]/model[N].js \
  /path/to/new-repo/test/test-data-and-results/models-pdf/[retailer]/model[N].js
```

**Note:** PDF data may be quite large. Consider using abbreviated/simplified versions for tests.

```javascript
// test/test-data-and-results/models-pdf/mands/model1.js
export default {
  validModel: {
    data: {
      tables: [
        {
          cells: [
            {
              rowIndex: 0,
              columnIndex: 0,
              text: 'Description of Goods',
              boundingBox: [75, 214, 200, 214, 200, 225, 75, 225]
            },
            {
              rowIndex: 0,
              columnIndex: 1,
              text: 'EU Commodity Code',
              boundingBox: [255, 214, 330, 214, 330, 225, 255, 225]
            },
            {
              rowIndex: 1,
              columnIndex: 0,
              text: 'Test Product',
              boundingBox: [75, 230, 200, 230, 200, 245, 75, 245]
            },
            {
              rowIndex: 1,
              columnIndex: 1,
              text: '0201100000',
              boundingBox: [255, 230, 330, 230, 330, 245, 255, 245]
            }
            // ... more cells
          ]
        }
      ]
    }
  }
  // ... other test cases
}
```

Copy expected results:

```javascript
// test/test-data-and-results/results-pdf/mands/model1.js
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
        commodity_code: '0201100000',
        number_of_packages: 10,
        total_net_weight_kg: 100.5
      }
    ],
    establishment_numbers: ['RMS-GB-000008-001'],
    registration_approval_number: 'RMS-GB-000008-001',
    parserModel: parserModel.MANDS1
  }
}
```

---

### Step 7: Migrate Unit Tests from Legacy Repository

🚫 **CRITICAL: DO NOT CREATE NEW TESTS - MIGRATE ALL EXISTING TESTS**

The unit tests in the legacy repository are designed to validate the specific behaviour of each parser model. You must migrate these tests to Vitest format, preserving all test logic and assertions.

**What NOT to do:**

- ❌ Do not write new tests from scratch
- ❌ Do not modify test assertions or expected values
- ❌ Do not add new test cases
- ❌ Do not remove test cases
- ❌ Do not change test names or descriptions
- ❌ Do not "improve" or "simplify" test logic

**What TO do:**

- ✅ Migrate all test files from the legacy repository
- ✅ Convert Jest syntax to Vitest (imports from 'vitest' instead of Jest globals)
- ✅ Update import paths to match the new directory structure
- ✅ Convert CommonJS (`require`/`module.exports`) to ES6 (`import`/`export`)
- ✅ Verify all tests pass after migration

**Jest to Vitest Migration:**

```javascript
// Legacy Jest (before)
const { matches } = require('./model1')

// New Vitest (after)
import { describe, test, expect } from 'vitest'
import { matches } from './model1.js'
```

#### 7.1 Migrate Matcher Tests

Migrate the matcher tests from the legacy repository. Update imports and syntax, but preserve test logic:

```javascript
// src/services/matchers/mands/model1.test.js
// MIGRATED FROM LEGACY - DO NOT MODIFY TEST LOGIC
import { describe, test, expect } from 'vitest'
import { matches } from './model1.js'
import matcherResult from '../../matcher-result.js'
import model from '../../../../test/test-data-and-results/models-pdf/mands/model1.js'

const filename = 'packinglist.pdf'

describe('M&S Model 1 PDF Matcher', () => {
  test('matches valid M&S Model 1 PDF', () => {
    const result = matches(model.validModel, filename)
    expect(result).toBe(matcherResult.CORRECT)
  })

  test('returns EMPTY_FILE for empty PDF data', () => {
    const result = matches({}, filename)
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

  test('returns WRONG_HEADER for missing required fields', () => {
    const result = matches(model.missingFields, filename)
    expect(result).toBe(matcherResult.WRONG_HEADER)
  })
})
```

#### 7.2 Migrate Parser Tests

Migrate the parser tests from the legacy repository. Update imports and syntax, but preserve test logic:

```javascript
// src/services/parsers/mands/model1.test.js
// MIGRATED FROM LEGACY - DO NOT MODIFY TEST LOGIC
import { describe, test, expect } from 'vitest'
import { parse } from './model1.js'
import model from '../../../../test/test-data-and-results/models-pdf/mands/model1.js'
import expectedResults from '../../../../test/test-data-and-results/results-pdf/mands/model1.js'

describe('M&S Model 1 PDF Parser', () => {
  test('parses valid M&S Model 1 PDF correctly', () => {
    const result = parse(model.validModel)
    expect(result).toMatchObject(expectedResults.validTestResult)
    expect(result.items).toHaveLength(
      expectedResults.validTestResult.items.length
    )
  })

  test('returns NOMATCH for empty PDF data', () => {
    const result = parse({})
    expect(result.parserModel).toBe('NOMATCH')
    expect(result.business_checks.all_required_fields_present).toBe(false)
  })

  test('handles missing fields gracefully', () => {
    const result = parse(model.missingFieldsModel)
    expect(result.business_checks.all_required_fields_present).toBe(false)
  })

  test('filters out footer rows when configured', () => {
    const result = parse(model.modelWithFooter)
    const hasFooter = result.items.some(
      (item) => item.description && item.description.includes('Delivery IDs')
    )
    expect(hasFooter).toBe(false)
  })
})
```

---

### Step 8: Verify Integration

#### 8.1 Run Tests

```bash
npm test -- --grep "M&S Model 1 PDF"
```

#### 8.2 Test with Sample PDF

If you have access to sample PDFs:

```javascript
// test/integration/pdf-parsing.test.js
import { describe, test, expect } from 'vitest'
import { parse } from '../../src/services/parsers/mands/model1.js'
import { matches } from '../../src/services/matchers/mands/model1.js'

describe('PDF Parser Integration - M&S Model 1', () => {
  test('processes PDF data correctly', async () => {
    // Load PDF data from test file
    const pdfData = await loadTestPdfOutput()

    // Verify matching
    const matchResult = matches(pdfData, 'test.pdf')
    expect(matchResult).toBe('CORRECT')

    // Verify parsing
    const parseResult = parse(pdfData)
    expect(parseResult.parserModel).toBe('MANDS1')
    expect(parseResult.items.length).toBeGreaterThan(0)
  })
})
```

---

## Common PDF Parser Patterns

### Pattern 1: Simple String-based Headers

**Examples:** GREGGS1, SIMPLERETAILER1

**Characteristics:**

- Headers map field names to PDF field names directly
- No coordinate validation
- Simpler extraction logic

**Template:**

```javascript
const pdfSimpleHeaders = {
  SIMPLERETAILER1: {
    establishmentNumber: {
      regex: /RMS-GB-000040/i,
      value: 'RMS-GB-000040',
      establishmentRegex: /RMS-GB-\d{6}-(?:\s)?\d{3}/gi
    },
    headers: {
      description: 'Part Description',
      commodity_code: 'Tariff Code',
      number_of_packages: 'Unit Qty',
      total_net_weight_kg: 'Net Weight (KG)'
    },
    findUnitInHeader: true
  }
}
```

### Pattern 2: Coordinate-based Headers

**Examples:** MANDS1, BOOKER1, BOOKER1L, GIOVANNI1

**Characteristics:**

- Headers include `x1`, `x2` coordinate boundaries
- `minHeadersY`, `maxHeadersY` for header row detection
- More precise field extraction
- Handles variable column positions

**Template:**

```javascript
const pdfMandsHeaders = {
  MANDS1: {
    establishmentNumber: {
      regex: /RMS-GB-000008-\d{3}/i
    },
    headers: {
      description: {
        x1: 75,
        x2: 200,
        regex: /Description of Goods/i
      },
      commodity_code: {
        x1: 255,
        x2: 330,
        regex: /EU Commodity Code/i
      }
    },
    footer: /Delivery IDs|\* see certification/,
    minHeadersY: 214,
    maxHeadersY: 225,
    findUnitInHeader: true
  }
}
```

### Pattern 3: Layout Variants

**Examples:** BOOKER1 vs BOOKER1L (landscape)

**Characteristics:**

- Same retailer, different page layouts
- Different coordinate values
- May have different field sets

**Template:**

```javascript
const pdfBookerHeaders = {
  BOOKER1: {
    // Portrait layout
    minHeadersY: 192,
    maxHeadersY: 212,
    headers: {
      description: { x1: 160, x2: 340 }
    }
  },
  BOOKER1L: {
    // Landscape layout
    minHeadersY: 189,
    maxHeadersY: 208,
    headers: {
      description: { x1: 155, x2: 335 }, // Different coordinates
      type_of_treatment: { x1: 660, x2: 730 } // Additional field
    }
  }
}
```

### Pattern 4: Totals Filtering

**Examples:** BOOKER1, FOWLERWELCH1

**Characteristics:**

- PDFs include summary/total rows
- Need to filter these out
- Uses `totals` regex pattern

**Template:**

```javascript
const pdfBookerHeaders = {
  BOOKER1: {
    totals: /^0 Boxes/i // Pattern to identify total rows
    // ... other config
  }
}

// In parser:
if (headers.BOOKER1.totals) {
  packingListContents = packingListContents.filter(
    (item) => !regex.test(headers.BOOKER1.totals, item.description || '')
  )
}
```

---

## PDF Data Structure

### PDF Data Format

PDF parsers work with structured data extracted from PDFs, typically in this format:

```javascript
{
  "data": {
    "tables": [
      {
        "cells": [
          {
            "rowIndex": 0,
            "columnIndex": 0,
            "text": "Description",
            "boundingBox": [x1, y1, x2, y2, x3, y3, x4, y4],
            "confidence": 0.98
          }
        ]
      }
    ],
    "otherFields": {
      // Additional extracted fields
    }
  },
  "pages": [
    // Page-level information
  ]
}
```

### Coordinate Systems

- **Origin:** Top-left corner (0, 0)
- **X-axis:** Left to right (horizontal position)
- **Y-axis:** Top to bottom (vertical position)
- **Bounding Box:** 8 values representing 4 corners: `[x1, y1, x2, y2, x3, y3, x4, y4]`

---

## Checklist

Use this checklist when importing a new PDF model:

- [ ] **Step 1:** Gathered all source files from legacy repo

  - [ ] Model headers configuration with PDF headers
  - [ ] Matcher implementation (if exists)
  - [ ] Parser implementation
  - [ ] Test data (PDF data samples)
  - [ ] Expected results

- [ ] **Step 2:** Created/updated model headers

  - [ ] Created/updated retailer headers file
  - [ ] Added PDF header configuration
  - [ ] Verified coordinate values (if applicable)
  - [ ] Exported headers in model-headers-pdf.js

- [ ] **Step 3:** Created matcher implementation

  - [ ] Created directory structure
  - [ ] Implemented matches() function
  - [ ] Updated imports to ES6 format
  - [ ] Imported from model-headers-pdf.js

- [ ] **Step 4:** Created parser implementation

  - [ ] Created directory structure
  - [ ] Implemented parse() function
  - [ ] Updated imports to ES6 format
  - [ ] Implemented PDF data processing
  - [ ] Implemented coordinate-based extraction (if applicable)
  - [ ] Added totals filtering (if configured)
  - [ ] **Verified 6th parameter (headers) passed to combineParser.combine()**

- [ ] **Step 5:** Registered parser and matcher

  - [ ] Added model to parser-model.js
  - [ ] Updated parsers.js or model-parsers.js
  - [ ] Added to PDF parsers collection

- [ ] **Step 6:** Copied test data (NOT MODIFIED)

  - [ ] Created test data directory structure
  - [ ] Copied PDF data samples from legacy repo EXACTLY (no modifications)
  - [ ] Copied expected results from legacy repo EXACTLY (no modifications)
  - [ ] Verified no changes to test data values
  - [ ] Only import paths updated if needed

- [ ] **Step 7:** Migrated unit tests (NOT CREATED NEW)

  - [ ] Migrated matcher tests from legacy repo
  - [ ] Migrated parser tests from legacy repo
  - [ ] Converted Jest to Vitest syntax
  - [ ] Converted CommonJS to ES6 imports
  - [ ] Updated import paths for new directory structure
  - [ ] No test logic or assertions modified
  - [ ] No new tests added
  - [ ] No tests removed

- [ ] **Step 8:** Verified integration
  - [ ] All unit tests pass
  - [ ] Parser discovery works
  - [ ] Tested with PDF data samples

---

## Troubleshooting

### PDF-Specific Issues

#### Issue: PDF data structure doesn't match

**Symptoms:** Parser fails with undefined fields

**Solutions:**

1. Verify PDF extraction format matches expectations
2. Check if output structure has changed
3. Log the actual output structure to understand format
4. Update parser to handle new structure

#### Issue: Coordinates don't match expected positions

**Symptoms:** Fields extracted from wrong columns, empty extractions

**Solutions:**

1. Verify coordinate values against actual PDF layout
2. Check if PDF has different page size or margins
3. Use layout variant (e.g., BOOKER1L for landscape)
4. Re-calibrate coordinates if layout has changed

#### Issue: Total rows not being filtered

**Symptoms:** Summary rows appear in parsed items

**Solutions:**

1. Verify `totals` regex pattern is correct
2. Check that filtering logic is implemented in parser
3. Test regex pattern against actual total row text
4. Ensure item.description exists before testing regex

#### Issue: Low extraction confidence

**Symptoms:** Missing or incorrect field values

**Solutions:**

1. Check PDF data confidence scores (if available)
2. Improve PDF quality (resolution, clarity)
3. Add confidence score validation in parser (if supported)

#### Issue: Tests pass in legacy but fail after migration

**Symptoms:** Legacy tests pass with same PDF data, but migrated PDF tests fail

**Root Cause:** Usually a code migration bug in validator utilities, not PDF-specific issue

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

3. **Verify PDF test data is identical:**

   ```bash
   diff -u \
     /tmp/legacy-plp/test/unit/test-data-and-results/models-pdf/[retailer]/model[N].js \
     test/test-data-and-results/models-pdf/[retailer]/model[N].js
   ```

4. **Check parser parameters:**

   - Ensure all 6 parameters passed to `combineParser.combine()`
   - Verify parameter order matches legacy
   - Check coordinate extraction logic matches legacy

5. **Run legacy tests to confirm baseline:**
   ```bash
   cd /tmp/legacy-plp
   npm test -- test/unit/services/parsers/[retailer]/model[N]-pdf.test.js
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

1. **Compare with Legacy First:** When tests fail, always check the legacy repository for differences in CODE before modifying TEST DATA. Validator bugs affect all parser types (Excel, CSV, PDF).

2. **Preserve Test Data Exactly:** Don't "normalize" or "clean up" PDF test data - variations are intentional to test regex patterns.

3. **Verify Validator Logic:** Compare validator utility functions line-by-line with legacy - subtle function call differences cause bugs across all parsers.

4. **Test with Real PDFs:** Always test with actual PDF data, not just hand-crafted test data.

5. **Coordinate Precision:** When using coordinate-based extraction, verify boundaries with multiple PDF samples to ensure consistency.

6. **Layout Variants:** Create separate models for significantly different layouts (portrait vs landscape, different retailers).

7. **Confidence Scores:** Consider adding minimum confidence thresholds to filter unreliable extractions.

8. **Error Logging:** Include detailed error logging for PDF data processing to aid debugging.

9. **Performance:** PDF processing may be slower than Excel/CSV. Consider caching or async processing for production.

10. **Totals Filtering:** Always implement totals filtering if PDFs include summary rows - these should not appear in parsed items.

---

## Reference Links

- **Legacy Repository:** https://github.com/DEFRA/trade-exportscore-plp
- **Parser Discovery Process:** [parser-discovery-extraction-generic.md](../../docs/flow/parser-discovery-extraction-generic.md)
- **Model Headers Structure:** [MODEL-HEADERS-STRUCTURE.prompt.md](./MODEL-HEADERS-STRUCTURE.prompt.md)

---

## Quick Reference: File Mapping

| Legacy Location                                                      | New Location                                                    | Purpose                    |
| -------------------------------------------------------------------- | --------------------------------------------------------------- | -------------------------- |
| `app/services/model-headers/[retailer].js`                           | `src/services/model-headers/[retailer].js`                      | PDF header configurations  |
| `app/services/matchers/[retailer]/model[N]-pdf.js`                   | `src/services/matchers/[retailer]/model[N]-pdf.js`              | PDF matcher implementation |
| `app/services/parsers/[retailer]/model[N]-pdf.js`                    | `src/services/parsers/[retailer]/model[N]-pdf.js`               | PDF parser implementation  |
| `test/unit/test-data-and-results/models-pdf/[retailer]/model[N].js`  | `test/test-data-and-results/models-pdf/[retailer]/model[N].js`  | PDF test data              |
| `test/unit/test-data-and-results/results-pdf/[retailer]/model[N].js` | `test/test-data-and-results/results-pdf/[retailer]/model[N].js` | Expected results           |
| `app/services/model-headers-pdf.js`                                  | `src/services/model-headers-pdf.js`                             | PDF headers registry       |

---

## Support

For questions or issues during PDF model migration:

1. Review the [MODEL-HEADERS-STRUCTURE.prompt.md](./MODEL-HEADERS-STRUCTURE.prompt.md) document
2. Check existing PDF implementations for similar patterns
3. Consult with the development team for coordinate calibration
