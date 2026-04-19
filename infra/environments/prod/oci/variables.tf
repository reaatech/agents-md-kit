variable "compartment_id" {
  description = "OCI compartment ID"
  type        = string
}

variable "region" {
  description = "OCI region"
  type        = string
  default     = "us-phoenix-1"
}

variable "vcn_id" {
  description = "VCN ID for the cluster"
  type        = string
}

variable "node_shape" {
  description = "Shape of worker nodes"
  type        = string
  default     = "VM.Standard.E2.1"
}

variable "node_count" {
  description = "Number of worker nodes"
  type        = number
  default     = 3
}

variable "container_image" {
  description = "Container image URI"
  type        = string
  default     = "phx.ocir.io/oci-registry/agents-md-kit:latest"
}

variable "namespace" {
  description = "Kubernetes namespace"
  type        = string
  default     = "agents-md-kit"
}

variable "service_name" {
  description = "Kubernetes service name"
  type        = string
  default     = "agents-md-kit"
}

variable "service_port" {
  description = "Service port"
  type        = number
  default     = 80
}

variable "target_port" {
  description = "Target port on container"
  type        = number
  default     = 3000
}
