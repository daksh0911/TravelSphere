-- ====================================================================
-- Travel Package Management System - Complete Database Schema (DDL)
-- Strictly generated per Project_spiral.pdf Database Dictionary (Tables 4 - 22)
-- Compatible with MySQL (WampServer / XAMPP phpMyAdmin)
-- ====================================================================

CREATE DATABASE IF NOT EXISTS travel_db;
USE travel_db;

-- 1. Table: Admin (PDF Table 4, Page 21-22)
CREATE TABLE IF NOT EXISTS admin (
    admin_id INT(10) AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NULL,
    avatar_url VARCHAR(500) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table: Users (PDF Table 5, Page 23-24)
CREATE TABLE IF NOT EXISTS users (
    user_id INT(10) AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NULL,
    avatar_url VARCHAR(500) NULL,
    role VARCHAR(50) DEFAULT 'CUSTOMER',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table: Destinations (PDF Table 7, Page 28-29)
CREATE TABLE IF NOT EXISTS destinations (
    destination_id INT(11) AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    location VARCHAR(200) NOT NULL,
    description TEXT NULL,
    image_url VARCHAR(500) NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    rating DECIMAL(3,1) NULL DEFAULT 4.8,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Table: Hotels (PDF Table 8, Page 30-31)
CREATE TABLE IF NOT EXISTS hotels (
    hotel_id INT(11) AUTO_INCREMENT PRIMARY KEY,
    destination_id INT(11) NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT NULL,
    address VARCHAR(300) NULL,
    image_url VARCHAR(500) NULL,
    price_per_unit DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    rating DECIMAL(3,1) NULL DEFAULT 4.8,
    amenities JSON NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (destination_id) REFERENCES destinations(destination_id) ON DELETE SET NULL
);

-- 5. Table: Hotel_managers (PDF Table 9, Page 32-33)
CREATE TABLE IF NOT EXISTS hotel_managers (
    manager_id INT(11) AUTO_INCREMENT PRIMARY KEY,
    user_id INT(11) NOT NULL,
    hotel_name VARCHAR(150) NOT NULL,
    hotel_license VARCHAR(100) NULL,
    property_type VARCHAR(100) NULL,
    total_rooms INT(10) NULL DEFAULT 10,
    city VARCHAR(100) NULL,
    hotel_address VARCHAR(500) NULL,
    rating DECIMAL(3,2) NULL DEFAULT 4.80,
    contact_email VARCHAR(150) NULL,
    contact_phone VARCHAR(20) NULL,
    status VARCHAR(30) DEFAULT 'ACTIVE',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 6. Table: Packages (PDF Table 10, Page 34-35)
CREATE TABLE IF NOT EXISTS packages (
    package_id INT(11) AUTO_INCREMENT PRIMARY KEY,
    destination_id INT(11) NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NULL,
    days INT(11) NOT NULL DEFAULT 5,
    nights INT(11) NOT NULL DEFAULT 4,
    price DECIMAL(10,2) NOT NULL DEFAULT 999.00,
    rating DECIMAL(3,1) NULL DEFAULT 4.8,
    image_url VARCHAR(500) NULL,
    features JSON NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (destination_id) REFERENCES destinations(destination_id) ON DELETE SET NULL
);

-- 7. Table: Tour_guides (PDF Table 11, Page 36-37)
CREATE TABLE IF NOT EXISTS tour_guides (
    guide_id INT(11) AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    bio TEXT NULL,
    photo_url VARCHAR(500) NULL,
    languages JSON NULL,
    rating DECIMAL(3,1) NULL DEFAULT 4.9,
    price_per_day DECIMAL(10,2) NOT NULL DEFAULT 150.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Table: Transport_providers (PDF Table 12, Page 38-39)
CREATE TABLE IF NOT EXISTS transport_providers (
    tprovider_id INT(11) AUTO_INCREMENT PRIMARY KEY,
    user_id INT(11) NOT NULL,
    company_name VARCHAR(150) NOT NULL,
    business_license VARCHAR(100) NULL,
    fleet_size INT(11) NULL DEFAULT 5,
    vehicle_types JSON NULL,
    service_regions JSON NULL,
    rating DECIMAL(3,2) NULL DEFAULT 4.85,
    contact_email VARCHAR(150) NULL,
    contact_phone VARCHAR(20) NULL,
    office_address VARCHAR(500) NULL,
    status BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 9. Table: Travel_agents (PDF Table 13, Page 40-42)
CREATE TABLE IF NOT EXISTS travel_agents (
    tagent_id INT(11) AUTO_INCREMENT PRIMARY KEY,
    user_id INT(11) NOT NULL,
    agency_name VARCHAR(150) NOT NULL,
    license_number VARCHAR(100) NOT NULL,
    commission_rate DECIMAL(5,2) NULL DEFAULT 10.00,
    experience_years INT(11) NULL DEFAULT 5,
    destinations_covered JSON NULL,
    rating DECIMAL(3,2) NULL DEFAULT 4.80,
    contact_email VARCHAR(150) NULL,
    contact_phone VARCHAR(20) NULL,
    office_address VARCHAR(500) NULL,
    status BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 10. Table: Trip_plans (PDF Table 14, Page 43-44)
CREATE TABLE IF NOT EXISTS trip_plans (
    tplan_id INT(11) AUTO_INCREMENT PRIMARY KEY,
    user_id INT(11) NOT NULL,
    destination_id INT(11) NULL,
    title VARCHAR(200) NOT NULL,
    start_date DATE NULL,
    end_date DATE NULL,
    budget DECIMAL(10,2) NULL,
    itinerary JSON NULL,
    status ENUM('draft', 'planned', 'booked', 'completed') DEFAULT 'planned',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (destination_id) REFERENCES destinations(destination_id) ON DELETE SET NULL
);

-- 11. Table: Vehicles (PDF Table 15, Page 45-46)
CREATE TABLE IF NOT EXISTS vehicles (
    vehicle_id INT(11) AUTO_INCREMENT PRIMARY KEY,
    tprovider_id INT(11) NULL,
    type VARCHAR(100) NOT NULL,
    model VARCHAR(150) NOT NULL,
    capacity INT(11) NOT NULL DEFAULT 4,
    price_per_day DECIMAL(10,2) NOT NULL DEFAULT 85.00,
    image_url VARCHAR(500) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tprovider_id) REFERENCES transport_providers(tprovider_id) ON DELETE SET NULL
);

-- 12. Table: Coupons (PDF Table 18, Page 50-51)
CREATE TABLE IF NOT EXISTS coupons (
    coupon_id INT(11) AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type ENUM('percentage', 'fixed') NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    min_amount DECIMAL(10,2) NULL DEFAULT 0.00,
    max_uses INT(11) NULL DEFAULT 100,
    used_count INT(11) NULL DEFAULT 0,
    expires_at DATE NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. Table: Bookings (PDF Table 6, Page 25-27)
CREATE TABLE IF NOT EXISTS bookings (
    booking_id INT(11) AUTO_INCREMENT PRIMARY KEY,
    user_id INT(11) NOT NULL,
    package_id INT(11) NULL,
    hotel_id INT(11) NULL,
    vehicle_id INT(11) NULL,
    guide_id INT(11) NULL,
    coupon_id INT(11) NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    guests INT(11) DEFAULT 2,
    subtotal DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'confirmed',
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (package_id) REFERENCES packages(package_id) ON DELETE SET NULL,
    FOREIGN KEY (hotel_id) REFERENCES hotels(hotel_id) ON DELETE SET NULL,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE SET NULL,
    FOREIGN KEY (guide_id) REFERENCES tour_guides(guide_id) ON DELETE SET NULL,
    FOREIGN KEY (coupon_id) REFERENCES coupons(coupon_id) ON DELETE SET NULL
);

-- 14. Table: Wishlist (PDF Table 16, Page 47)
CREATE TABLE IF NOT EXISTS wishlist (
    wishlist_id INT(11) AUTO_INCREMENT PRIMARY KEY,
    user_id INT(10) NOT NULL,
    target_type VARCHAR(50) DEFAULT 'package',
    target_id INT(11) NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 15. Table: Contact_messages (PDF Table 17, Page 48-49)
CREATE TABLE IF NOT EXISTS contact_messages (
    contact_id INT(11) AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    subject VARCHAR(200) NULL,
    message TEXT NOT NULL,
    is_read TINYINT(1) DEFAULT 0,
    replied_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 16. Table: Faqs (PDF Table 19, Page 52)
CREATE TABLE IF NOT EXISTS faqs (
    faq_id INT(11) AUTO_INCREMENT PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100) NULL,
    sort_order INT(11) NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 17. Table: Notifications (PDF Table 20, Page 53)
CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT(11) AUTO_INCREMENT PRIMARY KEY,
    user_id INT(11) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NULL,
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 18. Table: Payments (PDF Table 21, Page 54-55)
CREATE TABLE IF NOT EXISTS payments (
    payment_id INT(11) AUTO_INCREMENT PRIMARY KEY,
    booking_id INT(11) NOT NULL,
    user_id INT(11) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    method ENUM('card', 'upi', 'netbanking', 'wallet') NOT NULL DEFAULT 'card',
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'completed',
    transaction_ref VARCHAR(200) NULL,
    paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 19. Table: Reviews (PDF Table 22, Page 56)
CREATE TABLE IF NOT EXISTS reviews (
    review_id INT(11) AUTO_INCREMENT PRIMARY KEY,
    user_id INT(11) NOT NULL,
    booking_id INT(11) NULL,
    rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE SET NULL
);

