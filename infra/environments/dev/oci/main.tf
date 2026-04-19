# Dev environment for agents-md-kit on OCI OKE

terraform {
  required_providers {
    oci = {
      source  = "oracle/oci"
      version = "~> 5.0"
    }
  }
  backend "s3" {
    bucket = "agents-md-kit-tfstate"
    key    = "dev/oci/terraform.tfstate"
    region = "us-west-2"
  }
}

provider "oci" {
  region = var.region
}

module "oke" {
  source = "../../modules/oci-oke"

  compartment_id = var.compartment_id
  vcn_id         = var.vcn_id
  cluster_name   = "agents-md-kit-dev"
  node_count     = var.node_count
  node_shape     = var.node_shape
  oke_version    = var.oke_version
}

output "cluster_endpoint" {
  value = module.oke.cluster_endpoint
}

output "kubeconfig" {
  value     = module.oke.kubeconfig
  sensitive = true
}
