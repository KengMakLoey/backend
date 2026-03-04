CREATE TABLE `department` (
	`department_id` int AUTO_INCREMENT NOT NULL,
	`department_code` varchar(255) NOT NULL,
	`department_name` varchar(255),
	`building` varchar(255),
	`floor` varchar(255),
	`room` varchar(255),
	CONSTRAINT `department_department_id` PRIMARY KEY(`department_id`),
	CONSTRAINT `department_department_code_unique` UNIQUE(`department_code`)
);
--> statement-breakpoint
CREATE TABLE `notification` (
	`notification_id` int AUTO_INCREMENT NOT NULL,
	`queue_id` int NOT NULL,
	`notification_type` varchar(255),
	`message` varchar(255),
	`is_sent` boolean,
	`sent_at` datetime,
	CONSTRAINT `notification_notification_id` PRIMARY KEY(`notification_id`)
);
--> statement-breakpoint
CREATE TABLE `patient` (
	`patient_id` int AUTO_INCREMENT NOT NULL,
	`hn` varchar(255) NOT NULL,
	`first_name` varchar(255),
	`last_name` varchar(255),
	`phone_number` varchar(20),
	`created_at` datetime,
	CONSTRAINT `patient_patient_id` PRIMARY KEY(`patient_id`),
	CONSTRAINT `patient_hn_unique` UNIQUE(`hn`)
);
--> statement-breakpoint
CREATE TABLE `queue` (
	`queue_id` int AUTO_INCREMENT NOT NULL,
	`queue_number` varchar(255),
	`visit_id` int NOT NULL,
	`department_id` int NOT NULL,
	`queue_token` varchar(64),
	`is_skipped` boolean DEFAULT false,
	`priority_score` int DEFAULT 0,
	`status` varchar(255),
	`issued_time` datetime,
	`called_time` datetime,
	`completed_time` datetime,
	`skipped_time` datetime,
	CONSTRAINT `queue_queue_id` PRIMARY KEY(`queue_id`),
	CONSTRAINT `queue_visit_id_unique` UNIQUE(`visit_id`),
	CONSTRAINT `queue_queue_token_unique` UNIQUE(`queue_token`)
);
--> statement-breakpoint
CREATE TABLE `queue_status_history` (
	`history_id` int AUTO_INCREMENT NOT NULL,
	`queue_id` int NOT NULL,
	`old_status` varchar(255),
	`new_status` varchar(255),
	`changed_by` varchar(255),
	`changed_at` datetime,
	CONSTRAINT `queue_status_history_history_id` PRIMARY KEY(`history_id`)
);
--> statement-breakpoint
CREATE TABLE `service_step` (
	`step_id` int AUTO_INCREMENT NOT NULL,
	`visit_id` int NOT NULL,
	`step_order` int,
	`service_name` varchar(255),
	`location` varchar(255),
	`status` varchar(255),
	CONSTRAINT `service_step_step_id` PRIMARY KEY(`step_id`)
);
--> statement-breakpoint
CREATE TABLE `staff` (
	`staff_id` int AUTO_INCREMENT NOT NULL,
	`staff_name` varchar(255),
	`role` varchar(255),
	`department_id` int,
	`username` varchar(50),
	`password` varchar(255),
	CONSTRAINT `staff_staff_id` PRIMARY KEY(`staff_id`),
	CONSTRAINT `staff_username_unique` UNIQUE(`username`)
);
--> statement-breakpoint
CREATE TABLE `visit` (
	`visit_id` int AUTO_INCREMENT NOT NULL,
	`vn` varchar(255) NOT NULL,
	`patient_id` int NOT NULL,
	`visit_type` varchar(255),
	`visit_date` date,
	`created_at` datetime,
	CONSTRAINT `visit_visit_id` PRIMARY KEY(`visit_id`),
	CONSTRAINT `visit_vn_unique` UNIQUE(`vn`)
);
--> statement-breakpoint
ALTER TABLE `notification` ADD CONSTRAINT `notification_queue_id_queue_queue_id_fk` FOREIGN KEY (`queue_id`) REFERENCES `queue`(`queue_id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `queue` ADD CONSTRAINT `queue_visit_id_visit_visit_id_fk` FOREIGN KEY (`visit_id`) REFERENCES `visit`(`visit_id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `queue` ADD CONSTRAINT `queue_department_id_department_department_id_fk` FOREIGN KEY (`department_id`) REFERENCES `department`(`department_id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `queue_status_history` ADD CONSTRAINT `queue_status_history_queue_id_queue_queue_id_fk` FOREIGN KEY (`queue_id`) REFERENCES `queue`(`queue_id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `service_step` ADD CONSTRAINT `service_step_visit_id_visit_visit_id_fk` FOREIGN KEY (`visit_id`) REFERENCES `visit`(`visit_id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `staff` ADD CONSTRAINT `staff_department_id_department_department_id_fk` FOREIGN KEY (`department_id`) REFERENCES `department`(`department_id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `visit` ADD CONSTRAINT `visit_patient_id_patient_patient_id_fk` FOREIGN KEY (`patient_id`) REFERENCES `patient`(`patient_id`) ON DELETE no action ON UPDATE no action;