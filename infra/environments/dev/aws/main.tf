# Dev environment for agents-md-kit on AWS

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {
    bucket = "agents-md-kit-tfstate-dev"
    key    = "terraform/state"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.region
}

module "ecs" {
  source = "../../modules/aws-ecs"

  cluster_name     = var.cluster_name
  service_name     = var.service_name
  region           = var.region
  image            = var.image
  vpc_id           = var.vpc_id
  subnets          = var.subnets
  cpu              = 512
  memory           = 1024
  desired_count    = 1
  assign_public_ip = true
}

output "service_endpoint" {
  value = module.ecs.service_endpoint
}
