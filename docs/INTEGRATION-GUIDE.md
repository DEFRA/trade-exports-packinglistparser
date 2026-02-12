# Integration Guide: Packing List Processing Steps 4-7

## Overview

This guide shows how to integrate the migrated packing list processing code (steps 4-7) with the existing codebase.

### Source Information

**Source Repository:** https://github.com/DEFRA/trade-exportscore-plp  
**Migration Date:** December 2025  
**Migrated By:** Code migration from legacy ADP system

### Scope of Migration

The following components were migrated from the trade-exportscore-plp repository:

#### Core Processing (Steps 4-7)

For detailed information about the complete packing list processing workflow, see [docs/original-adp-packing-list-processing-flow.md](docs/original-adp-packing-list-processing-flow.md).

- **Step 4: Input Sanitization** - JSON sanitization utilities for Excel/CSV data

  - Removes trailing spaces from string values
  - Converts empty strings to null
  - Removes null values from arrays and objects
  - Only applies to Excel/CSV files (PDFs pass through unchanged)

- **Step 5: Parser Discovery** - File type detection, REMOS validation, and parser matching

  - 5a: File Type Detection - Identify Excel, CSV, or PDF based on file extension
  - 5b: REMOS Validation - Check for valid RMS establishment numbers (RMS-GB-XXXXXX-XXX format)
  - 5c: Retailer Matcher Selection - Match document against retailer-specific parsers using header patterns

- **Step 6: Data Extraction** - Parser execution and data extraction from packing lists

  - Execute matched parser's `parse()` function
  - Extract items with product information (identifiers, descriptions, weights, packages, etc.)
  - Map retailer-specific column names to standardized output format

- **Step 7: Data Validation & Cleanup** - Field validation and business rule enforcement
  - Remove items with all null/undefined values
  - Validate required fields (description, packages, net weight, product codes, etc.)
  - Check data types (packages as numbers, weights as numbers)
  - Generate failure reasons for invalid items
  - Remove items with critical validation failures
  - Set `business_checks.all_required_fields_present` flag

#### Supporting Components

- Parser factory for orchestrating the processing pipeline
- Validator utilities for field-level validation
- File extension detection utilities
- Row finder helpers for locating header rows
- Regex utilities for pattern matching
- Matcher result constants

#### Placeholder Structure

The migration created placeholder directories for future implementation:

- `src/services/parsers/` - Retailer-specific parser implementations
- `src/services/matchers/` - Retailer-specific matcher implementations
- `src/services/model-headers/` - Retailer header definitions
- `src/services/model-parsers.js` - Parser registry (placeholder)

#### Not Migrated

The following were **not** included in this migration:

- Steps 1-3: Blob storage retrieval, file conversion, AI processing
- Retailer-specific parser implementations (ASDA, Tesco, B&M, Fowler-Welch, Turners, Mars, Kepak, Savers, etc.)
- Excel, CSV, and PDF conversion utilities
- Document Intelligence (AI) integration
- No-match parser implementations
- Actual model header definitions

### Architecture Notes

The migrated code follows these patterns:

- **Factory Pattern**: Parser selection based on file type and content matching
- **Validator Pattern**: Composable field validators with failure reasons
- **Sanitization Pipeline**: Input cleaning before processing
- **ES6 Modules**: All code uses modern ES6 import/export syntax
- **Structured Logging**: Integrated with project's pino logger

---

## Current Integration Point

The existing [src/services/packing-list-process-service.js](src/services/packing-list-process-service.js) has a placeholder function that needs to be replaced:

### Current Code

```javascript
async function parsePackingList(packingList, message, dispatchLocation) {
  // TODO: Implement parsing logic
  return {}
}
```

### Integration Steps

#### 1. Import the New Parser Service

Replace the existing `packing-list-process-service.js` content or update the import:

```javascript
// Add this import at the top of your file
const packingListParser = require('./packing-list-process-service')
// OR if you keep the existing service, import the parser orchestrator:
// const { parsePackingList } = require('./packing-list-parser-orchestrator')
```

#### 2. Update the parsePackingList Function

Replace the TODO implementation with:

```javascript
async function parsePackingList(packingList, message, dispatchLocation) {
  const fileName = extractFileName(message.body.packing_list_blob)

  try {
    // Call the migrated steps 4-7 orchestration
    const parsedResult = await packingListParser.parsePackingList(
      packingList,
      fileName,
      dispatchLocation
    )

    return parsedResult
  } catch (error) {
    logger.logError(
      'packing-list-process-service',
      'parsePackingList()',
      `Failed to parse packing list: ${error.message}`
    )
    throw error
  }
}

// Helper to extract filename from blob URI
function extractFileName(blobUri) {
  const url = new URL(blobUri)
  const pathname = url.pathname
  const filename = pathname.split('/').pop()
  return filename || 'unknown.xlsx'
}
```

#### 3. Update the Download Logic

Ensure the blob download returns the correct format:

```javascript
async function downloadPackingList(packing_list_blob) {
  // For Excel/CSV files
  if (
    packing_list_blob.endsWith('.xlsx') ||
    packing_list_blob.endsWith('.xls')
  ) {
    // TODO: Use excel-utility to convert to JSON
    // const excelUtility = require('../utilities/excel-utility')
    // return excelUtility.convertExcelToJson({ sourceFile: filePath })
  }

  // For CSV files
  if (packing_list_blob.endsWith('.csv')) {
    // TODO: Use csv-utility to convert to JSON
    // const csvUtility = require('../utilities/csv-utility')
    // return csvUtility.convertCsvToJson(filePath)
  }

  // For PDF files
  if (packing_list_blob.endsWith('.pdf')) {
    // TODO: Use pdf-helper to extract content
    // const pdfHelper = require('../utilities/pdf-helper')
    // return pdfHelper.extractPdf(buffer)
  }

  throw new Error('Unsupported file format')
}
```

