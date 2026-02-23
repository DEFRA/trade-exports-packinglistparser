# Packing List Processing - Steps 4-7 Implementation

This document describes the implemented code for orchestrating packing list processing as outlined in sections 4-7 of [original-adp-packing-list-processing-flow.md](flow/original-adp-packing-list-processing-flow.md).

**Status:** ✅ Fully Implemented (as of February 2026)

## Overview

The implementation provides the core infrastructure for:

- **Step 4**: Input Sanitization - Removing trailing spaces and empty cells
- **Step 5**: Parser Discovery - File type detection, REMOS validation, and retailer matcher selection
- **Step 6**: Data Extraction - Extracting establishment numbers, mapping columns, and processing rows
- **Step 7**: Data Validation & Cleanup - Removing empty items, validating fields, and setting business checks

## Architecture

### Main Orchestration Service

**[src/services/packing-list-process-service.js](src/services/packing-list-process-service.js)** ✅ Fully Implemented

- Main entry point for full packing list processing
- Orchestrates payload validation → blob download → parser execution → result processing

**[src/services/parser-service.js](src/services/parser-service.js)** ✅ Fully Implemented

- Steps 4-7 execution for parsing pipeline
- Orchestrates: sanitization → parser discovery → extraction → validation

**[src/services/packing-list-process-message-validation.js](src/services/packing-list-process-message-validation.js)** ✅ Fully Implemented

- Validates incoming process message payload before parsing begins
- Checks payload shape, `application_id`, blob URL constraints, and establishment ID format

### Parser Factory

**[src/services/parsers/parser-factory.js](src/services/parsers/parser-factory.js)**

- `findParser()` - Step 5: Discovers appropriate parser based on file type and content
- `generateParsedPackingList()` - Steps 6 & 7: Extracts data and runs validation

### Utilities

**[src/utilities/json-file.js](src/utilities/json-file.js)** ✅ Implemented

- `sanitise()` - Step 4: Removes trailing spaces and converts empty strings to null

**[src/utilities/file-extension.js](src/utilities/file-extension.js)**

- `isExcel()`, `isCsv()`, `isPdf()` - Step 5a: File type detection

**[src/utilities/row-finder.js](src/utilities/row-finder.js)**

- `rowFinder()` - Step 6: Locates header rows in packing list sheets

### Validators

**[src/services/validators/packing-list-column-validator.js](src/services/validators/packing-list-column-validator.js)** ✅ Implemented

- `validatePackingList()` - Step 7: Main validation entry point
- `validatePackingListByIndexAndType()` - Runs all validation checks
- `generateFailuresByIndexAndTypes()` - Generates failure reason text

**[src/services/validators/packing-list-validator-utilities.js](src/services/validators/packing-list-validator-utilities.js)**

- `removeEmptyItems()` - Step 7: Removes items with all null values
- `removeBadData()` - Step 7: Filters items with critical validation failures
- Field validators: `hasMissingDescription()`, `hasMissingPackages()`, etc.

**[src/services/validators/packing-list-failure-reasons.js](src/services/validators/packing-list-failure-reasons.js)**

- Human-readable failure reason descriptions

## Implemented Models

The following directory structure contains fully implemented retailer-specific parsers:

```
src/services/
  ├── model-headers.js           # Excel header registry (aggregates retailer headers)
  ├── parsers/
  │   ├── README.md               # Instructions for adding new parsers
  │   ├── asda/                   # ASDA parsers (model3.js, model4.js)
  │   ├── tesco/                  # Tesco parsers
  │   ├── bandm/                  # B&M parsers
  │   ├── fowlerwelch/            # Fowler-Welch parsers
  │   ├── warrens/                # Warrens parsers (model2.js)
  │   ├── turners/                # Turners parsers
  │   ├── mars/                   # Mars parsers
  │   ├── kepak/                  # Kepak parsers
  │   ├── and more retailers...
  │   └── no-match/               # No-match parsers (NOREMOS, NOREMOSCSV, NOREMOSPDF)
  ├── matchers/
  │   ├── README.md               # Instructions for adding new matchers
  │   ├── matcher-result.js       # Result constants
  │   └── [retailer]/             # Retailer-specific matchers for all parsers
  └── model-headers/
      ├── README.md               # Instructions for header definitions
      └── [retailer].js           # Header definitions for each retailer
```

## Processing Flow

### Step 4: Input Sanitization

```javascript
import { sanitizeInput } from './services/parser-service.js'

// For Excel/CSV files
const sanitized = sanitizeInput(packingListJson, 'filename.xlsx')
// Result: All trailing spaces removed, empty strings converted to null

// For PDF files
const sanitized = sanitizeInput(pdfBuffer, 'filename.pdf')
// Result: PDF buffer passed through unchanged
```

### Step 5: Parser Discovery

```javascript
import { findParser } from './services/parsers/parser-factory.js'

// Step 5a: File Type Detection
const parser = await findParser(sanitizedData, 'filename.xlsx')

// Step 5b: REMOS Validation (implemented in no-match parsers)
// - Checks for RMS-GB-XXXXXX-XXX pattern
// - Returns NOREMOS/NOREMOSCSV/NOREMOSPDF if not found

// Step 5c: Retailer Matcher Selection (implemented in matchers)
// - Matches establishment number patterns
// - Validates header structure
// - Returns specific parser (e.g., ASDA3, TESCO3, BANDM1, FOWLERWELCH2)
```

### Steps 6 & 7: Data Extraction + Validation

