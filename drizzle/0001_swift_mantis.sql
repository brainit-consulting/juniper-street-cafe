CREATE TABLE `catering_order` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_name` text NOT NULL,
	`phone` text NOT NULL,
	`due_date` text NOT NULL,
	`due_time` text NOT NULL,
	`items` text NOT NULL,
	`fulfilment` text NOT NULL,
	`delivery_address` text,
	`total_cents` integer DEFAULT 0 NOT NULL,
	`deposit_paid` integer DEFAULT false NOT NULL,
	`notes` text,
	`status` text DEFAULT 'upcoming' NOT NULL,
	`taken_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`taken_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
