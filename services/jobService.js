const { pool } = require('../config/db');

class JobService {
    async getAll() {
        // Return jobs ordered by creation date
        const [rows] = await pool.query('SELECT * FROM jobs ORDER BY created_at DESC');
        return rows;
    }

    async getById(id) {
        const [rows] = await pool.query('SELECT * FROM jobs WHERE id = ?', [id]);
        return rows[0];
    }

    async create(data) {
        const { title, department, location, type, description, requirements, responsibilities, status, isVisible } = data;

        const sql = `
            INSERT INTO jobs (title, department, location, type, description, requirements, responsibilities, status, isVisible)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await pool.query(sql, [
            title,
            department,
            location,
            type,
            description,
            JSON.stringify(requirements), // Store as JSON string to satisfy DB column type
            JSON.stringify(responsibilities), // Store as JSON string
            status || 'Draft',
            isVisible !== undefined ? isVisible : true
        ]);

        return { id: result.insertId, ...data };
    }

    async update(id, data) {
        const { title, department, location, type, description, requirements, responsibilities, status, isVisible } = data;

        const sql = `
            UPDATE jobs 
            SET title = ?, department = ?, location = ?, type = ?, description = ?, requirements = ?, responsibilities = ?, status = ?, isVisible = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

        await pool.query(sql, [
            title,
            department,
            location,
            type,
            description,
            JSON.stringify(requirements),
            JSON.stringify(responsibilities),
            status,
            isVisible,
            id
        ]);

        return { id, ...data };
    }

    async delete(id) {
        await pool.query('DELETE FROM jobs WHERE id = ?', [id]);
        return { message: 'Job deleted successfully' };
    }

    async toggleVisibility(id) {
        const job = await this.getById(id);
        if (!job) throw new Error('Job not found');

        const newVisibility = !job.isVisible;
        const newStatus = newVisibility ? 'Published' : 'Draft';

        await pool.query(
            'UPDATE jobs SET isVisible = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [newVisibility, newStatus, id]
        );

        return { id, isVisible: newVisibility, status: newStatus };
    }
}

module.exports = new JobService();
