
locals {
  parameter_list = [
    // system
    {
      name  = "ENV"
      value = var.env_name
    },
    {
      name  = "NODE_ENV"
      value = local.node_env_values[var.env_name]
    },
    {
      name  = "APP_NAME"
      value = "FileSG Event Logs Service"
    },
    {
      name  = "APP_VERSION"
      value = "1.0.0"
    },
    {
      name  = "SERVICE_NAME"
      value = var.service_name
    },
    {
      name  = "PORT"
      value = local.port[var.env_name]
    },
    {
      name  = "LOG_LEVEL"
      value = local.log_level[var.env_name]
    },
    // aws
    {
      name  = "AWS_REGION"
      value = var.region
    },
    {
      name  = "USE_LOCALSTACK"
      value = var.env_name == "local" ? "on" : "off"
    },
    {
      name  = "FORMSG_TXN_EVENT_LOGS_DDB_TABLE_NAME"
      value = aws_dynamodb_table.formsg_transaction.name
    },
    {
      name  = "AWS_SQS_CORE_EVENTS"
      value = var.env_name == "local" ? "http://localhost:4566/000000000000/sqs-fsg2-localezapp-core-events" : data.aws_sqs_queue.core_events[0].url
    },
  ]

  port = {
    local = 3005
    dev   = 3000
    sit   = 3000
    stg   = 3000
    uat   = 3000
    prd   = 3000
  }

  node_env_values = {
    local = "development"
    dev   = "development"
    sit   = "development"
    stg   = "development"
    uat   = "development"
    prd   = "production"
  }

  log_level = {
    local = "debug"
    dev   = "debug"
    sit   = "debug"
    stg   = "debug"
    uat   = "debug"
    prd   = "info"
  }

  email_sender_address = {
    local = "no-reply@dev.file.gov.sg"
    dev   = "no-reply@dev.file.gov.sg"
    sit   = "no-reply@sit.file.gov.sg"
    stg   = "no-reply@stg.file.gov.sg"
    uat   = "no-reply@uat.file.gov.sg"
    prd   = "no-reply@file.gov.sg"
  }

  email_toggle_send = {
    local = "off"
    dev   = "on"
    sit   = "on"
    stg   = "on"
    uat   = "on"
    prd   = "on"
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
