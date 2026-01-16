const { pool } = require('../config/db');

class NewsService {
    async getAll() {
        const [rows] = await pool.query('SELECT * FROM news ORDER BY created_at DESC');
        return rows;
    }

    async getById(id) {
        const [rows] = await pool.query('SELECT * FROM news WHERE id = ?', [id]);
        return rows[0];
    }

    async create(data) {
        const { category, date, title, slug, status, excerpt, image, language, content, isVisible, metaTitle, metaDescription, metaKeywords } = data;

        const sql = `
            INSERT INTO news (category, date, title, slug, status, excerpt, image, language, content, isVisible, metaTitle, metaDescription, metaKeywords)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await pool.query(sql, [
            category,
            date,
            title,
            slug,
            status || 'Draft',
            excerpt,
            image,
            language || 'English',
            content,
            isVisible !== undefined ? isVisible : true,
            metaTitle,
            metaDescription,
            metaKeywords
        ]);

        return { id: result.insertId, ...data };
    }

    async update(id, data) {
        const { category, date, title, slug, status, excerpt, image, language, content, isVisible, metaTitle, metaDescription, metaKeywords } = data;

        const sql = `
            UPDATE news 
            SET category = ?, date = ?, title = ?, slug = ?, status = ?, excerpt = ?, image = ?, 
                language = ?, content = ?, isVisible = ?, metaTitle = ?, metaDescription = ?, metaKeywords = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

        await pool.query(sql, [
            category,
            date,
            title,
            slug,
            status,
            excerpt,
            image,
            language,
            content,
            isVisible,
            metaTitle,
            metaDescription,
            metaKeywords,
            id
        ]);

        return { id, ...data };
    }

    async delete(id) {
        await pool.query('DELETE FROM news WHERE id = ?', [id]);
        return { message: 'News deleted successfully' };
    }

    async toggleVisibility(id) {
        const news = await this.getById(id);
        if (!news) throw new Error('News not found');

        const newVisibility = !news.isVisible;

        await pool.query(
            'UPDATE news SET isVisible = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [newVisibility, id]
        );

        return { id, isVisible: newVisibility };
    }
}

module.exports = new NewsService();