## File Format Utilities (TODO)

The following utilities need to be implemented for complete integration:

### Excel Utility

```javascript
// src/utilities/excel-utility.js
const excelToJson = require('@boterop/convert-excel-to-json')

function convertExcelToJson(options) {
  const result = excelToJson({
    ...options,
    includeEmptyLines: true
  })

  // Normalize null entries to {}
  for (const sheet of Object.keys(result)) {
    for (let i = 0; i < result[sheet].length; i++) {
      if (result[sheet][i] == null) {
        result[sheet][i] = {}
      }
    }
  }

  return result
}

module.exports = { convertExcelToJson }
```

### CSV Utility

```javascript
// src/utilities/csv-utility.js
const { parse } = require('csv-parse')
const fs = require('node:fs')
const { Readable } = require('node:stream')

async function convertCsvToJson(bufferOrFilename) {
  const parser = createInputStream(bufferOrFilename).pipe(
    parse({
      columns: false,
      skip_empty_lines: true,
      trim: true,
      bom: true
    })
  )

  const results = []
  for await (const record of parser) {
    results.push(record)
  }

  return results
}

function createInputStream(bufferOrFilename) {
  if (Buffer.isBuffer(bufferOrFilename)) {
    return Readable.from([bufferOrFilename])
  }
  if (bufferOrFilename.pipe) {
    return bufferOrFilename
  }
  return fs.createReadStream(bufferOrFilename)
}

module.exports = { convertCsvToJson }
```

### PDF Helper

```javascript
// src/utilities/pdf-helper.js
const { PDFExtract } = require('pdf.js-extract')
const pdfExtract = new PDFExtract()

async function extractPdf(buffer) {
  const pdfJson = await pdfExtract.extractBuffer(buffer)
  return sanitise(pdfJson)
}

function sanitise(pdfJson) {
  for (const page in pdfJson.pages) {
    if (pdfJson.pages.hasOwnProperty(page)) {
      // Remove empty string elements
      pdfJson.pages[page].content = pdfJson.pages[page].content.filter(
        (item) => item.width !== 0
      )

      // Sort by y then x
      pdfJson.pages[page].content.sort((a, b) => {
        if (a.y === b.y) {
          return a.x - b.x
        }
        return a.y - b.y
      })
    }
  }

  return pdfJson
}

module.exports = { extractPdf, sanitise }
```

## Testing the Integration

### Unit Test Example

```javascript
// src/services/packing-list-process-service.test.js
const packingListParser = require('./packing-list-process-service')

describe('parsePackingList', () => {
  test('successfully parses Excel file', async () => {
    const mockPackingList = {
      Sheet1: [
        { A: 'Description', B: 'Commodity Code', C: 'Packages', D: 'Weight' },
        { A: 'Product 1', B: '0123456789', C: 10, D: 50 }
      ]
    }

    const result = await packingListParser.parsePackingList(
      mockPackingList,
      'test.xlsx',
      'LOC123'
    )

    expect(result).toHaveProperty('items')
    expect(result).toHaveProperty('business_checks')
    expect(result.dispatchLocationNumber).toBe('LOC123')
  })
})
```

### Integration Test Example

```javascript
// test/integration/packing-list-processing.test.js
const {
  processPackingList
} = require('../../src/services/packing-list-process-service')

describe('Packing List Processing Integration', () => {
  test('complete flow from message to parsed result', async () => {
    const mockMessage = {
      body: {
        application_id: 'APP123',
        packing_list_blob: 'https://storage.example.com/file.xlsx',
        SupplyChainConsignment: {
          DispatchLocation: {
            IDCOMS: {
              EstablishmentId: 'EST123'
            }
          }
        }
      }
    }

    const result = await processPackingList(mockMessage)

    expect(result.status).toBe('complete')
  })
})
```

## Dependencies to Install

Add these packages to [package.json](package.json):

```json
{
  "dependencies": {
    "@boterop/convert-excel-to-json": "^1.0.0",
    "csv-parse": "^5.5.0",
    "pdf.js-extract": "^0.2.0"
  }
}
```

Run:

```bash
npm install
```

## Logging Integration

The migrated code uses the existing logger from [src/utilities/logger.js](src/utilities/logger.js). Ensure it has these methods:

- `logger.logInfo(filename, function, message)`
- `logger.logError(filename, function, error)`
- `logger.logWarning(filename, function, message)`

## Next Steps

1. ✅ Migrated orchestration for steps 4-7
2. ✅ Created placeholder structure for models
3. ⏳ Implement file conversion utilities (Excel, CSV, PDF)
4. ⏳ Implement no-match parsers (NOREMOS, NOREMOSCSV, NOREMOSPDF)
5. ⏳ Add first retailer parser (e.g., ASDA, Tesco)
6. ⏳ Add tests for each component
7. ⏳ Update parser-factory.js to use new parsers

## Documentation References

- [Packing List Processing Implementation](PACKING-LIST-PROCESSING.md)
- [Parsers README](src/services/parsers/README.md)
- [Matchers README](src/services/matchers/README.md)
- [Model Headers README](src/services/model-headers/README.md)
- [Original Flow Documentation](docs/migration/original-adp-packing-list-processing-flow.md)
