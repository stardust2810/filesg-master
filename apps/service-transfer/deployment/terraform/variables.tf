variable "region" {
  type        = string
  description = "AWS Region"
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

variable "mgmt_eks_pod_name" {
  description = "Name of the mgmt service"
  type        = string
  default = "backend-mgmt"
}

variable "mgmt_eks_pod_port" {
  description = "Port of mgmt service"
  type        = string
  default = "3000"
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

variable "openapi_json_file_path" {
  description = "File path for OpenAPI JSON file"
  type        = string
  default     = "swagger.json"
}
