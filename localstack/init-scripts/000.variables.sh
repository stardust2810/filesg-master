#!/bin/bash
set -e

# ==============================================================================
# FILES
# ==============================================================================
export FILE_IAM_ADMIN_TRUST_POLICY=iam-role-policy/admin-iam-role-trust-policy.json
export FILE_IAM_LAMBDA_TRUST_POLICY=iam-role-policy/lambda-iam-role-trust-policy.json
export FILE_S3_FILE_NOTIFICATION_CONFIG=s3-event-notification-config/s3-fsg2-localezapp-file-stg-notification-config.json
export FILE_S3_SFTP_NOTIFICATION_CONFIG=s3-event-notification-config/s3-fsg2-localezapp-sftp-notification-config.json

# ==============================================================================
# AWS
# ==============================================================================
export AWS_REGION=ap-southeast-1
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_PROFILE=localstack
export AWS_ENDPOINT=http://localhost:4566

# ==============================================================================
# IAM
# ==============================================================================
export IAM_ROLE_ADMIN=iam-role-fsg2-localezapp-admin
export IAM_ROLE_LAMBDA=iam-role-fsg2-localezapp-lambda

# ==============================================================================
# S3
# ==============================================================================
export S3_BUCKET_STG=s3-fsg2-localezapp-file-stg
export S3_BUCKET_STG_CLEAN=s3-fsg2-localezapp-file-stg-clean
export S3_BUCKET_MAIN=s3-fsg2-localezapp-file-main
export S3_BUCKET_STATIC_FILES=s3-fsg2-localezapp-static-files
export S3_BUCKET_SFTP=s3-fsg2-localezapp-sftp

# ==============================================================================
# SQS
# ==============================================================================
export SQS_MAXIMUM_RECEIVE_COUNT=3

export SQS_QUEUE_SES_NOTIFICATION=sqs-fsg2-localezapp-ses-notification
export SQS_DLQ_SES_NOTIFICATION=sqs-fsg2-localezapp-dlq-ses-notification
export SQS_QUEUE_TRANSFER_EVENTS=sqs-fsg2-localezapp-transfer-events
export SQS_DLQ_TRANSFER_EVENTS=sqs-fsg2-localezapp-dlq-transfer-events
export SQS_QUEUE_CORE_EVENTS=sqs-fsg2-localezapp-core-events
export SQS_DLQ_CORE_EVENTS=sqs-fsg2-localezapp-dlq-core-events
export SQS_QUEUE_SCANNER=sqs-fsg2-localezapp-ScannerQueue
export SQS_QUEUE_LAMBDA_POSTSCAN=sqs-fsg2-localezapp-lambda-postscan
export SQS_QUEUE_SFTP_PROCESSOR=sqs-fsg2-localezapp-sftp-processor

# ==============================================================================
# SNS
# ==============================================================================
export SNS_TOPIC_SCAN_RESULT=sns-fsg2-localezapp-ScanResultTopic

# ==============================================================================
# LAMBDA
# ==============================================================================
export LAMBDA_VIRUS_SCAN_SRC=lambda/virus-scan
export LAMBDA_VIRUS_SCAN_ZIP=virus_scan.zip
export LAMBDA_VIRUS_SCAN_FUNCTION_NAME=fsg-local-mock-virus-scan
export LAMBDA_VIRUS_SCAN_SRC_FILE=virus-scan-clean.js

# ==============================================================================
# SecretsManager
# ==============================================================================
# SFTP
export const SLIFT_RECEIVER_PFX_BASE64=fsg2/SLIFT_RECEIVER_PFX_BASE64
export const SLIFT_RECEIVER_PFX_BASE64_VALUE=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
export const SLIFT_RECEIVER_PFX_PASSWORD=fsg2/SLIFT_RECEIVER_PFX_PASSWORD
export const SLIFT_RECEIVER_PFX_PASSWORD_VALUE=iSFsVpQC3MNZrwou

# FormSG
export const FILESG_SYSTEM_INTEGRATION_CLIENT_SECRET=fsg2/FILESG_SYSTEM_INTEGRATION_CLIENT_SECRET
export const FILESG_SYSTEM_INTEGRATION_CLIENT_SECRET_VALUE=e64d94da49bf769cf409b77f9a77525d

export const FORMSG_SINGLE_ISSUANCE_FORM_SECRET=fsg2/local/FORMSG_SINGLE_ISSUANCE_FORM_SECRET
export const FORMSG_SINGLE_ISSUANCE_FORM_SECRET_VALUE=Z+qnZ2rjzl0Hc0WTl40ZztEhvSwgn3nxd369CouPY4I=

export const FORMSG_BATCH_ISSUANCE_FORM_SECRET=fsg2/local/FORMSG_BATCH_ISSUANCE_FORM_SECRET
export const FORMSG_BATCH_ISSUANCE_FORM_SECRET_VALUE=9GPu0hsl0hcIs67JKxrec2Jv2kLidumopnLbqKn/Me8=

export const FORMSG_RECALL_TRANSACTION_FORM_SECRET=fsg2/local/FORMSG_RECALL_TRANSACTION_FORM_SECRET
export const FORMSG_RECALL_TRANSACTION_FORM_SECRET_VALUE=IibgtpbWgsDxYYUPIwi1TMa8kqTd7v1UuOl3C11x/gE=

