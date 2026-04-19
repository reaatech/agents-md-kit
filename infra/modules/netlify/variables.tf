variable "site_name" {
  type        = string
  description = "Name of the Netlify site (must be unique)"
}

variable "build_command" {
  type        = string
  description = "Build command for the site"
  default     = "npm run build"
}

variable "publish_dir" {
  type        = string
  description = "Publish directory for the site"
  default     = "dist"
}

variable "env_vars" {
  type        = map(string)
  description = "Environment variables to set on the site"
  default     = {}
}

variable "team_slug" {
  type        = string
  description = "Team slug for the Netlify team"
  default     = null
}

variable "custom_domain" {
  type        = string
  description = "Custom domain to attach to the site"
  default     = null
}

variable "ssl" {
  type = object({
    state = string
  })
  description = "SSL configuration"
  default = {
    state = "managed"
  }
}

variable "deploy_hook" {
  type        = string
  description = "Deploy hook URL for triggering deployments"
  default     = null
}

variable "branch" {
  type        = string
  description = "Production branch"
  default     = "main"
}

variable "functions_region" {
  type        = string
  description = "Region for Netlify Functions"
  default     = "us-east-1"
}
