# Packing List Processing - Steps 4-7 Implementation

This document describes the migrated code for orchestrating packing list processing as outlined in sections 4-7 of [original-adp-packing-list-processing-flow.md](docs/migration/original-adp-packing-list-processing-flow.md).

## Overview

The implementation provides the core infrastructure for:

- **Step 4**: Input Sanitization - Removing trailing spaces and empty cells
- **Step 5**: Parser Discovery - File type detection, REMOS validation, and retailer matcher selection
- **Step 6**: Data Extraction - Extracting establishment numbers, mapping columns, and processing rows
- **Step 7**: Data Validation & Cleanup - Removing empty items, validating fields, and setting business checks

## Architecture

### Main Orchestration Service

**[src/services/packing-list-process-service.js](src/services/packing-list-process-service.js)** (PLACEHOLDER - needs creation)

- Main entry point for steps 4-7
- Orchestrates: sanitization → parser discovery → extraction → validation

### Parser Factory

**[src/services/parser-factory.js](src/services/parser-factory.js)**

- `findParser()` - Step 5: Discovers appropriate parser based on file type and content
- `generateParsedPackingList()` - Steps 6 & 7: Extracts data and runs validation

### Utilities

**[src/utilities/json-file.js](src/utilities/json-file.js)** (PLACEHOLDER - needs creation)

- `sanitise()` - Step 4: Removes trailing spaces and converts empty strings to null

**[src/utilities/file-extension.js](src/utilities/file-extension.js)**

- `isExcel()`, `isCsv()`, `isPdf()` - Step 5a: File type detection

**[src/utilities/row-finder.js](src/utilities/row-finder.js)**

- `rowFinder()` - Step 6: Locates header rows in packing list sheets

### Validators

**[src/services/validators/packing-list-column-validator.js](src/services/validators/packing-list-column-validator.js)** (PLACEHOLDER - needs creation)

- `validatePackingList()` - Step 7: Main validation entry point
- `validatePackingListByIndexAndType()` - Runs all validation checks
- `generateFailuresByIndexAndTypes()` - Generates failure reason text

**[src/services/validators/packing-list-validator-utilities.js](src/services/validators/packing-list-validator-utilities.js)**

- `removeEmptyItems()` - Step 7: Removes items with all null values
- `removeBadData()` - Step 7: Filters items with critical validation failures
- Field validators: `hasMissingDescription()`, `hasMissingPackages()`, etc.

**[src/services/validators/packing-list-failure-reasons.js](src/services/validators/packing-list-failure-reasons.js)**

- Human-readable failure reason descriptions

## Model Placeholders

The following directory structure has been created with README documentation for adding retailer-specific parsers:

```
src/services/
  ├── parsers/
  │   ├── README.md               # Instructions for adding new parsers
  │   ├── [retailer]/             # PLACEHOLDER - Add retailer parsers here
  │   │   ├── model1.js
  │   │   └── model2.js
  │   └── no-match/               # PLACEHOLDER - Add no-match parsers here
  │       ├── noremos.js
  │       ├── noremoscsv.js
  │       └── noremospdf.js
  ├── matchers/
  │   ├── README.md               # Instructions for adding new matchers
  │   ├── matcher-result.js       # Result constants
  │   └── [retailer]/             # PLACEHOLDER - Add retailer matchers here
  │       ├── model1.js
  │       └── model2.js
  └── model-headers/
      ├── README.md               # Instructions for header definitions
      ├── index.js                # Central export point
      └── [retailer].js           # PLACEHOLDER - Add header definitions here
```

## Processing Flow

### Step 4: Input Sanitization

```javascript
const { sanitizeInput } = require('./services/packing-list-process-service')

// For Excel/CSV files
const sanitized = sanitizeInput(packingListJson, 'filename.xlsx')
// Result: All trailing spaces removed, empty strings converted to null

// For PDF files
const sanitized = sanitizeInput(pdfBuffer, 'filename.pdf')
// Result: PDF buffer passed through unchanged
```

### Step 5: Parser Discovery

```javascript
const parserFactory = require('./services/parser-factory')

// Step 5a: File Type Detection
const parser = await parserFactory.findParser(sanitizedData, 'filename.xlsx')

// Step 5b: REMOS Validation (TODO - implement in no-match parsers)
// - Checks for RMS-GB-XXXXXX-XXX pattern
// - Returns NOREMOS/NOREMOSCSV/NOREMOSPDF if not found

// Step 5c: Retailer Matcher Selection (TODO - implement matchers)
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
const { parsePackingList } = require('./services/packing-list-process-service')

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

Update `src/services/model-headers/index.js` to export the new headers.

### 2. Create Matcher

Create `src/services/matchers/retailer-name/model1.js`:

```javascript
const matcherResult = require('../matcher-result')

function matches(packingList, filename) {
  // TODO: Implement matcher logic
  // 1. Check for empty file
  // 2. Validate establishment number
  // 3. Validate header structure
  return matcherResult.CORRECT // or other result
}

module.exports = { matches }
```

### 3. Create Parser

Create `src/services/parsers/retailer-name/model1.js`:

```javascript
const { rowFinder } = require('../../utilities/row-finder')

function parse(packingListJson) {
  // TODO: Implement parser logic
  // 1. Extract establishment numbers
  // 2. Find header row
  // 3. Map columns
  // 4. Extract items

  return {
    business_checks: {
      all_required_fields_present: false,
      failure_reasons: null
    },
    items: [],
    registration_approval_number: null,
    parserModel: 'RETAILER1',
    establishment_numbers: []
  }
}

module.exports = { parse }
```

### 4. Update Parser Factory

Update `src/services/parser-factory.js` to include the new parser in the appropriate `getExcelParser()`, `getCsvParser()`, or `getPdfParser()` function.

## Next Steps

1. **Implement File Conversion Utilities** (Excel/CSV/PDF to JSON)

   - `src/utilities/excel-utility.js`
   - `src/utilities/csv-utility.js`
   - `src/utilities/pdf-helper.js`

2. **Implement No-Match Parsers**

   - `src/services/parsers/no-match/noremos.js`
   - `src/services/parsers/no-match/noremoscsv.js`
   - `src/services/parsers/no-match/noremospdf.js`

3. **Add Retailer-Specific Parsers**

   - Follow the structure in `src/services/parsers/README.md`
   - Add matchers, parsers, and header definitions

4. **Implement Parser Mapping Utilities**

   - `src/services/parser-map.js` - Column mapping utility
   - Used in Step 6 to map Excel/CSV columns to standard fields

5. **Add Tests**
   - Unit tests for each parser and matcher
   - Integration tests for the complete flow

## References

- [Original ADP Packing List Processing Flow](docs/migration/original-adp-packing-list-processing-flow.md)
- [Parser Discovery Extraction Detailed](docs/flow/parser-discovery-extraction-detailed.md)
- [Find Parser to Use](docs/migration/find-parser-to-use.md)
- [Parsers README](src/services/parsers/README.md) - Detailed implementation guide
