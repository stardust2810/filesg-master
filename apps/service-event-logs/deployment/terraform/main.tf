provider "aws" {
  region = var.region

  endpoints {
    dynamodb = var.env_name == "local" ? "http://localhost:8000" : null
  }
}

terraform {
  backend "s3" {
  }
}

locals {
  default_tags = {
    Agency-Code  = var.agency_code
    Project-Code = var.project_code
    Environment  = var.env_name
    Zone         = var.zone_name
    Tier         = var.tier_name
    Terraform    = true # Keeping this here to be backward compatible for modules that have not added custom tags
  }

}
