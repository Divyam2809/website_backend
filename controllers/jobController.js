const jobService = require('../services/jobService');

// GET all jobs
const getJobs = async (req, res) => {
    try {
        const jobs = await jobService.getAll();
        res.json({
            message: 'success',
            data: jobs
        });
    } catch (err) {
        console.error('Error fetching jobs:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// GET job by ID
const getJobById = async (req, res) => {
    try {
        const { id } = req.params;
        const job = await jobService.getById(id);

        if (job) {
            res.json({
                message: 'success',
                data: job
            });
        } else {
            res.status(404).json({ error: 'Job not found' });
        }
    } catch (err) {
        console.error('Error fetching job:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// POST create job
const createJob = async (req, res) => {
    try {
        const job = await jobService.create(req.body);
        res.json({
            message: 'success',
            data: job
        });
    } catch (err) {
        console.error('Error creating job:', err);
        res.status(400).json({ error: err.message });
    }
};

// PUT update job
const updateJob = async (req, res) => {
    try {
        const { id } = req.params;
        const job = await jobService.update(id, req.body);
        res.json({
            message: 'success',
            data: job
        });
    } catch (err) {
        console.error('Error updating job:', err);
        res.status(400).json({ error: err.message });
    }
};

// DELETE job
const deleteJob = async (req, res) => {
    try {
        const { id } = req.params;
        await jobService.delete(id);
        res.json({ message: 'Job deleted successfully' });
    } catch (err) {
        console.error('Error deleting job:', err);
        res.status(400).json({ error: err.message });
    }
};

// PATCH toggle visibility
const toggleJobVisibility = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await jobService.toggleVisibility(id);
        res.json({
            message: 'success',
            data: result
        });
    } catch (err) {
        console.error('Error toggling job visibility:', err);
        res.status(400).json({ error: err.message });
    }
};

module.exports = {
    getJobs,
    getJobById,
    createJob,
    updateJob,
    deleteJob,
    toggleJobVisibility
};
