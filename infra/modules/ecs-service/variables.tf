variable "name" {
  description = "Logical service name (also the Cloud Map DNS label, e.g. 'backend')"
  type        = string
}

variable "project_name" {
  description = "Name prefix for resources"
  type        = string
}

variable "region" {
  description = "AWS region (for the awslogs driver)"
  type        = string
}

variable "cluster_arn" {
  description = "ARN of the ECS cluster to run in"
  type        = string
}

variable "image" {
  description = "Full container image reference (repo:tag)"
  type        = string
}

variable "container_port" {
  description = "Port the container listens on"
  type        = number
}

variable "cpu" {
  description = "Fargate task CPU units (256, 512, 1024, ...)"
  type        = number
  default     = 256
}

variable "memory" {
  description = "Fargate task memory in MiB"
  type        = number
  default     = 512
}

variable "desired_count" {
  description = "Number of task replicas to run"
  type        = number
  default     = 2
}

variable "environment" {
  description = "Environment variables for the container"
  type        = map(string)
  default     = {}
}

variable "command" {
  description = "Optional container command override"
  type        = list(string)
  default     = []
}

variable "subnet_ids" {
  description = "Subnets to place the tasks in (private)"
  type        = list(string)
}

variable "security_group_ids" {
  description = "Security groups attached to the task ENIs"
  type        = list(string)
}

variable "execution_role_arn" {
  description = "ECS task execution role ARN"
  type        = string
}

variable "task_role_arn" {
  description = "ECS task role ARN"
  type        = string
}

variable "namespace_id" {
  description = "Cloud Map namespace ID to register the service in"
  type        = string
}

variable "assign_public_ip" {
  description = "Assign public IPs to tasks (false when using a NAT)"
  type        = bool
  default     = false
}

variable "target_group_arn" {
  description = "Optional ALB target group ARN to attach (empty = no ALB)"
  type        = string
  default     = ""
}

variable "health_check_grace_period_seconds" {
  description = "Grace period before ALB health checks count (only with ALB)"
  type        = number
  default     = 60
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 30

  validation {
    # Valid CloudWatch Logs retention values.
    condition = contains(
      [1, 3, 5, 7, 14, 30, 60, 90, 120, 150, 180, 365, 400, 545, 731, 1096, 1827, 2192, 2557, 2922, 3288, 3653],
      var.log_retention_days
    )
    error_message = "log_retention_days must be a valid CloudWatch Logs retention value."
  }
}
