# Ineligible Items Cache

This document explains how to work with the ineligible items cache, which loads prohibited/restricted items data from S3 (or LocalStack) during server startup and synchronizes with MDM on an hourly schedule.

## Overview

The ineligible items cache is loaded on server startup from S3 and stored in memory. This provides fast access to the ineligible items data without repeated S3 calls during request processing.

The system also supports automated hourly synchronization from MDM to S3, ensuring the cache stays up-to-date with the latest master data.

## Configuration Values

The following environment variables control the ineligible items cache behavior:

| Variable                          | Description                                | Default            | Example                 |
| --------------------------------- | ------------------------------------------ | ------------------ | ----------------------- |
| `MDM_INTEGRATION_ENABLED`         | Enable/disable MDM integration and caching | `true`             | `true` or `false`       |
| `INELIGIBLE_ITEMS_S3_FILE_NAME`   | S3 file name (without extension)           | `ineligible-items` | `ineligible-items`      |
| `INELIGIBLE_ITEMS_S3_SCHEMA`      | S3 schema/prefix for the file              | `cache`            | `cache`                 |
| `INELIGIBLE_ITEMS_MAX_RETRIES`    | Max retry attempts on S3 failure           | `3`                | `3`                     |
| `INELIGIBLE_ITEMS_RETRY_DELAY_MS` | Delay between retries (ms)                 | `2000`             | `2000`                  |
| `AWS_ENDPOINT_URL`                | AWS S3 endpoint (LocalStack for local dev) | `null`             | `http://localhost:4566` |
| `AWS_S3_BUCKET`                   | S3 bucket name                             | -                  | `my-bucket`             |
| `AWS_REGION`                      | AWS region                                 | `eu-west-2`        | `eu-west-2`             |
| `AWS_ACCESS_KEY_ID`               | AWS access key (use `test` for LocalStack) | -                  | `test`                  |
| `AWS_SECRET_ACCESS_KEY`           | AWS secret key (use `test` for LocalStack) | -                  | `test`                  |

### MDM to S3 Synchronization Configuration

| Variable                              | Description                              | Default     | Example     |
| ------------------------------------- | ---------------------------------------- | ----------- | ----------- |
| `INELIGIBLE_ITEMS_SYNC_CRON_SCHEDULE` | Cron schedule for sync (default: hourly) | `0 * * * *` | `0 * * * *` |

The cron schedule format is: `minute hour day month weekday`

- Default `0 * * * *` runs at the start of every hour
- Example `*/30 * * * *` runs every 30 minutes
- Example `0 0 * * *` runs daily at midnight

## MDM Integration Feature Flag

The `MDM_INTEGRATION_ENABLED` flag controls whether the system integrates with MDM for ineligible items data and whether the cache is initialized.

**When enabled (`true`)**:

- Cache is initialized from S3 on startup
- MDM synchronization runs on hourly schedule
- Latest data is retrieved from MDM
- S3 bucket is updated with fresh data
- Cache is updated after sync

**When disabled (`false`)**:

- Cache initialization is skipped
- MDM synchronization is skipped
- S3 bucket is not updated
- Service uses static fallback data from `data-ineligible-items.json`
- Log entry confirms MDM integration is disabled

This is useful for:

- Testing with static data
- Troubleshooting MDM connectivity issues
- Disabling external dependencies in development
- Emergency fallback scenarios

```env
# Disable MDM integration and caching
MDM_INTEGRATION_ENABLED=false
```

## MDM to S3 Hourly Synchronization

The service includes an automated synchronization process that:

