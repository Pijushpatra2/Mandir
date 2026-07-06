-- ================================================================
--   PUJA SOFTWARE — Central Database Schema
--   Project  : SKSS Kampala Web Platform
--   Version  : 2.0.0  |  Date: 2026-07-05
--   Engine   : MySQL 8.0+  |  Charset: utf8mb4
-- ================================================================
--
--   NAMESPACE CONVENTION
--   ─────────────────────────────────────────────────────────────
--   admin_*        →  Global platform tables (shared by all modules)
--   canteen_*      →  Canteen POS module tables
--   temple_*       →  [RESERVED] Temple management module
--   event_*        →  [RESERVED] Events & festivals module
--   donation_*     →  [RESERVED] Donations & seva module
--   gallery_*      →  [RESERVED] Photo / media gallery module
--   news_*         →  [RESERVED] Announcements & news module
--
--   GLOBAL TABLE (only one, no module prefix)
--   ─────────────────────────────────────────────────────────────
--   admin_users    →  Single super-admin table for entire platform
--                     All module admins are rows here with role scoping
--
--   CANTEEN MODULE (16 tables, all prefixed canteen_)
--   ─────────────────────────────────────────────────────────────
--    1. canteen_staff              — POS terminal role accounts
--    2. canteen_staff_sessions     — Login audit trail
--    3. canteen_tables             — Physical dining tables
--    4. canteen_table_merges       — Combined table tracking
--    5. canteen_menu_items         — Food menu catalog
--    6. canteen_menu_combo_items   — Combo bundle mappings
--    7. canteen_customers          — Devotee / walk-in customer CRM
--    8. canteen_orders             — Order tokens & billing
--    9. canteen_order_items        — Line items per order
--   10. canteen_bookings           — Table reservation calendar
--   11. canteen_suppliers          — Raw material vendors
--   12. canteen_supplier_items     — Items per vendor
--   13. canteen_inventory          — Raw material stock ledger
--   14. canteen_inventory_log      — Stock movement audit log
--   15. canteen_waste_log          — Food & ingredient waste records
--   16. canteen_settings           — Canteen business configuration
-- ================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';
SET TIME_ZONE = '+00:00';

-- ----------------------------------------------------------------
-- DROP (safe re-import — canteen module first, then global)
-- ----------------------------------------------------------------
DROP TABLE IF EXISTS canteen_waste_log;
DROP TABLE IF EXISTS canteen_inventory_log;
DROP TABLE IF EXISTS canteen_inventory;
DROP TABLE IF EXISTS canteen_supplier_items;
DROP TABLE IF EXISTS canteen_suppliers;
DROP TABLE IF EXISTS canteen_bookings;
DROP TABLE IF EXISTS canteen_order_items;
DROP TABLE IF EXISTS canteen_orders;
DROP TABLE IF EXISTS canteen_customers;
DROP TABLE IF EXISTS canteen_menu_combo_items;
DROP TABLE IF EXISTS canteen_menu_items;
DROP TABLE IF EXISTS canteen_table_merges;
DROP TABLE IF EXISTS canteen_tables;
DROP TABLE IF EXISTS canteen_staff_sessions;
DROP TABLE IF EXISTS canteen_staff;
DROP TABLE IF EXISTS canteen_settings;
-- Global (dropped last)
DROP TABLE IF EXISTS admin_users;
-- ================================================================
--   GLOBAL TABLE — Single admin table for the entire platform
-- ================================================================

