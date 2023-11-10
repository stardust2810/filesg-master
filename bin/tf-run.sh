#!/bin/bash

set -e;

TF_SUB_DIR=$1
ENV=$2
TERRAFORM_ACTION=$3

WORKING_DIR="$(pwd)"
TF_DIR="$WORKING_DIR/deployment/$TF_SUB_DIR"

# Ensure COMPARTMENT and ENV are passed
if [ -z "$TF_SUB_DIR" ];
then
  echo "No terraform subdirectory input provided."
  exit 1
fi

if [ ! -d "$TF_DIR" ]
then
  echo "Invalid terraform subdirectory provided."
  exit 1
fi

if [ ! -d "$TF_DIR/_env/$ENV" ]
then
  echo "Invalid environment provided."
  exit 1
fi

# Change directory to the compartment directory
cd "$TF_DIR"

case $TERRAFORM_ACTION in

  init)
    terraform init -reconfigure -backend-config="./_env/$ENV/.tfbackend" "${@:4}"
    ;;

  plan)
    terraform plan -var-file="./_env/$ENV/.tfvars" "${@:4}"
    ;;

  apply)
    terraform apply -var-file="./_env/$ENV/.tfvars" "${@:4}"
    ;;

  destroy)
    terraform destroy -var-file="./_env/$ENV/.tfvars" "${@:4}"
    ;;

  import)
    terraform import -var-file="./_env/$ENV/.tfvars" "${@:4}"
    ;;

  planout)
    terraform plan -var-file="./_env/$ENV/.tfvars" -out out.terraform "${@:4}"
    ;;

  applyout)
    terraform apply out.terraform
    ;;

  *)
    echo "Passing your arguments to Terraform command"
    terraform "${@:3}"
    ;;
esac
