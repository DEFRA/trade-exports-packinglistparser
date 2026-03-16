---
description: Instructions for how to create new models
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

Each model-headers file must define a named export. Required fields for the `regex` map:

| Field                 | Purpose                                |
| --------------------- | -------------------------------------- |
| `description`         | Product description column             |
| `commodity_code`      | Harmonized System / tariff code column |
| `number_of_packages`  | Package count column                   |
| `total_net_weight_kg` | Net weight column                      |

Additional optional fields inside `regex`: `total_net_weight_unit`, `type_of_treatment`, `nature_of_products`.

### `regex` vs top-level properties

`nirms` and `country_of_origin` must be defined as **top-level properties on the model object**, not inside the `regex` map:

```js
const exampleHeaders = {
  EXAMPLE1: {
    establishmentNumber: { regex: /^RMS-GB-000000-\d{3}$/i },
    regex: {
      description: /Description of goods/i,
      commodity_code: /Commodity code/i,
      number_of_packages: /No\.? of packages/i,
      total_net_weight_kg: /Item Net Weight/i
    },
    nirms: /NIRMS Red\/Green Lane/i, // top-level, NOT inside regex
    country_of_origin: /Country of Origin/i, // top-level, NOT inside regex
    findUnitInHeader: true,
    validateCountryOfOrigin: true,
    invalidSheets: []
  }
}
```

**Why this matters:** the matcher calls `matchesHeader()` against `Object.values(headers.MODEL.regex)`. Fields inside `regex` are all checked during header matching — if a required header is missing, the file is rejected. `nirms` and `country_of_origin` columns are expected in the packing list and are consumed by the parser, but their absence must not prevent the model from matching. Keeping them at the top level means the matcher can confirm the model without depending on those columns being present.

Also include:

- `establishmentNumber.regex` — the REMOS establishment number pattern for this retailer.
- `findUnitInHeader` — when `true`, the parser reads the weight unit from the `total_net_weight_kg` header cell value (for example `"Item Net Weight (kgs)"`). Set to `false` when the unit is fixed or not present in the header.
- `validateCountryOfOrigin` — when `true`, the parser validates each item's `country_of_origin` value against the ISO codes reference list. Requires `country_of_origin` to be defined as a top-level property on the model.
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
- **All model data and expected results** used in `test/parser-service/` tests must be sourced from `test/test-data-and-results/models/` (or `models-csv/` / `models-pdf/`) and `test/test-data-and-results/results/` (or `results-csv/` / `results-pdf/`) respectively — never define test model data or expected result objects inline in the test file. Add new variants to the appropriate `test-data-and-results` file when a test requires data not already exported.
- **Shared test constants** (`INVALID_FILENAME`, `NO_MATCH_RESULT`, `ERROR_SUMMARY_TEXT`, etc.) must be imported from `test/test-constants.js` — never duplicate these inline in individual test files.
