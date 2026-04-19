# Prod environment for agents-md-kit on AWS ECS

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {
    bucket = "agents-md-kit-tfstate"
    key    = "prod/aws/terraform.tfstate"
    region = "us-west-2"
  }
}

provider "aws" {
  region = var.region
}

module "ecs" {
  source = "../../modules/aws-ecs"

  service_name    = "agents-md-kit"
  environment     = "prod"
  cluster_name    = var.cluster_name
  container_image = var.container_image
  region          = var.region
  subnets         = var.subnets
  vpc_id          = var.vpc_id
  desired_count   = var.desired_count
  cpu             = var.cpu
  memory          = var.memory
  env_vars = {
    LOG_LEVEL           = "info"
    ENABLE_TELEMETRY    = "true"
    OTEL_EXPORTER_OTLP_ENDPOINT = var.otlp_endpoint
  }
}

output "service_arn" {
  value = module.ecs.service_arn
}

output "load_balancer_dns" {
  value = module.ecs.load_balancer_dns
}
