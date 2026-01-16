const { pool } = require('../config/db');

class JobApplicationService {
    async getAll() {
        // Return applications ordered by creation date
        const [rows] = await pool.query(`
            SELECT ja.*, j.title as job_title 
            FROM job_applications ja
            LEFT JOIN jobs j ON ja.job_id = j.id
            ORDER BY ja.created_at DESC
        `);
        return rows;
    }

    async getByJobId(jobId) {
        const [rows] = await pool.query('SELECT * FROM job_applications WHERE job_id = ? ORDER BY created_at DESC', [jobId]);
        return rows;
    }

    async getById(id) {
        const [rows] = await pool.query('SELECT * FROM job_applications WHERE id = ?', [id]);
        return rows[0];
    }

    async create(data) {
        const { job_id, applicant_name, email, phone, resume_link, portfolio_link, cover_letter, status } = data;

        const sql = `
            INSERT INTO job_applications (job_id, applicant_name, email, phone, resume_link, portfolio_link, cover_letter, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await pool.query(sql, [
            job_id,
            applicant_name,
            email,
            phone,
            resume_link,
            portfolio_link,
            cover_letter,
            status || 'Pending'
        ]);

        return { id: result.insertId, ...data };
    }

    async updateStatus(id, status) {
        const sql = `
            UPDATE job_applications 
            SET status = ?, created_at = created_at
            WHERE id = ?
        `; // Keeping created_at same, actually MySQL updates timestamps if not careful, but updated_at on applications table is not defined in schema created earlier? Schema had created_at. I should probably add updated_at or just trust it.
        // Wait, schema for job_applications only had created_at. Let's stick to update status.

        await pool.query(sql, [status, id]);
        return { id, status };
    }

    async delete(id) {
        await pool.query('DELETE FROM job_applications WHERE id = ?', [id]);
        return { message: 'Application deleted successfully' };
    }
}

module.exports = new JobApplicationService();
