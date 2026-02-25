/**
 * Gousto Excel parser - Model 1
 * @module parsers/gousto/model1
 */
import { combine } from '../../parser-combine.js'
import parserModel from '../../parser-model.js'
import headers from '../../model-headers.js'
import { rowFinder } from '../../../utilities/row-finder.js'
import { mapParser } from '../../parser-map.js'
import { matchesHeader } from '../../matches-header.js'
import MatcherResult from '../../matcher-result.js'
import {
  findMatch,
  findAllMatches,
  remosRegex
} from '../../../utilities/regex.js'
import { createLogger } from '../../../common/helpers/logging/logger.js'
import { formatError } from '../../../common/helpers/logging/error-logger.js'
import {
  nowNs,
  durationNs,
  durationMs,
  measureSync,
  toEventReason,
  logEcsEvent
} from '../../../common/helpers/logging/performance.js'

const logger = createLogger()
const PARSER_ACTIONS = {
  parse: 'gousto_model1_parse',
  findEstablishmentNumber: 'gousto_model1_find_establishment_number',
  parseSheet: 'gousto_model1_parse_sheet'
}

function logParserEvent({
  message,
  action,
  type,
  outcome,
  durationNs,
  parser
}) {
  logEcsEvent(logger, {
    message,
    type,
    action,
    outcome,
    duration: durationNs,
    reason: parser
      ? toEventReason({
          model: parserModel.GOUSTO1,
          ...parser
        })
      : undefined
  })
}

function processSheet(
  sheet,
  packingListJson,
  headerCallback,
  establishmentNumbers,
  stageTotalsNs
) {
  const sheetStartNs = nowNs()

  const {
    result: matchedEstablishmentNumbers,
    durationNs: findAllMatchesDurationNs
  } = measureSync(() =>
    findAllMatches(remosRegex, packingListJson[sheet], establishmentNumbers)
  )
  stageTotalsNs.findAllMatches += findAllMatchesDurationNs

  const { result: headerRow, durationNs: rowFinderDurationNs } = measureSync(
    () => rowFinder(packingListJson[sheet], headerCallback)
  )
  stageTotalsNs.rowFinder += rowFinderDurationNs

  const dataRow = headerRow + 1

  const { result: mappedRows, durationNs: mapParserDurationNs } = measureSync(
    () =>
      mapParser(
        packingListJson[sheet],
        headerRow,
        dataRow,
        headers.GOUSTO1,
        sheet
      )
  )
  stageTotalsNs.mapParser += mapParserDurationNs

  const sheetDurationNs = durationNs(sheetStartNs)

  logParserEvent({
    message: 'Gousto Model 1 sheet parse completed',
    action: PARSER_ACTIONS.parseSheet,
    type: 'info',
    durationNs: sheetDurationNs,
    parser: {
      sheet,
      headerRow,
      dataRow,
      rowsMapped: mappedRows.length,
      durationMs: durationMs(sheetDurationNs),
      stages: {
        findAllMatchesDurationMs: durationMs(findAllMatchesDurationNs),
        rowFinderDurationMs: durationMs(rowFinderDurationNs),
        mapParserDurationMs: durationMs(mapParserDurationNs)
      }
    }
  })

  return {
    mappedRows,
    establishmentNumbers: matchedEstablishmentNumbers
  }
}

/**
 * Parse the provided packing list JSON for Gousto model 1.
 * @param {Object} packingListJson - Workbook JSON keyed by sheet name.
 * @returns {Object} Combined parser result.
 */
function parse(packingListJson) {
  const parseStartNs = nowNs()
  try {
    const sheets = Object.keys(packingListJson)
    let packingListContents = []
    let establishmentNumbers = []
    const stageTotalsNs = {
      findEstablishmentNumber: 0,
      findAllMatches: 0,
      rowFinder: 0,
      mapParser: 0,
      combine: 0
    }

    logParserEvent({
      message: 'Gousto Model 1 parse started',
      action: PARSER_ACTIONS.parse,
      type: 'start',
      outcome: 'unknown',
      parser: {
        sheetsCount: sheets.length
      }
    })

    const { result: establishmentNumber, durationNs: establishmentDurationNs } =
      measureSync(() =>
        findMatch(
          headers.GOUSTO1.establishmentNumber.regex,
          packingListJson[sheets[0]]
        )
      )
    stageTotalsNs.findEstablishmentNumber = establishmentDurationNs

    logParserEvent({
      message: 'Gousto Model 1 establishment number lookup completed',
      action: PARSER_ACTIONS.findEstablishmentNumber,
      type: 'info',
      durationNs: establishmentDurationNs,
      parser: {
        durationMs: durationMs(establishmentDurationNs)
      }
    })

    const headerTitles = Object.values(headers.GOUSTO1.regex)
    const headerCallback = function (x) {
      return matchesHeader(headerTitles, [x]) === MatcherResult.CORRECT
    }

    for (const sheet of sheets) {
      const sheetResult = processSheet(
        sheet,
        packingListJson,
        headerCallback,
        establishmentNumbers,
        stageTotalsNs
      )

      establishmentNumbers = sheetResult.establishmentNumbers
      packingListContents = packingListContents.concat(sheetResult.mappedRows)
    }

    const { result, durationNs: combineDurationNs } = measureSync(() =>
      combine(
        establishmentNumber,
        packingListContents,
        true,
        parserModel.GOUSTO1,
        establishmentNumbers,
        headers.GOUSTO1
      )
    )

    stageTotalsNs.combine = combineDurationNs

    const parseDurationNs = durationNs(parseStartNs)
    logParserEvent({
      message: 'Gousto Model 1 parse completed',
      action: PARSER_ACTIONS.parse,
      type: 'end',
      outcome: 'success',
      durationNs: parseDurationNs,
      parser: {
        sheetsCount: sheets.length,
        parsedRowsCount: packingListContents.length,
        establishmentNumbersCount: establishmentNumbers.length,
        durationMs: durationMs(parseDurationNs),
        stages: {
          findEstablishmentNumberDurationMs: durationMs(
            stageTotalsNs.findEstablishmentNumber
          ),
          findAllMatchesDurationMs: durationMs(stageTotalsNs.findAllMatches),
          rowFinderDurationMs: durationMs(stageTotalsNs.rowFinder),
          mapParserDurationMs: durationMs(stageTotalsNs.mapParser),
          combineDurationMs: durationMs(stageTotalsNs.combine)
        }
      }
    })

    return result
  } catch (err) {
    const parseDurationNs = durationNs(parseStartNs)
    logger.error(formatError(err), 'Error in parse() for Gousto Model 1')
    logParserEvent({
      message: 'Gousto Model 1 parse failed',
      action: PARSER_ACTIONS.parse,
      type: 'end',
      outcome: 'failure',
      durationNs: parseDurationNs,
      parser: {
        durationMs: durationMs(parseDurationNs)
      }
    })
    return combine(null, [], false, parserModel.NOMATCH)
  }
}

export { parse }
