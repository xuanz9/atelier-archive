CREATE TABLE `cart_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`artwork_id` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`artwork_id`) REFERENCES `artworks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_cart_user_artwork` ON `cart_items` (`user_id`,`artwork_id`);--> statement-breakpoint
CREATE INDEX `idx_cart_user_created` ON `cart_items` (`user_id`,`created_at`);--> statement-breakpoint
ALTER TABLE `artworks` ADD `owner_user_id` text;--> statement-breakpoint
ALTER TABLE `artworks` ADD `submission_status` text DEFAULT 'approved' NOT NULL;