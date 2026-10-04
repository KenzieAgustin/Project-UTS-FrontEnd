CREATE DATABASE IF NOT EXISTS lamak_bana CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lamak_bana;

CREATE TABLE IF NOT EXISTS menu_items (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(120) NOT NULL,
    description TEXT NULL,
    category VARCHAR(60) NOT NULL,
    price INT UNSIGNED NOT NULL DEFAULT 0,
    stock INT UNSIGNED NOT NULL DEFAULT 0,
    image MEDIUMTEXT NULL,
    status ENUM('tersedia', 'habis') NOT NULL DEFAULT 'tersedia',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_menu_category (category)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS orders (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    code VARCHAR(30) NULL,
    customer VARCHAR(120) NOT NULL,
    phone VARCHAR(30) NULL,
    channel ENUM('Makan di Tempat', 'Ambil Sendiri', 'Ojek Online', 'Katering') NOT NULL DEFAULT 'Makan di Tempat',
    total INT UNSIGNED NOT NULL DEFAULT 0,
    status ENUM('Baru', 'Diproses', 'Siap', 'Selesai', 'Dibatalkan') NOT NULL DEFAULT 'Baru',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_orders_code (code),
    KEY idx_orders_created (created_at),
    KEY idx_orders_status (status),
    KEY idx_orders_channel (channel)
) ENGINE=InnoDB;
