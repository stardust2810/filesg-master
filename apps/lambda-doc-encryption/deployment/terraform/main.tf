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
}


