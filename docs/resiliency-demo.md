# Resiliency demo — ECS & EKS self-healing

Kill a running container/pod in each environment and show the orchestrator
recreates it automatically (and, with >1 replica, traffic never drops).

Run in **Git Bash**. Capture three moments each: **before**, **killed**, **recovered**.

---

## ECS (Fargate) — ECS relaunches a stopped task

ECS keeps each service at its `desiredCount`; stop a task and it launches a replacement.

```bash
CLUSTER=shopnow-ecs
SVC=catalog            # any service works

# 1. BEFORE — note running count
aws ecs describe-services --cluster $CLUSTER --services $SVC \
  --query 'services[0].{desired:desiredCount,running:runningCount}' --output table

# 2. KILL — stop one running task
TASK=$(aws ecs list-tasks --cluster $CLUSTER --service-name $SVC --query 'taskArns[0]' --output text)
aws ecs stop-task --cluster $CLUSTER --task "$TASK" --reason "resiliency demo" \
  --query 'task.{stopped:lastStatus}' --output table

# 3. RECOVER — poll; watch running drop then return to desired (Git Bash has no `watch`)
for i in $(seq 1 12); do
  aws ecs describe-services --cluster $CLUSTER --services $SVC \
    --query 'services[0].{desired:desiredCount,running:runningCount,pending:pendingCount}' --output text
  sleep 10
done
```

**What to capture (`ecs-resiliency.png`):** the sequence going `running=1` →
(after stop) `running=0 pending=1` → back to `running=1`. ECS detected the
missing task and started a new one with **no manual action**.

*(Also visible in the console: ECS → cluster `shopnow-ecs` → service → Events
tab shows "service catalog has started 1 tasks".)*

---

## EKS — the ReplicaSet recreates a deleted pod

Each Deployment has **2 replicas**, so deleting one pod is **zero-downtime** —
the other serves while Kubernetes schedules a replacement.

```bash
# 1. BEFORE — two pods
kubectl get pods -n shopnow -l app=catalog

# 2. KILL — delete one pod
POD=$(kubectl get pods -n shopnow -l app=catalog -o jsonpath='{.items[0].metadata.name}')
kubectl delete pod -n shopnow "$POD"

# 3. RECOVER — watch the old pod Terminating and a new one ContainerCreating -> Running
kubectl get pods -n shopnow -l app=catalog -w
# (Ctrl-C once the new pod is Running and you're back to 2/2)
```

**What to capture (`eks-resiliency.png`):** `kubectl get pods` showing one pod
`Terminating` and a new pod `Running` — count restored to 2, with a fresh
`AGE`/name on the replacement.

### Optional — prove zero downtime (run during the kill)

In a second terminal, hammer the app while you delete the pod; every response
stays `200`:

```bash
while true; do
  curl -s -o /dev/null -w "%{http_code} " http://shopnow-alb-661706359.eu-west-1.elb.amazonaws.com:8080/api/products/
  sleep 1
done
# (Ctrl-C to stop) — a continuous stream of 200s through the pod deletion.
```

---

## Why it recovers (the mechanism)

| | ECS | EKS |
|---|---|---|
| Controller | ECS service scheduler | Deployment → ReplicaSet |
| Desired state | `desiredCount` | `replicas` |
| On loss | launches a new **task** | schedules a new **pod** |
| Traffic safety | ALB only routes to healthy targets | ALB only routes to healthy targets; surviving replica serves |

Same principle, different orchestrator: the control loop continuously
reconciles actual state back to desired state — no human intervention.
