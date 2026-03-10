CREATE TABLE `communication_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`customer_id` integer NOT NULL,
	`booking_id` integer,
	`type` text NOT NULL,
	`direction` text NOT NULL,
	`content` text NOT NULL,
	`status` text DEFAULT 'Sent',
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `bookings` ADD `stripe_payment_intent_id` text;--> statement-breakpoint
ALTER TABLE `bookings` ADD `deposit_status` text DEFAULT 'Pending';--> statement-breakpoint
ALTER TABLE `customers` ADD `stripe_customer_id` text;