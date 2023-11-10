#!/bin/bash
set -e

echo "########### Init S3 Event Notification ###########"
aws --endpoint=$AWS_ENDPOINT s3api put-bucket-notification-configuration \
  --bucket $S3_BUCKET_STG \
  --notification-configuration file://$FILE_S3_FILE_NOTIFICATION_CONFIG

aws --endpoint=$AWS_ENDPOINT s3api put-bucket-notification-configuration \
  --bucket $S3_BUCKET_SFTP \
  --notification-configuration file://$FILE_S3_SFTP_NOTIFICATION_CONFIG
