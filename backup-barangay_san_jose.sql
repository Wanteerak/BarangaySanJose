/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.16-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: barangay_san_jose
-- ------------------------------------------------------
-- Server version	10.11.16-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `message_id` int(11) NOT NULL AUTO_INCREMENT,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`message_id`),
  KEY `sender_id` (`sender_id`),
  KEY `receiver_id` (`receiver_id`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES
(1,2,1,'Hu','2026-11-13 01:30:37'),
(2,2,1,'Hello ','2026-11-13 01:31:01'),
(3,2,1,'Hello admin, test message from resident!','2026-11-13 01:33:18'),
(4,1,2,'Salamat Juan, na-receive ko na ang message mo.','2026-11-13 01:33:55'),
(5,1,2,'Kumusta! Ano ang kailangan niyong impormasyon?','2026-11-13 23:05:00'),
(6,1,2,'Pwede na kayong mag-claim ng inyong dokumento sa barangay hall.','2026-11-13 23:06:44'),
(7,1,2,'Ang Certificate of Indigency ay para sa medical/financial assistance.','2026-11-13 23:06:49'),
(8,2,1,'kumain ka na','2026-11-13 23:08:40'),
(9,1,2,'Pakilagay ang inyong Request ID para ma-check ko.','2026-11-14 02:52:05'),
(10,2,1,'hello po','2026-11-14 04:00:23'),
(11,1,2,'ask lang po','2026-11-14 04:01:26'),
(12,2,1,'okay na bveh','2026-11-14 04:01:35'),
(13,2,1,'bye love you','2026-11-14 04:01:39'),
(14,1,2,'Ang Certificate of Indigency ay para sa medical/financial assistance.','2026-11-14 04:01:45'),
(15,2,1,'Hu','2026-11-14 04:35:08'),
(16,1,2,'Pakilagay ang inyong Request ID para ma-check ko.','2026-11-14 04:36:04'),
(17,1,2,'mama mo','2026-11-14 04:36:14'),
(18,2,1,'Hello','2026-11-14 04:37:15'),
(19,2,1,'Hello','2026-11-14 04:37:15'),
(20,2,1,'Hello','2026-11-14 04:37:15'),
(21,2,1,'Hello','2026-11-14 04:37:15'),
(22,2,1,'Hello','2026-11-14 04:37:15'),
(23,2,1,'Hello','2026-11-14 04:37:15'),
(24,2,1,'Hello','2026-11-14 04:37:15'),
(25,2,1,'Hello','2026-11-14 04:37:15'),
(26,2,1,'Hello','2026-11-14 04:37:15'),
(27,2,1,'Hello','2026-11-14 04:37:15'),
(28,2,1,'Hello','2026-11-14 04:37:15'),
(29,2,1,'Hello','2026-11-14 04:37:15'),
(30,2,1,'Hello','2026-11-14 04:37:15'),
(31,2,1,'Hello','2026-11-14 04:37:15'),
(32,2,1,'Hello','2026-11-14 04:37:15');
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `requests`
--

DROP TABLE IF EXISTS `requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `requests` (
  `request_id` int(11) NOT NULL AUTO_INCREMENT,
  `request_code` varchar(12) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` enum('clearance','indigency','id','low_income','guardianship','cohabitation') NOT NULL,
  `id_request_type` varchar(10) DEFAULT NULL,
  `is_voter` tinyint(1) DEFAULT NULL,
  `purpose` text NOT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `middle_name` varchar(50) DEFAULT NULL,
  `surname` varchar(50) DEFAULT NULL,
  `birth_place` varchar(100) DEFAULT NULL,
  `contact_number` varchar(30) DEFAULT NULL,
  `emergency_contact_name` varchar(100) DEFAULT NULL,
  `emergency_contact_number` varchar(30) DEFAULT NULL,
  `requirement_type` varchar(20) DEFAULT NULL,
  `hoa_cert` longtext DEFAULT NULL,
  `id_photo` longtext DEFAULT NULL,
  `front_photo` longtext DEFAULT NULL,
  `back_photo` longtext DEFAULT NULL,
  `requirement_doc` longtext DEFAULT NULL,
  `status` enum('pending','approved','rejected','released') NOT NULL DEFAULT 'pending',
  `scheduled_date` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `complete_name` varchar(100) DEFAULT NULL,
  `complete_address` varchar(200) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `priority` varchar(30) DEFAULT NULL,
  `certified` tinyint(1) DEFAULT NULL,
  `office_agency` varchar(150) DEFAULT NULL,
  `beneficiary_name` varchar(100) DEFAULT NULL,
  `beneficiary_relation` varchar(50) DEFAULT NULL,
  `child_name` varchar(100) DEFAULT NULL,
  `father_name` varchar(100) DEFAULT NULL,
  `mother_name` varchar(100) DEFAULT NULL,
  `guardian_name` varchar(100) DEFAULT NULL,
  `relationship` varchar(50) DEFAULT NULL,
  `partner1_name` varchar(100) DEFAULT NULL,
  `partner1_birthday` date DEFAULT NULL,
  `partner2_name` varchar(100) DEFAULT NULL,
  `partner2_birthday` date DEFAULT NULL,
  `shared_residence` varchar(200) DEFAULT NULL,
  `years_living` varchar(20) DEFAULT NULL,
  `cohabitation_started` varchar(10) DEFAULT NULL,
  `children_info` text DEFAULT NULL,
  `reject_reason` text DEFAULT NULL,
  PRIMARY KEY (`request_id`),
  UNIQUE KEY `request_code` (`request_code`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `requests`
--

LOCK TABLES `requests` WRITE;
/*!40000 ALTER TABLE `requests` DISABLE KEYS */;
INSERT INTO `requests` VALUES
(1,'BSJ-408717',2,'id',NULL,NULL,'Barangay ID application for school',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'released','2026-11-13 09:31:07','2026-11-12 23:56:51',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(2,'BSJ-387005',2,'id',NULL,NULL,'Tahakallaman',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'released','2026-11-13 09:31:40','2026-11-13 01:31:28',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(3,'BSJ-875253',2,'id',NULL,NULL,'Barangay ID application',NULL,NULL,NULL,'Quezon City','09171234567',NULL,NULL,'hoa',NULL,'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',NULL,NULL,'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==','pending',NULL,'2026-11-14 02:44:12',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(4,'BSJ-131985',2,'id','renew',NULL,'Barangay ID application',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==','data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',NULL,'pending',NULL,'2026-11-14 02:48:37',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(5,'BSJ-995566',2,'clearance',NULL,NULL,'Para sa job application',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'rejected',NULL,'2026-11-14 03:17:57',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Incomplete ang proof of identity. Paki-upload muli ang malinaw na valid government ID.');
/*!40000 ALTER TABLE `requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','resident') NOT NULL DEFAULT 'resident',
  `address` varchar(255) DEFAULT '',
  `purok` varchar(50) DEFAULT '',
  `birthdate` date DEFAULT NULL,
  `civil_status` enum('Single','Married','Widowed','Separated') DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
(1,'Barangay Administrator','admin@barangay.gov','$2a$10$NIAflrRJpiJAiZedBXoxY.bdAaI33P37UEhkv3/7QCv4Zbc4fxM3e','admin','','',NULL,NULL,'2026-11-12 23:55:31'),
(2,'Juan Dela Cruz','juan@demo.com','$2a$10$JushgFamOdYxOldtAO9QZ.tX.tXDMwUo/A3zMEYe5UlKzKYBapawi','resident','Purok 2, Barangay San Jose','2','1995-06-15','Single','2026-11-12 23:55:31'),
(3,'Maria Santos','maria@demo.com','$2a$10$sFJpjG4nZr/m4m4pGga8COExrvP68NsAACYTk9gD7elyDdnlE/O6.','resident','Purok 5, Barangay San Jose','5','2000-03-10','Single','2026-11-13 00:00:15');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-14 13:38:45
