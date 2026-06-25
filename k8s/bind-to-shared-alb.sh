#!/usr/bin/env bash
# Bind the EKS Services to the SHARED ALB's EKS target groups (created by
# Terraform on the :8080 listener). The AWS Load Balancer Controller then
# registers each Service's pod IPs into its target group.
#
# Run AFTER:  kubectl apply -f k8s/   AND the LB controller is installed.
# Requires: terraform, jq, kubectl.
set -euo pipefail

INFRA="$(cd "$(dirname "$0")/../infra" && pwd)"
ARNS=$(cd "$INFRA" && terraform output -json eks_target_group_arns)

bind() {
  local svc="$1" port="$2"
  local arn
  arn=$(echo "$ARNS" | jq -r ".$svc")
  echo "binding $svc (port $port) -> $arn"
  kubectl apply -f - <<EOF
apiVersion: elbv2.k8s.aws/v1beta1
kind: TargetGroupBinding
metadata:
  name: $svc
  namespace: shopnow
spec:
  serviceRef:
    name: $svc
    port: $port
  targetGroupARN: $arn
  targetType: ip
EOF
}

bind auth 8000
bind catalog 8000
bind cart 8000
bind order 8000
bind frontend 80

echo
echo "Done. EKS app URL: $(cd "$INFRA" && terraform output -raw eks_alb_url)"
