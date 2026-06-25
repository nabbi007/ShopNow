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

output "ecr_service_repository_urls" {
  description = "Map of microservice -> ECR repo URL (push auth/catalog/cart/order here)"
  value       = { for s, repo in local.service_repos : s => module.ecr.repository_urls[repo] }
}

output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint (host:port)"
  value       = module.rds.endpoint
}

output "db_init_task_family" {
  description = "One-off task that creates the per-service databases (aws ecs run-task)"
  value       = aws_ecs_task_definition.db_init.family
}

# --- EKS ---
output "eks_cluster_name" {
  description = "EKS cluster name (aws eks update-kubeconfig --name <this>)"
  value       = module.eks.cluster_name
}

output "eks_alb_controller_role_arn" {
  description = "IAM role ARN to annotate the aws-load-balancer-controller service account with"
  value       = module.eks.alb_controller_role_arn
}

output "eks_target_group_arns" {
  description = "Map of EKS service -> target group ARN (bind via TargetGroupBinding)"
  value       = { for k, tg in aws_lb_target_group.eks : k => tg.arn }
}

output "eks_alb_url" {
  description = "EKS app URL (same ALB as ECS, on the :8080 listener)"
  value       = "http://${module.ecs_cluster.alb_dns_name}:8080"
}

output "vpc_id" {
  description = "VPC ID (shared with the EKS deployment)"
  value       = module.network.vpc_id
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = module.network.private_subnet_ids
}
