variable "region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "eu-west-1"
}

variable "project_name" {
  description = "Name prefix for all resources"
  type        = string
  default     = "shopnow"
}

variable "environment" {
  description = "Deployment environment (dev/staging/prod). Used for tagging."
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "environment must be one of: dev, staging, prod."
  }
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"

  validation {
    condition     = can(cidrhost(var.vpc_cidr, 0))
    error_message = "vpc_cidr must be a valid IPv4 CIDR block."
  }
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

variable "image_tag" {
  description = <<-EOT
    Image tag to deploy for frontend & backend. Defaults to "latest" for lab
    convenience; for real deployments pass an immutable tag (e.g. the git SHA)
    so each release is traceable and rollbacks are deterministic.
  EOT
  type        = string
  default     = "latest"

  validation {
    condition     = can(regex("^[A-Za-z0-9._-]+$", var.image_tag))
    error_message = "image_tag must contain only letters, numbers, dot, underscore or dash."
  }
}

# --- Application configuration ---------------------------------------------
variable "db_name" {
  description = "Postgres database name"
  type        = string
  default     = "shopnow"
}

variable "db_username" {
  description = "Postgres username"
  type        = string
  default     = "shopnow"
}

variable "db_password" {
  description = "Postgres password. Override via tfvars/secret — do not rely on the default."
  type        = string
  default     = "shopnow123"
  sensitive   = true

  validation {
    condition     = length(var.db_password) >= 8
    error_message = "db_password must be at least 8 characters."
  }
}

variable "secret_key" {
  description = "Backend SECRET_KEY (JWT signing). Override via tfvars/secret in real envs."
  type        = string
  default     = "dev-secret-key-change-in-production"
  sensitive   = true

  validation {
    condition     = length(var.secret_key) >= 16
    error_message = "secret_key must be at least 16 characters."
  }
}

# --- RDS (managed PostgreSQL) ----------------------------------------------
variable "db_engine_version" {
  description = "PostgreSQL engine version for RDS (major-only allowed, e.g. \"16\")"
  type        = string
  default     = "16"
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "RDS initial storage in GiB"
  type        = number
  default     = 20

  validation {
    condition     = var.db_allocated_storage >= 20
    error_message = "db_allocated_storage must be at least 20 GiB."
  }
}

variable "db_multi_az" {
  description = "Run RDS with a standby in a second AZ (HA). Costs ~2x."
  type        = bool
  default     = false
}

variable "backend_desired_count" {
  description = "Number of backend task replicas"
  type        = number
  default     = 2

  validation {
    condition     = var.backend_desired_count >= 1
    error_message = "backend_desired_count must be at least 1."
  }
}

variable "frontend_desired_count" {
  description = "Number of frontend task replicas"
  type        = number
  default     = 2

  validation {
    condition     = var.frontend_desired_count >= 1
    error_message = "frontend_desired_count must be at least 1."
  }
}
