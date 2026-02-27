# Validators

This directory contains the packing list validation pipeline (Step 7) and the lookup caches that power it.

## Overview

After a parser extracts items from a packing list, the validation pipeline:

1. Removes rows with all-null values (`removeEmptyItems`)
2. Generates per-item failure messages (`getItemFailureMessage`)
3. Runs the full column-level validation pass (`validatePackingList`)
4. Sets `business_checks.all_required_fields_present` and `failure_reasons`
5. Strips items with invalid critical data (`removeBadData`)

Both the ineligible items check and the country-of-origin ISO code check are backed by lazy-rebuilding in-memory lookup caches that automatically use MDM-synced data when available and fall back to static JSON files.

---

## Files

| File                                  | Purpose                                                                                                |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `packing-list-column-validator.js`    | Main validation entry point — orchestrates all checks and produces failure reason text                 |
| `packing-list-validator-utilities.js` | Predicate functions for each field check; `removeEmptyItems`, `removeBadData`, `getItemFailureMessage` |
| `packing-list-failure-reasons.js`     | Human-readable failure reason string constants                                                         |
| `ineligible-index-cache.js`           | Lazy country-indexed lookup map over the ineligible items cache                                        |
| `iso-code-lookup-cache.js`            | Lazy `Set`-based lookup over the ISO codes cache                                                       |
| `row-filter-utilities.js`             | Utilities to detect and skip totals/summary rows during parsing                                        |

---

## Validation Pipeline

### Entry Point

```javascript
import { validatePackingList } from './validators/packing-list-column-validator.js'

const result = validatePackingList(parsedPackingList)
// { hasAllFields: true }
// or
// { hasAllFields: false, failureReasons: 'Product description is missing in row 3.\n...' }
```

### Pre/Post-validation Steps

These are called by `parser-factory.js` around `validatePackingList`:

```javascript
import {
  removeEmptyItems,
  removeBadData,
  getItemFailureMessage
} from './validators/packing-list-validator-utilities.js'

// Step 1: Remove all-null rows
parsedPackingList.items = removeEmptyItems(parsedPackingList.items)

// Step 2: Attach per-item failure messages (used by validation)
parsedPackingList.items = parsedPackingList.items.map((item) => ({
  ...item,
  failure: getItemFailureMessage(item, validateCountryOfOrigin, unitInHeader)
}))

// Step 3: Validate
const result = validatePackingList(parsedPackingList)

// Step 4: Null out items with invalid critical fields
parsedPackingList.items = removeBadData(parsedPackingList.items)
```

---

## Validation Checks

### Basic Field Checks (all parsers)

| Check                   | Predicate                 | Failure Reason                              |
| ----------------------- | ------------------------- | ------------------------------------------- |
| Identifier missing      | `hasMissingIdentifier`    | `Identifier is missing`                     |
| Product code invalid    | `hasInvalidProductCode`   | `Product code is invalid`                   |
| Description missing     | `hasMissingDescription`   | `Product description is missing`            |
| Packages missing        | `hasMissingPackages`      | `No of packages is missing`                 |
| Packages wrong type     | `wrongTypeForPackages`    | `No of packages is invalid`                 |
| Net weight missing      | `hasMissingNetWeight`     | `Total net weight is missing`               |
| Net weight wrong type   | `wrongTypeNetWeight`      | `Total net weight is invalid`               |
| Net weight unit missing | `hasMissingNetWeightUnit` | `Net Weight Unit of Measure (kg) not found` |

### Country of Origin Checks (only when `validateCountryOfOrigin: true`)

| Check                              | Predicate            | Failure Reason                                   |
| ---------------------------------- | -------------------- | ------------------------------------------------ |
| NIRMS missing                      | `hasMissingNirms`    | `NIRMS/Non-NIRMS goods not specified`            |
| NIRMS invalid                      | `hasInvalidNirms`    | `Invalid entry for NIRMS/Non-NIRMS goods`        |
| Country of origin missing          | `hasMissingCoO`      | `Missing Country of Origin`                      |
| Country of origin invalid ISO code | `hasInvalidCoO`      | `Invalid Country of Origin ISO Code`             |
| Prohibited item                    | `hasIneligibleItems` | `Prohibited item identified on the packing list` |

