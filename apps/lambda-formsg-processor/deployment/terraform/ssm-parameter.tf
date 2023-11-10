
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
    {
      name  = "EVENT_LOGS_SERVICE_URL"
      value = local.event_logs_service_url[var.env_name]
    },

    // AWS
    {
      name  = "AWS_REGION"
      value = var.region
    },
    {
      name  = "AWS_SQS_FORMSG_PROCESSOR"
      value = var.env_name == "local" ? "http://localhost:4566/000000000000/sqs-fsg2-localezapp-formsg-processor" : data.aws_sqs_queue.formsg_processor[0].url
    },
    # {
    #   name  = "AWS_IAM_FORMSG_ROLE_ARN"
    #   value = local.iam_formsg_role_arn[var.env_name]
    # },
    # {
    #   name  = "AWS_STS_ASSUME_ROLE_SESSION_DURATION"
    #   value = 900
    # },
    {
      name  = "LAMBDA_FORMSG_PROCESSOR_EVENT_TRIGGER_SQS_ARN"
      value = local.lambda_formsg_processor_event_trigger_sqs_arn[var.env_name]
    },
    {
      name  = "LAMBDA_FORMSG_PROCESSOR_IAM_ROLE"
      value = local.lambda_formsg_processor_iam_role[var.env_name]
    },
    {
      name  = "LAMBDA_FORMSG_PROCESSOR_SQS_BATCH_SIZE"
      value = local.lambda_formsg_processor_sqs_batch_size[var.env_name]
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
      name  = "FILESG_SYSTEM_INTEGRATION_CLIENT_ID"
      value = local.filesg_system_integration_client_id[var.env_name]
    },
    {
      name  = "FORMSG_SINGLE_ISSUANCE_FORM_ID"
      value = local.formsg_single_issuance_form_id[var.env_name]
    },
    {
      name  = "FORMSG_BATCH_ISSUANCE_FORM_ID"
      value = local.formsg_batch_issuance_form_id[var.env_name]
    },
    {
      name  = "FORMSG_RECALL_TRANSACTION_FORM_ID"
      value = local.formsg_recall_transaction_form_id[var.env_name]
    },
    {
      name  = "FORMSG_SINGLE_ISSUANCE_WEBHOOK_URL"
      value = local.formsg_single_issuance_webhook_url[var.env_name]
    },
    {
      name  = "FORMSG_BATCH_ISSUANCE_WEBHOOK_URL"
      value = local.formsg_batch_issuance_webhook_url[var.env_name]
    },
    {
      name  = "FORMSG_RECALL_TRANSACTION_WEBHOOK_URL"
      value = local.formsg_recall_transaction_webhook_url[var.env_name]
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

  event_logs_service_url = {
    local = "http://localhost:3005/api/event-logs",
    dev   = "https://internal-alb-app-main.dev.file.gov.sg/api/event-logs",
    stg   = "https://internal-alb-app-main.stg.file.gov.sg/api/event-logs",
    uat   = "https://internal-alb-app-main.uat.file.gov.sg/api/event-logs",
    prd   = "https://internal-alb-app-main.file.gov.sg/api/event-logs",
  }

  # iam_formsg_role_arn = {
  #   local = "iam-role-fsg2-localezapp-admin"
  #   dev   = format("arn:aws:iam::%s:role/iam-role-%s-%sezapp-assume-formsg-processor", data.aws_caller_identity.current.account_id, var.project_code, var.env_name)
  #   sit   = format("arn:aws:iam::%s:role/iam-role-%s-%sezapp-assume-formsg-processor", data.aws_caller_identity.current.account_id, var.project_code, var.env_name)
  #   stg   = format("arn:aws:iam::%s:role/iam-role-%s-%sezapp-assume-formsg-processor", data.aws_caller_identity.current.account_id, var.project_code, var.env_name)
  #   uat   = format("arn:aws:iam::%s:role/iam-role-%s-%sezapp-assume-formsg-processor", data.aws_caller_identity.current.account_id, var.project_code, var.env_name)
  #   prd   = format("arn:aws:iam::%s:role/iam-role-%s-%sezapp-assume-formsg-processor", data.aws_caller_identity.current.account_id, var.project_code, var.env_name)
  # }

  lambda_formsg_processor_event_trigger_sqs_arn = {
    local = "replaceme"
    dev   = var.env_name == "local" ? "" : data.aws_sqs_queue.formsg_processor[0].arn
    sit   = var.env_name == "local" ? "" : data.aws_sqs_queue.formsg_processor[0].arn
    stg   = var.env_name == "local" ? "" : data.aws_sqs_queue.formsg_processor[0].arn
    uat   = var.env_name == "local" ? "" : data.aws_sqs_queue.formsg_processor[0].arn
    prd   = var.env_name == "local" ? "" : data.aws_sqs_queue.formsg_processor[0].arn
  }

  lambda_formsg_processor_iam_role = {
    local = "iam-role-fsg2-localezapp-admin"
    dev   = format("arn:aws:iam::%s:role/iam-role-%s-%sezapp-lambda-formsg-processor", data.aws_caller_identity.current.account_id, var.project_code, var.env_name)
    sit   = format("arn:aws:iam::%s:role/iam-role-%s-%sezapp-lambda-formsg-processor", data.aws_caller_identity.current.account_id, var.project_code, var.env_name)
    stg   = format("arn:aws:iam::%s:role/iam-role-%s-%sezapp-lambda-formsg-processor", data.aws_caller_identity.current.account_id, var.project_code, var.env_name)
    uat   = format("arn:aws:iam::%s:role/iam-role-%s-%sezapp-lambda-formsg-processor", data.aws_caller_identity.current.account_id, var.project_code, var.env_name)
    prd   = format("arn:aws:iam::%s:role/iam-role-%s-%sezapp-lambda-formsg-processor", data.aws_caller_identity.current.account_id, var.project_code, var.env_name)
  }

  lambda_formsg_processor_sqs_batch_size = {
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

  filesg_system_integration_client_id = {
    local = "programmaticuser-1690875074989-de131f30226e6060"
    dev   = "programmaticuser-1690875074989-de131f30226e6060"
    sit   = "replaceme"
    stg   = "programmaticuser-1690875074989-de131f30226e6060"
    uat   = "programmaticuser-1690875074989-de131f30226e6060"
    prd   = "programmaticuser-1690875074989-de131f30226e6060"
  }

  formsg_single_issuance_form_id = {
    local = "64c3227a6dd36a0011c41fb4"
    dev   = "64c3227a6dd36a0011c41fb4"
    sit   = "replaceme"
    stg   = "6502a7712ccd0f0012236b77"
    uat   = "6502a7061ba0ca0012f04682"
    prd   = "6502a7833f8acf00127bfcfa"
  }

  formsg_single_issuance_webhook_url = {
    local = "https://api.dev.file.gov.sg/formsg/handler?type=single-issuance"
    dev   = "https://api.dev.file.gov.sg/formsg/handler?type=single-issuance"
    sit   = "replaceme"
    stg   = "https://api.stg.file.gov.sg/formsg/handler?type=single-issuance"
    uat   = "https://api.uat.file.gov.sg/formsg/handler?type=single-issuance"
    prd   = "https://api.file.gov.sg/formsg/handler?type=single-issuance"
  }

  formsg_batch_issuance_form_id = {
    local = "64c391ab6dd36a0011d95017"
    dev   = "64c391ab6dd36a0011d95017"
    sit   = "replaceme"
    stg   = "651e151af4c4850011224d32"
    uat   = "651d206557d7aa0012a62557"
    prd   = "651e156df4c4850011225fc4"
  }

  formsg_batch_issuance_webhook_url = {
    local = "https://api.dev.file.gov.sg/formsg/handler?type=batch-issuance"
    dev   = "https://api.dev.file.gov.sg/formsg/handler?type=batch-issuance"
    sit   = "replaceme"
    stg   = "https://api.stg.file.gov.sg/formsg/handler?type=batch-issuance"
    uat   = "https://api.uat.file.gov.sg/formsg/handler?type=batch-issuance"
    prd   = "https://api.file.gov.sg/formsg/handler?type=batch-issuance"
  }

  formsg_recall_transaction_form_id = {
    local = "6507b1bce3fae000110f3e6d"
    dev   = "6507b1bce3fae000110f3e6d"
    sit   = "replaceme"
    stg   = "652392baa735be001130442f"
    uat   = "65239256231ed100113db3c8"
    prd   = "652392d68969da00124eb316"
  }

  formsg_recall_transaction_webhook_url = {
    local = "https://api.dev.file.gov.sg/formsg/handler?type=recall-transaction"
    dev   = "https://api.dev.file.gov.sg/formsg/handler?type=recall-transaction"
    sit   = "replaceme"
    stg   = "https://api.stg.file.gov.sg/formsg/handler?type=recall-transaction"
    uat   = "https://api.uat.file.gov.sg/formsg/handler?type=recall-transaction"
    prd   = "https://api.file.gov.sg/formsg/handler?type=recall-transaction"
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
