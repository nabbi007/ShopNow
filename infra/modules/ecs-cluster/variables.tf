variable "project_name" {
  description = "Name prefix for cluster-level resources"
  type        = string
}

variable "vpc_id" {
  description = "VPC the cluster runs in"
  type        = string
}

variable "public_subnet_ids" {
  description = "Public subnets for the ALB"
  type        = list(string)
}

variable "service_discovery_namespace" {
  description = "Private DNS namespace for Cloud Map service discovery"
  type        = string
  default     = "shopnow.local"
}

variable "frontend_container_port" {
  description = "Port the frontend (nginx) listens on"
  type        = number
  default     = 80
}

variable "frontend_health_check_path" {
  description = "ALB target group health check path for the frontend"
  type        = string
  default     = "/"
}

variable "backend_container_port" {
  description = "Port the backend (FastAPI) listens on"
  type        = number
  default     = 8000
}

variable "backend_health_check_path" {
  description = "ALB target group health check path for the backend"
  type        = string
  default     = "/health"
}

variable "backend_services" {
  description = <<-EOT
    Backend microservices to expose through the ALB. 
  EOT
  type = map(object({
    path_pattern      = string
    priority          = number
    health_check_path = optional(string, "/health")
  }))
  default = {}
}

variable "enable_container_insights" {
  description = "Enable CloudWatch Container Insights on the cluster"
  type        = bool
  default     = true
}
