CREATE DATABASE IF NOT EXISTS rentara_db;
USE rentara_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('customer', 'admin') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cars Table
CREATE TABLE IF NOT EXISTS cars (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    brand VARCHAR(50) NOT NULL,
    type ENUM('Sedan', 'SUV', 'Economy', 'Family', 'Compact') NOT NULL,
    price_per_day DECIMAL(10, 2) NOT NULL, -- Philippine Peso
    image_url VARCHAR(255),
    transmission ENUM('Automatic', 'Manual') DEFAULT 'Automatic',
    passengers INT DEFAULT 4,
    status ENUM('Available', 'Rented', 'Maintenance') DEFAULT 'Available',
    quantity INT DEFAULT 1, -- New: Quantity of available cars
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    car_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status ENUM('Pending', 'Confirmed', 'Completed', 'Cancelled') DEFAULT 'Pending',
    
    -- New Fields for Returns & Penalties
    is_returned BOOLEAN DEFAULT FALSE,
    returned_at DATETIME NULL,
    penalty_amount DECIMAL(10, 2) DEFAULT 0.00,
    penalty_status ENUM('None', 'Unpaid', 'Paid') DEFAULT 'None',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (car_id) REFERENCES cars(id)
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('Credit Card', 'Debit Card', 'Cash', 'GCash') NOT NULL,
    payment_status ENUM('Pending', 'Paid', 'Failed') DEFAULT 'Pending',
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- Sample Data: Cars
INSERT INTO cars (name, brand, type, price_per_day, image_url, transmission, passengers) VALUES
('Vios 1.3', 'Toyota', 'Sedan', 1500.00, 'assets/images/vios.jpg', 'Automatic', 5),
('Innova 2.8', 'Toyota', 'Family', 2500.00, 'assets/images/innova.jpg', 'Automatic', 7),
('Wigo G', 'Toyota', 'Compact', 1200.00, 'assets/images/wigo.jpg', 'Automatic', 5),
('Fortuner', 'Toyota', 'SUV', 3500.00, 'assets/images/fortuner.jpg', 'Automatic', 7),
('Mirage G4', 'Mitsubishi', 'Economy', 1300.00, 'assets/images/mirage.jpg', 'Automatic', 5);
