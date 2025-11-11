# Dynamics 365 Service Implementation

## Overview

The Dynamics service (`src/services/dynamics-service.js`) provides integration with Dynamics 365 CRM to retrieve dispatch location data (REMOS IDs) for establishment verification.

## Implementation Details

### Migration from Old App

This implementation is a direct ES6 module conversion of the existing PLP Dynamics service, maintaining:

- ✅ OAuth 2.0 client credentials flow for authentication
- ✅ Retry logic for network failures (not HTTP errors)
- ✅ Bearer token request handling
- ✅ Dynamics Web API v9.2 endpoint integration
- ✅ Error handling and logging patterns

### Key Functions

#### `bearerTokenRequest()`

Obtains an OAuth access token from Azure AD for Dynamics authentication.

**Flow:**

1. POST to token endpoint with client credentials
2. Validate response contains access_token
3. Return token or throw error

**Configuration Required:**

- `DYNAMICS_TOKEN_URL` - Azure AD OAuth endpoint
- `DYNAMICS_CLIENT_ID` - App registration client ID
- `DYNAMICS_CLIENT_SECRET` - App registration secret
- `DYNAMICS_RESOURCE` - Dynamics instance URL
- `DYNAMICS_GRANT_TYPE` - Usually "client_credentials"

#### `getDispatchLocation(applicationId, maxRetries?, retryDelayMs?)`

Retrieves the REMOS ID for a given establishment/application ID.

**Parameters:**

- `applicationId` (string) - Establishment ID from IDCOMS message
- `maxRetries` (number) - Max retry attempts (default: 3)
- `retryDelayMs` (number) - Delay between retries (default: 2000ms)

**Returns:**

- `string` - REMOS ID if found
- `null` - If not found or error occurred

**Flow:**

1. Request bearer token from Azure AD
2. Validate token format
3. Call Dynamics API: `GET /api/data/v9.2/trd_inspectionlocations(${id})?$select=rms_remosid`
4. On success: return `rms_remosid` field
5. On HTTP error: log and return null (no retry)
6. On network error: retry up to maxRetries times

**Retry Behavior:**

- ✅ **Retries:** Network failures (fetch errors, timeouts)
- ❌ **No retry:** HTTP errors (404, 401, 500, etc.)

This ensures fast failure on invalid IDs while handling transient network issues.

## Configuration

### Environment Variables

```bash
# Dynamics 365 instance base URL
DYNAMICS_URL=https://your-org.crm11.dynamics.com

# Azure AD token endpoint (tenant-specific)
DYNAMICS_TOKEN_URL=https://login.microsoftonline.com/your-tenant-id/oauth2/token

# OAuth settings
DYNAMICS_GRANT_TYPE=client_credentials
DYNAMICS_CLIENT_ID=your-app-client-id
DYNAMICS_CLIENT_SECRET=your-app-client-secret
DYNAMICS_RESOURCE=https://your-org.crm11.dynamics.com

# Retry configuration (optional)
DYNAMICS_MAX_RETRIES=3
DYNAMICS_RETRY_DELAY_MS=2000
```

### Azure AD App Registration Setup

1. **Register App in Azure AD:**

   - Navigate to Azure Portal → Azure Active Directory → App registrations
   - Create new registration or use existing
   - Note the **Application (client) ID**

