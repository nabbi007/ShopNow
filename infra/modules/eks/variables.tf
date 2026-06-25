variable "cluster_name" {
  description = "EKS cluster name (must match the network module's subnet tags)"
  type        = string
}

variable "kubernetes_version" {
  description = "EKS Kubernetes version"
  type        = string
  default     = "1.31"
}

variable "vpc_id" {
  description = "VPC to deploy the cluster into"
  type        = string
}

variable "private_subnet_ids" {
  description = "Private subnets for the worker nodes (and control-plane ENIs)"
  type        = list(string)
}

variable "public_subnet_ids" {
  description = "Public subnets (control-plane ENIs + internet-facing ALB)"
  type        = list(string)
}

variable "node_instance_types" {
  description = "EC2 instance types for the managed node group"
  type        = list(string)
  default     = ["t3.medium"]
}

variable "node_desired_size" {
  description = "Desired worker node count"
  type        = number
  default     = 2
}

variable "node_min_size" {
  description = "Minimum worker node count"
  type        = number
  default     = 1
}

variable "node_max_size" {
  description = "Maximum worker node count"
  type        = number
  default     = 3
}
