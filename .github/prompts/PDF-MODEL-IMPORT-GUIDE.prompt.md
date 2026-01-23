# PDF-Based Model Import Guide

## Your Role

You are an expert software engineer tasked with importing a PDF-based packing list parser model from a legacy repository into the current project. PDF parsers use Azure Form Recognizer AI to extract structured data. You will gather requirements, locate source files (including coordinate data), transform code to match the new architecture, create tests, and verify the integration works correctly.

## Task Objective

**Import a specific PDF parser model while preserving exact legacy data structures, coordinate mappings, and Azure Form Recognizer integration.**

**Success Criteria:**

- All source files migrated including PDF headers with coordinates
- Parser constant added to `parser-model.js`
- Matcher and parser implemented with correct imports
- Model registered in `model-parsers.js` under `parsersPdf`
- Coordinate-based extraction logic preserved exactly
- Unit tests created and passing with Form Recognizer output
- Integration tests verify parser discovery works
- No modifications to legacy data structures or validation logic

**When to Ask for Clarification:**

- If retailer or model name is ambiguous
- If Azure Form Recognizer model ID is required but not provided
- If coordinate data is missing or unclear
- If legacy repository structure differs from expected patterns
- If test data is missing or incomplete

---

## Overview

This guide provides step-by-step instructions for importing a specific PDF-based packing list parser model from the legacy `trade-exportscore-plp` repository into the new `trade-exports-packinglistparser` project structure.

**PDF parsers use Azure Form Recognizer (AI) to extract structured data from PDF documents.** They differ significantly from Excel/CSV parsers in their data structures and processing logic.

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
   - PDF: Azure Form Recognizer output with `fields` and coordinate data

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

   - Ask: "What PDF model are you importing? (e.g., ICELAND1, BOOKER1L, GIOVANNI3)"
   - Parse into: `RETAILER`, `MODEL_NUMBER`, and `VARIANT` (if present)
   - Example: "BOOKER1L" → Retailer: "BOOKER", Model: "1", Variant: "L" (landscape)

2. **Legacy Repository Location**

   - Ask: "What is the legacy repository URL?"
   - Default: `https://github.com/DEFRA/trade-exportscore-plp`
   - Ask: "Are you using a specific branch? (default: main)"

3. **Azure Form Recognizer Details** (Optional)
   - Ask: "Does this model use a trained Azure Form Recognizer model? If so, what is the model ID?"
   - Only required if model uses custom-trained Form Recognizer

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

   - Identify the specific retailer (e.g., ICELAND, BOOKER, GIOVANNI)
   - Identify the model variant (e.g., Model 1, Model 1 Landscape)
   - Examples: ICELAND1, BOOKER1, BOOKER1L, GIOVANNI1
   - Note: PDF models often have layout variants (portrait vs landscape)

3. **Parser Identifier**

   - The exact PDF parser model name used in code (e.g., `ICELAND1`, `BOOKER1`, `BOOKER1L`)
   - This is typically `[RETAILER][NUMBER]` or `[RETAILER][NUMBER]L` format
   - Check legacy repository to confirm exact naming

4. **Azure Form Recognizer Details**
   - Model ID (if using custom trained models)
   - Understanding of Form Recognizer output format
   - Coordinate system used (if coordinate-based headers)

### Access Requirements

- Read access to the legacy repository
- Ability to clone or download files from the repository
- Understanding of Azure Form Recognizer output structure
- Sample PDF files and Form Recognizer output for testing (recommended)
- Access to Azure Form Recognizer service (for testing with real PDFs)

**💡 Tip:** If you don't have this information, browse the legacy repository structure:

- PDF model headers: `app/services/model-headers/` (look for coordinate definitions)
- PDF matchers: `app/services/matchers/[retailer]/model[N]-pdf.js` or `model[N].js`
- PDF parsers: `app/services/parsers/[retailer]/model[N]-pdf.js` or AI-specific directory
- Test data: `test/unit/test-data-and-results/models-pdf/`

---

## Migration Steps

### Step 1: Gather Source Files from Legacy Repository

For each PDF retailer model, you'll need to collect the following files from the legacy repo:

#### 1.1 Model Headers Configuration

**Old Location:** `app/services/model-headers/[retailer].js`  
**Example:** `app/services/model-headers/iceland.js`

This file contains PDF-specific header configurations with coordinate data.

**What to extract:**

```javascript
// Example from ICELAND1
const pdfIcelandHeaders = {
  ICELAND1: {
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
    findUnitInHeader: true,
    modelId: 'iceland1-v4' // Azure Form Recognizer model ID
  }
}
```

**Advanced Example with Coordinates (Booker):**

