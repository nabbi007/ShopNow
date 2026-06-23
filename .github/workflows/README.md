# CI/CD Pipelines

Three workflows implement the team workflow:

| Workflow | Trigger | Purpose |
|---|---|---|
| [`ci.yml`](ci.yml) | PR + push to `main` | Build & test (backend + frontend), **SonarQube** quality gate, **Trivy** image scan, **TruffleHog** secret scan |
| [`terraform-plan.yml`](terraform-plan.yml) | PR touching `infra/**` | `fmt` / `validate` / `plan`, posts the plan as a PR comment |
| [`cd.yml`](cd.yml) | push to `main` | Build & push SHA-tagged images to ECR, then `terraform apply` to deploy |

**Flow:** open a PR → CI + (if infra changed) the plan run as required checks → merge → CD builds immutable `:<sha>` images and Terraform rolls the ECS services onto them. Rollback = re-run CD / `terraform apply` with an older SHA.

> Trivy used to run inside `backend/Dockerfile`; it now runs in `ci.yml` against the built image, so the Dockerfile no longer fails the build on CVEs.

## Required setup (one-time)

### 1. GitHub secrets

Repo → Settings → Secrets and variables → Actions:

| Secret | Used by | What |
|---|---|---|
| `AWS_DEPLOY_ROLE_ARN` | cd, terraform-plan | IAM role assumed via OIDC (below) |
| `DB_PASSWORD` | cd, terraform-plan | `TF_VAR_db_password` |
| `SECRET_KEY` | cd, terraform-plan | `TF_VAR_secret_key` (JWT signing) |

SonarQube needs no secret — CI runs an **ephemeral** SonarQube container per run.

### 2. AWS OIDC role (no static keys)

Let GitHub Actions assume a role via OIDC instead of storing AWS access keys.

```bash
# a) Register GitHub's OIDC provider in your account (once per account)
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 1b511abead59c6ce207077c0bf0e0043b1382612

# b) Trust policy — restrict to THIS repo (replace OWNER/REPO)
cat > trust.json <<'JSON'
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Federated": "arn:aws:iam::<ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com" },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": { "token.actions.githubusercontent.com:aud": "sts.amazonaws.com" },
      "StringLike":   { "token.actions.githubusercontent.com:sub": "repo:OWNER/REPO:*" }
    }
  }]
}
JSON

aws iam create-role --role-name shopnow-gha-deploy \
  --assume-role-policy-document file://trust.json
```

Attach permissions for what the pipeline does: ECR push, ECS update, plus
read/write on the Terraform-managed resources and the `shopnow-tf-state`
bucket. For a lab you can attach `PowerUserAccess` (broad but simple); for real
use, scope it down to ECR + ECS + the specific resources Terraform manages.

Put the role ARN (`arn:aws:iam::<ACCOUNT_ID>:role/shopnow-gha-deploy`) into the
`AWS_DEPLOY_ROLE_ARN` secret.

### 3. Branch protection

Repo → Settings → Branches → protect `main`:
- Require PRs before merging
- Require status checks: the `ci.yml` jobs (and the plan job for infra PRs)

This is what makes CD safe — code can only reach `main` (and thus deploy) after the gates pass.

## Notes / gotchas

- **SonarQube quality gate & coverage**: the default "Sonar way" gate requires
  coverage on new code. With no tests yet, that condition can fail — add tests
  or adjust the gate in the SonarQube instance. The gate is intentionally strict.
- **Trivy gate** uses `ignore-unfixed: true` (only fails on vulns with a fix
  available). Drop it to `false` to be stricter.
- **Immutable tags**: CD pushes `:<sha>` and `:latest`. To enforce immutability
  set the ECR `image_tag_mutability` variable to `IMMUTABLE` and stop pushing
  `:latest` (CD already deploys by SHA, so `latest` is only a convenience).
