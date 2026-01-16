const faqService = require('../services/faqService');

// GET all faqs
const getFaqs = async (req, res) => {
    try {
        const faqs = await faqService.getAll();
        res.json({
            message: 'success',
            data: faqs
        });
    } catch (err) {
        console.error('Error fetching faqs:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// GET single faq
const getFaq = async (req, res) => {
    try {
        const { id } = req.params;
        const faq = await faqService.getById(id);
        if (faq) {
            res.json({
                message: 'success',
                data: faq
            });
        } else {
            res.status(404).json({ error: 'FAQ not found' });
        }
    } catch (err) {
        console.error('Error fetching faq:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// POST create faq
const createFaq = async (req, res) => {
    try {
        const faq = await faqService.create(req.body);
        res.json({
            message: 'success',
            data: faq
        });
    } catch (err) {
        console.error('Error creating faq:', err);
        res.status(400).json({ error: err.message });
    }
};

// PUT update faq
const updateFaq = async (req, res) => {
    try {
        const { id } = req.params;
        const faq = await faqService.update(id, req.body);
        res.json({
            message: 'success',
            data: faq
        });
    } catch (err) {
        console.error('Error updating faq:', err);
        res.status(400).json({ error: err.message });
    }
};

// DELETE faq
const deleteFaq = async (req, res) => {
    try {
        const { id } = req.params;
        await faqService.delete(id);
        res.json({ message: 'FAQ deleted successfully' });
    } catch (err) {
        console.error('Error deleting faq:', err);
        res.status(400).json({ error: err.message });
    }
};

// PATCH toggle visibility
const toggleFaqVisibility = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await faqService.toggleVisibility(id);
        res.json({
            message: 'success',
            data: result
        });
    } catch (err) {
        console.error('Error toggling faq visibility:', err);
        res.status(400).json({ error: err.message });
    }
};

module.exports = {
    getFaqs,
    getFaq,
    createFaq,
    updateFaq,
    deleteFaq,
    toggleFaqVisibility
};
