# ISO Codes Cache

This document explains how to work with the ISO codes cache, which loads country ISO code data from S3 (or LocalStack) during server startup and synchronizes with MDM on an hourly schedule.

## Overview

The ISO codes cache is loaded on server startup from S3 and stored in memory. This provides fast access to the ISO codes data without repeated S3 calls during request processing.

The system also supports automated hourly synchronization from MDM to S3, ensuring the cache stays up-to-date with the latest country ISO code data.

## Configuration Values

The following environment variables control the ISO codes cache behavior:

| Variable                   | Description                                | Default     | Example                 |
| -------------------------- | ------------------------------------------ | ----------- | ----------------------- |
| `MDM_INTEGRATION_ENABLED`  | Enable/disable MDM integration and caching | `true`      | `true` or `false`       |
| `ISO_CODES_S3_FILE_NAME`   | S3 file name (without extension)           | `iso-codes` | `iso-codes`             |
| `ISO_CODES_S3_SCHEMA`      | S3 schema/prefix for the file              | `cache`     | `cache`                 |
| `ISO_CODES_MAX_RETRIES`    | Max retry attempts on S3 failure           | `3`         | `3`                     |
| `ISO_CODES_RETRY_DELAY_MS` | Delay between retries (ms)                 | `2000`      | `2000`                  |
| `AWS_ENDPOINT_URL`         | AWS S3 endpoint (LocalStack for local dev) | `null`      | `http://localhost:4566` |
| `AWS_S3_BUCKET`            | S3 bucket name                             | -           | `my-bucket`             |
| `AWS_REGION`               | AWS region                                 | `eu-west-2` | `eu-west-2`             |
| `AWS_ACCESS_KEY_ID`        | AWS access key (use `test` for LocalStack) | -           | `test`                  |
| `AWS_SECRET_ACCESS_KEY`    | AWS secret key (use `test` for LocalStack) | -           | `test`                  |

### MDM to S3 Synchronization Configuration

| Variable                           | Description                              | Default     | Example          |
| ---------------------------------- | ---------------------------------------- | ----------- | ---------------- |
| `ISO_CODES_SYNC_CRON_SCHEDULE`     | Cron schedule for sync (default: hourly) | `0 * * * *` | `0 * * * *`      |
| `AZURE_MDM_GET_ISO_CODES_ENDPOINT` | Azure APIM endpoint for ISO codes        | -           | `/api/iso-codes` |

The cron schedule format is: `minute hour day month weekday`

- Default `0 * * * *` runs at the start of every hour
- Example `*/30 * * * *` runs every 30 minutes
- Example `0 0 * * *` runs daily at midnight

## MDM Integration Feature Flag

The `MDM_INTEGRATION_ENABLED` flag controls whether the system integrates with MDM for ISO codes data and whether the cache is initialized.

**When enabled (`true`)**:

- Cache is initialized from S3 on startup
- MDM synchronization runs on schedule
- Latest ISO codes data is retrieved from MDM
- S3 bucket is updated with fresh data
- Cache is updated after sync

**When disabled (`false`)**:

- MDM synchronization is skipped
- S3 bucket is not updated
- Log entry confirms MDM sync is disabled
- Service continues to use existing S3 data or falls back to static JSON file

This is useful for:

- Testing with static data
- Troubleshooting MDM connectivity issues
- Disabling external dependencies in development
- Emergency fallback scenarios

```env
# Disable MDM integration
MDM_INTEGRATION_ENABLED=false
```

## MDM to S3 Hourly Synchronization

The service includes an automated synchronization process that:

1. **Retrieves** the latest ISO codes data from MDM
2. **Writes** the data to the configured S3 bucket
3. **Updates** the in-memory cache with the fresh data
4. **Logs** the operation with success status and timestamp

### How It Works

- The sync scheduler starts automatically when the server starts (if enabled)
- Runs on the configured cron schedule (default: hourly at minute 0)
- Operates independently of the cache initialization
- Updates the cache immediately with fresh data (no S3 read required)
- Logs all operations for monitoring and troubleshooting
- Handles errors gracefully without affecting the running service

### Sync Process Flow

```
MDM Service → Retrieve ISO Codes → Write to S3 → Update Cache → Cache Contains Fresh Data
```

## Cache Initialization

The cache is automatically initialized when the server starts. The initialization process:

1. **Attempts to fetch** ISO codes from S3
2. **Implements retry logic** with configurable retry count and delay
3. **Falls back to MDM** if S3 file doesn't exist or is empty
4. **Uploads to S3** after successful MDM fetch
5. **Continues server startup** even if cache initialization fails

