# Dev environment for agents-md-kit on Azure

terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
  backend "azurerm" {
    resource_group_name  = "agents-md-kit-tfstate-rg"
    storage_account_name = "agentsmdkittfstate"
    container_name       = "tfstate"
    key                  = "terraform.state"
  }
}

provider "azurerm" {
  features {}
}

data "azurerm_resource_group" "app" {
  name = "agents-md-kit-dev-rg"
}

module "container_apps" {
  source = "../../modules/azure-container-apps"

  resource_group_name     = data.azurerm_resource_group.app.name
  location                = data.azurerm_resource_group.app.location
  environment_name        = "agents-md-kit-dev"
  container_app_name      = "agents-md-kit"
  image                   = var.image
  target_port             = var.target_port
  cpu                     = var.cpu
  memory                  = var.memory
  min_replicas            = 0
  max_replicas            = 10
  allow_insecure_connections = false
}

output "app_url" {
  value = module.container_apps.app_url
}
