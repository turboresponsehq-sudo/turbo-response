CREATE TABLE `intake_leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fullName` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(100),
	`socialHandle` varchar(255),
	`situationPreview` text,
	`fullSituation` longtext,
	`source` varchar(50) NOT NULL DEFAULT 'intake',
	`status` enum('new_lead','reviewing','follow_up','converted') NOT NULL DEFAULT 'new_lead',
	`adminNotes` longtext,
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `intake_leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `resource_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fullName` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`location` varchar(255) NOT NULL,
	`resourceTypes` longtext NOT NULL,
	`incomeLevel` varchar(50),
	`householdSize` varchar(50),
	`demographics` longtext,
	`description` longtext NOT NULL,
	`status` enum('new','processing','matched','closed','archived') NOT NULL DEFAULT 'new',
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`adminNotes` longtext,
	CONSTRAINT `resource_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `screenshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`imageKey` varchar(512) NOT NULL,
	`imageUrl` text NOT NULL,
	`description` text NOT NULL,
	`researchNotes` longtext,
	`extractedText` longtext,
	`category` varchar(50) DEFAULT 'other',
	`extractedDates` text,
	`extractedContacts` longtext,
	`fileSize` int,
	`mimeType` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	`isSaved` int NOT NULL DEFAULT 0,
	`internalNotes` text,
	CONSTRAINT `screenshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
DROP TABLE `case_documents`;--> statement-breakpoint
DROP TABLE `case_messages`;--> statement-breakpoint
DROP TABLE `cases`;--> statement-breakpoint
DROP TABLE `conversations`;--> statement-breakpoint
DROP TABLE `eligibility_profiles`;--> statement-breakpoint
DROP TABLE `evidence_uploads`;--> statement-breakpoint
DROP TABLE `leads`;--> statement-breakpoint
DROP TABLE `messages`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `password`;