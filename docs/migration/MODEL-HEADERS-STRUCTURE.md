# Model Headers Structure

## Overview

The model headers are split into three separate registry files, matching the legacy repository structure:

- **`src/services/model-headers.js`** - Excel parser headers
- **`src/services/model-headers-csv.js`** - CSV parser headers
- **`src/services/model-headers-pdf.js`** - PDF parser headers

Individual retailer header definitions live in `src/services/model-headers/[retailer].js`

## File Structure

```
src/services/
├── model-headers.js              # Excel headers registry (aggregator)
├── model-headers-csv.js          # CSV headers registry (aggregator)
├── model-headers-pdf.js          # PDF headers registry (aggregator)
└── model-headers/                # Individual retailer definitions
    ├── asda.js                   # ASDA headers (Excel + CSV)
    ├── iceland.js                # Iceland headers (CSV)
    └── [retailer].js             # Add more as needed
```

## Registry Files (Aggregators)

### Excel Registry: `model-headers.js`

Imports and aggregates Excel-specific headers:

```javascript
/**
 * Excel model headers registry
 *
 * Central registry combining all retailer-specific header configurations for Excel parsers.
 * Each retailer provides establishment number patterns and field mapping regex.
 */
import { asdaHeaders } from './model-headers/asda.js'

const headers = {
  ...asdaHeaders
  // TODO: Add other Excel model headers as they are migrated
}

export default headers
```

**Used by:**

- Excel matchers: `src/services/matchers/[retailer]/model[N].js` (Excel models)
- Excel parsers: `src/services/parsers/[retailer]/model[N].js` (Excel models)

### CSV Registry: `model-headers-csv.js`

Imports and aggregates CSV-specific headers:

```javascript
/**
 * CSV model headers registry
 *
 * Aggregates CSV-specific header configurations from individual retailer modules.
 * Used by CSV parsers to identify and extract field data.
 */
import { csvIcelandHeaders } from './model-headers/iceland.js'
import { csvAsdaHeaders } from './model-headers/asda.js'

const headers = {
  ...csvIcelandHeaders,
  ...csvAsdaHeaders
  // TODO: Add other CSV model headers as they are migrated
}

export default headers
```

**Used by:**

- CSV matchers: `src/services/matchers/[retailer]/model[N].js` (CSV models)
- CSV parsers: `src/services/parsers/[retailer]/model[N].js` (CSV models)

### PDF Registry: `model-headers-pdf.js`

Imports and aggregates PDF-specific headers:

```javascript
/**
 * PDF model headers registry
 *
 * Aggregates PDF-specific header configurations from individual retailer modules.
 * Used by PDF AI parsers to map Azure Form Recognizer fields.
 */

const headers = {
  // TODO: Add PDF model headers as they are migrated
  // Example from legacy:
  // ...pdfIcelandHeaders,
  // ...pdfBookerHeaders,
  // ...pdfGiovanniHeaders,
  // ...pdfMandsHeaders,
  // ...pdfGreggsHeaders,
}

export default headers
```

**Used by:**

- PDF parsers: `src/services/parsers/[retailer]/model[N].js` (PDF models)

## Retailer Definition Files

Individual retailer files in `model-headers/` directory export **named exports**, not default exports.

### Example: ASDA (Excel + CSV)

`src/services/model-headers/asda.js`:

```javascript
/**
 * ASDA model headers
 *
 * Provides establishment number regexes and header regex mappings
 * for ASDA packing list variants used by matchers.
 */

const asdaHeaders = {
  ASDA1: {
    /* Excel model 1 config */
  },
  ASDA2: {
    /* Excel model 2 config */
  },
  ASDA3: {
    /* Excel model 3 config */
  }
}

const csvAsdaHeaders = {
  ASDA4: {
    /* CSV model 4 config */
  }
}

// Named exports - NOT default export!
export { asdaHeaders, csvAsdaHeaders }
```

### Example: Iceland (CSV only)

`src/services/model-headers/iceland.js`:

```javascript
/**
 * Iceland model headers - CSV variants
 */

const csvIcelandHeaders = {
  ICELAND2: {
    /* CSV model 2 config */
  }
}

// Named export - NOT default export!
export { csvIcelandHeaders }
```

## Import Patterns

### Excel Matchers and Parsers

```javascript
import headers from '../../model-headers.js' // Excel registry

// Access specific model
const myModel = headers.ASDA3
```

### CSV Matchers and Parsers

```javascript
import headers from '../../model-headers-csv.js' // CSV registry

// Access specific model
const myModel = headers.ICELAND2
```

### PDF Matchers and Parsers

```javascript
import headers from '../../model-headers-pdf.js' // PDF registry

// Access specific model (when implemented)
const myModel = headers.BOOKER_PDF1
```

## Adding New Retailer Headers

### For Excel Models

1. **Create or update** `src/services/model-headers/[retailer].js`:

   ```javascript
   const retailerHeaders = {
     RETAILER1: {
       /* config */
     }
   }
   export { retailerHeaders }
   ```

2. **Update** `src/services/model-headers.js`:

   ```javascript
   import { retailerHeaders } from './model-headers/retailer.js'

   const headers = {
     ...asdaHeaders,
     ...retailerHeaders // Add here
   }
   ```

### For CSV Models

1. **Create or update** `src/services/model-headers/[retailer].js`:

   ```javascript
   const csvRetailerHeaders = {
     RETAILER_CSV1: {
       /* config */
     }
   }
   export { csvRetailerHeaders }
   ```

2. **Update** `src/services/model-headers-csv.js`:

   ```javascript
   import { csvRetailerHeaders } from './model-headers/retailer.js'

   const headers = {
     ...csvIcelandHeaders,
     ...csvAsdaHeaders,
     ...csvRetailerHeaders // Add here
   }
   ```

### For PDF Models

1. **Create or update** `src/services/model-headers/[retailer].js`:

   ```javascript
   const pdfRetailerHeaders = {
     RETAILER_PDF1: {
       /* config */
     }
   }
   export { pdfRetailerHeaders }
   ```

2. **Update** `src/services/model-headers-pdf.js`:

   ```javascript
   import { pdfRetailerHeaders } from './model-headers/retailer.js'

   const headers = {
     ...pdfRetailerHeaders // Add here
   }
   ```

## Legacy Comparison

| Legacy (CommonJS)                          | Current (ES6)                              | Purpose                         |
| ------------------------------------------ | ------------------------------------------ | ------------------------------- |
| `app/services/model-headers.js`            | `src/services/model-headers.js`            | Excel headers registry          |
| `app/services/model-headers-csv.js`        | `src/services/model-headers-csv.js`        | CSV headers registry            |
| `app/services/model-headers-pdf.js`        | `src/services/model-headers-pdf.js`        | PDF headers registry            |
| `app/services/model-headers/[retailer].js` | `src/services/model-headers/[retailer].js` | Individual retailer definitions |

**Key differences:**

- ES6 modules with `import`/`export` instead of `require`/`module.exports`
- Named exports from retailer files (`export { asdaHeaders }`)
- Default exports from registry files (`export default headers`)
- Relative paths must include `.js` extension

## Testing

Verify the structure is correct by running tests:

```bash
npm test
```

All 275 tests should pass across 31 test files.

## Related Documentation

- [CSV Model Import Guide](./CSV-MODEL-IMPORT-GUIDE.md) - Complete guide for CSV parsers
- [Excel Model Import Guide](./EXCEL-MODEL-IMPORT-GUIDE.md) - Complete guide for Excel parsers
