variable "project_name" {
  description = "Vercel project name"
  type        = string
  default     = "agents-md-kit-dev"
}

variable "framework" {
  description = "Framework preset"
  type        = string
  default     = "nextjs"
}

variable "build_command" {
  description = "Build command"
  type        = string
  default     = "npm run build"
}

variable "output_directory" {
  description = "Output directory"
  type        = string
  default     = "dist"
}
