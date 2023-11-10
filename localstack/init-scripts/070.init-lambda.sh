#!/bin/bash
set -e

echo "########### Setting up (mock) VirusScan Lambda ###########"

echo "########### Changing working directory ###########"
pushd $LAMBDA_VIRUS_SCAN_SRC

echo "########### Preparing lambda zip ###########"
cp $LAMBDA_VIRUS_SCAN_SRC_FILE index.js

npm install

zip -qr $LAMBDA_VIRUS_SCAN_ZIP package.json index.js node_modules

echo "########### Creating Lambda ###########"
aws --endpoint=$AWS_ENDPOINT lambda create-function \
  --function-name $LAMBDA_VIRUS_SCAN_FUNCTION_NAME \
  --zip-file fileb://$LAMBDA_VIRUS_SCAN_ZIP \
  --handler index.handler \
  --runtime nodejs16.x \
  --role arn:aws:iam::000000000000:role/$IAM_ROLE_LAMBDA

aws --endpoint=$AWS_ENDPOINT lambda create-event-source-mapping \
  --function-name $LAMBDA_VIRUS_SCAN_FUNCTION_NAME  \
  --batch-size 10 \
  --event-source-arn arn:aws:sqs:$AWS_REGION:000000000000:$SQS_QUEUE_SCANNER

echo "########### Cleaning up ###########"
rm index.js
rm package-lock.json
rm -rf node_modules
rm $LAMBDA_VIRUS_SCAN_ZIP

echo "########### Changing back to orginal working directory ###########"
popd
