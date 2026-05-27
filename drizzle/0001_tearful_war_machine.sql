CREATE TABLE `license_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`licenseType` text NOT NULL,
	`fromUser` text,
	`toUser` text,
	`createdAt` integer NOT NULL
);
