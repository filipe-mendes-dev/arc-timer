CREATE TABLE `exercise_definition_data` (
	`exercise_definition_id` text PRIMARY KEY NOT NULL,
	`notes` text,
	`created_at_ms` integer NOT NULL,
	`updated_at_ms` integer NOT NULL,
	FOREIGN KEY (`exercise_definition_id`) REFERENCES `exercise_definitions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `exercise_definition_default_tracking_fields` (
	`exercise_definition_id` text PRIMARY KEY NOT NULL,
	`reps` integer,
	`weight_grams` integer,
	`duration_sec` integer,
	`distance_meters` integer,
	`rpe_tenths` integer,
	`created_at_ms` integer NOT NULL,
	`updated_at_ms` integer NOT NULL,
	FOREIGN KEY (`exercise_definition_id`) REFERENCES `exercise_definitions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `exercise_definition_recent_gym_sessions` (
	`exercise_definition_id` text NOT NULL,
	`gym_session_id` text NOT NULL,
	`sort_index` integer NOT NULL,
	`started_at_ms` integer NOT NULL,
	`created_at_ms` integer NOT NULL,
	`updated_at_ms` integer NOT NULL,
	PRIMARY KEY(`exercise_definition_id`, `gym_session_id`),
	FOREIGN KEY (`exercise_definition_id`) REFERENCES `exercise_definitions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gym_session_id`) REFERENCES `gym_sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `exercise_definition_recent_sessions_sort_unique_idx` ON `exercise_definition_recent_gym_sessions` (`exercise_definition_id`,`sort_index`);--> statement-breakpoint
CREATE INDEX `exercise_definition_recent_sessions_session_idx` ON `exercise_definition_recent_gym_sessions` (`gym_session_id`);--> statement-breakpoint
CREATE TABLE `exercise_definition_stats` (
	`exercise_definition_id` text PRIMARY KEY NOT NULL,
	`weight_pr_set_id` text,
	`weight_pr_gym_session_id` text,
	`weight_pr_grams` integer,
	`weight_pr_reps` integer,
	`weight_pr_completed_at_ms` integer,
	`distance_pr_set_id` text,
	`distance_pr_gym_session_id` text,
	`distance_pr_meters` integer,
	`distance_pr_reps` integer,
	`distance_pr_completed_at_ms` integer,
	`last_completed_gym_session_id` text,
	`created_at_ms` integer NOT NULL,
	`updated_at_ms` integer NOT NULL,
	FOREIGN KEY (`exercise_definition_id`) REFERENCES `exercise_definitions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`weight_pr_set_id`) REFERENCES `gym_exercise_record_sets`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`weight_pr_gym_session_id`) REFERENCES `gym_sessions`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`distance_pr_set_id`) REFERENCES `gym_exercise_record_sets`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`distance_pr_gym_session_id`) REFERENCES `gym_sessions`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`last_completed_gym_session_id`) REFERENCES `gym_sessions`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `exercise_definition_stats_last_session_idx` ON `exercise_definition_stats` (`last_completed_gym_session_id`);--> statement-breakpoint
CREATE TABLE `gym_exercise_record_sets` (
	`id` text PRIMARY KEY NOT NULL,
	`gym_exercise_record_id` text NOT NULL,
	`set_index` integer NOT NULL,
	`reps` integer,
	`weight_grams` integer,
	`duration_sec` integer,
	`distance_meters` integer,
	`rpe_tenths` integer,
	`is_warmup` integer DEFAULT false NOT NULL,
	`completed_at_ms` integer,
	`notes` text,
	`created_at_ms` integer NOT NULL,
	`updated_at_ms` integer NOT NULL,
	FOREIGN KEY (`gym_exercise_record_id`) REFERENCES `gym_exercise_records`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `gym_exercise_record_sets_record_set_unique_idx` ON `gym_exercise_record_sets` (`gym_exercise_record_id`,`set_index`);--> statement-breakpoint
CREATE TABLE `gym_exercise_records` (
	`id` text PRIMARY KEY NOT NULL,
	`gym_session_id` text NOT NULL,
	`exercise_definition_id` text NOT NULL,
	`source_gym_plan_exercise_id` text,
	`sort_index` integer NOT NULL,
	`started_at_ms` integer,
	`notes` text,
	`created_at_ms` integer NOT NULL,
	`updated_at_ms` integer NOT NULL,
	FOREIGN KEY (`gym_session_id`) REFERENCES `gym_sessions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_definition_id`) REFERENCES `exercise_definitions`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`source_gym_plan_exercise_id`) REFERENCES `gym_plan_exercises`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `gym_exercise_records_session_sort_unique_idx` ON `gym_exercise_records` (`gym_session_id`,`sort_index`);--> statement-breakpoint
