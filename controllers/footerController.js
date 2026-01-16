const { pool } = require('../config/db');

// Get Footer Config
exports.getFooterConfig = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT setting_value FROM site_settings WHERE setting_key = ?', ['footer']);
        if (rows.length > 0) {
            res.json({ data: rows[0].setting_value });
        } else {
            res.status(404).json({ error: 'Footer config not found' });
        }
    } catch (error) {
        console.error('Error fetching footer config:', error);
        res.status(500).json({ error: 'Failed to fetch footer config' });
    }
};

// Update Footer Config
exports.updateFooterConfig = async (req, res) => {
    try {
        const config = req.body;
        await pool.query('UPDATE site_settings SET setting_value = ? WHERE setting_key = ?', [JSON.stringify(config), 'footer']);
        res.json({ message: 'Footer config updated successfully' });
    } catch (error) {
        console.error('Error updating footer config:', error);
        res.status(500).json({ error: 'Failed to update footer config' });
    }
};
