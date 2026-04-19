# Dev environment for agents-md-kit on GCP

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
  backend "gcs" {
    bucket = "agents-md-kit-tfstate"
    prefix = "dev/gcp"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

data "google_project" "app" {
  project_id = var.project_id
}

module "cloud_run" {
  source = "../../modules/cloud-run"

  project_id    = data.google_project.app.project_id
  location      = var.region
  service_name  = "agents-md-kit-dev"
  image         = var.image
  port          = var.target_port
  cpu           = var.cpu
  memory        = var.memory
  min_instances = 0
  max_instances = 10
}

output "service_url" {
  value = module.cloud_run.service_url
}
