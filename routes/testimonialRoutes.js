const express = require('express');
const router = express.Router();
const testimonialController = require('../controllers/testimonialController');

router.get('/testimonials', testimonialController.getTestimonials);
router.get('/testimonials/:id', testimonialController.getTestimonial);
router.post('/testimonials', testimonialController.createTestimonial);
router.put('/testimonials/:id', testimonialController.updateTestimonial);
router.delete('/testimonials/:id', testimonialController.deleteTestimonial);
router.patch('/testimonials/:id/visibility', testimonialController.toggleTestimonialVisibility);

module.exports = router;
