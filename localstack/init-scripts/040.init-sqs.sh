#!/bin/bash
set -e

echo "########### Setting up SQS ###########"
# Create DLQ
aws --endpoint=$AWS_ENDPOINT sqs create-queue --queue-name $SQS_DLQ_SES_NOTIFICATION
aws --endpoint=$AWS_ENDPOINT sqs create-queue --queue-name $SQS_DLQ_TRANSFER_EVENTS
aws --endpoint=$AWS_ENDPOINT sqs create-queue --queue-name $SQS_DLQ_CORE_EVENTS

# Get DLQs' ARN
SQS_DLQ_SES_NOTIFICATION_ARN=$(aws --endpoint=$AWS_ENDPOINT sqs get-queue-attributes\
                  --attribute-name QueueArn --queue-url=$AWS_ENDPOINT/000000000000/"$SQS_DLQ_SES_NOTIFICATION"  --query 'Attributes.QueueArn' | tr -d '"')
SQS_DLQ_TRANSFER_EVENTS_ARN=$(aws --endpoint-url=$AWS_ENDPOINT sqs get-queue-attributes\
                  --attribute-name QueueArn --queue-url=$AWS_ENDPOINT/000000000000/"$SQS_DLQ_TRANSFER_EVENTS"  --query 'Attributes.QueueArn' | tr -d '"')
SQS_DLQ_CORE_EVENTS_ARN=$(aws --endpoint-url=$AWS_ENDPOINT sqs get-queue-attributes\
                  --attribute-name QueueArn --queue-url=$AWS_ENDPOINT/000000000000/"$SQS_DLQ_CORE_EVENTS" --query 'Attributes.QueueArn' | tr -d '"')

# Creating Source Queues
## Scanner Queue is to simulate Trendmicro virus scan service
aws --endpoint=$AWS_ENDPOINT sqs create-queue --queue-name $SQS_QUEUE_SCANNER
## this is to allow local lambda-postscan to receive the message
aws --endpoint=$AWS_ENDPOINT sqs create-queue --queue-name $SQS_QUEUE_LAMBDA_POSTSCAN
## SFTP queue
aws --endpoint=$AWS_ENDPOINT sqs create-queue --queue-name $SQS_QUEUE_SFTP_PROCESSOR --attributes '{"VisibilityTimeout": "1800"}'

aws --endpoint=$AWS_ENDPOINT sqs create-queue --queue-name $SQS_QUEUE_SES_NOTIFICATION \
     --attributes '{"RedrivePolicy": "{\"deadLetterTargetArn\":\"'$SQS_DLQ_SES_NOTIFICATION_ARN'\",\"maxReceiveCount\":\"'$SQS_MAXIMUM_RECEIVE_COUNT'\"}"}'
aws --endpoint-url=$AWS_ENDPOINT sqs create-queue --queue-name $SQS_QUEUE_TRANSFER_EVENTS \
     --attributes '{"RedrivePolicy": "{\"deadLetterTargetArn\":\"'$SQS_DLQ_TRANSFER_EVENTS_ARN'\",\"maxReceiveCount\":\"'$SQS_MAXIMUM_RECEIVE_COUNT'\"}"}'
aws --endpoint-url=$AWS_ENDPOINT sqs create-queue --queue-name $SQS_QUEUE_CORE_EVENTS \
     --attributes '{"RedrivePolicy": "{\"deadLetterTargetArn\":\"'$SQS_DLQ_CORE_EVENTS_ARN'\",\"maxReceiveCount\":\"'$SQS_MAXIMUM_RECEIVE_COUNT'\"}"}'

