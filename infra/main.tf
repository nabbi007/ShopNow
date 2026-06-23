locals {
  frontend_repo = "${var.project_name}-frontend"
  backend_repo  = "${var.project_name}-backend"

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
  repository_names = [local.frontend_repo, local.backend_repo]
}

module "ecs_cluster" {
  source = "./modules/ecs-cluster"

  project_name      = var.project_name
  vpc_id            = module.network.vpc_id
  public_subnet_ids = module.network.public_subnet_ids
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

  backend_image  = "${module.ecr.repository_urls[local.backend_repo]}:${var.image_tag}"
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

# --- API tier: backend (FastAPI) -------------------------------------------
module "backend" {
  source = "./modules/ecs-service"

  name           = "backend"
  image          = local.backend_image
  container_port = 8000
  cpu            = 512
  memory         = 1024
  desired_count  = var.backend_desired_count

  environment = {
    DATABASE_URL = "postgresql+asyncpg://${var.db_username}:${var.db_password}@${module.rds.address}:${module.rds.port}/${var.db_name}"
    REDIS_URL    = "redis://redis.${local.namespace}:6379"
    SECRET_KEY   = var.secret_key
    CORS_ORIGINS = jsonencode(["http://${module.ecs_cluster.alb_dns_name}"])
  }

  project_name       = local.service_common.project_name
  region             = local.service_common.region
  cluster_arn        = local.service_common.cluster_arn
  subnet_ids         = local.service_common.subnet_ids
  security_group_ids = local.service_common.security_group_ids
  execution_role_arn = local.service_common.execution_role_arn
  task_role_arn      = local.service_common.task_role_arn
  namespace_id       = local.service_common.namespace_id

  depends_on = [module.rds, module.redis]
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

  environment = {
    BACKEND_HOST = "backend.${local.namespace}:8000"
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

  # Ensure the ALB listener exists before the service registers targets.
  depends_on = [module.ecs_cluster, module.backend]
}
