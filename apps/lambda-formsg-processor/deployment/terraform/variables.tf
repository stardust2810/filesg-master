variable "region" {
  type        = string
  description = "AWS Region"
}

variable "agency_code" {
  description = "The 3 letter code for the agency"
  type        = string
}

variable "project_code" {
  description = "Project code"
  type        = string
}

variable "zone_name" {
  description = "The two alphabet code for the zone (ez, iz, mz, dz)"
  type        = string
  default     = "na"
}

variable "env_name" {
  description = "The name of the environment (dev, stg, sit, uat, prd)"
  type        = string
}

variable "tier_name" {
  description = "The name of the tier (web, app, db, it, gut, na)"
  type        = string
  default     = "na"
}

variable "service_name" {
  description = "Name of service"
  type        = string
}

variable "parameter_config_defaults" {
  type        = map(any)
  description = "Parameter default settings"
  default = {
    description     = null
    type            = "String"
    tier            = "Standard"
    overwrite       = "true"
    allowed_pattern = null
    data_type       = "text"
  }
}

variable "domain_gov_sg" {
  description = "Domain name for .gov.sg"
  type        = string
}
