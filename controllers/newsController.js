const newsService = require('../services/newsService');

// GET all news
const getNews = async (req, res) => {
    try {
        const news = await newsService.getAll();
        res.json({
            message: 'success',
            data: news
        });
    } catch (err) {
        console.error('Error fetching news:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// GET single news by ID
const getNewsById = async (req, res) => {
    try {
        const { id } = req.params;
        const news = await newsService.getById(id);

        if (news) {
            res.json({
                message: 'success',
                data: news
            });
        } else {
            res.status(404).json({ error: 'News not found' });
        }
    } catch (err) {
        console.error('Error fetching news:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// POST create new news
const createNews = async (req, res) => {
    try {
        const news = await newsService.create(req.body);
        res.json({
            message: 'success',
            data: news
        });
    } catch (err) {
        console.error('Error creating news:', err);
        res.status(400).json({ error: err.message });
    }
};

// PUT update news
const updateNews = async (req, res) => {
    try {
        const { id } = req.params;
        const news = await newsService.update(id, req.body);
        res.json({
            message: 'success',
            data: news
        });
    } catch (err) {
        console.error('Error updating news:', err);
        res.status(400).json({ error: err.message });
    }
};

// DELETE news
const deleteNews = async (req, res) => {
    try {
        const { id } = req.params;
        await newsService.delete(id);
        res.json({ message: 'News deleted successfully' });
    } catch (err) {
        console.error('Error deleting news:', err);
        res.status(400).json({ error: err.message });
    }
};

// PATCH toggle visibility
const toggleNewsVisibility = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await newsService.toggleVisibility(id);
        res.json({
            message: 'success',
            data: result
        });
    } catch (err) {
        console.error('Error toggling news visibility:', err);
        res.status(400).json({ error: err.message });
    }
};

module.exports = {
    getNews,
    getNewsById,
    createNews,
    updateNews,
    deleteNews,
    toggleNewsVisibility
};
