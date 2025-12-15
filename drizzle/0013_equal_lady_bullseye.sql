CREATE TABLE `projectAttachments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileType` enum('plant','document','reference_image','kmz') NOT NULL,
	`mimeType` varchar(100),
	`fileSize` int,
	`fileUrl` text NOT NULL,
	`fileKey` text NOT NULL,
	`description` text,
	`uploadedBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `projectAttachments_id` PRIMARY KEY(`id`)
);
