const { pool } = require('../config/db');

async function setupPrivacyTable() {
    try {
        console.log('Creating privacy_sections table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS privacy_sections (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                icon VARCHAR(255) DEFAULT 'doc',
                content JSON,
                sort_order INT DEFAULT 0,
                status ENUM('Draft', 'Published') DEFAULT 'Published',
                isVisible BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('privacy_sections table created successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error creating table:', err);
        process.exit(1);
    }
}

setupPrivacyTable();
