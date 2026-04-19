# Dev environment for agents-md-kit

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
  backend "gcs" {
    bucket = "agents-md-kit-tfstate-dev"
    prefix = "terraform/state"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "us-central1"
}

variable "image" {
  description = "Docker image URL"
  type        = string
}

module "cloud_run" {
  source = "../../modules/cloud-run"

  project_id   = var.project_id
  service_name = "agents-md-kit-dev"
  region       = var.region
  image        = var.image
  memory       = 256
  max_instances = 5
}

output "service_url" {
  value = module.cloud_run.service_url
}
