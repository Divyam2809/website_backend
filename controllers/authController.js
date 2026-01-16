const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_change_in_prod';

exports.login = async (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);

        // Log invalid username attempt? Maybe later. For now, focus on user existence.
        if (users.length === 0) {
            await pool.query('INSERT INTO login_logs (username, ip_address, status, details) VALUES (?, ?, ?, ?)',
                [username, ip, 'Failed', 'User not found']
            );
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            await pool.query('INSERT INTO login_logs (user_id, username, role, ip_address, status, details) VALUES (?, ?, ?, ?, ?, ?)',
                [user.id, user.username, user.role, ip, 'Failed', 'Invalid password']
            );
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate Token
        // "Generate a unique session key" -> JWT acts as this key.
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        await pool.query('INSERT INTO login_logs (user_id, username, role, ip_address, status, details) VALUES (?, ?, ?, ?, ?, ?)',
            [user.id, user.username, user.role, ip, 'Success', 'Login successful']
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: 'Server error during login' });
    }
};

exports.createUser = async (req, res) => {
    try {
        const { username, password, role } = req.body;

        if (!username || !password || !role) {
            return res.status(400).json({ error: 'All fields required' });
        }

        const allowedRoles = ['superadmin', 'content_manager', 'sales', 'hr'];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            await pool.query(
                'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
                [username, hashedPassword, role]
            );
            res.status(201).json({ message: 'User created successfully' });
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ error: 'Username already exists' });
            }
            throw err;
        }
    } catch (err) {
        console.error('Create User Error:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const [users] = await pool.query('SELECT id, username, role, created_at FROM users');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getLoginLogs = async (req, res) => {
    try {
        const [logs] = await pool.query('SELECT * FROM login_logs ORDER BY login_time DESC');
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        // Prevent deleting self? Or ensure at least one superadmin remains? 
        // For simplicity:
        await pool.query('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