```javascript
const pdfBookerHeaders = {
  BOOKER1: {
    establishmentNumber: {
      regex: /^RMS-GB-000077-\d{3}$/i
    },
    headers: {
      description: {
        x: /Description/i,
        x1: 160, // Left boundary
        x2: 340, // Right boundary
        regex: /Description/i
      },
      commodity_code: {
        x: /Commodity Code/i,
        x1: 500,
        x2: 540,
        regex: /Commodity Code/i
      },
      number_of_packages: {
        x: /Quantity/i,
        x1: 340,
        x2: 360,
        regex: /Unit Quantity/i
      },
      total_net_weight_kg: {
        x: /Net/i,
        x1: 430,
        x2: 455,
        regex: /Net Weight/i
      }
    },
    totals: /^0 Boxes/i, // Pattern to identify total rows (skip these)
    minHeadersY: 192, // Minimum Y coordinate for headers
    maxHeadersY: 212, // Maximum Y coordinate for headers
    findUnitInHeader: true
  }
}
```

#### 1.2 Matcher Implementation

**Old Location:** `app/services/matchers/[retailer]/model[N].js`  
**Example:** `app/services/matchers/iceland/model1.js` (if exists)

**Note:** Many PDF parsers may not have separate matcher files in the legacy repo. The matching logic is often integrated into the parser itself or uses a generic PDF matcher.

**Common PDF Matcher Pattern:**

```javascript
function matches(packingList, filename) {
  try {
    // Check for Azure Form Recognizer output structure
    if (!packingList || !packingList.fields) {
      return matcherResult.EMPTY_FILE
    }

    // Validate establishment number in PDF text
    const text = extractTextFromFields(packingList.fields)
    if (!regex.test(headers.ICELAND1.establishmentNumber.regex, text)) {
      return matcherResult.WRONG_ESTABLISHMENT_NUMBER
    }

    // Validate required fields exist
    const requiredFields = Object.keys(headers.ICELAND1.headers)
    const hasRequiredFields = validatePdfFields(
      packingList.fields,
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
**Example:** `app/services/parsers/iceland/model1-pdf.js`

PDF parsers extract data from Azure Form Recognizer output and map it to the legacy structure.

**What to extract:**

```javascript
function parse(formRecognizerOutput) {
  try {
    if (!formRecognizerOutput || !formRecognizerOutput.fields) {
      return combineParser.combine(null, [], false, parserModel.NOMATCH, [])
    }

    const fields = formRecognizerOutput.fields
    let packingListContents = []
    let establishmentNumbers = []

    // Extract establishment number
    const establishmentNumber = extractEstablishmentNumber(
      fields,
      headers.ICELAND1.establishmentNumber
    )

    // Extract items from table fields
    const items = extractTableItems(fields, headers.ICELAND1.headers)

    // Filter out total rows if configured
    if (headers.ICELAND1.totals) {
      packingListContents = items.filter(
        (item) => !regex.test(headers.ICELAND1.totals, item.description)
      )
    } else {
      packingListContents = items
    }

    // Find all establishment numbers
    establishmentNumbers = extractAllEstablishments(
      fields,
      headers.ICELAND1.establishmentNumber.establishmentRegex
    )

    return combineParser.combine(
      establishmentNumber,
      packingListContents,
      true,
      parserModel.ICELAND1,
      establishmentNumbers,
      headers.ICELAND1
    )
  } catch (err) {
    logger.logError(filenameForLogging, 'parse()', err)
    return combineParser.combine(null, [], false, parserModel.NOMATCH, [])
  }
}
```

#### 1.4 Test Data (Optional but Recommended)

**Old Location:** `test/unit/test-data-and-results/models-pdf/[retailer]/model[N].js`  
**Example:** `test/unit/test-data-and-results/models-pdf/iceland/model1.js`

Contains sample Azure Form Recognizer output for testing. This is typically a large JSON object with field coordinates and values.

#### 1.5 Expected Test Results (Optional but Recommended)

**Old Location:** `test/unit/test-data-and-results/results-pdf/[retailer]/model[N].js`  
**Example:** `test/unit/test-data-and-results/results-pdf/iceland/model1.js`

Contains expected parser output for validation.

---

### Step 2: Create Model Headers in New Project

**New Location:** `src/services/model-headers/[retailer].js`

#### 2.1 Create or Update Retailer Headers File

If the retailer doesn't exist yet, create a new file:

```bash
touch src/services/model-headers/iceland.js
```

If the retailer already has Excel/CSV headers, add PDF headers to the same file.

#### 2.2 Adapt PDF Header Configuration

Transform the old format to match the new project's structure:

**Simple PDF Headers (String-based):**

```javascript
/**
 * Iceland model headers
 *
 * Provides establishment number patterns and field mappings
 * for Iceland packing list variants.
 */

// CSV headers (if any)
const csvIcelandHeaders = {
  // ... existing CSV configs
}

