#!/bin/bash

usage() {
  echo "";
  echo ">> Usage <<"
  echo "";
  echo "[[ Running as npm command ]]";
  echo "npm run env:get ENV";
  echo "Example: npm run env:get dev";
  echo "";
  echo "[[ Running as bash script execution ]]";
  echo "./get-env-variables.sh SERVICE_NAME ENV";
  echo "Example: ./get-env-variables.sh core dev";
  echo "";
  echo "Valid values for SERVICE_NAME e.g. core, transfer, mgmt";
  echo "Valid values for ENV e.g. local, dev, stg, prd";
  echo "";
}

set -e

SERVICE_NAME=$1
ENV=$2

echo "SERVICE_NAME = ${SERVICE_NAME}";
echo "ENV = ${ENV}";

if [[ -z "$SERVICE_NAME" ||  -z "$ENV" ]];
then
  echo "";
  echo "One or more required parameters are undefined";
  usage;
  exit 1;
fi

if [[ !(
    ($ENV == "local") || \
    ($ENV == "dev") || \
    ($ENV == "sit") || \
    ($ENV == "stg") || \
    ($ENV == "uat") || \
    ($ENV == "prd") \
    ) ]]; then
    echo "Invalid environment specified: $ENV"
    exit 1;
else
    echo -e "\nRetrieving env for $ENV\n"
fi

# Rename .env file to .env.bak if it exists
if [[ -f .env ]]; then
  echo "";
  echo "Existing .env file saved in .env.bak file and overwritten";
  if [[ -f .env.bak ]]; then
    echo "Existing .env.bak will be replaced with existing .env file's content";
  fi
  echo "";
fi;

find . -maxdepth 1 -type f -name .env -exec mv {} {}.bak \;

# Get all SSM parameters and filter by tag key and value
ssm_params=$(aws ssm describe-parameters --parameter-filters "Key=tag:${SERVICE_NAME},Values=${ENV}");
ssm_params_count=$(echo "$ssm_params" | jq '.Parameters | length')
echo "Total parameters retrieved: $ssm_params_count"

# Retrieve SSM parameter names
ssm_names=$(jq -rc ".Parameters[] | .Name"<<< "${ssm_params}");

# Get all secrets in secrets manager and filter by tag key and value. Filter for env uses contains logic, as there may be secrets that is shared across multiple environment.
# Note that sharing is not implemented for parameters, as the value can be easily managed in terraform, thus replication is not an issue.
# Do not use ENV as arg for jq 1.6, it is a reserve key word
secrets_manager_params=$(aws secretsmanager list-secrets | jq --arg SERVICE_NAME "$SERVICE_NAME" --arg ENVIRONMENT "$ENV" '{"SecretList": [. | .SecretList[] | select(.Tags != null) | select(.Tags[] | (.Key=="\($SERVICE_NAME)") and (.Value | contains("\($ENVIRONMENT)"))) | .]}');
secrets_manager_params_count=$(echo "$secrets_manager_params" | jq '.SecretList | length')
echo "Total secrets retrieved: $secrets_manager_params_count"

# For each secret retrieved from Secrets Manager, "/aws/reference/secretsmanager/" is concatenated to the start of variable and double forward slash is replaced with single forward slash.
# This is because, when retrieving a Secrets Manager secret from Parameter Store, the name must begin with the following reserved path: /aws/reference/secretsmanager/secret_ID_in_Secrets_Manager.
secrets_name=$(jq -rc ".SecretList[] | (\"/aws/reference/secretsmanager/\" + .Name)"<<< "${secrets_manager_params}" | tr -s /);

# Convert variables into an array
stringarray=($ssm_names $secrets_name);

# Find length of array
arraylen=${#stringarray[@]};

# GetParameters API has limit of 10 parameter names per API call
# Find out how many iterations of GetParameters required
# If total of 10 variables, then only loop once
subarraymax=10 # Limit of GetParameters
loop=$(( ( arraylen / subarraymax ) + ( arraylen % subarraymax > 0 ) )) # Getting ceiling rounding (https://www.baeldung.com/linux/round-divided-number)
# if [ "$arraylen" -lt $subarraymax ]; then
#   loop=0;
# fi

if (( arraylen<=0 )); then
  echo "";
  echo "No parameters or secrets found";
  exit 1;
fi

echo "Writing into .env file";
for (( i=0; i<loop; i++ )); do
    # Get up to 10 varaibles from the array e.g. stringarray[@]:0:10  stringarray[@]:10:10
    # stringarray[@]:start:no_of_elements syntax refers slicing the array start from position $start, and getting $no_of_elements from the array. Note that the second digit is not referring to the end position of the array to slice
    # Even though we get 10 element every loop, the last round with less than 10 element will still returning the exact element left over
    subarray_start=$((i*subarraymax))
    subarray=${stringarray[*]:subarray_start:subarraymax};

    # Get value of variables
    var_details=$(aws ssm get-parameters --names $subarray --with-decryption | jq '.Parameters');

    # Write into .env file
    for s in $(echo "$var_details" | jq -r '.[] | @base64'); do
        _jq() {
          echo "$s" | base64 --decode | jq -r "$1"
        }

        name=$(_jq '.Name' | awk -F "/" '{print $NF}');
        value=$(_jq '.Value');
        echo "$name=$value" >> .env;
    done
done
var_count=$(wc -l < .env | xargs) # xargs trim away the whitespace
echo "Writing into .env file completed with ${var_count:-0} line";
