const { pool } = require('../config/db');

class TestimonialService {
    async getAll() {
        // Order by created_at DESC
        const [rows] = await pool.query('SELECT * FROM testimonials ORDER BY created_at DESC');
        return rows;
    }

    async getById(id) {
        const [rows] = await pool.query('SELECT * FROM testimonials WHERE id = ?', [id]);
        return rows[0];
    }

    async create(data) {
        const { name, slug, status, position, testimonial, rating, image, projectType, isVisible, metaTitle, metaDescription, metaKeywords } = data;

        const sql = `
            INSERT INTO testimonials (name, slug, status, position, testimonial, rating, image, projectType, isVisible, metaTitle, metaDescription, metaKeywords)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await pool.query(sql, [
            name,
            slug,
            status || 'Published',
            position,
            testimonial,
            rating || 5,
            image,
            projectType,
            isVisible !== undefined ? isVisible : true,
            metaTitle,
            metaDescription,
            metaKeywords
        ]);

        return { id: result.insertId, ...data };
    }

    async update(id, data) {
        const { name, slug, status, position, testimonial, rating, image, projectType, isVisible, metaTitle, metaDescription, metaKeywords } = data;

        const sql = `
            UPDATE testimonials 
            SET name = ?, slug = ?, status = ?, position = ?, testimonial = ?, rating = ?, image = ?, 
                projectType = ?, isVisible = ?, metaTitle = ?, metaDescription = ?, metaKeywords = ?, 
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

        await pool.query(sql, [
            name,
            slug,
            status,
            position,
            testimonial,
            rating,
            image,
            projectType,
            isVisible,
            metaTitle,
            metaDescription,
            metaKeywords,
            id
        ]);

        return { id, ...data };
    }

    async delete(id) {
        await pool.query('DELETE FROM testimonials WHERE id = ?', [id]);
        return { message: 'Testimonial deleted successfully' };
    }

    async toggleVisibility(id) {
        const item = await this.getById(id);
        if (!item) throw new Error('Testimonial not found');

        const newVisibility = !item.isVisible;

        await pool.query(
            'UPDATE testimonials SET isVisible = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [newVisibility, id]
        );

        return { id, isVisible: newVisibility };
    }
}

module.exports = new TestimonialService();