-- ----------------------------------------------------------------
-- admin_users
--   One row per platform administrator.
--   The module_scope column restricts which section of the site
--   each admin can access (NULL = unrestricted super_admin access).
--   Future modules simply add their name to the ENUM.
-- ----------------------------------------------------------------
CREATE TABLE admin_users (
    id            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    name          VARCHAR(120)  NOT NULL,
    email         VARCHAR(180)  NOT NULL UNIQUE,
    password_hash VARCHAR(255)  NOT NULL         COMMENT 'bcrypt hashed — never store plain text',
    role          ENUM(
                    'super_admin',               -- Full platform access
                    'module_admin',              -- Scoped to one module (see module_scope)
                    'viewer'                     -- Read-only across assigned module
                  )             NOT NULL DEFAULT 'module_admin',
    module_scope  VARCHAR(60)   NULL             COMMENT 'e.g. canteen | temple | events | NULL=all',
    is_active     TINYINT(1)    NOT NULL DEFAULT 1,
    last_login_at DATETIME      NULL,
    created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_email        (email),
    INDEX idx_role         (role),
    INDEX idx_module_scope (module_scope)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='GLOBAL — Single platform admin table shared by all modules';

-- ================================================================
--   CANTEEN MODULE
-- ================================================================

-- ----------------------------------------------------------------
-- 1. canteen_staff
--    POS terminal worker accounts. Completely separate from
--    admin_users — these are kitchen/floor staff, not web admins.
--    Only a super_admin or canteen module_admin can create these.
-- ----------------------------------------------------------------
CREATE TABLE canteen_staff (
    id            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    name          VARCHAR(120)  NOT NULL,
    email         VARCHAR(180)  NOT NULL UNIQUE,
    password_hash VARCHAR(255)  NOT NULL,
    assigned_role ENUM(
                    'manager',
                    'receptionist',
                    'cashier',
                    'kitchen'
                  )             NOT NULL DEFAULT 'receptionist',
    is_active     TINYINT(1)    NOT NULL DEFAULT 1,
    created_by    INT UNSIGNED  NULL     COMMENT 'admin_users.id who created this staff account',
    last_login_at DATETIME      NULL,
    created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_cs_email (email),
    INDEX idx_cs_role  (assigned_role),
    CONSTRAINT fk_cs_created_by
        FOREIGN KEY (created_by) REFERENCES admin_users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='CANTEEN — POS terminal staff with assigned floor roles';

-- ----------------------------------------------------------------
-- 2. canteen_staff_sessions
--    Logs every terminal login / logout for security audit.
-- ----------------------------------------------------------------
CREATE TABLE canteen_staff_sessions (
    id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
    staff_id    INT UNSIGNED NOT NULL,
    login_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    logout_at   DATETIME     NULL,
    ip_address  VARCHAR(45)  NULL,
    device_info VARCHAR(255) NULL,
    PRIMARY KEY (id),
    INDEX idx_css_staff (staff_id),
    CONSTRAINT fk_css_staff
        FOREIGN KEY (staff_id) REFERENCES canteen_staff (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='CANTEEN — Terminal login/logout session audit trail';

-- ----------------------------------------------------------------
-- 3. canteen_tables
--    Physical dining tables on the canteen floor.
-- ----------------------------------------------------------------
CREATE TABLE canteen_tables (
    id             CHAR(36)         NOT NULL DEFAULT (UUID()),
    name           VARCHAR(100)     NOT NULL UNIQUE  COMMENT 'e.g. Table 3 (Center)',
    capacity       TINYINT UNSIGNED NOT NULL DEFAULT 4,
    status         ENUM(
                     'AVAILABLE',
                     'OCCUPIED',
                     'RESERVED',
                     'CLEANING'
                   )                NOT NULL DEFAULT 'AVAILABLE',
    current_bill   DECIMAL(10,2)    NOT NULL DEFAULT 0.00,
    occupied_since DATETIME         NULL,
    location_zone  VARCHAR(60)      NULL     COMMENT 'e.g. Window, Veranda, Center, Entrance',
    is_active      TINYINT(1)       NOT NULL DEFAULT 1,
    created_at     DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_ct_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='CANTEEN — Physical dining tables with live status tracking';

-- ----------------------------------------------------------------
-- 4. canteen_table_merges
--    Tracks when two tables are combined for a large party.
-- ----------------------------------------------------------------
CREATE TABLE canteen_table_merges (
    id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
    primary_id CHAR(36)     NOT NULL COMMENT 'Base table (canteen_tables.id)',
    merged_id  CHAR(36)     NOT NULL COMMENT 'Table merged into primary',
    merged_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    split_at   DATETIME     NULL,
    merged_by  INT UNSIGNED NULL     COMMENT 'canteen_staff.id',
    PRIMARY KEY (id),
    CONSTRAINT fk_ctm_primary  FOREIGN KEY (primary_id) REFERENCES canteen_tables (id) ON DELETE CASCADE,
    CONSTRAINT fk_ctm_merged   FOREIGN KEY (merged_id)  REFERENCES canteen_tables (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='CANTEEN — Tracks combined/merged table pairs';

-- ----------------------------------------------------------------
-- 5. canteen_menu_items
--    Full food menu catalog — all categories in one table.
-- ----------------------------------------------------------------
CREATE TABLE canteen_menu_items (
    id          CHAR(36)     NOT NULL DEFAULT (UUID()),
    name        VARCHAR(200) NOT NULL,
    price       DECIMAL(8,2) NOT NULL,
    category    ENUM(
                  'Mains',
                  'Snacks',
                  'Beverages',
                  'Desserts',
                  'Combos',
                  'Add-ons'
                )            NOT NULL DEFAULT 'Mains',
    variety     ENUM(
                  'Regular',
                  'Jain',
                  'Spicy',
                  'Sweet'
                )            NOT NULL DEFAULT 'Regular',
    description TEXT         NULL,
    image_url   VARCHAR(500) NULL,
    available   TINYINT(1)   NOT NULL DEFAULT 1,
    sort_order  SMALLINT     NOT NULL DEFAULT 0  COMMENT 'Display order in POS menu panel',
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_cmi_category  (category),
    INDEX idx_cmi_variety   (variety),
    INDEX idx_cmi_available (available)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='CANTEEN — Food menu catalog (mains, snacks, beverages, desserts, combos, add-ons)';

-- ----------------------------------------------------------------
-- 6. canteen_menu_combo_items
--    Maps which individual items are bundled inside a combo.
-- ----------------------------------------------------------------
CREATE TABLE canteen_menu_combo_items (
    id           INT UNSIGNED     NOT NULL AUTO_INCREMENT,
    combo_id     CHAR(36)         NOT NULL COMMENT 'canteen_menu_items.id of the parent combo',
    component_id CHAR(36)         NOT NULL COMMENT 'canteen_menu_items.id of bundled item',
    quantity     TINYINT UNSIGNED NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    UNIQUE KEY uq_cmci_pair (combo_id, component_id),
    CONSTRAINT fk_cmci_combo     FOREIGN KEY (combo_id)     REFERENCES canteen_menu_items (id) ON DELETE CASCADE,
    CONSTRAINT fk_cmci_component FOREIGN KEY (component_id) REFERENCES canteen_menu_items (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='CANTEEN — Bundle contents for combo menu items';

-- ----------------------------------------------------------------
-- 7. canteen_customers
--    Devotee / walk-in customer profiles.
--    NOTE: Completely separate from admin_users and canteen_staff.
--    These are the people who eat at the canteen.
-- ----------------------------------------------------------------
CREATE TABLE canteen_customers (
    id            CHAR(36)      NOT NULL DEFAULT (UUID()),
    name          VARCHAR(120)  NOT NULL,
    phone         VARCHAR(25)   NOT NULL UNIQUE,
    email         VARCHAR(180)  NULL UNIQUE,
    customer_type ENUM(
                    'VIP',
                    'Regular',
                    'Guest'
                  )             NOT NULL DEFAULT 'Guest',
    total_orders  INT UNSIGNED  NOT NULL DEFAULT 0,
    total_visits  INT UNSIGNED  NOT NULL DEFAULT 0,
    total_spent   DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    last_visit    DATE          NULL,
    notes         TEXT          NULL     COMMENT 'Internal staff notes about this devotee',
    is_active     TINYINT(1)    NOT NULL DEFAULT 1,
    created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_cc_phone         (phone),
    INDEX idx_cc_customer_type (customer_type),
    INDEX idx_cc_total_spent   (total_spent),
    INDEX idx_cc_last_visit    (last_visit)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='CANTEEN — Devotee and walk-in customer profiles (NOT staff, NOT admins)';

-- ----------------------------------------------------------------
-- 8. canteen_orders
--    Each row is one token/ticket printed at the POS counter.
--    Stores complete billing snapshot at time of order.
-- ----------------------------------------------------------------
CREATE TABLE canteen_orders (
    id              CHAR(36)      NOT NULL DEFAULT (UUID()),
    token_number    VARCHAR(20)   NOT NULL UNIQUE  COMMENT 'e.g. TK-2041 — printed on receipt',
    customer_id     CHAR(36)      NULL             COMMENT 'canteen_customers.id — NULL if unregistered',
    customer_name   VARCHAR(120)  NOT NULL DEFAULT 'Guest Devotee',
    customer_phone  VARCHAR(25)   NULL,
    table_id        CHAR(36)      NULL             COMMENT 'canteen_tables.id — NULL for walk-in counter',
    table_name      VARCHAR(100)  NOT NULL DEFAULT 'Counter Walk-in',
    served_by       INT UNSIGNED  NULL             COMMENT 'canteen_staff.id who processed the order',
    subtotal        DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tax_amount      DECIMAL(10,2) NOT NULL DEFAULT 0.00  COMMENT 'e.g. 5% GST',
    service_charge  DECIMAL(10,2) NOT NULL DEFAULT 0.00  COMMENT 'e.g. 2.5% Service Charge',
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_amount    DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    payment_method  ENUM('CASH','UPI','CARD','PENDING')           NOT NULL DEFAULT 'PENDING',
    payment_status  ENUM('PAID','PENDING','REFUNDED')             NOT NULL DEFAULT 'PENDING',
    order_status    ENUM('NEW','PREPARING','READY_TO_SERVE','COMPLETED','CANCELLED') NOT NULL DEFAULT 'NEW',
    notes           TEXT          NULL,
    ordered_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at    DATETIME      NULL,
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_co_token          (token_number),
    INDEX idx_co_customer_id    (customer_id),
    INDEX idx_co_table_id       (table_id),
    INDEX idx_co_order_status   (order_status),
    INDEX idx_co_payment_status (payment_status),
    INDEX idx_co_ordered_at     (ordered_at),
    INDEX idx_co_served_by      (served_by),
    CONSTRAINT fk_co_customer FOREIGN KEY (customer_id) REFERENCES canteen_customers (id) ON DELETE SET NULL,
    CONSTRAINT fk_co_table    FOREIGN KEY (table_id)    REFERENCES canteen_tables    (id) ON DELETE SET NULL,
    CONSTRAINT fk_co_staff    FOREIGN KEY (served_by)   REFERENCES canteen_staff     (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='CANTEEN — Order tokens with full billing breakdown and KDS status';

-- ----------------------------------------------------------------
-- 9. canteen_order_items
--    Individual food line items per order.
--    Prices are snapshot values at the time of order (menu can change).
-- ----------------------------------------------------------------
CREATE TABLE canteen_order_items (
    id            INT UNSIGNED     NOT NULL AUTO_INCREMENT,
    order_id      CHAR(36)         NOT NULL,
    menu_item_id  CHAR(36)         NOT NULL,
    item_name     VARCHAR(200)     NOT NULL  COMMENT 'Snapshot of item name at order time',
    item_price    DECIMAL(8,2)     NOT NULL  COMMENT 'Snapshot of price at order time',
    quantity      TINYINT UNSIGNED NOT NULL DEFAULT 1,
    line_total    DECIMAL(10,2)    NOT NULL DEFAULT 0.00,
    cooking_notes VARCHAR(500)     NULL      COMMENT 'Per-item kitchen instructions — low spice, no onion, etc.',
    PRIMARY KEY (id),
    INDEX idx_coi_order_id     (order_id),
    INDEX idx_coi_menu_item_id (menu_item_id),
    CONSTRAINT fk_coi_order FOREIGN KEY (order_id)     REFERENCES canteen_orders     (id) ON DELETE CASCADE,
    CONSTRAINT fk_coi_item  FOREIGN KEY (menu_item_id) REFERENCES canteen_menu_items (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='CANTEEN — Individual food line items per order token';

-- ----------------------------------------------------------------
-- 10. canteen_bookings
--     Advance table reservations. One row per booking slot.
-- ----------------------------------------------------------------
CREATE TABLE canteen_bookings (
    id             CHAR(36)         NOT NULL DEFAULT (UUID()),
    customer_id    CHAR(36)         NULL     COMMENT 'canteen_customers.id — NULL if walk-in phone booking',
    customer_name  VARCHAR(120)     NOT NULL,
    customer_phone VARCHAR(25)      NOT NULL,
    table_id       CHAR(36)         NOT NULL,
    booking_date   DATE             NOT NULL,
    booking_time   VARCHAR(20)      NOT NULL  COMMENT 'e.g. 02:30 PM',
    party_size     TINYINT UNSIGNED NOT NULL DEFAULT 2,
    status         ENUM(
                     'CONFIRMED',
                     'SEATED',
                     'CANCELLED',
                     'NO_SHOW'
                   )                NOT NULL DEFAULT 'CONFIRMED',
    special_notes  TEXT             NULL,
    booked_by      INT UNSIGNED     NULL     COMMENT 'canteen_staff.id who registered this booking',
    created_at     DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_cb_date      (booking_date),
    INDEX idx_cb_table_id  (table_id),
    INDEX idx_cb_status    (status),
    INDEX idx_cb_cust_id   (customer_id),
    CONSTRAINT fk_cb_table    FOREIGN KEY (table_id)    REFERENCES canteen_tables    (id) ON DELETE RESTRICT,
    CONSTRAINT fk_cb_customer FOREIGN KEY (customer_id) REFERENCES canteen_customers (id) ON DELETE SET NULL,
    CONSTRAINT fk_cb_staff    FOREIGN KEY (booked_by)   REFERENCES canteen_staff     (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='CANTEEN — Table reservation calendar for devotees';

-- ----------------------------------------------------------------
-- 11. canteen_suppliers
--     Raw material vendor / distributor directory.
-- ----------------------------------------------------------------
CREATE TABLE canteen_suppliers (
    id         CHAR(36)     NOT NULL DEFAULT (UUID()),
    name       VARCHAR(150) NOT NULL,
    phone      VARCHAR(25)  NOT NULL,
    email      VARCHAR(180) NULL,
    address    TEXT         NULL,
    is_active  TINYINT(1)   NOT NULL DEFAULT 1,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_csup_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='CANTEEN — Raw material vendor and distributor profiles';

-- ----------------------------------------------------------------
-- 12. canteen_supplier_items
--     Catalogue of items/ingredients each supplier delivers.
-- ----------------------------------------------------------------
CREATE TABLE canteen_supplier_items (
    id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
    supplier_id CHAR(36)     NOT NULL,
    item_name   VARCHAR(150) NOT NULL,
    PRIMARY KEY (id),
    INDEX idx_csi_supplier (supplier_id),
    CONSTRAINT fk_csi_supplier
        FOREIGN KEY (supplier_id) REFERENCES canteen_suppliers (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='CANTEEN — Items each supplier is known to deliver';

-- ----------------------------------------------------------------
-- 13. canteen_inventory
--     Raw material stock levels with low-stock alert threshold.
-- ----------------------------------------------------------------
CREATE TABLE canteen_inventory (
    id             CHAR(36)      NOT NULL DEFAULT (UUID()),
    name           VARCHAR(150)  NOT NULL,
    category       ENUM(
                     'Grains',
                     'Dairy',
                     'Spices',
                     'Beverages',
                     'Vegetables',
                     'Other'
                   )             NOT NULL DEFAULT 'Other',
    stock          DECIMAL(10,3) NOT NULL DEFAULT 0.000  COMMENT 'Current stock quantity',
    unit           VARCHAR(20)   NOT NULL                COMMENT 'kg, Litre, Packet, Bag etc.',
    min_stock      DECIMAL(10,3) NOT NULL DEFAULT 0.000  COMMENT 'Reorder alert threshold',
    supplier_id    CHAR(36)      NULL,
    unit_cost      DECIMAL(8,2)  NULL     COMMENT 'Cost per unit from supplier',
    last_restocked DATETIME      NULL,
    created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_cinv_category   (category),
    INDEX idx_cinv_supplier   (supplier_id),
    INDEX idx_cinv_stock      (stock),
    CONSTRAINT fk_cinv_supplier
        FOREIGN KEY (supplier_id) REFERENCES canteen_suppliers (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='CANTEEN — Raw ingredient stock levels with low-stock thresholds';

-- ----------------------------------------------------------------
-- 14. canteen_inventory_log
--     Audit trail for every stock movement (restock, usage, waste).
-- ----------------------------------------------------------------
CREATE TABLE canteen_inventory_log (
    id           INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    inventory_id CHAR(36)      NOT NULL,
    type         ENUM(
                   'RESTOCK',
                   'USAGE',
                   'WASTE',
                   'ADJUSTMENT'
                 )             NOT NULL,
    quantity     DECIMAL(10,3) NOT NULL  COMMENT 'Positive=addition, Negative=deduction',
    note         TEXT          NULL,
    performed_by INT UNSIGNED  NULL      COMMENT 'canteen_staff.id',
    created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_cil_inv_id     (inventory_id),
    INDEX idx_cil_type       (type),
    INDEX idx_cil_created_at (created_at),
    CONSTRAINT fk_cil_inv   FOREIGN KEY (inventory_id) REFERENCES canteen_inventory (id) ON DELETE CASCADE,
    CONSTRAINT fk_cil_staff FOREIGN KEY (performed_by) REFERENCES canteen_staff     (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='CANTEEN — Audit log for every inventory stock movement';

-- ----------------------------------------------------------------
-- 15. canteen_waste_log
--     Records of food or raw ingredient wastage with cost impact.
-- ----------------------------------------------------------------
CREATE TABLE canteen_waste_log (
    id             INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    inventory_id   CHAR(36)      NULL     COMMENT 'canteen_inventory.id — NULL if item no longer exists',
    item_name      VARCHAR(150)  NOT NULL COMMENT 'Snapshot of item name at time of logging',
    quantity       DECIMAL(10,3) NOT NULL,
    unit           VARCHAR(20)   NOT NULL,
    estimated_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    reason         VARCHAR(500)  NOT NULL,
    logged_by      INT UNSIGNED  NULL     COMMENT 'canteen_staff.id',
    logged_at      DATE          NOT NULL DEFAULT (CURRENT_DATE),
    created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_cwl_inv_id    (inventory_id),
    INDEX idx_cwl_logged_at (logged_at),
    CONSTRAINT fk_cwl_inv   FOREIGN KEY (inventory_id) REFERENCES canteen_inventory (id) ON DELETE SET NULL,
    CONSTRAINT fk_cwl_staff FOREIGN KEY (logged_by)    REFERENCES canteen_staff     (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='CANTEEN — Ingredient and food wastage records with cost impact';

-- ----------------------------------------------------------------
-- 16. canteen_settings
--     Key-value business configuration store for the canteen.
--     Other modules will have their own <module>_settings tables.
-- ----------------------------------------------------------------
CREATE TABLE canteen_settings (
    id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
    setting_key   VARCHAR(80)  NOT NULL UNIQUE,
    setting_value VARCHAR(500) NOT NULL,
    description   VARCHAR(300) NULL,
    updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_cset_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='CANTEEN — Key-value business configuration (tax rates, receipt text, etc.)';

-- ================================================================
--   SEED DATA
-- ================================================================

-- ----------------------------------------------------------------
--   admin_users  (Global platform administrators)
-- ----------------------------------------------------------------
-- IMPORTANT: Replace placeholder hashes with real bcrypt output before go-live.
-- Generate with: node -e "const b=require('bcryptjs'); b.hash('yourpassword',12).then(console.log)"
INSERT INTO admin_users (name, email, password_hash, role, module_scope) VALUES
('Platform Super Admin', 'superadmin@pujasoftware.com', '',  'super_admin',  NULL),
('Canteen Module Admin',  'canteen@pujasoftware.com',   '',     'module_admin', 'canteen');

-- ----------------------------------------------------------------
--   canteen_staff
--   Plain-text passwords for dev reference only:
--   manager123 / receptionist123 / cashier123 / kitchen123
-- ----------------------------------------------------------------
INSERT INTO canteen_staff (name, email, password_hash, assigned_role, created_by) VALUES
('Mukesh Patel', 'manager@swami.com',      '',      'manager',      2),
('Jatin Shah',   'receptionist@swami.com', '', 'receptionist', 2),
('Anil Vora',    'cashier@swami.com',      '',      'cashier',      2),
('Chef Ramesh',  'kitchen@swami.com',      '',      'kitchen',      2);

-- ----------------------------------------------------------------
--   canteen_tables  (Dining floor)
-- ----------------------------------------------------------------
INSERT INTO canteen_tables (id, name, capacity, status, current_bill, location_zone) VALUES
('tab-1', 'Table 1 (Window)',    4, 'AVAILABLE', 0.00,   'Window'),
('tab-2', 'Table 2 (Corner)',    2, 'CLEANING',  0.00,   'Corner'),
('tab-3', 'Table 3 (Center)',    6, 'OCCUPIED',  460.00, 'Center'),
('tab-4', 'Table 4 (Center)',    4, 'AVAILABLE', 0.00,   'Center'),
('tab-5', 'Table 5 (Satsang)',   8, 'RESERVED',  0.00,   'Satsang Hall'),
('tab-6', 'Table 6 (Entrance)',  4, 'AVAILABLE', 0.00,   'Entrance'),
('tab-7', 'Table 7 (Veranda)',   4, 'OCCUPIED',  280.00, 'Veranda'),
('tab-8', 'Table 8 (Veranda)',   2, 'AVAILABLE', 0.00,   'Veranda');

-- ----------------------------------------------------------------
--   canteen_menu_items  (Full menu catalog)
-- ----------------------------------------------------------------
INSERT INTO canteen_menu_items (id, name, price, category, variety, available, sort_order) VALUES
-- Snacks
('food-1',  'Pure Veg Masala Dosa',         120.00, 'Snacks',    'Regular', 1, 10),
('food-7',  'Spicy Samosa Chaat Platter',    80.00, 'Snacks',    'Spicy',   1, 11),
-- Mains
('food-2',  'Jain Special Khichdi',         150.00, 'Mains',     'Jain',    1, 20),
('food-3',  'Butter Paneer Masala & Naan',  180.00, 'Mains',     'Spicy',   1, 21),
('food-8',  'Swaminarayan Special Thali',   250.00, 'Mains',     'Regular', 1, 22),
-- Beverages
('food-5',  'Ginger Cardamom Tea',           30.00, 'Beverages', 'Regular', 1, 30),
('food-6',  'Mango Lassi Sweet',             70.00, 'Beverages', 'Sweet',   1, 31),
-- Desserts
('food-4',  'Saffron Kheer',                 90.00, 'Desserts',  'Sweet',   1, 40),
-- Combos
('combo-1', 'Dosa + Mango Lassi Combo',     170.00, 'Combos',    'Regular', 1, 50),
('combo-2', 'Naan & Paneer + Soft Drink',   220.00, 'Combos',    'Spicy',   1, 51),
-- Add-ons
('addon-1', 'Extra Butter Paneer Gravy',     60.00, 'Add-ons',   'Regular', 1, 60),
('addon-2', 'Extra Cheese Topping',          30.00, 'Add-ons',   'Regular', 1, 61);

INSERT INTO canteen_menu_combo_items (combo_id, component_id, quantity) VALUES
('combo-1', 'food-1', 1),
('combo-1', 'food-6', 1),
('combo-2', 'food-3', 1);

-- ----------------------------------------------------------------
--   canteen_customers  (Devotee profiles)
-- ----------------------------------------------------------------
INSERT INTO canteen_customers (id, name, phone, email, customer_type, total_orders, total_visits, total_spent, last_visit) VALUES
('cust-1', 'Kamlesh Patel', '+256 701 234567', 'kamlesh@gmail.com', 'Regular', 12, 12, 2840.00, '2026-07-04'),
('cust-2', 'Amit Vora',     '+256 752 987654', 'amit@gmail.com',    'Regular',  8,  8, 1960.00, '2026-07-04'),
('cust-3', 'Sanjay Mehta',  '+256 703 112233', 'sanjay@gmail.com',  'Guest',    4,  4,  910.00, '2026-07-04'),
('cust-4', 'Radha Sharma',  '+256 772 445566', 'radha@gmail.com',   'VIP',     22, 22, 7420.00, '2026-07-04'),
('cust-5', 'Pankaj Shah',   '+256 754 112244', 'pankaj@gmail.com',  'Guest',    3,  3,  750.00, '2026-07-03');

-- ----------------------------------------------------------------
--   canteen_orders + canteen_order_items
-- ----------------------------------------------------------------
INSERT INTO canteen_orders (id, token_number, customer_id, customer_name, customer_phone, table_id, table_name, subtotal, tax_amount, service_charge, discount_amount, total_amount, payment_method, payment_status, order_status, ordered_at) VALUES
('ord-1', 'TK-2041', 'cust-1', 'Kamlesh Patel', '+256 701 234567', 'tab-3', 'Table 3 (Center)',  360.00, 18.00,  9.00,  0.00, 387.00, 'UPI',     'PAID',    'PREPARING',      '2026-07-04 13:15:00'),
('ord-2', 'TK-2040', 'cust-2', 'Amit Vora',     '+256 752 987654', 'tab-7', 'Table 7 (Veranda)', 320.00, 16.00,  8.00, 20.00, 324.00, 'CASH',    'PAID',    'READY_TO_SERVE', '2026-07-04 12:45:00'),
('ord-3', 'TK-2042', 'cust-3', 'Sanjay Mehta',  '+256 703 112233', NULL,    'Counter Walk-in',   200.00, 10.00,  5.00,  0.00, 215.00, 'PENDING', 'PENDING', 'NEW',            '2026-07-04 13:25:00'),
('ord-4', 'TK-2039', 'cust-4', 'Radha Sharma',  '+256 772 445566', 'tab-1', 'Table 1 (Window)',  500.00, 25.00, 12.50, 50.00, 487.50, 'CARD',    'PAID',    'COMPLETED',      '2026-07-04 12:10:00');

INSERT INTO canteen_order_items (order_id, menu_item_id, item_name, item_price, quantity, line_total, cooking_notes) VALUES
('ord-1', 'food-2', 'Jain Special Khichdi',        150.00, 2, 300.00, 'Low spice'),
('ord-1', 'food-5', 'Ginger Cardamom Tea',           30.00, 2,  60.00, NULL),
('ord-2', 'food-3', 'Butter Paneer Masala & Naan',  180.00, 1, 180.00, NULL),
('ord-2', 'food-6', 'Mango Lassi Sweet',             70.00, 2, 140.00, NULL),
('ord-3', 'food-1', 'Pure Veg Masala Dosa',         120.00, 1, 120.00, NULL),
('ord-3', 'food-7', 'Spicy Samosa Chaat Platter',    80.00, 1,  80.00, NULL),
('ord-4', 'food-8', 'Swaminarayan Special Thali',   250.00, 2, 500.00, NULL);

-- ----------------------------------------------------------------
--   canteen_bookings
-- ----------------------------------------------------------------
INSERT INTO canteen_bookings (id, customer_id, customer_name, customer_phone, table_id, booking_date, booking_time, party_size, status) VALUES
('book-1', 'cust-5', 'Pankaj Shah', '+256 754 112244', 'tab-5', '2026-07-04', '02:30 PM', 6, 'CONFIRMED'),
('book-2', NULL,     'Nitin Devji', '+256 702 556677', 'tab-1', '2026-07-04', '07:00 PM', 4, 'CONFIRMED'),
('book-3', 'cust-3', 'Kishor Lal',  '+256 781 889900', 'tab-4', '2026-07-04', '01:00 PM', 3, 'SEATED');

-- ----------------------------------------------------------------
--   canteen_suppliers + canteen_supplier_items
-- ----------------------------------------------------------------
INSERT INTO canteen_suppliers (id, name, phone, email) VALUES
('sup-1', 'Bukoto Dairy Fresh',       '+256 771 990011', 'orders@bukotodairy.com'),
('sup-2', 'Swaminarayan Flour Mills', '+256 701 445522', 'sales@swamiflour.com'),
('sup-3', 'Kampala Spice Wholesale',  '+256 752 334455', 'spices@kampalawholesale.co.ug');

INSERT INTO canteen_supplier_items (supplier_id, item_name) VALUES
('sup-1', 'Milk'), ('sup-1', 'Paneer'), ('sup-1', 'Ghee'),    ('sup-1', 'Curd'),
('sup-2', 'Wheat Flour'), ('sup-2', 'Rice'), ('sup-2', 'Sooji'), ('sup-2', 'Urad Dal'),
('sup-3', 'Cardamom'), ('sup-3', 'Saffron'), ('sup-3', 'Turmeric'), ('sup-3', 'Chilli Powder');

-- ----------------------------------------------------------------
--   canteen_inventory
-- ----------------------------------------------------------------
INSERT INTO canteen_inventory (id, name, category, stock, unit, min_stock, supplier_id) VALUES
('inv-1', 'Basmati Rice',        'Grains',     120.000, 'kg',    30.000, 'sup-2'),
('inv-2', 'Premium Paneer',      'Dairy',       14.000, 'kg',    15.000, 'sup-1'),  -- LOW STOCK (14 < 15)
('inv-3', 'Fresh Milk',          'Dairy',       25.000, 'Litre', 10.000, 'sup-1'),
('inv-4', 'Cardamom Pods',       'Spices',       2.500, 'kg',     1.000, 'sup-3'),
('inv-5', 'Wheat Flour (Atta)',  'Grains',      85.000, 'kg',    25.000, 'sup-2'),
('inv-6', 'Annapoorna Tea Dust', 'Beverages',    4.000, 'kg',     5.000, 'sup-3'),  -- LOW STOCK (4 < 5)
('inv-7', 'Refined Sugar',       'Other',       45.000, 'kg',    10.000, 'sup-3');

-- ----------------------------------------------------------------
--   canteen_waste_log
-- ----------------------------------------------------------------
INSERT INTO canteen_waste_log (inventory_id, item_name, quantity, unit, estimated_cost, reason, logged_at) VALUES
('inv-3', 'Fresh Milk',     3.000, 'Litre', 150.00, 'Soured / Expired',        '2026-07-03'),
('inv-2', 'Premium Paneer', 1.500, 'kg',    270.00, 'Spoiled by power outage', '2026-07-02');

-- ----------------------------------------------------------------
--   canteen_settings  (Canteen-specific config key-value store)
-- ----------------------------------------------------------------
INSERT INTO canteen_settings (setting_key, setting_value, description) VALUES
('business_name',       'SKSS Kampala Canteen',                       'Shown on receipts and POS header'),
('business_address',    'Shree Swaminarayan Complex, Bukoto, Kampala', 'Full address on printed receipts'),
('currency_symbol',     'UGX',                                         'Currency symbol in UI'),
('gst_rate',            '5.00',                                        'GST/VAT percentage applied to all orders'),
('service_charge_rate', '2.50',                                        'Service charge percentage per order'),
('receipt_footer',      'Present token copy at the pick-up shelf.',    'Bottom line on printed receipts'),
('canteen_phone',       '+256 700 000000',                             'Canteen contact number'),
('low_stock_alert',     '1',                                           '1 = email alerts enabled for low inventory');

-- ================================================================
--   VIEWS  (Pre-built queries for admin panel dashboards)
--   All view names are prefixed canteen_ to match module convention
-- ================================================================

-- Low stock inventory alert
CREATE OR REPLACE VIEW canteen_vw_low_stock AS
SELECT
    i.id,
    i.name,
    i.category,
    i.stock,
    i.min_stock,
    i.unit,
    ROUND((i.stock / i.min_stock) * 100, 1) AS stock_pct,
    s.name  AS supplier_name,
    s.phone AS supplier_phone
FROM canteen_inventory i
LEFT JOIN canteen_suppliers s ON s.id = i.supplier_id
WHERE i.stock <= i.min_stock
ORDER BY stock_pct ASC;

-- Today's revenue summary (for admin dashboard stat cards)
CREATE OR REPLACE VIEW canteen_vw_today_revenue AS
SELECT
    COUNT(*)                                                                   AS total_orders,
    COALESCE(SUM(total_amount), 0)                                             AS gross_revenue,
    COALESCE(SUM(discount_amount), 0)                                          AS total_discounts,
    COALESCE(SUM(tax_amount), 0)                                               AS total_tax,
    COALESCE(SUM(service_charge), 0)                                           AS total_service_charge,
    COALESCE(AVG(total_amount), 0)                                             AS avg_order_value,
    COALESCE(SUM(CASE WHEN payment_method='CASH' THEN total_amount END), 0)    AS cash_total,
    COALESCE(SUM(CASE WHEN payment_method='UPI'  THEN total_amount END), 0)    AS upi_total,
    COALESCE(SUM(CASE WHEN payment_method='CARD' THEN total_amount END), 0)    AS card_total
FROM canteen_orders
WHERE DATE(ordered_at) = CURRENT_DATE
  AND payment_status   = 'PAID'
  AND order_status    != 'CANCELLED';

-- Live kitchen display queue (NEW + PREPARING orders)
CREATE OR REPLACE VIEW canteen_vw_kitchen_queue AS
SELECT
    o.id,
    o.token_number,
    o.customer_name,
    o.table_name,
    o.order_status,
    o.notes,
    o.ordered_at,
    TIMESTAMPDIFF(MINUTE, o.ordered_at, NOW()) AS minutes_elapsed
FROM canteen_orders o
WHERE o.order_status IN ('NEW','PREPARING')
ORDER BY o.ordered_at ASC;

-- Top spending devotee customers
CREATE OR REPLACE VIEW canteen_vw_top_customers AS
SELECT
    id,
    name,
    phone,
    customer_type,
    total_orders,
    total_visits,
    total_spent,
    last_visit,
    RANK() OVER (ORDER BY total_spent DESC) AS spend_rank
FROM canteen_customers
WHERE is_active = 1
ORDER BY total_spent DESC;

-- Live table floor plan with occupancy duration
CREATE OR REPLACE VIEW canteen_vw_active_tables AS
SELECT
    t.id,
    t.name,
    t.capacity,
    t.status,
    t.current_bill,
    t.location_zone,
    t.occupied_since,
    TIMESTAMPDIFF(MINUTE, t.occupied_since, NOW()) AS occupied_minutes,
    o.token_number                                  AS active_order_token,
    o.customer_name                                 AS current_customer
FROM canteen_tables t
LEFT JOIN canteen_orders o
    ON  o.table_id     = t.id
    AND o.order_status NOT IN ('COMPLETED','CANCELLED')
WHERE t.is_active = 1
ORDER BY t.status, t.name;

-- ================================================================
SET FOREIGN_KEY_CHECKS = 1;
-- ================================================================
--   EXTENSION GUIDE — Adding a new module to this database
-- ================================================================
--
--   Step 1: Choose a short module prefix (e.g. temple_, event_)
--
--   Step 2: Create your tables following the pattern:
--           CREATE TABLE temple_shrines ( ... );
--           CREATE TABLE temple_priests ( ... );
--           CREATE TABLE temple_schedule ( ... );
--           CREATE TABLE temple_settings ( ... );
--
--   Step 3: Link module staff to admin_users using module_scope:
--           INSERT INTO admin_users
--             (name, email, password_hash, role, module_scope)
--           VALUES ('Temple Manager', 'temple@..', '..', 'module_admin', 'temple');
--
--   Step 4: Add a named VIEW prefix for each module:
--           CREATE VIEW temple_vw_today_schedule AS ...;
--
--   The admin_users table is the ONLY shared/global table.
--   All other tables live within their module namespace.
--
-- ================================================================
--   END OF SCHEMA: canteen_pos_db.sql
-- ================================================================
