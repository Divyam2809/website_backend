const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const jobApplicationController = require('../controllers/jobApplicationController');

// --- Jobs Routes ---
router.get('/jobs', jobController.getJobs);
router.get('/jobs/:id', jobController.getJobById);
router.post('/jobs', jobController.createJob);
router.put('/jobs/:id', jobController.updateJob);
router.delete('/jobs/:id', jobController.deleteJob);
router.patch('/jobs/:id/visibility', jobController.toggleJobVisibility);

// --- Job Applications Routes ---
router.get('/job-applications', jobApplicationController.getApplications);
router.get('/jobs/:jobId/applications', jobApplicationController.getApplicationsByJob);
router.post('/job-applications', jobApplicationController.createApplication);
router.put('/job-applications/:id/status', jobApplicationController.updateApplicationStatus);
router.delete('/job-applications/:id', jobApplicationController.deleteApplication);

module.exports = router;
