# Copilot Instructions

## Project Purpose

This repository contains the **trade-exports-packinglistparser** service, a Node.js backend used in the trade exports workflow.

The service accepts packing list documents (CSV, Excel, and PDF), discovers the correct parser model, extracts and normalizes data, validates business rules, and returns processing outcomes for downstream systems.

## What The Service Does

- Exposes HTTP endpoints (Hapi) for packing list processing plus health/connectivity checks.
- Parses source documents into a consistent internal structure.
- Validates required fields and export-domain rules.
- Determines dispatch location using Dynamics data.
- Persists parsed output to S3 and optionally publishes a message to Azure Service Bus.
- Integrates with external systems, including:
  - AWS services (such as S3)
  - Azure Service Bus and Blob Storage
  - Dynamics 365
  - MDM and related data sources for reference/cache data
- Uses cache and background sync flows for reference data (for example ISO codes and ineligible items).

## Main Processing Flow

`POST /process-packing-list` runs the core workflow:

1. Validate payload shape and required fields.
2. Download packing list from EHCO Blob storage.
3. Discover parser model and parse content.
4. Run business validation checks.
5. Persist mapped output to S3.
6. Notify external consumers via Service Bus (unless disabled by config/runtime flags).

## Request Contract (Core Route)

Expected fields for `POST /process-packing-list` include:

- `application_id`
- `packing_list_blob`
- `SupplyChainConsignment.DispatchLocation.IDCOMS.EstablishmentId`

## Technical Context

- Runtime and tooling baseline is defined in `.github/instructions/node-backend.instructions.md`.

## Naming Conventions

- Use descriptive names that reflect business meaning in the trade exports domain.
- Use `camelCase` for variables and functions.
- Use `PascalCase` for constructor-style types/classes.
- Use `UPPER_SNAKE_CASE` for constants with fixed values.
- Use kebab-case for file names (for example `packing-list-process-service.js`).
- Keep route names aligned with endpoint purpose (for example `packingListProcessRoute`).
- Keep parser/matcher model naming consistent with existing patterns (for example `model1.js`, `model2.js`, and parser model enums such as `TESCO3`).

## Standards

- Main source of truth: `.github/instructions/node-backend.instructions.md`.
- Apply those standards by default for implementation, security, logging, and testing.
- If a rule in this file intentionally differs, the rule in this file applies for this repository and should be documented under `## Local Standards (Service-Specific)`.

## Local Standards (Service-Specific)

Use these local standards when this repository intentionally differs from the generic backend guidance:

Each local rule should include a brief reason for the deviation.

- Service shape: this is an API/backend parsing service (no server-rendered UI in scope for core flows). Reason: this service is machine-to-machine and does not render user-facing pages.
- Logging implementation: use pino for structured JSON logging via project logging helpers under `src/common/helpers/logging/`, and avoid logging full sensitive payloads. Reason: this has been specified by the CDP platform the application is built on.
- Testing framework: use Vitest for unit and integration tests. Reason: this technology is specified by CDP.
- Route testing: use Hapi `server.inject()` (or project-standard route test helpers) for route testing. Reason: this technology is specified by CDP.
- Route exposure: keep test/development routes environment-gated; production only exposes core operational routes. Reason: minimizes production attack surface.
- Parser conventions: keep parser/matcher model naming and format-specific parsing patterns aligned with existing `src/services/parsers/`, `src/services/matchers/`, and `src/services/model-headers/` structures. Reason: preserves parser discoverability and avoids model drift.

## Code standards

