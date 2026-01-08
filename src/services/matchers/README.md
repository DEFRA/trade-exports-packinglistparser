# Matchers

This directory contains matcher implementations for Step 5: Parser Discovery.

## Purpose

Matchers determine which parser should be used for a given packing list by:

1. Checking for valid REMOS establishment numbers
2. Validating header row patterns
3. Matching against known retailer formats

## Structure

```
matchers/
  ├── [retailer]/
  │   ├── model1.js          # Matcher for format variant 1
  │   ├── model2.js          # Matcher for format variant 2
  │   └── ...
  └── matcher-result.js      # Result constants
```

## Adding a New Matcher

See the main [parsers README](../parsers/README.md#example-matcher-implementation) for implementation examples.

## Matcher Results

All matchers must return one of these constants from `matcher-result.js`:

- `CORRECT` - Packing list matches this parser
- `EMPTY_FILE` - File has no data
- `WRONG_ESTABLISHMENT_NUMBER` - RMS number doesn't match expected pattern
- `WRONG_HEADER` - Header row doesn't match expected structure
- `GENERIC_ERROR` - Error occurred during matching
