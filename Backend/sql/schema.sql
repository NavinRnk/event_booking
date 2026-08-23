CREATE DATABASE IF NOT EXISTS `event_ticket_db` CHARACTER
SET
  utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `event_ticket_db`;

CREATE TABLE
  IF NOT EXISTS `users` (
    `user_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_name` VARCHAR(100) NOT NULL,
    `user_email_id` VARCHAR(150) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM ('user', 'admin') NOT NULL DEFAULT 'user',
    `organization_id` INT DEFAULT 0,
    `is_createdby` INT UNSIGNED DEFAULT NULL,
    `last_actionby` INT UNSIGNED DEFAULT NULL,
    `last_action` VARCHAR(10) DEFAULT NULL,
    `is_deleted` TINYINT (1) NOT NULL DEFAULT 0,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`user_id`),
    UNIQUE KEY `uq_users_email` (`user_email_id`)
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE
  IF NOT EXISTS `events` (
    `event_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NOT NULL,
    `event_date` DATETIME NOT NULL,
    `location` VARCHAR(200) NOT NULL,
    `total_tickets` INT UNSIGNED NOT NULL,
    `available_tickets` INT UNSIGNED NOT NULL,
    `metadata` JSON NOT NULL,
    `created_by` INT UNSIGNED NOT NULL,
    `organization_id` INT DEFAULT 0,
    `last_actionby` INT UNSIGNED DEFAULT NULL,
    `last_action` VARCHAR(10) DEFAULT NULL,
    `is_deleted` TINYINT (1) NOT NULL DEFAULT 0,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`event_id`),
    KEY `idx_events_date` (`event_date`),
    KEY `idx_events_created_by` (`created_by`),
    KEY `idx_events_is_deleted` (`is_deleted`),
    CONSTRAINT `fk_events_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE
  IF NOT EXISTS `bookings` (
    `booking_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INT UNSIGNED NOT NULL,
    `event_id` INT UNSIGNED NOT NULL,
    `event_title` VARCHAR(200) NOT NULL,
    `quantity` INT UNSIGNED NOT NULL DEFAULT 1,
    `status` ENUM ('confirmed', 'cancelled') NOT NULL DEFAULT 'confirmed',
    `last_actionby` INT UNSIGNED DEFAULT NULL,
    `last_action` VARCHAR(10) DEFAULT NULL,
    `is_deleted` TINYINT (1) NOT NULL DEFAULT 0,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`booking_id`),
    KEY `idx_bookings_user_id` (`user_id`),
    KEY `idx_bookings_event_id` (`event_id`),
    CONSTRAINT `fk_bookings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_bookings_event` FOREIGN KEY (`event_id`) REFERENCES `events` (`event_id`) ON DELETE RESTRICT ON UPDATE CASCADE
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE
  IF NOT EXISTS `logs` (
    `log_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `level` ENUM ('info', 'warn', 'error') NOT NULL DEFAULT 'info',
    `action` VARCHAR(60) NOT NULL,
    `message` TEXT NOT NULL,
    `user_id` INT UNSIGNED DEFAULT NULL,
    `details` JSON DEFAULT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`log_id`),
    KEY `idx_logs_action` (`action`),
    KEY `idx_logs_user_id` (`user_id`)
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;