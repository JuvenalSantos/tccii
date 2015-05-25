-- phpMyAdmin SQL Dump
-- version 4.0.10deb1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: May 25, 2015 at 11:22 AM
-- Server version: 5.6.19-0ubuntu0.14.04.1
-- PHP Version: 5.5.9-1ubuntu4.9

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `vint`
--
CREATE DATABASE IF NOT EXISTS `vint` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `vint`;

DELIMITER $$
--
-- Functions
--
CREATE DEFINER=`root`@`localhost` FUNCTION `dateByFifteenMinutes`(creat_at DATETIME) RETURNS char(19) CHARSET utf8
    DETERMINISTIC
BEGIN
    CASE

                WHEN MINUTE(creat_at) < 15 THEN RETURN DATE_FORMAT(creat_at, '%Y/%m/%d %H:00:00');

                WHEN MINUTE(creat_at) < 30 THEN RETURN DATE_FORMAT(creat_at, '%Y/%m/%d %H:15:00');

                WHEN MINUTE(creat_at) < 45 THEN RETURN DATE_FORMAT(creat_at, '%Y/%m/%d %H:30:00');

                ELSE RETURN  DATE_FORMAT(creat_at, '%Y/%m/%d %H:45:00');
    END CASE;
END$$

CREATE DEFINER=`root`@`localhost` FUNCTION `dateByFiveMinutes`(creat_at DATETIME) RETURNS char(19) CHARSET utf8
    DETERMINISTIC
BEGIN
    CASE
                WHEN MINUTE(creat_at) < 5  THEN RETURN DATE_FORMAT(creat_at, '%Y/%m/%d %H:00:00');
                WHEN MINUTE(creat_at) < 10 THEN RETURN DATE_FORMAT(creat_at, '%Y/%m/%d %H:05:00');
                WHEN MINUTE(creat_at) < 15 THEN RETURN DATE_FORMAT(creat_at, '%Y/%m/%d %H:10:00');
                WHEN MINUTE(creat_at) < 20 THEN RETURN DATE_FORMAT(creat_at, '%Y/%m/%d %H:15:00');
                WHEN MINUTE(creat_at) < 25 THEN RETURN DATE_FORMAT(creat_at, '%Y/%m/%d %H:20:00');
                WHEN MINUTE(creat_at) < 30 THEN RETURN DATE_FORMAT(creat_at, '%Y/%m/%d %H:25:00');
                WHEN MINUTE(creat_at) < 35 THEN RETURN DATE_FORMAT(creat_at, '%Y/%m/%d %H:30:00');
                WHEN MINUTE(creat_at) < 40 THEN RETURN DATE_FORMAT(creat_at, '%Y/%m/%d %H:35:00');
                WHEN MINUTE(creat_at) < 45 THEN RETURN DATE_FORMAT(creat_at, '%Y/%m/%d %H:40:00');
                WHEN MINUTE(creat_at) < 50 THEN RETURN DATE_FORMAT(creat_at, '%Y/%m/%d %H:45:00');
                WHEN MINUTE(creat_at) < 55 THEN RETURN DATE_FORMAT(creat_at, '%Y/%m/%d %H:50:00');
                ELSE RETURN  DATE_FORMAT(creat_at, '%Y/%m/%d %H:55:00');
    END CASE;
END$$

CREATE DEFINER=`root`@`localhost` FUNCTION `dateByTenMinutes`(creat_at DATETIME) RETURNS char(19) CHARSET utf8
    DETERMINISTIC
BEGIN
    CASE
                WHEN MINUTE(creat_at) < 10  THEN RETURN DATE_FORMAT(creat_at, '%Y/%m/%d %H:00:00');
                WHEN MINUTE(creat_at) < 20 THEN RETURN DATE_FORMAT(creat_at, '%Y/%m/%d %H:10:00');
                WHEN MINUTE(creat_at) < 30 THEN RETURN DATE_FORMAT(creat_at, '%Y/%m/%d %H:20:00');
                WHEN MINUTE(creat_at) < 40 THEN RETURN DATE_FORMAT(creat_at, '%Y/%m/%d %H:30:00');
                WHEN MINUTE(creat_at) < 50 THEN RETURN DATE_FORMAT(creat_at, '%Y/%m/%d %H:40:00');
                ELSE RETURN  DATE_FORMAT(creat_at, '%Y/%m/%d %H:50:00');
    END CASE;
END$$

CREATE DEFINER=`root`@`localhost` FUNCTION `dateByThirtyMinutes`(`creat_at` DATETIME) RETURNS char(19) CHARSET utf8
    DETERMINISTIC
BEGIN
    CASE
                WHEN MINUTE(creat_at) < 30 THEN RETURN DATE_FORMAT(creat_at, '%Y/%m/%d %H:00:00');
                ELSE RETURN  DATE_FORMAT(creat_at, '%Y/%m/%d %H:30:00');
    END CASE;
