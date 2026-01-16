const { pool } = require('../config/db');

class BlogService {
    async getAll() {
        const [rows] = await pool.query('SELECT * FROM blogs ORDER BY created_at DESC');
        return rows;
    }

    async getById(id) {
        const [rows] = await pool.query('SELECT * FROM blogs WHERE id = ?', [id]);
        return rows[0];
    }

    async getBySlug(slug) {
        const [rows] = await pool.query('SELECT * FROM blogs WHERE slug = ?', [slug]);
        return rows[0];
    }

    async create(data) {
        try {
            const { title, slug, author, publishDate, readTime, category, excerpt, status, isVisible, image, content } = data;

            console.log('Creating blog with data:', { title, slug, status, isVisible });

            const sql = `
                INSERT INTO blogs (title, slug, author, publishDate, readTime, category, excerpt, status, isVisible, image, content)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const [result] = await pool.query(sql, [
                title || '',
                slug || '',
                author ? JSON.stringify(author) : null,
                publishDate || null,
                readTime || null,
                category || '',
                excerpt || '',
                status || 'Draft',
                isVisible !== undefined ? isVisible : true,
                image || null,
                content ? JSON.stringify(content) : '[]'
            ]);

            console.log('Blog created successfully with ID:', result.insertId);
            return { id: result.insertId, ...data };
        } catch (error) {
            console.error('Error creating blog:', error);
            throw error;
        }
    }

    async update(id, data) {
        const { title, slug, author, publishDate, readTime, category, excerpt, status, isVisible, image, content } = data;

        const sql = `
            UPDATE blogs 
            SET title = ?, slug = ?, author = ?, publishDate = ?, readTime = ?, 
                category = ?, excerpt = ?, status = ?, isVisible = ?, image = ?, content = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

        console.log('Update SQL Params:', [title, slug, JSON.stringify(author), id]);

        await pool.query(sql, [
            title,
            slug,
            JSON.stringify(author),
            publishDate,
            readTime,
            category,
            excerpt,
            status,
            isVisible,
            image,
            JSON.stringify(content),
            id
        ]);

        return { id, ...data };
    }

    async delete(id) {
        await pool.query('DELETE FROM blogs WHERE id = ?', [id]);
        return { message: 'Blog deleted successfully' };
    }

    async toggleVisibility(id) {
        const blog = await this.getById(id);
        if (!blog) throw new Error('Blog not found');

        const newVisibility = !blog.isVisible;
        const newStatus = newVisibility ? 'Published' : 'Draft';

        await pool.query(
            'UPDATE blogs SET isVisible = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [newVisibility, newStatus, id]
        );

        return { id, isVisible: newVisibility, status: newStatus };
    }
}

module.exports = new BlogService();
