terraform {
  required_providers {
    netlify = {
      source  = "netlify/netlify"
      version = ">= 2.0.0"
    }
  }
}

resource "netlify_site" "main" {
  name      = var.site_name
  team_slug = var.team_slug
}

resource "netlify_build_hook" "main" {
  count  = var.deploy_hook != null ? 1 : 0
  name   = "auto-deploy"
  site_id = netlify_site.main.id
}

resource "netlify_site_snippet" "env" {
  for_each = var.env_vars
  site_id  = netlify_site.main.id
  key      = each.key
  value    = each.value
}

resource "netlify_custom_domain" "main" {
  count    = var.custom_domain != null ? 1 : 0
  site_id  = netlify_site.main.id
  hostname = var.custom_domain
}

resource "netlify_deploy_key" "main" {
  site_id = netlify_site.main.id
}

data "netlify_site" "main" {
  site_id = netlify_site.main.id
}
