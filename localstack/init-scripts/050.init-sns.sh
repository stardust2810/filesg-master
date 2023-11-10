#!/bin/bash
set -e

echo "########### Setting up SNS ###########"
aws --endpoint=$AWS_ENDPOINT sns create-topic --name $SNS_TOPIC_SCAN_RESULT
