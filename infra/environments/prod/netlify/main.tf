# Prod environment for agents-md-kit on Netlify

terraform {
  required_providers {
    netlify = {
      source  = "netlify/netlify"
      version = "~> 0.6"
    }
  }
}

provider "netlify" {
  token = var.netlify_token
}

resource "netlify_site" "agents_md_kit" {
  name           = "agents-md-kit-prod"
  force_destroy  = true
}

resource "netlify_build_hook" "deploy" {
  site_id = netlify_site.agents_md_kit.id
  name    = "Deploy agents-md-kit"
  branch  = "main"
}

resource "netlify_site_deploy" "agents_md_kit_deploy" {
  site_id      = netlify_site.agents_md_kit.id
  dir          = var.deploy_dir
  functions    = var.functions_dir
  config_files = var.config_files
}

output "site_url" {
  value = netlify_site.agents_md_kit.url
}

output "deploy_hook" {
  value     = netlify_build_hook.deploy.url
  sensitive = true
}
