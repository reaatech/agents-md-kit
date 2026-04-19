variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-west-2"
}

variable "cluster_name" {
  description = "ECS cluster name"
  type        = string
  default     = "agents-md-kit-prod"
}

variable "container_image" {
  description = "Container image URI"
  type        = string
  default     = "ghcr.io/reaatech/agents-md-kit:latest"
}

variable "subnets" {
  description = "VPC subnets for the service"
  type        = list(string)
  default     = ["subnet-xxx", "subnet-yyy"]
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
  default     = "vpc-xxx"
}

variable "desired_count" {
  description = "Desired number of tasks"
  type        = number
  default     = 2
}

variable "cpu" {
  description = "CPU units"
  type        = number
  default     = 512
}

variable "memory" {
  description = "Memory in MB"
  type        = number
  default     = 1024
}

variable "otlp_endpoint" {
  description = "OTLP endpoint for telemetry"
  type        = string
  default     = "http://otel-collector:4317"
}
