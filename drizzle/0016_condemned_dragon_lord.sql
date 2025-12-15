CREATE TABLE `virtualTours` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`scenes` text NOT NULL,
	`defaultScene` varchar(100) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `virtualTours_id` PRIMARY KEY(`id`)
);
