const { pool } = require('../config/db');

const getGlobalMomentumConfig = async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT setting_value FROM site_settings WHERE setting_key = ?',
            ['global_momentum']
        );

        if (rows.length === 0) {
            return res.json({
                marqueeItems: [
                    "Innovation",
                    "Immersive Learning",
                    "Virtual Reality",
                    "Augmented Reality",
                    "Future of Work",
                    "Education Revolution"
                ],
                stats: [
                    { num: '500+', label: 'Schools' },
                    { num: '50K+', label: 'Students' },
                    { num: '10+', label: 'Countries' },
                    { num: '100%', label: 'Engagement' }
                ]
            });
        }

        // MySQL might return as string or object depending on column type
        const settingValue = rows[0].setting_value;
        const data = typeof settingValue === 'string' ? JSON.parse(settingValue) : settingValue;

        res.json(data);
    } catch (error) {
        console.error('Error fetching global momentum config:', error);
        res.status(500).json({ error: 'Failed to fetch global momentum configuration' });
    }
};

const updateGlobalMomentumConfig = async (req, res) => {
    try {
        const config = req.body;
        const configJson = JSON.stringify(config);

        await pool.query(
            `INSERT INTO site_settings (setting_key, setting_value) 
             VALUES (?, ?) 
             ON DUPLICATE KEY UPDATE setting_value = ?`,
            ['global_momentum', configJson, configJson]
        );

        res.json({ message: 'Global momentum configuration updated successfully' });
    } catch (error) {
        console.error('Error updating global momentum config:', error);
        res.status(500).json({ error: 'Failed to update global momentum configuration' });
    }
};

module.exports = {
    getGlobalMomentumConfig,
    updateGlobalMomentumConfig
};
