const privacyService = require('../services/privacyService');

// GET all
const getSections = async (req, res) => {
    try {
        const items = await privacyService.getAll();
        res.json({
            message: 'success',
            data: items
        });
    } catch (err) {
        console.error('Error fetching privacy sections:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// GET single
const getSection = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await privacyService.getById(id);
        if (item) {
            res.json({
                message: 'success',
                data: item
            });
        } else {
            res.status(404).json({ error: 'Section not found' });
        }
    } catch (err) {
        console.error('Error fetching privacy section:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// POST create
const createSection = async (req, res) => {
    try {
        const item = await privacyService.create(req.body);
        res.json({
            message: 'success',
            data: item
        });
    } catch (err) {
        console.error('Error creating privacy section:', err);
        res.status(400).json({ error: err.message });
    }
};

// PUT update
const updateSection = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await privacyService.update(id, req.body);
        res.json({
            message: 'success',
            data: item
        });
    } catch (err) {
        console.error('Error updating privacy section:', err);
        res.status(400).json({ error: err.message });
    }
};

// DELETE
const deleteSection = async (req, res) => {
    try {
        const { id } = req.params;
        await privacyService.delete(id);
        res.json({ message: 'Section deleted successfully' });
    } catch (err) {
        console.error('Error deleting privacy section:', err);
        res.status(400).json({ error: err.message });
    }
};

// PATCH toggle visibility
const toggleVisibility = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await privacyService.toggleVisibility(id);
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
    getSections,
    getSection,
    createSection,
    updateSection,
    deleteSection,
    toggleVisibility
};
