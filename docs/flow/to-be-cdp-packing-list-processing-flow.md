# Packing List Processing Flow (CDP To-Be)

## High-Level Overview

This document describes the complete process for parsing packing lists from when an HTTP request is received through to completion.

## Processing Pipeline

```mermaid
flowchart TD
    Start([HTTP Request]) --> Step1[1. Request Receipt<br/>- Receive HTTP POST request<br/>- Extract application_id and packing_list_blob URI<br/>- Validate request payload]

    Step1 --> Step2[2. Blob Download<br/>- Create blob client from request URI<br/>- Download packing list file Excel/CSV/PDF<br/>- Convert to appropriate format]

    Step2 --> Step3[3. Dispatch Location Lookup<br/>- Extract establishment ID from request<br/>- Query Dynamics API for dispatch location]

    Step3 --> Step4[4. Packing List Parsing<br/>See detailed parsing flow below]

    Step4 --> CheckMatch{Parse<br/>Successful?}

    CheckMatch -->|No Match| Return200NoMatch[Return HTTP 200<br/>No match result in response body]

    CheckMatch -->|Matched| Step8[8. S3 Persistence<br/>- Write parsed data to S3<br/>- Store as JSON with application_id key<br/>- Include parser model and validation results]

    Step8 --> Step9[9. Downstream Notification<br/>- Send parsed/approval message<br/>- Include business_checks status<br/>- Include failure_reasons if present]

    Step9 --> Return200[Return HTTP 200<br/>Success response with parsed data]

    Step1 -.->|Error| Return500[Return HTTP 500<br/>Internal server error]
    Step2 -.->|Error| Return500
    Step3 -.->|Error| Return500
    Step4 -.->|Error| Return500
    Step8 -.->|Error| Return500
    Step9 -.->|Error| Return500

    Return200 --> Success([Completion - Success])
    Return200NoMatch --> NoMatch([Completion - No Match])
    Return500 --> Failed([Completion - Error])

    style Start fill:#e1f5ff
    style Success fill:#d4edda
    style NoMatch fill:#fff3cd
    style Failed fill:#f8d7da
    style CheckMatch fill:#ffeaa7
    style Return200 fill:#d4edda
    style Return200NoMatch fill:#fff3cd
    style Return500 fill:#f8d7da
```

## Detailed Parsing Flow (Steps 4-7)

```mermaid
flowchart TD
    Start([Input: Downloaded Packing List]) --> Step4[4. Input Sanitization<br/>- Remove trailing spaces and empty cells<br/>- Prepare data for parser matching]

    Step4 --> Step5[5. Parser Discovery]

    Step5 --> Step5a[5a. File Type Detection<br/>- Determine format: Excel, CSV, or PDF]

    Step5a --> Step5b[5b. REMOS Validation<br/>- Check for valid RMS-GB-XXXXXX-XXX format]

    Step5b --> CheckREMOS{REMOS<br/>Found?}

    CheckREMOS -->|No| NoMatch1[Return NOREMOS/<br/>NOREMOSCSV/NOREMOSPDF]
    CheckREMOS -->|Yes| Step5c[5c. Retailer Matcher Selection<br/>- Match establishment number patterns<br/>- Match header row patterns<br/>- Return specific parser e.g. ASDA1, TESCO2]

    Step5c --> CheckMatcher{Parser<br/>Matched?}

    CheckMatcher -->|No| NoMatch2[Return UNRECOGNISED]
    CheckMatcher -->|Yes| Step6[6. Data Extraction<br/>- Extract establishment numbers via regex<br/>- Locate header row using rowFinder<br/>- Map columns to standard fields via mapParser<br/>- Process rows to extract item details<br/>- Filter totals/summary rows]

    Step6 --> Step7[7. Data Validation & Cleanup<br/>- Remove empty items<br/>- Validate required fields<br/>- Check for single RMS establishment number<br/>- Remove bad data<br/>- Set business_checks flags<br/>- Populate failure_reasons if needed]

    Step7 --> Success([Output: Parsed Data])

    NoMatch1 --> Failed([Output: No Match])
    NoMatch2 --> Failed

    style Start fill:#e1f5ff
    style Success fill:#d4edda
    style Failed fill:#fff3cd
    style NoMatch1 fill:#fff3cd
    style NoMatch2 fill:#fff3cd
    style CheckREMOS fill:#ffeaa7
    style CheckMatcher fill:#ffeaa7
```

