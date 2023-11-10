data "aws_elasticache_replication_group" "redis" {
  count                = var.env_name == "local" ? 0 : 1
  replication_group_id = format("redis-%s-%sezdb-application", var.project_code, var.env_name)
}
