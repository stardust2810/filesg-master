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
      value = "FileSG Transfer Service"
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
      name  = "PROTOCOL"
      value = "http"
    },
    {
      name  = "PORT"
      value = local.port[var.env_name]
    },
    {
      name  = "REQUEST_TIMEOUT_MS"
      value = 50 * 1000
    },
    {
      name  = "LOG_LEVEL"
      value = local.log_level[var.env_name]
    },
    {
      name  = "MANAGEMENT_SERVICE_URL"
      value = local.mgmt_service_url
    },
    {
      name  = "MANAGEMENT_SERVICE_NAME"
      value = "mgmt"
    },
    {
      name  = "POLLING_SLEEP_TIME_IN_SECONDS"
      value = 2
    },
    // aws
    {
      name  = "AWS_REGION"
      value = var.region
    },
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
      name  = "AWS_S3_BUCKET_STATIC_FILES"
      value = format("s3-%s-%sezapp-static-files", var.project_code, var.env_name)
    },
    {
      name  = "AWS_SQS_CORE_EVENTS"
      value = var.env_name == "local" ? "http://localhost:4566/000000000000/sqs-fsg2-localezapp-core-events" : data.aws_sqs_queue.core_events[0].url
    },
    {
      name  = "AWS_SQS_TRANSFER_EVENTS"
      value = var.env_name == "local" ? "http://localhost:4566/000000000000/sqs-fsg2-localezapp-transfer-events" : data.aws_sqs_queue.transfer_events[0].url
    },
    {
      name  = "AWS_IAM_UPLOAD_MOVE_ROLE_ARN"
      value = local.iam_upload_move_role_arn[var.env_name]
    },
    {
      name  = "AWS_IAM_TRANSFER_MOVE_ROLE_ARN"
      value = local.iam_transfer_move_role_arn[var.env_name]
    },
    {
      name  = "AWS_IAM_UPLOAD_ROLE_ARN"
      value = local.iam_upload_role_arn[var.env_name]
    },
    {
      name  = "AWS_IAM_RETRIEVE_ROLE_ARN"
      value = local.iam_retrieve_role_arn[var.env_name]
    },
    {
      name  = "AWS_IAM_DELETE_ROLE_ARN"
      value = local.iam_delete_role_arn[var.env_name]
    },
    {
      name  = "AWS_STS_ASSUME_ROLE_SESSION_DURATION"
      value = 900
    },
    {
      name  = "AWS_LAMDBA_DOC_ENCRYPTION_FUNCTION_NAME"
      value = local.lambda_doc_encryption_function_name[var.env_name]
    },
    {
      name  = "AWS_LAMBDA_TIMEOUT_IN_MS"
      value = 16 * 60 * 1000
    },
    {
      name  = "UPLOAD_FILE_SIZE_LIMIT_IN_MB"
      value = 10
    },
    // oa
    {
      name  = "OA_RENDERER_URL"
      value = local.renderer_url[var.env_name]
    },
    {
      name  = "OA_REVOCATION_LOC"
      value = local.revocation_loc[var.env_name]
    },
    {
      name  = "OA_IMAGE_ID_ENCRYPTION_ALGO"
      value = "aes-256-cbc"
    },
    {
      name  = "OA_IMAGE_ID_ENCRYPTION_IV_LENGTH"
      value = 16
    },
    {
      name  = "OA_DOCUMENT_SIGNING_KEY_ENCRYPTION_ALGO"
      value = "aes-256-cbc"
    },
    {
      name  = "OA_DOCUMENT_SIGNING_KEY_ENCRYPTION_IV_LENGTH"
      value = 16
    },
    {
      name  = "AGENCY_OA_SCHEMA_FOLDER_NAME"
      value = "agency-oa-schema"
    },
    {
      name  = "MAX_MESSAGE_RECEIVE_COUNT"
      value = 3
    },
    // http agent
    {
      name  = "HTTP_AGENT_MAX_SOCKETS"
      value = 1000
    },
    {
      name  = "HTTP_AGENT_MAX_FREE_SOCKETS"
      value = 10
    },
    {
      name  = "HTTP_AGENT_SOCKET_TIMEOUT"
      value = 60 * 1000
    },
    {
      name  = "HTTP_AGENT_FREE_SOCKET_TIMEOUT"
      value = 30 * 1000
    },
    {
      name  = "HTTPS_AGENT_MAX_SOCKETS"
      value = 1000
    },
    {
      name  = "HTTPS_AGENT_MAX_FREE_SOCKETS"
      value = 10
    },
    {
      name  = "HTTPS_AGENT_SOCKET_TIMEOUT"
      value = 60 * 1000
    },
    {
      name  = "HTTPS_AGENT_FREE_SOCKET_TIMEOUT"
      value = 30 * 1000
    },
    // misc
    {
      name  = "DOC_ENCRYPTION_PASSWORD_ENCRYPTION_ALGO"
      value = "aes-256-cbc"
    },
    {
      name  = "DOC_ENCRYPTION_PASSWORD_ENCRYPTION_IV_LENGTH"
      value = 16
    },
    {
      name  = "USE_LOCALSTACK"
      value = var.env_name == "local" ? "on" : "off"
    },
    //FIXME: FOR TESTING FILEZCAD-1379. REMOVE AFTER TESTING #START#
    {
      name  = "TOGGLE_UPLOAD_MOVE_FAILURE"
      value = "off"
    },
    {
      name  = "TOGGLE_TRANSFER_MOVE_FAILURE"
      value = "off"
    },
    //FIXME: FOR TESTING FILEZCAD-1379. REMOVE AFTER TESTING #END#
  ]

  port = {
    local = 3002
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

  mgmt_service_url = format("%s:%s", var.mgmt_eks_pod_name, var.mgmt_eks_pod_port)

  iam_upload_move_role_arn = {
    local = "iam-role-fsg2-localezapp-admin"
    dev   = format("arn:aws:iam::%s:role/iam-role-%s-%sezapp-transfer-uploadmove", data.aws_caller_identity.current.account_id, var.project_code, var.env_name)
    sit   = format("arn:aws:iam::%s:role/iam-role-%s-%sezapp-transfer-uploadmove", data.aws_caller_identity.current.account_id, var.project_code, var.env_name)
    stg   = format("arn:aws:iam::%s:role/iam-role-%s-%sezapp-transfer-uploadmove", data.aws_caller_identity.current.account_id, var.project_code, var.env_name)
    uat   = format("arn:aws:iam::%s:role/iam-role-%s-%sezapp-transfer-uploadmove", data.aws_caller_identity.current.account_id, var.project_code, var.env_name)
    prd   = format("arn:aws:iam::%s:role/iam-role-%s-%sezapp-transfer-uploadmove", data.aws_caller_identity.current.account_id, var.project_code, var.env_name)
  }

  iam_transfer_move_role_arn = {
    local = "iam-role-fsg2-localezapp-admin"
    dev   = format("arn:aws:iam::%s:role/iam-role-%s-%sezapp-transfer-transfermove", data.aws_caller_identity.current.account_id, var.project_code, var.env_name)
    sit   = format("arn:aws:iam::%s:role/iam-role-%s-%sezapp-transfer-transfermove", data.aws_caller_identity.current.account_id, var.project_code, var.env_name)
    stg   = format("arn:aws:iam::%s:role/iam-role-%s-%sezapp-transfer-transfermove", data.aws_caller_identity.current.account_id, var.project_code, var.env_name)
    uat   = format("arn:aws:iam::%s:role/iam-role-%s-%sezapp-transfer-transfermove", data.aws_caller_identity.current.account_id, var.project_code, var.env_name)
    prd   = format("arn:aws:iam::%s:role/iam-role-%s-%sezapp-transfer-transfermove", data.aws_caller_identity.current.account_id, var.project_code, var.env_name)
  }

  iam_upload_role_arn = {
    local = "iam-role-fsg2-localezapp-admin"
    dev   = format("arn:aws:iam::%s:role/iam-role-%s-%sezapp-transfer-upload", data.aws_caller_identity.current.account_id, var.project_code, var.env_name)
    sit   = format("arn:aws:iam::%s:role/iam-role-%s-%sezapp-transfer-upload", data.aws_caller_identity.current.account_id, var.project_code, var.env_name)
    stg   = format("arn:aws:iam::%s:role/iam-role-%s-%sezapp-transfer-upload", data.aws_caller_identity.current.account_id, var.project_code, var.env_name)
    uat   = format("arn:aws:iam::%s:role/iam-role-%s-%sezapp-transfer-upload", data.aws_caller_identity.current.account_id, var.project_code, var.env_name)
    prd   = format("arn:aws:iam::%s:role/iam-role-%s-%sezapp-transfer-upload", data.aws_caller_identity.current.account_id, var.project_code, var.env_name)
  }

  iam_retrieve_role_arn = {
    local = "iam-role-fsg2-localezapp-admin"
    dev   = format("arn:aws:iam::%s:role/iam-role-%s-%sezapp-transfer-retrieve", data.aws_caller_identity.current.account_id, var.project_code, var.env_name)
    sit   = format("arn:aws:iam::%s:role/iam-role-%s-%sezapp-transfer-retrieve", data.aws_caller_identity.current.account_id, var.project_code, var.env_name)
    stg   = format("arn:aws:iam::%s:role/iam-role-%s-%sezapp-transfer-retrieve", data.aws_caller_identity.current.account_id, var.project_code, var.env_name)
    uat   = format("arn:aws:iam::%s:role/iam-role-%s-%sezapp-transfer-retrieve", data.aws_caller_identity.current.account_id, var.project_code, var.env_name)
    prd   = format("arn:aws:iam::%s:role/iam-role-%s-%sezapp-transfer-retrieve", data.aws_caller_identity.current.account_id, var.project_code, var.env_name)
  }

  iam_delete_role_arn = {
    local = "iam-role-fsg2-localezapp-admin"
    dev   = format("arn:aws:iam::%s:role/iam-role-%s-%sezapp-transfer-delete", data.aws_caller_identity.current.account_id, var.project_code, var.env_name)
    sit   = format("arn:aws:iam::%s:role/iam-role-%s-%sezapp-transfer-delete", data.aws_caller_identity.current.account_id, var.project_code, var.env_name)
    stg   = format("arn:aws:iam::%s:role/iam-role-%s-%sezapp-transfer-delete", data.aws_caller_identity.current.account_id, var.project_code, var.env_name)
    uat   = format("arn:aws:iam::%s:role/iam-role-%s-%sezapp-transfer-delete", data.aws_caller_identity.current.account_id, var.project_code, var.env_name)
    prd   = format("arn:aws:iam::%s:role/iam-role-%s-%sezapp-transfer-delete", data.aws_caller_identity.current.account_id, var.project_code, var.env_name)
  }

  lambda_doc_encryption_function_name = {
    local = "lambda-fsg2-localezapp-doc-encryption"
    dev   = format("lambda-fsg2-%sezapp-doc-encryption", var.env_name)
    sit   = format("lambda-fsg2-%sezapp-doc-encryption", var.env_name)
    stg   = format("lambda-fsg2-%sezapp-doc-encryption", var.env_name)
    uat   = format("lambda-fsg2-%sezapp-doc-encryption", var.env_name)
    prd   = format("lambda-fsg2-%sezapp-doc-encryption", var.env_name)
  }

  renderer_url = {
    local = "http://localhost:3501"
    dev   = "https://renderer.dev.file.gov.sg/"
    sit   = "https://renderer.sit.file.gov.sg/"
    stg   = "https://renderer.stg.file.gov.sg/"
    uat   = "https://renderer.uat.file.gov.sg/"
    prd   = "https://renderer.file.gov.sg/"
  }

  revocation_loc = {
    local = "http://localhost:3001/api/core/v1/open-attestation/revocation-status"
    dev   = "https://www.dev.file.gov.sg/api/core/v1/open-attestation/revocation-status"
    sit   = "https://www.sit.file.gov.sg/api/core/v1/open-attestation/revocation-status"
    stg   = "https://www.stg.file.gov.sg/api/core/v1/open-attestation/revocation-status"
    uat   = "https://www.uat.file.gov.sg/api/core/v1/open-attestation/revocation-status"
    prd   = "https://www.file.gov.sg/api/core/v1/open-attestation/revocation-status"
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
