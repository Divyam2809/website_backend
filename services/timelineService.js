const { pool } = require('../config/db');

class TimelineService {
    async getAll() {
        // Order by year DESC, then created_at DESC
        // Assuming year is stored as string like "2023", "2024". String sort works for valid years.
        // Or if customized ordering needed, might need manual sort.
        const [rows] = await pool.query('SELECT * FROM timeline ORDER BY year DESC, created_at DESC');
        return rows;
    }

    async getById(id) {
        const [rows] = await pool.query('SELECT * FROM timeline WHERE id = ?', [id]);
        return rows[0];
    }

    async create(data) {
        const { year, title, content, status, isVisible } = data;

        const sql = `
            INSERT INTO timeline (year, title, content, status, isVisible)
            VALUES (?, ?, ?, ?, ?)
        `;

        const [result] = await pool.query(sql, [
            year,
            title,
            content,
            status || 'Published',
            isVisible !== undefined ? isVisible : true
        ]);

        return { id: result.insertId, ...data };
    }

    async update(id, data) {
        const { year, title, content, status, isVisible } = data;

        const sql = `
            UPDATE timeline 
            SET year = ?, title = ?, content = ?, status = ?, isVisible = ?, 
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

        await pool.query(sql, [
            year,
            title,
            content,
            status,
            isVisible,
            id
        ]);

        return { id, ...data };
    }

    async delete(id) {
        await pool.query('DELETE FROM timeline WHERE id = ?', [id]);
        return { message: 'Timeline item deleted successfully' };
    }

    async toggleVisibility(id) {
        const item = await this.getById(id);
        if (!item) throw new Error('Timeline item not found');

        const newVisibility = !item.isVisible;

        await pool.query(
            'UPDATE timeline SET isVisible = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [newVisibility, id]
        );

        return { id, isVisible: newVisibility };
    }
}

module.exports = new TimelineService();
