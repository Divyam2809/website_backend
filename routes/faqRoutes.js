const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');

router.get('/faqs', faqController.getFaqs);
router.get('/faqs/:id', faqController.getFaq);
router.post('/faqs', faqController.createFaq);
router.put('/faqs/:id', faqController.updateFaq);
router.delete('/faqs/:id', faqController.deleteFaq);
router.patch('/faqs/:id/visibility', faqController.toggleFaqVisibility);

module.exports = router;
