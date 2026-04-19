output "app_url" {
  description = "URL of the deployed container app"
  value       = try(azurerm_container_app.main.default_ingress, null)
}

output "app_name" {
  description = "Name of the container app"
  value       = azurerm_container_app.main.name
}

output "environment_name" {
  description = "Name of the Container Apps environment"
  value       = azurerm_container_app_environment.main.name
}

output "log_analytics_workspace_id" {
  description = "ID of the Log Analytics workspace"
  value       = azurerm_log_analytics_workspace.main.id
}

output "application_gateway_url" {
  description = "URL of the Application Gateway (if enabled)"
  value       = try(azurerm_public_ip.main[0].ip_address, null)
}
