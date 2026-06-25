# ShopNow — Microservices

The monolithic `backend/` split into four independently deployable services,
each owning its data. This is the "Code + Compose" stage — verified locally with
`docker-compose.microservices.yml`. ECS/EKS wiring comes next.

## Services

| Service | Routes | Data | Calls |
|---|---|---|---|
| **auth** | `/api/auth/*` | Postgres DB `auth` (`users`) | — (issues JWTs) |
| **catalog** | `/api/products/*` | Postgres DB `catalog` (`products`) | — |
| **cart** | `/api/cart/*` | Redis | catalog (product lookups) |
| **order** | `/api/orders/*` | Postgres DB `orders` | cart (read/clear), catalog (stock) |

`common/` is a shared library (JWT create/verify, base config) copied into each
image — so token validation logic isn't duplicated.

## Key design decisions

- **Database-per-service**: separate Postgres databases (`auth`, `catalog`,
  `orders`), created by `services/db/init.sql`. Services never touch each
  other's tables. Cart is Redis-only.
- **Auth without chatter**: auth issues a JWT carrying `sub`, `role`, `email`,
  `name`. Every other service **validates it locally** with the shared
  `SECRET_KEY` (`common.security.get_current_principal`) — no per-request call
  back to auth.
- **Service discovery**: by DNS — compose service names locally; Cloud Map on
  ECS; CoreDNS on EKS. The code only knows hostnames (`CATALOG_URL`, `CART_URL`).
- **Gateway**: nginx path-routes `/api/*` to each service (local stand-in for
  the ALB listener rules / EKS Ingress). The frontend is unchanged — it still
  calls `/api/auth`, `/api/products`, etc.
- **Checkout orchestration**: order-service reads the cart, decrements stock in
  catalog (atomic per product), writes the order, then clears the cart.
  ⚠️ This is a synchronous multi-service write; if a later step fails, earlier
  stock decrements aren't compensated. Production would use a **saga / outbox** —
  flagged in `order/app/routes.py` rather than over-built here.

## Run locally

```bash
docker compose -f docker-compose.microservices.yml up --build
```

Brings up: Postgres (3 DBs) + Redis + the 4 services + gateway + frontend, and
runs the two seeders (admin user, sample products).

Open http://localhost:8088 — same UI, now served by four services.

### Smoke test

```bash
# catalog (public)
curl localhost:8088/api/products/ | head

# auth → token (admin seeded by seed-auth)
TOKEN=$(curl -s localhost:8088/api/auth/login \
  -H 'content-type: application/json' \
  -d '{"email":"admin@shopnow.local","password":"Admin123!"}' | jq -r .access_token)

# cart (anonymous session)
curl -s localhost:8088/api/cart/ -H 'content-type: application/json' \
  -d '{"product_id":1,"quantity":2}'

# order (requires the token; identity comes from it)
curl -s localhost:8088/api/orders/me -H "authorization: Bearer $TOKEN"
```

## Layout

```
services/
  common/            # shared: security.py (JWT), config.py
  auth/    app/ ...  Dockerfile  requirements.txt
  catalog/ app/ ...
  cart/    app/ ...
  order/   app/ ...
  gateway/ default.conf   # nginx path routing
  db/      init.sql        # creates the per-service databases
```

Each image is built with context `services/` so `common/` can be copied in:
`docker build -f services/<svc>/Dockerfile services/`.

## Deploy to ECS (Fargate)

The Terraform now runs the 4 services on ECS: one `ecs-service` per service
(Cloud Map name `<svc>.shopnow.local`), an ALB target group + listener rule per
service (`/api/auth/*`→auth, `/api/products/*`→catalog, `/api/cart/*`→cart,
`/api/orders/*`→order, `/`→frontend), and a one-off `db-init` task that creates
the per-service databases on the shared RDS.

```bash
cd infra
REGION=eu-west-1
ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
REG=$ACCOUNT.dkr.ecr.$REGION.amazonaws.com

# 1. Create the ECR repos first
terraform apply -target=module.ecr

# 2. Build + push the 4 service images (+ frontend). Context is ../services so
#    the shared `common` package is included.
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $REG
for s in auth catalog cart order; do
  docker build --platform linux/amd64 -f ../services/$s/Dockerfile -t $REG/shopnow-$s:latest ../services
  docker push $REG/shopnow-$s:latest
done
docker build --platform linux/amd64 --build-arg REACT_APP_API_URL=/api -t $REG/shopnow-frontend:latest ../frontend
docker push $REG/shopnow-frontend:latest

# 3. Apply the rest (replaces the monolith backend service with the 4 services)
terraform apply

# 4. Create the per-service databases (one-off task). Services crash-loop until
#    this runs, then recover.
CLUSTER=$(terraform output -raw ecs_cluster_name)
SUBNETS=$(terraform output -json private_subnet_ids | tr -d '[]" \n')
SG=$(aws ec2 describe-security-groups --filters Name=group-name,Values=shopnow-services-sg --query 'SecurityGroups[0].GroupId' --output text)
NETCFG="awsvpcConfiguration={subnets=[$SUBNETS],securityGroups=[$SG],assignPublicIp=DISABLED}"

aws ecs run-task --cluster "$CLUSTER" --launch-type FARGATE \
  --task-definition "$(terraform output -raw db_init_task_family)" \
  --network-configuration "$NETCFG"

# 5. Seed catalog (products) + auth (admin) — run each service's seed once
aws ecs run-task --cluster "$CLUSTER" --launch-type FARGATE --task-definition shopnow-catalog \
  --network-configuration "$NETCFG" \
  --overrides '{"containerOverrides":[{"name":"catalog","command":["python","-m","app.seed"]}]}'
aws ecs run-task --cluster "$CLUSTER" --launch-type FARGATE --task-definition shopnow-auth \
  --network-configuration "$NETCFG" \
  --overrides '{"containerOverrides":[{"name":"auth","command":["python","-m","app.seed"]}]}'

# 6. Open the app
terraform output -raw alb_url
```

Admin login: `admin@shopnow.com` / `Admin123!`.

### Resiliency demo (ECS)

```bash
aws ecs list-tasks --cluster "$CLUSTER" --service-name order
aws ecs stop-task --cluster "$CLUSTER" --task <task-arn>
# ECS relaunches it back to desired count; the ALB only routes to healthy targets.
```

## Next (not done yet)

- **EKS**: extend `k8s/` from one backend to the 4 services (4 Deployments /
  Services + Ingress paths) — mirrors this ALB routing.
- **CI/CD**: extend the GitHub Actions build matrix from 2 images to 5.
