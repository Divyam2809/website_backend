const { pool } = require('../config/db');

class TeamService {
    async getAll() {
        const [rows] = await pool.query('SELECT * FROM team ORDER BY sort_order ASC, created_at DESC');
        return rows;
    }

    async getById(id) {
        const [rows] = await pool.query('SELECT * FROM team WHERE id = ?', [id]);
        return rows[0];
    }

    async create(data) {
        const { name, slug, status, position, bio, email, phone, linkedin, image, sort_order, isVisible, metaTitle, metaDescription, metaKeywords } = data;

        const sql = `
            INSERT INTO team (name, slug, status, position, bio, email, phone, linkedin, image, sort_order, isVisible, metaTitle, metaDescription, metaKeywords)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await pool.query(sql, [
            name,
            slug,
            status || 'Published',
            position,
            bio,
            email,
            phone,
            linkedin,
            image,
            sort_order || 0,
            isVisible !== undefined ? isVisible : true,
            metaTitle,
            metaDescription,
            metaKeywords
        ]);

        return { id: result.insertId, ...data };
    }

    async update(id, data) {
        const { name, slug, status, position, bio, email, phone, linkedin, image, sort_order, isVisible, metaTitle, metaDescription, metaKeywords } = data;

        const sql = `
            UPDATE team 
            SET name = ?, slug = ?, status = ?, position = ?, bio = ?, email = ?, phone = ?, linkedin = ?, 
                image = ?, sort_order = ?, isVisible = ?, metaTitle = ?, metaDescription = ?, metaKeywords = ?, 
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

        await pool.query(sql, [
            name,
            slug,
            status,
            position,
            bio,
            email,
            phone,
            linkedin,
            image,
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
        await pool.query('DELETE FROM team WHERE id = ?', [id]);
        return { message: 'Team member deleted successfully' };
    }

    async toggleVisibility(id) {
        const member = await this.getById(id);
        if (!member) throw new Error('Team member not found');

        const newVisibility = !member.isVisible;

        await pool.query(
            'UPDATE team SET isVisible = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [newVisibility, id]
        );

        return { id, isVisible: newVisibility };
    }
}

module.exports = new TeamService();
