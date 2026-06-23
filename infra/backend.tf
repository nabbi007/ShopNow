terraform {
  backend "s3" {
    bucket       = "shopnow-tf-state"
    key          = "ecs/terraform.tfstate"
    region       = "eu-west-1"
    encrypt      = true
    use_lockfile = true
  }
}
