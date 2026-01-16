const testimonialService = require('../services/testimonialService');

// GET all
const getTestimonials = async (req, res) => {
    try {
        const items = await testimonialService.getAll();
        res.json({
            message: 'success',
            data: items
        });
    } catch (err) {
        console.error('Error fetching testimonials:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// GET single
const getTestimonial = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await testimonialService.getById(id);
        if (item) {
            res.json({
                message: 'success',
                data: item
            });
        } else {
            res.status(404).json({ error: 'Testimonial not found' });
        }
    } catch (err) {
        console.error('Error fetching testimonial:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// POST create
const createTestimonial = async (req, res) => {
    try {
        const item = await testimonialService.create(req.body);
        res.json({
            message: 'success',
            data: item
        });
    } catch (err) {
        console.error('Error creating testimonial:', err);
        res.status(400).json({ error: err.message });
    }
};

// PUT update
const updateTestimonial = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await testimonialService.update(id, req.body);
        res.json({
            message: 'success',
            data: item
        });
    } catch (err) {
        console.error('Error updating testimonial:', err);
        res.status(400).json({ error: err.message });
    }
};

// DELETE
const deleteTestimonial = async (req, res) => {
    try {
        const { id } = req.params;
        await testimonialService.delete(id);
        res.json({ message: 'Testimonial deleted successfully' });
    } catch (err) {
        console.error('Error deleting testimonial:', err);
        res.status(400).json({ error: err.message });
    }
};

// PATCH toggle visibility
const toggleTestimonialVisibility = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await testimonialService.toggleVisibility(id);
        res.json({
            message: 'success',
            data: result
        });
    } catch (err) {
        console.error('Error toggling testimonial visibility:', err);
        res.status(400).json({ error: err.message });
    }
};

module.exports = {
    getTestimonials,
    getTestimonial,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
    toggleTestimonialVisibility
};
