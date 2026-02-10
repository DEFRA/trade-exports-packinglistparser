# ISO Codes Cache Implementation

This document describes the implementation of ISO codes caching from MDM with S3 storage, mirroring the existing ineligible items cache pattern.

## Summary

ISO codes are now pulled from MDM and cached in S3/in-memory, following the same pattern as ineligible items. The implementation includes:

1. **ISO codes cache module** - Manages in-memory caching with S3 persistence
2. **MDM service integration** - Retrieves ISO codes from MDM API
3. **S3 synchronization** - Hourly sync from MDM to S3 with configurable schedule
4. **Automatic initialization** - Loads cache on server startup with fallback to static data
5. **Validator integration** - Packing list validator uses cached ISO codes

## Files Created

### Core Implementation

- **`src/services/cache/iso-codes-cache.js`** - Cache initialization, retrieval, and management
- **`src/services/cache/iso-codes-mdm-s3-sync.js`** - MDM to S3 synchronization logic
- **`src/services/cache/iso-codes-cache.test.js`** - Comprehensive unit tests

### Documentation

- **`docs/ISO-CODES-CACHE.md`** - Complete documentation for ISO codes cache

## Files Modified

### Configuration

- **`src/config.js`**
  - Added `AZURE_MDM_GET_ISO_CODES_ENDPOINT` to MDM configuration
  - Added `isoCodesCache` configuration section
  - Added `isoCodesSync` configuration section

### Services

- **`src/services/mdm-service.js`**

  - Added `getIsoCodes()` function to retrieve ISO codes from MDM API

- **`src/services/cache/sync-scheduler.js`**

  - Updated to support both ineligible items and ISO codes schedulers
  - Split into separate schedulers for each cache type
  - Enhanced status reporting for both schedulers

- **`src/common/helpers/start-server.js`**
  - Added ISO codes cache initialization on server startup
  - Added logging for ISO codes cache initialization

### Validators

- **`src/services/validators/packing-list-validator-utilities.js`**
  - Updated `isValidIsoCode()` to use cached ISO codes
  - Fallback to static `data-iso-codes.json` if cache is unavailable

### Environment Configuration

- **`.env.local.example`**
  - Added `AZURE_MDM_GET_ISO_CODES_ENDPOINT`
  - Added ISO codes cache configuration variables
  - Added ISO codes sync configuration variables

## Configuration Options

### Environment Variables

```bash
# MDM integration (required for caching)
MDM_INTEGRATION_ENABLED=true

# MDM Endpoint for ISO codes
AZURE_MDM_GET_ISO_CODES_ENDPOINT=/trade/iso-codes

# ISO codes cache configuration
ISO_CODES_S3_FILE_NAME=iso-codes
ISO_CODES_S3_SCHEMA=cache
ISO_CODES_MAX_RETRIES=3
ISO_CODES_RETRY_DELAY_MS=2000

# ISO codes synchronization
ISO_CODES_SYNC_CRON_SCHEDULE=0 * * * *
```

## Architecture

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      Server Startup                          │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
            ┌──────────────────────────────┐
            │  Initialize ISO Codes Cache  │
            │         (from S3)            │
            └──────────────┬───────────────┘
                           │
                           ▼
            ┌──────────────────────────────┐
            │  Start ISO Codes Sync        │
            │       Scheduler              │
            └──────────────┬───────────────┘
                           │
        ┌──────────────────┴──────────────────┐
        │  Hourly: MDM → S3 → Update Cache    │
        └─────────────────────────────────────┘
                           │
                           ▼
            ┌──────────────────────────────┐
            │  Validator Uses Cached Data  │
            │   (fallback to static JSON)  │
            └──────────────────────────────┘
```

### Key Features

1. **Automatic Initialization**: Cache is loaded on server startup
2. **S3 Persistence**: ISO codes are stored in S3 for durability
3. **In-Memory Performance**: Fast access with in-memory cache
4. **MDM Synchronization**: Hourly updates from MDM ensure data freshness
5. **Retry Logic**: Configurable retry on S3 failures
6. **Fallback Strategy**: Falls back to static JSON if cache unavailable
7. **Error Resilience**: Server continues even if cache initialization fails

## Testing

### Run Tests

```bash
# Run ISO codes cache tests
npm test -- iso-codes-cache

