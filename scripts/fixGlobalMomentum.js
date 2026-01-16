require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { pool } = require('../config/db');

async function fixGlobalMomentum() {
    try {
        console.log('Fixing Global Momentum configuration...');

        // Delete the corrupted entry
        await pool.query('DELETE FROM site_settings WHERE setting_key = ?', ['global_momentum']);
        console.log('Deleted corrupted global_momentum entry');

        // Insert correct data
        const defaultGlobalMomentum = {
            marqueeItems: [
                { text: "Innovation", status: 'Published' },
                { text: "Immersive Learning", status: 'Published' },
                { text: "Virtual Reality", status: 'Published' },
                { text: "Augmented Reality", status: 'Published' },
                { text: "Future of Work", status: 'Published' },
                { text: "Education Revolution", status: 'Published' }
            ],
            stats: [
                { num: '500+', label: 'Schools', status: 'Published' },
                { num: '50K+', label: 'Students', status: 'Published' },
                { num: '10+', label: 'Countries', status: 'Published' },
                { num: '100%', label: 'Engagement', status: 'Published' }
            ]
        };

        await pool.query(
            'INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)',
            ['global_momentum', JSON.stringify(defaultGlobalMomentum)]
        );

        console.log('Successfully inserted correct global_momentum configuration');

        // Verify
        const [rows] = await pool.query('SELECT setting_value FROM site_settings WHERE setting_key = ?', ['global_momentum']);
        console.log('Verification - Data in DB:', rows[0].setting_value);

        process.exit(0);
    } catch (error) {
        console.error('Error fixing global momentum:', error);
        process.exit(1);
    }
}

fixGlobalMomentum();
