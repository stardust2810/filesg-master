#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e


SERVICE_NAME=$1
ENV=$2
NODE_MAIN_JS_FILE=${3:-"main.js"} # if parameter is not specified, use main.js which is the default for all backend api

echo "SERVICE_NAME = $SERVICE_NAME";
echo "ENV = $ENV";
echo "NODE_MAIN_JS_FILE = $NODE_MAIN_JS_FILE";

./scripts/get-env-variables.sh "$SERVICE_NAME" "$ENV"

echo "Starting server up"
node --trace-warnings "$NODE_MAIN_JS_FILE"