1. **Retrieves** the latest ineligible items data from MDM
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
MDM Service → Retrieve Data → Write to S3 → Update Cache → Cache Contains Fresh Data
```

### Monitoring Sync Operations

Check the application logs for sync operations:

```
# Successful sync
INFO: Starting MDM to S3 synchronization
INFO: Retrieving ineligible items from MDM
INFO: Writing ineligible items to S3
INFO: Updating in-memory cache with fresh data
INFO: Successfully completed MDM to S3 synchronization {
  success: true,
  timestamp: "2026-01-29T10:00:00.123Z",
  duration: 1234,
  itemCount: 150,
  s3Location: { filename: "ineligible-items", schema: "cache" },
  etag: "..."
}

# Scheduled sync trigger
INFO: Scheduled MDM to S3 synchronization triggered

# MDM API failure (AC3 - Error Logging)
ERROR: Failed to synchronize MDM to S3 - existing S3 data remains unchanged {
  error: {
    message: "MDM service unavailable",
    name: "NetworkError",
    stack_trace: "..."
  },
  timestamp: "2026-01-29T10:00:00.123Z",
  duration: 234,
  s3DataPreserved: true,
  cacheUnchanged: true
}
```

### Error Handling (AC3)

When MDM API failures occur:

**Error Logging**:

- Full error details logged including message, name, and stack trace
- Timestamp and duration of failed operation
- Explicit confirmation that S3 data is preserved
- Cache unchanged status included

**Data Preservation**:

- Existing S3 data remains unchanged
- In-memory cache is not updated
- Previous successful data continues to be used

**Service Continuity**:

- Service continues running normally
- Next scheduled sync attempts at regular interval
- No service disruption from sync failures

**Common Error Types**:

- `NetworkError` - MDM service unreachable
- `TimeoutError` - MDM API response timeout
- `AuthorizationError` - Invalid credentials or permissions
- `S3Error` - S3 bucket access issues

### Disabling Synchronization

To disable automatic synchronization (for development or troubleshooting):

```env
INELIGIBLE_ITEMS_SYNC_ENABLED=false
```

The cache will still load from S3 on startup, but won't be automatically updated.

## Local Development with LocalStack

### 1. Start LocalStack

Start LocalStack and Redis using Docker Compose:

```bash
docker compose up -d localstack redis
```

This will:

- Start LocalStack on port 4566 (S3, SQS, SNS, Firehose)
- Start Redis on port 6379
- Wait for services to be healthy

### 2. Set Up Environment Variables

Create a `.env.local` file in the project root (or use the existing one):

```env
# Local development environment
NODE_ENV=development
PORT=3001
ENVIRONMENT=local

# AWS LocalStack configuration
AWS_REGION=eu-west-2
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
AWS_ENDPOINT_URL=http://localhost:4566
AWS_S3_BUCKET=my-bucket

# Ineligible items configuration
INELIGIBLE_ITEMS_S3_FILE_NAME=ineligible-items
INELIGIBLE_ITEMS_S3_SCHEMA=v1
```

### 3. Upload Test Data to LocalStack

Run the setup script to create the S3 bucket and upload the ineligible items file:

```bash
node setup-localstack.js
```

This script:

- Creates the `my-bucket` S3 bucket in LocalStack
- Uploads `ineligible-items.json` to `s3://my-bucket/v1/ineligible-items.json`
- Only needs to be run once after starting LocalStack (or after LocalStack restart)

### 4. Start the Server

**Option A: Development mode with auto-reload**

```powershell
Get-Content .env.local | ForEach-Object { if ($_ -match '^([^#][^=]+)=(.*)$') { [Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process') } }; npm run server:watch
```

**Option B: Debug mode**

```powershell
Get-Content .env.local | ForEach-Object { if ($_ -match '^([^#][^=]+)=(.*)$') { [Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process') } }; npm run server:debug
```

The server will:

- Load environment variables from `.env.local`
- Connect to LocalStack at `http://localhost:4566`
- Initialize the ineligible items cache from S3 during startup
- Start on port 3001

### 5. Verify Cache Loaded Successfully

Check the console logs for:

```
INFO: Initializing ineligible items cache from S3
INFO: Attempting to fetch ineligible items from S3
INFO: Successfully loaded ineligible items data into cache
```

