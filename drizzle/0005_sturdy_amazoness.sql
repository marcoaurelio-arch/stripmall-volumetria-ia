ALTER TABLE `projects` MODIFY COLUMN `latitude` varchar(50);--> statement-breakpoint
ALTER TABLE `projects` MODIFY COLUMN `longitude` varchar(50);--> statement-breakpoint
ALTER TABLE `projects` ADD `pricePerSqm` int;