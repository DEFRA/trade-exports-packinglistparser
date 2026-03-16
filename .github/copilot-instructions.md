---
description: Instructions that describe the behaviour and standards of teh PLP application
---

# Copilot Instructions

## Project Purpose

This repository contains the **trade-exports-packinglistparser** service, a Node.js backend used in the trade exports workflow. It accepts packing list documents (CSV, Excel, and PDF), discovers the correct parser model, extracts and normalizes data, validates business rules, and returns processing outcomes for downstream systems.

- Exposes HTTP endpoints (Hapi) for packing list processing plus health/connectivity checks.
- Validates required fields and export-domain rules.
- Determines dispatch location using Dynamics data.
- Persists parsed output to S3 and optionally publishes a message to Azure Service Bus.
- Integrates with AWS S3, Azure Service Bus and Blob Storage, Dynamics 365, and MDM.
- Uses cache and background sync flows for reference data (for example ISO codes and ineligible items).

## Main Processing Flow

`POST /process-packing-list` accepts `application_id`, `packing_list_blob`, and `SupplyChainConsignment.DispatchLocation.IDCOMS.EstablishmentId`, and runs the core workflow:

1. Validate payload shape and required fields.
2. Download packing list from EHCO Blob storage.
3. Discover parser model and parse content.
4. Run business validation checks.
5. Persist mapped output to S3.
6. Notify external consumers via Service Bus (unless disabled by config/runtime flags).

## Naming Conventions

- Use descriptive names that reflect business meaning in the trade exports domain.
- Use `camelCase` for variables and functions.
- Use `PascalCase` for constructor-style types/classes.
- Use `UPPER_SNAKE_CASE` for constants with fixed values.
- Use kebab-case for file names (for example `packing-list-process-service.js`).
- Keep route names aligned with endpoint purpose (for example `packingListProcessRoute`).
- Keep parser/matcher model naming consistent with existing patterns (for example `model1.js`, `model2.js`, and parser model enums such as `TESCO3`). See `.github/instructions/parsers-matchers-model-headers.instructions.md` for full parser/matcher/model-headers conventions.

## Standards

- Runtime and tooling baseline: `.github/instructions/node-backend.instructions.md` — apply by default for implementation, security, logging, and testing.
- Where this service intentionally deviates from the baseline, those overrides are documented in `.github/instructions/local-standards-overrides.instructions.md` with the affected area, the override applied, and the reason it is permitted. This should ALWAYS be used

## Code standards

- Follow [Defra common coding standards](https://github.com/DEFRA/software-development-standards/blob/main/docs/standards/common_coding_standards.md)
- Follow [12-factor app](https://12factor.net/) principles — config from environment, stateless processes, logs as event streams, explicit dependency declaration
- Only use approved MCP servers (see [Defra MCP guidance](https://defra.github.io/defra-ai-sdlc/pages/appendix/defra-mcp-guidance/)) — do not enable community or self-built MCP servers
- No commented-out code
- No magic numbers — use named constants
- Prefer small, focused functions with descriptive names
- Use environment variables for all configuration — never hard-code secrets or connection strings

## Logging

- Include relevant context in the message string (for example `'Failed to upload file (fileKey: x, bucket: y)'`) — CDP only surfaces specific ECS fields from the context object, so additional properties will not appear in OpenSearch.
- Use `formatError(error)` when logging exceptions to keep error shape consistent.
- Avoid logging full sensitive payloads.
- Local data-classification note: the `processPackingList` input payload currently logged at info level in `src/services/packing-list-process-service.js` has been classified for this service as non-sensitive operational data.

## Testing

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

## Environment Notes

- Production exposes core endpoints such as `/health`, `/connectivity-check`, and `/process-packing-list`.
- Test/development-only routes (for example S3, Dynamics test routes, cache test routes, and `/test-parse`) are conditionally registered by environment.
- For this project, `perf-test` and `ext-test` are not considered test environments for route exposure.

## Documentation

- Write JSDoc comments for all exported functions
- Keep the README up to date with setup and run instructions
- Document breaking changes in PR descriptions

## How Copilot should respond

When generating or editing code for this project:

- Follow the conventions already established in the codebase — check existing patterns first
- Prefer modifying existing files over creating new ones when the change fits naturally
- Keep changes minimal and focused on the request — do not refactor unrelated code, and only touch necessary files
- Always include or update tests for changed behaviour — co-locate tests with the existing test layout
- Keep solutions DRY: before adding new utilities, search for similar code in `src/utilities/`, `src/common/` or existing routes
- Justify any security-sensitive deviation (e.g. disabling CSRF or loosening CSP) in code comments and default to the most restrictive safe option
- Explain any non-obvious decisions in code comments
- If a request conflicts with these instructions, flag the conflict rather than silently ignoring the rules
- If generating code that would use a discouraged library, skip tests, hardcode a secret, or break a quality gate — call it out explicitly and do not proceed silently
- If a standards violation cannot be avoided (e.g. integration constraint), document the deviation in a code comment and raise it for review

## Licence

All code is published under the [Open Government Licence v3](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/) unless an exception is approved.
