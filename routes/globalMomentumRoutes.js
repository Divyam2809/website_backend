const express = require('express');
const router = express.Router();
const globalMomentumController = require('../controllers/globalMomentumController');

router.get('/', globalMomentumController.getGlobalMomentumConfig);
router.post('/', globalMomentumController.updateGlobalMomentumConfig);

module.exports = router;
