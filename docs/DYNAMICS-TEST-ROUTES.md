# Dynamics Test Routes

## Overview

Two test routes are implemented to validate Dynamics 365 integration behavior:

- `GET /dynamics/health`
- `GET /dynamics/dispatch-location/{applicationId}`

These routes are environment-gated by router registration and are only exposed in:

- `local`
- `infra-dev`
- `management`
- `dev`
- `test`

They are not registered in `perf-test`, `ext-test`, or `prod`.

## Route Exposure

The routes are registered via `src/plugins/router.js` only when `cdpEnvironment` is one of:

- `local`
- `infra-dev`
- `management`
- `dev`
- `test`

In unsupported environments, requests to these endpoints return route-not-found behavior (typically `404`), because the routes are not mounted.

---

## Routes

### 1. Health Check: `GET /dynamics/health`

**Purpose:** Validate Dynamics 365 configuration without making external requests.

**URL:** `/dynamics/health`  
**Method:** `GET`

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

---

### 2. Dispatch Location Test: `GET /dynamics/dispatch-location/{applicationId}`

**Purpose:** Test Dynamics 365 integration by retrieving a REMOS ID for a given establishment/application ID.

**URL:** `/dynamics/dispatch-location/{applicationId}`  
**Method:** `GET`

**Security/validation features:**

- Input validation via Joi
- Allowed characters: alphanumeric, hyphen, underscore
- Max length: 100
- Sanitized internal error response (`Internal server error`)
- Structured logging

**Parameters:**

- `applicationId` (path)
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

**Response Example (REMOS ID Not Found):**

```json
{
  "applicationId": "UNKNOWN-ID",
  "remosId": null,
  "success": false,
  "environment": "local",
  "timestamp": "2025-11-11T11:00:00.000Z"
}
```

**Response Example (Service Error):**

```json
{
  "applicationId": "TEST-123",
  "remosId": null,
  "success": false,
  "environment": "local",
  "timestamp": "2025-11-11T11:00:00.000Z",
  "error": "Internal server error"
}
```

**Status Codes:**

- `200` - REMOS ID found
- `400` - Invalid `applicationId` format
- `404` - REMOS ID not found for a valid request
- `500` - Internal server error
- `404` (unsupported environments) - Route not registered

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

| Environment  | `/dynamics/health` | `/dynamics/dispatch-location/{applicationId}` |
| ------------ | ------------------ | --------------------------------------------- |
| `local`      | Available          | Available                                     |
| `infra-dev`  | Available          | Available                                     |
| `management` | Available          | Available                                     |
| `dev`        | Available          | Available                                     |
| `test`       | Available          | Available                                     |
| `perf-test`  | Not registered     | Not registered                                |
| `ext-test`   | Not registered     | Not registered                                |
| `prod`       | Not registered     | Not registered                                |

---

## Security Considerations

### What's Safe

- No data modification, both routes are read-only
- Input validation for application IDs
- Error responses are sanitized
- Route exposure is restricted by environment
- Requests are logged

### What's Not Exposed

- Client secrets or credentials
- Bearer tokens
- Full internal error details in responses

### Recommendations

1. Keep route exposure restricted to non-production support environments.
2. Consider auth controls if broader exposure is required in future.
3. Monitor request patterns and failure rates for abuse detection.

---

## Testing

**Test file:** `src/routes/dynamics.test.js`

Current route tests cover:

- Health check configured and unconfigured paths
- Dispatch-location success path
- Dispatch-location not-found path
- Dispatch-location internal-error path
- Request validation failures
- ID format edge cases
- Behavior in `dev` and `test` environments

Run:

```bash
npm test src/routes/dynamics.test.js
```

---

## Troubleshooting

### `GET /dynamics/health` returns `503`

Check Dynamics configuration variables:

```bash
DYNAMICS_URL=
DYNAMICS_TOKEN_URL=
DYNAMICS_CLIENT_ID=
DYNAMICS_CLIENT_SECRET=
DYNAMICS_RESOURCE=
```

### Dispatch route returns `404`

There are two common causes:

1. The route is active, but no REMOS ID exists for the supplied ID.
2. The route is not registered in the current environment (`perf-test`, `ext-test`, `prod`).

### Dispatch route returns `500`

- Dynamics service unavailable
- Authentication failure
- Network connectivity issues

Check application logs for details.

---

## Integration with Message Processing

These routes validate the same Dynamics service used in message processing:

```
Message Processing Flow:
1. Receive packing list message
2. Extract establishment ID
3. Call getDispatchLocation(establishmentId)
4. Use REMOS ID in downstream processing

Test Route:
GET /dynamics/dispatch-location/{id}
```

If the test route works in an enabled environment, the Dynamics lookup integration path is functioning.

---

## Related Documentation

- [Dynamics Service Documentation](./DYNAMICS-SERVICE.md)
- [IDCOMS Configuration Guide](./IDCOMS-CONFIGURATION.md)
- [API Documentation](../README.md#api-endpoints)