## Detailed Stage Descriptions

### 1. Request Receipt

The service receives an HTTP POST request containing the packing list processing request. Each request contains:

- `application_id`: Unique identifier for the export application
- `packing_list_blob`: Blob Storage URI pointing to the uploaded packing list file
- `SupplyChainConsignment.DispatchLocation.IDCOMS.EstablishmentId`: Establishment identifier

The request payload is validated before processing begins.

**Entry Point:** `src/routes/packing-list-process.js` - HTTP route handler

### 2. Blob Download

Using the blob URI from the request, the service:

- Creates a Blob Storage client
- Downloads the packing list file (Excel, CSV, or PDF format)
- Converts Excel/CSV files to JSON format using appropriate utilities
- Keeps PDF files as Buffer objects for processing

**Implementation:**

- `src/services/blob-storage/ehco-blob-storage-service.js` - `downloadBlobFromApplicationFormsContainerAsJson()`
- `src/services/blob-storage/blob-storage-service.js` - `createBlobStorageService()`
- Excel to JSON conversion utilities
- CSV to JSON conversion utilities

### 3. Dispatch Location Lookup

The establishment ID from the request is used to query the Dynamics API to retrieve the dispatch location number. This information is required for the final packing list record.

**Implementation:** `src/services/dynamics-service.js` - `getDispatchLocation()`

### 4-7. Packing List Parsing

The parsing process (steps 4-7) is detailed in the separate diagram above. This encompasses input sanitization, parser discovery, data extraction, and validation. See individual subsections below for details.

### 4. Input Sanitization

For Excel and CSV files, the data is sanitized to:

- Remove trailing whitespace from cell values
- Filter out empty cells and rows
- Ensure consistent data structure for parser matching

PDF files pass through unchanged as they require different processing.

**Implementation:**

- `src/services/parser-service.js` - `sanitizeInput()`
- JSON sanitization utilities

### 5. Parser Discovery

#### 5a. File Type Detection

The file extension determines the initial parser category:

- `.xlsx`, `.xls` → Excel parsers
- `.csv` → CSV parsers
- `.pdf` → PDF parsers (AI or non-AI)

**Implementation:** `src/services/parsers/parser-factory.js` - `findParser()`

#### 5b. REMOS Validation

Before attempting retailer-specific matching, the document is scanned for valid REMOS (RMS establishment numbers) in the format `RMS-GB-XXXXXX-XXX`. If no valid REMOS is found, the parser returns:

- `NOREMOS` (Excel)
- `NOREMOSCSV` (CSV)
- `NOREMOSPDF` (PDF)

**Implementation:**

- `src/services/parsers/no-match/` - REMOS validator parsers
- Regex pattern: `/^RMS-GB-\d{6}-\d{3}$/i`

#### 5c. Retailer Matcher Selection

Using the establishment number and header patterns, the service identifies the specific retailer format:

1. Extract establishment number using regex patterns
2. Match against known retailer establishment number patterns (e.g., ASDA, Tesco, Co-op)
3. Validate header row structure matches expected format for that retailer
4. Return the matched parser (e.g., `ASDA1`, `TESCO2`, `COOP1`)

If no match is found, returns `UNRECOGNISED`.

**Implementation:**

- `src/services/parsers/parsers.js` - `getExcelParser()`, `getCsvParser()`, `getPdfNonAiParser()`
- `src/services/model-headers.js` - Retailer header definitions
- `src/services/matchers/` - Retailer-specific matchers

### 6. Data Extraction

Once the correct parser is identified, it extracts structured data from the packing list:

1. Extract all establishment numbers from the document
2. Locate the header row using `rowFinder` utilities
3. Map column positions to standard field names using `mapParser()`
4. Iterate through data rows and extract item information
5. Filter out totals and summary rows
6. Extract standard fields for each item:
   - `description`: Product description
   - `commodity_code`: Harmonized System code
   - `number_of_packages`: Package count
   - `total_net_weight_kg`: Net weight in kilograms
   - `country_of_origin`: Origin country code
   - `row_location`: Source row reference

**Implementation:**

- `src/services/parsers/[retailer]/` - Retailer-specific parser implementations
- `src/services/parser-map.js` - Column mapping utility
- `src/utilities/row-finder.js` - Header row detection

### 7. Data Validation & Cleanup

