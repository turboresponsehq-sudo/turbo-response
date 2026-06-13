CREATE TABLE `priorities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`text` varchar(500) NOT NULL,
	`urgent` int NOT NULL DEFAULT 0,
	`done` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `priorities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`status` enum('active','paused','done') NOT NULL DEFAULT 'active',
	`progress` int NOT NULL DEFAULT 0,
	`nextStep` varchar(500),
	`objective` text,
	`keySteps` longtext,
	`notes` longtext,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`text` varchar(500) NOT NULL,
	`bucket` enum('today','week','someday') NOT NULL DEFAULT 'today',
	`done` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
