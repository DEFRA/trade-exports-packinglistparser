import {
  S3Client,
  CreateBucketCommand,
  PutObjectCommand
} from '@aws-sdk/client-s3'

const s3Client = new S3Client({
  region: 'eu-west-2',
  endpoint: 'http://localhost:4566',
  credentials: {
    accessKeyId: 'test',
    secretAccessKey: 'test'
  },
  forcePathStyle: true
})

const bucketName = 'my-bucket'

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

// Upload initial ineligible items file
const initialData = {
  ineligibleItems: [
    { country_of_origin: 'CN', commodity_code: '0207' },
    { country_of_origin: 'RU', commodity_code: '1234' }
  ]
}

try {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: 'cache/ineligible-items.json',
      Body: JSON.stringify(initialData, null, 2),
      ContentType: 'application/json'
    })
  )
  console.log('✓ Uploaded initial ineligible-items.json to cache/ schema')
} catch (error) {
  console.error('Error uploading file:', error.message)
  process.exit(1)
}

console.log('\nLocalStack S3 setup complete!')
console.log('You can now start the server.')
