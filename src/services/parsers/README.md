# Parser Models Structure

This directory contains parser and matcher implementations for different retailer packing list formats.

## Structure

The parser discovery process (Step 5) follows this pattern:

1. **File Type Detection** (`parser-factory.js`)
   - Determines if file is Excel, CSV, or PDF
2. **REMOS Validation** (`no-match/` parsers)

   - Checks for valid RMS-GB-XXXXXX-XXX establishment numbers
   - Returns NOREMOS/NOREMOSCSV/NOREMOSPDF if not found

3. **Retailer Matcher Selection** (`matchers/`)

   - Matches establishment number patterns
   - Validates header row structure
   - Returns specific parser (e.g., ASDA3, TESCO2, TESCO3, BANDM1, FOWLERWELCH2, TURNERS1)

4. **Data Extraction** (`parsers/`)
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
  │   └── model1.js          # Exports noRemosParse and unrecognisedParse
  ├── parser-factory.js      # findParser() and generateParsedPackingList()
  └── parsers.js             # getExcelParser / getCsvParser / getPdfNonAiParser selectors

matchers/
  ├── [retailer]/
  │   ├── model1.js          # Matcher for format variant 1
  │   ├── model2.js          # Matcher for format variant 2
  │   └── ...

model-headers/
  └── [retailer].js          # Header definitions for each retailer

src/services/
  ├── model-headers.js       # Aggregates all Excel model headers
  ├── model-headers-csv.js   # Aggregates all CSV model headers
  ├── model-parsers.js       # Parser/matcher registry
  └── matcher-result.js      # Matcher result constants (shared)
```

### Example Parser Implementation

```javascript
// parsers/retailer-name/model1.js
import combineParser from '../../parser-combine.js'
import parserModel from '../../parser-model.js'
import headers from '../../model-headers.js'
import * as regex from '../../../utilities/regex.js'
import { rowFinder } from '../../../utilities/row-finder.js'
import { mapParser } from '../../parser-map.js'
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { formatError } from '../../../common/helpers/logging/error-logger.js'

const logger = createLogger()

/**
 * Parse retailer packing list format - Model 1
 *
 * @param {Object} packingListJson - Workbook JSON keyed by sheet name
 * @returns {Object} Parsed packing list with items
 */
export function parse(packingListJson) {
  try {
    const sheets = Object.keys(packingListJson)
    let items = []
    let establishmentNumbers = []

    // 1. Extract establishment numbers
    // 2. Find header row using rowFinder()
    // 3. Map columns using mapParser()
    // 4. Extract items

    return combineParser.combine(
      establishmentNumbers[0] || null,
      items,
      false,
      parserModel.RETAILER1,
      establishmentNumbers
    )
  } catch (err) {
    logger.error(formatError(err), 'Error in Retailer Model 1 parser')
    return combineParser.combine(null, [], false, parserModel.RETAILER1, [])
  }
}
```

### Example Matcher Implementation

```javascript
// matchers/retailer-name/model1.js
import matcherResult from '../../matcher-result.js'
import { matchesHeader } from '../../matches-header.js'
import * as regex from '../../../utilities/regex.js'
import headers from '../../model-headers.js'
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { formatError } from '../../../common/helpers/logging/error-logger.js'

const logger = createLogger()

/**
 * Check whether the provided packing list matches Retailer Model 1
 *
 * @param {Object} packingList - Excel->JSON representation keyed by sheet
 * @param {string} filename - Source filename for logging
 * @returns {number} One of matcherResult numeric codes
 */
export function matches(packingList, filename) {
  try {
    let result = matcherResult.EMPTY_FILE
    const sheets = Object.keys(packingList)
    if (sheets?.length === 0) {
      return matcherResult.EMPTY_FILE
    }

    for (const sheet of sheets) {
      const hasEstablishmentNumber = regex.test(
        headers.RETAILER1.establishmentNumber.regex,
        packingList[sheet]
      )

      if (!hasEstablishmentNumber && result === matcherResult.EMPTY_FILE) {
        continue
      }
      if (!hasEstablishmentNumber) {
        return matcherResult.WRONG_ESTABLISHMENT_NUMBER
      }

      result = matchesHeader(
        Object.values(headers.RETAILER1.regex),
        packingList[sheet]
      )
      if (result === matcherResult.WRONG_HEADER) {
        return result
      }
    }

    if (result === matcherResult.CORRECT) {
      logger.info(`${filename} matches Retailer Model 1`)
    }

    return result
  } catch (err) {
    logger.error(formatError(err), 'Error in Retailer Model 1 matcher')
    return matcherResult.GENERIC_ERROR
  }
}
```

### Example Header Definition

```javascript
// model-headers/retailer-name.js
export default {
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
    // Establishment number pattern
    establishmentNumber: {
      regex: /RMS-GB-\d{6}-\d{3}/i
    }
  }
}
```

## Matcher Result Constants

```javascript
// src/services/matcher-result.js
export default Object.freeze({
  WRONG_EXTENSION: 0, // File type not handled by this matcher
  WRONG_ESTABLISHMENT_NUMBER: 1, // Invalid or missing RMS number
  WRONG_HEADER: 2, // Header structure mismatch
  GENERIC_ERROR: 3, // Processing error
  CORRECT: 4, // Packing list matches
  EMPTY_FILE: 5 // No data found
})
```

Import with:

```javascript
import matcherResult from '../../matcher-result.js'
```

## Integration with Parser Factory

New parsers are registered in `src/services/model-parsers.js` (not by editing `parser-factory.js` directly). Add your matcher and parser to the appropriate array:

```javascript
// src/services/model-parsers.js
import { matches as matchesRetailer1 } from './matchers/retailer-name/model1.js'
import { parse as parseRetailer1 } from './parsers/retailer-name/model1.js'

export const parsersExcel = [
  // ... existing parsers ...
  { matches: matchesRetailer1, parse: parseRetailer1 }
]
```

The `getExcelParser` / `getCsvParser` / `getPdfNonAiParser` selectors in `parsers.js` iterate this registry automatically — no changes to `parser-factory.js` or `parsers.js` are needed.

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

Tests are co-located with the implementation:

```
src/services/parsers/retailer-name/
  ├── model1.js
  └── model1.test.js

src/services/matchers/retailer-name/
  ├── model1.js
  └── model1.test.js
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
