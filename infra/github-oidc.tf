# ---------------------------------------------------------------------------
# GitHub Actions OIDC deploy role.
#
# Lets the CI/CD workflows assume an AWS role via OIDC (short-lived tokens) so
# no long-lived AWS access keys live in GitHub secrets. Put the output
# `github_actions_role_arn` into the repo's AWS_DEPLOY_ROLE_ARN secret.
#
# Apply this once locally (terraform apply) to create the role BEFORE the CD
# pipeline can use it. If the account already has the GitHub OIDC provider,
# import it instead of creating a duplicate:
#   terraform import aws_iam_openid_connect_provider.github \
#     arn:aws:iam::<ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com
# ---------------------------------------------------------------------------

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

# Lab scope: the CD job runs a full `terraform apply` (manages IAM, VPC, RDS,
# ECS, ECR, ...) plus image pushes, which effectively needs broad access.
# AdministratorAccess keeps the lab simple; for production, replace this with a
# least-privilege policy covering only ECR + ECS + the managed resources and
# the state bucket.
resource "aws_iam_role_policy_attachment" "gha_admin" {
  role       = aws_iam_role.gha_deploy.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}

output "github_actions_role_arn" {
  description = "Set this as the GitHub AWS_DEPLOY_ROLE_ARN secret"
  value       = aws_iam_role.gha_deploy.arn
}
