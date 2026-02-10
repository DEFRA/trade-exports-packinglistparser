# TDS Synchronization Service

## Overview

The TDS synchronization service provides scheduled transfer of documents from AWS S3 to Azure Blob Storage (TDS container). This service runs on a configurable schedule (default: hourly), searches for files in a specified S3 schema folder, transfers them to TDS Blob Storage, and then removes them from S3.

## Features

- **Scheduled Synchronization**: Automatically syncs files from S3 to TDS Blob Storage on a configurable schedule
- **Configurable Cron Schedule**: Flexible scheduling using cron expressions
- **Automatic File Discovery**: Searches S3 schema folder for all available files
- **File Transfer**: Downloads files from S3 and uploads to TDS Blob Storage
- **Automatic Cleanup**: Removes transferred files from S3 after successful upload
- **Batch Processing**: Handles multiple files in parallel
- **Error Handling**: Comprehensive error logging with detailed information per file
- **Enable/Disable Toggle**: Easy on/off control via environment variable

## Architecture

The TDS sync service consists of two main components:

1. **tds-sync.js**: Contains the core synchronization logic

   - Lists documents in S3 schema folder
   - Downloads each file from S3
   - Uploads to TDS Blob Storage
   - Deletes from S3 after successful transfer
   - Handles errors and logging

2. **sync-scheduler.js**: Manages the scheduled execution
   - Sets up cron job based on configuration
   - Triggers synchronization at scheduled intervals
   - Provides start/stop/status methods

## Workflow

```
1. List files in S3 schema folder (e.g., "tds-transfer/")
2. For each file:
   a. Download from S3
   b. Upload to TDS Blob Storage
   c. Delete from S3 (only if upload successful)
3. Return detailed results with success/failure counts
```

## Configuration

The service is configured through environment variables:

### Environment Variables

| Variable                      | Description                                         | Default     | Required |
| ----------------------------- | --------------------------------------------------- | ----------- | -------- |
| `TDS_SYNC_ENABLED`            | Enable or disable TDS synchronization               | `true`      | No       |
| `TDS_SYNC_CRON_SCHEDULE`      | Cron schedule for synchronization (default: hourly) | `0 * * * *` | No       |
| `PACKING_LIST_SCHEMA_VERSION` | S3 schema/folder to search for files to transfer    | `v0.0`      | No       |

### Cron Schedule Examples

```bash
# Every hour at minute 0
TDS_SYNC_CRON_SCHEDULE='0 * * * *'

# Every 30 minutes
TDS_SYNC_CRON_SCHEDULE='*/30 * * * *'

# Every day at 2:00 AM
TDS_SYNC_CRON_SCHEDULE='0 2 * * *'

# Every Monday at 3:00 AM
TDS_SYNC_CRON_SCHEDULE='0 3 * * 1'
```

### Configuration Example

```bash
# .env file
TDS_SYNC_ENABLED=true
TDS_SYNC_CRON_SCHEDULE='0 * * * *'
PACKING_LIST_SCHEMA_VERSION='v0.0'
```

### S3 File Organization

Files should be placed in the S3 bucket under the packing list schema folder:

```
s3://your-bucket/
  └── v0.0/                   # Packing list schema version
      ├── document1.json
      ├── report.pdf
      └── data.xlsx
```

The service will:

1. Find all files in `tds-transfer/` folder
2. Transfer each file to TDS Blob Storage
3. Remove each file from S3 after successful transfer

## Usage

### Starting the Scheduler

To start the TDS synchronization scheduler when your application starts:

```javascript
import { startTdsSyncScheduler } from './services/tds-sync/sync-scheduler.js'

// Start the scheduler during application initialization
startTdsSyncScheduler()
```

### Stopping the Scheduler

```javascript
import { stopTdsSyncScheduler } from './services/tds-sync/sync-scheduler.js'

// Stop the scheduler (e.g., during graceful shutdown)
stopTdsSyncScheduler()
```

### Checking Scheduler Status

