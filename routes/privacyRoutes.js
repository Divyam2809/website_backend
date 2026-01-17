const express = require('express');
const router = express.Router();
const privacyController = require('../controllers/privacyController');

// Helper wrapper to catch errors in async routes if not using express-async-handler
// (Controller functions already have try/catch blocks so this is fine)

router.get('/privacy-policy', privacyController.getSections);
router.get('/privacy-policy/:id', privacyController.getSection);
router.post('/privacy-policy', privacyController.createSection);
router.put('/privacy-policy/:id', privacyController.updateSection);
router.delete('/privacy-policy/:id', privacyController.deleteSection);
router.patch('/privacy-policy/:id/visibility', privacyController.toggleVisibility);

module.exports = router;