### Packing List Level Checks

| Check                 | Failure Reason                                                                 |
| --------------------- | ------------------------------------------------------------------------------ |
| No REMOS number found | `Check GB Establishment RMS Number.`                                           |
| No items extracted    | `No product line data found.`                                                  |
| Multiple RMS numbers  | `Multiple GB Place of Dispatch (Establishment) numbers found on packing list.` |

---

## Lookup Caches

### `iso-code-lookup-cache.js`

Wraps the ISO codes cache in a lazy-rebuilt `Set` for O(1) country code lookups. Automatically falls back to `data-iso-codes.json` when the MDM cache is empty.

```javascript
import { getNormalizedIsoCodeSet } from './iso-code-lookup-cache.js'

const isValid = getNormalizedIsoCodeSet().has('gb') // true
```

The set is only rebuilt when the underlying cache reference changes (i.e. after an MDM sync).

### `ineligible-index-cache.js`

Wraps the ineligible items cache in a lazy-rebuilt `Map<countryCode, rule[]>` for efficient lookup by country. Falls back to `data-ineligible-items.json` when MDM integration is disabled or cache is empty. Only active when `MDM_INTEGRATION_ENABLED=true`.

```javascript
import { getIneligibleIndexByCountry } from './ineligible-index-cache.js'

const rulesByCountry = getIneligibleIndexByCountry()
const cnRules = rulesByCountry.get('cn') // rules for China
```

The index is only rebuilt when the underlying cache reference changes.

---

## Ineligible Items Rule Logic

Rules in `data-ineligible-items.json` (and the MDM-sourced cache) follow this format:

```json
{ "country_of_origin": "CN", "commodity_code": "0207", "type_of_treatment": null }
{ "country_of_origin": "CN", "commodity_code": "07061000", "type_of_treatment": "Chilled" }
{ "country_of_origin": "CN", "commodity_code": "07061000", "type_of_treatment": "!Raw" }
```

Matching rules:

- `commodity_code` is matched with `startsWith` (prefix match)
- `type_of_treatment: null` — item is ineligible regardless of treatment (blanket ban)
- `type_of_treatment: "Chilled"` — item is ineligible only for this treatment
- `type_of_treatment: "!Raw"` — exception rule: item is **allowed** if treatment matches the suffix

---

## Failure Reason Text Format

Failure reasons are produced as human-readable newline-separated strings. Row locations are formatted differently based on file type:

- **Excel**: `Product description is missing in sheet "Sheet1" row 3.`
- **PDF**: `Product description is missing in page 2 row 5.`
- **CSV**: `Product description is missing in row 7.`
- **Multiple**: `Product description is missing in rows 3, 5 and 7.` (capped at 3 examples, then `in addition to N other locations`)

---

## Row Filter Utilities

`row-filter-utilities.js` is used by individual parsers (not the validation pipeline) to skip totals/summary rows before extraction. Parsers can configure:

- `skipTotalsRows: true` — enable totals row detection
- `totalsRowKeywords: ['Total', 'Grand Total']` — keyword match against description column
- `totalsRowPattern` — pattern-based detection for more complex cases

---

## Related Files

- [packing-list-column-validator.js](./packing-list-column-validator.js) — main entry point
- [packing-list-validator-utilities.js](./packing-list-validator-utilities.js) — predicates and utilities
- [packing-list-failure-reasons.js](./packing-list-failure-reasons.js) — failure reason constants
- [ineligible-index-cache.js](./ineligible-index-cache.js) — ineligible items index
- [iso-code-lookup-cache.js](./iso-code-lookup-cache.js) — ISO code set
- [row-filter-utilities.js](./row-filter-utilities.js) — totals row filtering
- [../cache/ineligible-items-cache.js](../cache/ineligible-items-cache.js) — underlying ineligible items cache
- [../cache/iso-codes-cache.js](../cache/iso-codes-cache.js) — underlying ISO codes cache
- [../parsers/parser-factory.js](../parsers/parser-factory.js) — calls the validation pipeline
- [../data/data-ineligible-items.json](../data/data-ineligible-items.json) — static fallback ineligible items
- [../data/data-iso-codes.json](../data/data-iso-codes.json) — static fallback ISO codes
