#!/bin/bash
set -e

echo "########### Setting up Secrets Manager ###########"

echo "########### Added receiver private key ###########"
aws --endpoint=$AWS_ENDPOINT secretsmanager create-secret --name $SLIFT_RECEIVER_PFX_BASE64 --secret-string $SLIFT_RECEIVER_PFX_BASE64_VALUE

echo "########### Added receiver private key password ###########"
aws --endpoint=$AWS_ENDPOINT secretsmanager create-secret --name $SLIFT_RECEIVER_PFX_PASSWORD --secret-string $SLIFT_RECEIVER_PFX_PASSWORD_VALUE

echo "########### Added FileSG programmatic system integration user client secert ###########"
aws --endpoint=$AWS_ENDPOINT secretsmanager create-secret --name $FILESG_SYSTEM_INTEGRATION_CLIENT_SECRET --secret-string $FILESG_SYSTEM_INTEGRATION_CLIENT_SECRET_VALUE

echo "########### Added single issuance form secret ###########"
aws --endpoint=$AWS_ENDPOINT secretsmanager create-secret --name $FORMSG_SINGLE_ISSUANCE_FORM_SECRET --secret-string $FORMSG_SINGLE_ISSUANCE_FORM_SECRET_VALUE

echo "########### Added batch issuance form secret ###########"
aws --endpoint=$AWS_ENDPOINT secretsmanager create-secret --name $FORMSG_BATCH_ISSUANCE_FORM_SECRET --secret-string $FORMSG_BATCH_ISSUANCE_FORM_SECRET_VALUE

echo "########### Added recall transaction form secret ###########"
aws --endpoint=$AWS_ENDPOINT secretsmanager create-secret --name $FORMSG_RECALL_TRANSACTION_FORM_SECRET --secret-string $FORMSG_RECALL_TRANSACTION_FORM_SECRET_VALUE
