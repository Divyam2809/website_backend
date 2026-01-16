const { pool } = require('../config/db');

// Get Data Strip Config
exports.getDataStripConfig = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT setting_value FROM site_settings WHERE setting_key = ?', ['data_strip']);
        if (rows.length > 0) {
            res.json({ data: rows[0].setting_value });
        } else {
            res.status(404).json({ error: 'Data Strip config not found' });
        }
    } catch (error) {
        console.error('Error fetching data strip config:', error);
        res.status(500).json({ error: 'Failed to fetch data strip config' });
    }
};

// Update Data Strip Config
exports.updateDataStripConfig = async (req, res) => {
    try {
        const config = req.body;
        await pool.query('INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
            ['data_strip', JSON.stringify(config), JSON.stringify(config)]
        );
        res.json({ message: 'Data Strip config updated successfully' });
    } catch (error) {
        console.error('Error updating data strip config:', error);
        res.status(500).json({ error: 'Failed to update data strip config' });
    }
};