// PDF headers
const pdfIcelandHeaders = {
  ICELAND1: {
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
    // Required fields list
    required: [
      'description',
      'commodity_code',
      'number_of_packages',
      'total_net_weight_kg'
    ],
    // Optional fields
    optional: [],
    // Validation flags
    findUnitInHeader: true,
    validateCountryOfOrigin: false,
    // Azure Form Recognizer model ID
    modelId: 'iceland1-v4',
    // Deprecated flag (if applicable)
    deprecated: false
  }
}

export { csvIcelandHeaders, pdfIcelandHeaders }
```

**Advanced PDF Headers (Coordinate-based):**

```javascript
const pdfBookerHeaders = {
  BOOKER1: {
    establishmentNumber: {
      regex: /^RMS-GB-000077-\d{3}$/i
    },
    headers: {
      description: {
        x: /Description/i, // Header column title pattern
        x1: 160, // Left boundary for field extraction
        x2: 340, // Right boundary for field extraction
        regex: /Description/i // Validation regex for field content
      },
      commodity_code: {
        x: /Commodity Code/i,
        x1: 500,
        x2: 540,
        regex: /Commodity Code/i
      },
      number_of_packages: {
        x: /Quantity/i,
        x1: 340,
        x2: 360,
        regex: /Unit Quantity/i
      },
      total_net_weight_kg: {
        x: /Net/i,
        x1: 430,
        x2: 455,
        regex: /Net Weight/i
      }
    },
    // Required fields
    required: [
      'description',
      'commodity_code',
      'number_of_packages',
      'total_net_weight_kg'
    ],
    // Optional fields
    optional: [],
    // Pattern to identify total rows (these will be filtered out)
    totals: /^0 Boxes/i,
    // Y-coordinate range for header row
    minHeadersY: 192,
    maxHeadersY: 212,
    // Validation flags
    findUnitInHeader: true,
    validateCountryOfOrigin: false,
    deprecated: false
  }
}

export { bookerHeaders, pdfBookerHeaders }
```

**Key Changes:**

- Use ES6 **named exports** (`export { pdfRetailerHeaders }`) instead of `module.exports`
- **PRESERVE the exact same structure and coordinate values from legacy**
- Add `required` and `optional` arrays listing field names
- Keep coordinate data (`x1`, `x2`, `minHeadersY`, `maxHeadersY`) exactly as in legacy
- Document the Azure Form Recognizer model ID if applicable

**PDF Header Structure Rules:**

1. **Simple headers:** Field name → String mapping (e.g., `description: "Part Description"`)
2. **Coordinate headers:** Field name → Object with `x`, `x1`, `x2`, `regex` properties
3. **Totals filtering:** Add `totals` regex if summary rows need to be excluded
4. **Y-position validation:** Add `minHeadersY` and `maxHeadersY` if header position varies
5. **Azure model ID:** Include `modelId` if using trained Form Recognizer models

#### 2.3 Export Headers in PDF Registry

Update `src/services/model-headers-pdf.js`:

```javascript
/**
 * PDF model headers registry
 *
 * Aggregates PDF-specific header configurations from individual retailer modules.
 * Used by PDF AI parsers to map Azure Form Recognizer fields.
 */
import { pdfIcelandHeaders } from './model-headers/iceland.js'
import { pdfBookerHeaders } from './model-headers/booker.js'