The extracted data undergoes validation and cleanup:

**Cleanup:**

- Remove items with all null/undefined values
- Filter items with invalid or missing critical data

**Validation:**

- Check all required fields are present
- Verify single RMS establishment number
- Validate data formats (weights, codes, etc.)
- Set `business_checks.all_required_fields_present` flag
- Populate `business_checks.failure_reasons` array with any issues

**Implementation:**

- `src/services/parsers/parser-factory.js` - `generateParsedPackingList()`
- `src/services/validators/packing-list-column-validator.js` - Field validation
- `src/services/validators/packing-list-validator-utilities.js` - Cleanup utilities

---

## Main Flow Continuation

### 8. S3 Persistence

If a parser successfully matched and extracted data from the document, the parsed data is saved to S3:

- Write parsed data as JSON to S3 bucket
- Use `application_id` as the object key (or part of the key structure)
- Include all extracted items in the JSON structure
- Store parser model, dispatch location, and validation results
- Add metadata including timestamps and processing information

**Implementation:**

- `src/services/s3-service.js` - S3 write operations
- JSON structure includes: `application_id`, `items[]`, `parser_model`, `dispatch_location`, `business_checks`, `timestamps`

### 9. Downstream Notification

For successfully matched and extracted documents, the service sends a message to downstream services:

- Message includes `application_id` and parsed data details
- Includes approval status based on business checks
- Includes `failure_reasons` if validation issues were found
- Enables downstream approval workflow to proceed

Note: No notification is sent when parser result is NOREMOS, NOREMOSCSV, NOREMOSPDF, UNRECOGNISED, or NOMATCH.

**Implementation:** `src/services/trade-service-bus-service.js` - `sendMessageToQueue()`

### 10. HTTP Response

The process completes by returning an appropriate HTTP response:

**Success - Matched Parser (HTTP 200):**

- Parsed data has been processed and stored
- Response body includes:
  - `result`: "success"
  - `data.approvalStatus`
  - `data.reasonsForFailure`
  - `data.parserModel` (e.g., "ASDA1", "TESCO2")

**Success - No Match (HTTP 200):**

- Parser could not match the document format, but processing completed
- Response body includes:
  - `result`: "success"
  - `data.parserModel`: (NOREMOS, NOREMOSCSV, NOREMOSPDF, UNRECOGNISED, NOMATCH)
  - No data persisted to S3
  - No downstream notification sent

**Error (HTTP 500):**

- An exception occurred during processing
- Response body includes:
  - `result`: "failure"
  - `error`: Error message
- Error is logged with context for investigation

**Implementation:** `src/routes/packing-list-process.js` - Response handling

## Parser Result Types

All successful parsing operations return HTTP 200 OK with the parser result in the response body. Only exceptions during processing return HTTP 500.

| Result Type      | Description                                             | HTTP Status               | Action Taken                                     |
| ---------------- | ------------------------------------------------------- | ------------------------- | ------------------------------------------------ |
| **MATCHED**      | Retailer format identified, data extracted successfully | 200 OK                    | Persist to S3, send notification, return success |
| **NOREMOS**      | No valid RMS establishment number found in Excel file   | 200 OK                    | No persistence, no notification, return result   |
| **NOREMOSCSV**   | No valid RMS establishment number found in CSV file     | 200 OK                    | No persistence, no notification, return result   |
| **NOREMOSPDF**   | No valid RMS establishment number found in PDF file     | 200 OK                    | No persistence, no notification, return result   |
| **UNRECOGNISED** | File format not supported or header structure unknown   | 200 OK                    | No persistence, no notification, return result   |
| **NOMATCH**      | Generic catch-all for unmatched documents               | 200 OK                    | No persistence, no notification, return result   |
| **ERROR**        | Processing exception occurred                           | 500 Internal Server Error | No persistence, no notification, return error    |

## Error Handling Strategy

The service implements a robust error handling approach:

1. **Request Validation**: Validate request payload before processing begins
2. **Comprehensive Logging**: All errors logged with module name, function name, and context
3. **Graceful Degradation**: Parsers return `NOMATCH` rather than throwing exceptions
4. **HTTP Status Codes**: Appropriate status codes returned for different failure scenarios
5. **Error Details**: Response bodies include helpful error information for clients
6. **Isolation**: Errors in one stage don't cascade to others

## Key Implementation Files

