variable "compartment_id" {
  description = "Compartment ID for all resources"
  type        = string
}

variable "region" {
  description = "OCI region"
  type        = string
}

variable "vcn_cidr" {
  description = "CIDR block for the VCN"
  type        = string
  default     = "10.0.0.0/16"
}

variable "k8s_version" {
  description = "Kubernetes version for the OKE cluster"
  type        = string
  default     = "v1.28.0"
}

variable "node_shape" {
  description = "Compute shape for worker nodes"
  type        = string
  default     = "VM.Standard.E4.Flex"
}

variable "node_count" {
  description = "Number of worker nodes"
  type        = number
  default     = 2
}

variable "node_ocpus" {
  description = "Number of OCPUs per node"
  type        = number
  default     = 2
}

variable "node_memory" {
  description = "Amount of memory per node (GB)"
  type        = number
  default     = 16
}

variable "enable_public_endpoint" {
  description = "Whether to enable public endpoint for the cluster"
  type        = bool
  default     = true
}

variable "enable_private_endpoint" {
  description = "Whether to enable private endpoint for the cluster"
  type        = bool
  default     = false
}

variable "enable_autoscaling" {
  description = "Whether to enable autoscaling for node pool"
  type        = bool
  default     = true
}

variable "min_nodes" {
  description = "Minimum number of nodes"
  type        = number
  default     = 1
}

variable "max_nodes" {
  description = "Maximum number of nodes"
  type        = number
  default     = 5
}

variable "cluster_name" {
  description = "Name of the OKE cluster"
  type        = string
  default     = "agents-md-kit"
}

variable "environment" {
  description = "Environment name (e.g., dev, prod)"
  type        = string
  default     = "dev"
}

variable "tags" {
  description = "Additional tags for resources"
  type        = map(string)
  default     = {}
}

variable "enable_monitoring" {
  description = "Whether to enable monitoring for the cluster"
  type        = bool
  default     = true
}

variable "enable_logging" {
  description = "Whether to enable logging for the cluster"
  type        = bool
  default     = true
}

variable "pod_cidr" {
  description = "CIDR block for pods"
  type        = string
  default     = "10.244.0.0/16"
}

variable "service_cidr" {
  description = "CIDR block for services"
  type        = string
  default     = "10.96.0.0/16"
}

variable "enable_kubernetes_dashboard" {
  description = "Whether to enable Kubernetes dashboard"
  type        = bool
  default     = false
}

variable "enable_metrics_server" {
  description = "Whether to enable metrics server"
  type        = bool
  default     = true
}

variable "network_security_group_ids" {
  description = "List of NSG IDs to apply to the cluster"
  type        = list(string)
  default     = []
}

variable "kms_key_id" {
  description = "KMS key ID for secret encryption"
  type        = string
  default     = null
}

variable "image_os" {
  description = "Operating system for worker nodes"
  type        = string
  default     = "ORACLELINUX_9"
}
