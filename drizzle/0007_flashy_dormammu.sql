CREATE TABLE `eligibility_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`caseId` int NOT NULL,
	`userEmail` varchar(320) NOT NULL,
	`zipCode` varchar(10),
	`state` varchar(2),
	`county` varchar(100),
	`householdSize` int,
	`monthlyIncomeRange` varchar(50),
	`housingStatus` varchar(50),
	`employmentStatus` varchar(50),
	`specialCircumstances` text,
	`benefitsConsent` int NOT NULL DEFAULT 0,
	`lastMatchedAt` timestamp,
	`matchCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `eligibility_profiles_id` PRIMARY KEY(`id`)
);
