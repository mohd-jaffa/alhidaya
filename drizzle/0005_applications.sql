CREATE TABLE `application_notes` (
	`id` varchar(36) NOT NULL,
	`application_id` varchar(36) NOT NULL,
	`body` varchar(2000) NOT NULL,
	`created_by` varchar(36),
	`created_at` datetime(3) NOT NULL,
	`updated_at` datetime(3) NOT NULL,
	CONSTRAINT `application_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `applications` (
	`id` varchar(36) NOT NULL,
	`job_id` varchar(36),
	`job_title` varchar(120),
	`status` varchar(16) NOT NULL DEFAULT 'NEW',
	`name` varchar(100) NOT NULL,
	`email` varchar(254) NOT NULL,
	`phone` varchar(24) NOT NULL,
	`fields` json NOT NULL,
	`cv_key` varchar(160),
	`cv_name` varchar(255) NOT NULL,
	`cv_type` varchar(8) NOT NULL,
	`cv_bytes` int unsigned NOT NULL,
	`cv_status` varchar(16) NOT NULL DEFAULT 'PENDING',
	`email_status` varchar(8) NOT NULL DEFAULT 'PENDING',
	`created_at` datetime(3) NOT NULL,
	`updated_at` datetime(3) NOT NULL,
	CONSTRAINT `applications_id` PRIMARY KEY(`id`),
	CONSTRAINT `applications_status_check` CHECK(`status` in ('NEW', 'IN_REVIEW', 'SHORTLISTED', 'CLOSED')),
	CONSTRAINT `applications_cv_type_check` CHECK(`cv_type` in ('pdf', 'docx', 'doc')),
	CONSTRAINT `applications_cv_bytes_check` CHECK(`cv_bytes` between 1 and 5242880),
	CONSTRAINT `applications_cv_status_check` CHECK(`cv_status` in ('PENDING', 'STORED', 'NOT_STORED', 'EXPIRED')),
	CONSTRAINT `applications_email_status_check` CHECK(`email_status` in ('PENDING', 'SENT', 'NOT_SENT'))
);
--> statement-breakpoint
ALTER TABLE `application_notes` ADD CONSTRAINT `application_notes_application_id_applications_id_fk` FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `application_notes` ADD CONSTRAINT `application_notes_created_by_auth_user_id_fk` FOREIGN KEY (`created_by`) REFERENCES `auth_user`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `applications` ADD CONSTRAINT `applications_job_id_records_id_fk` FOREIGN KEY (`job_id`) REFERENCES `records`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `application_notes_application_id_idx` ON `application_notes` (`application_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `applications_created_at_idx` ON `applications` (`created_at`);--> statement-breakpoint
CREATE INDEX `applications_status_created_at_idx` ON `applications` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `applications_job_id_idx` ON `applications` (`job_id`,`created_at`);