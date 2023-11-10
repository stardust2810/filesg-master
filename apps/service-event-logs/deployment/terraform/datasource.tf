# ----------------------------------------
# SQS
# ----------------------------------------
data "aws_sqs_queue" "core_events" {
  count = var.env_name == "local" ? 0 : 1
  name  = format("sqs-%s-%sezapp-core-events", var.project_code, var.env_name)
}

# ----------------------------------------
# KMS
# ----------------------------------------
data "aws_kms_key" "dynamodb" {
  count = var.env_name == "local" ? 0 : 1
  key_id = format(
    "alias/kms-cmk-%s-%snana-dynamodb",
    var.project_code,
    var.env_name != "prd" ? "dev" : var.env_name
  )
}
