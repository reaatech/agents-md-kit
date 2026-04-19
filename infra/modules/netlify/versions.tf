terraform {
  required_version = ">= 1.0.0"

  required_providers {
    netlify = {
      source  = "netlify/netlify"
      version = ">= 2.0.0"
    }
  }
}
