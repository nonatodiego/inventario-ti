CREATE TABLE `available_resources` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`resourceType` text NOT NULL,
	`quantity` integer DEFAULT 0 NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `desktop_details` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`inventoryRecordId` integer NOT NULL,
	`serialNumber` text,
	`hostname` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `inventory_records` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userName` text NOT NULL,
	`userRole` text NOT NULL,
	`location` text NOT NULL,
	`manager` text NOT NULL,
	`emailLicense` text NOT NULL,
	`hasPhone` integer DEFAULT false,
	`hasMonitor` integer DEFAULT false,
	`hasMouse` integer DEFAULT false,
	`hasKeyboard` integer DEFAULT false,
	`hasHeadset` integer DEFAULT false,
	`hasNotebookStand` integer DEFAULT false,
	`hasNotebook` integer DEFAULT false,
	`hasDesktop` integer DEFAULT false,
	`termAttached` integer DEFAULT false,
	`termFileName` text,
	`termFileData` text,
	`regDate` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `notebook_details` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`inventoryRecordId` integer NOT NULL,
	`serialNumber` text,
	`hostname` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `phone_details` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`inventoryRecordId` integer NOT NULL,
	`chipNumber` text,
	`imei` text,
	`pulsusId` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`openId` text NOT NULL,
	`name` text,
	`email` text,
	`loginMethod` text,
	`role` text DEFAULT 'user' NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`lastSignedIn` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_openId_unique` ON `users` (`openId`);