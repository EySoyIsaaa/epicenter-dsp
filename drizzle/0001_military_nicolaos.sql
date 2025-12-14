CREATE TABLE `processing_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileFormat` varchar(10) NOT NULL,
	`sampleRate` int NOT NULL,
	`duration` int NOT NULL,
	`channels` int NOT NULL,
	`sweepFreq` int NOT NULL,
	`width` int NOT NULL,
	`intensity` int NOT NULL,
	`presetUsed` varchar(50),
	`originalFileUrl` text,
	`processedFileUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `processing_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_presets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`sweepFreq` int NOT NULL,
	`width` int NOT NULL,
	`intensity` int NOT NULL,
	`genre` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_presets_id` PRIMARY KEY(`id`)
);
