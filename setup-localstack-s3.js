import { S3Client, CreateBucketCommand } from '@aws-sdk/client-s3'

const s3Client = new S3Client({
  region: 'eu-west-2',
  endpoint: 'http://localhost:4566',
  credentials: {
    accessKeyId: 'test',
    secretAccessKey: 'test'
  },
  forcePathStyle: true
})

const bucketName = 'cache'

// Create bucket
try {
  await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }))
  console.log(`✓ Created bucket: ${bucketName}`)
} catch (error) {
  if (error.name === 'BucketAlreadyOwnedByYou') {
    console.log(`✓ Bucket already exists: ${bucketName}`)
  } else {
    console.error('Error creating bucket:', error.message)
    process.exit(1)
  }
}

console.log('\nLocalStack S3 setup complete!')
console.log('Bucket is empty - MDM sync will populate it on first run.')
