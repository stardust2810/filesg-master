resource "aws_dynamodb_table" "formsg_transaction" {

  name         = format("formsg-transaction-log-%s", var.env_name)
  billing_mode = "PAY_PER_REQUEST"

  deletion_protection_enabled = var.env_name == "local" ? false : true // localstack doesnt support deletion protection

  dynamic "point_in_time_recovery" {
    for_each = var.env_name == "local" ? [] : [1]

    content {
      enabled = true
    }
  }
  dynamic "server_side_encryption" {
    for_each = var.env_name == "local" ? [] : [1]

    content {
      enabled     = true
      kms_key_arn = data.aws_kms_key.dynamodb[0].arn
    }

  }

  hash_key = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "transactionUuid"
    type = "S"
  }

  global_secondary_index {
    name               = "transactionUuid-index"
    hash_key           = "transactionUuid"
    projection_type    = "INCLUDE"
    non_key_attributes = ["id", "transaction"]
  }

  attribute {
    name = "batchId"
    type = "S"
  }

  global_secondary_index {
    name            = "batchId-index"
    hash_key        = "batchId"
    projection_type = "ALL"
  }

  tags = merge(local.default_tags, {
    Tier = "db"
  })

  lifecycle {
    ignore_changes = [tags] // dynomodb-local doesnt support tags
  }

}
