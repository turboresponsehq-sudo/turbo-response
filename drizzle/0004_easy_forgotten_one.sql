CREATE TABLE `case_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`caseId` int NOT NULL,
	`fileKey` varchar(500) NOT NULL,
	`fileUrl` text NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`mimeType` varchar(100),
	`fileSize` int,
	`note` text,
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `case_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`category` varchar(50),
	`status` varchar(50) NOT NULL DEFAULT 'open',
	`description` text,
	`clientName` varchar(255),
	`clientEmail` varchar(320),
	`clientPhone` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cases_id` PRIMARY KEY(`id`)
);
