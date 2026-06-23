output "service_name" {
  description = "Name of the ECS service"
  value       = aws_ecs_service.this.name
}

output "task_definition_arn" {
  description = "ARN of the task definition"
  value       = aws_ecs_task_definition.this.arn
}

output "discovery_dns" {
  description = "Cloud Map service-discovery name label"
  value       = aws_service_discovery_service.this.name
}

output "log_group_name" {
  description = "CloudWatch log group for this service"
  value       = aws_cloudwatch_log_group.this.name
}
