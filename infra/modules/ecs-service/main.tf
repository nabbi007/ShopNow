# ---------------------------------------------------------------------------
# Generic ECS Fargate service: a CloudWatch log group, a task definition, a
# Cloud Map service-discovery entry, and the ECS service itself. Reused for
# every tier (postgres, redis, backend, frontend) so the wiring stays DRY.
# ---------------------------------------------------------------------------

locals {
  attach_lb = var.target_group_arn != ""
}

resource "aws_cloudwatch_log_group" "this" {
  name              = "/ecs/${var.project_name}/${var.name}"
  retention_in_days = var.log_retention_days
}

resource "aws_ecs_task_definition" "this" {
  family                   = "${var.project_name}-${var.name}"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.cpu
  memory                   = var.memory
  execution_role_arn       = var.execution_role_arn
  task_role_arn            = var.task_role_arn

  container_definitions = jsonencode([
    {
      name      = var.name
      image     = var.image
      essential = true

      portMappings = [{
        containerPort = var.container_port
        protocol      = "tcp"
      }]

      environment = [for k, v in var.environment : { name = k, value = v }]

      # Only set "command" when an override was provided.
      command = length(var.command) > 0 ? var.command : null

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.this.name
          "awslogs-region"        = var.region
          "awslogs-stream-prefix" = var.name
        }
      }
    }
  ])
}

# Cloud Map service: registers task IPs as A records under the namespace, so
# other services resolve "<name>.<namespace>" (e.g. backend.shopnow.local).
resource "aws_service_discovery_service" "this" {
  name = var.name

  dns_config {
    namespace_id = var.namespace_id
    dns_records {
      type = "A"
      ttl  = 10
    }
    routing_policy = "MULTIVALUE"
  }

  health_check_custom_config {
    failure_threshold = 1
  }
}

resource "aws_ecs_service" "this" {
  name            = var.name
  cluster         = var.cluster_arn
  task_definition = aws_ecs_task_definition.this.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"

  # Allow ECS to register replacement tasks during a deploy/recovery.
  deployment_minimum_healthy_percent = 50
  deployment_maximum_percent         = 200

  health_check_grace_period_seconds = local.attach_lb ? var.health_check_grace_period_seconds : null

  network_configuration {
    subnets          = var.subnet_ids
    security_groups  = var.security_group_ids
    assign_public_ip = var.assign_public_ip
  }

  service_registries {
    registry_arn = aws_service_discovery_service.this.arn
  }

  dynamic "load_balancer" {
    for_each = local.attach_lb ? [1] : []
    content {
      target_group_arn = var.target_group_arn
      container_name   = var.name
      container_port   = var.container_port
    }
  }

  # Avoid fighting external scale changes on every apply.
  lifecycle {
    ignore_changes = [desired_count]
  }
}
