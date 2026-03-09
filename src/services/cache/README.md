# Cache Services

## Overview

This directory contains in-memory cache services for reference data used by the packing list parser. When `MDM_INTEGRATION_ENABLED=true`, each cache is loaded from S3 on server startup and kept up-to-date by an hourly MDM synchronization scheduler.

### Caches

- **Ineligible Items Cache** (`ineligible-items-cache.js`) — Prohibited/restricted items used by the packing list validator
- **ISO Codes Cache** (`iso-codes-cache.js`) — Country ISO codes used for country-of-origin validation

Both caches follow the same pattern: S3 initialization on startup with retry logic, hourly MDM-to-S3 sync via `sync-scheduler.js`, and fallback to static JSON data if unavailable.

For detailed documentation see:

- [docs/INELIGIBLE-ITEMS-CACHE.md](../../../docs/INELIGIBLE-ITEMS-CACHE.md)
- [docs/ISO-CODES-CACHE.md](../../../docs/ISO-CODES-CACHE.md)

## Features

- **Automatic S3 Fetch on Startup**: Fetches cache data from S3 when the application starts
- **Retry Mechanism**: Configurable retry logic for resilient S3 connections
- **In-Memory Storage**: Fast access to reference data without repeated network calls
- **Hourly MDM Sync**: Cache is kept current via a scheduled MDM-to-S3 synchronisation
- **Error Handling**: Comprehensive error logging with CDP-compatible error messages

## Configuration

The cache is configured through environment variables:

### Environment Variables

| Variable                          | Description                                                | Default            | Required |
| --------------------------------- | ---------------------------------------------------------- | ------------------ | -------- |
| `MDM_INTEGRATION_ENABLED`         | Enable/disable MDM integration, caching, and sync          | `true`             | No       |
| `INELIGIBLE_ITEMS_S3_FILE_NAME`   | S3 file name for ineligible items data (without extension) | `ineligible-items` | No       |
| `CACHE_S3_SCHEMA`                 | S3 schema/prefix shared by all cache files                 | `cache`            | No       |
| `INELIGIBLE_ITEMS_MAX_RETRIES`    | Maximum number of retry attempts                           | `3`                | No       |
| `INELIGIBLE_ITEMS_RETRY_DELAY_MS` | Delay in milliseconds between retry attempts               | `2000`             | No       |
| `ISO_CODES_S3_FILE_NAME`          | S3 file name for ISO codes data (without extension)        | `iso-codes`        | No       |
| `ISO_CODES_MAX_RETRIES`           | Maximum number of retry attempts for ISO codes             | `3`                | No       |
| `ISO_CODES_RETRY_DELAY_MS`        | Delay in milliseconds between ISO codes retry attempts     | `2000`             | No       |

### Configuration Example

```bash
# .env file
MDM_INTEGRATION_ENABLED=true
INELIGIBLE_ITEMS_S3_FILE_NAME=ineligible-items
CACHE_S3_SCHEMA=cache
INELIGIBLE_ITEMS_MAX_RETRIES=3
INELIGIBLE_ITEMS_RETRY_DELAY_MS=2000
ISO_CODES_S3_FILE_NAME=iso-codes
INELIGIBLE_ITEMS_SYNC_CRON_SCHEDULE=0 * * * *
ISO_CODES_SYNC_CRON_SCHEDULE=0 * * * *
```

## Usage

### Initialization

The cache is automatically initialized when the server starts. See [start-server.js](../../common/helpers/start-server.js):

```javascript
import { initializeIneligibleItemsCache } from '../../services/cache/ineligible-items-cache.js'

// Called during server startup
await initializeIneligibleItemsCache()
```

### Accessing Cached Data

```javascript
import { getIneligibleItemsCache } from './ineligible-items-cache.js'

// Get cached ineligible items
const items = getIneligibleItemsCache()

if (items === null) {
  // Cache not initialized or failed to load
  console.log('Cache not available')
} else {
  // Use cached data
  console.log(`Found ${items.length} ineligible items`)
}
```

### Manual Cache Management (for testing)

