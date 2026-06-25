locals {
  frontend_repo = "${var.project_name}-frontend"

  # Backend microservices (Cloud Map name == service key == ECR repo suffix).
  service_names = ["auth", "catalog", "cart", "order"]
  service_repos = { for s in local.service_names : s => "${var.project_name}-${s}" }

  eks_cluster_name = "${var.project_name}-eks" # reserved for the EKS step
}

module "network" {
  source = "./modules/network"

  project_name         = var.project_name
  vpc_cidr             = var.vpc_cidr
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
  eks_cluster_name     = local.eks_cluster_name
}

module "ecr" {
  source           = "./modules/ecr"
  repository_names = concat([local.frontend_repo], values(local.service_repos))
}

# --- EKS cluster (benchmarked against the ECS deployment) -------------------
# Reuses the same VPC/subnets; the network module already tags them for this
# cluster name. The app is deployed to it via the manifests in ../k8s.
module "eks" {
  source = "./modules/eks"

  cluster_name       = local.eks_cluster_name
  vpc_id             = module.network.vpc_id
  private_subnet_ids = module.network.private_subnet_ids
  public_subnet_ids  = module.network.public_subnet_ids
}

# Let EKS pods (egress via the node ENIs / cluster SG) reach the shared RDS.
resource "aws_security_group_rule" "rds_from_eks" {
  type                     = "ingress"
  description              = "Postgres from EKS nodes/pods"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  security_group_id        = module.rds.security_group_id
  source_security_group_id = module.eks.cluster_security_group_id
}

# ---------------------------------------------------------------------------
# Shared ALB: EKS routing on a SECOND listener (:8080), reusing the ECS ALB
# instead of provisioning a separate one. ECS serves on :80, EKS on :8080.
#
# These target groups start empty; EKS pod IPs are registered into them by the
# AWS Load Balancer Controller via TargetGroupBinding (see k8s/). Path routing
# mirrors the ECS rules.
# ---------------------------------------------------------------------------
locals {
  # port 80 = frontend, 8000 = the API services. path = null -> default action.
  eks_alb_services = {
    frontend = { port = 80, path = null, priority = null }
    auth     = { port = 8000, path = "/api/auth/*", priority = 10 }
    catalog  = { port = 8000, path = "/api/products/*", priority = 20 }
    cart     = { port = 8000, path = "/api/cart/*", priority = 30 }
    order    = { port = 8000, path = "/api/orders/*", priority = 40 }
  }
}

resource "aws_lb_target_group" "eks" {
  for_each = local.eks_alb_services

  name        = "${var.project_name}-eks-${each.key}-tg"
  port        = each.value.port
  protocol    = "HTTP"
  vpc_id      = module.network.vpc_id
  target_type = "ip"

  health_check {
    path                = "/health" # services answer it; frontend SPA fallback -> 200
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    matcher             = "200-399"
  }
}

resource "aws_lb_listener" "eks" {
  load_balancer_arn = module.ecs_cluster.alb_arn
  port              = 8080
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.eks["frontend"].arn
  }
}

resource "aws_lb_listener_rule" "eks" {
  for_each = { for k, v in local.eks_alb_services : k => v if v.path != null }

  listener_arn = aws_lb_listener.eks.arn
  priority     = each.value.priority

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.eks[each.key].arn
  }

  condition {
    path_pattern {
      values = [each.value.path]
    }
  }
}

# Open the EKS listener port on the ALB to the internet.
resource "aws_security_group_rule" "alb_eks_http" {
  type              = "ingress"
  description       = "EKS HTTP listener (8080) from anywhere"
  from_port         = 8080
  to_port           = 8080
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = module.ecs_cluster.alb_security_group_id
}

# Allow the ALB to reach EKS pods (TargetGroupBindings omit networking, so we
# manage the pod-side access here) on both the API and frontend ports.
resource "aws_security_group_rule" "eks_from_alb_api" {
  type                     = "ingress"
  description              = "EKS service pods from ALB"
  from_port                = 8000
  to_port                  = 8000
  protocol                 = "tcp"
  security_group_id        = module.eks.cluster_security_group_id
  source_security_group_id = module.ecs_cluster.alb_security_group_id
}

resource "aws_security_group_rule" "eks_from_alb_frontend" {
  type                     = "ingress"
  description              = "EKS frontend pods from ALB"
  from_port                = 80
  to_port                  = 80
  protocol                 = "tcp"
  security_group_id        = module.eks.cluster_security_group_id
  source_security_group_id = module.ecs_cluster.alb_security_group_id
}

module "ecs_cluster" {
  source = "./modules/ecs-cluster"

  project_name      = var.project_name
  vpc_id            = module.network.vpc_id
  public_subnet_ids = module.network.public_subnet_ids

