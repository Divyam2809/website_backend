const express = require('express');
const router = express.Router();
const caseStudyController = require('../controllers/caseStudyController');

router.get('/case-studies', caseStudyController.getCaseStudies);
router.get('/case-studies/:id', caseStudyController.getCaseStudy);
router.post('/case-studies', caseStudyController.createCaseStudy);
router.put('/case-studies/:id', caseStudyController.updateCaseStudy);
router.delete('/case-studies/:id', caseStudyController.deleteCaseStudy);
router.patch('/case-studies/:id/visibility', caseStudyController.toggleCaseStudyVisibility);

module.exports = router;
