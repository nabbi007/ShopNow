output "alb_url" {
  description = "Public URL of the application (ECS frontend via ALB)"
  value       = "http://${module.ecs_cluster.alb_dns_name}"
}

output "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  value       = module.ecs_cluster.cluster_name
}

output "service_discovery_namespace" {
  description = "Cloud Map namespace for internal service discovery"
  value       = module.ecs_cluster.namespace_name
}

output "ecr_frontend_repository_url" {
  description = "Push the frontend image here"
  value       = module.ecr.repository_urls[local.frontend_repo]
}

output "ecr_backend_repository_url" {
  description = "Push the backend image here"
  value       = module.ecr.repository_urls[local.backend_repo]
}

output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint (host:port)"
  value       = module.rds.endpoint
}

output "vpc_id" {
  description = "VPC ID (shared with the EKS deployment)"
  value       = module.network.vpc_id
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = module.network.private_subnet_ids
}
