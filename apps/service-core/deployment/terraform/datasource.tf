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
# API Gateway Key
# # ----------------------------------------
# data "aws_api_gateway_api_key" "test" {
#   id = "5f6885k7id"
# }

# ----------------------------------------
# NLB
# ----------------------------------------
data "aws_lb" "nlb_app_main" {
  name = format("nlb-%s-%sezapp-app-main", var.project_code, var.env_name)
}

# ----------------------------------------
# RDS
# ----------------------------------------
data "aws_db_instance" "core" {
  count                  = var.env_name == "local" ? 0 : 1
  db_instance_identifier = format("rds-mysql-%s-%sezdb-core", var.project_code, var.env_name)
}

# ----------------------------------------
# Redis
# ----------------------------------------
data "aws_elasticache_replication_group" "redis" {
  count                = var.env_name == "local" ? 0 : 1
  replication_group_id = format("redis-%s-%sezdb-application", var.project_code, var.env_name)
}

# ----------------------------------------
# SQS
# ----------------------------------------
data "aws_sqs_queue" "core_events" {
  count = var.env_name == "local" ? 0 : 1
  name = format("sqs-%s-%sezapp-core-events", var.project_code, var.env_name)
}

data "aws_sqs_queue" "transfer_events" {
  count = var.env_name == "local" ? 0 : 1
  name = format("sqs-%s-%sezapp-transfer-events", var.project_code, var.env_name)
}

data "aws_sqs_queue" "email_notification" {
  count = var.env_name == "local" ? 0 : 1
  name = format("sqs-%s-%sezapp-ses-notification", var.project_code, var.env_name)
}
