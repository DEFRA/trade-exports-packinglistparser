# Data Files for Packing List Parser Service

This folder contains static reference data used by the Packing List Parser (PLP) service for validation purposes.

## Files

### `data-iso-codes.json`

**Purpose:** ISO 3166-1 alpha-2 country codes used to normalize and validate `country_of_origin` fields in packing list items.

**Format:** Array of 2-letter country codes (strings)

**Example:**

```json
["GB", "US", "FR", "DE", "X"]
```

**Special Values:**

- `"X"` - Placeholder for unknown or unspecified country of origin

**Usage:**

- Validates that country of origin values are legitimate ISO codes
- Used by `hasInvalidCoO()` function in packing-list-validator-utilities
- Case-insensitive matching

---

### `data-ineligible-items.json`

**Purpose:** Current consolidated list of ineligible (prohibited) items and categories used by business validation checks to identify goods that cannot be exported under NIRMS regulations.

**Format:** Array of objects with matching criteria

**Schema:**

```json
[
  {
    "country_of_origin": "string", // ISO 2-letter country code
    "commodity_code": "string", // Commodity code prefix (partial match)
    "type_of_treatment": "string|null" // Treatment type or null for any
  }
]
```

**Example:**

```json
[
  {
    "country_of_origin": "BR",
    "commodity_code": "0207",
    "type_of_treatment": null
  },
  {
    "country_of_origin": "CN",
    "commodity_code": "07061000",
    "type_of_treatment": "Chilled"
  },
  {
    "country_of_origin": "CN",
    "commodity_code": "07061000",
    "type_of_treatment": "!Raw"
  }
]
```

### `data-ineligible-items/` (Versioned Files)

**Purpose:** Historic snapshots of ineligible items rules used for versioned or date-based validation. Each file represents a specific version of the prohibited items list.

**Versioned Files:**

- `data-ineligible-items.v1.3.json` (967 lines)
- `data-ineligible-items.v1.4.json` (807 lines)
- `data-ineligible-items.v1.5.json` (1,882 lines)
- `data-ineligible-items.v1.6.json` (3,162 lines)
- `data-ineligible-items.v1.7.json` (2,062 lines)
- `data-ineligible-items.v1.8.json` (1,902 lines)
- `data-ineligible-items.v1.9.json` (1,982 lines)
- `data-ineligible-items.v2.0.json` (2,037 lines) - Current version

**Format:** Same structure as `data-ineligible-items.json`

**Usage:**

- Currently not implemented in validation logic (future enhancement)
- Can be used for historic compliance checking
- Maintains audit trail of rule changes over time
- When updating prohibited items, add a new versioned file and update the main file

**Field Definitions:**

- **`country_of_origin`**: ISO 2-letter country code. Items from this country are subject to the rule.

- **`commodity_code`**: Commodity code prefix for matching. Uses **startsWith** logic - an item with commodity code "020130" matches rule "0201".

- **`type_of_treatment`**: Specifies treatment type restrictions:
  - `null` - Matches ANY treatment or no treatment (blanket ban)
  - `"Processed"` - Matches only items with this specific treatment
  - `"!Raw"` - Exception rule (prefixed with `!`) - item is NOT ineligible if treatment matches

**Matching Logic:**

1. **Country matching**: Exact match (case-insensitive) on `country_of_origin`
2. **Commodity matching**: Prefix match (startsWith) on `commodity_code`
3. **Treatment matching**:
   - If rule has `null`: Item is ineligible regardless of treatment
   - If rule has value: Item must match treatment exactly
   - If rule has `!prefix`: Item is ALLOWED if treatment matches (exception)

**Usage:**

- Only applies to NIRMS goods (`nirms` field = "yes" or "NIRMS")
- Used by `hasIneligibleItems()` function in packing-list-validator-utilities
- Supports both standard rules and exception rules
- Multiple rules can apply - exception rules take precedence

---

## Usage Notes

### Loading Data

**Correct ES6 Import:**

```javascript
import isoCodesData from './data-iso-codes.json' with { type: 'json' }
import ineligibleItemsData from './data-ineligible-items.json' with { type: 'json' }
```

**Legacy CommonJS (deprecated):**

```javascript
const isoCodesData = require('./data-iso-codes.json')
const ineligibleItemsData = require('./data-ineligible-items.json')
```

### Data Characteristics

- **Read-only reference data** - Do not modify at runtime
- **Loaded once** - Data is imported at module load time and cached
- **JSON format** - UTF-8 encoded, properly formatted JSON
- **Version controlled** - Changes to business rules tracked in git

### Updating Data

When updating these files:

1. **Source of truth**: Obtain updated data from business/policy teams
2. **Validation**: Ensure JSON is valid and matches schema
3. **Testing**: Run validation tests to ensure data works correctly
4. **Documentation**: Update this README if data structure changes
5. **Versioning**: For ineligible items updates:
   - Create a new versioned file (e.g., `data-ineligible-items/data-ineligible-items.v2.1.json`)
   - Update `data-ineligible-items.json` to reference the latest version
   - Include changelog entry describing the changes
6. **Deployment**: Changes take effect on service restart

---

## Related Files

- **Validators**: `src/services/validators/packing-list-validator-utilities.js`
- **Tests**: `src/services/validators/packing-list-validator-utilities.test.js`
- **Failure Reasons**: `src/services/validators/packing-list-failure-reasons.js`

---

## Migration from Legacy

These data files were migrated from the legacy `trade-exportscore-plp` repository:

**Source locations:**

- `app/services/data/data-iso-codes.json`
- `app/services/data/data-prohibited-items.json` → renamed to `data-ineligible-items.json`
- `app/services/data/data-prohibited-items/` → renamed to `data-ineligible-items/`

**Migration date:** December 2025

**Changes from legacy:**

- Import statements updated from CommonJS to ES6
- File location changed from `app/services/data/` to `src/services/data/`
- Naming changed from "prohibited-items" to "ineligible-items" for consistency
- All 8 versioned files (v1.3 through v2.0) migrated and renamed
- Data format and content preserved exactly as-is
- Validation logic maintained for backward compatibility

---

## Questions or Issues?

For questions about:

- **Data content/business rules**: Contact policy/business teams
- **Data format/structure**: See migration guide in `.github/prompts/CODE_MIGRATION_GUIDE.prompt.md`
- **Usage in code**: See validator utilities and tests
