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

function listS3Objects(schema = schemaVersion) {
  const client = createS3Client()

  const command = new ListObjectsV2Command({
    Bucket: s3Bucket,
    Prefix: `${schema}/`
  })
  return client.send(command)
}

function uploadJsonFileToS3(location, body) {
  const client = createS3Client()
  const command = new PutObjectCommand({
    Bucket: s3Bucket,
    Key: getKeyFromLocation(location),
    Body: body
  })
  return client.send(command)
}

async function getFileFromS3(location) {
  const response = await getStreamFromS3(location)
  return response.Body.transformToString()
}

function getStreamFromS3(location) {
  const client = createS3Client()
  const command = new GetObjectCommand({
    Bucket: s3Bucket,
    Key: getKeyFromLocation(location)
  })
  return client.send(command)
}

function getKeyFromLocation(location) {
  if (!location.schema) location.schema = schemaVersion
  return `${location.schema}/${location.filename}.json`
}

export { listS3Objects, uploadJsonFileToS3, getFileFromS3, getStreamFromS3 }
