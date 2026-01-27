/**
 * Parser Model Constants
 *
 * Defines constant strings for each parser model.
 * Used to identify which parser was used to process a packing list.
 */

export default Object.freeze({
  // No match cases
  NOMATCH: 'NOMATCH',
  NOREMOS: 'NOREMOS',
  NOREMOSCSV: 'NOREMOSCSV',
  NOREMOSPDF: 'NOREMOSPDF',
  UNRECOGNISED: 'UNRECOGNISED',

  // Iceland models
  ICELAND2: 'ICELAND2',

  // ASDA models
  ASDA3: 'ASDA3',

  // Buffaload Logistics models
  BUFFALOAD1: 'BUFFALOAD1',

  // Giovanni models
  GIOVANNI3: 'GIOVANNI3',

  // M&S models
  MANDS1: 'MANDS1',

  // Tesco models
  TESCO3: 'TESCO3',

  // Sainsburys models
  SAINSBURYS1: 'SAINSBURYS1'
})
