import { parsePackingList } from './parser-service.js'
import { getDispatchLocation } from './dynamics-service.js'
import { downloadBlobFromApplicationForms } from './ehco-blob-storage-service.js'

export async function processPackingList(message) {
  // 1. Download packing list from blob storage
  const packingList = await downloadBlobFromApplicationForms(
    message.body.packing_list_blob
  )

  // 2. Process packing list
  const parsedData = await getParsedPackingList(packingList, message)

  // 3. Process results
  await processPackingListResults(parsedData, message.body.application_id)

  return { status: 'complete' }
}

async function getParsedPackingList(packingList, message) {
  const establishmentId =
    message.body.SupplyChainConsignment.DispatchLocation.IDCOMS.EstablishmentId
  const dispatchLocation = await getDispatchLocation(establishmentId)
  return parsePackingList(packingList, message, dispatchLocation)
}

async function processPackingListResults(packingList, applicationId) {
  await persistPackingList(packingList, applicationId)
  await notifyExternalApplications(packingList, applicationId)
}

async function persistPackingList(parsedData, applicationId) {
  // TODO: Implement persistence logic
  return {}
}

async function notifyExternalApplications(parsedData, applicationId) {
  // TODO: Implement notification logic
  return {}
}
