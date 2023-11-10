
locals {
  parameter_list = [
    // system
    {
      name  = "ENV"
      value = var.env_name
    },
    {
      name  = "FILESG_BASE_URL"
      value = var.env_name == "prd" ? "https://www.file.gov.sg" : format("https://www.%s.file.gov.sg", var.env_name)
    },
    {
      name  = "NODE_ENV"
      value = local.node_env_values[var.env_name]
    },
    {
      name  = "PORT"
      value = local.port[var.env_name]
    },
    {
      name  = "APP_VERSION"
      value = "1.0.0"
    },
    {
      name  = "LOG_LEVEL"
      value = local.log_level[var.env_name]
    },
    {
      name  = "SERVICE_NAME"
      value = "core"
    },
    {
      name  = "PROTOCOL"
      value = "http"
    },
    {
      name  = "TOGGLE_MOCK_AUTH"
      value = local.toggle_mock_auth[var.env_name]
    },
    {
      name  = "TOGGLE_ONBOARDING_RESET"
      value = local.toggle_onboarding_reset[var.env_name]
    },
    {
      name  = "TOGGLE_ACTIVITY_ACKNOWLEDGEMENT_RESET"
      value = local.toggle_activity_acknowledgement_reset[var.env_name]
    },
    {
      name  = "TOGGLE_MOCK_THIRD_PARTY_API"
      value = local.toggle_mock_third_party_api[var.env_name]
    },
    {
      name  = "TOGGLE_PERFORMANCE_TEST"
      value = local.toggle_performance_test[var.env_name]
    },
    {
      name  = "ETH_NETWORK_NAME"
      value = "mainnet"
    },
    {
      name  = "EVENT_LOGS_SERVICE_NAME"
      value = "event-logs"
    },
    {
      name  = "EVENT_LOGS_SERVICE_URL"
      value = local.event_logs_service_url
    },
    // notification
    {
      name  = "EMAIL_NOTIFICATION_SENDER_ADDRESS"
      value = local.email_sender_address[var.env_name]
    },
    {
      name  = "EMAIL_BLACK_LIST_DURATION_IN_DAYS"
      value = 14
    },
    {
      name  = "EMAIL_RETRIEVAL_PAGE_URL"
      value = local.email_retrieval_page_url[var.env_name]
    },
    {
      name  = "SG_NOTIFY_RETRIEVAL_PAGE_URL"
      value = local.sgnotify_retrieval_page_url[var.env_name]
    },
    {
      name  = "EMAIL_TOGGLE_SEND"
      value = local.email_toggle_send[var.env_name]
    },
    {
      name  = "SG_NOTIFY_TOGGLE_SEND"
      value = local.sgnotify_toggle_send[var.env_name]
    },

    // database
    {
      name  = "DB_HOST"
      value = local.database_host[var.env_name]
    },
    {
      name  = "DB_NAME"
      value = "core"
    },
    {
      name  = "DB_PORT"
      value = 3306
    },
    {
      name  = "DB_MIGRATIONS_RUN"
      value = false
    },
    {
      name  = "DB_RETRY_ATTEMPTS"
      value = 2
    },
    {
      name  = "DB_LOGGING"
      value = var.env_name == "local" ? true : false
    },
    {
      name  = "DB_POOL_WAIT_FOR_CONNECTIONS"
      value = true
    },
    {
      name  = "DB_POOL_CONNECTION_LIMIT"
      value = 50
    },
    {
      name  = "DB_POOL_QUEUE_LIMIT"
      value = 0
    },
    {
      name  = "DB_FIELD_ENCRYPTION_ALGO"
      value = "aes-256-cbc"
    },
    {
      name  = "DB_FIELD_ENCRYPTION_IV_LENGTH"
      value = 16
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
    {
      name  = "REDIS_FILE_UPLOAD_AUTH_TTL_IN_SECONDS"
      value = 60 // follow JWT_ACCESS_TOKEN_EXPIRATION_DURATION
    },
    {
      name  = "REDIS_INSERT_VALIDATION_IN_SECONDS"
      value = 180
    },
    {
      name  = "SESSION_LENGTHS_SECS"
      value = local.session_length_in_secs[var.env_name]
    },
    {
      name  = "EXTEND_SESSION_WARNING_DURATION_SECS"
      value = local.session_warning_in_secs[var.env_name]
    },
    {
      name  = "ABSOLUTE_SESSION_EXPIRY_MINS"
      value = local.absolute_session_length_in_mins[var.env_name]
    },
    {
      name  = "TOGGLE_CONCURRENT_SESSION"
      value = local.toggle_concurrent_session[var.env_name]
    },
    // auth
    {
      name  = "JWKS_SIG_PUBLIC_KID"
      value = "filesg-ec-sig-pub-key"
    },
    {
      name  = "JWKS_ENC_PUBLIC_KID"
      value = "filesg-ec-enc-pub-key"
    },
    {
      name  = "JWT_ACCESS_TOKEN_EXPIRATION_DURATION"
      value = 60
    },
    {
      name  = "JWT_DOWNLOAD_TOKEN_EXPIRATION_DURATION"
      value = 60
    },
    {
      name  = "JWT_VERIFY_TOKEN_EXPIRATION_DURATION_YEARS"
      value = 1
    },
    {
      name = "CORPPASS_AGENCY_CACHE_EXPIRY_SECONDS"
      value = 24 * 60 * 60
    },
    // non-singpass-auth
    {
      name  = "NON_SINGPASS_AUTH_MAX_1FA_VERIFICATION_ATTEMPT_COUNT"
      value = 10
    },
    {
      name  = "NON_SINGPASS_AUTH_JWT_2FA_TOKEN_EXPIRATION_DURATION"
      value = 60 * 15
    },
    // PROD = 15 mins = 15 * 60 secs = 900 secs
    // TEST = 60 secs
    {
      name  = "NON_SINGPASS_AUTH_JWT_CONTENT_RETRIEVAL_TOKEN_EXPIRATION_DURATION_SECS"
      value = 15 * 60
    },
    // PROD = 5 mins = 5 * 60 secs = 300 secs
    // TEST = 30 secs
    {
      name  = "NON_SINGPASS_AUTH_JWT_CONTENT_RETRIEVAL_TOKEN_WARNING_DURATION_SECS"
      value = 5 * 60
    },
    // aws
    {
      name  = "AWS_REGION"
      value = var.region
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
      name  = "AWS_SES_EVENT_QUEUE"
      value = var.env_name == "local" ? "http://localhost:4566/000000000000/sqs-fsg2-localezapp-ses-notification" : data.aws_sqs_queue.email_notification[0].url
    },
    {
      name  = "AWS_S3_STATIC_FILES_BUCKET"
      value = format("s3-%s-%sezapp-static-files", var.project_code, var.env_name)
    },
    {
      name  = "POLLING_SLEEP_TIME_IN_SECONDS"
      value = 2
    },
    // singpass
    {
      name  = "SINGPASS_SERVICE_ID"
      value = "FSG"
    },
    {
      name  = "SINGPASS_CLIENT_ID"
      value = local.singpass_clientId[var.env_name]
    },
    {
      name  = "SINGPASS_TOKEN_URL"
      value = local.singpass_token_url[var.env_name]
    },
    {
      name  = "SINGPASS_REDIRECT_URL"
      value = local.singpass_redirect_url[var.env_name]
    },
    {
      name  = "SINGPASS_AUTH_URL"
      value = local.singpass_auth_url[var.env_name]
    },
    {
      name  = "SINGPASS_JWKS_ENDPOINT"
      value = local.singpass_jwks_url[var.env_name]
    },
    {
      name  = "SINGPASS_OPENID_DISCOVERY_ENDPOINT"
      value = local.singpass_openid_discovery_url[var.env_name]
    },
        // corppass
    {
      name  = "CORPPASS_SERVICE_ID"
      value = "FSG"
    },
    {
      name  = "CORPPASS_CLIENT_ID"
      value = local.corppass_clientId[var.env_name]
    },
    {
      name  = "CORPPASS_TOKEN_URL"
      value = local.corppass_token_url[var.env_name]
    },
    {
      name  = "CORPPASS_REDIRECT_URL"
      value = local.corppass_redirect_url[var.env_name]
    },
    {
      name  = "CORPPASS_AUTH_URL"
      value = local.corppass_auth_url[var.env_name]
    },
    {
      name  = "CORPPASS_JWKS_ENDPOINT"
      value = local.corppass_jwks_url[var.env_name]
    },
    {
      name  = "CORPPASS_OPENID_DISCOVERY_ENDPOINT"
      value = local.corppass_openid_discovery_url[var.env_name]
    },
    // myinfo
    {
      name  = "MYINFO_AUTHORISE_URL"
      value = local.myinfo_authorise_url[var.env_name]
    },
    {
      name  = "MYINFO_TOKEN_URL"
      value = local.myinfo_token_url[var.env_name]
    },
    {
      name  = "MYINFO_PERSON_URL"
      value = local.myinfo_person_url[var.env_name]
    },
    {
      name  = "MYINFO_PERSON_BASIC_URL"
      value = local.myinfo_person_basic_url[var.env_name]
    },
    {
      name  = "MYINFO_USER_ATTRIBUTES"
      value = "uinfin,name,mobileno,email"
    },
    {
      name  = "MYINFO_API_ENVIRONMENT"
      value = local.myinfo_environment[var.env_name]
    },
    //otp
    {
      name  = "OTP_LENGTH"
      value = 6
    },
    // PROD = 3 mins = 3 * 60 secs = 180 secs
    {
      name  = "OTP_EXPIRY_SECONDS"
      value = 3 * 60
    },
    // PROD = 1 min = 60 secs
    {
      name  = "OTP_RESEND_WAIT_SECONDS"
      value = 60
    },
    // PROD = 3
    {
      name  = "OTP_MAX_VALIDATION_ATTEMPT_COUNT"
      value = 3
    },
    // PROD = 60
    {
      name  = "OTP_REDIS_RECORD_EXPIRY_BUFFER"
      value = 60
    },
    // PROD = 3 times
    {
      name  = "OTP_MAX_ALLOWED_SENT_PER_CYCLE",
      value = 3
    },
    {
      name  = "OTP_TOGGLE_MOCK",
      value = local.toggle_mock_otp[var.env_name]
    },
    {
      name  = "OTP_MOCK_STRING",
      value = "123456"
    },
    // agency-client
    {
      name  = "AGENCY_CLIENT_MYICA_DOLOGIN_URL",
      value = local.agency_client_myica_dologin_url[var.env_name]
    },
    {
      name  = "AGENCY_CLIENT_MCC_API_URL",
      value = local.agency_client_mcc_api_url[var.env_name]
    },
    // apex
    {
      name  = "APEX_INT_URL",
      value = local.apex_int_url[var.env_name]
    },
    {
      name  = "APEX_JWKS_KEY_ID"
      value = "filesg-apex-ec-sig-pub-key"
    },
    // OA
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
      name  = "OA_DID_RESOLUTION_CACHE_EXPIRY_SECONDS"
      value = 1 * 60 * 60
    },
    {
      name  = "CIRIS_MMBS_SYSTEM_ID"
      value = "CIRIS-FILESG"
    },
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
    {
      name  = "SG_NOTIFY_API_ENDPOINT"
      value = local.sg_notify_api_endpoint[var.env_name]
    },
    {
      name  = "SG_NOTIFY_JWKS_ENDPOINT"
      value = local.sg_notify_jwks_endpoint[var.env_name]
    },
    // http agent
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
    // formsg
    {
      name = "FORMSG_RECALL_ISSUANCE_FORM_URL"
      value = local.formsg_recall_issuance_form_url[var.env_name]
    },
    {
      name = "FORMSG_RECALL_ISSUANCE_ERROR_SCENARIOS_DOC_URL"
      value = "https://go.gov.sg/filesg-manual-issuance-list-of-possible-errors"
    },
     {
      name = "FORMSG_ISSUANCE_ERROR_SCENARIOS_DOC_URL"
      value = "https://go.gov.sg/filesg-manual-issuance-list-of-possible-errors"
    }
  ]

  port = {
    local = 3001
    dev   = 3000
    sit   = 3000
    stg   = 3000
    uat   = 3000
    prd   = 3000
  }

  node_env_values = {
    local = "development"
    dev   = "production"
    sit   = "production"
    stg   = "production"
    uat   = "production"
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

  event_logs_service_url = format("%s:%s", var.event_logs_eks_pod_name, var.event_logs_eks_pod_port)

  database_host = {
    local = "127.0.0.1"
    dev   = var.env_name == "local" ? "" : data.aws_db_instance.core[0].address
    sit   = var.env_name == "local" ? "" : data.aws_db_instance.core[0].address
    stg   = var.env_name == "local" ? "" : data.aws_db_instance.core[0].address
    uat   = var.env_name == "local" ? "" : data.aws_db_instance.core[0].address
    prd   = var.env_name == "local" ? "" : data.aws_db_instance.core[0].address
  }

  redis_host = {
    local = "127.0.0.1"
    dev   = var.env_name == "local" ? "" : data.aws_elasticache_replication_group.redis[0].configuration_endpoint_address
    sit   = var.env_name == "local" ? "" : data.aws_elasticache_replication_group.redis[0].configuration_endpoint_address
    stg   = var.env_name == "local" ? "" : data.aws_elasticache_replication_group.redis[0].configuration_endpoint_address
    uat   = var.env_name == "local" ? "" : data.aws_elasticache_replication_group.redis[0].configuration_endpoint_address
    prd   = var.env_name == "local" ? "" : data.aws_elasticache_replication_group.redis[0].configuration_endpoint_address
  }

  singpass_redirect_url = {
    local = "https://www.dev.file.gov.sg/singpass/auth-callback"
    dev   = "https://www.dev.file.gov.sg/singpass/auth-callback"
    sit   = "https://www.sit.file.gov.sg/singpass/auth-callback"
    stg   = "https://www.stg.file.gov.sg/singpass/auth-callback"
    uat   = "https://www.uat.file.gov.sg/singpass/auth-callback"
    prd   = "https://www.file.gov.sg/auth-callback"
  }

  singpass_auth_url = {
    local = "https://stg-id.singpass.gov.sg/auth"
    dev   = "https://stg-id.singpass.gov.sg/auth"
    sit   = "https://stg-id.singpass.gov.sg/auth"
    stg   = "https://stg-id.singpass.gov.sg/auth"
    uat   = "https://stg-id.singpass.gov.sg/auth"
    prd   = "https://id.singpass.gov.sg/auth"
  }

  singpass_clientId = {
    local = "EpwQjtDOcJOr31SCryqV02i6mtkKpPUa"
    dev   = "EpwQjtDOcJOr31SCryqV02i6mtkKpPUa"
    sit   = "EpwQjtDOcJOr31SCryqV02i6mtkKpPUa"
    stg   = "EpwQjtDOcJOr31SCryqV02i6mtkKpPUa"
    uat   = "EpwQjtDOcJOr31SCryqV02i6mtkKpPUa"
    prd   = "A4BjNmTgGlPFNQb93fNJbSfqtub0EsfK"
  }

  singpass_token_url = {
    local = "https://stg-id.singpass.gov.sg/token"
    dev   = "https://stg-id.singpass.gov.sg/token"
    sit   = "https://stg-id.singpass.gov.sg/token"
    stg   = "https://stg-id.singpass.gov.sg/token"
    uat   = "https://stg-id.singpass.gov.sg/token"
    prd   = "https://id.singpass.gov.sg/token"
  }

  singpass_jwks_url = {
    local = "https://stg-id.singpass.gov.sg/.well-known/keys"
    dev   = "https://stg-id.singpass.gov.sg/.well-known/keys"
    sit   = "https://stg-id.singpass.gov.sg/.well-known/keys"
    stg   = "https://stg-id.singpass.gov.sg/.well-known/keys"
    uat   = "https://stg-id.singpass.gov.sg/.well-known/keys"
    prd   = "https://id.singpass.gov.sg/.well-known/keys"
  }

  singpass_openid_discovery_url = {
    local = "https://stg-id.singpass.gov.sg/.well-known/openid-configuration"
    dev   = "https://stg-id.singpass.gov.sg/.well-known/openid-configuration"
    sit   = "https://stg-id.singpass.gov.sg/.well-known/openid-configuration"
    stg   = "https://stg-id.singpass.gov.sg/.well-known/openid-configuration"
    uat   = "https://stg-id.singpass.gov.sg/.well-known/openid-configuration"
    prd   = "https://id.singpass.gov.sg/.well-known/openid-configuration"
  }

    corppass_redirect_url = {
    local = "https://www.dev.file.gov.sg/corppass/auth-callback"
    dev   = "https://www.dev.file.gov.sg/corppass/auth-callback"
    sit   = "https://www.sit.file.gov.sg/corppass/auth-callback"
    stg   = "https://www.stg.file.gov.sg/corppass/auth-callback"
    uat   = "https://www.uat.file.gov.sg/corppass/auth-callback"
    prd   = "https://www.file.gov.sg/corppass/auth-callback"
  }

  corppass_auth_url = {
    local = "https://stg-id.corppass.gov.sg/mga/sps/oauth/oauth20/authorize"
    dev   = "https://stg-id.corppass.gov.sg/mga/sps/oauth/oauth20/authorize"
    sit   = "https://stg-id.corppass.gov.sg/mga/sps/oauth/oauth20/authorize"
    stg   = "https://stg-id.corppass.gov.sg/mga/sps/oauth/oauth20/authorize"
    uat   = "https://stg-id.corppass.gov.sg/mga/sps/oauth/oauth20/authorize"
    prd   = "https://id.corppass.gov.sg/auth"
  }

  corppass_clientId = {
    local = "aKCjZohT6vHsUOllwDGr"
    dev   = "aKCjZohT6vHsUOllwDGr"
    sit   = "aKCjZohT6vHsUOllwDGr"
    stg   = "aKCjZohT6vHsUOllwDGr"
    uat   = "aKCjZohT6vHsUOllwDGr"
    prd   = "replaceme"
  }

  corppass_token_url = {
    local = "https://stg-id.corppass.gov.sg/token"
    dev   = "https://stg-id.corppass.gov.sg/token"
    sit   = "https://stg-id.corppass.gov.sg/token"
    stg   = "https://stg-id.corppass.gov.sg/token"
    uat   = "https://stg-id.corppass.gov.sg/token"
    prd   = "https://id.corppass.gov.sg/token"
  }

  corppass_jwks_url = {
    local = "https://stg-id.corppass.gov.sg/.well-known/keys"
    dev   = "https://stg-id.corppass.gov.sg/.well-known/keys"
    sit   = "https://stg-id.corppass.gov.sg/.well-known/keys"
    stg   = "https://stg-id.corppass.gov.sg/.well-known/keys"
    uat   = "https://stg-id.corppass.gov.sg/.well-known/keys"
    prd   = "https://id.corppass.gov.sg/.well-known/keys"
  }

  corppass_openid_discovery_url = {
    local = "https://stg-id.corppass.gov.sg/.well-known/openid-configuration"
    dev   = "https://stg-id.corppass.gov.sg/.well-known/openid-configuration"
    sit   = "https://stg-id.corppass.gov.sg/.well-known/openid-configuration"
    stg   = "https://stg-id.corppass.gov.sg/.well-known/openid-configuration"
    uat   = "https://stg-id.corppass.gov.sg/.well-known/openid-configuration"
    prd   = "https://id.corppass.gov.sg/.well-known/openid-configuration"
  }

  myinfo_authorise_url = {
    local = "https://stg-id.myinfo.gov.sg/authorise"
    dev   = "https://stg-id.myinfo.gov.sg/authorise"
    sit   = "https://stg-id.myinfo.gov.sg/authorise"
    stg   = "https://stg-id.myinfo.gov.sg/authorise"
    uat   = "https://stg-id.myinfo.gov.sg/authorise"
    prd   = "https://id.myinfo.gov.sg/authorise"
  }

  myinfo_token_url = {
    local = "https://stg-id.myinfo.gov.sg/token"
    dev   = "https://stg-id.myinfo.gov.sg/token"
    sit   = "https://stg-id.myinfo.gov.sg/token"
    stg   = "https://stg-id.myinfo.gov.sg/token"
    uat   = "https://stg-id.myinfo.gov.sg/token"
    prd   = "https://id.myinfo.gov.sg/token"
  }

  myinfo_person_url = {
    local = "https://stg-id.myinfo-person.gov.sg"
    dev   = "https://stg-id.myinfo-person.gov.sg"
    sit   = "https://stg-id.myinfo-person.gov.sg"
    stg   = "https://stg-id.myinfo-person.gov.sg"
    uat   = "https://stg-id.myinfo-person.gov.sg"
    prd   = "https://id.myinfo-person.gov.sg"
  }

  myinfo_person_basic_url = {
    local = "https://sandbox.api.myinfo.gov.sg/gov/v3/person-basic/"
    dev   = "https://test.api.myinfo.gov.sg/gov/v3/person-basic/"
    sit   = "https://test.api.myinfo.gov.sg/gov/v3/person-basic/"
    stg   = "https://test.api.myinfo.gov.sg/gov/v3/person-basic/"
    uat   = "https://test.api.myinfo.gov.sg/gov/v3/person-basic/"
    prd   = "https://api.myinfo.gov.sg/gov/v3/person-basic/"
  }

  myinfo_environment = {
    local = "sandbox"
    dev   = "sandbox"
    sit   = "sandbox"
    stg   = "test"
    uat   = "sandbox"
    prd   = "prod"
  }

  email_sender_address = {
    local = "no-reply@dev.file.gov.sg"
    dev   = "no-reply@dev.file.gov.sg"
    sit   = "no-reply@sit.file.gov.sg"
    stg   = "no-reply@stg.file.gov.sg"
    uat   = "no-reply@uat.file.gov.sg"
    prd   = "no-reply@file.gov.sg"
  }

  email_retrieval_page_url = {
    local = "http://localhost:3500/retrieve?source=email"
    dev   = "https://www.dev.file.gov.sg/retrieve?source=email"
    sit   = "https://www.sit.file.gov.sg/retrieve?source=email"
    stg   = "https://www.stg.file.gov.sg/retrieve?source=email"
    uat   = "https://www.uat.file.gov.sg/retrieve?source=email"
    prd   = "https://www.go.gov.sg/filesg-retrieve"
  }

  sgnotify_retrieval_page_url = {
    local = "http://localhost:3500/retrieve?source=notify"
    dev   = "https://www.dev.file.gov.sg/retrieve?source=notify"
    sit   = "https://www.sit.file.gov.sg/retrieve?source=notify"
    stg   = "https://www.stg.file.gov.sg/retrieve?source=notify"
    uat   = "https://www.uat.file.gov.sg/retrieve?source=notify"
    prd   = "https://www.file.gov.sg/retrieve?source=notify"
  }

  email_toggle_send = {
    local = "off"
    dev   = "on"
    sit   = "on"
    stg   = "on"
    uat   = "on"
    prd   = "on"
  }

  sgnotify_toggle_send = {
    local = "off"
    dev   = "on"
    sit   = "on"
    stg   = "on"
    uat   = "on"
    prd   = "on"
  }

  toggle_mock_auth = {
    local = "on"
    dev   = "on"
    sit   = "on"
    stg   = "on"
    uat   = "on"
    prd   = "off"
  }

  toggle_mock_otp = {
    local = "on"
    dev   = "on"
    sit   = "off"
    stg   = "off"
    uat   = "on"
    prd   = "off"
  }

  toggle_onboarding_reset = {
    local = "off"
    dev   = "off"
    sit   = "off"
    stg   = "off"
    uat   = "off"
    prd   = "off"
  }

  toggle_activity_acknowledgement_reset = {
    local = "off"
    dev   = "off"
    sit   = "off"
    stg   = "off"
    uat   = "off"
    prd   = "off"
  }

  toggle_concurrent_session = {
    local = "off"
    dev   = "on"
    sit   = "off"
    stg   = "off"
    uat   = "off"
    prd   = "off"
  }

  toggle_mock_third_party_api = {
    local = "on"
    dev   = "on"
    sit   = "on"
    stg   = "off"
    uat   = "on"
    prd   = "off"
  }

  toggle_performance_test = {
    local = "off"
    dev   = "off" // qh TODO: turned off for FILEZCAD-1131, to be reverted after test
    sit   = "off"
    stg   = "off"
    uat   = "off"
    prd   = "off"
  }

  apex_int_url = {
    local = "https://gw-stg.int.api.gov.sg"
    dev   = "https://gw-stg.int.api.gov.sg"
    sit   = "https://gw-stg.int.api.gov.sg"
    stg   = "https://gw-stg.int.api.gov.sg"
    uat   = "https://gw-stg.int.api.gov.sg"
    prd   = "https://gw.int.api.gov.sg"
  }

  agency_client_myica_dologin_url = {
    local = "https://clt9eh83nh.execute-api.ap-southeast-1.amazonaws.com/npd/sit/login"
    dev   = "https://clt9eh83nh.execute-api.ap-southeast-1.amazonaws.com/npd/sit/login"
    sit   = "https://clt9eh83nh.execute-api.ap-southeast-1.amazonaws.com/npd/sit/login"
    stg   = "https://clt9eh83nh.execute-api.ap-southeast-1.amazonaws.com/npd/uat/login"
    uat   = "https://clt9eh83nh.execute-api.ap-southeast-1.amazonaws.com/npd/uat/login"
    prd   = "https://n61bihs7i3.execute-api.ap-southeast-1.amazonaws.com/prd/prd/login"
  }

  agency_client_mcc_api_url = {
    local = "https://fqn1ta7r9b.execute-api.ap-southeast-1.amazonaws.com/npd/uat/api/mcc/initMyInfoRetrieval"
    dev   = "https://fqn1ta7r9b.execute-api.ap-southeast-1.amazonaws.com/npd/uat/api/mcc/initMyInfoRetrieval"
    sit   = "https://fqn1ta7r9b.execute-api.ap-southeast-1.amazonaws.com/npd/uat/api/mcc/initMyInfoRetrieval"
    stg   = "https://fqn1ta7r9b.execute-api.ap-southeast-1.amazonaws.com/npd/uat/api/mcc/initMyInfoRetrieval"
    uat   = "https://fqn1ta7r9b.execute-api.ap-southeast-1.amazonaws.com/npd/uat/api/mcc/initMyInfoRetrieval"
    prd   = "https://m8ern1rv7g.execute-api.ap-southeast-1.amazonaws.com/prd/prd/api/mcc/initMyInfoRetrieval"
  }

  sg_notify_api_endpoint = {
    local = "https://stg-ntf.singpass.gov.sg"
    dev   = "https://stg-ntf.singpass.gov.sg"
    sit   = "https://stg-ntf.singpass.gov.sg"
    stg   = "https://stg-ntf.singpass.gov.sg"
    uat   = "https://stg-ntf.singpass.gov.sg"
    prd   = "https://ntf.singpass.gov.sg"
  }

  sg_notify_jwks_endpoint = {
    local = "https://stg-ntf.singpass.gov.sg/.well-known/ntf-authz-keys"
    dev   = "https://stg-ntf.singpass.gov.sg/.well-known/ntf-authz-keys"
    sit   = "https://stg-ntf.singpass.gov.sg/.well-known/ntf-authz-keys"
    stg   = "https://stg-ntf.singpass.gov.sg/.well-known/ntf-authz-keys"
    uat   = "https://stg-ntf.singpass.gov.sg/.well-known/ntf-authz-keys"
    prd   = "https://ntf.singpass.gov.sg/.well-known/ntf-authz-keys"
  }

  formsg_recall_issuance_form_url = {
    local = "https://form.gov.sg/6507b1bce3fae000110f3e6d"
    dev   = "https://form.gov.sg/6507b1bce3fae000110f3e6d"
    sit   = "to_be_updated"
    stg   = "https://form.gov.sg/652392baa735be001130442f"
    uat   = "https://form.gov.sg/65239256231ed100113db3c8"
    prd   = "https://form.gov.sg/652392d68969da00124eb316"
  }


  session_length_in_secs = {
    local = 600
    dev   = 600
    sit   = 600
    stg   = 1200
    uat   = 600
    prd   = 1200
  }

  session_warning_in_secs = {
    local = 60
    dev   = 60
    sit   = 60
    stg   = 300
    uat   = 60
    prd   = 300
  }

  absolute_session_length_in_mins = {
    local = 60
    dev   = 60
    sit   = 60
    stg   = 240
    uat   = 60
    prd   = 240
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

