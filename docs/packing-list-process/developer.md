# Packing List Process — Developer Onboarding

This document covers the packing-list parsing/validation pipeline specifically.
For broader service concerns (logging, cache system, TDS sync, testing
conventions), see the [Developer Guide](../DEVELOPER-GUIDE.md). It's derived
from [source.md](./source.md) — if the two disagree, treat `source.md` as
correct and update this file.

## End-to-End Flow with Implementation Pointers

### 1. Request Receipt

Validates `application_id`, `packing_list_blob`, and
`SupplyChainConsignment.DispatchLocation.IDCOMS.EstablishmentId`.

- **Route:** [src/routes/packing-list-process.js](../../src/routes/packing-list-process.js)
- **Payload validation:** [src/services/packing-list-process-message-validation.js](../../src/services/packing-list-process-message-validation.js) — `validateProcessPackingListPayload()`
- **Orchestration entry point:** [src/services/packing-list-process-service.js](../../src/services/packing-list-process-service.js) — `processPackingList()`

### 2. Blob Download

Downloads the file from blob storage and converts Excel/CSV to JSON (PDF
stays as a `Buffer`).

- [src/services/blob-storage/ehco-blob-storage-service.js](../../src/services/blob-storage/ehco-blob-storage-service.js) — `downloadBlobFromApplicationFormsContainerAsJson()`

### 3. Dispatch Location Lookup

- [src/services/dynamics-service.js](../../src/services/dynamics-service.js) — `getDispatchLocation()`

### 4–7. Packing List Parsing

Orchestrated by [src/services/parser-service.js](../../src/services/parser-service.js) — `parsePackingList()`, which runs sanitisation → parser discovery → extraction → validation:

| Step | Name                    | Pointer                                                                                                                |
| ---- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 4    | Input sanitisation      | [src/utilities/json-file.js](../../src/utilities/json-file.js) — `sanitise()`                                          |
| 5    | Parser discovery        | [src/services/parsers/parser-factory.js](../../src/services/parsers/parser-factory.js) — `findParser()`                |
| 6–7  | Extraction & validation | [src/services/parsers/parser-factory.js](../../src/services/parsers/parser-factory.js) — `generateParsedPackingList()` |

See [parser-discovery-extraction-generic.md](./parser-discovery-extraction-generic.md)
for the discovery algorithm, and
[parser-discovery-extraction-detailed.md](./parser-discovery-extraction-detailed.md)
for the per-file-type (Excel/CSV/PDF) breakdown with function-level pointers.
Validation rules (per field, per stage, and the ineligible-goods matching
logic) are documented in [validation-rules.md](./validation-rules.md).

> **Note:** `parser-service.js` still contains a conditional branch for
> AI-style PDF parser results, but current parser selection (`findParser()` →
> `getPdfNonAiParser()`) returns non-AI parser objects, so that branch is not
> used in the current runtime flow.

### 8. S3 Persistence

- [src/services/s3-service.js](../../src/services/s3-service.js) — `uploadJsonFileToS3()`

### 9. Downstream Notification

- [src/services/trade-service-bus-service.js](../../src/services/trade-service-bus-service.js) — `sendMessageToQueue()`

## Parser Factory

- `findParser()` — Step 5: discovers the appropriate parser based on file type and content.
- `generateParsedPackingList()` — Steps 6 & 7: extracts data and runs validation.

## Result Shape

```javascript
// {
//   business_checks: {
//     all_required_fields_present: true,
//     failure_reasons: null
//   },
//   items: [
//     {
//       description: "Product description",
//       commodity_code: "0123456789",
//       number_of_packages: 10,
//       total_net_weight_kg: 50.5,
//       total_net_weight_unit: "kg",
//       row_location: { rowNumber: 5, sheetName: "Sheet1" }
//     }
//   ],
//   registration_approval_number: "RMS-GB-000000-001",
//   parserModel: "ASDA1",
//   establishment_numbers: ["RMS-GB-000000-001"],
//   dispatchLocationNumber: "LOC123"
// }
```

## HTTP API Contract

### Request

```http
POST /process-packing-list
Content-Type: application/json

{
  "application_id": "string",
  "packing_list_blob": "https://{ehcoBlobAccount}.blob.core.windows.net/{ehcoContainer}/file.xlsx",
  "SupplyChainConsignment": {
    "DispatchLocation": {
      "IDCOMS": {
        "EstablishmentId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
      }
    }
  }
}
```

`packing_list_blob` must be a valid URL from the configured EHCO blob storage
account/container (`ehcoBlob.blobStorageAccount`, `ehcoBlob.containerName`).
`EstablishmentId` must be a valid UUID string.

### Response — success, matched (200 OK)

