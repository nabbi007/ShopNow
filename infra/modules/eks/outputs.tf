output "cluster_name" {
  description = "EKS cluster name (use with: aws eks update-kubeconfig)"
  value       = aws_eks_cluster.this.name
}

output "cluster_endpoint" {
  description = "EKS API server endpoint"
  value       = aws_eks_cluster.this.endpoint
}

output "cluster_security_group_id" {
  description = "Cluster security group (attached to nodes; use to allow node/pod egress to RDS etc.)"
  value       = aws_eks_cluster.this.vpc_config[0].cluster_security_group_id
}

output "oidc_provider_arn" {
  description = "IRSA OIDC provider ARN"
  value       = aws_iam_openid_connect_provider.oidc.arn
}

output "alb_controller_role_arn" {
  description = "IAM role ARN for the AWS Load Balancer Controller service account"
  value       = aws_iam_role.lbc.arn
}
