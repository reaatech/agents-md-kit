output "site_id" {
  value       = netlify_site.main.id
  description = "Unique identifier for the Netlify site"
}

output "site_url" {
  value       = netlify_site.main.ssl_url
  description = "URL of the deployed site"
}

output "admin_url" {
  value       = netlify_site.main.admin_url
  description = "Admin URL for the Netlify site"
}

output "deploy_hook_url" {
  value       = var.deploy_hook != null ? netlify_build_hook.main[0].url : null
  description = "Deploy hook URL for triggering deployments"
}

output "custom_domain" {
  value       = var.custom_domain != null ? var.custom_domain : netlify_site.main.ssl_url
  description = "Custom domain or default Netlify URL"
}
