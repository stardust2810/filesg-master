#!/bin/bash
set -e

echo $AWS_PROFILE

echo "########### Init SNS Subscription ###########"
aws --endpoint=$AWS_ENDPOINT sns subscribe \
  --topic-arn arn:aws:sns:$AWS_REGION:000000000000:$SNS_TOPIC_SCAN_RESULT \
  --protocol sqs \
  --notification-endpoint arn:aws:sqs:$AWS_REGION:000000000000:$SQS_QUEUE_LAMBDA_POSTSCAN \
  --attributes RawMessageDelivery=true

