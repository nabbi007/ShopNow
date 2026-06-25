output "cluster_arn" {
  description = "ARN of the ECS cluster"
  value       = aws_ecs_cluster.this.arn
}

output "cluster_name" {
  description = "Name of the ECS cluster"
  value       = aws_ecs_cluster.this.name
}

output "namespace_id" {
  description = "Cloud Map private DNS namespace ID"
  value       = aws_service_discovery_private_dns_namespace.this.id
}

output "namespace_name" {
  description = "Cloud Map namespace DNS name (e.g. shopnow.local)"
  value       = aws_service_discovery_private_dns_namespace.this.name
}

output "services_security_group_id" {
  description = "Security group shared by all ECS services"
  value       = aws_security_group.services.id
}

output "frontend_target_group_arn" {
  description = "ALB target group ARN for the frontend service"
  value       = aws_lb_target_group.frontend.arn
}

output "backend_target_group_arns" {
  description = "Map of service name -> ALB target group ARN"
  value       = { for k, tg in aws_lb_target_group.backend : k => tg.arn }
}

output "alb_dns_name" {
  description = "Public DNS name of the ALB"
  value       = aws_lb.this.dns_name
}

output "alb_arn" {
  description = "ARN of the shared ALB (used to add an EKS listener)"
  value       = aws_lb.this.arn
}

output "alb_security_group_id" {
  description = "Security group of the ALB"
  value       = aws_security_group.alb.id
}

output "execution_role_arn" {
  description = "ECS task execution role ARN"
  value       = aws_iam_role.execution.arn
}

output "task_role_arn" {
  description = "ECS task role ARN"
  value       = aws_iam_role.task.arn
}

output "alb_listener_arn" {
  description = "ARN of the ALB HTTP listener"
  value       = aws_lb_listener.http.arn
}