```javascript
const result = await parserFactory.generateParsedPackingList(
  parser,
  sanitizedData,
  dispatchLocation
)

// Result structure:
// {
//   business_checks: {
//     all_required_fields_present: true,
//     failure_reasons: null
//   },
//   items: [
//     {
//       description: "Product description",
//       commodity_code: "0123456789",
//       number_of_packages: 10,
//       total_net_weight_kg: 50.5,
//       total_net_weight_unit: "kg",
//       row_location: { rowNumber: 5, sheetName: "Sheet1" }
//     }
//   ],
//   registration_approval_number: "RMS-GB-000000-001",
//   parserModel: "ASDA1",
//   establishment_numbers: ["RMS-GB-000000-001"],
//   dispatchLocationNumber: "LOC123"
// }
```

## Usage Example

```javascript
import { parsePackingList } from './services/parser-service.js'

async function processPackingList(packingListData, fileName, dispatchLocation) {
  try {
    // Run complete steps 4-7 processing
    const result = await parsePackingList(
      packingListData,
      fileName,
      dispatchLocation
    )

    if (result.business_checks.all_required_fields_present) {
      console.log('✓ Validation passed')
      console.log(`  Parsed ${result.items.length} items`)
      console.log(`  Parser model: ${result.parserModel}`)
    } else {
      console.log('✗ Validation failed')
      console.log(`  Reasons: ${result.business_checks.failure_reasons}`)
    }

    return result
  } catch (error) {
    console.error('Processing error:', error.message)
    throw error
  }
}
```

## Adding New Retailer Parsers

### 1. Create Header Definition

Create `src/services/model-headers/retailer-name.js`:

```javascript
module.exports = {
  RETAILER1: {
    regex: {
      description: /description|item/i,
      commodity_code: /commodity|code/i,
      number_of_packages: /packages|qty/i,
      total_net_weight_kg: /net weight|weight/i
    },
    establishmentNumber: {
      regex: /RMS-GB-\d{6}-\d{3}/i
    }
  }
}
```

Update `src/services/model-headers.js` to export the new headers.

### 2. Create Matcher

Create `src/services/matchers/retailer-name/model1.js`:

```javascript
import { matcherResult } from '../matcher-result.js'

export function matches(packingList, filename) {
  // Implement matcher logic:
  // 1. Check for empty file
  if (!packingList || Object.keys(packingList).length === 0) {
    return matcherResult.EMPTY_FILE
  }

  // 2. Validate establishment number
  const hasValidRMS = /RMS-GB-\d{6}-\d{3}/.test(JSON.stringify(packingList))
  if (!hasValidRMS) {
    return matcherResult.WRONG_ESTABLISHMENT_NUMBER
  }

  // 3. Validate header structure
  // ... your header validation logic ...

  return matcherResult.CORRECT
}
```

### 3. Create Parser

Create `src/services/parsers/retailer-name/model1.js`:

```javascript
import { rowFinder } from '../../utilities/row-finder.js'

export function parse(packingListJson) {
  // Implement parser logic:
  // 1. Extract establishment numbers
  const establishmentNumbers = extractEstablishmentNumbers(packingListJson)

  // 2. Find header row
  const headerRow = rowFinder(packingListJson, headerPatterns)

  // 3. Map columns
  const columnMap = mapColumns(headerRow)

  // 4. Extract items
  const items = extractItems(packingListJson, columnMap)

  return {
    business_checks: {
      all_required_fields_present: validateItems(items),
      failure_reasons: null
    },
    items,
    registration_approval_number: establishmentNumbers[0],
    parserModel: 'RETAILER1',
    establishment_numbers: establishmentNumbers
  }
}
```

### 4. Update Parser Registry

Update `src/services/model-parsers.js` to register the new parser:

```javascript
import { matches as matchesRetailer1 } from './matchers/retailer-name/model1.js'
import { parse as parseRetailer1 } from './parsers/retailer-name/model1.js'

export const excelMatchers = [
  // ... existing matchers
  { name: 'RETAILER1', matches: matchesRetailer1, parse: parseRetailer1 }
]
```

## Implementation Status

✅ **All Core Components Implemented:**

1. ✅ File Conversion Utilities (Excel/CSV/PDF to JSON)

   - `src/utilities/excel-utility.js`
   - `src/utilities/csv-utility.js`
   - `src/utilities/pdf-helper.js`

2. ✅ No-Match Parsers

   - `src/services/parsers/no-match/noremos.js`
   - `src/services/parsers/no-match/noremoscsv.js`
   - `src/services/parsers/no-match/noremospdf.js`

3. ✅ Retailer-Specific Parsers (16+ retailers implemented)

   - ASDA, Tesco, B&M, Fowler-Welch, Turners, Mars, Kepak, Savers
   - Iceland, Booker, Co-op, Giovanni, Nisa, Sainsbury's, TJ Morris, M&S
   - Buffaload Logistics

4. ✅ Parser Mapping Utilities

   - `src/services/parser-map.js` - Column mapping utility
   - `src/services/parser-combine.js` - Result combining utility

5. ✅ Comprehensive Test Coverage
   - Unit tests for each parser and matcher
   - Integration tests for the complete flow

## References

- [Original ADP Packing List Processing Flow](flow/original-adp-packing-list-processing-flow.md)
- [Parser Discovery Extraction Detailed](flow/parser-discovery-extraction-detailed.md)
- [Generic Parser Discovery and Extraction Flow](flow/parser-discovery-extraction-generic.md)
- [Parsers README](../src/services/parsers/README.md) - Detailed implementation guide
