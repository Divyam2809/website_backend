const { pool } = require('../config/db');

async function setupCareersGalleryTable() {
    try {
        console.log('Creating careers_gallery table...');

        // Create table
        // Using LONGTEXT for image to support large base64 strings if needed as per user request for "long text format"
        await pool.query(`
            CREATE TABLE IF NOT EXISTS careers_gallery (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255),
                image LONGTEXT, 
                caption TEXT,
                status ENUM('Draft', 'Published') DEFAULT 'Published',
                isVisible BOOLEAN DEFAULT TRUE,
                sort_order INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('careers_gallery table created successfully.');

        process.exit(0);

    } catch (err) {
        console.error('Error setting up careers_gallery table:', err);
        process.exit(1);
    }
}

setupCareersGalleryTable();