END$$

CREATE DEFINER=`root`@`localhost` FUNCTION `quarterByFifteenMinutes`(creat_at DATETIME) RETURNS int(11)
    DETERMINISTIC
BEGIN
    CASE
                WHEN MINUTE(creat_at) < 15 THEN RETURN 0;
                WHEN MINUTE(creat_at) < 30 THEN RETURN 1;
                WHEN MINUTE(creat_at) < 45 THEN RETURN 2;
                ELSE RETURN 3;
    END CASE;
END$$

CREATE DEFINER=`root`@`localhost` FUNCTION `quarterByFiveMinutes`(creat_at DATETIME) RETURNS int(11)
    DETERMINISTIC
BEGIN
    CASE
                WHEN MINUTE(creat_at) < 5  THEN RETURN 0;
                WHEN MINUTE(creat_at) < 10 THEN RETURN 1;
                WHEN MINUTE(creat_at) < 15 THEN RETURN 2;
                WHEN MINUTE(creat_at) < 20 THEN RETURN 3;
                WHEN MINUTE(creat_at) < 25 THEN RETURN 4;
                WHEN MINUTE(creat_at) < 30 THEN RETURN 5;
                WHEN MINUTE(creat_at) < 35 THEN RETURN 6;
                WHEN MINUTE(creat_at) < 40 THEN RETURN 7;
                WHEN MINUTE(creat_at) < 45 THEN RETURN 8;
                WHEN MINUTE(creat_at) < 50 THEN RETURN 9;
                WHEN MINUTE(creat_at) < 55 THEN RETURN 10;
                ELSE RETURN 11;
    END CASE;
END$$

CREATE DEFINER=`root`@`localhost` FUNCTION `quarterByTenMinutes`(creat_at DATETIME) RETURNS int(11)
    DETERMINISTIC
BEGIN
    CASE
                WHEN MINUTE(creat_at) < 10 THEN RETURN 0;
                WHEN MINUTE(creat_at) < 20 THEN RETURN 1;
                WHEN MINUTE(creat_at) < 30 THEN RETURN 2;
                WHEN MINUTE(creat_at) < 40 THEN RETURN 3;
                WHEN MINUTE(creat_at) < 50 THEN RETURN 4;
                ELSE RETURN 5;
    END CASE;
END$$

CREATE DEFINER=`root`@`localhost` FUNCTION `quarterByThirtyMinutes`(`creat_at` DATETIME) RETURNS int(11)
    DETERMINISTIC
BEGIN
    CASE
                WHEN MINUTE(creat_at) < 30 THEN RETURN 0;
                ELSE RETURN 1;
    END CASE;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `SentimentScale`
--

CREATE TABLE IF NOT EXISTS `SentimentScale` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sentiment` tinyint(4) NOT NULL,
  `description` varchar(45) NOT NULL,
  `Visualization_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sentiment_UNIQUE` (`sentiment`,`Visualization_id`),
  UNIQUE KEY `description_UNIQUE` (`description`,`Visualization_id`),
  KEY `fk_SentimentScale_Visualization1_idx` (`Visualization_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=295 ;

-- --------------------------------------------------------

--
-- Table structure for table `Tweet`
--

CREATE TABLE IF NOT EXISTS `Tweet` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tweet_id` varchar(20) NOT NULL,
  `tweet_text` varchar(255) NOT NULL,
  `user` varchar(128) NOT NULL,
  `followers` int(10) unsigned NOT NULL,
  `words` text NOT NULL,
  `creat_at` datetime NOT NULL,
  `hashtags` text NOT NULL,
  `subject` varchar(255) NOT NULL,
  `sentiment` tinyint(4) NOT NULL,
  `Visualization_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tweet_id_UNIQUE` (`tweet_id`,`Visualization_id`),
  KEY `fk_Tweet_Visualization_idx` (`Visualization_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=2188063 ;

-- --------------------------------------------------------

--
-- Table structure for table `Visualization`
--

CREATE TABLE IF NOT EXISTS `Visualization` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `creat_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `file` varchar(255) DEFAULT NULL,
  `total_tweets` int(10) unsigned DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`),
  UNIQUE KEY `file_UNIQUE` (`file`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=153 ;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `SentimentScale`
--
ALTER TABLE `SentimentScale`
  ADD CONSTRAINT `fk_SentimentScale_Visualization1` FOREIGN KEY (`Visualization_id`) REFERENCES `Visualization` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `Tweet`
--
ALTER TABLE `Tweet`
  ADD CONSTRAINT `fk_Tweet_Visualization` FOREIGN KEY (`Visualization_id`) REFERENCES `Visualization` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
