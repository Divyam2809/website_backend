const { pool } = require('../config/db');

exports.getAll = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM employee_testimonials ORDER BY created_at DESC');
        res.json({ data: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.create = async (req, res) => {
    try {
        const { name, position, tenure, testimonial, story, image, status } = req.body;
        const [result] = await pool.query(
            'INSERT INTO employee_testimonials (name, position, tenure, testimonial, story, image, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, position, tenure, testimonial, JSON.stringify(story), image, status || 'Draft']
        );
        res.status(201).json({ data: { id: result.insertId, ...req.body } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, position, tenure, testimonial, story, image, status } = req.body;

        await pool.query(
            'UPDATE employee_testimonials SET name=?, position=?, tenure=?, testimonial=?, story=?, image=?, status=? WHERE id=?',
            [name, position, tenure, testimonial, JSON.stringify(story), image, status, id]
        );
        res.json({ data: { id, ...req.body } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM employee_testimonials WHERE id=?', [id]);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.toggleVisibility = async (req, res) => {
    try {
        const { id } = req.params;
        // First get current status
        const [rows] = await pool.query('SELECT status FROM employee_testimonials WHERE id=?', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Not found' });

        const newStatus = rows[0].status === 'Published' ? 'Draft' : 'Published';
        await pool.query('UPDATE employee_testimonials SET status=? WHERE id=?', [newStatus, id]);

        res.json({ data: { id, status: newStatus } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
