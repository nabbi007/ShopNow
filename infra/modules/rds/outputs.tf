output "address" {
  description = "RDS instance hostname (no port)"
  value       = aws_db_instance.this.address
}

output "endpoint" {
  description = "RDS connection endpoint (host:port)"
  value       = aws_db_instance.this.endpoint
}

output "port" {
  description = "RDS port"
  value       = aws_db_instance.this.port
}

output "security_group_id" {
  description = "Security group attached to the RDS instance"
  value       = aws_security_group.rds.id
}