| Component                       | File Path                                                |
| ------------------------------- | -------------------------------------------------------- |
| HTTP Route                      | `src/routes/packing-list-process.js`                     |
| Processing Service              | `src/services/packing-list-process-service.js`           |
| Parser Service                  | `src/services/parser-service.js`                         |
| Parser Factory                  | `src/services/parsers/parser-factory.js`                 |
| Parser Selection                | `src/services/parsers/parsers.js`                        |
| Model Headers                   | `src/services/model-headers.js`                          |
| Parser Mapping                  | `src/services/parser-map.js`                             |
| Matchers                        | `src/services/matchers/`                                 |
| Parsers                         | `src/services/parsers/`                                  |
| Validators                      | `src/services/validators/`                               |
| Blob Storage Service            | `src/services/blob-storage/ehco-blob-storage-service.js` |
| TDS Blob Storage Service        | `src/services/blob-storage/tds-blob-storage-service.js`  |
| S3 Service                      | `src/services/s3-service.js`                             |
| Dynamics Service                | `src/services/dynamics-service.js`                       |
| Service Bus Service             | `src/services/trade-service-bus-service.js`              |
| Ineligible Items Cache          | `src/services/cache/ineligible-items-cache.js`           |
| Ineligible Items MDM to S3 Sync | `src/services/cache/ineligible-items-mdm-s3-sync.js`     |
| Cache Sync Scheduler            | `src/services/cache/sync-scheduler.js`                   |
| TDS Sync Service                | `src/services/tds-sync/tds-sync.js`                      |
| TDS Sync Scheduler              | `src/services/tds-sync/sync-scheduler.js`                |
| Server Startup                  | `src/common/helpers/start-server.js`                     |

## HTTP API Contract

### Request

```http
POST /process-packing-list
Content-Type: application/json

{
  "application_id": "string",
  "packing_list_blob": "https://storage.../blob-uri",
  "SupplyChainConsignment": {
    "DispatchLocation": {
      "IDCOMS": {
        "EstablishmentId": "string"
      }
    }
  }
}
```

### Response - Success with Match (200 OK)

```json
{
  "result": "success",
  "data": {
    "approvalStatus": "approved",
    "reasonsForFailure": [],
    "parserModel": "ASDA1"
  }
}
```

### Response - Success with No Match (200 OK)

```json
{
  "result": "success",
  "data": {
    "approvalStatus": "conditional",
    "reasonsForFailure": ["No valid RMS establishment number found"],
    "parserModel": "NOREMOS"
  }
}
```

### Response - Error (500 Internal Server Error)

```json
{
  "result": "failure",
  "error": "Failed to download blob from storage"
}
```

## Supported Retailers

The service currently supports parsers for the following retailers (see `src/services/matchers/` and `src/services/parsers/` for complete list):

- ASDA
- Boots
- Booker
- Buffalo-ad Logistics
- CDS
- Co-op
- Davenport
- Fowler Welch
- Giovanni
- Greggs
- Iceland
- Kepak
- Marks & Spencer
- Mars
- Nisa
- Nutricia
- Sainsbury's
- Savers
- Tesco
- TJ Morris
- Turners
- Warrens
- B&M (BANDM)

Each retailer may have multiple format variants (e.g., ASDA1, ASDA2) to handle different packing list templates.

## Testing

For information on testing the packing list processing flow, see:

- Unit tests: `test/unit/services/`
- Integration tests: `test/integration/`
- API tests: Test HTTP endpoints with various request payloads

### Testing Sync Services

**MDM to S3 Sync:**

- Unit tests: `src/services/cache/ineligible-items-mdm-s3-sync.test.js`
- Scheduler tests: `src/services/cache/sync-scheduler.test.js`
- Manual trigger: Call `syncMdmToS3()` function directly

**TDS Sync:**

- Unit tests: `src/services/tds-sync/tds-sync.test.js`
- Scheduler tests: `src/services/tds-sync/sync-scheduler.test.js`
- Manual trigger: Call `syncToTds()` function directly
- Monitor logs for scheduled sync operations

## Background Synchronization Services

The application runs two scheduled synchronization services that operate independently of the main packing list processing flow:

### MDM to S3 Synchronization

**Purpose:** Keep ineligible items cache up-to-date with Master Data Management (MDM)

**Schedule:** Hourly (configurable via `INELIGIBLE_ITEMS_SYNC_CRON_SCHEDULE`, default: `0 * * * *`)

