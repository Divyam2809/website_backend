const timelineService = require('../services/timelineService');

// GET all
const getTimeline = async (req, res) => {
    try {
        const items = await timelineService.getAll();
        res.json({
            message: 'success',
            data: items
        });
    } catch (err) {
        console.error('Error fetching timeline:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// GET single
const getTimelineItem = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await timelineService.getById(id);
        if (item) {
            res.json({
                message: 'success',
                data: item
            });
        } else {
            res.status(404).json({ error: 'Timeline item not found' });
        }
    } catch (err) {
        console.error('Error fetching timeline item:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// POST create
const createTimelineItem = async (req, res) => {
    try {
        const item = await timelineService.create(req.body);
        res.json({
            message: 'success',
            data: item
        });
    } catch (err) {
        console.error('Error creating timeline item:', err);
        res.status(400).json({ error: err.message });
    }
};

// PUT update
const updateTimelineItem = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await timelineService.update(id, req.body);
        res.json({
            message: 'success',
            data: item
        });
    } catch (err) {
        console.error('Error updating timeline item:', err);
        res.status(400).json({ error: err.message });
    }
};

// DELETE
const deleteTimelineItem = async (req, res) => {
    try {
        const { id } = req.params;
        await timelineService.delete(id);
        res.json({ message: 'Timeline item deleted successfully' });
    } catch (err) {
        console.error('Error deleting timeline item:', err);
        res.status(400).json({ error: err.message });
    }
};

// PATCH toggle visibility
const toggleTimelineVisibility = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await timelineService.toggleVisibility(id);
        res.json({
            message: 'success',
            data: result
        });
    } catch (err) {
        console.error('Error toggling timeline visibility:', err);
        res.status(400).json({ error: err.message });
    }
};

module.exports = {
    getTimeline,
    getTimelineItem,
    createTimelineItem,
    updateTimelineItem,
    deleteTimelineItem,
    toggleTimelineVisibility
};
