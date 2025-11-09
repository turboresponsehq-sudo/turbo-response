CREATE TABLE `conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`category` varchar(50),
	`status` varchar(50) NOT NULL DEFAULT 'active',
	`summary` text,
	`messageCount` int NOT NULL DEFAULT 0,
	`evidenceCount` int NOT NULL DEFAULT 0,
	`convertedToLead` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `evidence_uploads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`fileKey` varchar(500) NOT NULL,
	`fileUrl` text NOT NULL,
	`filename` varchar(255),
	`mimeType` varchar(100),
	`fileSize` int,
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `evidence_uploads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lead_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadId` int NOT NULL,
	`content` text NOT NULL,
	`noteType` varchar(50) NOT NULL DEFAULT 'general',
	`createdBy` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lead_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(50),
	`bestTimeToCall` varchar(20),
	`status` varchar(50) NOT NULL DEFAULT 'new',
	`notes` text,
	`category` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`role` varchar(20) NOT NULL,
	`content` text NOT NULL,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `turbo_intake_submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`submissionId` varchar(100) NOT NULL,
	`businessName` varchar(255) NOT NULL,
	`ownerName` varchar(255) NOT NULL,
	`industry` varchar(255),
	`email` varchar(320) NOT NULL,
	`phone` varchar(50),
	`whatYouSell` text,
	`idealCustomer` text,
	`biggestStruggle` text,
	`goal60To90Days` text,
	`longTermVision` text,
	`websiteUrl` varchar(500),
	`instagramHandle` varchar(100),
	`facebookUrl` varchar(500),
	`tiktokHandle` varchar(100),
	`otherSocialMedia` text,
	`status` varchar(50) NOT NULL DEFAULT 'pending',
	`auditGenerated` int NOT NULL DEFAULT 0,
	`auditGeneratedAt` timestamp,
	`auditReportPath` varchar(500),
	`blueprintGenerated` int NOT NULL DEFAULT 0,
	`blueprintGeneratedAt` timestamp,
	`blueprintReportPath` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `turbo_intake_submissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `turbo_intake_submissions_submissionId_unique` UNIQUE(`submissionId`)
);
