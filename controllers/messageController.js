const { pool } = require('../config/db');

// GET all messages
const getMessages = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM messages ORDER BY created_at DESC');
        res.json({
            message: 'success',
            data: rows
        });
    } catch (err) {
        console.error('Error fetching messages:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// POST a new message
const createMessage = async (req, res) => {
    const { name, email, phone, institute, designation, demo_date, message } = req.body;

    // Basic validation
    if (!name || !email) {
        return res.status(400).json({ error: 'Name and Email are required.' });
    }

    try {
        const sql = `
            INSERT INTO messages (name, email, phone, institute, designation, demo_date, message)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await pool.query(sql, [name, email, phone, institute, designation, demo_date, message]);

        res.json({
            message: 'success',
            data: { id: result.insertId }
        });
    } catch (err) {
        console.error('Error creating message:', err);
        res.status(400).json({ error: err.message });
    }
};

module.exports = {
    getMessages,
    createMessage
};
