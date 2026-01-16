const { pool } = require('../config/db');

class AwardsService {
    async getAll() {
        const [rows] = await pool.query('SELECT * FROM awards ORDER BY created_at DESC');
        return rows;
    }

    async getById(id) {
        const [rows] = await pool.query('SELECT * FROM awards WHERE id = ?', [id]);
        return rows[0];
    }

    async create(data) {
        const { title, slug, organization, awardLevel, prize, image, status, description, date, isVisible, metaTitle, metaDescription, metaKeywords } = data;

        const sql = `
            INSERT INTO awards (title, slug, organization, awardLevel, prize, image, status, description, date, isVisible, metaTitle, metaDescription, metaKeywords)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await pool.query(sql, [
            title,
            slug,
            organization,
            awardLevel,
            prize,
            image,
            status || 'Published',
            description,
            date,
            isVisible !== undefined ? isVisible : true,
            metaTitle,
            metaDescription,
            metaKeywords
        ]);

        return { id: result.insertId, ...data };
    }

    async update(id, data) {
        const { title, slug, organization, awardLevel, prize, image, status, description, date, isVisible, metaTitle, metaDescription, metaKeywords } = data;

        const sql = `
            UPDATE awards 
            SET title = ?, slug = ?, organization = ?, awardLevel = ?, prize = ?, image = ?, 
                status = ?, description = ?, date = ?, isVisible = ?, 
                metaTitle = ?, metaDescription = ?, metaKeywords = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

        await pool.query(sql, [
            title,
            slug,
            organization,
            awardLevel,
            prize,
            image,
            status,
            description,
            date,
            isVisible,
            metaTitle,
            metaDescription,
            metaKeywords,
            id
        ]);

        return { id, ...data };
    }

    async delete(id) {
        await pool.query('DELETE FROM awards WHERE id = ?', [id]);
        return { message: 'Award deleted successfully' };
    }

    async toggleVisibility(id) {
        const award = await this.getById(id);
        if (!award) throw new Error('Award not found');

        const newVisibility = !award.isVisible;

        await pool.query(
            'UPDATE awards SET isVisible = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [newVisibility, id]
        );

        return { id, isVisible: newVisibility };
    }
}

module.exports = new AwardsService();