### Initialization Flow

```
Server Start → Fetch from S3 (with retries) → Cache Loaded
                    ↓ (if fails)
              Fetch from MDM → Upload to S3 → Cache Loaded
                    ↓ (if fails)
              Log Error → Continue Startup (Cache remains empty)
```

## Usage in Code

### Getting ISO Codes from Cache

The packing list validator automatically uses cached ISO codes when validating country of origin:

```javascript
import { getIsoCodesCache } from '../cache/iso-codes-cache.js'
import isoCodesData from '../data/data-iso-codes.json' with { type: 'json' }

function isValidIsoCode(code) {
  if (!code || typeof code !== 'string') {
    return false
  }

  // Try to get ISO codes from cache first, fallback to static data
  const isoCodes = getIsoCodesCache() || isoCodesData

  const normalizedCode = code.toLowerCase().trim()
  return isoCodes.some((isoCode) => isoCode.toLowerCase() === normalizedCode)
}
```

### Fallback to Static Data

If the cache is not initialized (e.g., both S3 and MDM failed), the validator falls back to the static `data-iso-codes.json` file, ensuring the service remains operational.

## Testing

### Local Development with LocalStack

For local development, you can use LocalStack to simulate S3:

1. Start LocalStack with S3 service
2. Configure environment variables:

```env
AWS_ENDPOINT_URL=http://localhost:4566
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
AWS_S3_BUCKET=test-bucket
AWS_REGION=eu-west-2
```

3. Start the server - it will automatically create/read from LocalStack S3

### Unit Tests

Run tests for the ISO codes cache:

```bash
npm test -- iso-codes-cache
```

The test suite covers:

- Successful S3 fetch and cache population
- Retry logic on temporary failures
- MDM fallback when S3 file doesn't exist
- Error handling when both S3 and MDM fail
- Configuration handling (disabled reads, schemas, etc.)

## Architecture

### Key Components

- **iso-codes-cache.js**: Cache initialization and storage
- **iso-codes-mdm-s3-sync.js**: MDM to S3 synchronization logic
- **sync-scheduler.js**: Cron scheduler for automated sync
- **start-server.js**: Server startup integration
- **packing-list-validator-utilities.js**: Validator using cached ISO codes

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      Server Startup                          │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
                ┌─────────────────────┐
                │  Initialize Cache   │
                │  (from S3)          │
                └──────────┬──────────┘
                           │
                           ▼
                  ┌────────────────┐
                  │  Start Sync    │
                  │  Scheduler     │
                  └───────┬────────┘
                          │
        ┌─────────────────┴─────────────────┐
        │         Hourly: MDM → S3          │
        │              ↓                     │
        │    Update In-Memory Cache         │
        └───────────────────────────────────┘
                          │
                          ▼
                ┌─────────────────────┐
                │  Validator Uses     │
                │  Cached ISO Codes   │
                └─────────────────────┘
```

## Monitoring

Check the application logs for cache operations:

```
# Cache initialization
INFO: Initializing ISO codes cache from S3
INFO: ISO codes cache loaded { itemCount: 249 }

# Sync operations
INFO: Starting ISO codes MDM to S3 synchronization
INFO: Successfully completed ISO codes MDM to S3 synchronization

# Errors
ERROR: Failed to fetch ISO codes from S3
WARN: ISO codes S3 file does not exist (NoSuchKey), will attempt MDM fallback
```

## Troubleshooting

### Cache Not Loading

1. Check S3 connectivity and credentials
2. Verify bucket and file path configuration
3. Check MDM API endpoint and authentication
4. Review application logs for specific error messages

### Sync Not Running

1. Verify `ISO_CODES_SYNC_ENABLED` is set to `true`
2. Check `MDM_INTEGRATION_ENABLED` is enabled
3. Validate cron schedule format
4. Review scheduler logs

### Validation Failures

If country codes are being incorrectly rejected:

1. Check if cache is populated: `getIsoCodesCache()`
2. Verify the cached data contains expected ISO codes
3. Check MDM data source for accuracy
4. Review validator logs

## Related Documentation

- [Ineligible Items Cache](./INELIGIBLE-ITEMS-CACHE.md): Similar caching pattern for prohibited items
- [MDM S3 Sync Implementation](../../MDM-S3-SYNC-IMPLEMENTATION.md): General MDM sync documentation
- [Config](../config.js): Configuration schema and defaults
