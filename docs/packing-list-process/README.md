# Packing List Process Documentation

This folder documents how the service turns an incoming packing list into a
validated result. [source.md](./source.md) is the canonical description of
the process and business rules; the other summaries are derived from it for
specific audiences.

- **[source.md](./source.md)** — canonical, audience-neutral description of
  the end-to-end process and business rules. Update this first; the summaries
  below should stay consistent with it.
- **[tester.md](./tester.md)** — product/test-focused: expected outcomes,
  acceptance rules and example scenarios, no code references.
- **[developer.md](./developer.md)** — developer onboarding: architecture,
  file/function pointers, and how to add a new retailer parser.
- **[validation-rules.md](./validation-rules.md)** — full per-field and
  per-stage validation rules (moved, unchanged).
- **[parser-discovery-extraction-generic.md](./parser-discovery-extraction-generic.md)** —
  generic parser discovery algorithm (moved, unchanged).
- **[parser-discovery-extraction-detailed.md](./parser-discovery-extraction-detailed.md)** —
  parser discovery/extraction broken out per file type, with code pointers
  (moved, unchanged).
