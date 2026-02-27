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

- `src/services/parsers/` - Retailer-specific parser implementations (ASDA, B&M, Barton and Redman, Booker, Boots, Buffaload Logistics, CDS, Co-op, Fowler-Welch, Giovanni, Gousto, Iceland, Kepak, Mars, M&S, Nisa, Nutricia, Sainsbury's, Savers, Tesco, TJ Morris, Turners, Warrens)
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
  // 1. Validate the contents of the input message
  const validation = validateProcessPackingListPayload(payload)
  if (!validation.isValid) {
    return {
      result: 'failure',
      error: `Validation failed: ${validation.description}`,
      errorType: 'client'
    }
  }

  // 2. Download packing list from blob storage
  const packingList = await downloadBlobFromApplicationFormsContainerAsJson(
    payload.packing_list_blob
  )

  // 3. Parse packing list
  const parsedData = await getParsedPackingList(packingList, payload)

  // 4. Process results
  const persistedData = await processPackingListResults(
    parsedData,
    payload.application_id,
    { stopDataExit }
  )

  return {
    result: 'success',
    data: {
      approvalStatus: persistedData.approvalStatus,
      reasonsForFailure: persistedData.reasonsForFailure,
      parserModel: persistedData.parserModel
    }
  }
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

// PDF files (returns pdf.js-extract JSON structure)
const pdfData = await extractPdf(buffer)
```

## File Format Utilities

✅ **Fully Implemented** - All file format utilities are production-ready.

### Excel Utility

```javascript
// src/utilities/excel-utility.js
import convertExcelToJsonLib from '@boterop/convert-excel-to-json'

export function convertExcelToJson(options) {
  const result = convertExcelToJsonLib({
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
```

### CSV Utility

```javascript
// src/utilities/csv-utility.js
import { parse } from 'csv-parse'
import fs from 'node:fs'
import { Readable } from 'node:stream'

export async function convertCsvToJson(bufferOrFilename) {
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
```

### PDF Helper

```javascript
// src/utilities/pdf-helper.js
import { PDFExtract } from 'pdf.js-extract'
const pdfExtract = new PDFExtract()

export async function extractPdf(buffer) {
  const pdfJson = await pdfExtract.extractBuffer(buffer)
  return sanitise(pdfJson)
}

export function sanitise(pdfJson) {
  for (const page of Object.keys(pdfJson.pages)) {
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

  return pdfJson
}
```

## Testing the Integration

### Unit Test Example

```javascript
// src/services/packing-list-process-service.test.js
import { describe, test, expect } from 'vitest'
import { parsePackingList } from './parser-service.js'

describe('parsePackingList', () => {
  test('successfully parses Excel file', async () => {
    const mockPackingList = {
      Sheet1: [
        { A: 'Description', B: 'Commodity Code', C: 'Packages', D: 'Weight' },
        { A: 'Product 1', B: '0123456789', C: 10, D: 50 }
      ]
    }

    const result = await parsePackingList(
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
import { describe, test, expect } from 'vitest'
import { processPackingList } from '../../src/services/packing-list-process-service.js'

describe('Packing List Processing Integration', () => {
  test('complete flow from message to parsed result', async () => {
    const mockMessage = {
      application_id: 123,
      packing_list_blob: 'https://storage.example.com/container/file.xlsx',
      SupplyChainConsignment: {
        DispatchLocation: {
          IDCOMS: {
            EstablishmentId: '00000000-0000-0000-0000-000000000000'
          }
        }
      }
    }

    const result = await processPackingList(mockMessage)

    expect(result.result).toBe('success')
    expect(result.data).toHaveProperty('approvalStatus')
    expect(result.data).toHaveProperty('parserModel')
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

The service uses the structured logger from [src/common/helpers/logging/logger.js](../src/common/helpers/logging/logger.js) and [src/common/helpers/logging/error-logger.js](../src/common/helpers/logging/error-logger.js):

```javascript
import { createLogger } from '../common/helpers/logging/logger.js'
import { formatError } from '../common/helpers/logging/error-logger.js'

const logger = createLogger()

logger.info('message')
logger.info({ key: 'value' }, 'message with context')
logger.error(formatError(err), 'Error message')
```

See the [Developer Guide](DEVELOPER-GUIDE.md#error-handling-and-logging) for full usage guidance.

## Implementation Status

✅ **All Core Components Implemented** (as of February 2026)

1. ✅ Migrated orchestration for steps 4-7
2. ✅ Created model structure for parsers, matchers, and headers
3. ✅ Implemented file conversion utilities (Excel, CSV, PDF)
4. ✅ Implemented no-match parsers (NOREMOS, NOREMOSCSV, NOREMOSPDF)
5. ✅ Added multiple retailer parsers (ASDA, Tesco, B&M, Barton and Redman, Boots, Booker, Buffaload Logistics, CDS, Co-op, Fowler-Welch, Giovanni, Gousto, Iceland, Kepak, Mars, M&S, Nisa, Nutricia, Sainsbury's, Savers, TJ Morris, Turners, Warrens)
6. ✅ Comprehensive test coverage for all components
7. ✅ parser-factory.js fully operational with all parsers

## Documentation References

- [Packing List Processing Implementation](PACKING-LIST-PROCESSING.md)
- [Parsers README](../src/services/parsers/README.md)
- [Matchers README](../src/services/matchers/README.md)
- [Model Headers README](../src/services/model-headers/README.md)
- [Original Flow Documentation](flow/original-adp-packing-list-processing-flow.md)
