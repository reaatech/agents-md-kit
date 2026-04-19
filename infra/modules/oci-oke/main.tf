# OCI OKE (Container Engine for Kubernetes) Module for agents-md-kit

locals {
  common_tags = merge(
    {
      Name        = var.cluster_name
      Environment = var.environment
      ManagedBy   = "terraform"
      Project     = "agents-md-kit"
    },
    var.tags
  )
}

# VCN for OKE cluster
resource "oci_core_vcn" "main" {
  compartment_id = var.compartment_id
  cidr_block     = var.vcn_cidr
  display_name   = "${var.cluster_name}-vcn"
  dns_label      = "agentsmdkit"

  tags = local.common_tags
}

# Internet Gateway
resource "oci_core_internet_gateway" "main" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.main.id
  display_name   = "${var.cluster_name}-igw"
  enabled        = "true"

  tags = local.common_tags
}

# NAT Gateway for private subnets
resource "oci_core_nat_gateway" "main" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.main.id
  display_name   = "${var.cluster_name}-nat-gw"

  tags = local.common_tags
}

# Service Gateway for OCI services access
resource "oci_core_service_gateway" "main" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.main.id
  services {
    service_id = data.oci_core_services.all_services.services[0].id
  }
  display_name = "${var.cluster_name}-service-gw"

  tags = local.common_tags
}

data "oci_core_services" "all_services" {
  filter {
    name   = "type"
    values = ["OCI"]
  }
}

# Default Route Table
resource "oci_core_default_route_table" "main" {
  manage_default_resource_id = oci_core_vcn.main.default_route_table_id
  display_name               = "${var.cluster_name}-default-rt"

  route_rules {
    description       = "Traffic to the internet"
    destination       = "0.0.0.0/0"
    destination_type  = "CIDR_BLOCK"
    network_entity_id = oci_core_internet_gateway.main.id
  }

  route rules {
    description       = "Traffic to OCI services"
    destination       = data.oci_core_services.all_services.services[0].cidr_block
    destination_type  = "SERVICE_CIDR_BLOCK"
    network_entity_id = oci_core_service_gateway.main.id
  }

  tags = local.common_tags
}

# Public Subnet for Load Balancer
resource "oci_core_subnet" "public_lb" {
  compartment_id      = var.compartment_id
  vcn_id              = oci_core_vcn.main.id
  cidr_block          = cidrsubnet(var.vcn_cidr, 8, 1)
  display_name        = "${var.cluster_name}-public-lb-subnet"
  dns_label           = "publbsubnet"
  route_table_id      = oci_core_default_route_table.main.id
  security_list_ids   = [oci_core_vcn.main.default_security_list_id]
  prohibit_public_ip_on_vnic = false

  tags = local.common_tags
}

# Public Subnet for Worker Nodes
resource "oci_core_subnet" "public_worker" {
  compartment_id      = var.compartment_id
  vcn_id              = oci_core_vcn.main.id
  cidr_block          = cidrsubnet(var.vcn_cidr, 8, 2)
  display_name        = "${var.cluster_name}-public-worker-subnet"
  dns_label           = "pubwrksubnet"
  route_table_id      = oci_core_default_route_table.main.id
  security_list_ids   = [oci_core_security_list.worker.id]
  prohibit_public_ip_on_vnic = false

  tags = local.common_tags
}

# Private Subnet for Worker Nodes
resource "oci_core_subnet" "private_worker" {
  compartment_id      = var.compartment_id
  vcn_id              = oci_core_vcn.main.id
  cidr_block          = cidrsubnet(var.vcn_cidr, 8, 3)
  display_name        = "${var.cluster_name}-private-worker-subnet"
  dns_label           = "prvwrksubnet"
  route_table_id      = oci_core_default_route_table.main.id
  security_list_ids   = [oci_core_security_list.worker.id]
  prohibit_public_ip_on_vnic = true

  tags = local.common_tags
}

