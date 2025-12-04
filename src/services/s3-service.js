import {
  S3Client,
  ListObjectsV2Command,
  PutObjectCommand,
  GetObjectCommand
} from '@aws-sdk/client-s3'
import { config } from '../config.js'

const { s3Bucket, region, endpoint, accessKeyId, secretAccessKey } =
  config.get('aws')

const { schemaVersion } = config.get('packingList')

/**
 * Get S3 client configuration with optional endpoint and credentials
 * @returns {Object} S3 client configuration object
 */
function getS3Config() {
  return {
    region,
    ...(endpoint && {
      endpoint,
      forcePathStyle: true,
      credentials: { accessKeyId, secretAccessKey }
    })
  }
}

function createS3Client() {
  const s3Config = getS3Config()
  return new S3Client(s3Config)
}

/**
 * Lists objects in S3 bucket for a given schema version
 * @param {string} [schema] - Schema version prefix (defaults to config schemaVersion)
 * @returns {Promise<Object>} S3 ListObjectsV2 command response
 */
function listS3Objects(schema = schemaVersion) {
  const client = createS3Client()

  const command = new ListObjectsV2Command({
    Bucket: s3Bucket,
    Prefix: `${schema}/`
  })
  return client.send(command)
}

/**
 * Uploads a JSON file to S3 bucket
 * @param {Object} location - Location object with filename and optional schema
 * @param {string} body - JSON string content to upload
 * @returns {Promise<Object>} S3 PutObject command response
 */
function uploadJsonFileToS3(location, body) {
  const client = createS3Client()
  const command = new PutObjectCommand({
    Bucket: s3Bucket,
    Key: getKeyFromLocation(location),
    Body: body
  })
  return client.send(command)
}

/**
 * Retrieves a file from S3 and converts it to a string
 * @param {Object} location - Location object with filename and optional schema
 * @returns {Promise<string>} File content as string
 */
async function getFileFromS3(location) {
  const response = await getStreamFromS3(location)
  return response.Body.transformToString()
}

/**
 * Gets a stream from S3 for a given location
 * @param {Object} location - Location object with filename and optional schema
 * @returns {Promise<Object>} S3 GetObject command response with Body stream
 */
function getStreamFromS3(location) {
  const client = createS3Client()
  const command = new GetObjectCommand({
    Bucket: s3Bucket,
    Key: getKeyFromLocation(location)
  })
  return client.send(command)
}

/**
 * Constructs an S3 key from a location object
 * @param {Object} location - Location object with filename and optional schema
 * @returns {string} S3 key in format: schema/filename.json
 */
function getKeyFromLocation(location) {
  if (!location.schema) {
    location.schema = schemaVersion
  }
  return `${location.schema}/${location.filename}.json`
}

export { listS3Objects, uploadJsonFileToS3, getFileFromS3, getStreamFromS3 }
