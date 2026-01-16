const { pool } = require('../config/db');

class CaseStudyService {
    async getAll() {
        const [rows] = await pool.query('SELECT * FROM case_studies ORDER BY created_at DESC');
        return rows;
    }

    async getById(id) {
        const [rows] = await pool.query('SELECT * FROM case_studies WHERE id = ?', [id]);
        return rows[0];
    }

    async getBySlug(slug) {
        const [rows] = await pool.query('SELECT * FROM case_studies WHERE slug = ?', [slug]);
        return rows[0];
    }

    async create(data) {
        const { title, slug, status, date, author, description, image, type, mediaUrl, isVisible, content, metaTitle, metaDescription, metaKeywords } = data;

        const sql = `
            INSERT INTO case_studies (title, slug, status, date, author, description, image, type, mediaUrl, isVisible, content, metaTitle, metaDescription, metaKeywords)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await pool.query(sql, [
            title,
            slug,
            status || 'Draft',
            date,
            author,
            description,
            image,
            type || 'image',
            mediaUrl || '',
            isVisible !== undefined ? isVisible : true,
            JSON.stringify(content),
            metaTitle,
            metaDescription,
            metaKeywords
        ]);

        return { id: result.insertId, ...data };
    }

    async update(id, data) {
        const { title, slug, status, date, author, description, image, type, mediaUrl, isVisible, content, metaTitle, metaDescription, metaKeywords } = data;

        const sql = `
            UPDATE case_studies 
            SET title = ?, slug = ?, status = ?, date = ?, author = ?, description = ?, image = ?, type = ?, 
                mediaUrl = ?, isVisible = ?, content = ?, metaTitle = ?, metaDescription = ?, metaKeywords = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

        await pool.query(sql, [
            title,
            slug,
            status,
            date,
            author,
            description,
            image,
            type,
            mediaUrl,
            isVisible,
            JSON.stringify(content),
            metaTitle,
            metaDescription,
            metaKeywords,
            id
        ]);

        return { id, ...data };
    }

    async delete(id) {
        await pool.query('DELETE FROM case_studies WHERE id = ?', [id]);
        return { message: 'Case study deleted successfully' };
    }

    async toggleVisibility(id) {
        const caseStudy = await this.getById(id);
        if (!caseStudy) throw new Error('Case study not found');

        const newVisibility = !caseStudy.isVisible;

        await pool.query(
            'UPDATE case_studies SET isVisible = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [newVisibility, id]
        );

        return { id, isVisible: newVisibility };
    }
}

module.exports = new CaseStudyService();
