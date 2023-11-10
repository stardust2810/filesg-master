#!/bin/bash
set -e

echo "########### Setting up Admin Role ###########"
aws --endpoint=$AWS_ENDPOINT iam create-role \
  --role-name $IAM_ROLE_ADMIN \
  --assume-role-policy-document file://$FILE_IAM_ADMIN_TRUST_POLICY

aws --endpoint=$AWS_ENDPOINT iam attach-role-policy \
  --role-name $IAM_ROLE_ADMIN \
  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess

echo "########### Setting up Lambda Role ###########"
aws --endpoint=$AWS_ENDPOINT iam create-role \
  --role-name $IAM_ROLE_LAMBDA \
  --assume-role-policy-document file://$FILE_IAM_LAMBDA_TRUST_POLICY

aws --endpoint=$AWS_ENDPOINT iam attach-role-policy \
  --role-name $IAM_ROLE_LAMBDA \
  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess

