ALTER TABLE `applications` ADD `email_retries` tinyint unsigned DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `applications` ADD `email_retried_at` datetime(3);--> statement-breakpoint
ALTER TABLE `enquiries` ADD `email_retries` tinyint unsigned DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `enquiries` ADD `email_retried_at` datetime(3);--> statement-breakpoint
ALTER TABLE `applications` ADD CONSTRAINT `applications_email_retries_check` CHECK (`email_retries` between 0 and 3);--> statement-breakpoint
ALTER TABLE `enquiries` ADD CONSTRAINT `enquiries_email_retries_check` CHECK (`email_retries` between 0 and 3);--> statement-breakpoint
CREATE INDEX `applications_email_status_created_at_idx` ON `applications` (`email_status`,`created_at`);--> statement-breakpoint
CREATE INDEX `enquiries_email_status_created_at_idx` ON `enquiries` (`email_status`,`created_at`);