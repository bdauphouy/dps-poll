CREATE TABLE `page_views` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ip_address` text,
	`country` text,
	`city` text,
	`language` text,
	`user_agent` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `responses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`rating_customer_service` integer NOT NULL,
	`rating_delivery` integer NOT NULL,
	`rating_tracking` integer NOT NULL,
	`rating_cargo_handling` integer NOT NULL,
	`rating_delivery_time` integer NOT NULL,
	`competitor_usage` text NOT NULL,
	`improvement_feedback` text NOT NULL,
	`language` text DEFAULT 'es' NOT NULL,
	`ip_address` text,
	`country` text,
	`city` text,
	`created_at` integer NOT NULL
);
