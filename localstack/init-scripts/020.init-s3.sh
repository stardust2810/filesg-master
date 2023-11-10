#!/bin/bash
set -e

echo "########### Setting up S3 buckets ###########"
aws --endpoint=$AWS_ENDPOINT s3 mb s3://$S3_BUCKET_STG
aws --endpoint=$AWS_ENDPOINT s3 mb s3://$S3_BUCKET_STG_CLEAN
aws --endpoint=$AWS_ENDPOINT s3 mb s3://$S3_BUCKET_MAIN
aws --endpoint=$AWS_ENDPOINT s3 mb s3://$S3_BUCKET_STATIC_FILES
aws --endpoint=$AWS_ENDPOINT s3 mb s3://$S3_BUCKET_SFTP

echo "########### Configure Main bucket versioning ###########"
aws --endpoint=$AWS_ENDPOINT s3api put-bucket-versioning \
  --bucket $S3_BUCKET_MAIN \
  --versioning-configuration Status=Enabled