```javascript
import {
  setIneligibleItemsCache,
  clearIneligibleItemsCache
} from './ineligible-items-cache.js'

// Manually set cache (useful in tests)
setIneligibleItemsCache([{ country_of_origin: 'CN', commodity_code: '0207' }])

// Clear cache
clearIneligibleItemsCache()
```

## Acceptance Criteria

### AC1 - Fetch latest ineligible items list from S3 ✅

- **Given**: PLP is hosted on CDP
- **When**: PLP application is started or re-started
- **Then**:
  - Ineligible items list data is read from the S3 bucket
  - Data is stored in the in-memory cache

**Implementation**:

- Cache initialization happens in [start-server.js](../../common/helpers/start-server.js)
- Data is fetched from S3 using `getFileFromS3()` function
- Data is stored in module-level variable `ineligibleItemsCache`

### AC2 - Re-try mechanism when error occurs ✅

- **Given**: PLP is hosted on CDP
- **When**: PLP application is started or re-started
- **And**: PLP is unable to read the ineligible items list data from the S3 bucket
- **Then**: PLP will retry a configurable number of times (with a configurable wait between times)

**Implementation**:

- Configurable via `INELIGIBLE_ITEMS_MAX_RETRIES` (default: 3 retries)
- Configurable delay via `INELIGIBLE_ITEMS_RETRY_DELAY_MS` (default: 2000ms)
- Retry logic in `initializeIneligibleItemsCache()` function

### AC3 - Error Messaging when PLP unable to read the ineligible items list data ✅

- **Given**: PLP is hosted on CDP
- **When**: PLP application is started or re-started
- **And**: PLP is unable to read the ineligible items list data from the S3 bucket after the re-trys
- **Then**:
  - PLP will write an error message to the logs: "Unable to load ineligible items data"
  - This will be picked up by CDP error messaging

**Implementation**:

- Error logged via `logger.error()` with message: "Unable to load ineligible items data"
- Error includes attempt count, S3 file details, and error message
- Server continues to start even if cache initialization fails (graceful degradation)

## Error Handling

The cache service implements robust error handling:

1. **Retry Logic**: Automatically retries failed S3 fetches up to the configured maximum
2. **Error Logging**: All errors are logged with structured context for CDP monitoring
3. **Graceful Degradation**: Server starts even if cache initialization fails
4. **Warning Logs**: Each failed attempt is logged as a warning before retrying

### Log Messages

**Success**:

```
[INFO] Attempting to fetch ineligible items from S3 (attempt 1/4)
[INFO] Successfully loaded ineligible items data into cache (itemCount: 150)
```

**Retry**:

```
[WARN] Failed to fetch ineligible items from S3 (attempt: 1, willRetry: true)
```

**Failure**:

```
[ERROR] Unable to load ineligible items data (attempts: 4, error: "S3 connection failed")
```

## S3 File Format

The S3 file should contain a JSON array of ineligible items:

```json
[
  {
    "country_of_origin": "CN",
    "commodity_code": "0207",
    "type_of_treatment": null
  },
  {
    "country_of_origin": "BR",
    "commodity_code": "0602",
    "type_of_treatment": "Chilled"
  }
]
```

## Testing

Run tests with:

```bash
npx vitest run src/services/cache/ineligible-items-cache.test.js
```

The test suite covers:

- Successful S3 fetch and cache initialization
- Retry logic with multiple failure scenarios
- JSON parsing errors
- Configuration handling
- Cache getter/setter functions
- Error scenarios and edge cases

## Architecture

```
┌─────────────────┐
│  Application    │
│   Startup       │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ start-server.js │
└────────┬────────┘
         │
         v
┌─────────────────────────────┐
│ initializeIneligibleItems   │
│         Cache()              │
└────────┬────────────────────┘
         │
         │ (retry loop)
         v
┌─────────────────┐
│ getFileFromS3() │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ In-Memory Cache │
│  (module var)   │
└─────────────────┘
```

## Related Files

