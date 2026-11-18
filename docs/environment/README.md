# Packing List Environment

This folder describes the wider business and system context for a packing
list, from its creation in EHCO through processing and downstream use. It
complements the detailed description of what the parser does in
[Packing List Process](../packing-list-process/README.md).

## Documents

- [End-to-end journey](./end-to-end-journey.md) — the business-level sequence
  and a diagram-ready view of the journey.
- [Simplified data journey (SVG)](./packing-list-data-journey.svg) — EHCO through
  PLP, then in parallel via Trade Platform to IDCOMS and via S3 to TDS,
  including MDM reference data.
- [Systems and data](./systems-and-data.md) — system responsibilities,
  exchanged data, and confirmed versus unconfirmed integration details.

## Scope and sources

The EHCO, API2, Northern Ireland, IDCOMS, GIO and TRP parts of the journey
include details supplied for this documentation and have not been
independently verified against those systems' implementation documents. The
Packing List Parser (PLP), its storage and notification behavior, and its TDS
synchronization are described using this repository's
[system context](../C4-SYSTEM-CONTEXT.md) and
[canonical packing-list process](../packing-list-process/source.md).

System details that still need confirmation against their implementation
documents are identified in [Systems and data](./systems-and-data.md).
