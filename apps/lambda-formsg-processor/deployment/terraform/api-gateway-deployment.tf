/**
* Ref:
* https://medium.com/@pranaysankpal/aws-api-gateway-proxy-for-sqs-simple-queue-service-5b08fe18ce50
* https://blog.pocketgalaxy.io/posts/2021-09-19-api-gateway-sqs-integration.html
* https://gist.github.com/nmiguelmoura/7b990d091a2c1b6537b7984ee351348a
* https://repost.aws/knowledge-center/api-gateway-rest-api-sqs-errors
* https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-mapping-template-reference.html
* https://github.com/serverless-operations/serverless-apigateway-service-proxy/issues/45
* https://medium.com/@thehouseofcards/fixing-a-common-gotcha-in-aws-api-gateway-integration-with-sqs-d857f65179b8 (escape input body to prevent issue)
*/
/** Api Gateway */
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

  body = templatefile("files/api-swagger.yaml", {
    formsg_processor_sqs_name = data.aws_sqs_queue.formsg_processor[0].name
    account_id                = data.aws_caller_identity.current.account_id
    region                    = var.region
    execution_role_arn        = aws_iam_role.apigw[each.key].arn
  })

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
  # base_path   = var.service_name
  base_path = "formsg"
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
