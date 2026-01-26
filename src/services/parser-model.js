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

  // Giovanni models
  GIOVANNI3: 'GIOVANNI3',

  // TJ Morris models
  TJMORRIS2: 'TJMORRIS2'
})
