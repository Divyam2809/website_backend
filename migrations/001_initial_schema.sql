-- Melzo Database Schema Migration
-- Run this file to create all necessary tables for the admin panel

-- ============================================
-- BLOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS blogs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    author JSON,
    publishDate VARCHAR(50),
    readTime INT,
    category VARCHAR(100),
    excerpt TEXT,
    status VARCHAR(50) DEFAULT 'Draft',
    isVisible BOOLEAN DEFAULT TRUE,
    image VARCHAR(255),
    content JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_status (status),
    INDEX idx_visible (isVisible)
);

-- ============================================
-- NEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS news (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category VARCHAR(100),
    date VARCHAR(50),
    title VARCHAR(255) NOT NULL,
    excerpt TEXT,
    image VARCHAR(255),
    language VARCHAR(50) DEFAULT 'English',
    content TEXT,
    isVisible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_visible (isVisible),
    INDEX idx_language (language)
);

-- ============================================
-- CASE STUDIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS case_studies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image VARCHAR(255),
    type VARCHAR(50) DEFAULT 'image',
    mediaUrl VARCHAR(255),
    isVisible BOOLEAN DEFAULT TRUE,
    content JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_visible (isVisible),
    INDEX idx_type (type)
);

-- ============================================
-- TESTIMONIALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS testimonials (
    id INT PRIMARY KEY AUTO_INCREMENT,
    testimonial TEXT NOT NULL,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(255),
    isVisible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_visible (isVisible)
);

-- ============================================
-- AWARDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS awards (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    organization VARCHAR(255),
    awardLevel VARCHAR(100),
    prize VARCHAR(100),
    image VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Published',
    slug VARCHAR(255) UNIQUE,
    isVisible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_visible (isVisible)
);

-- ============================================
-- FAQS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS faqs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Published',
    slug VARCHAR(255) UNIQUE,
    isVisible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_visible (isVisible)
);

-- ============================================
-- TEAM TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS team (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(255),
    image VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Published',
    slug VARCHAR(255) UNIQUE,
    isVisible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_visible (isVisible)
);

-- ============================================
-- TIMELINE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS timeline (
    id INT PRIMARY KEY AUTO_INCREMENT,
    year VARCHAR(10) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    isVisible BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'Published',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_year (year),
    INDEX idx_visible (isVisible)
);

-- ============================================
-- INDUSTRIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS industries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    summary TEXT,
    impact TEXT,
    details TEXT,
    modalTitle VARCHAR(255),
    fullSummary TEXT,
    targetAudience TEXT,
    problemsSolved TEXT,
    useCases TEXT,
    statsString TEXT,
    tags VARCHAR(255),
    image VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Published',
    isVisible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_visible (isVisible)
);

-- ============================================
-- JOBS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS jobs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    location VARCHAR(100),
    type VARCHAR(50),
    description TEXT,
    requirements JSON,
    responsibilities JSON,
    status VARCHAR(50) DEFAULT 'Open',
    isVisible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_department (department),
    INDEX idx_status (status),
    INDEX idx_visible (isVisible)
);

-- ============================================
-- JOB APPLICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS job_applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    job_id INT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    resume VARCHAR(255),
    cover_letter TEXT,
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    INDEX idx_job_id (job_id),
    INDEX idx_status (status),
    INDEX idx_email (email)
);

-- ============================================
-- USERS TABLE (Admin Panel)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    name VARCHAR(255),
    isVisible BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'Published',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Insert default admin users
INSERT INTO users (email, password, role, name) VALUES
    ('superadmin@melzo.com', 'superadmin123', 'superadmin', 'Super Admin'),
    ('contentmanager@melzo.com', 'contentmanager123', 'content_manager', 'Content Manager'),
    ('sales@melzo.com', 'sales123', 'sales', 'Sales Team'),
    ('hr@melzo.com', 'hr123', 'hr', 'HR Team')
ON DUPLICATE KEY UPDATE email=email;

-- ============================================
-- FOOTER CONFIGURATION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS footer_config (
    id INT PRIMARY KEY AUTO_INCREMENT,
    description TEXT,
    contact JSON,
    social JSON,
    columns JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- MESSAGES TABLE (Demo Requests)
-- ============================================
-- This table should already exist from previous migration
CREATE TABLE IF NOT EXISTS messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    institute VARCHAR(255),
    designation VARCHAR(100),
    demo_date DATE,
    message TEXT,
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_status (status)
);

-- ============================================
-- VERIFICATION
-- ============================================
-- Show all tables
SHOW TABLES;

-- Show table structures
DESCRIBE blogs;
DESCRIBE news;
DESCRIBE case_studies;
DESCRIBE testimonials;
DESCRIBE awards;
DESCRIBE faqs;
DESCRIBE team;
DESCRIBE timeline;
DESCRIBE industries;
DESCRIBE jobs;
DESCRIBE job_applications;
DESCRIBE users;
DESCRIBE footer_config;
DESCRIBE messages;