```json
{
  "result": "success",
  "data": {
    "approvalStatus": "approved",
    "reasonsForFailure": null,
    "parserModel": "ASDA1"
  }
}
```

`approvalStatus` is one of `approved`, `rejected_ineligible` (prohibited/
ineligible items), `rejected_coo` (country-of-origin rules failed), or
`rejected_other` (other validation failures).

### Response — success, no match (200 OK)

```json
{
  "result": "success",
  "data": {
    "approvalStatus": "rejected_other",
    "reasonsForFailure": "No valid RMS establishment number found",
    "parserModel": "NOREMOS"
  }
}
```

### Response — validation error (400 Bad Request)

```json
{
  "result": "failure",
  "error": "Validation failed: application_id must be a positive integer",
  "errorType": "client"
}
```

### Response — error (500 Internal Server Error)

```json
{
  "result": "failure",
  "error": "Failed to download blob from storage",
  "errorType": "server"
}
```

## Parser Result Types

| Result Type | Description                                                                                                    | HTTP Status | Persistence / Notification                                        |
| ----------- | -------------------------------------------------------------------------------------------------------------- | ----------- | ----------------------------------------------------------------- |
| `MATCHED`   | Retailer parser identified and extraction completed; business validation may still reject via `approvalStatus` | 200         | Persist to S3, send notification                                  |
| `NOREMOS`   | No valid RMS establishment number found                                                                        | 200         | Persist to S3, send notification (unless disabled by config/flag) |
| `NOMATCH`   | Catch-all for unrecognised documents                                                                           | 200         | Persist to S3, notification skipped                               |
| `ERROR`     | Processing exception occurred                                                                                  | 500         | No persistence, no notification                                   |

Notification is also skipped when `tradeServiceBus.disableSend` is enabled or
the caller passes `stopDataExit=true`.

## Ineligible Goods Matching Functions

- **`hasIneligibleItems(item)`** — entry point, called once per product line.
  Checks preconditions (NIRMS goods, valid country of origin, commodity code
  present) before delegating to `isIneligibleItem()`. Returns `false`
  immediately if any precondition fails.
- **`isIneligibleItem(countryOfOrigin, commodityCode, typeOfTreatment)`** —
  core matching logic. Normalises inputs, looks up each country's rules from
  cache (prefix-matched against `commodityCode`), and applies the
  exception-first decision logic described in
  [validation-rules.md](./validation-rules.md#ineligible-goods).

```javascript
hasIneligibleItems({
  nirms: 'yes',
  country_of_origin: 'BR',
  commodity_code: '0207',
  type_of_treatment: null
})
// Returns: true (Brazil + 0207 is a blanket ban)

isIneligibleItem('CN', '0706', 'Raw') // rule: { commodity_code: '0706', type_of_treatment: '!Raw' }
// Returns: false (exception allows Raw)
```

**Key points for implementers:**

1. Only NIRMS items are checked — non-NIRMS goods skip the check entirely.
2. Commodity matching is prefix-based (`startsWith`) — a rule for `0207`
   also matches `020700`.
3. Treatment comparison is case-insensitive but exact after trimming — ensure
   parsers trim treatment values.
4. Exception rules use a `!` prefix (e.g. `!Raw`) to create an allow-list.
5. Country of origin can be comma-separated (e.g. `BR,CN`) — each country is
   checked independently.
6. Rule data is loaded from cache (S3/MDM) on startup, with a static JSON
   fallback — ensure the cache is initialized before relying on it in tests.

## Adding a New Retailer Parser

Create a header definition, matcher, and parser, then register them. See the
[Parser Models section of the Developer Guide](../DEVELOPER-GUIDE.md#parser-models)
for a full worked example with code, and
[src/services/parsers/README.md](../../src/services/parsers/README.md) for the
authoritative step-by-step instructions. The currently implemented parsers are
listed in the
[Developer Guide's parser tables](../DEVELOPER-GUIDE.md#currently-implemented-parsers).

In short:

1. Create `src/services/model-headers/[retailer].js` with field regex patterns and the establishment-number regex.
2. Create `src/services/matchers/[retailer]/model1.js` returning a `matcherResult` constant.
3. Create `src/services/parsers/[retailer]/model1.js` implementing `parse()`.
4. Register both in `src/services/model-parsers.js`.
5. Add unit tests alongside the new files, and integration tests under `test/parser-service/[retailer]/`.

## Related Documentation

- [Developer Guide](../DEVELOPER-GUIDE.md) — architecture, logging, cache, TDS sync, testing guidelines
- [source.md](./source.md) — canonical process description
- [tester.md](./tester.md) — product/test-focused summary
- [validation-rules.md](./validation-rules.md) — full validation rule set
