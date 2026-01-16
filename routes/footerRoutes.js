const express = require('express');
const router = express.Router();
const footerController = require('../controllers/footerController');

router.get('/footer', footerController.getFooterConfig);
router.post('/footer', footerController.updateFooterConfig);

module.exports = router;
