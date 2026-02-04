#!/bin/bash
export AWS_REGION=eu-west-2
export AWS_DEFAULT_REGION=eu-west-2
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_S3_BUCKET=trade-exports-data

# S3 bucket (files organized in folders like cache/filename.json)
 aws --endpoint-url=http://localhost:4566 s3 mb s3://trade-exports-data

# SQS queues
# aws --endpoint-url=http://localhost:4566 sqs create-queue --queue-name my-queue