const headers = {
  ...pdfIcelandHeaders,
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
mkdir -p src/services/matchers/iceland
touch src/services/matchers/iceland/model1-pdf.js
```

#### 3.2 Implement PDF Matcher

Adapt the matcher from the legacy repo:

```javascript
/**
 * Iceland Model 1 PDF matcher
 *
 * Detects whether a provided Azure Form Recognizer output matches
 * the Iceland Model 1 PDF format by checking the establishment number
 * and required field presence.
 */
import { createLogger } from '../../../common/helpers/logging/logger.js'
import matcherResult from '../../matcher-result.js'
import * as regex from '../../../utilities/regex.js'
import headers from '../../model-headers-pdf.js' // PDF headers registry

const logger = createLogger()

/**
 * Check whether the provided Form Recognizer output matches Iceland Model 1 PDF.
 * @param {Object} formRecognizerOutput - Azure Form Recognizer JSON output
 * @param {string} filename - Source filename for logging
 * @returns {string} - One of matcherResult codes
 */
export function matches(formRecognizerOutput, filename) {
  try {
    // Check for valid Form Recognizer output structure
    if (!formRecognizerOutput || !formRecognizerOutput.fields) {
      return matcherResult.EMPTY_FILE
    }

    const fields = formRecognizerOutput.fields

    // Extract text content for establishment number validation
    const textContent = extractAllText(fields)

    // Check for correct establishment number
    if (!regex.test(headers.ICELAND1.establishmentNumber.regex, textContent)) {
      return matcherResult.WRONG_ESTABLISHMENT_NUMBER
    }

    // Validate required fields are present
    const requiredFieldNames = Object.keys(headers.ICELAND1.headers)
    const hasRequiredFields = validateRequiredPdfFields(
      fields,
      requiredFieldNames
    )

    if (!hasRequiredFields) {
      return matcherResult.WRONG_HEADER
    }

    logger.info({ filename }, 'Packing list matches Iceland Model 1 PDF')

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
 * Extract all text content from Form Recognizer fields
 * @param {Object} fields - Form Recognizer fields object
 * @returns {string} - Concatenated text content
 */
function extractAllText(fields) {
  // Implementation depends on Form Recognizer output structure
  // This is a simplified example
  let text = ''

  if (fields.tables && Array.isArray(fields.tables)) {
    fields.tables.forEach((table) => {
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
 * @param {Object} fields - Form Recognizer fields object
 * @param {Array<string>} requiredFields - List of required field names
 * @returns {boolean} - True if all required fields present
 */
function validateRequiredPdfFields(fields, requiredFields) {
  // Implementation depends on how fields are structured
  // This is a simplified example
  return requiredFields.every((fieldName) => {
    // Check if field exists in Form Recognizer output
    return fields[fieldName] !== undefined
  })
}
```

**Key Changes:**

- Use ES6 imports instead of `require()`
- Import from `model-headers-pdf.js` (not `model-headers.js`)
- Import and use Pino logger via `createLogger()`
- Use structured logging
- Adapt validation logic for Azure Form Recognizer output structure

**PDF-Specific Considerations:**

- Form Recognizer output has different structure than Excel/CSV (fields, tables, pages)
- May need to extract text from multiple pages
- Coordinate-based validation if using advanced headers
- Field confidence scores can be checked for quality validation

---

### Step 4: Create Parser Implementation

**New Location:** `src/services/parsers/[retailer]/model[N]-pdf.js`

#### 4.1 Create Directory Structure

```bash
mkdir -p src/services/parsers/iceland
touch src/services/parsers/iceland/model1-pdf.js
```

#### 4.2 Implement PDF Parser

Adapt the parser from the legacy repo:

**Simple PDF Parser (String-based headers):**

```javascript
/**
 * Iceland PDF parser - Model 1
 * @module parsers/iceland/model1-pdf
 */
import { createLogger } from '../../../common/helpers/logging/logger.js'
import combineParser from '../../parser-combine.js'
import parserModel from '../../parser-model.js'
import headers from '../../model-headers-pdf.js' // PDF headers registry
import * as regex from '../../../utilities/regex.js'

const logger = createLogger()

/**
 * Parse the provided Form Recognizer output for Iceland PDF model 1.
 * @param {Object} formRecognizerOutput - Azure Form Recognizer JSON output
 * @returns {Object} Combined parser result.
 */
export function parse(formRecognizerOutput) {
  try {
    if (!formRecognizerOutput || !formRecognizerOutput.fields) {
      return combineParser.combine(null, [], false, parserModel.NOMATCH, [])
    }

    const fields = formRecognizerOutput.fields
    let packingListContents = []
    let establishmentNumbers = []

    // Extract primary establishment number
    const establishmentNumber = extractEstablishmentNumber(
      fields,
      headers.ICELAND1.establishmentNumber
    )

    // Extract all establishment numbers
    establishmentNumbers = extractAllEstablishments(
      fields,
      headers.ICELAND1.establishmentNumber.establishmentRegex
    )

    // Extract items from table fields
    packingListContents = extractTableItems(fields, headers.ICELAND1.headers)

    // CRITICAL: Include headers parameter (6th parameter)
    return combineParser.combine(
      establishmentNumber,
      packingListContents,
      true,
      parserModel.ICELAND1,
      establishmentNumbers,
      headers.ICELAND1
    )
  } catch (err) {
    logger.error({ err }, 'Error in parse()')
    return combineParser.combine(null, [], false, parserModel.NOMATCH, [])
  }
}

/**
 * Extract establishment number from Form Recognizer fields
 * @param {Object} fields - Form Recognizer fields
 * @param {Object} config - Establishment number configuration
 * @returns {string|null} - Establishment number or null
 */
function extractEstablishmentNumber(fields, config) {
  // Extract text and search for establishment number
  const text = extractAllText(fields)
  const match = text.match(config.regex)
  return match ? match[0] : config.value || null
}

/**
 * Extract all establishment numbers from fields
 * @param {Object} fields - Form Recognizer fields
 * @param {RegExp} regex - Establishment number pattern
 * @returns {Array<string>} - Array of establishment numbers
 */
function extractAllEstablishments(fields, regex) {
  const text = extractAllText(fields)
  const matches = text.match(regex)
  return matches ? [...new Set(matches)] : []
}

/**
 * Extract table items from Form Recognizer fields
 * @param {Object} fields - Form Recognizer fields
 * @param {Object} headerConfig - Header field configuration
 * @returns {Array<Object>} - Array of packing list items
 */
function extractTableItems(fields, headerConfig) {
  const items = []

  // Process tables from Form Recognizer output
  if (fields.tables && Array.isArray(fields.tables)) {
    fields.tables.forEach((table) => {
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
 * Extract all text from Form Recognizer fields
 * @param {Object} fields - Form Recognizer fields
 * @returns {string} - Concatenated text
 */
function extractAllText(fields) {
  let text = ''

  if (fields.tables && Array.isArray(fields.tables)) {
    fields.tables.forEach((table) => {
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
  // how Form Recognizer structures the output

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

**Advanced PDF Parser (Coordinate-based headers):**

```javascript
/**
 * Booker PDF parser - Model 1
 * Uses coordinate-based field extraction
 */
import { createLogger } from '../../../common/helpers/logging/logger.js'
import combineParser from '../../parser-combine.js'
import parserModel from '../../parser-model.js'
import headers from '../../model-headers-pdf.js'
import * as regex from '../../../utilities/regex.js'

const logger = createLogger()

export function parse(formRecognizerOutput) {
  try {
    if (!formRecognizerOutput || !formRecognizerOutput.fields) {
      return combineParser.combine(null, [], false, parserModel.NOMATCH, [])
    }

    const fields = formRecognizerOutput.fields
    let packingListContents = []
    let establishmentNumbers = []

    const establishmentNumber = extractEstablishmentNumber(
      fields,
      headers.BOOKER1.establishmentNumber
    )

    establishmentNumbers = extractAllEstablishments(
      fields,
      /RMS-GB-\d{6}-\d{3}/gi
    )

    // Extract items using coordinate-based extraction
    packingListContents = extractItemsWithCoordinates(fields, headers.BOOKER1)

    // Filter out total rows if configured
    if (headers.BOOKER1.totals) {
      packingListContents = packingListContents.filter(
        (item) => !regex.test(headers.BOOKER1.totals, item.description || '')
      )
    }

    return combineParser.combine(
      establishmentNumber,
      packingListContents,
      true,
      parserModel.BOOKER1,
      establishmentNumbers,
      headers.BOOKER1
    )
  } catch (err) {
    logger.error({ err }, 'Error in parse()')
    return combineParser.combine(null, [], false, parserModel.NOMATCH, [])
  }
}

/**
 * Extract items using coordinate-based field definitions
 * @param {Object} fields - Form Recognizer fields
 * @param {Object} modelConfig - Model configuration with coordinates
 * @returns {Array<Object>} - Array of items
 */
function extractItemsWithCoordinates(fields, modelConfig) {
  const items = []

  if (!fields.tables || !Array.isArray(fields.tables)) {
    return items
  }

  fields.tables.forEach((table) => {
    if (!table.cells) return

    // Find header row by Y-coordinate
    const headerCells = table.cells.filter((cell) => {
      const y = cell.boundingBox ? cell.boundingBox[1] : 0
      return y >= modelConfig.minHeadersY && y <= modelConfig.maxHeadersY
    })

    // Extract data rows (cells below header)
    const dataCells = table.cells.filter((cell) => {
      const y = cell.boundingBox ? cell.boundingBox[1] : 0
      return y > modelConfig.maxHeadersY
    })

    // Group data cells by row
    const rows = groupCellsByRow(dataCells)

    // Extract item from each row using coordinate boundaries
    rows.forEach((row) => {
      const item = extractItemWithCoordinates(row, modelConfig.headers)
      if (item && isValidItem(item)) {
        items.push(item)
      }
    })
  })

  return items
}

/**
 * Extract item data using coordinate boundaries
 * @param {Array} rowCells - Cells in the row
 * @param {Object} headerConfig - Header configuration with x1/x2 boundaries
 * @returns {Object|null} - Extracted item
 */
function extractItemWithCoordinates(rowCells, headerConfig) {
  const item = {}

  Object.entries(headerConfig).forEach(([fieldName, fieldConfig]) => {
    if (!fieldConfig.x1 || !fieldConfig.x2) {
      // Simple string-based extraction
      const cell = rowCells.find((c) => c.text && c.text.trim().length > 0)
      item[fieldName] = cell ? cell.text : null
      return
    }

    // Find cell within coordinate boundaries
    const matchingCells = rowCells.filter((cell) => {
      if (!cell.boundingBox) return false
      const x = cell.boundingBox[0] // Left X coordinate
      return x >= fieldConfig.x1 && x <= fieldConfig.x2
    })

    // Combine text from all matching cells
    item[fieldName] =
      matchingCells
        .map((c) => c.text)
        .filter((t) => t && t.trim())
        .join(' ')
        .trim() || null
  })

  return item
}

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

function extractEstablishmentNumber(fields, config) {
  const text = extractAllText(fields)
  const match = text.match(config.regex)
  return match ? match[0] : null
}

function extractAllEstablishments(fields, regex) {
  const text = extractAllText(fields)
  const matches = text.match(regex)
  return matches ? [...new Set(matches)] : []
}

function extractAllText(fields) {
  let text = ''

  if (fields.tables && Array.isArray(fields.tables)) {
    fields.tables.forEach((table) => {
      if (table.cells) {
        table.cells.forEach((cell) => {
          text += (cell.text || '') + ' '
        })
      }
    })
  }

  return text
}

function isValidItem(item) {
  return item.description && item.description.trim().length > 0
}
```

**Key Changes:**

- Use ES6 imports instead of `require()`
- Import from `model-headers-pdf.js`
- Import and use Pino logger
- **CRITICAL:** Pass headers as 6th parameter to `combineParser.combine()`
- Implement coordinate-based extraction if using advanced headers
- Handle Azure Form Recognizer output structure (fields, tables, cells, boundingBox)

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
  ICELAND1: 'ICELAND1' // PDF model
  // ...
}
```

#### 5.2 Update parsers.js or model-parsers.js

Add the new PDF parser:

```javascript
// Import new PDF parser
import { parse as parseIceland1Pdf } from './iceland/model1-pdf.js'
import { matches as matchesIceland1Pdf } from '../matchers/iceland/model1-pdf.js'

// In the parsersPdf object (or create if doesn't exist):
const parsersPdf = {
  ICELAND1: {
    parse: parseIceland1Pdf,
    matches: matchesIceland1Pdf,
    type: 'pdf',
    parserModel: 'ICELAND1'
  }
  // ... other PDF parsers
}
```

---

### Step 6: Add Test Data (Strongly Recommended)

⚠️ **Test data is critical for validation** - Without it, you cannot verify the migration is correct.

#### 6.1 Create Test Data Directory

```bash
mkdir -p test/test-data-and-results/models-pdf/iceland
mkdir -p test/test-data-and-results/results-pdf/iceland
```

#### 6.2 Copy Test Data Without Modifications

⚠️ **CRITICAL:** Test data variations are intentional - do not "normalize" or "clean up" them.

**Rules for copying PDF test data:**

1. **Copy EXACTLY from legacy** - No modifications to Form Recognizer output structure
2. **Preserve all variations** - Field value variations test regex pattern matching:
   - NIRMS variations: `'yes'`, `'nirms'`, `'green'`, `'y'`, `'g'`
   - Non-NIRMS variations: `'no'`, `'non-nirms'`, `'non nirms'`, `'red'`, `'r'`, `'n'`
3. **Keep exact item counts** - Don't add/remove items to "standardize" tests
4. **Maintain coordinate data** - Preserve boundingBox values exactly
5. **Preserve confidence scores** - These may be used for validation
6. **Keep Form Recognizer structure** - Don't simplify the JSON structure

**Verification:**

```bash
# After copying, verify no unintended changes
cd /path/to/legacy-repo
git diff --no-index \
  test/unit/test-data-and-results/models-pdf/[retailer]/model[N].js \
  /path/to/new-repo/test/test-data-and-results/models-pdf/[retailer]/model[N].js
```

**Note:** Azure Form Recognizer output is typically very large. Consider using abbreviated/simplified versions for tests.

```javascript
// test/test-data-and-results/models-pdf/iceland/model1.js
export default {
  validModel: {
    fields: {
      tables: [
        {
          cells: [
            {
              rowIndex: 0,
              columnIndex: 0,
              text: 'Part Description',
              boundingBox: [160, 195, 340, 195, 340, 210, 160, 210]
            },
            {
              rowIndex: 0,
              columnIndex: 1,
              text: 'Tariff Code',
              boundingBox: [350, 195, 450, 195, 450, 210, 350, 210]
            },
            {
              rowIndex: 1,
              columnIndex: 0,
              text: 'Test Product',
              boundingBox: [160, 215, 340, 215, 340, 230, 160, 230]
            },
            {
              rowIndex: 1,
              columnIndex: 1,
              text: '0201100000',
              boundingBox: [350, 215, 450, 215, 450, 230, 350, 230]
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
// test/test-data-and-results/results-pdf/iceland/model1.js
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
    establishment_numbers: ['RMS-GB-000040-001'],
    registration_approval_number: 'RMS-GB-000040-001',
    parserModel: parserModel.ICELAND1
  }
}
```

---

### Step 7: Create Unit Tests

Create comprehensive unit tests:

```javascript
// src/services/matchers/iceland/model1-pdf.test.js
import { describe, test, expect } from 'vitest'
import { matches } from './model1-pdf.js'
import matcherResult from '../../matcher-result.js'
import model from '../../../../test/test-data-and-results/models-pdf/iceland/model1.js'

const filename = 'packinglist.pdf'

describe('Iceland Model 1 PDF Matcher', () => {
  test('matches valid Iceland Model 1 PDF', () => {
    const result = matches(model.validModel, filename)
    expect(result).toBe(matcherResult.CORRECT)
  })

  test('returns EMPTY_FILE for empty Form Recognizer output', () => {
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

```javascript
// src/services/parsers/iceland/model1-pdf.test.js
import { describe, test, expect } from 'vitest'
import { parse } from './model1-pdf.js'
import model from '../../../../test/test-data-and-results/models-pdf/iceland/model1.js'
import expectedResults from '../../../../test/test-data-and-results/results-pdf/iceland/model1.js'

describe('Iceland Model 1 PDF Parser', () => {
  test('parses valid Iceland Model 1 PDF correctly', () => {
    const result = parse(model.validModel)
    expect(result).toMatchObject(expectedResults.validTestResult)
    expect(result.items).toHaveLength(
      expectedResults.validTestResult.items.length
    )
  })

  test('returns NOMATCH for empty Form Recognizer output', () => {
    const result = parse({})
    expect(result.parserModel).toBe('NOMATCH')
    expect(result.business_checks.all_required_fields_present).toBe(false)
  })

  test('handles missing fields gracefully', () => {
    const result = parse(model.missingFieldsModel)
    expect(result.business_checks.all_required_fields_present).toBe(false)
  })

  test('filters out total rows when configured', () => {
    const result = parse(model.modelWithTotals)
    const hasTotals = result.items.some(
      (item) => item.description && item.description.includes('0 Boxes')
    )
    expect(hasTotals).toBe(false)
  })
})
```

---

### Step 8: Verify Integration

#### 8.1 Run Tests

```bash
npm test -- --grep "Iceland Model 1 PDF"
```

#### 8.2 Test with Sample PDF

If you have access to sample PDFs and Azure Form Recognizer:

```javascript
// test/integration/pdf-parsing.test.js
import { describe, test, expect } from 'vitest'
import { parse } from '../../src/services/parsers/iceland/model1-pdf.js'
import { matches } from '../../src/services/matchers/iceland/model1-pdf.js'

describe('PDF Parser Integration - Iceland Model 1', () => {
  test('processes Form Recognizer output correctly', async () => {
    // Load Form Recognizer output from test file
    const formRecognizerOutput = await loadTestPdfOutput()

    // Verify matching
    const matchResult = matches(formRecognizerOutput, 'test.pdf')
    expect(matchResult).toBe('CORRECT')

    // Verify parsing
    const parseResult = parse(formRecognizerOutput)
    expect(parseResult.parserModel).toBe('ICELAND1')
    expect(parseResult.items.length).toBeGreaterThan(0)
  })
})
```

---

## Common PDF Parser Patterns

### Pattern 1: Simple String-based Headers

**Examples:** ICELAND1, GREGGS1

**Characteristics:**

- Headers map field names to Form Recognizer field names directly
- No coordinate validation
- Simpler extraction logic

**Template:**

```javascript
const pdfIcelandHeaders = {
  ICELAND1: {
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
    findUnitInHeader: true,
    modelId: 'iceland1-v4'
  }
}
```

### Pattern 2: Coordinate-based Headers

**Examples:** BOOKER1, BOOKER1L, GIOVANNI1

**Characteristics:**

- Headers include `x1`, `x2` coordinate boundaries
- `minHeadersY`, `maxHeadersY` for header row detection
- More precise field extraction
- Handles variable column positions

**Template:**

```javascript
const pdfBookerHeaders = {
  BOOKER1: {
    establishmentNumber: {
      regex: /^RMS-GB-000077-\d{3}$/i
    },
    headers: {
      description: {
        x: /Description/i,
        x1: 160,
        x2: 340,
        regex: /Description/i
      },
      commodity_code: {
        x: /Commodity Code/i,
        x1: 500,
        x2: 540,
        regex: /Commodity Code/i
      }
    },
    totals: /^0 Boxes/i,
    minHeadersY: 192,
    maxHeadersY: 212,
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

## Azure Form Recognizer Integration

### Form Recognizer Output Structure

Azure Form Recognizer returns JSON with this typical structure:

```javascript
{
  "fields": {
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

### Model Training

If using custom trained models:

1. **Model ID:** Include in headers config (`modelId: "iceland1-v4"`)
2. **Training Data:** Requires sample PDFs with labeled fields
3. **Confidence Scores:** Can be used to filter low-quality extractions
4. **Retraining:** May need periodic retraining as PDF formats evolve

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
  - [ ] Test data (Form Recognizer output)
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
  - [ ] Implemented Form Recognizer output processing
  - [ ] Implemented coordinate-based extraction (if applicable)
  - [ ] Added totals filtering (if configured)
  - [ ] **Verified 6th parameter (headers) passed to combineParser.combine()**

- [ ] **Step 5:** Registered parser and matcher

  - [ ] Added model to parser-model.js
  - [ ] Updated parsers.js or model-parsers.js
  - [ ] Added to PDF parsers collection

- [ ] **Step 6:** Added test data

  - [ ] Created test data directory structure
  - [ ] Created simplified Form Recognizer output for tests
  - [ ] Created expected results

- [ ] **Step 7:** Created unit tests

  - [ ] Created matcher tests
  - [ ] Created parser tests
  - [ ] Tests cover all matcher result codes
  - [ ] Tests verify coordinate-based extraction (if applicable)

- [ ] **Step 8:** Verified integration
  - [ ] All unit tests pass
  - [ ] Parser discovery works
  - [ ] Tested with Form Recognizer output samples

---

## Troubleshooting

### PDF-Specific Issues

#### Issue: Form Recognizer output structure doesn't match

**Symptoms:** Parser fails with undefined fields

**Solutions:**

1. Verify Form Recognizer API version matches expectations
2. Check if output structure has changed
3. Log the actual output structure to understand format
4. Update parser to handle new structure

#### Issue: Coordinates don't match expected positions

**Symptoms:** Fields extracted from wrong columns, empty extractions

**Solutions:**

1. Verify coordinate values against actual PDF layout
2. Check if PDF has different page size or margins
3. Use layout variant (e.g., BOOKER1L for landscape)
4. Retrain Form Recognizer model if layout has changed

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

1. Check Form Recognizer confidence scores
2. Retrain custom model with more samples
3. Improve PDF quality (resolution, clarity)
4. Add confidence score validation in parser

#### Issue: Tests pass in legacy but fail after migration

**Symptoms:** Legacy tests pass with same Form Recognizer data, but migrated PDF tests fail

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

2. **Preserve Test Data Exactly:** Don't "normalize" or "clean up" Form Recognizer test data - variations are intentional to test regex patterns.

3. **Verify Validator Logic:** Compare validator utility functions line-by-line with legacy - subtle function call differences cause bugs across all parsers.

4. **Test with Real PDFs:** Always test with actual Form Recognizer output from real PDFs, not just hand-crafted test data.

5. **Coordinate Precision:** When using coordinate-based extraction, verify boundaries with multiple PDF samples to ensure consistency.

6. **Layout Variants:** Create separate models for significantly different layouts (portrait vs landscape, different retailers).

7. **Confidence Scores:** Consider adding minimum confidence thresholds to filter unreliable extractions.

8. **Error Logging:** Include detailed error logging for Form Recognizer output processing to aid debugging.

9. **Performance:** Form Recognizer processing is slower than Excel/CSV. Consider caching or async processing for production.

10. **Model Versioning:** Track Form Recognizer model versions in headers config (`modelId`) for reproducibility.

11. **Totals Filtering:** Always implement totals filtering if PDFs include summary rows - these should not appear in parsed items.

---

## Reference Links

- **Legacy Repository:** https://github.com/DEFRA/trade-exportscore-plp
- **Azure Form Recognizer Docs:** https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/
- **Parser Discovery Process:** [parser-discovery-extraction-generic.md](../../docs/flow/parser-discovery-extraction-generic.md)
- **Model Headers Structure:** [MODEL-HEADERS-STRUCTURE.prompt.md](./MODEL-HEADERS-STRUCTURE.prompt.md)

---

## Quick Reference: File Mapping

| Legacy Location                                                      | New Location                                                    | Purpose                    |
| -------------------------------------------------------------------- | --------------------------------------------------------------- | -------------------------- |
| `app/services/model-headers/[retailer].js`                           | `src/services/model-headers/[retailer].js`                      | PDF header configurations  |
| `app/services/matchers/[retailer]/model[N]-pdf.js`                   | `src/services/matchers/[retailer]/model[N]-pdf.js`              | PDF matcher implementation |
| `app/services/parsers/[retailer]/model[N]-pdf.js`                    | `src/services/parsers/[retailer]/model[N]-pdf.js`               | PDF parser implementation  |
| `test/unit/test-data-and-results/models-pdf/[retailer]/model[N].js`  | `test/test-data-and-results/models-pdf/[retailer]/model[N].js`  | Form Recognizer test data  |
| `test/unit/test-data-and-results/results-pdf/[retailer]/model[N].js` | `test/test-data-and-results/results-pdf/[retailer]/model[N].js` | Expected results           |
| `app/services/model-headers-pdf.js`                                  | `src/services/model-headers-pdf.js`                             | PDF headers registry       |

---

## Support

For questions or issues during PDF model migration:

1. Review the [MODEL-HEADERS-STRUCTURE.prompt.md](./MODEL-HEADERS-STRUCTURE.prompt.md) document
2. Check existing PDF implementations for similar patterns
3. Review Azure Form Recognizer documentation for output format changes
4. Consult with the development team for coordinate calibration
