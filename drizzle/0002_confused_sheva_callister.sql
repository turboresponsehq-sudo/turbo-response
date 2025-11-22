CREATE TABLE `case_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`caseId` int NOT NULL,
	`sender` varchar(20) NOT NULL,
	`senderName` varchar(255),
	`messageText` text,
	`filePath` text,
	`fileName` varchar(255),
	`fileType` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `case_messages_id` PRIMARY KEY(`id`)
);
