const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = mysql.createPool({
    host: process.env.DB_SERVER,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
});

const dataDir = path.join(__dirname, '../../website/src/data');

async function seed() {
    try {
        const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
        console.log(`Found ${files.length} JSON files to seed.`);

        for (const file of files) {
            const pageId = file.replace('Content.json', '_live');
            const filePath = path.join(dataDir, file);
            const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

            console.log(`Seeding ${pageId}...`);

            await pool.query(
                'INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
                [pageId, JSON.stringify(content), JSON.stringify(content)]
            );
        }

        console.log('Seeding completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
}

seed();
