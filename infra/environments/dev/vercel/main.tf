# Dev environment for agents-md-kit on Vercel

terraform {
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 1.0"
    }
  }
  backend "s3" {
    bucket = "agents-md-kit-tfstate"
    key    = "dev/vercel/terraform.tfstate"
    region = "us-west-2"
  }
}

provider "vercel" {
  # API token from VERCEL_TOKEN env var
}

module "vercel" {
  source = "../../modules/vercel"

  project_name = "agents-md-kit-dev"
  framework    = "nextjs"
  build_command = "npm run build"
  output_directory = "dist"
  env_vars = {
    NODE_VERSION = "18"
    LOG_LEVEL    = "debug"
  }
}

output "project_url" {
  value = module.vercel.project_url
}

output "deployment_url" {
  value = module.vercel.deployment_url
}
