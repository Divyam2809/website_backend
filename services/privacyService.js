const { pool } = require('../config/db');

class PrivacyService {
    async getAll() {
        const [rows] = await pool.query('SELECT * FROM privacy_sections ORDER BY sort_order ASC, created_at DESC');
        return rows;
    }

    async getById(id) {
        const [rows] = await pool.query('SELECT * FROM privacy_sections WHERE id = ?', [id]);
        return rows[0];
    }

    async create(data) {
        const { title, icon, content, status, isVisible, sort_order } = data;

        const sql = `
            INSERT INTO privacy_sections (title, icon, content, status, isVisible, sort_order)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        // Ensure content is stringified JSON if it's an object/array
        const contentVal = typeof content === 'object' ? JSON.stringify(content) : content;

        const [result] = await pool.query(sql, [
            title,
            icon || 'doc',
            contentVal,
            status || 'Published',
            isVisible !== undefined ? isVisible : true,
            sort_order || 0
        ]);

        return { id: result.insertId, ...data };
    }

    async update(id, data) {
        const { title, icon, content, status, isVisible, sort_order } = data;

        const sql = `
            UPDATE privacy_sections 
            SET title = ?, icon = ?, content = ?, status = ?, isVisible = ?, sort_order = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

        const contentVal = typeof content === 'object' ? JSON.stringify(content) : content;

        await pool.query(sql, [
            title,
            icon,
            contentVal,
            status,
            isVisible,
            sort_order,
            id
        ]);

        return { id, ...data };
    }

    async delete(id) {
        await pool.query('DELETE FROM privacy_sections WHERE id = ?', [id]);
        return { message: 'Section deleted successfully' };
    }

    async toggleVisibility(id) {
        const item = await this.getById(id);
        if (!item) throw new Error('Section not found');

        const newVisibility = !item.isVisible;

        await pool.query(
            'UPDATE privacy_sections SET isVisible = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [newVisibility, id]
        );

        return { id, isVisible: newVisibility };
    }
}

module.exports = new PrivacyService();
