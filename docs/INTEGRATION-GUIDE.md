# Integration Guide: Packing List Processing Steps 4-7

## Overview

This guide documents the implemented packing list processing code (steps 4-7) and how to use it in your application.

### Source Information

**Source Repository:** https://github.com/DEFRA/trade-exportscore-plp  
**Migration Date:** December 2025  
**Completed:** February 2026  
**Status:** ✅ Fully Implemented

### Implementation Scope

The following components are fully implemented and production-ready:

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

#### Implemented Structure

The implementation includes complete directories with working parsers:

- `src/services/parsers/` - Retailer-specific parser implementations (ASDA, Tesco, B&M, Fowler-Welch, Turners, Mars, Kepak, Savers, Iceland, Booker, Co-op, Giovanni, Nisa, Sainsbury's, TJ Morris, M&S, Buffaload Logistics)
- `src/services/matchers/` - Retailer-specific matcher implementations
- `src/services/model-headers/` - Retailer header definitions
- `src/services/model-parsers.js` - Parser registry with all models registered
- `src/services/parsers/no-match/` - No-match parsers (NOREMOS, NOREMOSCSV, NOREMOSPDF)

#### Previously Not Included (Now Implemented)

The following components are **now fully implemented**:

- ✅ Retailer-specific parser implementations (multiple retailers)
- ✅ Excel, CSV, and PDF conversion utilities
- ✅ No-match parser implementations
- ✅ Model header definitions for all supported retailers

#### Still Not Included

The following remain outside the scope of this service:

- Steps 1-3: Blob storage retrieval, file conversion, AI processing
- Document Intelligence (AI) integration (for AI-based PDF parsing)

### Architecture Notes

The migrated code follows these patterns:

- **Factory Pattern**: Parser selection based on file type and content matching
- **Validator Pattern**: Composable field validators with failure reasons
- **Sanitization Pipeline**: Input cleaning before processing
- **ES6 Modules**: All code uses modern ES6 import/export syntax
- **Structured Logging**: Integrated with project's pino logger

---

## Integration Status

✅ **Fully Implemented** - The [src/services/packing-list-process-service.js](src/services/packing-list-process-service.js) is complete with full parsing logic.

### Current Implementation

The service orchestrates the complete packing list processing workflow:

```javascript
export async function processPackingList(
  payload,
  { stopDataExit = false } = {}
) {
  // 1. Download packing list from blob storage
  const packingList = await downloadBlobFromApplicationFormsContainerAsJson(
    payload.packing_list_blob
  )

  // 2. Process packing list
  const parsedData = await getParsedPackingList(packingList, payload)

  // 3. Process results
  const persistedData = await processPackingListResults(
    parsedData,
    payload.application_id,
    { stopDataExit }
  )

  return { result: 'success', data: persistedData }
}
```

### Integration Steps

### HTTP Response Status Codes

`POST /process-packing-list` returns:

- `200 OK` for successful processing
- `400 Bad Request` for payload validation failures (`errorType: "client"`)
- `500 Internal Server Error` for unexpected processing failures (`errorType: "server"`)

#### 1. Using the Parser Service

The parser service is fully integrated and can be imported as follows:

```javascript
import { processPackingList } from './services/packing-list-process-service.js'
import { parsePackingList } from './services/parser-service.js'
```

#### 2. Parser Service Usage

The parser service is production-ready:

```javascript
import { parsePackingList } from './services/parser-service.js'

// Parse a packing list document
const result = await parsePackingList(packingListData, filename)

// Result includes:
// - items: Array of extracted items
// - parserModel: Name of parser used (e.g., 'ASDA3', 'TESCO3')
// - business_checks: Validation results
// - establishmentNumbers: Array of RMS numbers found
```

#### 3. File Conversion Utilities

✅ **All utilities are implemented** in the `src/utilities/` directory:

```javascript
import { convertExcelToJson } from '../utilities/excel-utility.js'
import { convertCsvToJson } from '../utilities/csv-utility.js'
import { extractPdf } from '../utilities/pdf-helper.js'

// Excel files
const excelData = convertExcelToJson({ sourceFile: filePath })

// CSV files
const csvData = await convertCsvToJson(bufferOrFilename)

// PDF files
const pdfData = await extractPdf(buffer)
```

## File Format Utilities

✅ **Fully Implemented** - All file format utilities are production-ready.

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

## Implementation Status

✅ **All Core Components Implemented** (as of February 2026)

1. ✅ Migrated orchestration for steps 4-7
2. ✅ Created model structure for parsers, matchers, and headers
3. ✅ Implemented file conversion utilities (Excel, CSV, PDF)
4. ✅ Implemented no-match parsers (NOREMOS, NOREMOSCSV, NOREMOSPDF)
5. ✅ Added multiple retailer parsers (ASDA, Tesco, B&M, Fowler-Welch, Turners, Mars, Kepak, Savers, Iceland, Booker, Co-op, Giovanni, Nisa, Sainsbury's, TJ Morris, M&S)
6. ✅ Comprehensive test coverage for all components
7. ✅ parser-factory.js fully operational with all parsers

## Documentation References

- [Packing List Processing Implementation](PACKING-LIST-PROCESSING.md)
- [Parsers README](../src/services/parsers/README.md)
- [Matchers README](../src/services/matchers/README.md)
- [Model Headers README](../src/services/model-headers/README.md)
- [Original Flow Documentation](flow/original-adp-packing-list-processing-flow.md)
