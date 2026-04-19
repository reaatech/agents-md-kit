# Cloud Run module for agents-md-kit

variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "service_name" {
  description = "Cloud Run service name"
  type        = string
  default     = "agents-md-kit"
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

variable "memory" {
  description = "Memory allocation (Mi)"
  type        = number
  default     = 256
}

variable "cpu" {
  description = "CPU allocation"
  type        = number
  default     = 1
}

variable "max_instances" {
  description = "Maximum instances"
  type        = number
  default     = 10
}

variable "environment_variables" {
  description = "Environment variables"
  type        = map(string)
  default     = {}
}

# Cloud Run service
resource "google_cloud_run_service" "main" {
  name     = var.service_name
  location = var.region
  project  = var.project_id

  template {
    spec {
      containers {
        image = var.image

        resources {
          limits = {
            memory = "${var.memory}Mi"
            cpu    = var.cpu
          }
        }

        dynamic "env" {
          for_each = var.environment_variables
          content {
            name  = env.key
            value = env.value
          }
        }
      }

      container_concurrency = 80
      timeout_seconds       = 300
    }

    metadata {
      annotations = {
        "autoscaling.knative.dev/maxScale" = var.max_instances
        "run.googleapis.com/cloudsql-instances" = ""
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  lifecycle {
    ignore_changes = [
      template[0].metadata[0].annotations["client.knative.dev/user-image"],
      template[0].metadata[0].annotations["client.knative.dev/queue-proxy-autoscaling"],
    ]
  }
}

# IAM: Allow unauthenticated invocations
resource "google_cloud_run_service_iam_member" "public" {
  project  = var.project_id
  location = var.region
  service  = google_cloud_run_service.main.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

output "service_url" {
  value       = google_cloud_run_service.main.status[0].url
  description = "Cloud Run service URL"
}

output "service_name" {
  value       = google_cloud_run_service.main.name
  description = "Cloud Run service name"
}
