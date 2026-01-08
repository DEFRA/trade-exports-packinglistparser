# Model Headers

This directory contains header definitions for different retailer packing list formats.

## Purpose

Header definitions are used in Step 6: Data Extraction to:

1. Map column positions to standard field names
2. Validate header row structure
3. Extract establishment numbers

## Structure

```
model-headers/
  ├── [retailer].js          # Header definitions for each retailer
  └── index.js               # Export all headers
```

## Header Definition Format

Each header file should export an object with model definitions:

```javascript
module.exports = {
  RETAILER1: {
    // Required field regex patterns
    regex: {
      description: /description|item/i,
      commodity_code: /commodity|code/i,
      number_of_packages: /packages|qty/i,
      total_net_weight_kg: /net weight|weight/i
    },

    // Optional field patterns
    country_of_origin: /country|origin/i,
    total_net_weight_unit: /unit|uom/i,
    type_of_treatment: /treatment|temp/i,
    nature_of_products: /nature|product type/i,

    // Establishment number pattern
    establishmentNumber: {
      regex: /RMS-GB-\d{6}-\d{3}/i
    },

    // Row filtering configuration (optional)
    skipTotalsRows: true,
    skipRepeatedHeaders: true,
    totalsRowKeywords: ['TOTAL', 'SUBTOTAL', 'SUM'],
    totalsRowPattern: {
      hasNumericOnly: true,
      descriptionEmpty: true,
      commodityCodeEmpty: true
    }
  }
}
```

## Required Fields

All models must define regex patterns for these fields:

- `description` - Product description
- `commodity_code` - Harmonized System code
- `number_of_packages` - Package count
- `total_net_weight_kg` - Net weight in kilograms

## Optional Fields

- `country_of_origin` - Origin country code
- `total_net_weight_unit` - Weight unit
- `type_of_treatment` - Treatment type (Chilled, Frozen, Ambient)
- `nature_of_products` - Product nature/category

## Exporting Headers

Update `index.js` to export all header definitions:

```javascript
const retailer1Headers = require('./retailer-name')
// ... other imports

module.exports = {
  ...retailer1Headers
  // ... other exports
}
```
