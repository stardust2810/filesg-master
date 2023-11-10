#!/bin/bash
set -e

echo "########### Setting up localstack profile ###########"
aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID --profile=$AWS_PROFILE
aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY --profile=$AWS_PROFILE
aws configure set region $AWS_REGION --profile=$AWS_PROFILE

echo "########### Setting default profile ###########"
export AWS_DEFAULT_PROFILE=$AWS_PROFILE

echo "########### Changing working directory ###########"
pushd /docker-entrypoint-initaws.d
