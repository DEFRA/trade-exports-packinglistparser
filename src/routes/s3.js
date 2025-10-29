import {
  listS3Buckets,
  listS3Objects,
  uploadJsonFileToS3,
  getFileFromS3
} from '../services/s3-service.js'

const getListFromS3 = {
  method: 'GET',
  path: '/s3',
  handler: makeListHandler
}

async function makeListHandler(_request, h) {
  try {
    const response = await listS3Buckets()

    const allObjects = []
    for (const bucket of response.Buckets) {
      const objectsResponse = await listS3Objects(bucket.Name)
      allObjects.push({
        bucket: bucket.Name,
        objects: objectsResponse.Contents
      })
    }

    return h.response({ buckets: response, objects: allObjects }).code(200)
  } catch (error) {
    console.error('Error listing S3 buckets:', error)
    return h.response({ error: 'Failed to list S3 buckets' }).code(500)
  }
}

const getFromS3 = {
  method: 'GET',
  path: '/s3/{key}',
  handler: makeGetHandler
}

async function makeGetHandler(request, h) {
  const { key } = request.params
  try {
    const data = await getFileFromS3(key)
    return h.response(data).code(200)
  } catch (error) {
    console.error('Error getting file from S3:', error)
    return h.response({ error: 'Failed to get file from S3' }).code(500)
  }
}

const addFileToS3 = {
  method: 'POST',
  path: '/s3/{key}',
  handler: makeAddHandler
}

async function makeAddHandler(request, h) {
  const { key } = request.params
  const fileData = request.payload

  try {
    console.log('Payload received for S3 upload:', fileData)
    await uploadJsonFileToS3(key, JSON.stringify(fileData)) // assume JSON?
    return h.response({ message: 'File added to S3 successfully' }).code(201)
  } catch (error) {
    console.error('Error adding file to S3:', error)
    return h.response({ error: 'Failed to add file to S3' }).code(500)
  }
}

export { getListFromS3, getFromS3, addFileToS3 }
