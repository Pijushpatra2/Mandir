-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: sksstdatabase.c9c4wq4gcxjc.eu-north-1.rds.amazonaws.com:3306
-- Generation Time: Jul 12, 2026 at 09:53 AM
-- Server version: 8.4.9
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sksstdatabase`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_users`
--

CREATE TABLE `admin_users` (
  `id` int UNSIGNED NOT NULL,
  `name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(180) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'bcrypt hashed — never store plain text',
  `role` enum('super_admin','module_admin','viewer') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'module_admin',
  `module_scope` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'e.g. canteen | temple | events | NULL=all',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `last_login_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='GLOBAL — Single platform admin table shared by all modules';

--
-- Dumping data for table `admin_users`
--

INSERT INTO `admin_users` (`id`, `name`, `email`, `password_hash`, `role`, `module_scope`, `is_active`, `last_login_at`, `created_at`, `updated_at`) VALUES
(1, 'Platform Super Admin', 'superadmin@pujasoftware.com', '$2b$12$mBmQANAUZS6H3gnpbX6AkeEg3jn0U.vxoQKLXQHRv1JPeppKfn2Jm', 'super_admin', NULL, 1, '2026-07-12 00:55:17', '2026-07-04 20:30:28', '2026-07-12 00:55:17'),
(2, 'Canteen Module Admin', 'canteen@pujasoftware.com', '', 'module_admin', 'canteen', 1, NULL, '2026-07-04 20:30:28', '2026-07-04 20:30:28');

-- --------------------------------------------------------

--
-- Table structure for table `canteen_bookings`
--

CREATE TABLE `canteen_bookings` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `customer_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'canteen_customers.id — NULL if walk-in phone booking',
  `customer_name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_phone` varchar(25) COLLATE utf8mb4_unicode_ci NOT NULL,
  `table_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `booking_date` date NOT NULL,
  `booking_time` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'e.g. 02:30 PM',
  `party_size` tinyint UNSIGNED NOT NULL DEFAULT '2',
  `status` enum('CONFIRMED','SEATED','CANCELLED','NO_SHOW') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CONFIRMED',
  `special_notes` text COLLATE utf8mb4_unicode_ci,
  `booked_by` int UNSIGNED DEFAULT NULL COMMENT 'canteen_staff.id who registered this booking',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='CANTEEN — Table reservation calendar for devotees';

--
-- Dumping data for table `canteen_bookings`
--

INSERT INTO `canteen_bookings` (`id`, `customer_id`, `customer_name`, `customer_phone`, `table_id`, `booking_date`, `booking_time`, `party_size`, `status`, `special_notes`, `booked_by`, `created_at`, `updated_at`) VALUES
('book-1', 'cust-5', 'Pankaj Shah', '+256 754 112244', 'tab-5', '2026-07-04', '02:30 PM', 6, 'CONFIRMED', NULL, NULL, '2026-07-04 20:30:28', '2026-07-04 20:30:28'),
('book-2', NULL, 'Nitin Devji', '+256 702 556677', 'tab-1', '2026-07-04', '07:00 PM', 4, 'CONFIRMED', NULL, NULL, '2026-07-04 20:30:28', '2026-07-04 20:30:28'),
('book-3', 'cust-3', 'Kishor Lal', '+256 781 889900', 'tab-4', '2026-07-04', '01:00 PM', 3, 'SEATED', NULL, NULL, '2026-07-04 20:30:28', '2026-07-04 20:30:28');

-- --------------------------------------------------------

--
-- Table structure for table `canteen_categories`
--

CREATE TABLE `canteen_categories` (
  `id` int UNSIGNED NOT NULL,
  `name` varchar(120) COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `canteen_categories`
--

INSERT INTO `canteen_categories` (`id`, `name`, `created_at`) VALUES
(1, 'Mains', '2026-07-10 01:36:17'),
(2, 'Snacks', '2026-07-10 01:36:17'),
(3, 'Beverages', '2026-07-10 01:36:17'),
(4, 'Desserts', '2026-07-10 01:36:17'),
(5, 'Combos', '2026-07-10 01:36:17'),
(6, 'Add', '2026-07-10 01:36:17'),
(7, 'Test', '2026-07-11 12:17:25');

-- --------------------------------------------------------

--
-- Table structure for table `canteen_customers`
--

CREATE TABLE `canteen_customers` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(25) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(180) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_type` enum('VIP','Regular','Guest') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Guest',
  `total_orders` int UNSIGNED NOT NULL DEFAULT '0',
  `total_visits` int UNSIGNED NOT NULL DEFAULT '0',
  `total_spent` decimal(12,2) NOT NULL DEFAULT '0.00',
  `last_visit` date DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci COMMENT 'Internal staff notes about this devotee',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='CANTEEN — Devotee and walk-in customer profiles (NOT staff, NOT admins)';

--
-- Dumping data for table `canteen_customers`
--

INSERT INTO `canteen_customers` (`id`, `name`, `phone`, `email`, `customer_type`, `total_orders`, `total_visits`, `total_spent`, `last_visit`, `notes`, `is_active`, `created_at`, `updated_at`) VALUES
('cust-1', 'Kamlesh Patel', '+256 701 234567', 'kamlesh@gmail.com', 'Regular', 12, 12, 2840.00, '2026-07-04', NULL, 1, '2026-07-04 20:30:28', '2026-07-04 20:30:28'),
('cust-2', 'Amit Vora', '+256 752 987654', 'amit@gmail.com', 'Regular', 8, 8, 1960.00, '2026-07-04', NULL, 1, '2026-07-04 20:30:28', '2026-07-04 20:30:28'),
('cust-3', 'Sanjay Mehta', '+256 703 112233', 'sanjay@gmail.com', 'Guest', 4, 4, 910.00, '2026-07-04', NULL, 1, '2026-07-04 20:30:28', '2026-07-04 20:30:28'),
('cust-4', 'Radha Sharma', '+256 772 445566', 'radha@gmail.com', 'VIP', 22, 22, 7420.00, '2026-07-04', NULL, 1, '2026-07-04 20:30:28', '2026-07-04 20:30:28'),
('cust-5', 'Pankaj Shah', '+256 754 112244', 'pankaj@gmail.com', 'Guest', 3, 3, 750.00, '2026-07-03', NULL, 1, '2026-07-04 20:30:28', '2026-07-04 20:30:28');

-- --------------------------------------------------------

--
-- Table structure for table `canteen_inventory`
--

CREATE TABLE `canteen_inventory` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` enum('Grains','Dairy','Spices','Beverages','Vegetables','Other') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Other',
  `stock` decimal(10,3) NOT NULL DEFAULT '0.000' COMMENT 'Current stock quantity',
  `unit` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'kg, Litre, Packet, Bag etc.',
  `min_stock` decimal(10,3) NOT NULL DEFAULT '0.000' COMMENT 'Reorder alert threshold',
  `supplier_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `unit_cost` decimal(8,2) DEFAULT NULL COMMENT 'Cost per unit from supplier',
  `last_restocked` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='CANTEEN — Raw ingredient stock levels with low-stock thresholds';

--
-- Dumping data for table `canteen_inventory`
--

INSERT INTO `canteen_inventory` (`id`, `name`, `category`, `stock`, `unit`, `min_stock`, `supplier_id`, `unit_cost`, `last_restocked`, `created_at`, `updated_at`) VALUES
('inv-1', 'Basmati Rice', 'Grains', 120.000, 'kg', 30.000, 'sup-2', NULL, NULL, '2026-07-04 20:30:28', '2026-07-04 20:30:28'),
('inv-2', 'Premium Paneer', 'Dairy', 14.000, 'kg', 15.000, 'sup-1', NULL, NULL, '2026-07-04 20:30:28', '2026-07-04 20:30:28'),
('inv-3', 'Fresh Milk', 'Dairy', 25.000, 'Litre', 10.000, 'sup-1', NULL, NULL, '2026-07-04 20:30:28', '2026-07-04 20:30:28'),
('inv-4', 'Cardamom Pods', 'Spices', 2.500, 'kg', 1.000, 'sup-3', NULL, NULL, '2026-07-04 20:30:28', '2026-07-04 20:30:28'),
('inv-5', 'Wheat Flour (Atta)', 'Grains', 85.000, 'kg', 25.000, 'sup-2', NULL, NULL, '2026-07-04 20:30:28', '2026-07-04 20:30:28'),
('inv-6', 'Annapoorna Tea Dust', 'Beverages', 4.000, 'kg', 5.000, 'sup-3', NULL, NULL, '2026-07-04 20:30:28', '2026-07-04 20:30:28'),
('inv-7', 'Refined Sugar', 'Other', 45.000, 'kg', 10.000, 'sup-3', NULL, NULL, '2026-07-04 20:30:28', '2026-07-04 20:30:28');

-- --------------------------------------------------------

--
-- Table structure for table `canteen_inventory_log`
--

CREATE TABLE `canteen_inventory_log` (
  `id` int UNSIGNED NOT NULL,
  `inventory_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('RESTOCK','USAGE','WASTE','ADJUSTMENT') COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` decimal(10,3) NOT NULL COMMENT 'Positive=addition, Negative=deduction',
  `note` text COLLATE utf8mb4_unicode_ci,
  `performed_by` int UNSIGNED DEFAULT NULL COMMENT 'canteen_staff.id',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='CANTEEN — Audit log for every inventory stock movement';

-- --------------------------------------------------------

--
-- Table structure for table `canteen_menu_combo_items`
--

CREATE TABLE `canteen_menu_combo_items` (
  `id` int UNSIGNED NOT NULL,
  `combo_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'canteen_menu_items.id of the parent combo',
  `component_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'canteen_menu_items.id of bundled item',
  `quantity` tinyint UNSIGNED NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='CANTEEN — Bundle contents for combo menu items';

--
-- Dumping data for table `canteen_menu_combo_items`
--

INSERT INTO `canteen_menu_combo_items` (`id`, `combo_id`, `component_id`, `quantity`) VALUES
(1, 'combo-1', 'food-1', 1),
(2, 'combo-1', 'food-6', 1),
(3, 'combo-2', 'food-3', 1);

-- --------------------------------------------------------

--
-- Table structure for table `canteen_menu_items`
--

CREATE TABLE `canteen_menu_items` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(8,2) NOT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Mains',
  `variety` enum('Regular','Jain','Spicy','Sweet') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Regular',
  `description` text COLLATE utf8mb4_unicode_ci,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `available` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` smallint NOT NULL DEFAULT '0' COMMENT 'Display order in POS menu panel',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='CANTEEN — Food menu catalog (mains, snacks, beverages, desserts, combos, add-ons)';

--
-- Dumping data for table `canteen_menu_items`
--

INSERT INTO `canteen_menu_items` (`id`, `name`, `price`, `category`, `variety`, `description`, `image_url`, `available`, `sort_order`, `created_at`, `updated_at`) VALUES
('addon-1', 'Extra Butter Paneer Gravy', 60.00, '', 'Regular', NULL, NULL, 1, 60, '2026-07-04 20:30:28', '2026-07-11 12:29:47'),
('addon-2', 'Extra Cheese Topping', 30.00, '', 'Regular', NULL, NULL, 1, 61, '2026-07-04 20:30:28', '2026-07-11 12:29:47'),
('combo-1', 'Dosa + Mango Lassi Combo', 170.00, 'Combos', 'Regular', NULL, NULL, 1, 50, '2026-07-04 20:30:28', '2026-07-04 20:30:28'),
('combo-2', 'Naan & Paneer + Soft Drink', 220.00, 'Combos', 'Spicy', NULL, NULL, 1, 51, '2026-07-04 20:30:28', '2026-07-04 20:30:28'),
('food-1', 'Pure Veg Masala Dosa', 120.00, 'Snacks', 'Regular', NULL, NULL, 1, 10, '2026-07-04 20:30:28', '2026-07-04 20:30:28'),
('food-2', 'Jain Special Khichdi', 150.00, 'Mains', 'Jain', NULL, NULL, 1, 20, '2026-07-04 20:30:28', '2026-07-04 20:30:28'),
('food-3', 'Butter Paneer Masala & Naan', 180.00, 'Mains', 'Spicy', NULL, NULL, 1, 21, '2026-07-04 20:30:28', '2026-07-04 20:30:28'),
('food-4', 'Saffron Kheer', 90.00, 'Desserts', 'Sweet', NULL, NULL, 1, 40, '2026-07-04 20:30:28', '2026-07-04 20:30:28'),
('food-5', 'Ginger Cardamom Tea', 30.00, 'Beverages', 'Regular', NULL, NULL, 1, 30, '2026-07-04 20:30:28', '2026-07-04 20:30:28'),
('food-6', 'Mango Lassi Sweet', 70.00, 'Beverages', 'Sweet', NULL, NULL, 1, 31, '2026-07-04 20:30:28', '2026-07-04 20:30:28'),
('food-7', 'Spicy Samosa Chaat Platter', 80.00, 'Snacks', 'Spicy', NULL, NULL, 1, 11, '2026-07-04 20:30:28', '2026-07-04 20:30:28'),
('food-8', 'Swaminarayan Special Thali', 250.00, 'Mains', 'Regular', NULL, NULL, 1, 22, '2026-07-04 20:30:28', '2026-07-04 20:30:28');

-- --------------------------------------------------------

--
-- Table structure for table `canteen_orders`
--

CREATE TABLE `canteen_orders` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `token_number` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'e.g. TK-2041 — printed on receipt',
  `customer_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'canteen_customers.id — NULL if unregistered',
  `customer_name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Guest Devotee',
  `customer_phone` varchar(25) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `table_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'canteen_tables.id — NULL for walk-in counter',
  `table_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Counter Walk-in',
  `served_by` int UNSIGNED DEFAULT NULL COMMENT 'canteen_staff.id who processed the order',
  `subtotal` decimal(10,2) NOT NULL DEFAULT '0.00',
  `tax_amount` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT 'e.g. 5% GST',
  `service_charge` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT 'e.g. 2.5% Service Charge',
  `discount_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `payment_method` enum('CASH','UPI','CARD','PENDING') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `payment_status` enum('PAID','PENDING','REFUNDED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `order_status` enum('NEW','PREPARING','READY_TO_SERVE','COMPLETED','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NEW',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `ordered_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='CANTEEN — Order tokens with full billing breakdown and KDS status';

--
-- Dumping data for table `canteen_orders`
--

INSERT INTO `canteen_orders` (`id`, `token_number`, `customer_id`, `customer_name`, `customer_phone`, `table_id`, `table_name`, `served_by`, `subtotal`, `tax_amount`, `service_charge`, `discount_amount`, `total_amount`, `payment_method`, `payment_status`, `order_status`, `notes`, `ordered_at`, `completed_at`, `created_at`, `updated_at`) VALUES
('16edd63f-98eb-4ad9-8e50-cdab69a7466e', 'TK-6430', 'cust-4', 'Radha Sharma', '+256 772 445566', 'tab-1', 'Table 1 (Window)', 1, 240.00, 0.00, 0.00, 0.00, 240.00, 'PENDING', 'PENDING', 'COMPLETED', NULL, '2026-07-05 04:12:16', NULL, '2026-07-05 04:12:16', '2026-07-05 04:12:16'),
('d9297a6c-bd7b-4b80-8012-ad43527509fb', 'TK-7400', NULL, 'ygweuyycgybu', '65498416513', 'tab-4', 'Table 4 (Center)', 2, 700.00, 35.00, 18.00, 0.00, 753.00, 'PENDING', 'PENDING', 'COMPLETED', NULL, '2026-07-05 22:18:07', NULL, '2026-07-05 22:18:07', '2026-07-06 10:14:29'),
('ord-1', 'TK-2041', 'cust-1', 'Kamlesh Patel', '+256 701 234567', 'tab-3', 'Table 3 (Center)', NULL, 360.00, 18.00, 9.00, 0.00, 387.00, 'UPI', 'PAID', 'PREPARING', NULL, '2026-07-04 13:15:00', NULL, '2026-07-04 20:30:28', '2026-07-04 20:30:28'),
('ord-2', 'TK-2040', 'cust-2', 'Amit Vora', '+256 752 987654', 'tab-7', 'Table 7 (Veranda)', NULL, 320.00, 16.00, 8.00, 20.00, 324.00, 'CASH', 'PAID', 'READY_TO_SERVE', NULL, '2026-07-04 12:45:00', NULL, '2026-07-04 20:30:28', '2026-07-04 20:30:28'),
('ord-3', 'TK-2042', 'cust-3', 'Sanjay Mehta', '+256 703 112233', NULL, 'Counter Walk-in', NULL, 200.00, 10.00, 5.00, 0.00, 215.00, 'PENDING', 'PENDING', 'NEW', NULL, '2026-07-04 13:25:00', NULL, '2026-07-04 20:30:28', '2026-07-04 20:30:28'),
('ord-4', 'TK-2039', 'cust-4', 'Radha Sharma', '+256 772 445566', 'tab-1', 'Table 1 (Window)', NULL, 500.00, 25.00, 12.50, 50.00, 487.50, 'CARD', 'PAID', 'COMPLETED', NULL, '2026-07-04 12:10:00', NULL, '2026-07-04 20:30:28', '2026-07-04 20:30:28');

-- --------------------------------------------------------

--
-- Table structure for table `canteen_order_items`
--

CREATE TABLE `canteen_order_items` (
  `id` int UNSIGNED NOT NULL,
  `order_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `menu_item_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `item_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Snapshot of item name at order time',
  `item_price` decimal(8,2) NOT NULL COMMENT 'Snapshot of price at order time',
  `quantity` tinyint UNSIGNED NOT NULL DEFAULT '1',
  `line_total` decimal(10,2) NOT NULL DEFAULT '0.00',
  `cooking_notes` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Per-item kitchen instructions — low spice, no onion, etc.'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='CANTEEN — Individual food line items per order token';

--
-- Dumping data for table `canteen_order_items`
--

INSERT INTO `canteen_order_items` (`id`, `order_id`, `menu_item_id`, `item_name`, `item_price`, `quantity`, `line_total`, `cooking_notes`) VALUES
(1, 'ord-1', 'food-2', 'Jain Special Khichdi', 150.00, 2, 300.00, 'Low spice'),
(2, 'ord-1', 'food-5', 'Ginger Cardamom Tea', 30.00, 2, 60.00, NULL),
(3, 'ord-2', 'food-3', 'Butter Paneer Masala & Naan', 180.00, 1, 180.00, NULL),
(4, 'ord-2', 'food-6', 'Mango Lassi Sweet', 70.00, 2, 140.00, NULL),
(5, 'ord-3', 'food-1', 'Pure Veg Masala Dosa', 120.00, 1, 120.00, NULL),
(6, 'ord-3', 'food-7', 'Spicy Samosa Chaat Platter', 80.00, 1, 80.00, NULL),
(7, 'ord-4', 'food-8', 'Swaminarayan Special Thali', 250.00, 2, 500.00, NULL),
(8, '16edd63f-98eb-4ad9-8e50-cdab69a7466e', 'food-2', 'Jain Special Khichdi', 150.00, 1, 150.00, NULL),
(9, '16edd63f-98eb-4ad9-8e50-cdab69a7466e', 'food-4', 'Saffron Kheer', 90.00, 1, 90.00, NULL),
(10, 'd9297a6c-bd7b-4b80-8012-ad43527509fb', 'food-1', 'Pure Veg Masala Dosa', 120.00, 1, 120.00, NULL),
(11, 'd9297a6c-bd7b-4b80-8012-ad43527509fb', 'food-2', 'Jain Special Khichdi', 150.00, 1, 150.00, NULL),
(12, 'd9297a6c-bd7b-4b80-8012-ad43527509fb', 'food-3', 'Butter Paneer Masala & Naan', 180.00, 1, 180.00, NULL),
(13, 'd9297a6c-bd7b-4b80-8012-ad43527509fb', 'food-8', 'Swaminarayan Special Thali', 250.00, 1, 250.00, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `canteen_settings`
--

CREATE TABLE `canteen_settings` (
  `id` int UNSIGNED NOT NULL,
  `setting_key` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `setting_value` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(300) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='CANTEEN — Key-value business configuration (tax rates, receipt text, etc.)';

--
-- Dumping data for table `canteen_settings`
--

INSERT INTO `canteen_settings` (`id`, `setting_key`, `setting_value`, `description`, `updated_at`) VALUES
(1, 'business_name', 'SKSS Kampala Canteen', 'Shown on receipts and POS header', '2026-07-04 20:30:28'),
(2, 'business_address', 'Shree Swaminarayan Complex, Bukoto, Kampala', 'Full address on printed receipts', '2026-07-04 20:30:28'),
(3, 'currency_symbol', 'UGX', 'Currency symbol in UI', '2026-07-04 20:30:28'),
(4, 'gst_rate', '5.00', 'GST/VAT percentage applied to all orders', '2026-07-04 20:30:28'),
(5, 'service_charge_rate', '2.50', 'Service charge percentage per order', '2026-07-04 20:30:28'),
(6, 'receipt_footer', 'Present token copy at the pick-up shelf.', 'Bottom line on printed receipts', '2026-07-04 20:30:28'),
(7, 'canteen_phone', '+256 700 000000', 'Canteen contact number', '2026-07-04 20:30:28'),
(8, 'low_stock_alert', '1', '1 = email alerts enabled for low inventory', '2026-07-04 20:30:28');

-- --------------------------------------------------------

--
-- Table structure for table `canteen_staff`
--

CREATE TABLE `canteen_staff` (
  `id` int UNSIGNED NOT NULL,
  `name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(180) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `assigned_role` enum('manager','receptionist','cashier','kitchen') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'receptionist',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_by` int UNSIGNED DEFAULT NULL COMMENT 'admin_users.id who created this staff account',
  `last_login_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='CANTEEN — POS terminal staff with assigned floor roles';

--
-- Dumping data for table `canteen_staff`
--

INSERT INTO `canteen_staff` (`id`, `name`, `email`, `password_hash`, `assigned_role`, `is_active`, `created_by`, `last_login_at`, `created_at`, `updated_at`) VALUES
(1, 'Mukesh Patel', 'manager@swami.com', '$2a$12$E7HBwNjXNBWvsQZCUHYTNO5ZblLairqWpBQ6LUjukG6.vMFSaaj5W', 'manager', 1, 2, '2026-07-12 03:22:04', '2026-07-04 20:30:28', '2026-07-12 03:22:04'),
(2, 'Jatin Shah', 'receptionist@swami.com', '$2a$12$UOJSot1fgPu77xe5KBmIV.kR5fw38AmXIJfHmujO3GucbpaZkrOxm', 'receptionist', 1, 2, '2026-07-05 22:17:49', '2026-07-04 20:30:28', '2026-07-05 22:17:49'),
(3, 'Anil Vora', 'cashier@swami.com', '$2a$12$otrBfWN8QfutvUMhKj4dEus1jcIPgnQmWc6GJDv7gOq9elzSUXFgm', 'cashier', 1, 2, NULL, '2026-07-04 20:30:28', '2026-07-05 14:27:08'),
(4, 'Chef Ramesh', 'kitchen@swami.com', '$2a$12$OlBMHQtCjzi.VKU5UXJzteoDNRcjNw207k5HrMc9G48wfg62GyRUm', 'kitchen', 1, 2, NULL, '2026-07-04 20:30:28', '2026-07-05 14:27:09');

-- --------------------------------------------------------

--
-- Table structure for table `canteen_staff_sessions`
--

CREATE TABLE `canteen_staff_sessions` (
  `id` int UNSIGNED NOT NULL,
  `staff_id` int UNSIGNED NOT NULL,
  `login_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `logout_at` datetime DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `device_info` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='CANTEEN — Terminal login/logout session audit trail';

-- --------------------------------------------------------

--
-- Table structure for table `canteen_suppliers`
--

CREATE TABLE `canteen_suppliers` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(25) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(180) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='CANTEEN — Raw material vendor and distributor profiles';

--
-- Dumping data for table `canteen_suppliers`
--

INSERT INTO `canteen_suppliers` (`id`, `name`, `phone`, `email`, `address`, `is_active`, `created_at`, `updated_at`) VALUES
('sup-1', 'Bukoto Dairy Fresh', '+256 771 990011', 'orders@bukotodairy.com', NULL, 1, '2026-07-04 20:30:28', '2026-07-04 20:30:28'),
('sup-2', 'Swaminarayan Flour Mills', '+256 701 445522', 'sales@swamiflour.com', NULL, 1, '2026-07-04 20:30:28', '2026-07-04 20:30:28'),
('sup-3', 'Kampala Spice Wholesale', '+256 752 334455', 'spices@kampalawholesale.co.ug', NULL, 1, '2026-07-04 20:30:28', '2026-07-04 20:30:28');

-- --------------------------------------------------------

--
-- Table structure for table `canteen_supplier_items`
--

CREATE TABLE `canteen_supplier_items` (
  `id` int UNSIGNED NOT NULL,
  `supplier_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `item_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='CANTEEN — Items each supplier is known to deliver';

--
-- Dumping data for table `canteen_supplier_items`
--

INSERT INTO `canteen_supplier_items` (`id`, `supplier_id`, `item_name`) VALUES
(1, 'sup-1', 'Milk'),
(2, 'sup-1', 'Paneer'),
(3, 'sup-1', 'Ghee'),
(4, 'sup-1', 'Curd'),
(5, 'sup-2', 'Wheat Flour'),
(6, 'sup-2', 'Rice'),
(7, 'sup-2', 'Sooji'),
(8, 'sup-2', 'Urad Dal'),
(9, 'sup-3', 'Cardamom'),
(10, 'sup-3', 'Saffron'),
(11, 'sup-3', 'Turmeric'),
(12, 'sup-3', 'Chilli Powder');

-- --------------------------------------------------------

--
-- Table structure for table `canteen_tables`
--

CREATE TABLE `canteen_tables` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'e.g. Table 3 (Center)',
  `capacity` tinyint UNSIGNED NOT NULL DEFAULT '4',
  `status` enum('AVAILABLE','OCCUPIED','RESERVED','CLEANING') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'AVAILABLE',
  `current_bill` decimal(10,2) NOT NULL DEFAULT '0.00',
  `occupied_since` datetime DEFAULT NULL,
  `location_zone` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'e.g. Window, Veranda, Center, Entrance',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='CANTEEN — Physical dining tables with live status tracking';

--
-- Dumping data for table `canteen_tables`
--

INSERT INTO `canteen_tables` (`id`, `name`, `capacity`, `status`, `current_bill`, `occupied_since`, `location_zone`, `is_active`, `created_at`, `updated_at`) VALUES
('tab-1', 'Table 1 (Window)', 4, 'AVAILABLE', 0.00, NULL, 'Window', 1, '2026-07-04 20:30:28', '2026-07-05 04:12:16'),
('tab-2', 'Table 2 (Corner)', 2, 'CLEANING', 0.00, NULL, 'Corner', 1, '2026-07-04 20:30:28', '2026-07-04 20:30:28'),
('tab-3', 'Table 3 (Center)', 6, 'OCCUPIED', 460.00, NULL, 'Center', 1, '2026-07-04 20:30:28', '2026-07-04 20:30:28'),
('tab-4', 'Table 4 (Center)', 4, 'AVAILABLE', 0.00, NULL, 'Center', 1, '2026-07-04 20:30:28', '2026-07-06 10:14:29'),
('tab-5', 'Table 5 (Satsang)', 8, 'RESERVED', 0.00, NULL, 'Satsang Hall', 1, '2026-07-04 20:30:28', '2026-07-04 20:30:28'),
('tab-6', 'Table 6 (Entrance)', 4, 'AVAILABLE', 0.00, NULL, 'Entrance', 1, '2026-07-04 20:30:28', '2026-07-04 20:30:28'),
('tab-7', 'Table 7 (Veranda)', 4, 'OCCUPIED', 280.00, NULL, 'Veranda', 1, '2026-07-04 20:30:28', '2026-07-04 20:30:28'),
('tab-8', 'Table 8 (Veranda)', 2, 'AVAILABLE', 0.00, NULL, 'Veranda', 1, '2026-07-04 20:30:28', '2026-07-04 20:30:28');

-- --------------------------------------------------------

--
-- Table structure for table `canteen_table_merges`
--

CREATE TABLE `canteen_table_merges` (
  `id` int UNSIGNED NOT NULL,
  `primary_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Base table (canteen_tables.id)',
  `merged_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Table merged into primary',
  `merged_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `split_at` datetime DEFAULT NULL,
  `merged_by` int UNSIGNED DEFAULT NULL COMMENT 'canteen_staff.id'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='CANTEEN — Tracks combined/merged table pairs';

-- --------------------------------------------------------

--
-- Stand-in structure for view `canteen_vw_active_tables`
-- (See below for the actual view)
--
CREATE TABLE `canteen_vw_active_tables` (
`active_order_token` varchar(20)
,`capacity` tinyint unsigned
,`current_bill` decimal(10,2)
,`current_customer` varchar(120)
,`id` char(36)
,`location_zone` varchar(60)
,`name` varchar(100)
,`occupied_minutes` bigint
,`occupied_since` datetime
,`status` enum('AVAILABLE','OCCUPIED','RESERVED','CLEANING')
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `canteen_vw_kitchen_queue`
-- (See below for the actual view)
--
CREATE TABLE `canteen_vw_kitchen_queue` (
`customer_name` varchar(120)
,`id` char(36)
,`minutes_elapsed` bigint
,`notes` text
,`order_status` enum('NEW','PREPARING','READY_TO_SERVE','COMPLETED','CANCELLED')
,`ordered_at` datetime
,`table_name` varchar(100)
,`token_number` varchar(20)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `canteen_vw_low_stock`
-- (See below for the actual view)
--
CREATE TABLE `canteen_vw_low_stock` (
`category` enum('Grains','Dairy','Spices','Beverages','Vegetables','Other')
,`id` char(36)
,`min_stock` decimal(10,3)
,`name` varchar(150)
,`stock` decimal(10,3)
,`stock_pct` decimal(15,1)
,`supplier_name` varchar(150)
,`supplier_phone` varchar(25)
,`unit` varchar(20)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `canteen_vw_today_revenue`
-- (See below for the actual view)
--
CREATE TABLE `canteen_vw_today_revenue` (
`avg_order_value` decimal(14,6)
,`card_total` decimal(32,2)
,`cash_total` decimal(32,2)
,`gross_revenue` decimal(32,2)
,`total_discounts` decimal(32,2)
,`total_orders` bigint
,`total_service_charge` decimal(32,2)
,`total_tax` decimal(32,2)
,`upi_total` decimal(32,2)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `canteen_vw_top_customers`
-- (See below for the actual view)
--
CREATE TABLE `canteen_vw_top_customers` (
`customer_type` enum('VIP','Regular','Guest')
,`id` char(36)
,`last_visit` date
,`name` varchar(120)
,`phone` varchar(25)
,`spend_rank` bigint unsigned
,`total_orders` int unsigned
,`total_spent` decimal(12,2)
,`total_visits` int unsigned
);

-- --------------------------------------------------------

--
-- Table structure for table `canteen_waste_log`
--

CREATE TABLE `canteen_waste_log` (
  `id` int UNSIGNED NOT NULL,
  `inventory_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'canteen_inventory.id — NULL if item no longer exists',
  `item_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Snapshot of item name at time of logging',
  `quantity` decimal(10,3) NOT NULL,
  `unit` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `estimated_cost` decimal(10,2) NOT NULL DEFAULT '0.00',
  `reason` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logged_by` int UNSIGNED DEFAULT NULL COMMENT 'canteen_staff.id',
  `logged_at` date NOT NULL DEFAULT (curdate()),
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='CANTEEN — Ingredient and food wastage records with cost impact';

--
-- Dumping data for table `canteen_waste_log`
--

INSERT INTO `canteen_waste_log` (`id`, `inventory_id`, `item_name`, `quantity`, `unit`, `estimated_cost`, `reason`, `logged_by`, `logged_at`, `created_at`) VALUES
(1, 'inv-3', 'Fresh Milk', 3.000, 'Litre', 150.00, 'Soured / Expired', NULL, '2026-07-03', '2026-07-04 20:30:28'),
(2, 'inv-2', 'Premium Paneer', 1.500, 'kg', 270.00, 'Spoiled by power outage', NULL, '2026-07-02', '2026-07-04 20:30:28');

-- --------------------------------------------------------

--
-- Table structure for table `website_staff`
--

CREATE TABLE `website_staff` (
  `id` int UNSIGNED NOT NULL,
  `name` varchar(120) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(180) COLLATE utf8mb4_general_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `role` varchar(60) COLLATE utf8mb4_general_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `website_staff`
--

INSERT INTO `website_staff` (`id`, `name`, `email`, `password_hash`, `role`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Platform Trustee', 'trustee@swami.com', '$2a$12$dPfkXZvd5c970UHqUSTpDOlywth7X/NjRbNmhINuQfWhy6IFtC8W2', 'trustee', 1, '2026-07-06 10:23:28', '2026-07-06 10:23:28'),
(2, 'Platform Accountant', 'accountant@swami.com', '$2a$12$3ywunIhaK1.VsTh6.wrDmOduEct6gaAUQGOtN9Fa7oUZbpjRMdl/2', 'accountant', 1, '2026-07-06 10:23:28', '2026-07-06 10:23:28');

-- --------------------------------------------------------

--
-- Structure for view `canteen_vw_active_tables`
--
DROP TABLE IF EXISTS `canteen_vw_active_tables`;

CREATE ALGORITHM=UNDEFINED DEFINER=`sksst`@`%` SQL SECURITY DEFINER VIEW `canteen_vw_active_tables`  AS SELECT `t`.`id` AS `id`, `t`.`name` AS `name`, `t`.`capacity` AS `capacity`, `t`.`status` AS `status`, `t`.`current_bill` AS `current_bill`, `t`.`location_zone` AS `location_zone`, `t`.`occupied_since` AS `occupied_since`, timestampdiff(MINUTE,`t`.`occupied_since`,now()) AS `occupied_minutes`, `o`.`token_number` AS `active_order_token`, `o`.`customer_name` AS `current_customer` FROM (`canteen_tables` `t` left join `canteen_orders` `o` on(((`o`.`table_id` = `t`.`id`) and (`o`.`order_status` not in ('COMPLETED','CANCELLED'))))) WHERE (`t`.`is_active` = 1) ORDER BY `t`.`status` ASC, `t`.`name` ASC ;

-- --------------------------------------------------------

--
-- Structure for view `canteen_vw_kitchen_queue`
--
DROP TABLE IF EXISTS `canteen_vw_kitchen_queue`;

CREATE ALGORITHM=UNDEFINED DEFINER=`sksst`@`%` SQL SECURITY DEFINER VIEW `canteen_vw_kitchen_queue`  AS SELECT `o`.`id` AS `id`, `o`.`token_number` AS `token_number`, `o`.`customer_name` AS `customer_name`, `o`.`table_name` AS `table_name`, `o`.`order_status` AS `order_status`, `o`.`notes` AS `notes`, `o`.`ordered_at` AS `ordered_at`, timestampdiff(MINUTE,`o`.`ordered_at`,now()) AS `minutes_elapsed` FROM `canteen_orders` AS `o` WHERE (`o`.`order_status` in ('NEW','PREPARING')) ORDER BY `o`.`ordered_at` ASC ;

-- --------------------------------------------------------

--
-- Structure for view `canteen_vw_low_stock`
--
DROP TABLE IF EXISTS `canteen_vw_low_stock`;

CREATE ALGORITHM=UNDEFINED DEFINER=`sksst`@`%` SQL SECURITY DEFINER VIEW `canteen_vw_low_stock`  AS SELECT `i`.`id` AS `id`, `i`.`name` AS `name`, `i`.`category` AS `category`, `i`.`stock` AS `stock`, `i`.`min_stock` AS `min_stock`, `i`.`unit` AS `unit`, round(((`i`.`stock` / `i`.`min_stock`) * 100),1) AS `stock_pct`, `s`.`name` AS `supplier_name`, `s`.`phone` AS `supplier_phone` FROM (`canteen_inventory` `i` left join `canteen_suppliers` `s` on((`s`.`id` = `i`.`supplier_id`))) WHERE (`i`.`stock` <= `i`.`min_stock`) ORDER BY round(((`i`.`stock` / `i`.`min_stock`) * 100),1) ASC ;

-- --------------------------------------------------------

--
-- Structure for view `canteen_vw_today_revenue`
--
DROP TABLE IF EXISTS `canteen_vw_today_revenue`;

CREATE ALGORITHM=UNDEFINED DEFINER=`sksst`@`%` SQL SECURITY DEFINER VIEW `canteen_vw_today_revenue`  AS SELECT count(0) AS `total_orders`, coalesce(sum(`canteen_orders`.`total_amount`),0) AS `gross_revenue`, coalesce(sum(`canteen_orders`.`discount_amount`),0) AS `total_discounts`, coalesce(sum(`canteen_orders`.`tax_amount`),0) AS `total_tax`, coalesce(sum(`canteen_orders`.`service_charge`),0) AS `total_service_charge`, coalesce(avg(`canteen_orders`.`total_amount`),0) AS `avg_order_value`, coalesce(sum((case when (`canteen_orders`.`payment_method` = 'CASH') then `canteen_orders`.`total_amount` end)),0) AS `cash_total`, coalesce(sum((case when (`canteen_orders`.`payment_method` = 'UPI') then `canteen_orders`.`total_amount` end)),0) AS `upi_total`, coalesce(sum((case when (`canteen_orders`.`payment_method` = 'CARD') then `canteen_orders`.`total_amount` end)),0) AS `card_total` FROM `canteen_orders` WHERE ((cast(`canteen_orders`.`ordered_at` as date) = curdate()) AND (`canteen_orders`.`payment_status` = 'PAID') AND (`canteen_orders`.`order_status` <> 'CANCELLED')) ;

-- --------------------------------------------------------

--
-- Structure for view `canteen_vw_top_customers`
--
DROP TABLE IF EXISTS `canteen_vw_top_customers`;

CREATE ALGORITHM=UNDEFINED DEFINER=`sksst`@`%` SQL SECURITY DEFINER VIEW `canteen_vw_top_customers`  AS SELECT `canteen_customers`.`id` AS `id`, `canteen_customers`.`name` AS `name`, `canteen_customers`.`phone` AS `phone`, `canteen_customers`.`customer_type` AS `customer_type`, `canteen_customers`.`total_orders` AS `total_orders`, `canteen_customers`.`total_visits` AS `total_visits`, `canteen_customers`.`total_spent` AS `total_spent`, `canteen_customers`.`last_visit` AS `last_visit`, rank() OVER (ORDER BY `canteen_customers`.`total_spent` desc ) AS `spend_rank` FROM `canteen_customers` WHERE (`canteen_customers`.`is_active` = 1) ORDER BY `canteen_customers`.`total_spent` DESC ;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
