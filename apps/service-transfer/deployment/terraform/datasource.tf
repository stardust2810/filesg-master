# ----------------------------------------
# STS Roles
# ----------------------------------------
data "aws_caller_identity" "current" {}

# ----------------------------------------
# API Gateway
# ----------------------------------------

data "aws_api_gateway_vpc_link" "main" {
  name = format("apigw-link-%s-%sezit-%s",
    var.project_code,
    var.env_name,
    "main"
  )
}

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
# API Gateway Log Group
# ----------------------------------------
data "aws_cloudwatch_log_group" "apigw_main" {
  name = format("log-%s-%sezit-apigw-main", var.project_code, var.env_name)
}

# ----------------------------------------
# NLB
# ----------------------------------------
data "aws_lb" "nlb_app_main" {
  name = format("nlb-%s-%sezapp-app-main", var.project_code, var.env_name)
}

# ----------------------------------------
# S3 Buckets
# ----------------------------------------
data "aws_s3_bucket" "stg" {
  bucket = format("s3-%s-%sezapp-file-%s",
    var.project_code,
    var.env_name == "local" ? "dev" : var.env_name,
    "stg"
  )
}

data "aws_s3_bucket" "stg_clean" {
  bucket = format("s3-%s-%sezapp-file-%s",
    var.project_code,
    var.env_name == "local" ? "dev" : var.env_name,
    "stg-clean"
  )
}

data "aws_s3_bucket" "main" {
  bucket = format("s3-%s-%sezapp-file-%s",
    var.project_code,
    var.env_name == "local" ? "dev" : var.env_name,
    "main"
  )
}

data "aws_s3_bucket" "static_files" {
  bucket = format("s3-%s-%sezapp-static-files",
    var.project_code,
    var.env_name == "local" ? "dev" : var.env_name
  )
}

# ----------------------------------------
# SQS Queues
# ----------------------------------------
data "aws_sqs_queue" "core_events" {
  count = var.env_name == "local" ? 0 : 1
  name = format("sqs-%s-%sezapp-core-events", var.project_code, var.env_name)
}

data "aws_sqs_queue" "transfer_events" {
  count = var.env_name == "local" ? 0 : 1
  name = format("sqs-%s-%sezapp-transfer-events", var.project_code, var.env_name)
}

