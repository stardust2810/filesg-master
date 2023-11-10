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
# SQS
# ----------------------------------------
data "aws_sqs_queue" "dlq_lambda_doc_encryption" {
  count = var.env_name == "local" ? 0 : 1
  name  = format("sqs-%s-%sezapp-dlq-lambda-doc-encryption", var.project_code, var.env_name)
}


# ----------------------------------------
# Cloudformation
# ----------------------------------------
data "aws_cloudformation_stack" "tm_fss_all" {
  count = var.env_name == "local" ? 0 : 1
  name  = format("cfn-%s-%sezapp-tm-fss-all", var.project_code, var.env_name)
}

# ----------------------------------------
# S3
# ----------------------------------------
data "aws_s3_bucket" "serverless_deployment" {
  count  = var.env_name == "local" ? 0 : 1
  bucket = format("s3-%s-%sezapp-serverless-deployment", var.project_code, var.env_name)
}
