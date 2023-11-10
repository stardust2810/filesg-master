
locals {
  parameter_list = [
    {
      name  = "ENV"
      value = var.env_name
    },
    {
      name  = "NODE_ENV"
      value = local.node_env_values[var.env_name]
    },
    {
      name  = "LOG_LEVEL"
      value = "debug"
    },
    {
      name  = "USE_LOCALSTACK"
      value = var.env_name == "local" ? "on" : "off"
    },
    // AWS
    {
      name  = "AWS_REGION"
      value = var.region
    },
    {
      name  = "AWS_S3_BUCKET_STG"
      value = format("s3-%s-%sezapp-file-stg", var.project_code, var.env_name)
    },
    {
      name  = "AWS_S3_BUCKET_STG_CLEAN"
      value = format("s3-%s-%sezapp-file-stg-clean", var.project_code, var.env_name)
    },
    {
      name  = "AWS_SQS_CORE_EVENTS"
      value = var.env_name == "local" ? "http://localhost:4566/000000000000/sqs-fsg2-localezapp-core-events" : data.aws_sqs_queue.core_events[0].url
    },
    {
      name  = "AWS_STS_ASSUME_ROLE_SESSION_DURATION"
      value = 900
    },
    {
      name  = "AWS_IAM_SCAN_MOVE_ROLE_ARN"
      value = local.iam_scan_move_role_arn[var.env_name]
    },
    {
      name  = "LAMBDA_POSTSCAN_IAM_ROLE"
      value = local.lambda_postscan_iam_role[var.env_name]
    },
    {
      name  = "LAMBDA_POSTSCAN_EVENT_TRIGGER_SNS_ARN"
      value = local.lambda_postscan_event_trigger_sns_arn[var.env_name]
    },
    {
      name  = "LAMBDA_POSTSCAN_DLQ_ARN"
      value = local.lambda_postscan_dlq_arn[var.env_name]
    },
    {
      name  = "LAMBDA_DEPLOYMENT_BUCKET"
      value = local.lambda_deployment_bucket[var.env_name]
    },
    {
      name  = "LAMBDA_APP_SUBNET_ID_1"
      value = local.lambda_app_subnet_id_1[var.env_name]
    },
    {
      name  = "LAMBDA_APP_SUBNET_ID_2"
      value = local.lambda_app_subnet_id_2[var.env_name]
    },
    {
      name  = "LAMBDA_SECURITY_GROUP_ID"
      value = local.lambda_security_group_id[var.env_name]
    }
  ]

  node_env_values = {
    local = "development"
    dev   = "production"
    sit   = "production"
    stg   = "production"
    uat   = "production"
    prd   = "production"
  }

  iam_scan_move_role_arn = {
    local = "iam-role-fsg2-localezapp-admin"
    dev   = format("arn:aws:iam::%s:role/iam-role-%s-%sezapp-scanmove", data.aws_caller_identity.current.account_id, var.project_code, var.env_name)
    sit   = format("arn:aws:iam::%s:role/iam-role-%s-%sezapp-scanmove", data.aws_caller_identity.current.account_id, var.project_code, var.env_name)
    stg   = format("arn:aws:iam::%s:role/iam-role-%s-%sezapp-scanmove", data.aws_caller_identity.current.account_id, var.project_code, var.env_name)
    uat   = format("arn:aws:iam::%s:role/iam-role-%s-%sezapp-scanmove", data.aws_caller_identity.current.account_id, var.project_code, var.env_name)
    prd   = format("arn:aws:iam::%s:role/iam-role-%s-%sezapp-scanmove", data.aws_caller_identity.current.account_id, var.project_code, var.env_name)
  }

  lambda_postscan_iam_role = {
    local = "iam-role-fsg2-localezapp-admin"
    dev   = format("arn:aws:iam::%s:role/iam-role-%s-%sezapp-lambda-postscan", data.aws_caller_identity.current.account_id, var.project_code, var.env_name)
    sit   = format("arn:aws:iam::%s:role/iam-role-%s-%sezapp-lambda-postscan", data.aws_caller_identity.current.account_id, var.project_code, var.env_name)
    stg   = format("arn:aws:iam::%s:role/iam-role-%s-%sezapp-lambda-postscan", data.aws_caller_identity.current.account_id, var.project_code, var.env_name)
    uat   = format("arn:aws:iam::%s:role/iam-role-%s-%sezapp-lambda-postscan", data.aws_caller_identity.current.account_id, var.project_code, var.env_name)
    prd   = format("arn:aws:iam::%s:role/iam-role-%s-%sezapp-lambda-postscan", data.aws_caller_identity.current.account_id, var.project_code, var.env_name)
  }
  lambda_postscan_event_trigger_sns_arn = {
    local = "replaceme"
    dev   = var.env_name == "local" ? "" : data.aws_cloudformation_stack.tm_fss_all[0].outputs.ScanResultTopicARN
    sit   = var.env_name == "local" ? "" : data.aws_cloudformation_stack.tm_fss_all[0].outputs.ScanResultTopicARN
    stg   = var.env_name == "local" ? "" : data.aws_cloudformation_stack.tm_fss_all[0].outputs.ScanResultTopicARN
    uat   = var.env_name == "local" ? "" : data.aws_cloudformation_stack.tm_fss_all[0].outputs.ScanResultTopicARN
    prd   = var.env_name == "local" ? "" : data.aws_cloudformation_stack.tm_fss_all[0].outputs.ScanResultTopicARN
  }
  lambda_postscan_dlq_arn = {
    local = "replaceme"
    dev   = var.env_name == "local" ? "" : data.aws_sqs_queue.dlq_lambda_postscan[0].arn
    sit   = var.env_name == "local" ? "" : data.aws_sqs_queue.dlq_lambda_postscan[0].arn
    stg   = var.env_name == "local" ? "" : data.aws_sqs_queue.dlq_lambda_postscan[0].arn
    uat   = var.env_name == "local" ? "" : data.aws_sqs_queue.dlq_lambda_postscan[0].arn
    prd   = var.env_name == "local" ? "" : data.aws_sqs_queue.dlq_lambda_postscan[0].arn
  }
  lambda_deployment_bucket = {
    local = "replaceme"
    dev   = var.env_name == "local" ? "" : data.aws_s3_bucket.serverless_deployment[0].id
    sit   = var.env_name == "local" ? "" : data.aws_s3_bucket.serverless_deployment[0].id
    stg   = var.env_name == "local" ? "" : data.aws_s3_bucket.serverless_deployment[0].id
    uat   = var.env_name == "local" ? "" : data.aws_s3_bucket.serverless_deployment[0].id
    prd   = var.env_name == "local" ? "" : data.aws_s3_bucket.serverless_deployment[0].id
  }
  lambda_app_subnet_id_1 = {
    local = "replaceme"
    dev   = var.env_name == "local" ? "" : data.aws_subnet.app[0].id
    sit   = var.env_name == "local" ? "" : data.aws_subnet.app[0].id
    stg   = var.env_name == "local" ? "" : data.aws_subnet.app[0].id
    uat   = var.env_name == "local" ? "" : data.aws_subnet.app[0].id
    prd   = var.env_name == "local" ? "" : data.aws_subnet.app[0].id
  }
  lambda_app_subnet_id_2 = {
    local = "replaceme"
    dev   = var.env_name == "local" ? "" : data.aws_subnet.app[1].id
    sit   = var.env_name == "local" ? "" : data.aws_subnet.app[1].id
    stg   = var.env_name == "local" ? "" : data.aws_subnet.app[1].id
    uat   = var.env_name == "local" ? "" : data.aws_subnet.app[1].id
    prd   = var.env_name == "local" ? "" : data.aws_subnet.app[1].id
  }
  lambda_security_group_id = {
    local = "replaceme"
    dev   = var.env_name == "local" ? "" : data.aws_security_group.backend_lambda[0].id
    sit   = var.env_name == "local" ? "" : data.aws_security_group.backend_lambda[0].id
    stg   = var.env_name == "local" ? "" : data.aws_security_group.backend_lambda[0].id
    uat   = var.env_name == "local" ? "" : data.aws_security_group.backend_lambda[0].id
    prd   = var.env_name == "local" ? "" : data.aws_security_group.backend_lambda[0].id
  }

  ssm_parameters = { for e in local.parameter_list : e.name => merge(var.parameter_config_defaults, e) }

  tags = {
    (var.service_name) = (var.env_name)
  }
}

resource "aws_ssm_parameter" "this" {
  for_each = local.ssm_parameters
  name     = format("/%s/%s/%s/%s", var.project_code, var.env_name, var.service_name, each.key)

  description     = each.value.description
  type            = each.value.type
  tier            = each.value.tier
  value           = each.value.value
  overwrite       = each.value.overwrite
  allowed_pattern = each.value.allowed_pattern
  data_type       = each.value.data_type
  tags            = local.tags
}
