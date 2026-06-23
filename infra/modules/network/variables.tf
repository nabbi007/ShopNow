variable "project_name" {
  description = "Name prefix for all network resources"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDRs for public subnets (one per AZ)"
  type        = list(string)
  default     = ["10.0.0.0/20", "10.0.16.0/20"]
}

variable "private_subnet_cidrs" {
  description = "CIDRs for private subnets (one per AZ)"
  type        = list(string)
  default     = ["10.0.128.0/20", "10.0.144.0/20"]
}

variable "az_count" {
  description = "Number of Availability Zones to span"
  type        = number
  default     = 2
}

variable "eks_cluster_name" {
  description = "EKS cluster name used for subnet discovery tags (harmless to ECS)"
  type        = string
  default     = ""
}
