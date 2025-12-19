/**
 * PDF Model Headers Registry
 *
 * Aggregates all PDF-specific model headers for coordinate-based PDF parsers.
 * Individual retailer headers are imported from model-headers/[retailer].js
 */

import { pdfGiovanniHeaders } from './model-headers/giovanni.js'

const headers = {
  ...pdfGiovanniHeaders
  // TODO: Add PDF model headers as they are migrated
  // ...pdfBookerHeaders,
  // ...pdfMandsHeaders,
  // ...pdfGreggsHeaders,
}

export default headers