2. **Create Client Secret:**

   - In app registration, go to Certificates & secrets
   - Create new client secret
   - Copy the secret value immediately (won't be shown again)

3. **Configure Dynamics Permissions:**

   - In app registration, go to API permissions
   - Add permission → Dynamics CRM → Application permissions
   - Grant admin consent

4. **Dynamics Application User:**
   - In Dynamics 365, create an application user
   - Link to Azure AD app registration
   - Assign appropriate security roles

## Testing

### Unit Tests

Location: `src/services/dynamics-service.test.js`

**Coverage:** 98.77% (14 tests)

**Test Scenarios:**

- ✅ Successful bearer token request
- ✅ Bearer token request failures (401, network error, missing token)
- ✅ Successful dispatch location retrieval
- ✅ HTTP error handling (404, 401) - no retry
- ✅ Network failure retry logic (succeeds on retry)
- ✅ Max retries exceeded handling
- ✅ Invalid bearer token validation
- ✅ Correct API endpoint construction
- ✅ Application ID in URL
- ✅ Field selection ($select=rms_remosid)

### Running Tests

```powershell
# Test only Dynamics service
npm test src/services/dynamics-service.test.js

# Full test suite
npm test
```

### Integration Testing

To test with real Dynamics:

1. Set up `.env` with real credentials
2. Use a test/sandbox Dynamics environment
3. Create test establishment records
4. Run integration tests:

```javascript
import { getDispatchLocation } from './dynamics-service.js'

// Test with real establishment ID
const remosId = await getDispatchLocation('TEST-ESTABLISHMENT-123')
console.log('REMOS ID:', remosId)
```

## API Details

### Dynamics Web API Endpoint

```
GET {dynamics_url}/api/data/v9.2/trd_inspectionlocations({id})?$select=rms_remosid
```

**Request Headers:**

```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Response (Success - 200):**

```json
{
  "@odata.context": "https://your-org.crm11.dynamics.com/api/data/v9.2/$metadata#trd_inspectionlocations(rms_remosid)/$entity",
  "@odata.etag": "W/\"12345678\"",
  "rms_remosid": "UK12345",
  "trd_inspectionlocationid": "abc-123-def-456"
}
```

**Response (Not Found - 404):**

```json
{
  "error": {
    "code": "0x80040217",
    "message": "trd_inspectionlocations with id TEST-123 does not exist"
  }
}
```

## Error Handling

### Logged Errors

All errors are logged with context using Pino logger:

```javascript
logger.error({ err }, 'bearerTokenRequest() failed')
logger.error('Request failed - HTTP 404: Not Found')
logger.error('Attempt 1 failed with error: Network timeout, retrying in 2000ms')
logger.error('Final attempt failed with error: Network timeout')
```

### Return Values

- **Success:** Returns REMOS ID string
- **Not Found/Error:** Returns `null`
- **Never throws** - All errors caught and logged

This ensures the message processing flow continues gracefully even if Dynamics lookup fails.

## Usage in Message Processing

The Dynamics service is called from `src/messaging/process-plp-message.js`:

```javascript
import { getDispatchLocation } from '../services/dynamics-service.js'

async function getPackingList(result, message) {
  const establishmentId =
    message.body.SupplyChainConsignment.DispatchLocation.IDCOMS.EstablishmentId

  // Retrieve REMOS ID from Dynamics
  const dispatchLocation = await getDispatchLocation(establishmentId)

  // Use dispatch location to find appropriate parser
  const packingList = await findParser(
    result,
    message.body.packing_list_blob,
    dispatchLocation
  )

  return packingList
}
```

## Troubleshooting

### Common Issues

**"Bearer token request failed - Status: 401"**

- Check `DYNAMICS_CLIENT_ID` and `DYNAMICS_CLIENT_SECRET` are correct
- Verify app registration exists and is enabled
- Ensure client secret hasn't expired

**"Request failed - HTTP 404"**

- Establishment ID doesn't exist in Dynamics
- Check ID format matches Dynamics records
- This is expected for invalid/test IDs

**"Network timeout" with retries**

- Dynamics instance may be unreachable
- Check network connectivity
- Verify `DYNAMICS_URL` is correct
- Check firewall/proxy settings

**"No access token in response"**

- Azure AD configuration issue
- Check token endpoint URL
- Verify grant_type is "client_credentials"

### Debug Mode

Enable debug logging:

```bash
LOG_LEVEL=debug npm start
```

This will log:

- Bearer token requests/responses
- Dynamics API calls
- Retry attempts
- Full error details

## Performance Considerations

- **Token Caching:** Currently requests new token for each call. Consider implementing token caching with expiration.
- **Retry Delays:** Default 2000ms between retries. Adjust based on network conditions.
- **Max Retries:** Default 3 attempts. Consider increasing for unstable networks.
- **Timeout:** No explicit timeout configured. Consider adding `AbortSignal` to fetch calls.

## Security Notes

- ✅ Client secret marked as `sensitive` in config
- ✅ Bearer token not logged
- ✅ OAuth 2.0 client credentials flow
- ⚠️ Consider using Azure Managed Identity instead of client credentials in CDP environments
- ⚠️ Rotate client secrets regularly
- ⚠️ Use Azure Key Vault for secret management in production

## Future Enhancements

1. **Token Caching:** Cache bearer tokens with expiration to reduce AD calls
2. **Managed Identity:** Use Azure Managed Identity in CDP environments
3. **Circuit Breaker:** Implement circuit breaker pattern for sustained failures
4. **Metrics:** Add metrics for success/failure rates, latency
5. **Timeout Configuration:** Add configurable request timeouts
6. **Batch Operations:** If needed, implement batch retrieval for multiple establishments

## References

- [Dynamics 365 Web API Documentation](https://docs.microsoft.com/en-us/dynamics365/customer-engagement/web-api/about)
- [OAuth 2.0 Client Credentials Flow](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow)
- [Azure AD App Registration](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)
- [Dynamics Application Users](https://docs.microsoft.com/en-us/power-platform/admin/create-users-assign-online-security-roles#create-an-application-user)