  # ALB path routing -> one target group + rule per microservice.
  backend_services = {
    auth    = { path_pattern = "/api/auth/*", priority = 10 }
    catalog = { path_pattern = "/api/products/*", priority = 20 }
    cart    = { path_pattern = "/api/cart/*", priority = 30 }
    order   = { path_pattern = "/api/orders/*", priority = 40 }
  }
}

# Shared inputs for every service.
locals {
  namespace = module.ecs_cluster.namespace_name # shopnow.local

  service_common = {
    project_name       = var.project_name
    region             = var.region
    cluster_arn        = module.ecs_cluster.cluster_arn
    subnet_ids         = module.network.private_subnet_ids
    security_group_ids = [module.ecs_cluster.services_security_group_id]
    execution_role_arn = module.ecs_cluster.execution_role_arn
    task_role_arn      = module.ecs_cluster.task_role_arn
    namespace_id       = module.ecs_cluster.namespace_id
  }

  service_images = { for s in local.service_names : s => "${module.ecr.repository_urls[local.service_repos[s]]}:${var.image_tag}" }
  frontend_image = "${module.ecr.repository_urls[local.frontend_repo]}:${var.image_tag}"
}

# --- Data tier: managed PostgreSQL (RDS) ------------------------------------
module "rds" {
  source = "./modules/rds"

  project_name = var.project_name
  vpc_id       = module.network.vpc_id
  subnet_ids   = module.network.private_subnet_ids

  # Only the ECS services (backend) may reach the database.
  allowed_security_group_ids = [module.ecs_cluster.services_security_group_id]

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  engine_version    = var.db_engine_version
  instance_class    = var.db_instance_class
  allocated_storage = var.db_allocated_storage
  multi_az          = var.db_multi_az
}

# --- Cache tier: Redis ------------------------------------------------------
module "redis" {
  source = "./modules/ecs-service"

  name           = "redis"
  image          = "redis:7-alpine"
  container_port = 6379
  cpu            = 256
  memory         = 512
  desired_count  = 1

  project_name       = local.service_common.project_name
  region             = local.service_common.region
  cluster_arn        = local.service_common.cluster_arn
  subnet_ids         = local.service_common.subnet_ids
  security_group_ids = local.service_common.security_group_ids
  execution_role_arn = local.service_common.execution_role_arn
  task_role_arn      = local.service_common.task_role_arn
  namespace_id       = local.service_common.namespace_id
}

# --- API tier: microservices ------------------------------------------------
# Each owns its data and registers <name>.shopnow.local in Cloud Map. The ALB
# routes /api/<area>/* to each (target groups from the ecs_cluster module);
# inter-service calls go over Cloud Map DNS.

# auth-service -> DB "auth"
module "auth" {
  source = "./modules/ecs-service"

  name           = "auth"
  image          = local.service_images["auth"]
  container_port = 8000
  cpu            = 256
  memory         = 512
  desired_count  = 1

  environment = {
    DATABASE_URL = "postgresql+asyncpg://${var.db_username}:${var.db_password}@${module.rds.address}:${module.rds.port}/auth"
    SECRET_KEY   = var.secret_key
    CORS_ORIGINS = jsonencode(["http://${module.ecs_cluster.alb_dns_name}"])
  }

  target_group_arn   = module.ecs_cluster.backend_target_group_arns["auth"]
  project_name       = local.service_common.project_name
  region             = local.service_common.region
  cluster_arn        = local.service_common.cluster_arn
  subnet_ids         = local.service_common.subnet_ids
  security_group_ids = local.service_common.security_group_ids
  execution_role_arn = local.service_common.execution_role_arn
  task_role_arn      = local.service_common.task_role_arn
  namespace_id       = local.service_common.namespace_id

  depends_on = [module.rds, module.ecs_cluster]
}

# catalog-service -> DB "catalog"
module "catalog" {
  source = "./modules/ecs-service"

  name           = "catalog"
  image          = local.service_images["catalog"]
  container_port = 8000
  cpu            = 256
  memory         = 512
  desired_count  = 1

  environment = {
    DATABASE_URL = "postgresql+asyncpg://${var.db_username}:${var.db_password}@${module.rds.address}:${module.rds.port}/catalog"
    SECRET_KEY   = var.secret_key
    CORS_ORIGINS = jsonencode(["http://${module.ecs_cluster.alb_dns_name}"])
  }

  target_group_arn   = module.ecs_cluster.backend_target_group_arns["catalog"]
  project_name       = local.service_common.project_name
  region             = local.service_common.region
  cluster_arn        = local.service_common.cluster_arn
  subnet_ids         = local.service_common.subnet_ids
  security_group_ids = local.service_common.security_group_ids
  execution_role_arn = local.service_common.execution_role_arn
  task_role_arn      = local.service_common.task_role_arn
  namespace_id       = local.service_common.namespace_id

  depends_on = [module.rds, module.ecs_cluster]
}

# cart-service -> Redis; calls catalog over Cloud Map
module "cart" {
  source = "./modules/ecs-service"

