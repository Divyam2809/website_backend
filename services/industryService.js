const { pool } = require('../config/db');

class IndustryService {
    async getAll() {
        const [rows] = await pool.query('SELECT * FROM industries ORDER BY sort_order ASC, created_at ASC');
        return rows;
    }

    async getById(id) {
        const [rows] = await pool.query('SELECT * FROM industries WHERE id = ?', [id]);
        return rows[0];
    }

    async create(data) {
        const {
            title, slug, summary, impact, details, modalTitle, fullSummary,
            targetAudience, problemsSolved, useCases, statsString, tags, image,
            status, isVisible, sort_order
        } = data;

        const sql = `
            INSERT INTO industries (
                title, slug, summary, impact, details, modalTitle, fullSummary, 
                targetAudience, problemsSolved, useCases, statsString, tags, image, 
                status, isVisible, sort_order
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await pool.query(sql, [
            title, slug, summary, impact, details, modalTitle, fullSummary,
            targetAudience, problemsSolved, useCases, statsString, tags, image,
            status || 'Published', isVisible !== undefined ? isVisible : true, sort_order || 0
        ]);

        return { id: result.insertId, ...data };
    }

    async update(id, data) {
        const {
            title, slug, summary, impact, details, modalTitle, fullSummary,
            targetAudience, problemsSolved, useCases, statsString, tags, image,
            status, isVisible, sort_order
        } = data;

        const sql = `
            UPDATE industries 
            SET title = ?, slug = ?, summary = ?, impact = ?, details = ?, 
                modalTitle = ?, fullSummary = ?, targetAudience = ?, problemsSolved = ?, 
                useCases = ?, statsString = ?, tags = ?, image = ?, 
                status = ?, isVisible = ?, sort_order = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

        await pool.query(sql, [
            title, slug, summary, impact, details, modalTitle, fullSummary,
            targetAudience, problemsSolved, useCases, statsString, tags, image,
            status, isVisible, sort_order, id
        ]);

        return { id, ...data };
    }

    async delete(id) {
        await pool.query('DELETE FROM industries WHERE id = ?', [id]);
        return { message: 'Industry deleted successfully' };
    }

    async toggleVisibility(id) {
        const item = await this.getById(id);
        if (!item) throw new Error('Industry not found');

        const newVisibility = !item.isVisible;

        await pool.query(
            'UPDATE industries SET isVisible = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [newVisibility, id]
        );

        return { id, isVisible: newVisibility };
    }
}

module.exports = new IndustryService();
