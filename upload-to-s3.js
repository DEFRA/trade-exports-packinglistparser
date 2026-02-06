import {
  S3Client,
  CreateBucketCommand,
  PutObjectCommand
} from '@aws-sdk/client-s3'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Configuration
const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'trade-exports-data'
const SCHEMA = process.env.INELIGIBLE_ITEMS_S3_SCHEMA || 'cache'
const FILENAME = 'ineligible-items.json'
const FILE_PATH = join(__dirname, FILENAME)

// S3 Client configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-west-2',
  endpoint: process.env.AWS_ENDPOINT_URL || undefined,
  forcePathStyle: true,
  credentials: process.env.AWS_ENDPOINT_URL
    ? {
        accessKeyId: 'test',
        secretAccessKey: 'test'
      }
    : undefined
})

async function uploadToS3() {
  try {
    // Create bucket if using LocalStack (will fail if bucket exists, but that's ok)
    if (process.env.AWS_ENDPOINT_URL) {
      try {
        await s3Client.send(
          new CreateBucketCommand({
            Bucket: BUCKET_NAME
          })
        )
        console.log(`✓ Bucket '${BUCKET_NAME}' created`)
      } catch (error) {
        if (
          error.name === 'BucketAlreadyOwnedByYou' ||
          error.Code === 'BucketAlreadyOwnedByYou'
        ) {
          console.log(`✓ Bucket '${BUCKET_NAME}' already exists`)
        } else {
          throw error
        }
      }
    }

    // Read the ineligible items file
    const fileContent = readFileSync(FILE_PATH, 'utf-8')

    // Validate JSON
    JSON.parse(fileContent)

    // Upload to S3 with schema prefix
    const key = `${SCHEMA}/${FILENAME}`
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: fileContent,
        ContentType: 'application/json'
      })
    )

    console.log(`✓ File uploaded successfully to s3://${BUCKET_NAME}/${key}`)
    console.log(`✓ Schema: ${SCHEMA}`)
    console.log(`✓ File: ${FILENAME}`)
  } catch (error) {
    console.error('Error uploading to S3:', error)
    process.exit(1)
  }
}

uploadToS3()
