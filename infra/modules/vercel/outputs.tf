output "project_id" {
  value       = vercel_project.this.id
  description = "Vercel project ID"
}

output "project_name" {
  value       = vercel_project.this.name
  description = "Vercel project name"
}

output "project_url" {
  value       = vercel_project.this.id
  description = "Vercel project URL (production)"
}

output "deployment_url" {
  value       = "https://${vercel_project.this.id}.vercel.app"
  description = "Vercel deployment URL"
}

output "domains" {
  value       = var.domains
  description = "List of custom domains assigned to the project"
}
