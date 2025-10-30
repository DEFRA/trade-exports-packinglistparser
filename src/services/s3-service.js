import {
  S3Client,
  ListObjectsV2Command,
  PutObjectCommand,
  GetObjectCommand
} from '@aws-sdk/client-s3'
import { config } from '../config.js'

const { s3Bucket, region, endpoint, accessKeyId, secretAccessKey } =
  config.get('aws')

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

function listS3Objects() {
  const client = createS3Client()
  const command = new ListObjectsV2Command({
    Bucket: s3Bucket
  })
  return client.send(command)
}

function uploadJsonFileToS3(key, body) {
  const client = createS3Client()
  const command = new PutObjectCommand({
    Bucket: s3Bucket,
    Key: key,
    Body: body
  })
  return client.send(command)
}

async function getFileFromS3(key) {
  const response = await getStreamFromS3(key)
  return response.Body.transformToString()
}

function getStreamFromS3(key) {
  const client = createS3Client()
  const command = new GetObjectCommand({
    Bucket: s3Bucket,
    Key: key
  })
  return client.send(command)
}

export { listS3Objects, uploadJsonFileToS3, getFileFromS3, getStreamFromS3 }
