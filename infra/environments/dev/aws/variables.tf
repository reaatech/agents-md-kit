variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "vpc_id" {
  description = "VPC ID for ECS service"
  type        = string
}

variable "subnets" {
  description = "List of subnet IDs"
  type        = list(string)
}

variable "image" {
  description = "Docker image URL"
  type        = string
}

variable "cluster_name" {
  description = "ECS cluster name"
  type        = string
  default     = "agents-md-kit-dev"
}

variable "service_name" {
  description = "ECS service name"
  type        = string
  default     = "agents-md-kit"
}
