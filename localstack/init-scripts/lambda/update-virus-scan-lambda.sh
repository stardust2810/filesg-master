#!/bin/bash

SCRIPT_DIR=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )

AWS_ENDPOINT=http://localhost:4566
LAMBDA_VIRUS_SCAN_SRC=virus-scan
LAMBDA_VIRUS_SCAN_ZIP=virus_scan.zip
LAMBDA_VIRUS_SCAN_FUNCTION_NAME=fsg-local-mock-virus-scan

# ==============================================================================
# Help
# ==============================================================================
usage () {
    cat <<HELP_USAGE

    $0  -t <type>

    -t  type (clean / virus)

HELP_USAGE
exit 1;
}

# ==============================================================================
# Main
# ==============================================================================
while getopts ":ht:" option; do
    case $option in
        t)
          TYPE=${OPTARG}
          ;;
        h)
          usage
          ;;
    esac
  done

if [ -z "${TYPE}" ]; then
  usage
fi

echo "########### Changing working directory ###########"
pushd $SCRIPT_DIR/$LAMBDA_VIRUS_SCAN_SRC

echo "########### Preparing lambda zip ###########"
cp virus-scan-$TYPE.js index.js

npm install

zip -qr $LAMBDA_VIRUS_SCAN_ZIP package.json index.js node_modules

echo "########### Updating lambda  ###########"
aws --endpoint=$AWS_ENDPOINT \
  lambda update-function-code \
  --function-name $LAMBDA_VIRUS_SCAN_FUNCTION_NAME \
  --zip-file fileb://$LAMBDA_VIRUS_SCAN_ZIP \
| jq ''

echo "########### Cleaning up ###########"
rm index.js
rm package-lock.json
rm -rf node_modules
rm $LAMBDA_VIRUS_SCAN_ZIP

popd
