# Developer Guide

This guide provides comprehensive documentation for developers working with the Trade Exports Packing List Parser service. It consolidates service-level documentation and explains how the various components work together.

## Table of Contents

- [Overview](#overview)
- [Service Architecture](#service-architecture)
- [Parser Models](#parser-models)
  - [Parser Structure](#parser-structure)
  - [Matcher Implementation](#matcher-implementation)
  - [Model Headers](#model-headers)
  - [Adding New Models](#adding-new-models)
- [Data Files](#data-files)
  - [ISO Country Codes](#iso-country-codes)
  - [Ineligible Items](#ineligible-items)
  - [Versioned Data](#versioned-data)
- [Cache System](#cache-system)
  - [Ineligible Items Cache](#ineligible-items-cache)
  - [MDM to S3 Synchronization](#mdm-to-s3-synchronization)
  - [Sync Scheduler](#sync-scheduler)
- [TDS Synchronization](#tds-synchronization)
  - [TDS Sync Service](#tds-sync-service)
  - [TDS Sync Scheduler](#tds-sync-scheduler)
  - [File Transfer Workflow](#file-transfer-workflow)
- [Testing Guidelines](#testing-guidelines)
  - [Unit Tests](#unit-tests)
  - [Integration Tests](#integration-tests)
  - [Test Coverage](#test-coverage)

---

## Overview

The Trade Exports Packing List Parser is a Node.js service that:

1. **Parses** multiple retailer packing list formats (Excel, CSV, PDF)
2. **Validates** items against business rules (ineligible items, country of origin, commodity codes)
3. **Caches** reference data from MDM for performance
4. **Synchronizes** data with Azure Blob Storage (TDS)
5. **Integrates** with Dynamics 365 for dispatch location lookups

The service uses a modular architecture with clear separation of concerns across parsers, validators, matchers, and data services.

---

## Service Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Entry                        │
│                    (server.js/index.js)                      │
└───────────────────────────┬─────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        v                   v                   v
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│    Routes     │  │   Services    │  │   Utilities   │
│               │  │               │  │               │
│  - health     │  │  - parsers    │  │  - logger     │
│  - dynamics   │  │  - matchers   │  │  - config     │
│  - s3         │  │  - validators │  │  - row-finder │
│  - mdm        │  │  - cache      │  │  - fetch      │
│  - test-parse │  │  - tds-sync   │  │               │
└───────────────┘  └───────┬───────┘  └───────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        v                  v                  v
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│  Data Files   │  │  Cache System │  │  External     │
│               │  │               │  │  Services     │
│ - iso-codes   │  │ - ineligible  │  │               │
│ - ineligible  │  │   items cache │  │ - AWS S3      │
│   items       │  │ - MDM sync    │  │ - Azure Blob  │
│               │  │ - scheduler   │  │ - Dynamics    │
└───────────────┘  └───────────────┘  └───────────────┘
```

---

## Parser Models

The parser system uses a discovery pattern to identify the correct parser for each packing list format.

### Parser Structure

```
src/services/
  ├── parsers/
  │   ├── [retailer]/
  │   │   ├── model1.js          # Parser for format variant 1
  │   │   ├── model2.js          # Parser for format variant 2
  │   │   └── ...
  │   ├── no-match/
  │   │   ├── noremos.js         # Excel without REMOS
  │   │   ├── noremoscsv.js      # CSV without REMOS
  │   │   └── noremospdf.js      # PDF without REMOS
  │   └── parser-factory.js      # Main parser routing
  │
  ├── matchers/
  │   ├── [retailer]/
  │   │   ├── model1.js          # Matcher for variant 1
  │   │   ├── model2.js          # Matcher for variant 2
  │   │   └── ...
  │   └── matcher-result.js      # Result constants
  │
  └── model-headers/
      ├── [retailer].js          # Header definitions
      └── index.js               # Export all headers
```

### Parser Discovery Process

The parser discovery process (Step 5) follows this pattern:

1. **File Type Detection** (`parser-factory.js`)
   - Determines if file is Excel, CSV, or PDF
2. **REMOS Validation** (`no-match/` parsers)

   - Checks for valid RMS-GB-XXXXXX-XXX establishment numbers
   - Returns NOREMOS/NOREMOSCSV/NOREMOSPDF if not found

3. **Retailer Matcher Selection** (`matchers/`)

   - Matches establishment number patterns
   - Validates header row structure
   - Returns specific parser (e.g., ASDA3, TESCO3, BANDM1, FOWLERWELCH2, TURNERS1)

4. **Data Extraction** (`parsers/`)
   - Extracts establishment numbers via regex
   - Locates header row using rowFinder
   - Maps columns to standard fields
   - Processes rows to extract items

### Currently Implemented Parsers

The following parsers are currently available in the system (as of February 2026):

#### Excel Format Parsers

| Parser Model | Retailer/Supplier   | Notes                           |
| ------------ | ------------------- | ------------------------------- |
| ASDA3        | ASDA                | Model 3 format                  |
| BANDM1       | B&M                 | Model 1 format                  |
| BOOKER2      | Booker              | Model 2 format                  |
| BUFFALOAD1   | Buffaload Logistics | Model 1 format                  |
| COOP1        | Co-op               | Model 1 format                  |
| FOWLERWELCH2 | Fowler-Welch        | Model 2 format (added Feb 2026) |
| KEPAK1       | Kepak               | Model 1 format                  |
| MARS1        | Mars                | Model 1 format                  |
| NISA1        | Nisa                | Model 1 format                  |
| SAINSBURYS1  | Sainsbury's         | Model 1 format                  |
| SAVERS1      | Savers              | Model 1 format                  |
| TESCO3       | Tesco               | Model 3 format                  |
| TJMORRIS2    | TJ Morris           | Model 2 format                  |
| TURNERS1     | Turners             | Model 1 format (added Feb 2026) |

#### CSV Format Parsers

| Parser Model | Retailer | Notes         |
| ------------ | -------- | ------------- |
| ASDA4        | ASDA     | Model 4 (CSV) |
| ICELAND2     | Iceland  | Model 2 (CSV) |

#### PDF Format Parsers

| Parser Model | Retailer/Supplier | Notes                |
| ------------ | ----------------- | -------------------- |
| GIOVANNI3    | Giovanni          | Model 3 (PDF non-AI) |
| MANDS1       | Marks & Spencer   | Model 1 (PDF non-AI) |

**Note:** Parser model numbers (e.g., Model 1, Model 2) indicate different format variants from the same retailer/supplier. Higher numbers don't necessarily indicate newer or better versions—they simply represent different document template variations.

**Registry Location:** All parsers are registered in [src/services/model-parsers.js](../src/services/model-parsers.js)

### Matcher Implementation

All matchers must return one of these constants from `matcher-result.js`:

```javascript
const matcherResult = require('../matcher-result')

module.exports = {
  CORRECT: 'CORRECT', // Packing list matches
  EMPTY_FILE: 'EMPTY_FILE', // No data found
  WRONG_ESTABLISHMENT_NUMBER: 'WRONG_ESTABLISHMENT_NUMBER', // Invalid RMS number
  WRONG_HEADER: 'WRONG_HEADER', // Header mismatch
  GENERIC_ERROR: 'GENERIC_ERROR' // Processing error
}
```

**Example Matcher:**

```javascript
// matchers/retailer-name/model1.js
const matcherResult = require('../matcher-result')

function matches(packingList, filename) {
  try {
    // 1. Check for empty file
    if (!packingList || Object.keys(packingList).length === 0) {
      return matcherResult.EMPTY_FILE
    }

    // 2. Validate establishment number pattern
    const hasValidRMS = /RMS-GB-\d{6}-\d{3}/.test(JSON.stringify(packingList))
    if (!hasValidRMS) {
      return matcherResult.WRONG_ESTABLISHMENT_NUMBER
    }

    // 3. Validate header structure
    const sheets = Object.values(packingList)
    const headerRow = sheets[0]?.find(
      (row) =>
        /description/i.test(JSON.stringify(row)) &&
        /commodity/i.test(JSON.stringify(row))
    )

    if (!headerRow) {
      return matcherResult.WRONG_HEADER
    }

    return matcherResult.CORRECT
  } catch (err) {
    return matcherResult.GENERIC_ERROR
  }
}

module.exports = { matches }
```

### Model Headers

Header definitions map column names to standard fields:

```javascript
// model-headers/retailer-name.js
module.exports = {
  RETAILER1: {
    // Required field regex patterns
    regex: {
      description: /description|item/i,
      commodity_code: /commodity|code/i,
      number_of_packages: /packages|qty/i,
      total_net_weight_kg: /net weight|weight/i
    },

    // Optional fields
    country_of_origin: /country|origin/i,
    total_net_weight_unit: /unit|uom/i,
    type_of_treatment: /treatment|temp/i,
    nature_of_products: /nature|product type/i,

    // Establishment number pattern
    establishmentNumber: {
      regex: /RMS-GB-\d{6}-\d{3}/i
    }
  }
}
```

**Required Fields:**

- `description` - Product description
- `commodity_code` - Harmonized System code
- `number_of_packages` - Package count
- `total_net_weight_kg` - Net weight in kilograms

**Optional Fields:**

- `country_of_origin` - ISO 2-letter country code
- `total_net_weight_unit` - Weight unit
- `type_of_treatment` - Treatment type (Chilled, Frozen, Ambient)
- `nature_of_products` - Product nature/category

### Adding New Models

1. **Create header definition** in `model-headers/[retailer].js`
2. **Create matcher** in `matchers/[retailer]/model1.js`
3. **Create parser** in `parsers/[retailer]/model1.js`
4. **Update parser-factory.js** to include new matcher/parser
5. **Create unit tests** in `test/unit/services/parsers/[retailer]/`
6. **Create integration tests** in `test/parser-service/[retailer]/`

**See:** [Parser Models README](../src/services/parsers/README.md) for detailed examples.

---

## Data Files

Reference data files are located in `src/services/data/`.

### ISO Country Codes

**File:** `data-iso-codes.json`

**Purpose:** ISO 3166-1 alpha-2 country codes for validating `country_of_origin` fields.

**Format:** Array of 2-letter country codes

```json
["GB", "US", "FR", "DE", "X"]
```

**Special Values:**

- `"X"` - Placeholder for unknown/unspecified country

**Usage:**

```javascript
import isoCodesData from './data-iso-codes.json' with { type: 'json' }

const isValidCountry = isoCodesData.includes(countryCode.toUpperCase())
```

### Ineligible Items

**File:** `data-ineligible-items.json`

**Purpose:** Consolidated list of prohibited items used for NIRMS validation.

**Format:** Array of matching rules

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

**Field Definitions:**

- **`country_of_origin`**: ISO 2-letter country code
- **`commodity_code`**: Commodity code prefix (uses startsWith matching)
- **`type_of_treatment`**: Treatment restrictions:
  - `null` - Matches ANY treatment (blanket ban)
  - `"Processed"` - Matches only this specific treatment
  - `"!Raw"` - Exception rule (item is ALLOWED if treatment matches)

**Matching Logic:**

1. Country: Exact match (case-insensitive)
2. Commodity: Prefix match (startsWith)
3. Treatment:
   - `null` → Item ineligible regardless of treatment
   - Value → Item must match treatment exactly
   - `!prefix` → Item ALLOWED if treatment matches (exception)

**Usage:**

```javascript
import ineligibleItemsData from './data-ineligible-items.json' with { type: 'json' }

function isIneligible(item) {
  return ineligibleItemsData.some(
    (rule) =>
      rule.country_of_origin === item.country_of_origin &&
      item.commodity_code.startsWith(rule.commodity_code) &&
      (rule.type_of_treatment === null ||
        rule.type_of_treatment === item.type_of_treatment ||
        (rule.type_of_treatment.startsWith('!') &&
          rule.type_of_treatment.slice(1) !== item.type_of_treatment))
  )
}
```

### Versioned Data

**Location:** `data-ineligible-items/`

**Purpose:** Historic snapshots of ineligible items rules for audit trail and versioned validation.

**Available Versions:**

- `data-ineligible-items.v1.3.json` → `data-ineligible-items.v2.0.json`

**Usage:** When updating prohibited items:

1. Create new versioned file (e.g., `data-ineligible-items.v2.1.json`)
2. Update main `data-ineligible-items.json`
3. Document changes in git commit

**See:** [Data Files README](../src/services/data/README.md) for complete documentation.

---

## Cache System

The cache system provides in-memory storage of ineligible items data with automatic synchronization from MDM.

### Ineligible Items Cache

**Purpose:** Fast access to ineligible items without repeated S3/MDM calls.

**Configuration:**

```bash
# .env file
INELIGIBLE_ITEMS_S3_FILE_NAME=ineligible-items
INELIGIBLE_ITEMS_S3_SCHEMA=cache
INELIGIBLE_ITEMS_MAX_RETRIES=3
INELIGIBLE_ITEMS_RETRY_DELAY_MS=2000
```

| Variable                          | Description                | Default            |
| --------------------------------- | -------------------------- | ------------------ |
| `INELIGIBLE_ITEMS_S3_FILE_NAME`   | S3 file name (without ext) | `ineligible-items` |
| `INELIGIBLE_ITEMS_S3_SCHEMA`      | S3 schema/prefix           | `null`             |
| `INELIGIBLE_ITEMS_MAX_RETRIES`    | Maximum retry attempts     | `3`                |
| `INELIGIBLE_ITEMS_RETRY_DELAY_MS` | Delay between retries (ms) | `2000`             |

**Initialization:**

```javascript
import { initializeIneligibleItemsCache } from './services/cache/ineligible-items-cache.js'

// Called during server startup
await initializeIneligibleItemsCache()
```

**Access Cache:**

```javascript
import { getIneligibleItemsCache } from './services/cache/ineligible-items-cache.js'

const items = getIneligibleItemsCache()
if (items === null) {
  // Cache not initialized
} else {
  // Use cached data
  console.log(`Found ${items.length} ineligible items`)
}
```

**Features:**

- ✅ Automatic S3 fetch on startup
- ✅ Retry mechanism with exponential backoff
- ✅ Graceful degradation (server starts even if cache fails)
- ✅ CDP-compatible error messages

### MDM to S3 Synchronization

**Purpose:** Hourly sync from MDM to S3 to keep cache up-to-date.

**Configuration:**

```bash
# .env file
INELIGIBLE_ITEMS_SYNC_ENABLED=true
INELIGIBLE_ITEMS_SYNC_CRON_SCHEDULE=0 * * * *
```

| Variable                              | Description            | Default     |
| ------------------------------------- | ---------------------- | ----------- |
| `INELIGIBLE_ITEMS_SYNC_ENABLED`       | Enable/disable sync    | `true`      |
| `INELIGIBLE_ITEMS_SYNC_CRON_SCHEDULE` | Cron schedule (hourly) | `0 * * * *` |

**Sync Process:**

1. **Retrieve** latest data from MDM via `getIneligibleItems()`
2. **Write** data to S3 via `uploadJsonFileToS3()`
3. **Update** in-memory cache via `setIneligibleItemsCache()`
4. **Log** operation with success status

**Manual Sync:**

```javascript
import { syncMdmToS3 } from './services/cache/mdm-s3-sync.js'

const result = await syncMdmToS3()
if (result.success) {
  console.log(`Synced ${result.itemCount} items in ${result.duration}ms`)
}
```

**Response Format:**

```json
{
  "success": true,
  "timestamp": "2026-02-10T10:00:00.000Z",
  "duration": 1234,
  "itemCount": 150,
  "s3Location": {
    "filename": "ineligible-items",
    "schema": "cache"
  },
  "etag": "\"abc123...\""
}
```

### Sync Scheduler

**Purpose:** Automated cron-based scheduling for MDM sync.

**Usage:**

```javascript
import {
  startSyncScheduler,
  stopSyncScheduler,
  isSchedulerRunning
} from './services/cache/sync-scheduler.js'

// Start scheduler (called during server startup)
startSyncScheduler()

// Check status
if (isSchedulerRunning()) {
  console.log('Sync scheduler is active')
}

// Stop scheduler (graceful shutdown)
stopSyncScheduler()
```

**Cron Schedule Examples:**

```bash
# Every hour at minute 0
INELIGIBLE_ITEMS_SYNC_CRON_SCHEDULE='0 * * * *'

# Every 30 minutes
INELIGIBLE_ITEMS_SYNC_CRON_SCHEDULE='*/30 * * * *'

# Every day at 2:00 AM
INELIGIBLE_ITEMS_SYNC_CRON_SCHEDULE='0 2 * * *'
```

**See:** [Cache README](../src/services/cache/README.md) for complete documentation.

---

## TDS Synchronization

The TDS sync service transfers documents from AWS S3 to Azure Blob Storage (TDS container) on a scheduled basis.

### TDS Sync Service

**Purpose:** Scheduled transfer of packing list documents to TDS (Trade Data Store).

**Configuration:**

```bash
# .env file
TDS_SYNC_ENABLED=true
TDS_SYNC_CRON_SCHEDULE=0 * * * *
PACKING_LIST_SCHEMA_VERSION=v0.0
```

| Variable                      | Description                  | Default     |
| ----------------------------- | ---------------------------- | ----------- |
| `TDS_SYNC_ENABLED`            | Enable/disable TDS sync      | `true`      |
| `TDS_SYNC_CRON_SCHEDULE`      | Cron schedule (hourly)       | `0 * * * *` |
| `PACKING_LIST_SCHEMA_VERSION` | S3 schema/folder to transfer | `v0.0`      |

### File Transfer Workflow

```
1. List files in S3 schema folder (e.g., "v0.0/")
2. For each file:
   a. Download from S3
   b. Upload to TDS Blob Storage
   c. Delete from S3 (only if upload successful)
3. Return detailed results
```

**S3 File Organization:**

```
s3://your-bucket/
  └── v0.0/                   # Packing list schema version
      ├── document1.json
      ├── report.pdf
      └── data.xlsx
```

**Usage:**

```javascript
import { syncToTds } from './services/tds-sync/tds-sync.js'

// Manual sync
const result = await syncToTds()

if (result.success) {
  console.log(`Transferred ${result.successfulTransfers} files`)
  console.log(`Failed: ${result.failedTransfers}`)
}
```

**Response Format (Success):**

```json
{
  "success": true,
  "timestamp": "2026-02-10T10:00:00.000Z",
  "duration": 1234,
  "totalFiles": 5,
  "successfulTransfers": 4,
  "failedTransfers": 1,
  "transfers": {
    "successful": [
      {
        "s3Key": "v0.0/document1.json",
        "blobName": "document1.json",
        "etag": "\"0x8D9...",
        "size": 1024
      }
    ],
    "failed": [
      {
        "s3Key": "v0.0/corrupted.json",
        "error": "Failed to upload blob: Network error"
      }
    ]
  }
}
```

### TDS Sync Scheduler

**Usage:**

```javascript
import {
  startTdsSyncScheduler,
  stopTdsSyncScheduler,
  isTdsSchedulerRunning
} from './services/tds-sync/sync-scheduler.js'

// Start scheduler
startTdsSyncScheduler()

// Check status
if (isTdsSchedulerRunning()) {
  console.log('TDS scheduler is active')
}

// Stop scheduler
stopTdsSyncScheduler()
```

**Error Handling:**

- Individual file failures don't stop batch processing
- Failed files remain in S3 for retry on next sync
- Detailed error messages logged per file
- Summary response includes success/failure counts

**Monitoring:**

```
[INFO] Starting TDS synchronization scheduler (cronSchedule: "0 * * * *")
[INFO] Listing documents from S3 schema folder (schema: "v0.0")
[INFO] Found documents in S3 schema folder (schema: "v0.0", count: 3)
[INFO] Transferring file from S3 to TDS (s3Key: "v0.0/document1.json")
[INFO] File uploaded to TDS successfully (blobName: "document1.json")
[INFO] File deleted from S3 successfully (s3Key: "v0.0/document1.json")
[INFO] Successfully completed TDS synchronization (totalFiles: 3, successfulTransfers: 3)
```

**See:** [TDS Sync README](../src/services/tds-sync/README.md) for complete documentation.

---

## Testing Guidelines

### Unit Tests

Unit tests focus on individual functions and modules in isolation.

**Location:** `src/services/[module]/[file].test.js`

**Example:**

```javascript
// src/services/parsers/retailer-name/model1.test.js
import { describe, it, expect } from 'vitest'
import { parse } from './model1.js'

describe('Retailer Model 1 Parser', () => {
  it('should extract items from valid packing list', () => {
    const mockData = {
      Sheet1: [
        /* mock rows */
      ]
    }
    const result = parse(mockData)

    expect(result.items).toHaveLength(5)
    expect(result.parserModel).toBe('RETAILER1')
  })

  it('should handle missing required fields', () => {
    const mockData = { Sheet1: [] }
    const result = parse(mockData)

    expect(result.business_checks.all_required_fields_present).toBe(false)
  })
})
```

**Run Unit Tests:**

```bash
npm test                                    # All tests
npm test -- src/services/parsers/          # Parser tests
npm test -- --coverage                      # With coverage
```

### Integration Tests

Integration tests verify end-to-end parser discovery and execution.

**Location:** `test/parser-service/[retailer]/`

**Purpose:** Test the full parser discovery flow:

- File type detection
- REMOS validation
- Matcher selection
- Parser execution
- End-to-end parsing results

**Example:**

```javascript
// test/parser-service/retailer-name/model1.test.js
import { describe, it, expect } from 'vitest'
import { findParser } from '../../../src/services/parser-factory.js'

describe('Retailer Model 1 - Parser Discovery', () => {
  it('should discover and use correct parser', async () => {
    const mockFile = fs.readFileSync('./test-data/retailer1.xlsx')
    const parser = await findParser(mockFile, 'retailer1.xlsx')

    expect(parser).toBeDefined()

    const result = parser.parse(mockFile)
    expect(result.parserModel).toBe('RETAILER1')
    expect(result.items.length).toBeGreaterThan(0)
  })
})
```

**Run Integration Tests:**

```bash
npm test -- test/parser-service/           # All parser-service tests
npm test -- test/parser-service/retailer/  # Specific retailer
```

### Test Coverage

The project uses Vitest with v8 coverage reporting.

**Coverage Configuration:**

```javascript
// vitest.config.js
export default {
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: ['node_modules/', 'test/', '**/*.test.js']
    }
  }
}
```

**Run Coverage Report:**

```bash
npm test -- --coverage
```

**View HTML Report:**

```bash
open coverage/lcov-report/index.html
```

**Coverage Targets:**

- Statements: 100%
- Branches: 100%
- Functions: 100%
- Lines: 100%

**Best Practices:**

- Write tests for happy path scenarios
- Test error handling and edge cases
- Mock external dependencies (S3, Azure, Dynamics)
- Use descriptive test names
- Group related tests in `describe` blocks
- Clean up resources in `afterEach` hooks

---

## Related Documentation

- [Main README](../README.md) - Setup and getting started
- [Integration Guide](./INTEGRATION-GUIDE.md) - Service integration patterns
- [Packing List Processing](./PACKING-LIST-PROCESSING.md) - Processing workflow
- [MDM S3 Sync Implementation](./MDM-S3-SYNC-IMPLEMENTATION.md) - MDM sync details
- [Secrets Setup](../SECRETS-SETUP.md) - Environment configuration
- [Dynamics Service](./DYNAMICS-SERVICE.md) - Dynamics 365 integration
- [Dynamics Test Routes](./DYNAMICS-TEST-ROUTES.md) - API testing
- [Service Bus Proxy](./SERVICE_BUS_PROXY.md) - Message queue integration

---

## Questions or Issues?

For questions about:

- **Parser implementation**: See [Parser Models README](../src/services/parsers/README.md)
- **Data files**: See [Data Files README](../src/services/data/README.md)
- **Cache system**: See [Cache README](../src/services/cache/README.md)
- **TDS sync**: See [TDS Sync README](../src/services/tds-sync/README.md)
- **Migration from legacy**: See `.github/prompts/CODE_MIGRATION_GUIDE.prompt.md`
