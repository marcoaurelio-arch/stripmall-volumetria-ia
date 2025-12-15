CREATE TABLE `savedLayouts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`offsetX` int NOT NULL DEFAULT 0,
	`offsetY` int NOT NULL DEFAULT 0,
	`rotation` int NOT NULL DEFAULT 0,
	`scale` int NOT NULL DEFAULT 80,
	`isValid` int NOT NULL DEFAULT 1,
	`validationNotes` text,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `savedLayouts_id` PRIMARY KEY(`id`)
);
