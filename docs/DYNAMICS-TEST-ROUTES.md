# Dynamics Test Routes

## Overview

Two safe test routes have been created to validate the Dynamics 365 service integration without exposing sensitive operations or data.

## Routes

### 1. Health Check: `GET /dynamics/health`

**Purpose:** Validate Dynamics 365 configuration without making external requests

**URL:** `/dynamics/health`

**Method:** `GET`

**Security:** Available in all environments

**Response Example (Configured):**

```json
{
  "service": "dynamics",
  "configured": true,
  "environment": "local",
  "checks": {
    "url": "configured",
    "tokenUrl": "configured",
    "clientId": "configured",
    "clientSecret": "configured",
    "resource": "configured"
  },
  "timestamp": "2025-11-11T11:00:00.000Z"
}
```

**Response Example (Not Configured):**

```json
{
  "service": "dynamics",
  "configured": false,
  "environment": "local",
  "checks": {
    "url": "missing",
    "tokenUrl": "missing",
    "clientId": "missing",
    "clientSecret": "missing",
    "resource": "missing"
  },
  "timestamp": "2025-11-11T11:00:00.000Z"
}
```

**Status Codes:**

- `200` - Service is fully configured
- `503` - Service is not configured or partially configured

**Use Cases:**

- Pre-flight checks before deployment
- Health monitoring in CDP environments
- Configuration validation during setup
- Debugging configuration issues

---

### 2. Test Dispatch Location: `GET /dynamics/dispatch-location/{applicationId}`

**Purpose:** Test Dynamics 365 integration by retrieving a REMOS ID for a given establishment

**URL:** `/dynamics/dispatch-location/{applicationId}`

**Method:** `GET`

**Security Features:**

- ✅ **Disabled in production** - Returns 403 in prod environment
- ✅ **Input validation** - Only alphanumeric, hyphens, underscores allowed
- ✅ **Length limits** - Max 100 characters
- ✅ **Sanitized errors** - No sensitive data in error messages
- ✅ **Logging** - All requests logged with context

**Parameters:**

- `applicationId` (path) - Establishment or Application ID
  - Format: `^[a-zA-Z0-9\-_]+$`
  - Min length: 1
  - Max length: 100
  - Examples: `TEST-123`, `UK1234`, `ESTABLISHMENT_456`

**Response Example (Success):**

```json
{
  "applicationId": "TEST-APP-123",
  "remosId": "UK12345",
  "success": true,
  "environment": "local",
  "timestamp": "2025-11-11T11:00:00.000Z"
}
```

**Response Example (Not Found):**

```json
{
  "applicationId": "UNKNOWN-ID",
  "remosId": null,
  "success": false,
  "environment": "local",
  "timestamp": "2025-11-11T11:00:00.000Z"
}
```

**Response Example (Production Block):**

```json
{
  "error": "This endpoint is not available in production environments",
  "applicationId": "TEST-123",
  "success": false,
  "remosId": null,
  "environment": "prod",
  "timestamp": "2025-11-11T11:00:00.000Z"
}
```

**Status Codes:**