  name           = "cart"
  image          = local.service_images["cart"]
  container_port = 8000
  cpu            = 256
  memory         = 512
  desired_count  = 1

  environment = {
    REDIS_URL    = "redis://redis.${local.namespace}:6379"
    CATALOG_URL  = "http://catalog.${local.namespace}:8000"
    CORS_ORIGINS = jsonencode(["http://${module.ecs_cluster.alb_dns_name}"])
  }

  target_group_arn   = module.ecs_cluster.backend_target_group_arns["cart"]
  project_name       = local.service_common.project_name
  region             = local.service_common.region
  cluster_arn        = local.service_common.cluster_arn
  subnet_ids         = local.service_common.subnet_ids
  security_group_ids = local.service_common.security_group_ids
  execution_role_arn = local.service_common.execution_role_arn
  task_role_arn      = local.service_common.task_role_arn
  namespace_id       = local.service_common.namespace_id

  depends_on = [module.redis, module.catalog, module.ecs_cluster]
}

# order-service -> DB "orders"; orchestrates cart + catalog over Cloud Map
module "order" {
  source = "./modules/ecs-service"

  name           = "order"
  image          = local.service_images["order"]
  container_port = 8000
  cpu            = 256
  memory         = 512
  desired_count  = 1

  environment = {
    DATABASE_URL = "postgresql+asyncpg://${var.db_username}:${var.db_password}@${module.rds.address}:${module.rds.port}/orders"
    SECRET_KEY   = var.secret_key
    CATALOG_URL  = "http://catalog.${local.namespace}:8000"
    CART_URL     = "http://cart.${local.namespace}:8000"
    CORS_ORIGINS = jsonencode(["http://${module.ecs_cluster.alb_dns_name}"])
  }

  target_group_arn   = module.ecs_cluster.backend_target_group_arns["order"]
  project_name       = local.service_common.project_name
  region             = local.service_common.region
  cluster_arn        = local.service_common.cluster_arn
  subnet_ids         = local.service_common.subnet_ids
  security_group_ids = local.service_common.security_group_ids
  execution_role_arn = local.service_common.execution_role_arn
  task_role_arn      = local.service_common.task_role_arn
  namespace_id       = local.service_common.namespace_id

  depends_on = [module.rds, module.catalog, module.cart, module.ecs_cluster]
}

# --- Web tier: frontend (nginx + SPA), attached to the ALB ------------------
module "frontend" {
  source = "./modules/ecs-service"

  name           = "frontend"
  image          = local.frontend_image
  container_port = 80
  cpu            = 256
  memory         = 512
  desired_count  = var.frontend_desired_count

  # On ECS the ALB routes /api/* to the services directly, so the frontend's
  # nginx /api proxy is never hit — BACKEND_HOST just needs to resolve at nginx
  # startup, so we point it at an existing service (catalog).
  environment = {
    BACKEND_HOST = "catalog.${local.namespace}:8000"
  }

  target_group_arn = module.ecs_cluster.frontend_target_group_arn

  project_name       = local.service_common.project_name
  region             = local.service_common.region
  cluster_arn        = local.service_common.cluster_arn
  subnet_ids         = local.service_common.subnet_ids
  security_group_ids = local.service_common.security_group_ids
  execution_role_arn = local.service_common.execution_role_arn
  task_role_arn      = local.service_common.task_role_arn
  namespace_id       = local.service_common.namespace_id

  # Frontend nginx resolves catalog.shopnow.local at startup, so wait for it.
  depends_on = [module.ecs_cluster, module.catalog]
}

# --- One-off DB initialization ---------------------------------------------
# RDS is private, so Terraform can't CREATE DATABASE directly. This task def is
# run once (aws ecs run-task) to create the per-service databases. See README.
resource "aws_cloudwatch_log_group" "db_init" {
  name              = "/ecs/${var.project_name}/db-init"
  retention_in_days = 7
}

resource "aws_ecs_task_definition" "db_init" {
  family                   = "${var.project_name}-db-init"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 256
  memory                   = 512
  execution_role_arn       = module.ecs_cluster.execution_role_arn

  container_definitions = jsonencode([
    {
      name      = "db-init"
      image     = "postgres:16-alpine"
      essential = true
      environment = [
        { name = "PGHOST", value = module.rds.address },
        { name = "PGPORT", value = tostring(module.rds.port) },
        { name = "PGUSER", value = var.db_username },
        { name = "PGPASSWORD", value = var.db_password },
        { name = "PGDATABASE", value = var.db_name },
      ]
      # Idempotent: CREATE DATABASE errors are ignored if the DB already exists.
      command = [
        "sh", "-c",
        "for db in auth catalog orders; do psql -v ON_ERROR_STOP=0 -c \"CREATE DATABASE $db\" || true; done"
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.db_init.name
          "awslogs-region"        = var.region
          "awslogs-stream-prefix" = "db-init"
        }
      }
    }
  ])
}
