
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
      value = "FileSG Management Service"
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
    // redis
    {
      name  = "REDIS_HOST"
      value = local.redis_host[var.env_name]
    },
    {
      name  = "REDIS_PORT"
      value = 6379
    },
    {
      name  = "REDIS_NAME"
      value = "redis_name"
    },
    // aws
    {
      name  = "AWS_S3_BUCKET_FILE_STG"
      value = format("s3-%s-%sezapp-file-stg", var.project_code, var.env_name)
    },
    {
      name  = "AWS_S3_BUCKET_FILE_STG_CLEAN"
      value = format("s3-%s-%sezapp-file-stg-clean", var.project_code, var.env_name)
    },
    {
      name  = "AWS_S3_BUCKET_FILE_MAIN"
      value = format("s3-%s-%sezapp-file-main", var.project_code, var.env_name)
    },
    {
      name  = "USE_LOCALSTACK"
      value = var.env_name == "local" ? "on" : "off"
    },
  ]

  port = {
    local = 3003
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

  redis_host = {
    local = "127.0.0.1"
    dev   = var.env_name == "local" ? "" : data.aws_elasticache_replication_group.redis[0].configuration_endpoint_address
    sit   = var.env_name == "local" ? "" : data.aws_elasticache_replication_group.redis[0].configuration_endpoint_address
    stg   = var.env_name == "local" ? "" : data.aws_elasticache_replication_group.redis[0].configuration_endpoint_address
    uat   = var.env_name == "local" ? "" : data.aws_elasticache_replication_group.redis[0].configuration_endpoint_address
    prd   = var.env_name == "local" ? "" : data.aws_elasticache_replication_group.redis[0].configuration_endpoint_address
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
