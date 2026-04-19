variable "cluster_name" {
  description = "Name of the ECS cluster"
  type        = string
  default     = "agents-md-kit-cluster"
}

variable "service_name" {
  description = "Name of the ECS service"
  type        = string
  default     = "agents-md-kit-service"
}

variable "image" {
  description = "Docker image URL"
  type        = string
}

variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-west-2"
}

variable "vpc_id" {
  description = "VPC ID for the service"
  type        = string
}

variable "subnets" {
  description = "List of subnet IDs for the service"
  type        = list(string)
}

variable "cpu" {
  description = "CPU units for the task (256, 512, 1024, etc.)"
  type        = number
  default     = 256
}

variable "memory" {
  description = "Memory in MiB for the task"
  type        = number
  default     = 512
}

variable "desired_count" {
  description = "Desired number of tasks"
  type        = number
  default     = 1
}

variable "max_capacity" {
  description = "Maximum number of tasks for auto-scaling"
  type        = number
  default     = 10
}

variable "container_port" {
  description = "Port the container listens on"
  type        = number
  default     = 3000
}

variable "environment_variables" {
  description = "Environment variables for the container"
  type        = map(string)
  default     = {}
}

variable "enable_execute_command" {
  description = "Enable ECS Execute Command for debugging"
  type        = bool
  default     = false
}

variable "health_check_path" {
  description = "Path for the health check"
  type        = string
  default     = "/health"
}

variable "log_retention_days" {
  description = "Number of days to retain logs"
  type        = number
  default     = 30
}
