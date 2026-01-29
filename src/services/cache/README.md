# Ineligible Items Cache

## Overview

The ineligible items cache service provides in-memory caching of ineligible items data fetched from S3 on application startup. This feature improves performance by avoiding repeated S3 calls and ensures the latest ineligible items data is available throughout the application lifecycle.

## Features

- **Automatic S3 Fetch on Startup**: Fetches ineligible items data from S3 when the application starts
- **Retry Mechanism**: Configurable retry logic with exponential backoff for resilient S3 connections
- **In-Memory Storage**: Fast access to ineligible items data without network calls
- **Error Handling**: Comprehensive error logging with CDP-compatible error messages

## Configuration

The cache is configured through environment variables:

### Environment Variables

| Variable                          | Description                                                | Default            | Required |
| --------------------------------- | ---------------------------------------------------------- | ------------------ | -------- |
| `INELIGIBLE_ITEMS_S3_FILE_NAME`   | S3 file name for ineligible items data (without extension) | `ineligible-items` | No       |
| `INELIGIBLE_ITEMS_S3_SCHEMA`      | S3 schema/prefix for ineligible items file                 | `null`             | No       |
| `INELIGIBLE_ITEMS_MAX_RETRIES`    | Maximum number of retry attempts                           | `3`                | No       |
| `INELIGIBLE_ITEMS_RETRY_DELAY_MS` | Delay in milliseconds between retry attempts               | `2000`             | No       |

### Configuration Example

```bash
# .env file
INELIGIBLE_ITEMS_S3_FILE_NAME=ineligible-items
INELIGIBLE_ITEMS_S3_SCHEMA=cache
INELIGIBLE_ITEMS_MAX_RETRIES=3
INELIGIBLE_ITEMS_RETRY_DELAY_MS=2000
```

## Usage

### Initialization

The cache is automatically initialized when the server starts. See [start-server.js](../common/helpers/start-server.js):

```javascript
import { initializeIneligibleItemsCache } from '../../services/cache/ineligible-items-cache.js'

// Called during server startup
await initializeIneligibleItemsCache()
```

### Accessing Cached Data

```javascript
import { getIneligibleItemsCache } from './services/cache/ineligible-items-cache.js'

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
} from './services/cache/ineligible-items-cache.js'

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

- Cache initialization happens in [start-server.js](../common/helpers/start-server.js)
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

- [ineligible-items-cache.js](./ineligible-items-cache.js) - Main cache service
- [ineligible-items-cache.test.js](./ineligible-items-cache.test.js) - Test suite
- [mdm-s3-sync.js](./mdm-s3-sync.js) - MDM to S3 synchronization service
- [mdm-s3-sync.test.js](./mdm-s3-sync.test.js) - Sync test suite
- [sync-scheduler.js](./sync-scheduler.js) - Hourly sync scheduler
- [sync-scheduler.test.js](./sync-scheduler.test.js) - Scheduler test suite
- [start-server.js](../common/helpers/start-server.js) - Server startup integration
- [config.js](../../config.js) - Configuration definitions
- [s3-service.js](../s3-service.js) - S3 interaction utilities

## MDM to S3 Synchronization

### Overview

The system includes automated hourly synchronization from MDM (Master Data Management) to S3. This ensures the ineligible items cache stays up-to-date with the latest master data.

### Configuration

```bash
# .env file
INELIGIBLE_ITEMS_SYNC_ENABLED=true
INELIGIBLE_ITEMS_SYNC_CRON_SCHEDULE=0 * * * *
```

| Variable                              | Description                              | Default     | Required |
| ------------------------------------- | ---------------------------------------- | ----------- | -------- |
| `INELIGIBLE_ITEMS_SYNC_ENABLED`       | Enable/disable hourly MDM to S3 sync     | `true`      | No       |
| `INELIGIBLE_ITEMS_SYNC_CRON_SCHEDULE` | Cron schedule for sync (default: hourly) | `0 * * * *` | No       |

### Sync Process

1. **Retrieve** latest data from MDM via `getIneligibleItems()`
2. **Write** data to S3 via `uploadJsonFileToS3()`
3. **Update** in-memory cache with fresh data via `setIneligibleItemsCache(mdmData)`
4. **Log** operation with success status and timestamp

### Usage

The sync scheduler starts automatically when the server starts:

```javascript
import { startSyncScheduler } from './services/cache/sync-scheduler.js'

// Started during server initialization
startSyncScheduler()
```

### Manual Sync

You can trigger a manual sync programmatically:

```javascript
import { syncMdmToS3 } from './services/cache/mdm-s3-sync.js'

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
[INFO] Invalidating in-memory cache
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
npx vitest run src/services/cache/mdm-s3-sync.test.js
npx vitest run src/services/cache/sync-scheduler.test.js
```
