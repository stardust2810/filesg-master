provider "aws" {
  region = var.region
}

terraform {
  backend "s3" {
  }
}

locals {
  az_list          = ["ap-southeast-1a", "ap-southeast-1b"]
  az_alphabet_list = [for az in local.az_list : substr(az, -1, 1)]

  default_tags = {
    Agency-Code  = var.agency_code
    Project-Code = var.project_code
    Environment  = var.env_name
    Zone         = var.zone_name
    Tier         = var.tier_name
  }

  custom_tags = {
    Terraform    = true
    Config-Check = true
  }
}

