# ----------------------------------------
# API Gateway IAM
# ----------------------------------------
data "aws_iam_policy_document" "apigw" {

  statement {
    sid    = "AllowPushRequestToSQS"
    effect = "Allow"
    actions = [
      "sqs:SendMessage"
    ]
    resources = [
      data.aws_sqs_queue.formsg_processor[0].arn
    ]
  }

  statement {

    sid    = "AllowAccessToKms"
    effect = "Allow"

    actions = [
      "kms:Decrypt",
      "kms:Encrypt",
      "kms:DescribeKey",
      "kms:GenerateDataKey"
    ]
    resources = [
      data.aws_kms_key.sqs[0].arn
    ]
  }

}

resource "aws_iam_role" "apigw" {

  for_each = local.api_gateway_info
  name = format(
    "iam-role-%s-%s%s%s-apigw-%s",
    var.project_code,
    var.env_name,
    var.zone_name,
    var.tier_name,
    each.key
  )
  description = format("API Gateway execution role for %s", each.key)

  assume_role_policy = data.aws_iam_policy_document.apigw_assume_role.json
}

data "aws_iam_policy_document" "apigw_assume_role" {

  statement {
    actions = ["sts:AssumeRole"]
    effect  = "Allow"

    principals {
      type        = "Service"
      identifiers = ["apigateway.amazonaws.com"]
    }

  }
}

resource "aws_iam_policy" "apigw" {

  for_each = local.api_gateway_info
  name = format("iam-policy-%s-%s%s%s-%s",
    var.project_code,
    var.env_name,
    var.zone_name,
    var.tier_name,
    each.key
  )

  description = format("IAM policy for API Gateway for %s", each.key)

  policy = data.aws_iam_policy_document.apigw.json

  tags = merge(
    local.default_tags,
    local.custom_tags,
    {
      Name = format("iam-policy-%s-%s%s%s-%s",
        var.project_code,
        var.env_name,
        var.zone_name,
        var.tier_name,
        each.key
      )
    }
  )
}

resource "aws_iam_role_policy_attachment" "apigw" {
  for_each   = local.api_gateway_info
  role       = aws_iam_role.apigw[each.key].name
  policy_arn = aws_iam_policy.apigw[each.key].arn
}
