# Prod environment for agents-md-kit on Azure Container Apps

terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
  backend "azurerm" {
    resource_group_name  = "agents-md-kit-tfstate"
    storage_account_name = "tfstateprod"
    container_name       = "tfstate"
    key                  = "prod/azure/terraform.tfstate"
  }
}

provider "azurerm" {
  features {}
}

module "container_apps" {
  source = "../../modules/azure-container-apps"

  resource_group_name   = var.resource_group_name
  location              = var.location
  container_app_name    = "agents-md-kit-prod"
  environment_name      = "agents-md-kit-env"
  container_image       = var.container_image
  cpu                   = var.cpu
  memory                = var.memory
  min_replicas          = var.min_replicas
  max_replicas          = var.max_replicas
  target_port           = 3000
  env_vars = {
    LOG_LEVEL           = "info"
    ENABLE_TELEMETRY    = "true"
    OTEL_EXPORTER_OTLP_ENDPOINT = var.otlp_endpoint
  }
}

output "app_url" {
  value = module.container_apps.app_url
}
