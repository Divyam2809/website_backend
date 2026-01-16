const express = require('express');
const router = express.Router();
const dataStripController = require('../controllers/dataStripController');

router.get('/data-strip', dataStripController.getDataStripConfig);
router.post('/data-strip', dataStripController.updateDataStripConfig);

module.exports = router;
