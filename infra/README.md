# ShopNow — ECS Fargate Infrastructure (Terraform)

Modular Terraform that provisions the network and deploys the full multi-tier
ShopNow app (frontend, backend, Redis, Postgres) to **Amazon ECS on Fargate**,
with **Cloud Map** service discovery and an **Application Load Balancer**.

## Module layout

```
infra/
├── main.tf                 # root: wires modules + the 4 service tiers
├── variables.tf            # region, project, subnets, app secrets
├── outputs.tf              # ALB URL, ECR URLs, cluster name, ...
├── versions.tf             # provider + version constraints
├── terraform.tfvars.example
└── modules/
    ├── network/            # VPC, public/private subnets, IGW, NAT, routes
    ├── ecr/                # ECR repositories (frontend, backend)
    ├── ecs-cluster/        # cluster, Cloud Map namespace, ALB, SGs, IAM roles
    └── ecs-service/        # GENERIC Fargate service (reused x4)
```

## Architecture

```
            Internet
               │
        ┌──────▼──────┐   public subnets
        │     ALB     │
        └──────┬──────┘
               │ :80
        ┌──────▼───────┐  private subnets (Fargate)
        │  frontend    │  nginx serves the SPA and proxies /api ─┐
        │  (x2 tasks)  │                                         │
        └──────────────┘                                         │
                                                          backend.shopnow.local:8000
        ┌──────────────┐                                         │
        │   backend    │◄────────────────────────────────────────┘
        │  (x2 tasks)  │ RDS endpoint:5432 / redis.shopnow.local:6379
        └──────┬───────┘
        ┌──────▼───────┐   ┌──────────────┐
        │  RDS (mgd    │   │    redis     │
        │  PostgreSQL) │   │  (Fargate)   │
        └──────────────┘   └──────────────┘
   Redis resolves via Cloud Map (shopnow.local); Postgres via its RDS endpoint.
```

## Prerequisites

- Terraform ≥ 1.5, AWS CLI v2, Docker
- AWS credentials with permissions for VPC, ECS, ECR, ELB, IAM, Cloud Map, CloudWatch

## Deploy

```bash
cd infra
cp terraform.tfvars.example terraform.tfvars   # edit secrets/region

# 1. Create ECR repos + network first (so we have somewhere to push images)
terraform init
terraform apply -target=module.ecr -target=module.network

# 2. Build & push images to ECR
FRONTEND_URL=$(terraform output -raw ecr_frontend_repository_url)
BACKEND_URL=$(terraform output -raw ecr_backend_repository_url)
REGION=$(terraform output -raw region 2>/dev/null || echo eu-west-1)
ACCOUNT=$(aws sts get-caller-identity --query Account --output text)

aws ecr get-login-password --region "$REGION" \
  | docker login --username AWS --password-stdin "$ACCOUNT.dkr.ecr.$REGION.amazonaws.com"

docker build -t "$BACKEND_URL:latest" ../backend
docker push "$BACKEND_URL:latest"

docker build -t "$FRONTEND_URL:latest" ../frontend
docker push "$FRONTEND_URL:latest"

# 3. Deploy everything
terraform apply

# 4. Open the app
terraform output alb_url
```

> **Note on the frontend image:** the build bakes `REACT_APP_API_URL=/api`
> (the Dockerfile default), so nginx proxies `/api` to `backend.shopnow.local`.
> No CORS or hard-coded backend host required.

## Seed sample products (one-off task)

Postgres starts empty. Run the seeder once as a standalone Fargate task using
the backend task definition with a command override:

```bash
CLUSTER=$(terraform output -raw ecs_cluster_name)
# Grab the backend task def, private subnets, and the services SG from the console
# or via `aws ecs list-task-definitions` / `terraform state show`, then:
aws ecs run-task \
  --cluster "$CLUSTER" \
  --launch-type FARGATE \
  --task-definition shopnow-backend \
  --network-configuration "awsvpcConfiguration={subnets=[<priv-subnet-ids>],securityGroups=[<services-sg>],assignPublicIp=DISABLED}" \
  --overrides '{"containerOverrides":[{"name":"backend","command":["python","-m","app.seed"]}]}'
```

## Resiliency demo (ECS)

ECS keeps `desired_count` tasks running. Kill one and watch it come back:

```bash
CLUSTER=$(terraform output -raw ecs_cluster_name)
# list running backend tasks
aws ecs list-tasks --cluster "$CLUSTER" --service-name backend
# stop one
aws ecs stop-task --cluster "$CLUSTER" --task <task-arn>
# observe ECS launch a replacement back to desired_count
watch -n2 "aws ecs describe-services --cluster $CLUSTER --services backend \
  --query 'services[0].{desired:desiredCount,running:runningCount}'"
```

The ALB keeps serving traffic from the surviving task while ECS replaces the
stopped one.

## Destroy

```bash
terraform destroy
```

## Conventions

- **State**: stored remotely in the `shopnow-tf-state` S3 bucket
  ([`backend.tf`](backend.tf)) with **native S3 state locking**
  (`use_lockfile = true`, Terraform ≥ 1.10) — no DynamoDB table required. Set the
  backend `region` to the bucket's region. Migrate existing local state with
  `terraform init -migrate-state`.
- **Tags**: `Project`, `Environment`, `ManagedBy` are applied to every resource
  via provider `default_tags`. Set `environment` (`dev`/`staging`/`prod`) in your
  tfvars.
- **Input validation**: root variables validate CIDR format, secret length,
  replica counts, and image-tag charset, so bad input fails at `plan` rather than
  mid-apply.
- **Secrets**: `db_password` / `secret_key` are `sensitive` and length-validated.
  Override them in `terraform.tfvars` (gitignored) — the committed defaults are
  lab-only.
- **Image tags**: `image_tag` defaults to `latest` for lab convenience; the ECR
  `image_tag_mutability` variable defaults to `MUTABLE` to allow redeploying that
  tag. For real deploys, use an immutable per-build tag (git SHA) and set
  `image_tag_mutability = "IMMUTABLE"`.

## Notes / trade-offs (lab scope)

These gaps are intentional for the lab; close them before production:

- **Postgres is managed RDS** (encrypted gp3 storage, automated backups, optional
  Multi-AZ via `db_multi_az`); the backend connects over the RDS endpoint. Set
  `db_multi_az = true` and raise `db_instance_class` for production HA.
- **Redis still runs as a Fargate task** (not ElastiCache) to keep the cache tier
  cheap; its data is ephemeral. Swap to ElastiCache for production and inject the
  endpoint via the same `REDIS_URL` env var.
- **Single NAT gateway** to control cost (one AZ egress). Use one-per-AZ for HA.
- **HTTP-only ALB.** Add an ACM cert + HTTPS listener (and HTTP→HTTPS redirect)
  for real use.
- **Plaintext secrets** in task-definition env vars. Source them from AWS Secrets
  Manager / SSM Parameter Store via the task definition `secrets` block instead.
- **No VPC Flow Logs / WAF / customer-managed KMS** — add for auditing and edge
  security in production.
```
