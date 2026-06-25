# ---------------------------------------------------------------------------
# ECS cluster module: the shared cluster, Cloud Map (service discovery)
# namespace, the public ALB that fronts the frontend, the security groups, and
# the IAM roles that task definitions assume.
# ---------------------------------------------------------------------------

# --- Cluster ----------------------------------------------------------------
resource "aws_ecs_cluster" "this" {
  name = "${var.project_name}-ecs"

  setting {
    name  = "containerInsights"
    value = var.enable_container_insights ? "enabled" : "disabled"
  }
}

resource "aws_ecs_cluster_capacity_providers" "this" {
  cluster_name       = aws_ecs_cluster.this.name
  capacity_providers = ["FARGATE", "FARGATE_SPOT"]

  default_capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight            = 1
  }
}

# --- Service discovery (Cloud Map private DNS namespace) --------------------
resource "aws_service_discovery_private_dns_namespace" "this" {
  name        = var.service_discovery_namespace
  description = "${var.project_name} internal service discovery"
  vpc         = var.vpc_id
}

# --- Security groups --------------------------------------------------------
# ALB: public HTTP in.
resource "aws_security_group" "alb" {
  name        = "${var.project_name}-alb-sg"
  description = "ALB ingress from the internet"
  vpc_id      = var.vpc_id

  ingress {
    description = "HTTP from anywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-alb-sg" }
}

# Shared services SG: frontend reachable from the ALB; all tiers reach each
# other (self-referencing) so backend<->db<->redis traffic flows internally.
resource "aws_security_group" "services" {
  name        = "${var.project_name}-services-sg"
  description = "ECS service-to-service and ALB-to-frontend traffic"
  vpc_id      = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-services-sg" }
}

resource "aws_security_group_rule" "frontend_from_alb" {
  type                     = "ingress"
  description              = "Frontend port from ALB"
  from_port                = var.frontend_container_port
  to_port                  = var.frontend_container_port
  protocol                 = "tcp"
  security_group_id        = aws_security_group.services.id
  source_security_group_id = aws_security_group.alb.id
}

resource "aws_security_group_rule" "services_self" {
  type              = "ingress"
  description       = "All traffic between services in this SG"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  security_group_id = aws_security_group.services.id
  self              = true
}

# Let the ALB reach the backend directly (ALB routes /api/* -> backend TG).
resource "aws_security_group_rule" "backend_from_alb" {
  type                     = "ingress"
  description              = "Backend port from ALB"
  from_port                = var.backend_container_port
  to_port                  = var.backend_container_port
  protocol                 = "tcp"
  security_group_id        = aws_security_group.services.id
  source_security_group_id = aws_security_group.alb.id
}

# --- Application Load Balancer ----------------------------------------------
resource "aws_lb" "this" {
  name               = "${var.project_name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = var.public_subnet_ids
}

resource "aws_lb_target_group" "frontend" {
  name        = "${var.project_name}-frontend-tg"
  port        = var.frontend_container_port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip" # Fargate awsvpc = task ENI IPs

  health_check {
    path                = var.frontend_health_check_path
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    matcher             = "200-399"
  }
}

# One target group per backend microservice (Fargate IP targets).
resource "aws_lb_target_group" "backend" {
  for_each = var.backend_services

  name        = "${var.project_name}-${each.key}-tg"
  port        = var.backend_container_port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    path                = each.value.health_check_path
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    matcher             = "200"
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.this.arn
  port              = 80
  protocol          = "HTTP"

  # Default: serve the SPA from the frontend.
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend.arn
  }
}

# One listener rule per service: path_pattern -> that service's target group.
# (Bypasses the frontend nginx and Cloud Map for north-south /api traffic.)
resource "aws_lb_listener_rule" "backend" {
  for_each = var.backend_services

  listener_arn = aws_lb_listener.http.arn
  priority     = each.value.priority

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend[each.key].arn
  }

  condition {
    path_pattern {
      values = [each.value.path_pattern]
    }
  }
}

# --- IAM roles --------------------------------------------------------------
data "aws_iam_policy_document" "ecs_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

# Execution role: lets the ECS agent pull from ECR and write logs.
resource "aws_iam_role" "execution" {
  name               = "${var.project_name}-ecs-execution"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume.json
}

resource "aws_iam_role_policy_attachment" "execution" {
  role       = aws_iam_role.execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Task role: identity the app containers run as. Minimal by default.
resource "aws_iam_role" "task" {
  name               = "${var.project_name}-ecs-task"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume.json
}
