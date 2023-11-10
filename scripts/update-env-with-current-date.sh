#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e


PATH_TO_ENV=$1

echo "Updating $1 with current date as REACT_APP_LAST_BUILT_AT"
echo window.__ENV = `cat $1 | sed 's/window.__ENV = //' | sed 's/;//' | jq ". += { \"REACT_APP_LAST_BUILT_AT\": $(date +"%s")}" | jq -r tostring` > $1

