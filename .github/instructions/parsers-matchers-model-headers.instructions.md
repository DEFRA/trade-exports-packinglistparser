---
applyTo: 'src/services/parsers/**,src/services/matchers/**,src/services/model-headers/**'
---

# Parser, Matcher, and Model Headers Conventions

## Overview

The parser discovery flow follows four steps:

1. **File type detection** (`parser-factory.js`) — determines Excel, CSV, or PDF.
2. **REMOS validation** (`parsers/no-match/`) — checks for a valid `RMS-GB-XXXXXX-XXX` establishment number; returns `NOREMOS`, `NOREMOSCSV`, or `NOREMOSPDF` if absent.
3. **Retailer matcher selection** (`matchers/`) — matches establishment number patterns and validates header row structure; returns a specific parser model identifier (for example `ASDA3`, `TESCO2`, `BANDM1`).
4. **Data extraction** (`parsers/`) — locates the header row, maps columns to standard fields, and processes rows into items.

## Naming Conventions

- Name retailer directories after the retailer in kebab-case (for example `buffaload-logistics/`, `tjmorris/`).
- Name model files sequentially: `model1.js`, `model2.js`, `model3.js`.
- Use `UPPER_SNAKE_CASE` for parser model enum values (for example `TESCO3`, `FOWLERWELCH2`).
- Co-locate matcher tests alongside the matcher: `model1.test.js` next to `model1.js`.
- Keep model-headers file names aligned with the retailer directory name (for example `src/services/model-headers/tesco.js`).

## Directory Structure

```
src/services/
├── parsers/
│   ├── [retailer]/
│   │   ├── model1.js          # Parser for format variant 1
│   │   ├── model1.test.js
│   │   └── ...
│   ├── no-match/
│   │   └── model1.js          # Exports noRemosParse and unrecognisedParse
│   ├── parser-factory.js      # findParser() and generateParsedPackingList()
│   └── parsers.js             # getExcelParser / getCsvParser / getPdfNonAiParser selectors
├── matchers/
│   ├── [retailer]/
│   │   ├── model1.js          # Matcher for format variant 1
│   │   ├── model1.test.js
│   │   └── ...
├── model-headers/
│   └── [retailer].js          # Header definitions for each retailer
├── model-headers.js           # Aggregates all Excel model headers
├── model-headers-csv.js       # Aggregates all CSV model headers
├── model-parsers.js           # Parser/matcher registry
└── matcher-result.js          # Matcher result constants (shared)
```

## Parser Implementation

Each parser must:

- Export a `parse(packingListJson)` function.
- Use `createLogger()` from `../../../common/helpers/logging/logger.js` for logging.
- Use `formatError(error)` from `../../../common/helpers/logging/error-logger.js` when logging errors.
- Import `combineParser` from `../../parser-combine.js` and return `combineParser.combine(...)` as the result.
- Import `parserModel` from `../../parser-model.js` and pass the correct model enum value to `combine`.
- Use `rowFinder` from `../../../utilities/row-finder.js` to locate the header row — do not hard-code row indices.
- Use `mapParser` from `../../parser-map.js` for column-to-field mapping.
- Use `matchesHeader` from `../../matches-header.js` to validate header rows.
- Filter out empty or totals rows before returning items; do not emit summary rows as data items.

```javascript
// parsers/[retailer]/model1.js
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { formatError } from '../../../common/helpers/logging/error-logger.js'
import combineParser from '../../parser-combine.js'
import parserModel from '../../parser-model.js'
import headers from '../../model-headers.js'
import { rowFinder } from '../../../utilities/row-finder.js'
import { mapParser } from '../../parser-map.js'
import { matchesHeader } from '../../matches-header.js'
import MatcherResult from '../../matcher-result.js'
import * as regex from '../../../utilities/regex.js'

const logger = createLogger()

/**
 * Parse [Retailer] packing list — Model 1.
 * @param {Object} packingListJson - Workbook JSON keyed by sheet name.
 * @returns {Object} Combined parser result.
 */
export function parse(packingListJson) {
  try {
    const sheets = Object.keys(packingListJson)
    let items = []
    let establishmentNumbers = []

    // 1. Extract establishment numbers
    // 2. Find header row using rowFinder()
    // 3. Map columns using mapParser()
    // 4. Filter and collect items

    return combineParser.combine(
      establishmentNumbers[0] ?? null,
      items,
      false,
      parserModel.RETAILER1,
      establishmentNumbers
    )
  } catch (err) {
    logger.error(formatError(err), 'Error in [Retailer] Model 1 parser')
    throw err
  }
}
```

## Matcher Implementation

Each matcher must:

- Export a `matches(packingList, filename)` function returning a `matcherResult` constant.
- Return `matcherResult.EMPTY_FILE` when no sheets are present.
- Return `matcherResult.WRONG_ESTABLISHMENT_NUMBER` when the regex does not match.
- Return `matcherResult.WRONG_HEADER` when header validation fails.
- Return `matcherResult.CORRECT` on a successful match, and log it at `info` level with the filename.
- Catch all errors, log with `formatError`, and return `matcherResult.GENERIC_ERROR`.

## Model Headers

Each model-headers file must define a named export and a default export. Required fields for the `regex` map:

| Field                 | Purpose                                |
| --------------------- | -------------------------------------- |
| `description`         | Product description column             |
| `commodity_code`      | Harmonized System / tariff code column |
| `number_of_packages`  | Package count column                   |
| `total_net_weight_kg` | Net weight column                      |

Additional optional fields: `country_of_origin`, `total_net_weight_unit`, `type_of_treatment`, `nature_of_products`, `nirms`.

Also include:

- `establishmentNumber.regex` — the REMOS establishment number pattern for this retailer.
- Validation flags where applicable: `findUnitInHeader`, `validateCountryOfOrigin`.
- Excel-specific: `invalidSheets` array (list sheet names to skip).
- PDF-specific: coordinate bounds (`x`, `x1`, `x2`) and totals-row filtering config.

After creating a new model-headers file, add its export to:

- `src/services/model-headers.js` (Excel and PDF models)
- `src/services/model-headers-csv.js` (CSV models)

## Registering a New Parser Model

After implementing parser and matcher files, register the new model in:

1. `src/services/model-parsers.js` — add the matcher/parser pair to the registry.
2. `src/services/parser-model.js` — add the enum value for the new model.

## Format-Specific Notes

### CSV

- Use CSV-specific headers from `src/services/model-headers-csv.js`.
- Keep matcher and parser imports aligned with existing CSV models, including the `../../../common/helpers/logging/logger.js` path.
- Ensure parser output matches the existing normalised item shape and includes required `combine` parameters.

### Excel

- Follow existing sheet and header row detection patterns.
- Reuse `rowFinder`, `mapParser`, and other utilities — do not duplicate extraction logic.
- Validate boundary cases: missing sheet names, shifted header rows, and blank trailing rows.
- List sheets to ignore in the `invalidSheets` array of the model-headers definition.

### PDF

- Preserve coordinate-based extraction patterns (`x`, `x1`, `x2`, regex, header-row bands) used by existing PDF models.
- Keep totals/footer filtering rules so summary rows are not emitted as items.
- Test with representative real PDFs where possible, especially for layout variants (portrait vs landscape).

## Testing

- Co-locate unit tests with the implementation file: `model1.test.js` alongside `model1.js`.
- Add parser-service integration tests under `test/parser-service/[retailer]/` for end-to-end parser discovery behaviour.
- Cover: correct match, wrong establishment number, wrong header, empty file, and error-path scenarios for matchers.
- Cover: happy-path item extraction, empty/totals row filtering, and missing sheet handling for parsers.
