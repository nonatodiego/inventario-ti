CREATE TABLE `available_resources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`resourceType` enum('notebook','monitor','headset','phone','desktop','mouse','keyboard','notebookStand') NOT NULL,
	`quantity` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `available_resources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `desktop_details` (
	`id` int AUTO_INCREMENT NOT NULL,
	`inventoryRecordId` int NOT NULL,
	`serialNumber` varchar(100),
	`hostname` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `desktop_details_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventory_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userName` varchar(255) NOT NULL,
	`userRole` varchar(255) NOT NULL,
	`location` varchar(255) NOT NULL,
	`manager` varchar(255) NOT NULL,
	`emailLicense` enum('E1','E3') NOT NULL,
	`hasPhone` boolean DEFAULT false,
	`hasMonitor` boolean DEFAULT false,
	`hasMouse` boolean DEFAULT false,
	`hasKeyboard` boolean DEFAULT false,
	`hasHeadset` boolean DEFAULT false,
	`hasNotebookStand` boolean DEFAULT false,
	`hasNotebook` boolean DEFAULT false,
	`hasDesktop` boolean DEFAULT false,
	`termAttached` boolean DEFAULT false,
	`termFileName` varchar(255),
	`termFileData` longtext,
	`regDate` varchar(10) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inventory_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notebook_details` (
	`id` int AUTO_INCREMENT NOT NULL,
	`inventoryRecordId` int NOT NULL,
	`serialNumber` varchar(100),
	`hostname` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notebook_details_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `phone_details` (
	`id` int AUTO_INCREMENT NOT NULL,
	`inventoryRecordId` int NOT NULL,
	`chipNumber` varchar(20),
	`imei` varchar(20),
	`pulsusId` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `phone_details_id` PRIMARY KEY(`id`)
);
