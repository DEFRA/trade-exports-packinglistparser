# Parser Models Structure

This directory contains parser and matcher implementations for different retailer packing list formats.

## Structure

The parser discovery process (Step 5) follows this pattern:

1. **File Type Detection** (`parser-factory.js`)
   - Determines if file is Excel, CSV, or PDF
2. **REMOS Validation** (to be implemented in `no-match/` parsers)

   - Checks for valid RMS-GB-XXXXXX-XXX establishment numbers
   - Returns NOREMOS/NOREMOSCSV/NOREMOSPDF if not found

3. **Retailer Matcher Selection** (to be implemented in `matchers/`)

   - Matches establishment number patterns
   - Validates header row structure
   - Returns specific parser (e.g., ASDA3, TESCO2, TESCO3, BANDM1, FOWLERWELCH2, TURNERS1)

4. **Data Extraction** (to be implemented in `parsers/`)
   - Extracts establishment numbers via regex
   - Locates header row using rowFinder
   - Maps columns to standard fields
   - Processes rows to extract items

## Adding New Models

### Directory Structure

```
parsers/
  ├── [retailer]/
  │   ├── model1.js          # Parser implementation for format variant 1
  │   ├── model2.js          # Parser implementation for format variant 2
  │   └── ...
  ├── no-match/
  │   ├── noremos.js         # Excel files without REMOS
  │   ├── noremoscsv.js      # CSV files without REMOS
  │   └── noremospdf.js      # PDF files without REMOS
  └── parsers.js             # Main parser routing

matchers/
  ├── [retailer]/
  │   ├── model1.js          # Matcher for format variant 1
  │   ├── model2.js          # Matcher for format variant 2
  │   └── ...
  └── matcher-result.js      # Matcher result constants

model-headers/
  ├── [retailer].js          # Header definitions for each retailer

src/services/
  └── model-headers.js       # Export all Excel model headers
```

### Example Parser Implementation

```javascript
// parsers/retailer-name/model1.js
const { rowFinder } = require('../../utilities/row-finder')

/**
 * Parse retailer packing list format - Model 1
 *
 * @param {Object} packingListJson - Workbook JSON keyed by sheet name
 * @returns {Object} Parsed packing list with items
 */
function parse(packingListJson) {
  try {
    const sheets = Object.keys(packingListJson)
    let items = []
    let establishmentNumbers = []

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
      items,
      registration_approval_number: establishmentNumbers[0] || null,
      parserModel: 'RETAILER1',
      establishment_numbers: establishmentNumbers
    }
  } catch (err) {
    // Handle errors
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
}

module.exports = { parse }
```

### Example Matcher Implementation

```javascript
// matchers/retailer-name/model1.js
const matcherResult = require('../matcher-result')

/**
 * Check whether the provided packing list matches Retailer Model 1
 *
 * @param {Object} packingList - Excel->JSON representation keyed by sheet
 * @param {string} filename - Source filename for logging
 * @returns {string} One of matcherResult codes
 */
function matches(packingList, filename) {
  try {
    // TODO: Implement matcher logic
    // 1. Check for empty file
    // 2. Validate establishment number pattern
    // 3. Validate header structure

    return matcherResult.WRONG_ESTABLISHMENT_NUMBER
  } catch (err) {
    return matcherResult.GENERIC_ERROR
  }
}

module.exports = { matches }
```

### Example Header Definition

```javascript
// model-headers/retailer-name.js
module.exports = {
  RETAILER1: {
    regex: {
      description: /description|item/i,
      commodity_code: /commodity|code/i,
      number_of_packages: /packages|qty/i,
      total_net_weight_kg: /net weight|weight/i
    },
    // Optional fields
    country_of_origin: /country|origin/i,
    total_net_weight_unit: /unit|uom/i,
    // Establishment number regex
    establishmentNumber: {
      regex: /RMS-GB-\d{6}-\d{3}/i
    }
  }
}
```

## Matcher Result Constants

```javascript
// matchers/matcher-result.js
module.exports = {
  CORRECT: 'CORRECT',
  EMPTY_FILE: 'EMPTY_FILE',
  WRONG_ESTABLISHMENT_NUMBER: 'WRONG_ESTABLISHMENT_NUMBER',
  WRONG_HEADER: 'WRONG_HEADER',
  GENERIC_ERROR: 'GENERIC_ERROR'
}
```

## Integration with Parser Factory

Update `parser-factory.js` to include new parsers:

```javascript
// Import new parsers
const { parse: parseRetailer1 } = require('./parsers/retailer-name/model1')
const { matches: matchesRetailer1 } = require('./matchers/retailer-name/model1')

// Add to getExcelParser/getCsvParser/getPdfParser functions
async function getExcelParser(sanitizedPackingList, fileName) {
  // Check matchers in order
  const retailer1Match = matchesRetailer1(sanitizedPackingList, fileName)
  if (retailer1Match === 'CORRECT') {
    return { parse: parseRetailer1 }
  }

  // ... check other matchers

  // Return no-match parser
  return { parse: parseNoRemos }
}
```

## Required Standard Fields

All parsers must return items with these fields:

- `description` (string) - Product description
- `commodity_code` (string) - Harmonized System code
- `number_of_packages` (number|string) - Package count
- `total_net_weight_kg` (number|string) - Net weight in kg
- `row_location` (object) - Source row reference { rowNumber, sheetName? }

Optional fields:

- `country_of_origin` (string) - Origin country code
- `total_net_weight_unit` (string) - Weight unit (default: 'kg')
- `type_of_treatment` (string) - Treatment type (Chilled, Frozen, Ambient)
- `nature_of_products` (string) - Product nature/category

## Testing

Create test files for each parser and matcher:

### Unit Tests (Parser/Matcher Logic)

```
test/unit/services/
  ├── parsers/
  │   └── retailer-name/
  │       ├── model1.test.js
  │       └── ...
  └── matchers/
      └── retailer-name/
          ├── model1.test.js
          └── ...
```

### Integration Tests (Parser Discovery Service)

All parser-service integration tests should be created in:

```
test/parser-service/
  └── retailer-name/
      ├── model1.test.js    # Tests findParser() discovery for this model
      └── ...
```

These tests verify the full parser discovery flow including:

- File type detection
- REMOS validation
- Matcher selection
- Parser execution
- End-to-end parsing results

## See Also

- [Original ADP Packing List Processing Flow](../../../docs/flow/original-adp-packing-list-processing-flow.md)
- [Parser Discovery Extraction Detailed](../../../docs/flow/parser-discovery-extraction-detailed.md)
- [Generic Parser Discovery and Extraction Flow](../../../docs/flow/parser-discovery-extraction-generic.md)
