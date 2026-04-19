output "service_name" {
  description = "Name of the ECS service"
  value       = var.service_name
}

output "cluster_name" {
  description = "Name of the ECS cluster"
  value       = aws_ecs_cluster.main.name
}

output "cluster_arn" {
  description = "ARN of the ECS cluster"
  value       = aws_ecs_cluster.main.arn
}

output "service_arn" {
  description = "ARN of the ECS service"
  value       = aws_ecs_service.main.arn
}

output "load_balancer_dns" {
  description = "DNS name of the Application Load Balancer"
  value       = aws_lb.main.dns_name
}

output "load_balancer_arn" {
  description = "ARN of the Application Load Balancer"
  value       = aws_lb.main.arn
}

output "target_group_arn" {
  description = "ARN of the target group"
  value       = aws_lb_target_group.main.arn
}

output "service_url" {
  description = "URL of the deployed service"
  value       = "http://${aws_lb.main.dns_name}"
}

output "log_group_name" {
  description = "Name of the CloudWatch log group"
  value       = aws_cloudwatch_log_group.service.name
}

output "task_definition_arn" {
  description = "ARN of the task definition"
  value       = try(aws_ecs_task_definition.service[0].arn, null)
}

output "security_group_id" {
  description = "ID of the ECS security group"
  value       = aws_security_group.service.id
}

output "alb_security_group_id" {
  description = "ID of the ALB security group"
  value       = aws_security_group.alb.id
}
