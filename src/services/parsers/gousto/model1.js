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

const logger = createLogger()
const NS_PER_MS = 1_000_000n
const PARSER_ACTIONS = {
  parse: 'gousto_model1_parse',
  findEstablishmentNumber: 'gousto_model1_find_establishment_number',
  parseSheet: 'gousto_model1_parse_sheet'
}

function nowNs() {
  return process.hrtime.bigint()
}

function getDurationNs(startNs) {
  return Number(nowNs() - startNs)
}

function getDurationMs(durationNs) {
  return durationNs / Number(NS_PER_MS)
}

function measureSync(work) {
  const startNs = nowNs()
  const result = work()

  return {
    result,
    durationNs: getDurationNs(startNs)
  }
}

function logParserEvent({
  message,
  action,
  type,
  outcome,
  durationNs,
  parser
}) {
  logger.info(
    {
      event: {
        category: 'application',
        type,
        action,
        ...(outcome ? { outcome } : {}),
        ...(durationNs !== undefined ? { duration: durationNs } : {})
      },
      parser: {
        model: parserModel.GOUSTO1,
        ...parser
      }
    },
    message
  )
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
    let packingListContentsTemp = []
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
        durationMs: getDurationMs(establishmentDurationNs)
      }
    })

    const headerTitles = Object.values(headers.GOUSTO1.regex)
    const headerCallback = function (x) {
      return matchesHeader(headerTitles, [x]) === MatcherResult.CORRECT
    }

    for (const sheet of sheets) {
      const sheetStartNs = nowNs()

      const {
        result: matchedEstablishmentNumbers,
        durationNs: findAllMatchesDurationNs
      } = measureSync(() =>
        findAllMatches(remosRegex, packingListJson[sheet], establishmentNumbers)
      )
      establishmentNumbers = matchedEstablishmentNumbers
      stageTotalsNs.findAllMatches += findAllMatchesDurationNs

      const { result: headerRow, durationNs: rowFinderDurationNs } =
        measureSync(() => rowFinder(packingListJson[sheet], headerCallback))
      stageTotalsNs.rowFinder += rowFinderDurationNs

      const dataRow = headerRow + 1

      const { result: mappedRows, durationNs: mapParserDurationNs } =
        measureSync(() =>
          mapParser(
            packingListJson[sheet],
            headerRow,
            dataRow,
            headers.GOUSTO1,
            sheet
          )
        )
      packingListContentsTemp = mappedRows
      stageTotalsNs.mapParser += mapParserDurationNs

      packingListContents = packingListContents.concat(packingListContentsTemp)

      const sheetDurationNs = getDurationNs(sheetStartNs)
      logParserEvent({
        message: 'Gousto Model 1 sheet parse completed',
        action: PARSER_ACTIONS.parseSheet,
        type: 'info',
        durationNs: sheetDurationNs,
        parser: {
          sheet,
          headerRow,
          dataRow,
          rowsMapped: packingListContentsTemp.length,
          durationMs: getDurationMs(sheetDurationNs),
          stages: {
            findAllMatchesDurationMs: getDurationMs(findAllMatchesDurationNs),
            rowFinderDurationMs: getDurationMs(rowFinderDurationNs),
            mapParserDurationMs: getDurationMs(mapParserDurationNs)
          }
        }
      })
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

    const parseDurationNs = getDurationNs(parseStartNs)
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
        durationMs: getDurationMs(parseDurationNs),
        stages: {
          findEstablishmentNumberDurationMs: getDurationMs(
            stageTotalsNs.findEstablishmentNumber
          ),
          findAllMatchesDurationMs: getDurationMs(stageTotalsNs.findAllMatches),
          rowFinderDurationMs: getDurationMs(stageTotalsNs.rowFinder),
          mapParserDurationMs: getDurationMs(stageTotalsNs.mapParser),
          combineDurationMs: getDurationMs(stageTotalsNs.combine)
        }
      }
    })

    return result
  } catch (err) {
    const parseDurationNs = getDurationNs(parseStartNs)
    logger.error(formatError(err), 'Error in parse() for Gousto Model 1')
    logParserEvent({
      message: 'Gousto Model 1 parse failed',
      action: PARSER_ACTIONS.parse,
      type: 'end',
      outcome: 'failure',
      durationNs: parseDurationNs,
      parser: {
        durationMs: getDurationMs(parseDurationNs)
      }
    })
    return combine(null, [], false, parserModel.NOMATCH)
  }
}

export { parse }