```javascript
import { isTdsSchedulerRunning } from './services/tds-sync/sync-scheduler.js'

// Check if scheduler is running
if (isTdsSchedulerRunning()) {
  console.log('TDS scheduler is active')
} else {
  console.log('TDS scheduler is not running')
}
```

### Manual Synchronization

You can also trigger synchronization manually:

```javascript
import { syncToTds } from './services/tds-sync/tds-sync.js'

// Manually trigger synchronization
const result = await syncToTds()

if (result.success) {
  console.log('Sync successful:', result)
  console.log(`Transferred ${result.successfulTransfers} files`)
} else {
  console.error('Sync failed:', result.error)
}
```

## Response Format

### Success Response (with files transferred)

```json
{
  "success": true,
  "timestamp": "2026-02-09T10:00:00.000Z",
  "duration": 1234,
  "totalFiles": 5,
  "successfulTransfers": 4,
  "failedTransfers": 1,
  "transfers": {
    "successful": [
      {
        "s3Key": "tds-transfer/document1.json",
        "blobName": "document1.json",
        "etag": "\"0x8D9...",
        "size": 1024
      },
      {
        "s3Key": "tds-transfer/report.pdf",
        "blobName": "report.pdf",
        "etag": "\"0x8D9...",
        "size": 20480
      }
    ],
    "failed": [
      {
        "s3Key": "tds-transfer/corrupted.json",
        "error": "Failed to upload blob: Network error"
      }
    ]
  }
}
```

### Success Response (no files to transfer)

```json
{
  "success": true,
  "timestamp": "2026-02-09T10:00:00.000Z",
  "duration": 123,
  "totalFiles": 0,
  "successfulTransfers": 0,
  "failedTransfers": 0,
  "message": "No files found to transfer"
}
```

### Error Response

```json
{
  "success": false,
  "timestamp": "2026-02-09T10:00:00.000Z",
  "duration": 1234,
  "error": "Failed to upload blob: Network error",
  "errorName": "Error"
}
```

### Disabled Response

```json
{
  "success": false,
  "timestamp": "2026-02-09T10:00:00.000Z",
  "duration": 0,
  "skipped": true,
  "reason": "TDS synchronization is disabled"
}
```

## Integration with Application

Add the scheduler startup to your application's initialization sequence:

```javascript
// In your server startup file (e.g., server.js or index.js)
import { startTdsSyncScheduler } from './services/tds-sync/sync-scheduler.js'

async function startServer() {
  // ... other initialization code ...

  // Start TDS sync scheduler
  startTdsSyncScheduler()

  // ... rest of server startup ...
}
```

Add graceful shutdown handling:

```javascript
// Handle shutdown signals
process.on('SIGTERM', async () => {
  stopTdsSyncScheduler()
  // ... other cleanup ...
})

process.on('SIGINT', async () => {
  stopTdsSyncScheduler()
  // ... other cleanup ...
})
```

## Error Handling

The service includes comprehensive error handling:

- **Configuration Errors**: Invalid cron schedules are caught during scheduler startup
- **Sync Errors**: Failures during synchronization are logged but don't crash the application
- **Network Errors**: Azure Blob Storage connection issues are caught and logged

All errors are logged with detailed context including:

- Error message and name
- Stack trace
- Timestamp
- Duration of failed operation

## Monitoring

Monitor the service through application logs:

```bash
# Starting scheduler
{"level":"info","msg":"Starting TDS synchronization scheduler","cronSchedule":"0 * * * *"}

# Listing files
{"level":"info","msg":"Listing documents from S3 schema folder","schema":"tds-transfer"}
{"level":"info","msg":"Found documents in S3 schema folder","schema":"tds-transfer","count":3}

# Transferring files
{"level":"info","msg":"Transferring file from S3 to TDS","s3Key":"tds-transfer/document1.json"}
{"level":"info","msg":"File uploaded to TDS successfully","s3Key":"tds-transfer/document1.json","blobName":"document1.json"}
{"level":"info","msg":"File deleted from S3 successfully","s3Key":"tds-transfer/document1.json"}

# Successful sync
{"level":"info","msg":"Successfully completed TDS synchronization","success":true,"totalFiles":3,"successfulTransfers":3}

# Failed file transfer
{"level":"error","msg":"Failed to transfer file from S3 to TDS","s3Key":"tds-transfer/file.json","error":{"message":"Network error"}}

# Failed sync
{"level":"error","msg":"Failed to synchronize S3 documents to TDS","error":{"message":"S3 connection failed"}}
```

