# Prod environment for agents-md-kit on OCI OKE

terraform {
  required_providers {
    oci = {
      source  = "oracle/oci"
      version = "~> 4.0"
    }
  }
}

provider "oci" {
  region = var.region
}

module "oke" {
  source = "../../modules/oci-oke"

  compartment_id = var.compartment_id
  cluster_name   = "agents-md-kit-prod"
  region         = var.region
  vcn_id         = var.vcn_id
  node_shape     = var.node_shape
  node_count     = var.node_count
  container_image = var.container_image
  namespace      = "agents-md-kit"
  service_name   = "agents-md-kit-prod"
  service_port   = 80
  target_port    = 3000
}

output "app_url" {
  value = module.oke.app_url
}
