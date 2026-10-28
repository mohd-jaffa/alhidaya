CREATE TABLE `rate_limits` (
	`key_hash` varchar(64) NOT NULL,
	`window_start` datetime(3) NOT NULL,
	`count` int unsigned NOT NULL DEFAULT 0,
	`created_at` datetime(3) NOT NULL,
	`updated_at` datetime(3) NOT NULL,
	CONSTRAINT `rate_limits_pk` PRIMARY KEY(`key_hash`,`window_start`)
);
