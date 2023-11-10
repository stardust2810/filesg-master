locals {

  api_gateway_external_vpce = {
    myica = {
      nprd = "vpce-09506526d389c246a" # non-prod
      prd  = "vpce-006348193a6521171" # prod
    }
  }

  api_gateway_info = {
    format("%s-%s", var.service_name, "public") = {
      type                  = "REGIONAL"
      policy_whitelist_vpce = null # public api does not need policy
    }
    format("%s-%s", var.service_name, "private") = {
      type = "PRIVATE"
      policy_whitelist_vpce = {
        dev = {}
        stg = {
          myica = local.api_gateway_external_vpce.myica.nprd
        }
        uat = {}
        prd = {
          myica = local.api_gateway_external_vpce.myica.prd
        }
      }
    }
  }
}
