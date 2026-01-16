const express = require('express');
const router = express.Router();
const controller = require('../controllers/employeeTestimonialController');

router.get('/', controller.getAll);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);
router.patch('/:id/visibility', controller.toggleVisibility);

module.exports = router;
