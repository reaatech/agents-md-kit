variable "vercel_token" {
  description = "Vercel API token"
  type        = string
  sensitive   = true
}

variable "root_dir" {
  description = "Root directory for the Vercel project"
  type        = string
  default     = ""
}

variable "environment_variables" {
  description = "Environment variables to set on the Vercel project"
  type        = map(string)
  default     = {}
}