# Run all cache tests
npm test -- cache
```

### Test Coverage

- ✅ Successful S3 fetch and cache initialization
- ✅ Retry logic on temporary failures
- ✅ MDM fallback when S3 file doesn't exist
- ✅ Error handling when both S3 and MDM fail
- ✅ Configuration handling (disabled reads, schemas)
- ✅ Cache getters and setters
- ✅ Cache clearing

## Usage Example

### In Validators

```javascript
import { getIsoCodesCache } from '../cache/iso-codes-cache.js'
import isoCodesData from '../data/data-iso-codes.json' with { type: 'json' }

function isValidIsoCode(code) {
  if (!code || typeof code !== 'string') {
    return false
  }

  // Use cached ISO codes, fallback to static data
  const isoCodes = getIsoCodesCache() || isoCodesData

  const normalizedCode = code.toLowerCase().trim()
  return isoCodes.some((isoCode) => isoCode.toLowerCase() === normalizedCode)
}
```

### Manual Cache Operations

```javascript
import {
  getIsoCodesCache,
  setIsoCodesCache,
  clearIsoCodesCache
} from './services/cache/iso-codes-cache.js'

// Get current cache
const isoCodes = getIsoCodesCache()

// Set cache (for testing)
setIsoCodesCache(['GB', 'US', 'FR'])

// Clear cache
clearIsoCodesCache()
```

### Triggering Manual Sync

```javascript
import { syncIsoCodesMdmToS3 } from './services/cache/iso-codes-mdm-s3-sync.js'

// Manually trigger sync
const result = await syncIsoCodesMdmToS3()
console.log(result) // { success: true, itemCount: 249, timestamp: '...' }
```

## Monitoring

### Log Messages

```bash
# Initialization
INFO: Initializing ISO codes cache from S3
INFO: ISO codes cache loaded { itemCount: 249 }

# Synchronization
INFO: Starting ISO codes MDM to S3 synchronization scheduler
INFO: Scheduled ISO codes MDM to S3 synchronization triggered
INFO: Successfully completed ISO codes MDM to S3 synchronization

# Errors
ERROR: Failed to fetch ISO codes from S3
WARN: ISO codes S3 file does not exist (NoSuchKey), will attempt MDM fallback
ERROR: Failed to synchronize ISO codes MDM to S3
```

## Benefits

1. **Performance**: Fast validation with in-memory cache
2. **Reliability**: Fallback to static data ensures service availability
3. **Freshness**: Hourly sync keeps data current
4. **Scalability**: S3 storage handles high availability
5. **Maintainability**: Consistent pattern with ineligible items cache
6. **Testability**: Comprehensive unit tests ensure quality

## Migration Notes

### Backward Compatibility

- Static `data-iso-codes.json` file remains as fallback
- Existing validators continue to work without changes
- No breaking changes to existing functionality

### Deployment Checklist

1. ✅ Configure MDM endpoint: `AZURE_MDM_GET_ISO_CODES_ENDPOINT`
2. ✅ Verify S3 bucket access and permissions
3. ✅ Set cache configuration environment variables
4. ✅ Enable sync scheduler: `ISO_CODES_SYNC_ENABLED=true`
5. ✅ Monitor logs for successful initialization
6. ✅ Verify ISO codes are being validated correctly

## Related Documentation

- [ISO Codes Cache Documentation](./docs/ISO-CODES-CACHE.md)
- [Ineligible Items Cache](./docs/INELIGIBLE-ITEMS-CACHE.md)
- [MDM S3 Sync Implementation](./MDM-S3-SYNC-IMPLEMENTATION.md)

## Future Enhancements

Potential improvements for future iterations:

- Add cache warming on deployment
- Implement cache versioning
- Add metrics for cache hit/miss rates
- Create admin endpoint to manually trigger sync
- Add cache health check endpoint
- Implement cache expiry/TTL mechanism
