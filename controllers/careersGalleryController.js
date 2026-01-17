const { pool } = require('../config/db');

// Get all items
exports.getAll = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM careers_gallery ORDER BY sort_order ASC, created_at DESC');
        res.json({ data: rows });
    } catch (error) {
        console.error('Error fetching gallery items:', error);
        res.status(500).json({ error: 'Failed to fetch gallery items' });
    }
};

// Create new item
exports.create = async (req, res) => {
    try {
        const { title, image, caption, status, sort_order } = req.body;
        const [result] = await pool.query(
            'INSERT INTO careers_gallery (title, image, caption, status, sort_order, isVisible) VALUES (?, ?, ?, ?, ?, ?)',
            [title, image, caption, status || 'Published', sort_order || 0, true]
        );
        res.status(201).json({
            data: { id: result.insertId, title, image, caption, status, sort_order }
        });
    } catch (error) {
        console.error('Error creating gallery item:', error);
        res.status(500).json({ error: 'Failed to create gallery item' });
    }
};

// Update item
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, image, caption, status, sort_order } = req.body;

        await pool.query(
            'UPDATE careers_gallery SET title=?, image=?, caption=?, status=?, sort_order=? WHERE id=?',
            [title, image, caption, status, sort_order, id]
        );

        res.json({ data: { id, title, image, caption, status, sort_order } });
    } catch (error) {
        console.error('Error updating gallery item:', error);
        res.status(500).json({ error: 'Failed to update gallery item' });
    }
};

// Delete item
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM careers_gallery WHERE id=?', [id]);
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        console.error('Error deleting gallery item:', error);
        res.status(500).json({ error: 'Failed to delete gallery item' });
    }
};

// Toggle visibility
exports.toggleVisibility = async (req, res) => {
    try {
        const { id } = req.params;

        // First get current status
        const [rows] = await pool.query('SELECT isVisible, status FROM careers_gallery WHERE id=?', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Item not found' });

        const current = rows[0];
        const newVisibility = !current.isVisible;
        const newStatus = newVisibility ? 'Published' : 'Draft';

        await pool.query(
            'UPDATE careers_gallery SET isVisible=?, status=? WHERE id=?',
            [newVisibility, newStatus, id]
        );

        res.json({ data: { id, isVisible: newVisibility, status: newStatus } });
    } catch (error) {
        console.error('Error toggling visibility:', error);
        res.status(500).json({ error: 'Failed to toggle visibility' });
    }
};
