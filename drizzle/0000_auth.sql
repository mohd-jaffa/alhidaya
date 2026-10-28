CREATE TABLE `auth_account` (
	`id` varchar(36) NOT NULL,
	`account_id` varchar(255) NOT NULL,
	`provider_id` varchar(64) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` datetime(3),
	`refresh_token_expires_at` datetime(3),
	`scope` varchar(255),
	`password` varchar(255),
	`created_at` datetime(3) NOT NULL,
	`updated_at` datetime(3) NOT NULL,
	CONSTRAINT `auth_account_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `auth_session` (
	`id` varchar(36) NOT NULL,
	`expires_at` datetime(3) NOT NULL,
	`token` varchar(255) NOT NULL,
	`ip_address` varchar(64),
	`user_agent` varchar(500),
	`user_id` varchar(36) NOT NULL,
	`created_at` datetime(3) NOT NULL,
	`updated_at` datetime(3) NOT NULL,
	CONSTRAINT `auth_session_id` PRIMARY KEY(`id`),
	CONSTRAINT `auth_session_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `auth_user` (
	`id` varchar(36) NOT NULL,
	`name` varchar(100) NOT NULL,
	`email` varchar(254) NOT NULL,
	`email_verified` boolean NOT NULL DEFAULT false,
	`image` varchar(500),
	`created_at` datetime(3) NOT NULL,
	`updated_at` datetime(3) NOT NULL,
	CONSTRAINT `auth_user_id` PRIMARY KEY(`id`),
	CONSTRAINT `auth_user_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `auth_verification` (
	`id` varchar(36) NOT NULL,
	`identifier` varchar(255) NOT NULL,
	`value` text NOT NULL,
	`expires_at` datetime(3) NOT NULL,
	`created_at` datetime(3) NOT NULL,
	`updated_at` datetime(3) NOT NULL,
	CONSTRAINT `auth_verification_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sign_in_attempts` (
	`key_hash` varchar(64) NOT NULL,
	`failed_count` int unsigned NOT NULL DEFAULT 0,
	`locked_until` datetime(3),
	`created_at` datetime(3) NOT NULL,
	`updated_at` datetime(3) NOT NULL,
	CONSTRAINT `sign_in_attempts_key_hash` PRIMARY KEY(`key_hash`)
);
--> statement-breakpoint
ALTER TABLE `auth_account` ADD CONSTRAINT `auth_account_user_id_auth_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `auth_user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `auth_session` ADD CONSTRAINT `auth_session_user_id_auth_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `auth_user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `auth_account_user_id_idx` ON `auth_account` (`user_id`);--> statement-breakpoint
CREATE INDEX `auth_session_user_id_idx` ON `auth_session` (`user_id`);--> statement-breakpoint
CREATE INDEX `auth_verification_identifier_idx` ON `auth_verification` (`identifier`);