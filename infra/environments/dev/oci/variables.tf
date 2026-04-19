variable "compartment_id" {
  description = "OCI compartment ID"
  type        = string
}

variable "vcn_id" {
  description = "OCI VCN ID"
  type        = string
}

variable "region" {
  description = "OCI region"
  type        = string
  default     = "us-phoenix-1"
}

variable "node_count" {
  description = "Number of worker nodes"
  type        = number
  default     = 1
}

variable "node_shape" {
  description = "Shape of worker nodes"
  type        = string
  default     = "VM.Standard.E2.1"
}

variable "oke_version" {
  description = "OKE cluster version"
  type        = string
  default     = "v1.27.1"
}
