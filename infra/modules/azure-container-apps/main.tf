terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = ">= 3.0"
    }
  }
}

data "azurerm_resource_group" "main" {
  name = var.resource_group_name
}

# Container Apps Environment
resource "azurerm_container_app_environment" "main" {
  name                           = "${var.app_name}-env"
  location                       = coalesce(var.location, data.azurerm_resource_group.main.location)
  resource_group_name            = data.azurerm_resource_group.main.name
  log_analytics_workspace_id     = azurerm_log_analytics_workspace.main.id
  infrastructure_subnet_id       = var.environment_subnet_id
  internal_load_balancer_enabled = !var.ingress_external

  tags = var.tags
}

# Log Analytics Workspace
resource "azurerm_log_analytics_workspace" "main" {
  name                = "${var.app_name}-logs"
  location            = coalesce(var.location, data.azurerm_resource_group.main.location)
  resource_group_name = data.azurerm_resource_group.main.name
  retention_in_days   = 30
  sku                 = "PerGB2018"

  tags = var.tags
}

# Container App
resource "azurerm_container_app" "main" {
  name                         = var.app_name
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = data.azurerm_resource_group.main.name
  revision_mode                = "Single"

  # Ingress configuration
  dynamic "ingress" {
    for_each = var.ingress_external ? [1] : []
    content {
      external_enabled                   = true
      target_port                        = var.target_port
      expose                             = var.target_port
      allow_insecure_connections         = var.allow_insecure_connections
      transport                          = var.transport
      traffic_weight                     = 100
      latest_revision                    = true
      custom_domain_verification_id      = null
      ip_security_restriction          = []
    }
  }

  # Container configuration
  template {
    min_replicas = var.min_replicas
    max_replicas = var.max_replicas

    container {
      name   = var.app_name
      image  = var.container_image
      cpu    = var.cpu
      memory = "${var.memory}Gi"

      dynamic "env" {
        for_each = var.environment_variables
        content {
          name  = env.key
          value = env.value
        }
      }

      dynamic "env" {
        for_each = var.secret_env_vars
        content {
          name        = env.key
          secret_name = env.key
        }
      }
    }

    dynamic "secret" {
      for_each = var.secret_env_vars
      content {
        name  = secret.key
        value = secret.value
      }
    }
  }

  tags = var.tags
}

# Optional: Application Gateway for advanced routing
resource "azurerm_application_gateway" "main" {
  count = var.enable_app_gateway ? 1 : 0

  name                = "${var.app_name}-agw"
  location            = coalesce(var.location, data.azurerm_resource_group.main.location)
  resource_group_name = data.azurerm_resource_group.main.name

  sku {
    name     = "Standard_v2"
    tier     = "Standard_v2"
    capacity = var.gateway_capacity
  }

  # Gateway IP configuration
  gateway_ip_configuration {
    name      = "gateway-ip-config"
    subnet_id = var.gateway_subnet_id
  }

  # Frontend IP configuration
  frontend_ip_configuration {
    name                          = "frontend-ip-config"
    public_ip_address_id          = azurerm_public_ip.main[0].id
    private_ip_address_allocation = "Dynamic"
  }

  # Frontend port
  frontend_port {
    name = "frontend-port-http"
    port = 80
  }

  # Backend address pool
  backend_address_pool {
    name  = "backend-pool"
    fqdns = [azurerm_container_app.main.default_ingress]
  }

  # Backend HTTP settings
  backend_http_settings {
    name                  = "backend-http"
    cookie_based_affinity = "Disabled"
    port                  = 80
    protocol              = "Http"
    request_timeout       = 60
  }

  # HTTP listener
  http_listener {
    name                           = "http-listener"
    frontend_ip_configuration_name = "frontend-ip-config"
    frontend_port_name             = "frontend-port-http"
    protocol                       = "Http"
  }

  # Request routing rule
  request_routing_rule {
    name                       = "routing-rule"
    rule_type                  = "Basic"
    http_listener_name         = "http-listener"
    backend_address_pool_name  = "backend-pool"
    backend_http_settings_name = "backend-http"
    priority                   = 100
  }

  tags = var.tags
}

# Public IP for Application Gateway
resource "azurerm_public_ip" "main" {
  count = var.enable_app_gateway ? 1 : 0

  name                = "${var.app_name}-pip"
  location            = coalesce(var.location, data.azurerm_resource_group.main.location)
  resource_group_name = data.azurerm_resource_group.main.name
  allocation_method   = "Static"
  sku                 = "Standard"

  tags = var.tags
}
