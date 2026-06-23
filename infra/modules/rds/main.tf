# ---------------------------------------------------------------------------
# RDS module: managed PostgreSQL for the backend, replacing the self-managed
# postgres Fargate task. Lives in private subnets; reachable only from the
# allowed security groups (the ECS services SG) on the Postgres port.
# ---------------------------------------------------------------------------

resource "aws_db_subnet_group" "this" {
  name       = "${var.project_name}-db-subnet"
  subnet_ids = var.subnet_ids

  tags = { Name = "${var.project_name}-db-subnet" }
}

resource "aws_security_group" "rds" {
  name        = "${var.project_name}-rds-sg"
  description = "Postgres access from ECS services"
  vpc_id      = var.vpc_id

  egress {
    description = "Allow all egress"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-rds-sg" }
}

# One ingress rule per allowed source SG (e.g. the ECS services SG).
# Uses count, not for_each: the source SG IDs are created in the same apply and
# are unknown at plan time, which a for_each key cannot tolerate. The list
# length is static, so count plans cleanly.
resource "aws_security_group_rule" "ingress" {
  count = length(var.allowed_security_group_ids)

  type                     = "ingress"
  description              = "Postgres from allowed security group"
  from_port                = var.port
  to_port                  = var.port
  protocol                 = "tcp"
  security_group_id        = aws_security_group.rds.id
  source_security_group_id = var.allowed_security_group_ids[count.index]
}

resource "aws_db_instance" "this" {
  identifier = "${var.project_name}-postgres"

  engine         = "postgres"
  engine_version = var.engine_version
  instance_class = var.instance_class

  allocated_storage     = var.allocated_storage
  max_allocated_storage = var.max_allocated_storage > 0 ? var.max_allocated_storage : null
  storage_type          = "gp3"
  storage_encrypted     = var.storage_encrypted

  db_name  = var.db_name
  username = var.username
  password = var.password
  port     = var.port

  db_subnet_group_name   = aws_db_subnet_group.this.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  multi_az               = var.multi_az
  publicly_accessible    = false

  backup_retention_period      = var.backup_retention_period
  deletion_protection          = var.deletion_protection
  skip_final_snapshot          = var.skip_final_snapshot
  final_snapshot_identifier    = var.skip_final_snapshot ? null : "${var.project_name}-postgres-final"
  performance_insights_enabled = var.performance_insights_enabled
  auto_minor_version_upgrade   = true
  apply_immediately            = true

  tags = { Name = "${var.project_name}-postgres" }
}
