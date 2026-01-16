const { pool } = require('../config/db');

exports.getPageContent = async (req, res) => {
    try {
        const { pageId } = req.params;
        const [rows] = await pool.query('SELECT setting_value FROM site_settings WHERE setting_key = ?', [pageId]);
        if (rows.length > 0) {
            res.json(rows[0].setting_value);
        } else {
            // Return empty object or 404? 
            // For smoother frontend dev, maybe empty object if we expect it to exist later? 
            // But 404 is semantically correct.
            res.status(404).json({ message: `Content not found for ${pageId}` });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.updatePageContent = async (req, res) => {
    try {
        const { pageId } = req.params;
        const content = req.body;

        // Upsert logic
        await pool.query(
            'INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
            [pageId, JSON.stringify(content), JSON.stringify(content)]
        );
        res.json({ message: 'Content updated successfully', data: content });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
