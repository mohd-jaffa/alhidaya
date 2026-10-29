CREATE TABLE `documents` (
	`key` varchar(32) NOT NULL,
	`draft` json NOT NULL,
	`published` json,
	`published_at` datetime(3),
	`updated_by` varchar(36),
	`created_at` datetime(3) NOT NULL,
	`updated_at` datetime(3) NOT NULL,
	CONSTRAINT `documents_key` PRIMARY KEY(`key`),
	CONSTRAINT `documents_key_check` CHECK(`key` in ('PAGE:HOME', 'PAGE:ABOUT', 'PAGE:SERVICES', 'PAGE:CAREERS', 'PAGE:CONTACT', 'PAGE:QUOTE', 'PAGE:PRIVACY', 'PAGE:TERMS', 'SITE', 'ORDER:SERVICES', 'ORDER:CLIENTS'))
);
--> statement-breakpoint
CREATE TABLE `media` (
	`id` varchar(36) NOT NULL,
	`kind` varchar(8) NOT NULL,
	`variants` json NOT NULL,
	`width` int unsigned,
	`height` int unsigned,
	`bytes` int unsigned NOT NULL,
	`alt` json,
	`decorative` boolean NOT NULL DEFAULT false,
	`source` json,
	`created_by` varchar(36),
	`created_at` datetime(3) NOT NULL,
	`updated_at` datetime(3) NOT NULL,
	CONSTRAINT `media_id` PRIMARY KEY(`id`),
	CONSTRAINT `media_kind_check` CHECK(`kind` in ('IMAGE', 'PDF'))
);
--> statement-breakpoint
CREATE TABLE `records` (
	`id` varchar(36) NOT NULL,
	`collection` varchar(16) NOT NULL,
	`slug` varchar(80),
	`previous_slugs` json NOT NULL,
	`draft` json NOT NULL,
	`published` json,
	`published_at` datetime(3),
	`archived_at` datetime(3),
	`created_by` varchar(36),
	`updated_by` varchar(36),
	`created_at` datetime(3) NOT NULL,
	`updated_at` datetime(3) NOT NULL,
	CONSTRAINT `records_id` PRIMARY KEY(`id`),
	CONSTRAINT `records_collection_slug_unique` UNIQUE(`collection`,`slug`),
	CONSTRAINT `records_collection_check` CHECK(`collection` in ('SERVICES', 'JOBS', 'CLIENTS'))
);
--> statement-breakpoint
CREATE TABLE `site_operations` (
	`id` varchar(16) NOT NULL,
	`enquiries_to` json NOT NULL,
	`applications_to` json NOT NULL,
	`retention_days` smallint unsigned NOT NULL,
	`cv_expiry_days` smallint unsigned NOT NULL,
	`updated_by` varchar(36),
	`created_at` datetime(3) NOT NULL,
	`updated_at` datetime(3) NOT NULL,
	CONSTRAINT `site_operations_id` PRIMARY KEY(`id`),
	CONSTRAINT `site_operations_one_row` CHECK(`id` = 'operations'),
	CONSTRAINT `site_operations_retention_check` CHECK(`retention_days` between 1 and 365),
	CONSTRAINT `site_operations_cv_expiry_check` CHECK(`cv_expiry_days` between 1 and 365)
);
--> statement-breakpoint
ALTER TABLE `documents` ADD CONSTRAINT `documents_updated_by_auth_user_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `auth_user`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media` ADD CONSTRAINT `media_created_by_auth_user_id_fk` FOREIGN KEY (`created_by`) REFERENCES `auth_user`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `records` ADD CONSTRAINT `records_created_by_auth_user_id_fk` FOREIGN KEY (`created_by`) REFERENCES `auth_user`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `records` ADD CONSTRAINT `records_updated_by_auth_user_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `auth_user`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `site_operations` ADD CONSTRAINT `site_operations_updated_by_auth_user_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `auth_user`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `media_created_at_idx` ON `media` (`created_at`);--> statement-breakpoint
CREATE INDEX `records_collection_archived_idx` ON `records` (`collection`,`archived_at`);