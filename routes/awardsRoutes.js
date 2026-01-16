const express = require('express');
const router = express.Router();
const awardsController = require('../controllers/awardsController');

router.get('/awards', awardsController.getAwards);
router.get('/awards/:id', awardsController.getAward);
router.post('/awards', awardsController.createAward);
router.put('/awards/:id', awardsController.updateAward);
router.delete('/awards/:id', awardsController.deleteAward);
router.patch('/awards/:id/visibility', awardsController.toggleAwardVisibility);

module.exports = router;
