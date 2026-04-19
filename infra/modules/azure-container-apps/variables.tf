variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "eastus"
}

variable "app_name" {
  description = "Name of the container app"
  type        = string
}

variable "container_image" {
  description = "Container image to deploy"
  type        = string
}

variable "target_port" {
  description = "Port the container listens on"
  type        = number
  default     = 3000
}

variable "cpu" {
  description = "CPU allocation (0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0)"
  type        = number
  default     = 0.5
}

variable "memory" {
  description = "Memory allocation in Gi (0.5, 1.0, 1.5, 2.0, 3.0, 3.5, 4.0)"
  type        = number
  default     = 1.0
}

variable "min_replicas" {
  description = "Minimum number of replicas"
  type        = number
  default     = 0
}

variable "max_replicas" {
  description = "Maximum number of replicas"
  type        = number
  default     = 10
}

variable "environment_variables" {
  description = "Environment variables for the container"
  type        = map(string)
  default     = {}
}

variable "secret_env_vars" {
  description = "Secret environment variables (stored in Key Vault)"
  type        = map(string)
  default     = {}
  sensitive   = true
}

variable "ingress_external" {
  description = "Whether to expose the app externally"
  type        = bool
  default     = true
}

variable "allow_insecure_connections" {
  description = "Whether to allow insecure connections"
  type        = bool
  default     = false
}

variable "transport" {
  description = "Transport protocol (auto, http, http2, grpc)"
  type        = string
  default     = "auto"
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
