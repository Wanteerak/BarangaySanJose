-- ============================================================
-- Barangay San Jose System - Database Schema
-- Database: barangay_san_jose (MySQL / MariaDB sa XAMPP)
-- ============================================================

USE barangay_san_jose;

-- ------------------------------------------------------------
-- USERS (admin at residents)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  user_id      INT AUTO_INCREMENT PRIMARY KEY,
  full_name    VARCHAR(100) NOT NULL,
  email        VARCHAR(100) NOT NULL UNIQUE,
  password     VARCHAR(255) NOT NULL,
  role         ENUM('admin','resident') NOT NULL DEFAULT 'resident',
  address      VARCHAR(255) DEFAULT '',
  purok        VARCHAR(50)  DEFAULT '',
  birthdate    DATE NULL,
  civil_status ENUM('Single','Married','Widowed','Separated') NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- REQUESTS (Clearance, Indigency, Request ID)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS requests (
  request_id     INT AUTO_INCREMENT PRIMARY KEY,
  request_code   VARCHAR(12) NOT NULL UNIQUE,          -- BSJ-XXXXXX
  user_id        INT NOT NULL,
  type           ENUM('clearance','indigency','id','low_income','guardianship','cohabitation') NOT NULL,
  purpose        TEXT NOT NULL,
  id_request_type VARCHAR(10) NULL,
  is_voter       TINYINT(1) NULL,
  first_name     VARCHAR(50) NULL,
  middle_name    VARCHAR(50) NULL,
  surname        VARCHAR(50) NULL,
  complete_name  VARCHAR(100) NULL,
  complete_address VARCHAR(200) NULL,
  birth_place    VARCHAR(100) NULL,
  date_of_birth  DATE NULL,
  contact_number VARCHAR(30) NULL,
  emergency_contact_name VARCHAR(100) NULL,
  emergency_contact_number VARCHAR(30) NULL,
  priority       VARCHAR(30) NULL,
  certified      TINYINT(1) NULL,
  requirement_type VARCHAR(20) NULL,
  hoa_cert       LONGTEXT NULL,
  id_photo       LONGTEXT NULL,
  front_photo    LONGTEXT NULL,
  back_photo     LONGTEXT NULL,
  requirement_doc LONGTEXT NULL,
  status         ENUM('pending','approved','rejected','released') NOT NULL DEFAULT 'pending',
  scheduled_date DATETIME NULL,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- MESSAGES (Live Chat: resident <-> admin)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS messages (
  message_id  INT AUTO_INCREMENT PRIMARY KEY,
  sender_id   INT NOT NULL,
  receiver_id INT NOT NULL,
  message     TEXT NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(user_id) ON DELETE CASCADE
);