## Testing

### Manual Testing

1. Place test files in S3 bucket under the configured schema folder:

   ```bash
   aws s3 cp test-file.json s3://your-bucket/tds-transfer/
   ```

2. Set `TDS_SYNC_CRON_SCHEDULE='*/1 * * * *'` to run every minute

3. Monitor logs for sync activity

4. Check:
   - TDS Blob Storage for uploaded files
   - S3 bucket to verify files were deleted

### Integration Testing

```javascript
import { syncToTds } from './services/tds-sync/tds-sync.js'
import { listS3Objects } from './services/s3-service.js'

describe('TDS Sync', () => {
  it('should transfer files from S3 to TDS', async () => {
    // Place test file in S3
    // ...

    const result = await syncToTds()

    expect(result.success).toBe(true)
    expect(result.successfulTransfers).toBeGreaterThan(0)

    // Verify file no longer in S3
    const s3Files = await listS3Objects('tds-transfer')
    expect(s3Files.Contents).toHaveLength(0)

    // Verify file in TDS (check blob storage)
    // ...
  })
})
```

## Troubleshooting

### Scheduler Not Starting

- Check that `TDS_SYNC_ENABLED` is set to `true`
- Verify cron schedule format is valid
- Check application logs for startup errors

### No Files Being Transferred

- Verify files exist in the S3 schema folder (uses `PACKING_LIST_SCHEMA_VERSION`)
- Check S3 permissions for listing and reading objects
- Ensure files are in the correct S3 schema folder (e.g., `v0.0/`)
- Review application logs for S3 listing errors

### Transfer Failures

- Verify Azure credentials are configured correctly
- Check that TDS container exists in Azure Blob Storage
- Ensure network connectivity to both S3 and Azure
- Review application logs for detailed error messages per file
- Check file sizes don't exceed Azure Blob Storage limits

### Files Not Deleted from S3

- Files are only deleted after successful upload to TDS
- Check application logs to see which files failed transfer
- Failed transfers will remain in S3 for retry on next sync
- Verify S3 delete permissions are configured

### Partial Failures

- The service processes files in parallel
- Individual file failures don't stop other transfers
- Check the `transfers.failed` array in response for specific errors
- Failed files remain in S3 for next sync attempt

## Dependencies

- `node-cron`: Cron job scheduling
- `@aws-sdk/client-s3`: AWS S3 SDK for listing, downloading, and deleting files
- `@azure/storage-blob`: Azure Blob Storage SDK for uploading
- Application logger (pino-based)
- Application configuration (convict-based)

## File Transfer Details

### Supported File Types

The service transfers all file types found in the S3 schema folder:

- JSON files (`.json`) - uploaded with `application/json` content type
- All other files - uploaded with `application/octet-stream` content type

### Transfer Process

1. **Discovery**: Lists all objects in the configured S3 schema folder
2. **Download**: Streams each file from S3 into memory buffer
3. **Upload**: Uploads buffer to TDS Blob Storage with appropriate content type
4. **Cleanup**: Deletes file from S3 only after successful upload
5. **Reporting**: Returns detailed results for all files processed

### Error Handling

- Individual file failures don't stop batch processing
- Failed files remain in S3 for retry on next scheduled sync
- Detailed error messages logged for each failure
- Summary of successful and failed transfers in response

## See Also

- [TDS Blob Storage Service](../blob-storage/tds-blob-storage-service.js)
- [S3 Service](../s3-service.js)
- [Blob Storage Service](../blob-storage/blob-storage-service.js)
- [Configuration](../../config.js)