- Follow [Defra common coding standards](https://github.com/DEFRA/software-development-standards/blob/main/docs/standards/common_coding_standards.md)
- Follow [12-factor app](https://12factor.net/) principles — config from environment, stateless processes, logs as event streams, explicit dependency declaration
- Only use approved MCP servers (see [Defra MCP guidance](https://defra.github.io/defra-ai-sdlc/pages/appendix/defra-mcp-guidance/)) — do not enable community or self-built MCP servers
- No commented-out code
- No magic numbers — use named constants
- Prefer small, focused functions with descriptive names
- Use environment variables for all configuration — never hard-code secrets or connection strings

## Format-Specific Notes

### CSV

- Use CSV-specific headers from `src/services/model-headers-csv.js` where applicable.
- Keep matcher/parser imports aligned with existing CSV models (including `/logging/logger.js` path conventions).
- Ensure parser outputs match the existing normalized item shape and include required combine parameters.

### Excel

- Follow existing sheet and header row detection patterns in `src/services/parsers/`.
- Reuse row-mapping and utility helpers instead of duplicating extraction logic.
- Validate boundary cases such as missing sheet names, shifted headers, and blank trailing rows.

### PDF

- Preserve coordinate-based extraction patterns (`x`, `x1`, `x2`, regex, header row bands) used by existing PDF models.
- Keep totals/footer filtering rules so summary rows are not emitted as items.
- Test with representative real PDFs where possible, especially for layout variants (for example portrait vs landscape).

## Logging

- Use pino for structured JSON logging via project logging helpers in `src/common/helpers/logging/`.
- Prefer `logger.info({ context }, 'message')` style for business events with relevant context.
- Use `formatError(error)` when logging exceptions to keep error shape consistent.
- Avoid logging full sensitive payloads.
- Local data-classification note: the `processPackingList` input payload currently logged at info level in `src/services/packing-list-process-service.js` has been classified for this service as non-sensitive operational data.

## Testing

- Use Vitest for unit and integration tests.
- Use Hapi `server.inject()` (or project-standard route test helpers) for route testing.
- Keep tests close to implementation where the codebase already follows that pattern (`*.test.js`).
- Add parser-service integration tests under `test/parser-service/` for end-to-end parser discovery behavior.
- Ensure lint and tests pass before merge (`npm run lint` and `npm run test`).

## Repository Shape

- `src/common/helpers/`: shared helpers (logging, metrics, fail-action, tracing)
- `src/routes/`: HTTP route definitions
- `src/services/`: parsing, validation, and integration logic
- `src/services/blob-storage/`: Azure blob storage wrappers
- `src/services/cache/`: in-memory/S3-backed cache flows
- `src/services/data/`: static/versioned reference datasets
- `src/services/matchers/`: retailer/model matchers
- `src/services/model-headers/`: retailer-specific header definitions
- `src/services/parsers/`: retailer/model parsers and parser factory helpers
- `src/services/tds-sync/`: S3-to-TDS sync flow
- `src/services/utilities/`: service-scoped utilities
- `src/services/validators/`: business validation logic
- `src/plugins/`: Hapi plugin wiring
- `src/utilities/`: file/format helpers (CSV, Excel, PDF, regex, etc.)
- `docs/`: architecture, flow, and integration documentation
- `test/`: test helpers and parser test data

## Key Endpoint

- `POST /process-packing-list`: main processing entry point for packing list documents

## Environment Notes

- Production exposes core endpoints such as `/health`, `/connectivity-check`, and `/process-packing-list`.
- Test/development-only routes (for example S3, Dynamics test routes, cache test routes, and `/test-parse`) are conditionally registered by environment.
- For this project, `perf-test` and `ext-test` are not considered test environments for route exposure.

## Security

- Follow OWASP Secure Coding Practices
- Never commit secrets to source control
- Never log PII (names, addresses, emails, phone numbers, NI numbers, bank details, API keys, tokens)
- Validate and sanitise all user input using `joi`
- Use parameterised queries for database access
- Avoid `eval`, dynamic `Function()`, or executing user-supplied data
- Validate and normalise file paths — reject path traversal attempts

## Documentation

- Write JSDoc comments for all exported functions
- Keep the README up to date with setup and run instructions
- Document breaking changes in PR descriptions

## How Copilot should respond

When generating or editing code for this project:

- Follow the conventions already established in the codebase — check existing patterns first
- Prefer modifying existing files over creating new ones when the change fits naturally
- Provide complete, minimal diffs touching only the necessary files
- Keep changes minimal and focused on the request — do not refactor unrelated code
- Always include or update tests for changed behaviour — co-locate tests with the existing test layout
- Keep solutions DRY: before adding new utilities, search for similar code in `src/utilities/`, `src/common/` or existing routes
- Justify any security-sensitive deviation (e.g. disabling CSRF or loosening CSP) in code comments and default to the most restrictive safe option
- Explain any non-obvious decisions in code comments
- If a request conflicts with these instructions, flag the conflict rather than silently ignoring the rules
- If generating code that would use a discouraged library, skip tests, hardcode a secret, or break a quality gate — call it out explicitly and do not proceed silently
- If a standards violation cannot be avoided (e.g. integration constraint), document the deviation in a code comment and raise it for review

## Licence

All code is published under the [Open Government Licence v3](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/) unless an exception is approved.
