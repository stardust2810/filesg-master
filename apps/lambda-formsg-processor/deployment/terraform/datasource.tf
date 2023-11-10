data "aws_caller_identity" "current" {}

# ----------------------------------------
# Subnet
# ----------------------------------------
data "aws_subnet" "app" {
  count = var.env_name == "local" ? 0 : length(local.az_list)

  tags = {
    Name = format("sub-%s-%s-%sezapp-app", local.az_alphabet_list[count.index], var.project_code, var.env_name)
  }
}

# ----------------------------------------
# Security Group
# ----------------------------------------
data "aws_security_group" "backend_lambda" {
  count = var.env_name == "local" ? 0 : 1
  name  = format("sgrp-%s-%sezapp-lambda-%s", var.project_code, var.env_name, var.service_name)
}

# ----------------------------------------
# API Gateway
# ----------------------------------------
data "aws_api_gateway_domain_name" "main" {
  domain_name = format("api.%s", var.domain_gov_sg)
}


# ----------------------------------------
# API Gateway WAF
# ----------------------------------------
data "aws_wafv2_web_acl" "apigw_main" {
  name = format("wafv2-%s-%sezit-%s",
    var.project_code,
    var.env_name,
    "apigw-main"
  )
  scope = "REGIONAL"
}

# ----------------------------------------
# SQS
# ----------------------------------------
data "aws_sqs_queue" "formsg_processor" {
  count = var.env_name == "local" ? 0 : 1
  name  = format("sqs-%s-%sezapp-formsg-processor", var.project_code, var.env_name)
}
# data "aws_sqs_queue" "dlq_lambda_sftp_processor" {
#   count = var.env_name == "local" ? 0 : 1
#   name  = format("sqs-%s-%sezapp-dlq-formsg-sftp-processor", var.project_code, var.env_name)
# }

# ----------------------------------------
# KMS
# ----------------------------------------
data "aws_kms_key" "sqs" {
  count = var.env_name == "local" ? 0 : 1
  key_id = format(
    "alias/kms-cmk-%s-%snana-sqs",
    var.project_code,
    var.env_name != "prd" ? "dev" : var.env_name
  )
}

# ----------------------------------------
# S3
# ----------------------------------------
data "aws_s3_bucket" "serverless_deployment" {
  count  = var.env_name == "local" ? 0 : 1
  bucket = format("s3-%s-%sezapp-serverless-deployment", var.project_code, var.env_name)
}

# ----------------------------------------
# EC2 Prefix List
# ----------------------------------------
data "aws_ec2_managed_prefix_list" "external_network" {
  count = var.env_name == "local" ? 0 : 1
  name  = format("pl-%s-*-cidr-external-network", var.project_code)
}

# ----------------------------------------
# API Gateway Log Group
# ----------------------------------------
data "aws_cloudwatch_log_group" "apigw_main" {
  name = format("log-%s-%sezit-apigw-main", var.project_code, var.env_name)
}
