CREATE TABLE `audit_log` (
	`id` varchar(36) NOT NULL,
	`actor_id` varchar(36),
	`action` varchar(32) NOT NULL,
	`entity_type` varchar(64) NOT NULL,
	`entity_id` varchar(64),
	`changes` json,
	`summary` varchar(300),
	`request_id` varchar(80),
	`created_at` datetime(3) NOT NULL,
	CONSTRAINT `audit_log_id` PRIMARY KEY(`id`),
	CONSTRAINT `audit_log_action_check` CHECK(`action` in ('SIGN_IN', 'SIGN_OUT', 'PASSWORD_RESET_REQUESTED', 'PASSWORD_CHANGED', 'CREATE', 'UPDATE', 'PUBLISH', 'DISCARD_DRAFT', 'REORDER', 'ARCHIVE', 'DELETE', 'STATUS_CHANGE', 'NOTE_ADD', 'CV_DOWNLOAD', 'SETTINGS_CHANGE', 'RETENTION_PURGE'))
);
--> statement-breakpoint
CREATE TABLE `error_log` (
	`id` varchar(36) NOT NULL,
	`source` varchar(16) NOT NULL,
	`message` varchar(300) NOT NULL,
	`reference` varchar(80),
	`code` varchar(64),
	`kind` varchar(32),
	`http_status` smallint unsigned,
	`method` varchar(10),
	`path` varchar(500),
	`admin_id` varchar(36),
	`detail` varchar(2000),
	`stack` text,
	`context` json,
	`created_at` datetime(3) NOT NULL,
	CONSTRAINT `error_log_id` PRIMARY KEY(`id`),
	CONSTRAINT `error_log_source_check` CHECK(`source` in ('SERVER', 'API', 'SCREEN', 'CRON'))
);
--> statement-breakpoint
ALTER TABLE `audit_log` ADD CONSTRAINT `audit_log_actor_id_auth_user_id_fk` FOREIGN KEY (`actor_id`) REFERENCES `auth_user`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `audit_log_created_at_idx` ON `audit_log` (`created_at`);--> statement-breakpoint
CREATE INDEX `audit_log_entity_idx` ON `audit_log` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `error_log_created_at_idx` ON `error_log` (`created_at`);