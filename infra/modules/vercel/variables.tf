variable "project_name" {
  type        = string
  description = "Name of the Vercel project"
}

variable "repository" {
  type        = string
  description = "GitHub repository in the format 'owner/repo'"
}

variable "repository_git_branch" {
  type        = string
  description = "Git branch to deploy"
  default     = "main"
}

variable "root_directory" {
  type        = string
  description = "Root directory for the project"
  default     = ""
}

variable "build_command" {
  type        = string
  description = "Build command for the project"
  default     = "npm run build"
}

variable "output_directory" {
  type        = string
  description = "Output directory for the build"
  default     = "dist"
}

variable "framework" {
  type        = string
  description = "Framework preset (nextjs, create-react-app, etc.)"
  default     = ""
}

variable "team_id" {
  type        = string
  description = "Vercel team ID"
  default     = null
}

variable "environment_variables" {
  type        = map(string)
  description = "Environment variables for the project"
  default     = {}
}

variable "domains" {
  type        = list(string)
  description = "Custom domains to assign to the project"
  default     = []
}

variable "instance_size" {
  type        = string
  description = "Instance size for serverless functions"
  default     = "standard"
}

variable "max_duration" {
  type        = number
  description = "Maximum duration for serverless functions in seconds"
  default     = 60
}
