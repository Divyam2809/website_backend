const express = require('express');
const router = express.Router();
const industryController = require('../controllers/industryController');

router.get('/industries', industryController.getIndustries);
router.get('/industries/:id', industryController.getIndustry);
router.post('/industries', industryController.createIndustry);
router.put('/industries/:id', industryController.updateIndustry);
router.delete('/industries/:id', industryController.deleteIndustry);
router.patch('/industries/:id/visibility', industryController.toggleVisibility);

module.exports = router;
