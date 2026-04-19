variable "project_id" {
  description = "GCP project ID"
  type        = string
  default     = "my-project"
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "us-west2"
}

variable "service_name" {
  description = "Cloud Run service name"
  type        = string
  default     = "agents-md-kit-prod"
}

variable "container_image" {
  description = "Container image URI"
  type        = string
  default     = "gcr.io/my-project/agents-md-kit:latest"
}

variable "memory" {
  description = "Memory in MiB"
  type        = number
  default     = 512
}

variable "cpu" {
  description = "CPU allocation"
  type        = number
  default     = 1
}

variable "max_instances" {
  description = "Maximum instances"
  type        = number
  default     = 10
}

variable "otlp_endpoint" {
  description = "OTLP endpoint for telemetry"
  type        = string
  default     = "http://otel-collector:4317"
}