CREATE INDEX `gym_exercise_records_definition_idx` ON `gym_exercise_records` (`exercise_definition_id`);--> statement-breakpoint
CREATE INDEX `gym_exercise_records_source_plan_exercise_idx` ON `gym_exercise_records` (`source_gym_plan_exercise_id`);--> statement-breakpoint
CREATE TABLE `gym_plan_exercise_target_sets` (
	`id` text PRIMARY KEY NOT NULL,
	`gym_plan_exercise_id` text NOT NULL,
	`set_index` integer NOT NULL,
	`reps` integer,
	`weight_grams` integer,
	`duration_sec` integer,
	`distance_meters` integer,
	`created_at_ms` integer NOT NULL,
	`updated_at_ms` integer NOT NULL,
	FOREIGN KEY (`gym_plan_exercise_id`) REFERENCES `gym_plan_exercises`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `gym_plan_exercise_target_sets_exercise_set_unique_idx` ON `gym_plan_exercise_target_sets` (`gym_plan_exercise_id`,`set_index`);--> statement-breakpoint
CREATE TABLE `gym_plan_exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`gym_plan_section_id` text NOT NULL,
	`exercise_definition_id` text NOT NULL,
	`sort_index` integer NOT NULL,
	`notes` text,
	`created_at_ms` integer NOT NULL,
	`updated_at_ms` integer NOT NULL,
	FOREIGN KEY (`gym_plan_section_id`) REFERENCES `gym_plan_sections`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_definition_id`) REFERENCES `exercise_definitions`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `gym_plan_exercises_section_sort_unique_idx` ON `gym_plan_exercises` (`gym_plan_section_id`,`sort_index`);--> statement-breakpoint
CREATE INDEX `gym_plan_exercises_definition_idx` ON `gym_plan_exercises` (`exercise_definition_id`);--> statement-breakpoint
CREATE TABLE `gym_plan_sections` (
	`id` text PRIMARY KEY NOT NULL,
	`gym_plan_id` text NOT NULL,
	`title` text,
	`sort_index` integer NOT NULL,
	`created_at_ms` integer NOT NULL,
	`updated_at_ms` integer NOT NULL,
	FOREIGN KEY (`gym_plan_id`) REFERENCES `gym_plans`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `gym_plan_sections_plan_sort_unique_idx` ON `gym_plan_sections` (`gym_plan_id`,`sort_index`);--> statement-breakpoint
CREATE TABLE `gym_plans` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at_ms` integer NOT NULL,
	`updated_at_ms` integer NOT NULL,
	`is_favorite` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`draft_target_gym_plan_id` text,
	FOREIGN KEY (`draft_target_gym_plan_id`) REFERENCES `gym_plans`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `gym_plans_status_updated_idx` ON `gym_plans` (`status`,`updated_at_ms`);--> statement-breakpoint
CREATE INDEX `gym_plans_favorite_idx` ON `gym_plans` (`is_favorite`);--> statement-breakpoint
CREATE UNIQUE INDEX `gym_plans_single_draft_idx` ON `gym_plans` (`status`) WHERE "gym_plans"."status" = 'draft';--> statement-breakpoint
CREATE TABLE `gym_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`started_at_ms` integer NOT NULL,
	`ended_at_ms` integer,
	`status` text NOT NULL,
	`source_gym_plan_id` text,
	`notes` text,
	`created_at_ms` integer NOT NULL,
	`updated_at_ms` integer NOT NULL,
	FOREIGN KEY (`source_gym_plan_id`) REFERENCES `gym_plans`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `gym_sessions_single_active_idx` ON `gym_sessions` (`status`) WHERE "gym_sessions"."status" = 'active';--> statement-breakpoint
CREATE INDEX `gym_sessions_status_started_idx` ON `gym_sessions` (`status`,`started_at_ms`);--> statement-breakpoint
CREATE INDEX `gym_sessions_source_plan_idx` ON `gym_sessions` (`source_gym_plan_id`);--> statement-breakpoint
DROP INDEX `workout_blocks_version_sort_idx`;--> statement-breakpoint
CREATE UNIQUE INDEX `workout_blocks_version_sort_unique_idx` ON `workout_blocks` (`workout_version_id`,`sort_index`);--> statement-breakpoint
DROP INDEX `workout_exercises_block_sort_idx`;--> statement-breakpoint
CREATE UNIQUE INDEX `workout_exercises_block_sort_unique_idx` ON `workout_exercises` (`block_id`,`sort_index`);