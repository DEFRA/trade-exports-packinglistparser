/**
 * Burbank model headers
 *
 * Provides establishment number regexes and header regex mappings
 * for Burbank packing list variants used by matchers.
 *
 * Header row (Excel row 44 in the "Revised" sheet):
 *   A: Item
 *   B: Product code
 *   C: Commodity code
 *   F: Description of goods
 *   G: Country of Origin
 *   H: No. of packages
 *   I: Type of packages
 *   K: Item Net Weight (kgs)
 *   M: NIIRMS Dispatch number  ← establishment number (RMS-GB-000219-NNN)
 *   N: Nature of Product
 *   O: Type of Treatment
 *   P: NIRMS Red/Green Lane
 */

export const burbankHeaders = {
  BURBANK1: {
    establishmentNumber: {
      // Burbank Produce Ltd establishment number (RMS-GB-000219-NNN)
      regex: /^RMS-GB-000219-\d{3}$/i
    },
    regex: {
      description: /Description of goods/i,
      nature_of_products: /Nature of Product/i,
      type_of_treatment: /Type of Treatment/i,
      number_of_packages: /No\. of packages/i,
      total_net_weight_kg: /Item Net Weight/i,
      commodity_code: /Commodity code/i
    },
    country_of_origin: /Country of Origin/i,
    nirms: /NIRMS Red\/Green Lane/i,
    // "Item Net Weight (kgs)" — unit is encoded in the header cell
    findUnitInHeader: true,
    validateCountryOfOrigin: true,
    // Skip lookup/reference sheets — only "Revised" contains product data
    invalidSheets: ['References', 'Lookups', 'Meursing']
  }
}
