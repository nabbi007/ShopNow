# ---------------------------------------------------------------------------
# GitHub Actions OIDC deploy role.

variable "github_repo" {
  description = "GitHub repository (owner/name) allowed to assume the deploy role"
  type        = string
  default     = "nabbi007/ShopNow"
}

resource "aws_iam_openid_connect_provider" "github" {
  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = ["1b511abead59c6ce207077c0bf0e0043b1382612"]
}

data "aws_iam_policy_document" "gha_assume" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    # Restrict to this repository. Tighten further to a branch/environment with
    # e.g. "repo:${var.github_repo}:ref:refs/heads/main" once you're confident.
    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:${var.github_repo}:*"]
    }
  }
}

resource "aws_iam_role" "gha_deploy" {
  name                 = "${var.project_name}-gha-deploy"
  assume_role_policy   = data.aws_iam_policy_document.gha_assume.json
  max_session_duration = 3600
}

resource "aws_iam_role_policy_attachment" "gha_admin" {
  role       = aws_iam_role.gha_deploy.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}

output "github_actions_role_arn" {
  description = "Set this as the GitHub AWS_DEPLOY_ROLE_ARN secret"
  value       = aws_iam_role.gha_deploy.arn
}

# Grant the CI/CD deploy role kubectl access to the EKS cluster (so the CD
# pipeline can roll out the services). Cluster-admin scope for the lab.
resource "aws_eks_access_entry" "gha_deploy" {
  cluster_name  = module.eks.cluster_name
  principal_arn = aws_iam_role.gha_deploy.arn
  type          = "STANDARD"
}

resource "aws_eks_access_policy_association" "gha_deploy_admin" {
  cluster_name  = module.eks.cluster_name
  principal_arn = aws_iam_role.gha_deploy.arn
  policy_arn    = "arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy"

  access_scope {
    type = "cluster"
  }

  depends_on = [aws_eks_access_entry.gha_deploy]
}
