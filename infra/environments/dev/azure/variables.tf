variable "image" {
  description = "Container image for agents-md-kit"
  type        = string
  default     = "ghcr.io/reaatech/agents-md-kit:latest"
}

variable "target_port" {
  description = "Port the container listens on"
  type        = number
  default     = 8084
}

variable "cpu" {
  description = "CPU allocation"
  type        = number
  default     = 0.5
}

variable "memory" {
  description = "Memory allocation in Gi"
  type        = number
  default     = 1
}
