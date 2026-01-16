const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Public
router.post('/login', authController.login);

// Protected Users Management (SuperAdmin only)
// Protected Users Management (SuperAdmin only)
router.post('/users', authenticateToken, authorizeRoles('superadmin'), authController.createUser);
router.get('/users', authenticateToken, authorizeRoles('superadmin'), authController.getUsers);
router.delete('/users/:id', authenticateToken, authorizeRoles('superadmin'), authController.deleteUser);
router.get('/logs', authenticateToken, authorizeRoles('superadmin'), authController.getLoginLogs);

// Validate Session
router.get('/me', authenticateToken, (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;
