
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
    {
      name  = "CORE_SERVICE_URL"
      value = local.core_service_url[var.env_name]
    },
    {
      name  = "TRANSFER_SERVICE_URL"
      value = local.transfer_service_url[var.env_name]
    },

    // AWS
    {
      name  = "AWS_REGION"
      value = var.region
    },
    {
      name  = "AWS_SQS_SFTP_PROCESSOR"
      value = var.env_name == "local" ? "http://localhost:4566/000000000000/sqs-fsg2-localezapp-sftp-processor" : data.aws_sqs_queue.sftp_processor[0].url
    },
    {
      name  = "AWS_S3_BUCKET_SFTP"
      value = format("s3-%s-%sezapp-sftp", var.project_code, var.env_name)
    },
    {
      name  = "AWS_IAM_SFTP_ROLE_ARN"
      value = local.iam_sftp_role_arn[var.env_name]
    },
    {
      name  = "AWS_STS_ASSUME_ROLE_SESSION_DURATION"
      value = 900
    },
    {
      name  = "LAMBDA_SFTP_PROCESSOR_EVENT_TRIGGER_SQS_ARN"
      value = local.lambda_sftp_processor_event_trigger_sqs_arn[var.env_name]
    },
    {
      name  = "LAMBDA_SFTP_PROCESSOR_IAM_ROLE"
      value = local.lambda_sftp_processor_iam_role[var.env_name]
    },
    {
      name  = "LAMBDA_SFTP_PROCESSOR_SQS_BATCH_SIZE"
      value = local.lambda_sftp_processor_sqs_batch_size[var.env_name]
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
    },
    {
      name  = "SLIFT_DIR"
      value = var.env_name == "local" ? "slift" : "/opt/slift"
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

  core_service_url = {
    local = "http://localhost:3001/api/core",
    dev   = "https://internal-alb-app-main.dev.file.gov.sg/api/core",
    stg   = "https://internal-alb-app-main.stg.file.gov.sg/api/core",
    uat   = "https://internal-alb-app-main.uat.file.gov.sg/api/core",
    prd   = "https://internal-alb-app-main.file.gov.sg/api/core",
  }

  transfer_service_url = {
    local = "http://localhost:3002/api/transfer",
    dev   = "https://internal-alb-app-main.dev.file.gov.sg/api/transfer",
    stg   = "https://internal-alb-app-main.stg.file.gov.sg/api/transfer",
    uat   = "https://internal-alb-app-main.uat.file.gov.sg/api/transfer",
    prd   = "https://internal-alb-app-main.file.gov.sg/api/transfer",
  }

  iam_sftp_role_arn = {
    local = "iam-role-fsg2-localezapp-admin"
    dev   = format("arn:aws:iam::%s:role/iam-role-%s-%sezapp-assume-sftp-processor", data.aws_caller_identity.current.account_id, var.project_code, var.env_name)
    sit   = format("arn:aws:iam::%s:role/iam-role-%s-%sezapp-assume-sftp-processor", data.aws_caller_identity.current.account_id, var.project_code, var.env_name)
    stg   = format("arn:aws:iam::%s:role/iam-role-%s-%sezapp-assume-sftp-processor", data.aws_caller_identity.current.account_id, var.project_code, var.env_name)
    uat   = format("arn:aws:iam::%s:role/iam-role-%s-%sezapp-assume-sftp-processor", data.aws_caller_identity.current.account_id, var.project_code, var.env_name)
    prd   = format("arn:aws:iam::%s:role/iam-role-%s-%sezapp-assume-sftp-processor", data.aws_caller_identity.current.account_id, var.project_code, var.env_name)
  }

  lambda_sftp_processor_event_trigger_sqs_arn = {
    local = "replaceme"
    dev   = var.env_name == "local" ? "" : data.aws_sqs_queue.sftp_processor[0].arn
    sit   = var.env_name == "local" ? "" : data.aws_sqs_queue.sftp_processor[0].arn
    stg   = var.env_name == "local" ? "" : data.aws_sqs_queue.sftp_processor[0].arn
    uat   = var.env_name == "local" ? "" : data.aws_sqs_queue.sftp_processor[0].arn
    prd   = var.env_name == "local" ? "" : data.aws_sqs_queue.sftp_processor[0].arn
  }
  lambda_sftp_processor_iam_role = {
    local = "iam-role-fsg2-localezapp-admin"
    dev   = format("arn:aws:iam::%s:role/iam-role-%s-%sezapp-lambda-sftp-processor", data.aws_caller_identity.current.account_id, var.project_code, var.env_name)
    sit   = format("arn:aws:iam::%s:role/iam-role-%s-%sezapp-lambda-sftp-processor", data.aws_caller_identity.current.account_id, var.project_code, var.env_name)
    stg   = format("arn:aws:iam::%s:role/iam-role-%s-%sezapp-lambda-sftp-processor", data.aws_caller_identity.current.account_id, var.project_code, var.env_name)
    uat   = format("arn:aws:iam::%s:role/iam-role-%s-%sezapp-lambda-sftp-processor", data.aws_caller_identity.current.account_id, var.project_code, var.env_name)
    prd   = format("arn:aws:iam::%s:role/iam-role-%s-%sezapp-lambda-sftp-processor", data.aws_caller_identity.current.account_id, var.project_code, var.env_name)
  }

  lambda_sftp_processor_sqs_batch_size = {
    local = 1
    dev   = 1
    sit   = 1
    stg   = 1
    uat   = 1
    prd   = 1
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