## Testing the Cache

### Test Endpoint

Access the cache test endpoint to view the cached data:

**URL:** http://localhost:3001/cache/ineligible-items

**Response:**

```json
{
  "message": "Cache retrieved successfully",
  "itemCount": 5,
  "data": {
    "ineligibleItems": [
      {
        "id": "001",
        "itemName": "Prohibited Chemicals",
        "category": "Chemicals",
        "reason": "Export restricted due to safety regulations",
        "regulationReference": "EC-1234/2024"
      }
      // ... more items
    ],
    "lastUpdated": "2026-01-22",
    "version": "1.0"
  }
}
```

### Reading Directly from S3

You can also read the file directly from S3 (bypasses cache):

**URL:** http://localhost:3001/s3/ineligible-items?schema=v1

This will fetch the file from S3 on-demand rather than using the cached version.

## Cache Behavior

### When Cache is Loaded

The cache is initialized:

1. **On server startup** - Automatically loads from S3 before server starts accepting requests
2. **With retry logic** - Retries up to 3 times (configurable) with 2-second delays
3. **Continues on failure** - If cache loading fails, the server still starts but logs an error

### When Cache is Updated

The cache is **NOT** automatically updated after startup. It remains in memory until:

1. **Server restart** - Cache is reloaded from S3 on next startup
2. **Manual update** - Deploy a new version of the file to S3 and restart the server

### Disabling Cache

To disable ineligible items cache loading:

```env
MDM_INTEGRATION_ENABLED=false
```

With this setting:

- Server skips cache initialization on startup
- Cache remains `null`
- Service uses static fallback data from `data-ineligible-items.json`
- Cache test endpoint returns: `"Cache is empty or not initialized"`

## File Structure

The ineligible items file should follow this JSON structure:

```json
{
  "ineligibleItems": [
    {
      "id": "string",
      "itemName": "string",
      "category": "string",
      "reason": "string",
      "regulationReference": "string"
    }
  ],
  "lastUpdated": "YYYY-MM-DD",
  "version": "string"
}
```

**Location in S3:**

- Bucket: Defined by `AWS_S3_BUCKET`
- Key: `{schema}/{filename}.json` (e.g., `v1/ineligible-items.json`)

## Troubleshooting

### Cache fails to load

**Error:** `"The specified bucket does not exist"`

**Solution:** Run `node setup-localstack.js` to create the bucket and upload the file

---

**Error:** `"Could not load credentials from any providers"`

**Solution:** Ensure `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are set (use `test` for LocalStack)

---

**Error:** `"Unable to load ineligible items data after 4 attempts"`

**Solution:**

- Check LocalStack is running: `docker ps | grep localstack`
- Verify `AWS_ENDPOINT_URL` is correct: `http://localhost:4566`
- Check file exists: Run `node test-s3-endpoint.js`

### Cache shows 0 items

**Issue:** `itemCount: 0` but data exists

**Cause:** The code expects either:

- An array at root level: `[{...}, {...}]`
- An object with `ineligibleItems` property: `{ ineligibleItems: [{...}] }`

**Solution:** Ensure your JSON file follows the documented structure

### Server won't start

**Error:** `EADDRINUSE: address already in use 0.0.0.0:3001`

**Solution:** Kill existing node processes:

```powershell
taskkill /F /IM node.exe
```

## Code References

- **Cache initialization:** [src/services/cache/ineligible-items-cache.js](../src/services/cache/ineligible-items-cache.js)
- **Server startup:** [src/common/helpers/start-server.js](../src/common/helpers/start-server.js)
- **Test endpoint:** [src/routes/cache-test.js](../src/routes/cache-test.js)
- **Configuration:** [src/config.js](../src/config.js) (search for `ineligibleItemsCache`)
- **LocalStack setup:** [setup-localstack.js](../setup-localstack.js)
