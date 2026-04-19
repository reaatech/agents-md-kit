terraform {
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 1.0"
    }
  }
}

data "vercel_project" "existing" {
  count  = var.team_id != null ? 0 : 1
  name   = var.project_name
  team_id = var.team_id
}

resource "vercel_project" "this" {
  name      = var.project_name
  team_id   = var.team_id

  framework           = var.framework
  build_command       = var.build_command
  output_directory    = var.output_directory
  root_directory      = var.root_directory

  git_repository = {
    repo   = var.repository
    type   = "github"
    branch = var.repository_git_branch
  }

  environment = [
    for key, value in var.environment_variables : {
      key    = key
      value  = value
      target = ["production", "preview"]
    }
  ]

  serverless_function_region = "iad1"

  lifecycle {
    ignore_changes = [
      environment,
    ]
  }
}

resource "vercel_project_domain" "this" {
  for_each = toset(var.domains)

  project_id = vercel_project.this.id
  domain     = each.value
  team_id    = var.team_id
}
