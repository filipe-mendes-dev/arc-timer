ALTER TABLE `exercise_definition_default_tracking_fields` ADD `has_reps` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `exercise_definition_default_tracking_fields` ADD `has_weight` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `exercise_definition_default_tracking_fields` ADD `has_duration` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `exercise_definition_default_tracking_fields` ADD `has_distance` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `exercise_definition_default_tracking_fields` ADD `has_rpe` integer DEFAULT false NOT NULL;--> statement-breakpoint
UPDATE `exercise_definition_default_tracking_fields`
SET
    `has_reps` = CASE WHEN `reps` IS NOT NULL THEN true ELSE false END,
    `has_weight` = CASE WHEN `weight_grams` IS NOT NULL THEN true ELSE false END,
    `has_duration` = CASE WHEN `duration_sec` IS NOT NULL THEN true ELSE false END,
    `has_distance` = CASE WHEN `distance_meters` IS NOT NULL THEN true ELSE false END,
    `has_rpe` = CASE WHEN `rpe_tenths` IS NOT NULL THEN true ELSE false END;
