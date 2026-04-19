# Outputs for OCI OKE Module

output "cluster_id" {
  description = "The ID of the OKE cluster"
  value       = oci_containerengine_cluster.main.id
}

output "cluster_name" {
  description = "The name of the OKE cluster"
  value       = oci_containerengine_cluster.main.display_name
}

output "cluster_endpoint" {
  description = "The endpoint of the OKE cluster"
  value       = oci_containerengine_cluster.main.endpoints[0].endpoint
  sensitive   = true
}

output "vcn_id" {
  description = "The ID of the VCN"
  value       = oci_core_vcn.main.id
}

output "node_pool_id" {
  description = "The ID of the node pool"
  value       = oci_containerengine_node_pool.main.id
}

output "public_lb_subnet_id" {
  description = "The ID of the public load balancer subnet"
  value       = oci_core_subnet.public_lb.id
}

output "public_worker_subnet_id" {
  description = "The ID of the public worker subnet"
  value       = oci_core_subnet.public_worker.id
}

output "private_worker_subnet_id" {
  description = "The ID of the private worker subnet"
  value       = oci_core_subnet.private_worker.id
}

output "kubeconfig" {
  description = "Kubeconfig for the cluster"
  value       = oci_containerengine_cluster.main.kubeconfig
  sensitive   = true
}
