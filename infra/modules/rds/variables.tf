variable "project_name" {
  description = "Name prefix for RDS resources"
  type        = string
}

variable "vpc_id" {
  description = "VPC to create the RDS security group in"
  type        = string
}

variable "subnet_ids" {
  description = "Private subnet IDs for the DB subnet group (>= 2 AZs)"
  type        = list(string)
}

variable "allowed_security_group_ids" {
  description = "Security groups allowed to connect to Postgres (e.g. the ECS services SG)"
  type        = list(string)
}

variable "db_name" {
  description = "Initial database name"
  type        = string
}

variable "username" {
  description = "Master username"
  type        = string
}

variable "password" {
  description = "Master password"
  type        = string
  sensitive   = true
}

variable "port" {
  description = "Postgres port"
  type        = number
  default     = 5432
}

variable "engine_version" {
  description = "PostgreSQL engine version (major-only allowed, e.g. \"16\")"
  type        = string
  default     = "16"
}

variable "instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "allocated_storage" {
  description = "Initial storage in GiB"
  type        = number
  default     = 20
}

variable "max_allocated_storage" {
  description = "Upper bound for storage autoscaling in GiB (0 disables autoscaling)"
  type        = number
  default     = 100
}

variable "multi_az" {
  description = "Deploy a standby in a second AZ for failover"
  type        = bool
  default     = false
}

variable "backup_retention_period" {
  description = "Automated backup retention in days (0 disables backups)"
  type        = number
  default     = 7
}

variable "storage_encrypted" {
  description = "Encrypt storage at rest (KMS). Recommended on."
  type        = bool
  default     = true
}

variable "deletion_protection" {
  description = "Block accidental deletion of the instance"
  type        = bool
  default     = false
}

variable "skip_final_snapshot" {
  description = "Skip the final snapshot on destroy (true is fine for labs)"
  type        = bool
  default     = true
}

variable "performance_insights_enabled" {
  description = "Enable RDS Performance Insights"
  type        = bool
  default     = false
}
