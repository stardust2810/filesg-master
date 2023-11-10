# Not possible to use multiple stages for single API due to rest_api resource is the one taking in swagger json. Requires stages to be the one taking in swagger instead (https://github.com/hashicorp/terraform-provider-aws/issues/15634)
resource "aws_api_gateway_rest_api" "this" {

  for_each = local.api_gateway_info
  name = format("apigw-%s-%s%s%s-%s-%s",
    var.project_code,
    var.env_name,
    var.zone_name,
    "it",
    "main",
    each.key
  )

  # To override any value, can use cloudposse deep merge to override or add key/value (https://github.com/cloudposse/terraform-provider-utils)
  body = file(format("%s/%s", path.root, var.openapi_json_file_path))

  #   description              = var.description
  #   binary_media_types       = var.binary_media_types
  #   minimum_compression_size = var.minimum_compression_size
  #   api_key_source           = var.api_key_source

  endpoint_configuration {
    types = [each.value.type]
  }

  policy = each.value.type == "PRIVATE" ? data.aws_iam_policy_document.this_policy[each.key].json : null
  #   tags   = var.tags
}


resource "aws_api_gateway_deployment" "this" {
  for_each    = local.api_gateway_info
  rest_api_id = aws_api_gateway_rest_api.this[each.key].id

  triggers = {
    redeployment = sha1(jsonencode(aws_api_gateway_rest_api.this[each.key].body))
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_stage" "this" {
  for_each      = local.api_gateway_info
  deployment_id = aws_api_gateway_deployment.this[each.key].id
  rest_api_id   = aws_api_gateway_rest_api.this[each.key].id
  stage_name    = var.env_name

  variables = {
    backend_url = format("lb.%s/api/%s", var.domain_gov_sg, var.service_name)
    vpc_link_id = data.aws_api_gateway_vpc_link.main.id
  }

  access_log_settings {
    destination_arn = trimsuffix(data.aws_cloudwatch_log_group.apigw_main.arn, ":*")
    format = jsonencode(
      {
        caller         = "$context.identity.caller"
        httpMethod     = "$context.httpMethod"
        ip             = "$context.identity.sourceIp"
        protocol       = "$context.protocol"
        requestId      = "$context.requestId"
        requestTime    = "$context.requestTime"
        resourcePath   = "$context.resourcePath"
        responseLength = "$context.responseLength"
        status         = "$context.status"
        user           = "$context.identity.user"
      }
    )
  }

  xray_tracing_enabled = true
}

resource "aws_wafv2_web_acl_association" "this" {
  for_each     = local.api_gateway_info
  resource_arn = aws_api_gateway_stage.this[each.key].arn
  web_acl_arn  = data.aws_wafv2_web_acl.apigw_main.arn
}

resource "aws_api_gateway_method_settings" "all" {
  for_each    = local.api_gateway_info
  rest_api_id = aws_api_gateway_rest_api.this[each.key].id
  stage_name  = aws_api_gateway_stage.this[each.key].stage_name
  method_path = "*/*"

  settings {
    metrics_enabled = true
    logging_level   = "INFO"
  }
}

resource "aws_api_gateway_usage_plan" "this" {
  for_each = local.api_gateway_info
  name = format("apigw-%s-%s%s%s-%s-%s",
    var.project_code,
    var.env_name,
    var.zone_name,
    "it",
    "main",
    var.service_name
  )
  # description  = "my description"
  # product_code = "MYCODE"

  api_stages {
    api_id = aws_api_gateway_rest_api.this[each.key].id
    stage  = aws_api_gateway_stage.this[each.key].stage_name
  }

  quota_settings {
    limit  = 7000
    offset = 2
    period = "WEEK"
  }

  throttle_settings {
    burst_limit = 1000
    rate_limit  = 100
  }
}

# resource "aws_api_gateway_usage_plan_key" "this" {
#   key_id        = data.aws_api_gateway_api_key.test.id
#   key_type      = "API_KEY"
#   usage_plan_id = aws_api_gateway_usage_plan.this[each.key].id
# }

# ----------------------------------------
# Only for public API 
# ----------------------------------------
resource "aws_api_gateway_base_path_mapping" "this_public" {
  for_each = {
    for name, info in local.api_gateway_info : name => info
    if info.type != "PRIVATE"
  }
  api_id      = aws_api_gateway_rest_api.this[each.key].id
  stage_name  = aws_api_gateway_stage.this[each.key].stage_name
  domain_name = data.aws_api_gateway_domain_name.main.domain_name
  base_path   = var.service_name
}

# ----------------------------------------
# Only for private API
# ----------------------------------------
data "aws_iam_policy_document" "this_policy" {
  for_each = {
    for name, info in local.api_gateway_info : name => info
    if info.type == "PRIVATE"
  }
  statement {
    sid    = "AllowAPIInvocation"
    effect = "Allow"
    principals {
      type        = "*"
      identifiers = ["*"]
    }
    actions = [
      "execute-api:Invoke",
    ]
    resources = [
      "execute-api:/*"
    ]
  }

  statement {
    sid    = "DenyInvocationFromUnauthoriseVpcAndIp"
    effect = "Deny"
    principals {
      type        = "*"
      identifiers = ["*"]
    }
    actions = [
      "execute-api:Invoke",
    ]
    resources = [
      "execute-api:/*"
    ]
    condition {
      test     = "StringNotEquals"
      variable = "aws:sourceVpce"
      values   = values(each.value.policy_whitelist_vpce[var.env_name])
    }
  }
}
