import {
  listS3Objects,
  uploadJsonFileToS3,
  getFileFromS3
} from '../services/s3-service.js'

import { STATUS_CODES } from './statuscodes.js'

const getListFromS3 = {
  method: 'GET',
  path: '/s3',
  handler: makeListHandler
}

async function makeListHandler(request, h) {
  const schema = request.query.schema
  try {
    const objectsResponse = await listS3Objects(schema)
    return h.response(objectsResponse).code(STATUS_CODES.OK)
  } catch (error) {
    console.error('Error listing S3 buckets:', error)
    return h
      .response({ error: 'Failed to list S3 buckets' })
      .code(STATUS_CODES.INTERNAL_SERVER_ERROR)
  }
}

const getFromS3 = {
  method: 'GET',
  path: '/s3/{filename}',
  handler: makeGetHandler
}

async function makeGetHandler(request, h) {
  const { filename } = request.params
  const schema = request.query.schema
  try {
    const data = await getFileFromS3({ filename, schema })
    return h.response(data).code(STATUS_CODES.OK)
  } catch (error) {
    console.error('Error getting file from S3:', error)
    return h
      .response({ error: 'Failed to get file from S3' })
      .code(STATUS_CODES.INTERNAL_SERVER_ERROR)
  }
}

const addFileToS3 = {
  method: 'POST',
  path: '/s3/{filename}',
  handler: makeAddHandler
}

async function makeAddHandler(request, h) {
  const { filename } = request.params
  const schema = request.query.schema
  const fileData = request.payload

  try {
    console.log('Payload received for S3 upload:', fileData)
    await uploadJsonFileToS3({ filename, schema }, JSON.stringify(fileData))
    return h
      .response({ message: 'File added to S3 successfully' })
      .code(STATUS_CODES.CREATED)
  } catch (error) {
    console.error('Error adding file to S3:', error)
    return h
      .response({ error: 'Failed to add file to S3' })
      .code(STATUS_CODES.INTERNAL_SERVER_ERROR)
  }
}

export { getListFromS3, getFromS3, addFileToS3 }
