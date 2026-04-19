variable "resource_group_name" {
  description = "Azure resource group name"
  type        = string
  default     = "agents-md-kit-prod"
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "westus2"
}

variable "container_image" {
  description = "Container image URI"
  type        = string
  default     = "ghcr.io/reaatech/agents-md-kit:latest"
}

variable "cpu" {
  description = "CPU cores"
  type        = number
  default     = 0.5
}

variable "memory" {
  description = "Memory in GiB"
  type        = number
  default     = 1.0
}

variable "min_replicas" {
  description = "Minimum replicas"
  type        = number
  default     = 1
}

variable "max_replicas" {
  description = "Maximum replicas"
  type        = number
  default     = 10
}

variable "otlp_endpoint" {
  description = "OTLP endpoint for telemetry"
  type        = string
  default     = "http://otel-collector:4317"
}
