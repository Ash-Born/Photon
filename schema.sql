-- ============================================================
-- ZENITH - Cyber Security Suite Database Schema for XAMPP / phpMyAdmin / MySQL
-- Database Name: sentinel_db
-- Encoding: UTF-8 (utf8mb4_unicode_ci)
-- ============================================================

CREATE DATABASE IF NOT EXISTS `sentinel_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `sentinel_db`;

-- ------------------------------------------------------------
-- 1. Table structure for table `users`
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `username` VARCHAR(50) NOT NULL,
  `full_name` VARCHAR(100) DEFAULT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `tier` ENUM('lite', 'pro', 'enterprise') NOT NULL DEFAULT 'lite',
  `status` ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
  `last_login_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_email` (`email`),
  UNIQUE KEY `uk_users_username` (`username`),
  KEY `idx_users_tier_status` (`tier`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 2. Table structure for table `threats_log`
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `threats_log` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `url` TEXT NOT NULL,
  `domain` VARCHAR(255) DEFAULT NULL,
  `threat_type` VARCHAR(50) NOT NULL,
  `severity` INT(11) NOT NULL DEFAULT 0,
  `is_blocked` TINYINT(1) NOT NULL DEFAULT 1,
  `user_id` INT(11) DEFAULT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `user_agent` TEXT DEFAULT NULL,
  `detected_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_threats_domain` (`domain`),
  KEY `idx_threats_threat_type` (`threat_type`),
  KEY `idx_threats_severity` (`severity`),
  KEY `idx_threats_detected_at` (`detected_at`),
  KEY `fk_threats_user` (`user_id`),
  CONSTRAINT `fk_threats_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 3. Table structure for table `fake_news_reports`
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `fake_news_reports` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `content_hash` VARCHAR(255) NOT NULL,
  `content_text` TEXT NOT NULL,
  `source_url` VARCHAR(500) DEFAULT NULL,
  `source_domain` VARCHAR(255) DEFAULT NULL,
  `fake_score` INT(11) NOT NULL DEFAULT 0,
  `confidence` INT(11) NOT NULL DEFAULT 70,
  `is_fake` TINYINT(1) NOT NULL DEFAULT 0,
  `status` ENUM('pending', 'verified', 'rejected') NOT NULL DEFAULT 'pending',
  `user_id` INT(11) DEFAULT NULL,
  `reported_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_fakenews_hash` (`content_hash`),
  KEY `idx_fakenews_score_fake` (`fake_score`, `is_fake`),
  KEY `idx_fakenews_status` (`status`),
  KEY `fk_fakenews_user` (`user_id`),
  CONSTRAINT `fk_fakenews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 4. Table structure for table `blocklist`
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `blocklist` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `domain` VARCHAR(255) NOT NULL,
  `threat_type` VARCHAR(50) NOT NULL DEFAULT 'suspicious',
  `severity` INT(11) NOT NULL DEFAULT 80,
  `source` VARCHAR(100) DEFAULT 'manual',
  `reason` TEXT DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `detected_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_blocklist_domain` (`domain`),
  KEY `idx_blocklist_threat_type` (`threat_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 5. Table structure for table `audit_logs`
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) DEFAULT NULL,
  `username` VARCHAR(50) DEFAULT NULL,
  `action` VARCHAR(255) NOT NULL,
  `action_type` VARCHAR(50) NOT NULL DEFAULT 'system',
  `details` LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`) OR `details` IS NULL),
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'success',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_action_type` (`action_type`),
  KEY `idx_audit_created_at` (`created_at`),
  KEY `fk_audit_user` (`user_id`),
  CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 6. Table structure for table `system_settings`
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `system_settings` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `setting_key` VARCHAR(100) NOT NULL,
  `setting_value` TEXT NOT NULL,
  `setting_group` VARCHAR(50) NOT NULL DEFAULT 'general',
  `setting_type` ENUM('string', 'integer', 'boolean', 'json') NOT NULL DEFAULT 'string',
  `description` TEXT DEFAULT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_settings_key` (`setting_key`),
  KEY `idx_settings_group` (`setting_group`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 7. Table structure for table `user_sessions`
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_sessions` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `session_token` VARCHAR(255) NOT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `user_agent` TEXT DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `expires_at` TIMESTAMP NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_sessions_token` (`session_token`),
  KEY `idx_sessions_user_active` (`user_id`, `is_active`),
  CONSTRAINT `fk_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SEED INITIAL DATA FOR XAMPP TESTING
-- ============================================================

-- Seed Default Admin User
INSERT INTO `users` (`id`, `email`, `username`, `full_name`, `password_hash`, `tier`, `status`) VALUES
(1, 'admin@sentinel.com', 'admin', 'Zenith System Admin', '$2b$12$e0M2/u/QGf0oP4pSg/1p4.L1N.O0P4pSg/1p4.L1N', 'enterprise', 'active')
ON DUPLICATE KEY UPDATE `status`='active';

-- Seed Default Blocklist Domains
INSERT INTO `blocklist` (`domain`, `threat_type`, `severity`, `source`, `reason`) VALUES
('paypal-verify-account-security.xyz', 'phishing', 95, 'system_seed', 'Phishing Credential Harvest'),
('free-robux-coins-claim.net', 'scam', 90, 'system_seed', 'Malicious Cashback Scam'),
('apple-id-confirm-login.top', 'phishing', 96, 'system_seed', 'Apple ID Credential Harvest'),
('bank-login-secure-auth.club', 'phishing', 98, 'system_seed', 'Banking Trojan & Harvest')
ON DUPLICATE KEY UPDATE `severity` = VALUES(`severity`);

-- Seed Default System Settings
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_group`, `setting_type`, `description`) VALUES
('threat_score_threshold_block', '60', 'security', 'integer', 'Score threshold to block URLs'),
('threat_score_threshold_red', '90', 'security', 'integer', 'Score threshold for red screen overlay'),
('block_phishing', 'true', 'protection', 'boolean', 'Enable automated phishing block'),
('block_malware', 'true', 'protection', 'boolean', 'Enable automated malware download inspection'),
('feature_url_scanning', 'true', 'features', 'boolean', 'URL scanner tool active'),
('feature_fake_news', 'true', 'features', 'boolean', 'Fake news analyzer tool active')
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

COMMIT;