- `200` - REMOS ID found successfully
- `400` - Invalid application ID format
- `403` - Endpoint disabled in production
- `404` - REMOS ID not found (not an error, just doesn't exist)
- `500` - Internal server error (Dynamics service failure)

**Use Cases:**

- Manual testing of Dynamics integration
- Validation of establishment IDs
- Debugging REMOS ID lookups
- Integration testing in dev/test environments

---

## Testing the Routes

### Using cURL

**Health Check:**

```bash
curl http://localhost:3001/dynamics/health
```

**Get Dispatch Location:**

```bash
curl http://localhost:3001/dynamics/dispatch-location/TEST-123
```

### Using PowerShell

**Health Check:**

```powershell
Invoke-RestMethod -Uri "http://localhost:3001/dynamics/health" -Method GET
```

**Get Dispatch Location:**

```powershell
Invoke-RestMethod -Uri "http://localhost:3001/dynamics/dispatch-location/TEST-123" -Method GET
```

### Using VS Code REST Client

Create a `test.http` file:

```http
### Health Check
GET http://localhost:3001/dynamics/health

### Get Dispatch Location
GET http://localhost:3001/dynamics/dispatch-location/TEST-123

### Test with hyphens
GET http://localhost:3001/dynamics/dispatch-location/UK-ESTAB-12345

### Test with underscores
GET http://localhost:3001/dynamics/dispatch-location/TEST_APP_456

### Test invalid format (should fail)
GET http://localhost:3001/dynamics/dispatch-location/invalid@id

### Test not found
GET http://localhost:3001/dynamics/dispatch-location/DOES-NOT-EXIST
```

---

## Environment Behavior

| Environment | Health Check | Dispatch Location |
| ----------- | ------------ | ----------------- |
| `local`     | ✅ Available | ✅ Available      |
| `dev`       | ✅ Available | ✅ Available      |
| `test`      | ✅ Available | ✅ Available      |
| `perf-test` | ✅ Available | ✅ Available      |
| `ext-test`  | ✅ Available | ✅ Available      |
| `prod`      | ✅ Available | ❌ Disabled (403) |

---

## Security Considerations

### What's Safe ✅

- **No data modification** - Both routes are read-only
- **Input validation** - Strict format checking on application IDs
- **Production protection** - Test route disabled in prod
- **Error sanitization** - No sensitive data leaked in errors
- **Rate limiting** - Inherits application-level rate limits
- **Logging** - All access logged for audit

### What's NOT Exposed ❌

- ❌ Client secrets or credentials
- ❌ Bearer tokens
- ❌ Internal Dynamics URLs (only in config)
- ❌ Full error stack traces
- ❌ Database queries or internal logic

### Recommendations

1. **Remove in production** - Consider removing test route entirely in prod builds
2. **Add authentication** - Consider adding API key or OAuth for test route
3. **Rate limiting** - Add specific rate limits for test endpoints
4. **Monitoring** - Monitor usage and alert on suspicious patterns
5. **Time limits** - Consider adding time-based access (e.g., only during business hours)

---

## Testing

**Test Files:** `src/routes/dynamics.test.js`

**Coverage:** 100% (14 tests)

**Test Scenarios:**

- ✅ Health check with full configuration
- ✅ Health check with missing configuration
- ✅ Health check with partial configuration
- ✅ Successful REMOS ID retrieval
- ✅ REMOS ID not found (404)
- ✅ Service error handling (500)
- ✅ Production environment block (403)
- ✅ Input validation (400)
- ✅ Empty application ID rejection
- ✅ Application IDs with hyphens
- ✅ Application IDs with underscores
- ✅ Application IDs over length limit
- ✅ Dev environment behavior
- ✅ Test environment behavior

**Run Tests:**

```powershell
npm test src/routes/dynamics.test.js
```

---

## Troubleshooting

### Health Check Returns 503

**Problem:** Service configured: false

**Solution:**

1. Check environment variables are set:
   ```bash
   DYNAMICS_URL=
   DYNAMICS_TOKEN_URL=
   DYNAMICS_CLIENT_ID=
   DYNAMICS_CLIENT_SECRET=
   DYNAMICS_RESOURCE=
   ```
2. Verify `.env` file is loaded
3. Check config validation didn't fail on startup

### Dispatch Location Returns 404

**Problem:** REMOS ID not found

**Possible Causes:**

- Establishment ID doesn't exist in Dynamics
- Incorrect ID format
- Dynamics environment mismatch (dev vs prod data)

**Solution:**

1. Verify establishment ID exists in your Dynamics instance
2. Check Dynamics URL points to correct environment
3. Use health check to verify configuration
4. Check application logs for Dynamics errors

### Dispatch Location Returns 500

**Problem:** Internal server error

**Possible Causes:**

- Dynamics service is down
- Network connectivity issues
- Authentication failure
- Invalid credentials

**Solution:**

1. Check Dynamics service health directly
2. Verify credentials haven't expired
3. Check network/firewall rules
4. Review application logs for detailed error
5. Test bearer token request separately

### Request Returns 403 in Non-Prod

**Problem:** Shouldn't happen - test route should work in dev/test

**Solution:**

1. Check `ENVIRONMENT` variable is set correctly
2. Verify not accidentally pointing to prod config
3. Check application logs

---

## Integration with Message Processing

These test routes validate the same Dynamics service used in message processing:

```
Message Processing Flow:
1. Receive packing list message
2. Extract establishment ID
3. Call getDispatchLocation(establishmentId) ← Same function as test route
4. Use REMOS ID to find parser
5. Process packing list

Test Route:
GET /dynamics/dispatch-location/{id} ← Tests same function
```

If the test route works, the message processing Dynamics integration should work too.

---

## Monitoring & Alerts

Recommended monitoring:

1. **Health Check:**

   - Alert if returns 503 in production
   - Monitor for configuration drift

2. **Test Route Usage:**

   - Track request frequency
   - Alert on unusual patterns (potential abuse)
   - Monitor error rates

3. **Performance:**
   - Track response times
   - Alert on slow Dynamics responses (>5s)
   - Monitor retry patterns

---

## Future Enhancements

1. **Batch Testing** - Add endpoint to test multiple IDs at once
2. **Authentication** - Add API key or OAuth requirement
3. **Caching** - Cache results to reduce Dynamics load
4. **Metrics** - Add detailed metrics endpoint
5. **Mock Mode** - Add mock data for demo purposes
6. **Admin UI** - Simple web UI for non-technical testing

---

## Related Documentation

- [Dynamics Service Documentation](./DYNAMICS-SERVICE.md)
- [IDCOMS Configuration Guide](./IDCOMS-CONFIGURATION.md)
- [API Documentation](../README.md#api-endpoints)
