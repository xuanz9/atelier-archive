CREATE TABLE `artists` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`biography` text,
	`website` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_artists_slug` ON `artists` (`slug`);--> statement-breakpoint
CREATE TABLE `artwork_exhibitions` (
	`artwork_id` integer NOT NULL,
	`exhibition_id` integer NOT NULL,
	FOREIGN KEY (`artwork_id`) REFERENCES `artworks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exhibition_id`) REFERENCES `exhibitions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_artwork_exhibitions_pair` ON `artwork_exhibitions` (`artwork_id`,`exhibition_id`);--> statement-breakpoint
CREATE TABLE `artwork_images` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`artwork_id` integer NOT NULL,
	`object_key` text NOT NULL,
	`alt_text` text NOT NULL,
	`width` integer NOT NULL,
	`height` integer NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`artwork_id`) REFERENCES `artworks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_artwork_images_artwork_sort` ON `artwork_images` (`artwork_id`,`sort_order`);--> statement-breakpoint
CREATE TABLE `artworks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`accession_number` text NOT NULL,
	`slug` text NOT NULL,
	`artist_id` integer NOT NULL,
	`title` text NOT NULL,
	`year` integer NOT NULL,
	`medium` text NOT NULL,
	`width_in` real,
	`height_in` real,
	`depth_in` real,
	`description` text,
	`provenance` text,
	`price_cents` integer,
	`currency` text DEFAULT 'USD' NOT NULL,
	`status` text DEFAULT 'available' NOT NULL,
	`primary_image_key` text,
	`published` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`artist_id`) REFERENCES `artists`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_artworks_accession_number` ON `artworks` (`accession_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_artworks_slug` ON `artworks` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_artworks_artist_id` ON `artworks` (`artist_id`);--> statement-breakpoint
CREATE INDEX `idx_artworks_status_published` ON `artworks` (`status`,`published`);--> statement-breakpoint
CREATE INDEX `idx_artworks_year` ON `artworks` (`year`);--> statement-breakpoint
CREATE TABLE `exhibitions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`venue` text NOT NULL,
	`city` text,
	`start_year` integer NOT NULL,
	`end_year` integer
);
--> statement-breakpoint
CREATE TABLE `inquiries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`artwork_id` integer NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`message` text,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`artwork_id`) REFERENCES `artworks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_inquiries_artwork_id` ON `inquiries` (`artwork_id`);--> statement-breakpoint
CREATE INDEX `idx_inquiries_status_created` ON `inquiries` (`status`,`created_at`);--> statement-breakpoint
PRAGMA optimize;
