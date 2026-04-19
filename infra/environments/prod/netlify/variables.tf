variable "netlify_token" {
  description = "Netlify API token"
  type        = string
  sensitive   = true
}

variable "deploy_dir" {
  description = "Directory to deploy"
  type        = string
  default     = "dist"
}

variable "functions_dir" {
  description = "Directory containing Netlify Functions"
  type        = string
  default     = ""
}

variable "config_files" {
  description = "List of config files"
  type        = list(string)
  default     = ["netlify.toml"]
}