**Process Flow:**

1. Retrieve latest ineligible items data from MDM API
2. Write data to S3 bucket (configurable schema/filename)
3. Update in-memory cache with fresh data
4. Log operation results

**Configuration:**

- `INELIGIBLE_ITEMS_SYNC_ENABLED` - Enable/disable sync (default: `true`)
- `INELIGIBLE_ITEMS_SYNC_CRON_SCHEDULE` - Cron schedule (default: hourly)
- `MDM_INTEGRATION_ENABLED` - Feature flag for MDM integration

**Implementation:** `src/services/cache/mdm-s3-sync.js`, `src/services/cache/sync-scheduler.js`

**Error Handling:** Failures are logged but do not affect service operation. Existing S3 data and cache remain unchanged on errors.

### TDS Synchronization

**Purpose:** Transfer parsed packing list documents from S3 to Azure Blob Storage (TDS container)

**Schedule:** Hourly (configurable via `TDS_SYNC_CRON_SCHEDULE`, default: `0 * * * *`)

**Process Flow:**

1. List all files in S3 schema folder (e.g., `v0.0/`)
2. For each file:
   - Download from S3
   - Upload to TDS Blob Storage
   - Delete from S3 (only if upload successful)
3. Return detailed results with success/failure counts

**Configuration:**

- `TDS_SYNC_ENABLED` - Enable/disable sync (default: `true`)
- `TDS_SYNC_CRON_SCHEDULE` - Cron schedule (default: hourly)
- `PACKING_LIST_SCHEMA_VERSION` - S3 folder to monitor (default: `v0.0`)

**Implementation:** `src/services/tds-sync/tds-sync.js`, `src/services/tds-sync/sync-scheduler.js`

**Error Handling:** Individual file failures don't stop batch processing. Failed files remain in S3 for retry on next sync. Detailed error logging per file.

**Startup Integration:** Both schedulers are started automatically in `src/common/helpers/start-server.js`

## Related Documentation

- [TDS Sync README](../src/services/tds-sync/README.md) - Complete TDS synchronization documentation
- [Cache README](../src/services/cache/README.md) - Ineligible items cache and MDM sync documentation
- [Ineligible Items Cache](../INELIGIBLE-ITEMS-CACHE.md) - Cache setup and troubleshooting guide
- [MDM S3 Sync Implementation](../MDM-S3-SYNC-IMPLEMENTATION.md) - MDM synchronization details
- [Developer Guide](../DEVELOPER-GUIDE.md) - Complete developer documentation

## Migration Notes

### Key Differences from Azure Service Bus Version

1. **Trigger Mechanism**: HTTP request instead of Service Bus message
2. **Message Acknowledgment**: Not needed - HTTP responses provide feedback
3. **Error Handling**: HTTP status codes instead of message abandonment/retry
4. **Persistence**: S3 instead of database (PostgreSQL/Sequelize)
5. **Response Model**: Synchronous HTTP response instead of fire-and-forget
6. **Retry Logic**: Client-side retry instead of Service Bus automatic retry

### Components to Migrate

- ✅ Parser logic (can be reused as-is)
- ✅ Matcher logic (can be reused as-is)
- ✅ Validator logic (can be reused as-is)
- ✅ Blob storage client (adapt for new service)
- ✅ Dynamics service integration (can be reused)
- ⚠️ Persistence layer (replace database with S3)
- ⚠️ Service Bus notification (keep but add HTTP response)
- ❌ Message handling infrastructure (not needed)
- ❌ Database models (not needed with S3)

### New Components

- ✅ **MDM to S3 Sync**: Hourly synchronization of ineligible items from MDM
- ✅ **TDS Sync**: Hourly transfer of parsed documents from S3 to Azure Blob Storage
- ✅ **Ineligible Items Cache**: In-memory cache loaded on startup with retry logic
- ✅ **Sync Schedulers**: Cron-based scheduling for automated data synchronization
- ✅ **Server Startup Integration**: Automated initialization of caches and schedulers

### Implementation Priorities

1. **Phase 1**: HTTP endpoint and request handling
2. **Phase 2**: Migrate parser/matcher/validator logic
3. **Phase 3**: Implement S3 persistence
4. **Phase 4**: Integrate with existing downstream notifications
5. **Phase 5**: Add comprehensive error handling and logging
