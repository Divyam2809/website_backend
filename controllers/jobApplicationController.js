const jobApplicationService = require('../services/jobApplicationService');

// GET all applications
const getApplications = async (req, res) => {
    try {
        const applications = await jobApplicationService.getAll();
        res.json({
            message: 'success',
            data: applications
        });
    } catch (err) {
        console.error('Error fetching applications:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// GET applications for a specific job
const getApplicationsByJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const applications = await jobApplicationService.getByJobId(jobId);
        res.json({
            message: 'success',
            data: applications
        });
    } catch (err) {
        console.error('Error fetching job applications:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// POST create application
const createApplication = async (req, res) => {
    try {
        const application = await jobApplicationService.create(req.body);
        res.json({
            message: 'success',
            data: application
        });
    } catch (err) {
        console.error('Error creating application:', err);
        res.status(400).json({ error: err.message });
    }
};

// PUT update status
const updateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const result = await jobApplicationService.updateStatus(id, status);
        res.json({
            message: 'success',
            data: result
        });
    } catch (err) {
        console.error('Error updating application status:', err);
        res.status(400).json({ error: err.message });
    }
};

// DELETE application
const deleteApplication = async (req, res) => {
    try {
        const { id } = req.params;
        await jobApplicationService.delete(id);
        res.json({ message: 'Application deleted successfully' });
    } catch (err) {
        console.error('Error deleting application:', err);
        res.status(400).json({ error: err.message });
    }
};

module.exports = {
    getApplications,
    getApplicationsByJob,
    createApplication,
    updateApplicationStatus,
    deleteApplication
};
