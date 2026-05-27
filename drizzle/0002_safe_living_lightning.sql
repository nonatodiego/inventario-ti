CREATE TABLE `access_profiles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`systemId` integer NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`permissions` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `collaborator_system_access` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`inventoryRecordId` integer NOT NULL,
	`systemId` integer NOT NULL,
	`accessProfileId` integer NOT NULL,
	`notes` text,
	`grantedAt` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `systems` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`category` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `systems_name_unique` ON `systems` (`name`);