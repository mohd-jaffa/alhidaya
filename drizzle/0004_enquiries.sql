CREATE TABLE `enquiries` (
	`id` varchar(36) NOT NULL,
	`form` varchar(8) NOT NULL,
	`status` varchar(16) NOT NULL DEFAULT 'NEW',
	`name` varchar(100) NOT NULL,
	`email` varchar(254) NOT NULL,
	`phone` varchar(24) NOT NULL,
	`fields` json NOT NULL,
	`email_status` varchar(8) NOT NULL DEFAULT 'PENDING',
	`created_at` datetime(3) NOT NULL,
	`updated_at` datetime(3) NOT NULL,
	CONSTRAINT `enquiries_id` PRIMARY KEY(`id`),
	CONSTRAINT `enquiries_form_check` CHECK(`form` in ('QUOTE', 'CONTACT')),
	CONSTRAINT `enquiries_status_check` CHECK(`status` in ('NEW', 'IN_PROGRESS', 'RESOLVED')),
	CONSTRAINT `enquiries_email_status_check` CHECK(`email_status` in ('PENDING', 'SENT', 'NOT_SENT'))
);
--> statement-breakpoint
CREATE TABLE `enquiry_notes` (
	`id` varchar(36) NOT NULL,
	`enquiry_id` varchar(36) NOT NULL,
	`body` varchar(2000) NOT NULL,
	`created_by` varchar(36),
	`created_at` datetime(3) NOT NULL,
	`updated_at` datetime(3) NOT NULL,
	CONSTRAINT `enquiry_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `enquiry_notes` ADD CONSTRAINT `enquiry_notes_enquiry_id_enquiries_id_fk` FOREIGN KEY (`enquiry_id`) REFERENCES `enquiries`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `enquiry_notes` ADD CONSTRAINT `enquiry_notes_created_by_auth_user_id_fk` FOREIGN KEY (`created_by`) REFERENCES `auth_user`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `enquiries_created_at_idx` ON `enquiries` (`created_at`);--> statement-breakpoint
CREATE INDEX `enquiries_status_created_at_idx` ON `enquiries` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `enquiry_notes_enquiry_id_idx` ON `enquiry_notes` (`enquiry_id`,`created_at`);