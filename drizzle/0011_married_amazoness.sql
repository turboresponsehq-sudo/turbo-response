CREATE TABLE `knowledge_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(500) NOT NULL,
	`category` varchar(100) NOT NULL,
	`subcategory` varchar(100),
	`source` varchar(50) NOT NULL DEFAULT 'google_drive',
	`sourceUrl` varchar(1000),
	`fileType` varchar(50),
	`content` longtext,
	`summary` text,
	`status` enum('active','archived','needs_review') NOT NULL DEFAULT 'active',
	`isProcessed` int NOT NULL DEFAULT 0,
	`adminNotes` text,
	`dateAdded` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `knowledge_documents_id` PRIMARY KEY(`id`)
);
