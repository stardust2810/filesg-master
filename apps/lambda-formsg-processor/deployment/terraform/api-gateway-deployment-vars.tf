locals {

  apigw_name = "formsg-webhook"

}


locals {

  api_gateway_info = {
    format("%s-%s", var.service_name, "public") = {
      type                  = "REGIONAL"
      policy_whitelist_vpce = null # public api does not need policy
    }
  }
}
