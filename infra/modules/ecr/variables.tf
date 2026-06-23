variable "repository_names" {
  description = "List of ECR repository names to create"
  type        = list(string)
}

variable "force_delete" {
  description = "Allow deleting repositories that still contain images"
  type        = bool
  default     = true
}

variable "image_tag_mutability" {
  description = <<-EOT
    ECR tag mutability. "IMMUTABLE" is the production best practice (a pushed
    tag can never be overwritten, guaranteeing traceability). Defaults to
    "MUTABLE" because the lab redeploys the reusable "latest" tag; switch to
    IMMUTABLE once you deploy unique per-build tags (e.g. the git SHA).
  EOT
  type        = string
  default     = "MUTABLE"

  validation {
    condition     = contains(["MUTABLE", "IMMUTABLE"], var.image_tag_mutability)
    error_message = "image_tag_mutability must be MUTABLE or IMMUTABLE."
  }
}
