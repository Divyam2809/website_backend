const { pool } = require('../config/db');

class FaqService {
    async getAll() {
        // Order by sort_order ASC, then created_at DESC
        const [rows] = await pool.query('SELECT * FROM faqs ORDER BY sort_order ASC, created_at DESC');
        return rows;
    }

    async getById(id) {
        const [rows] = await pool.query('SELECT * FROM faqs WHERE id = ?', [id]);
        return rows[0];
    }

    async create(data) {
        const { question, slug, status, answer, category, sort_order, isVisible, metaTitle, metaDescription, metaKeywords } = data;

        const sql = `
            INSERT INTO faqs (question, slug, status, answer, category, sort_order, isVisible, metaTitle, metaDescription, metaKeywords)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await pool.query(sql, [
            question,
            slug,
            status || 'Published',
            answer,
            category,
            sort_order || 0,
            isVisible !== undefined ? isVisible : true,
            metaTitle,
            metaDescription,
            metaKeywords
        ]);

        return { id: result.insertId, ...data };
    }

    async update(id, data) {
        const { question, slug, status, answer, category, sort_order, isVisible, metaTitle, metaDescription, metaKeywords } = data;

        const sql = `
            UPDATE faqs 
            SET question = ?, slug = ?, status = ?, answer = ?, category = ?, sort_order = ?, 
                isVisible = ?, metaTitle = ?, metaDescription = ?, metaKeywords = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

        await pool.query(sql, [
            question,
            slug,
            status,
            answer,
            category,
            sort_order,
            isVisible,
            metaTitle,
            metaDescription,
            metaKeywords,
            id
        ]);

        return { id, ...data };
    }

    async delete(id) {
        await pool.query('DELETE FROM faqs WHERE id = ?', [id]);
        return { message: 'FAQ deleted successfully' };
    }

    async toggleVisibility(id) {
        const faq = await this.getById(id);
        if (!faq) throw new Error('FAQ not found');

        const newVisibility = !faq.isVisible;

        await pool.query(
            'UPDATE faqs SET isVisible = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [newVisibility, id]
        );

        return { id, isVisible: newVisibility };
    }
}

module.exports = new FaqService();
