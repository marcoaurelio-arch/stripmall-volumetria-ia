ALTER TABLE `projects` ADD `dnaGenerated` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `dnaBuildingShape` text;--> statement-breakpoint
ALTER TABLE `projects` ADD `dnaStyle` text;--> statement-breakpoint
ALTER TABLE `projects` ADD `dnaFeatures` text;--> statement-breakpoint
ALTER TABLE `projects` ADD `dnaPrimaryColor` varchar(7);--> statement-breakpoint
ALTER TABLE `projects` ADD `dnaAccentColor` varchar(7);--> statement-breakpoint
ALTER TABLE `projects` ADD `dnaMaterials` text;--> statement-breakpoint
ALTER TABLE `projects` ADD `dnaLandscaping` text;--> statement-breakpoint
ALTER TABLE `projects` ADD `dnaLayout` text;--> statement-breakpoint
ALTER TABLE `projects` ADD `dnaContext` text;