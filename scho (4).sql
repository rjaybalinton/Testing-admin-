-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Nov 25, 2024 at 02:16 AM
-- Server version: 8.3.0
-- PHP Version: 8.2.18

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `scho`
--

-- --------------------------------------------------------

--
-- Table structure for table `application_status`
--

DROP TABLE IF EXISTS `application_status`;
CREATE TABLE IF NOT EXISTS `application_status` (
  `status_id` int NOT NULL AUTO_INCREMENT,
  `student_id` varchar(25) NOT NULL,
  `status` enum('pending','confirmed','rejected') NOT NULL DEFAULT 'pending',
  `reason` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`status_id`),
  KEY `student_id` (`student_id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `application_status`
--

INSERT INTO `application_status` (`status_id`, `student_id`, `status`, `reason`, `updated_at`) VALUES
(13, '1111', 'confirmed', NULL, '2024-11-18 13:04:26'),
(14, '147', 'confirmed', NULL, '2024-11-18 13:05:11'),
(15, '2222', 'confirmed', NULL, '2024-11-18 13:11:48'),
(16, '9999', 'confirmed', NULL, '2024-11-18 13:15:19'),
(17, '3333', 'rejected', NULL, '2024-11-21 00:36:22'),
(18, '7894', 'confirmed', NULL, '2024-11-24 10:01:34'),
(19, '9997', 'rejected', NULL, '2024-11-24 10:02:02');

-- --------------------------------------------------------

--
-- Table structure for table `posts`
--

DROP TABLE IF EXISTS `posts`;
CREATE TABLE IF NOT EXISTS `posts` (
  `post_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id` int NOT NULL,
  PRIMARY KEY (`post_id`),
  KEY `fk_user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `posts`
--

INSERT INTO `posts` (`post_id`, `title`, `content`, `created_at`, `user_id`) VALUES
(1, 'Welcome to the Scholarship Program', 'We are excited to support our students! Apply now for scholarships.', '2024-11-01 01:28:32', 1),
(2, 'Important Notice', 'Make sure to submit your registration by the end of the semester.', '2024-11-01 01:28:32', 1),
(3, 'Update for Scholarship', 'Lahat po ay pumunta sa AC para pagkuha ng pera sa ganap na 3:00 pm ng hapon', '2024-11-10 13:00:25', 1),
(4, 'Qualified for Scholarship', 'John Smith\r\nSarah Johnson\r\nMichael Brown\r\nEmily Davis\r\nChristopher Garcia\r\nJessica Martinez\r\nWilliam Rodriguez\r\nAmanda Wilson\r\nMatthew Anderson\r\nLaura Thomas', '2024-11-10 14:25:08', 1),
(5, 'k', 'k', '2024-11-11 03:09:05', 1),
(12, 'ss', 'dsdsd', '2024-11-17 13:30:40', 1),
(13, 'ds', 'ds', '2024-11-17 13:30:49', 1),
(14, 'ss', 'ss', '2024-11-17 15:12:57', 1),
(15, 'd', 'd', '2024-11-17 16:10:37', 1);

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
CREATE TABLE IF NOT EXISTS `students` (
  `student_id` varchar(25) NOT NULL,
  `student_number` int NOT NULL AUTO_INCREMENT,
  `last_name` varchar(50) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `middle_initial` char(1) DEFAULT NULL,
  `degree_program` varchar(100) NOT NULL,
  `year_level` int NOT NULL,
  `gmail` varchar(100) NOT NULL,
  `phone_number` varchar(15) NOT NULL,
  `status_enrollment` enum('graduate','enrolled','not_enrolled') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `zip_code` varchar(10) NOT NULL,
  `enrolled_units` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`student_id`),
  UNIQUE KEY `student_number` (`student_number`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`student_id`, `student_number`, `last_name`, `first_name`, `middle_initial`, `degree_program`, `year_level`, `gmail`, `phone_number`, `status_enrollment`, `zip_code`, `enrolled_units`, `created_at`) VALUES
('1111', 1, 'dalisay', 'R-Jay', 'L', 'BSIT', 3, 'janine@gmail.com', '1880605163', '', '5203', 3, '2024-11-17 12:45:32'),
('147', 3, 'dalisay', 'janine', 's', 'bsit', 2, 'janine@gmail.com', '5643', '', '5203', 3, '2024-11-17 16:20:46'),
('2222', 7, 'sfjsij', 'hjhj', 's', 'sdjas', 2, 'janine@gmail.com', '2656262', '', '5203', 6, '2024-11-18 12:59:46'),
('3333', 9, 'balinton', 'jayron', 'l', 'BSIT', 1, 'jayron@gmail.com', '09147852399', 'enrolled', '5203', 6, '2024-11-21 00:24:24'),
('7894', 12, 'martinez', 'loyd', 'k', 'CCJE', 1, 'loyd@gmail.com', '0979646168', 'enrolled', '5203', 6, '2024-11-24 10:01:02'),
('9997', 11, 'pppp', 'ppppp', 's', 'bsit', 2, 'janine@gmail.com', '5643', 'enrolled', '5203', 3, '2024-11-21 16:37:38'),
('9999', 8, 'sdsds', 'rio', 's', 'bsit', 3, 'janine@gmail.com', '0565154', 'enrolled', '5203', 6, '2024-11-18 13:15:17');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `token` varchar(255) DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT '0',
  `verified` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `token`, `is_verified`, `verified`) VALUES
(1, 'jhayllena1234@gmail.com', '$2a$08$BTO.6a5JBWsC1oqmA.rtHenQ9kPptTxL5y3d9pdQ7j.GJiYm4m7ym', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpoYXlsbGVuYTEyMzRAZ21haWwuY29tIiwiaWF0IjoxNzI5NjY3MjMxLCJleHAiOjE3Mjk2NzA4MzF9.ty8KSwbfmEvlMay7prXo7elRJjXAt8wqRLDylycm49w', 0, 0);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `application_status`
--
ALTER TABLE `application_status`
  ADD CONSTRAINT `fk_student_id` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE;

--
-- Constraints for table `posts`
--
ALTER TABLE `posts`
  ADD CONSTRAINT `fk_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
