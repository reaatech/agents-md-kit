# Dev environment for agents-md-kit on Netlify

terraform {
  required_providers {
    netlify = {
      source  = "netlify/netlify"
      version = "~> 2.0"
    }
  }
  backend "s3" {
    bucket = "agents-md-kit-tfstate"
    key    = "dev/netlify/terraform.tfstate"
    region = "us-west-2"
  }
}

provider "netlify" {
  # API token from NETLIFY_TOKEN env var
}

module "netlify" {
  source = "../../modules/netlify"

  site_name     = "agents-md-kit-dev"
  build_command = "npm run build"
  publish_dir   = "dist"
  env_vars = {
    NODE_VERSION = "18"
    LOG_LEVEL    = "debug"
  }
}

output "site_url" {
  value = module.netlify.site_url
}

output "admin_url" {
  value = module.netlify.admin_url
}
