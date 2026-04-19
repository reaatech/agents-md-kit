variable "site_name" {
  description = "Netlify site name"
  type        = string
  default     = "agents-md-kit-dev"
}

variable "build_command" {
  description = "Build command for Netlify"
  type        = string
  default     = "npm run build"
}

variable "publish_dir" {
  description = "Publish directory for Netlify"
  type        = string
  default     = "dist"
}
