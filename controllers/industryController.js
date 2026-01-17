const industryService = require('../services/industryService');

// GET all
const getIndustries = async (req, res) => {
    try {
        const items = await industryService.getAll();
        res.json({
            message: 'success',
            data: items
        });
    } catch (err) {
        console.error('Error fetching industries:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// GET single
const getIndustry = async (req, res) => {
    try {
        const { id } = req.params;
        // If ID is numeric, use getById. If it's a string, it might be a slug or we need to handle it.
        // Assuming ID is numeric from API calls usually.
        // But frontend might call with slug if needed. For admin edit, we use ID.
        const item = await industryService.getById(id);
        if (item) {
            res.json({
                message: 'success',
                data: item
            });
        } else {
            res.status(404).json({ error: 'Industry not found' });
        }
    } catch (err) {
        console.error('Error fetching industry:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// POST create
const createIndustry = async (req, res) => {
    try {
        const item = await industryService.create(req.body);
        res.json({
            message: 'success',
            data: item
        });
    } catch (err) {
        console.error('Error creating industry:', err);
        res.status(400).json({ error: err.message });
    }
};

// PUT update
const updateIndustry = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await industryService.update(id, req.body);
        res.json({
            message: 'success',
            data: item
        });
    } catch (err) {
        console.error('Error updating industry:', err);
        res.status(400).json({ error: err.message });
    }
};

// DELETE
const deleteIndustry = async (req, res) => {
    try {
        const { id } = req.params;
        await industryService.delete(id);
        res.json({ message: 'Industry deleted successfully' });
    } catch (err) {
        console.error('Error deleting industry:', err);
        res.status(400).json({ error: err.message });
    }
};

// PATCH toggle visibility
const toggleVisibility = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await industryService.toggleVisibility(id);
        res.json({
            message: 'success',
            data: result
        });
    } catch (err) {
        console.error('Error toggling visibility:', err);
        res.status(400).json({ error: err.message });
    }
};

module.exports = {
    getIndustries,
    getIndustry,
    createIndustry,
    updateIndustry,
    deleteIndustry,
    toggleVisibility
};