- [cache-common.js](./cache-common.js) - Shared S3 fetch and retry utilities used by both caches
- [cache-common.test.js](./cache-common.test.js) - Shared utilities test suite
- [ineligible-items-cache.js](./ineligible-items-cache.js) - Ineligible items cache service
- [ineligible-items-cache.test.js](./ineligible-items-cache.test.js) - Ineligible items cache test suite
- [ineligible-items-mdm-s3-sync.js](./ineligible-items-mdm-s3-sync.js) - Ineligible items MDM to S3 synchronization service
- [ineligible-items-mdm-s3-sync.test.js](./ineligible-items-mdm-s3-sync.test.js) - Sync test suite
- [iso-codes-cache.js](./iso-codes-cache.js) - ISO codes cache service
- [iso-codes-cache.test.js](./iso-codes-cache.test.js) - ISO codes cache test suite
- [iso-codes-mdm-s3-sync.js](./iso-codes-mdm-s3-sync.js) - ISO codes MDM to S3 synchronization service
- [iso-codes-mdm-s3-sync.test.js](./iso-codes-mdm-s3-sync.test.js) - ISO codes sync test suite
- [sync-scheduler.js](./sync-scheduler.js) - Hourly sync scheduler (manages both ineligible items and ISO codes)
- [sync-scheduler.test.js](./sync-scheduler.test.js) - Scheduler test suite
- [start-server.js](../../common/helpers/start-server.js) - Server startup integration
- [config.js](../../config.js) - Configuration definitions
- [s3-service.js](../s3-service.js) - S3 interaction utilities

## MDM to S3 Synchronization

### Overview

The system includes automated hourly synchronization from MDM (Master Data Management) to S3. This keeps both ineligible items and ISO codes caches up-to-date with the latest master data.

### Configuration

```bash
# .env file
MDM_INTEGRATION_ENABLED=true              # controls both caches and both sync schedulers
INELIGIBLE_ITEMS_SYNC_CRON_SCHEDULE=0 * * * *
ISO_CODES_SYNC_CRON_SCHEDULE=0 * * * *
```

| Variable                              | Description                                               | Default     | Required |
| ------------------------------------- | --------------------------------------------------------- | ----------- | -------- |
| `MDM_INTEGRATION_ENABLED`             | Enable/disable all MDM sync and cache initialization      | `true`      | No       |
| `INELIGIBLE_ITEMS_SYNC_CRON_SCHEDULE` | Cron schedule for ineligible items sync (default: hourly) | `0 * * * *` | No       |
| `ISO_CODES_SYNC_CRON_SCHEDULE`        | Cron schedule for ISO codes sync (default: hourly)        | `0 * * * *` | No       |

### Sync Process

1. **Retrieve** latest data from MDM (ineligible items and ISO codes)
2. **Write** data to S3 via `uploadJsonFileToS3()`
3. **Update** in-memory caches with fresh data (`setIneligibleItemsCache()` / `setIsoCodesCache()`)
4. **Log** operation with success status and timestamp

### Usage

The sync scheduler starts automatically when the server starts:

```javascript
import { startSyncScheduler } from './sync-scheduler.js'

// Started during server initialization
startSyncScheduler()
```

### Manual Sync

You can trigger a manual sync programmatically:

```javascript
import { syncMdmToS3 } from './ineligible-items-mdm-s3-sync.js'

// Trigger manual sync
const result = await syncMdmToS3()

if (result.success) {
  console.log(`Synced ${result.itemCount} items`)
  console.log(`Duration: ${result.duration}ms`)
} else {
  console.error(`Sync failed: ${result.error}`)
}
```

### Monitoring

Check logs for sync operations:

```
[INFO] Starting MDM to S3 synchronization
[INFO] Retrieving ineligible items from MDM
[INFO] Writing ineligible items to S3
[INFO] Updating in-memory cache with fresh data
[INFO] Successfully completed MDM to S3 synchronization {
  success: true,
  timestamp: "2026-01-29T10:00:00.123Z",
  duration: 1234,
  itemCount: 150,
  s3Location: { filename: "ineligible-items", schema: "cache" },
  etag: "..."
}
```

### Testing

Run sync tests:

```bash
npx vitest run src/services/cache/ineligible-items-mdm-s3-sync.test.js
npx vitest run src/services/cache/sync-scheduler.test.js
```
