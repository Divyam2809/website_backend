const express = require('express');
const router = express.Router();
const careersGalleryController = require('../controllers/careersGalleryController');

router.get('/careers-gallery', careersGalleryController.getAll);
router.post('/careers-gallery', careersGalleryController.create);
router.put('/careers-gallery/:id', careersGalleryController.update);
router.delete('/careers-gallery/:id', careersGalleryController.delete);
router.patch('/careers-gallery/:id/visibility', careersGalleryController.toggleVisibility);

module.exports = router;
