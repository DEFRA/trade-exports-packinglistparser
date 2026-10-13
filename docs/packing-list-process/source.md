# Packing List Process — Source of Truth

This is the canonical, audience-neutral description of how a packing list is
processed, from HTTP request to completion. [tester.md](./tester.md) and
[developer.md](./developer.md) are derived from this document — update this
file first, then re-align the summaries.

## End-to-End Flow

```mermaid
flowchart TD
    Start([HTTP Request]) --> Step1[1. Request Receipt<br/>- Receive HTTP POST request<br/>- Extract application_id and packing_list_blob URI<br/>- Validate request payload]

    Step1 --> Step2[2. Blob Download<br/>- Create blob client from request URI<br/>- Download packing list file Excel/CSV/PDF<br/>- Convert to appropriate format]

    Step2 --> Step3[3. Dispatch Location Lookup<br/>- Extract establishment ID from request<br/>- Query Dynamics API for dispatch location]

    Step3 --> Step4[4. Packing List Parsing<br/>Sanitisation, parser discovery, extraction, validation]

    Step4 --> CheckMatch{Parse<br/>Successful?}

    CheckMatch -->|No Match| Step8
    CheckMatch -->|Matched| Step8[8. S3 Persistence<br/>- Write parsed data to S3<br/>- Store as JSON with application_id key<br/>- Include parser model and validation results]

    Step8 --> Step9{9. Downstream Notification<br/>Send Service Bus message?}

    Step9 -->|Yes| Notify[Send parsed/approval message<br/>- Include business_checks status<br/>- Include failure_reasons if present]
    Step9 -->|No| Return200NoMatch[Return HTTP 200<br/>No match result in response body]

    Notify --> Return200[Return HTTP 200<br/>Success response with parsed data]

    Step1 -.->|Validation error| Return400[Return HTTP 400<br/>Bad request / invalid payload]
    Step1 -.->|Error| Return500[Return HTTP 500<br/>Internal server error]
    Step2 -.->|Error| Return500
    Step3 -.->|Error| Return500
    Step4 -.->|Error| Return500
    Step8 -.->|Error| Return500
    Step9 -.->|Error| Return500

    Return200 --> Success([Completion - Success])
    Return200NoMatch --> NoMatch([Completion - No Match])
    Return400 --> FailedValidation([Completion - Validation Error])
    Return500 --> Failed([Completion - Error])
```

## Stages at a Glance

| Stage | Name                     | What happens                                                                                        |
| ----- | ------------------------ | --------------------------------------------------------------------------------------------------- |
| 1     | Request receipt          | Validate `application_id`, `packing_list_blob`, and establishment ID are present and well-formed.   |
| 2     | Blob download            | Download the packing list file and convert Excel/CSV to JSON (PDF stays as a buffer).               |
| 3     | Dispatch location lookup | Query dispatch location for the establishment ID.                                                   |
| 4     | Input sanitisation       | Remove trailing spaces and empty cells so parser matching is consistent.                            |
| 5     | Parser discovery         | Identify file type, confirm a GB RMS establishment number is present, then match a retailer format. |
| 6     | Data extraction          | Locate the header row, map columns to standard fields, and extract each product line.               |
| 7     | Validation & cleanup     | Remove empty lines, validate each product line and the packing list as a whole, record failures.    |
| 8     | S3 persistence           | Store the parsed/validated result as JSON, keyed by `application_id`.                               |
| 9     | Downstream notification  | Optionally publish a Service Bus message with the outcome.                                          |

## Outcomes

| Outcome                        | HTTP status | `approvalStatus`                                           | Trigger                                                                                                               |
| ------------------------------ | ----------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Matched, all checks pass       | 200         | `approved`                                                 | Parser found and every validation stage passes.                                                                       |
| Matched, validation failed     | 200         | `rejected_ineligible`, `rejected_coo`, or `rejected_other` | Parser found but one or more stages fail; response includes a reason.                                                 |
| No match / unrecognised format | 200         | `rejected_other`                                           | No GB RMS number found (parser model `NOREMOS`), or no retailer parser matches the document (parser model `NOMATCH`). |
| Invalid request                | 400         | —                                                          | Request payload fails shape/field validation (stage 1).                                                               |
| Internal error                 | 500         | —                                                          | Unhandled error in download, lookup, parsing, persistence, or notification.                                           |

Persistence and notification also depend on the outcome: a `NOMATCH` result
is still persisted to S3 but its downstream notification is skipped; a
`NOREMOS` result is persisted and notified as normal. Notification is also
skipped entirely when disabled by configuration or when the caller requests
`stopDataExit`.

## Parser Discovery (Plain Language)

Parser discovery decides which retailer-specific parser (if any) should read
the file:

1. **File type detection** — Excel, CSV, or PDF, based on the file extension.
2. **RMS number check** — the document must contain a GB establishment number
   in the form `RMS-GB-######-###` (six digits, three digits). Without one,
   the result is a missing-RMS outcome.
3. **Retailer matcher loop** — for each known retailer template (for this
   file type), check the establishment number pattern, then the header row
   structure.
4. **Result** — a specific parser (e.g. `ASDA3`, `TESCO3`), or an
   unrecognised-format outcome if no template matches.

See [parser-discovery-extraction-generic.md](./parser-discovery-extraction-generic.md)
for the full step-by-step algorithm, and
[parser-discovery-extraction-detailed.md](./parser-discovery-extraction-detailed.md)
for the per-file-type breakdown with implementation pointers.

## Validation Rules

Once a parser has extracted product lines, each line and the packing list as
a whole are checked against a fixed set of business rules — required fields,
numeric formats, NIRMS/country-of-origin checks, and ineligible-goods
assessment. The full rules, acceptance tables and failure-message reference
are in [validation-rules.md](./validation-rules.md).

### Ineligible Goods Assessment (One Product Line)

This flow assumes country-of-origin validation is enabled and that the NIRMS
designation and country codes have already been validated. It shows the
ineligible-goods assessment for one product line, not the packing list's
overall validation result.

```mermaid
flowchart TD
    A["Product line"] --> B{"All required information present?"}
    B -- No --> C["Report missing information or skip ineligible-goods check"]
    B -- Yes --> D{"Is this a NIRMS item?"}
    D -- No --> E["No ineligible finding"]
    D -- Yes --> F{"Country and commodity-prefix rule matches?"}
    F -- No --> E
    F -- Yes --> G{"Do matching rules prohibit this item?"}
    G -- No --> E
    G -- Yes --> H["Prohibited item"]
    G -.-> I["Exception rules are checked first:<br/>If matching exceptions exist, allow only when item treatment matches the text after ! in any exception; otherwise prohibit.<br/>If no matching exception exists, a standard rule prohibits when the rule or item treatment is missing, or the treatments match."]
```

A styled rendering of this diagram is available at
[ineligible-goods-process.svg](./ineligible-goods-process.svg).

Rule types are described in full, with worked examples, in the
["Ineligible Goods" section of validation-rules.md](./validation-rules.md#ineligible-goods).

## Where to Go Next

- Testing against these rules: [tester.md](./tester.md)
- Implementing or extending the service: [developer.md](./developer.md)
