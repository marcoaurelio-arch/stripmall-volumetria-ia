ALTER TABLE `projects` ADD `latitude` varchar(20);--> statement-breakpoint
ALTER TABLE `projects` ADD `longitude` varchar(20);--> statement-breakpoint
ALTER TABLE `projects` DROP COLUMN `terrainImageUrl`;--> statement-breakpoint
ALTER TABLE `projects` DROP COLUMN `terrainImageKey`;