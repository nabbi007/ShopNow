# ShopNow microservices on EKS

The same four services that run on ECS, deployed to **Amazon EKS** for the
ECS-vs-EKS benchmark. Reuses the **same VPC** and the **same RDS** as ECS
(databases already created + seeded there); **Redis runs in-cluster**.

| Service | Path (Ingress) | Data | Discovery |
|---|---|---|---|
| auth | `/api/auth/*` | RDS db `auth` | CoreDNS `auth` |
| catalog | `/api/products/*` | RDS db `catalog` | CoreDNS `catalog` |
| cart | `/api/cart/*` | Redis (in-cluster) | CoreDNS `cart` |
| order | `/api/orders/*` | RDS db `orders` | CoreDNS `order` |
| frontend | `/` | — | CoreDNS `frontend` |

| Concern | ECS (Fargate) | EKS |
|---|---|---|
| Service discovery | Cloud Map `*.shopnow.local` | CoreDNS `*.shopnow.svc.cluster.local` |
| Load balancing / routing | **Shared ALB**, `:80` listener | **Same ALB**, `:8080` listener (pods bound via TargetGroupBinding) |
| Self-healing | ECS desired-count | Deployment ReplicaSet |

**One ALB, two listeners:** rather than spinning up a second load balancer, EKS
reuses the ECS ALB. Terraform adds a `:8080` listener + EKS target groups; the
AWS Load Balancer Controller registers pod IPs into them via `TargetGroupBinding`
(`bind-to-shared-alb.sh`). So **ECS = `http://<alb>/`, EKS = `http://<alb>:8080/`**.

## Prerequisites

- Terraform applied (`cd infra && terraform apply`) → EKS cluster `shopnow-eks`,
  node group, OIDC, the ALB-controller IAM role, **and** the RDS SG rule that
  lets EKS pods reach the database.
- `kubectl`, `helm`, `aws` installed.
- The 4 service images + frontend pushed to ECR (done during the ECS step).

## 1. Point kubectl at the cluster

```bash
aws eks update-kubeconfig --region eu-west-1 --name shopnow-eks
kubectl get nodes
```

## 2. Install the AWS Load Balancer Controller (turns the Ingress into an ALB)

```bash
ROLE_ARN=$(cd ../infra && terraform output -raw eks_alb_controller_role_arn)
VPC_ID=$(cd ../infra && terraform output -raw vpc_id)

kubectl create serviceaccount aws-load-balancer-controller -n kube-system
kubectl annotate serviceaccount aws-load-balancer-controller -n kube-system \
  eks.amazonaws.com/role-arn="$ROLE_ARN"

helm repo add eks https://aws.github.io/eks-charts && helm repo update
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=shopnow-eks \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller \
  --set region=eu-west-1 \
  --set vpcId="$VPC_ID"

kubectl -n kube-system rollout status deploy/aws-load-balancer-controller
```

## 3. Namespace + secret

The secret holds one DB URL per service (pointing at the shared RDS) plus the
JWT key, so it's created via CLI, never committed.

```bash
kubectl apply -f 00-namespace.yaml

RDS_HOST=$(cd ../infra && terraform output -raw rds_endpoint | cut -d: -f1)
kubectl create secret generic shopnow-secrets -n shopnow \
  --from-literal=SECRET_KEY="dev-secret-key-change-in-production" \
  --from-literal=AUTH_DATABASE_URL="postgresql+asyncpg://shopnow:shopnow123@${RDS_HOST}:5432/auth" \
  --from-literal=CATALOG_DATABASE_URL="postgresql+asyncpg://shopnow:shopnow123@${RDS_HOST}:5432/catalog" \
  --from-literal=ORDER_DATABASE_URL="postgresql+asyncpg://shopnow:shopnow123@${RDS_HOST}:5432/orders"
```

## 4. Deploy the workloads

```bash
kubectl apply -f .
kubectl get pods -n shopnow -w     # wait for all Running (incl. frontend)
```

## 5. Attach the pods to the shared ALB

This binds each Service to its EKS target group on the ALB's `:8080` listener
(Terraform created the target groups + listener). Requires the LB controller
(step 2) to be running. Needs `jq`.

```bash
bash bind-to-shared-alb.sh
```

## 6. Get the URL

EKS shares the ECS ALB on the `:8080` listener:

```bash
cd ../infra && terraform output -raw eks_alb_url   # http://<alb-dns>:8080
```

Open that — ECS stays on `http://<alb-dns>/` (port 80), EKS on `:8080`. Give the
target groups ~1-2 min to register the pods and go healthy.

> **Data is already there.** EKS shares the RDS that the ECS step seeded
> (products + admin). If you're running EKS *without* the ECS deploy, create +
> seed the databases first (see the ECS runbook's db-init + seed steps), or run
> the seed as one-off pods:
> ```bash
> kubectl run seed-catalog -n shopnow --rm -i --restart=Never \
>   --image=259401054581.dkr.ecr.eu-west-1.amazonaws.com/shopnow-catalog:latest \
>   --env=DATABASE_URL="postgresql+asyncpg://shopnow:shopnow123@${RDS_HOST}:5432/catalog" \
>   --command -- python -m app.seed
> ```

Admin login: `admin@shopnow.com` / `Admin123!`.

## 6. Resiliency demo (EKS)

```bash
kubectl get pods -n shopnow
kubectl delete pod -n shopnow <order-pod-name>     # kill one
kubectl get pods -n shopnow -w                     # ReplicaSet recreates it
```

With 2 replicas per service the ALB keeps serving from the surviving pod while
Kubernetes reschedules the deleted one — the EKS equivalent of ECS relaunching
a stopped task.

## Teardown

```bash
kubectl delete -f .
helm uninstall aws-load-balancer-controller -n kube-system
```

## Notes

- **Images** are pinned to ECR account `259401054581` / `eu-west-1`. Change the
  `image:` lines if your account/region differ.
- **RDS access**: Terraform's `rds_from_eks` rule allows the EKS cluster SG into
  the RDS SG on 5432, so pods can reach the databases.
- **Config vs secrets**: `01-config.yaml` (ConfigMap) holds non-secret URLs;
  `shopnow-secrets` holds the DB URLs + JWT key. Unknown env vars are ignored by
  each service, so one ConfigMap serves all of them.
