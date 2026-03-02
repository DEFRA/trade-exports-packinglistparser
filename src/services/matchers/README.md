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
src/services/
  └── matcher-result.js      # Result constants (shared, not inside matchers/)
```

## Adding a New Matcher

See the main [parsers README](../parsers/README.md#example-matcher-implementation) for implementation examples.

## Matcher Results

All matchers must return one of these numeric constants from `src/services/matcher-result.js`:

```javascript
export default Object.freeze({
  WRONG_EXTENSION: 0, // File type not handled by this matcher
  WRONG_ESTABLISHMENT_NUMBER: 1, // Invalid or missing RMS number
  WRONG_HEADER: 2, // Header structure mismatch
  GENERIC_ERROR: 3, // Processing error
  CORRECT: 4, // Packing list matches
  EMPTY_FILE: 5 // No data found
})
```

Import with:

```javascript
import matcherResult from '../../matcher-result.js'
```
