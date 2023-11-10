#!/bin/bash
set -e

echo "########### Seeding data to localstack ###########"
aws --endpoint=$AWS_ENDPOINT s3 sync s3-static-files s3://$S3_BUCKET_STATIC_FILES