# Security List for Worker Nodes
resource "oci_core_security_list" "worker" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.main.id
  display_name   = "${var.cluster_name}-worker-security-list"

  egress_security_rules {
    destination = "0.0.0.0/0"
    protocol    = "all"
    description = "Allow all outbound traffic"
  }

  ingress_security_rules {
    protocol    = "6"
    source      = var.vcn_cidr
    description = "Allow inbound traffic from VCN"

    tcp_options {
      min_port = 0
      max_port = 65535
    }
  }

  ingress_security_rules {
    protocol    = "1"
    source      = var.vcn_cidr
    description = "Allow ICMP from VCN"
  }

  tags = local.common_tags
}

# OKE Cluster
resource "oci_containerengine_cluster" "main" {
  compartment_id     = var.compartment_id
  display_name       = var.cluster_name
  kubernetes_version = var.k8s_version
  vcn_id             = oci_core_vcn.main.id

  dynamic "endpoint_configs" {
    for_each = var.enable_public_endpoint ? [1] : []
    content {
      is_public_ip_enabled = true
      subnet_id            = oci_core_subnet.public_lb.id
    }
  }

  dynamic "endpoint_configs" {
    for_each = var.enable_private_endpoint ? [1] : []
    content {
      is_public_ip_enabled = false
      subnet_id            = oci_core_subnet.private_worker.id
    }
  }

  options {
    service_lb_subnet_ids = [oci_core_subnet.public_lb.id]

    dynamic "kubernetes_network_config" {
      for_each = [1]
      content {
        pods_cidr     = var.pod_cidr
        services_cidr = var.service_cidr
      }
    }

    dynamic "add_ons" {
      for_each = [1]
      content {
        is_kubernetes_dashboard_enabled = var.enable_kubernetes_dashboard
        is_tiller_enabled               = false
      }
    }

    dynamic "admission_controller_options" {
      for_each = [1]
      content {
        is_pod_security_policy_enabled = false
      }
    }

    dynamic "persistent_volume_config" {
      for_each = var.enable_monitoring ? [1] : []
      content {
        options {
          is_pv_encryption_in_transit_enabled = true
        }
      }
    }

    dynamic "service_lb_config" {
      for_each = [1]
      content {
        options {
          is_private_lba_capable = true
        }
      }
    }
  }

  tags = local.common_tags

  depends_on = [oci_core_nat_gateway.main]
}

# Node Pool
resource "oci_containerengine_node_pool" "main" {
  compartment_id     = var.compartment_id
  cluster_id         = oci_containerengine_cluster.main.id
  display_name       = "${var.cluster_name}-node-pool"
  kubernetes_version = var.k8s_version
  vcn_id             = oci_core_vcn.main.id

  node_shape = var.node_shape

  node_shape_config {
    ocpus         = var.node_ocpus
    memory_in_gbs = var.node_memory
  }

  node_source_details {
    image_id    = data.oci_core_images.node_image.images[0].id
    source_type = "IMAGE"
    boot_volume_size_in_gbs = "60"
  }

  subnet_ids = var.enable_public_endpoint ? [oci_core_subnet.public_worker.id] : [oci_core_subnet.private_worker.id]

  dynamic "node_config_details" {
    for_each = var.enable_autoscaling ? [1] : []
    content {
      size = var.node_count

      dynamic "placement_configs" {
        for_each = var.enable_autoscaling ? [1] : []
        content {
          availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
          subnet_id           = var.enable_public_endpoint ? oci_core_subnet.public_worker.id : oci_core_subnet.private_worker.id
        }
      }

      dynamic "nsg_ids" {
        for_each = var.network_security_group_ids
        content {
          nsg_id = var.network_security_group_ids[nsg_ids.key]
        }
      }
    }
  }

  dynamic "node_eviction_node_pool_settings" {
    for_each = var.enable_autoscaling ? [1] : []
    content {
      node_eviction_settings {
        is_force_delete_after_grace_period_enabled = true
        grace_period_in_seconds                    = 600
      }
    }
  }

  tags = local.common_tags
}

# Autoscaler configuration
resource "oci_containerengine_cluster_option" "main" {
  count = var.enable_autoscaling ? 1 : 0

  cluster_option_id = "all"
  option            = "all"
}

# Data sources
data "oci_identity_availability_domains" "ads" {
  compartment_id = var.compartment_id
}

data "oci_core_images" "node_image" {
  compartment_id           = var.compartment_id
  operating_system         = var.image_os
  sort_by                  = "TIMECREATED"
  sort_order               = "DESC"
}
