const awardsService = require('../services/awardsService');

// GET all awards
const getAwards = async (req, res) => {
    try {
        const awards = await awardsService.getAll();
        res.json({
            message: 'success',
            data: awards
        });
    } catch (err) {
        console.error('Error fetching awards:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// GET single award
const getAward = async (req, res) => {
    try {
        const { id } = req.params;
        const award = await awardsService.getById(id);
        if (award) {
            res.json({
                message: 'success',
                data: award
            });
        } else {
            res.status(404).json({ error: 'Award not found' });
        }
    } catch (err) {
        console.error('Error fetching award:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// POST create award
const createAward = async (req, res) => {
    try {
        const award = await awardsService.create(req.body);
        res.json({
            message: 'success',
            data: award
        });
    } catch (err) {
        console.error('Error creating award:', err);
        res.status(400).json({ error: err.message });
    }
};

// PUT update award
const updateAward = async (req, res) => {
    try {
        const { id } = req.params;
        const award = await awardsService.update(id, req.body);
        res.json({
            message: 'success',
            data: award
        });
    } catch (err) {
        console.error('Error updating award:', err);
        res.status(400).json({ error: err.message });
    }
};

// DELETE award
const deleteAward = async (req, res) => {
    try {
        const { id } = req.params;
        await awardsService.delete(id);
        res.json({ message: 'Award deleted successfully' });
    } catch (err) {
        console.error('Error deleting award:', err);
        res.status(400).json({ error: err.message });
    }
};

// PATCH toggle visibility
const toggleAwardVisibility = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await awardsService.toggleVisibility(id);
        res.json({
            message: 'success',
            data: result
        });
    } catch (err) {
        console.error('Error toggling award visibility:', err);
        res.status(400).json({ error: err.message });
    }
};

module.exports = {
    getAwards,
    getAward,
    createAward,
    updateAward,
    deleteAward,
    toggleAwardVisibility
};
