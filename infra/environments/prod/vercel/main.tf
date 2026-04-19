# Prod environment for agents-md-kit on Vercel

terraform {
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 1.5"
    }
  }
}

provider "vercel" {
  api_token = var.vercel_token
}

resource "vercel_project" "agents_md_kit" {
  name      = "agents-md-kit-prod"
  framework = "nextjs"
  root_dir  = var.root_dir
}

resource "vercel_project_environment_variable" "env" {
  for_each = var.environment_variables

  project_id = vercel_project.agents_md_kit.id
  key        = each.key
  value      = each.value
  target     = ["production"]
}

output "project_url" {
  value = vercel_project.agents_md_kit.url
}

output "project_id" {
  value = vercel_project.agents_md_kit.id
}
