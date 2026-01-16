const caseStudyService = require('../services/caseStudyService');

// GET all case studies
const getCaseStudies = async (req, res) => {
    try {
        const caseStudies = await caseStudyService.getAll();
        res.json({
            message: 'success',
            data: caseStudies
        });
    } catch (err) {
        console.error('Error fetching case studies:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// GET single case study by ID or slug
const getCaseStudy = async (req, res) => {
    try {
        const { id } = req.params;
        let caseStudy;

        // Try to get by ID first, then by slug
        if (!isNaN(id)) {
            caseStudy = await caseStudyService.getById(id);
        }

        if (!caseStudy) {
            caseStudy = await caseStudyService.getBySlug(id);
        }

        if (caseStudy) {
            res.json({
                message: 'success',
                data: caseStudy
            });
        } else {
            res.status(404).json({ error: 'Case study not found' });
        }
    } catch (err) {
        console.error('Error fetching case study:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// POST create new case study
const createCaseStudy = async (req, res) => {
    try {
        const caseStudy = await caseStudyService.create(req.body);
        res.json({
            message: 'success',
            data: caseStudy
        });
    } catch (err) {
        console.error('Error creating case study:', err);
        res.status(400).json({ error: err.message });
    }
};

// PUT update case study
const updateCaseStudy = async (req, res) => {
    try {
        const { id } = req.params;
        const caseStudy = await caseStudyService.update(id, req.body);
        res.json({
            message: 'success',
            data: caseStudy
        });
    } catch (err) {
        console.error('Error updating case study:', err);
        res.status(400).json({ error: err.message });
    }
};

// DELETE case study
const deleteCaseStudy = async (req, res) => {
    try {
        const { id } = req.params;
        await caseStudyService.delete(id);
        res.json({ message: 'Case study deleted successfully' });
    } catch (err) {
        console.error('Error deleting case study:', err);
        res.status(400).json({ error: err.message });
    }
};

// PATCH toggle visibility
const toggleCaseStudyVisibility = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await caseStudyService.toggleVisibility(id);
        res.json({
            message: 'success',
            data: result
        });
    } catch (err) {
        console.error('Error toggling case study visibility:', err);
        res.status(400).json({ error: err.message });
    }
};

module.exports = {
    getCaseStudies,
    getCaseStudy,
    createCaseStudy,
    updateCaseStudy,
    deleteCaseStudy,
    toggleCaseStudyVisibility
};
