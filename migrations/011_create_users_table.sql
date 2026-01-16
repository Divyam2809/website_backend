CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('superadmin', 'content_manager', 'sales', 'hr') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
