CREATE TABLE `generatedImages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`type` enum('conceptual','floorplan') NOT NULL,
	`imageUrl` text NOT NULL,
	`prompt` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `generatedImages_id` PRIMARY KEY(`id`)
);
