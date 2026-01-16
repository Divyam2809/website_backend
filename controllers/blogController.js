const blogService = require('../services/blogService');

// GET all blogs
const getBlogs = async (req, res) => {
    try {
        const blogs = await blogService.getAll();
        res.json({
            message: 'success',
            data: blogs
        });
    } catch (err) {
        console.error('Error fetching blogs:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// GET single blog by ID or slug
const getBlog = async (req, res) => {
    try {
        const { id } = req.params;
        let blog;

        // Try to get by ID first, then by slug
        if (!isNaN(id)) {
            blog = await blogService.getById(id);
        }

        if (!blog) {
            blog = await blogService.getBySlug(id);
        }

        if (blog) {
            res.json({
                message: 'success',
                data: blog
            });
        } else {
            res.status(404).json({ error: 'Blog not found' });
        }
    } catch (err) {
        console.error('Error fetching blog:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// POST create new blog
const createBlog = async (req, res) => {
    try {
        console.log('Received blog creation request:', req.body);
        const blog = await blogService.create(req.body);
        res.json({
            message: 'success',
            data: blog
        });
    } catch (err) {
        console.error('Error creating blog:', err);
        res.status(400).json({ error: err.message });
    }
};

// PUT update blog
const updateBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await blogService.update(id, req.body);
        res.json({
            message: 'success',
            data: blog
        });
    } catch (err) {
        console.error('Error updating blog:', err);
        res.status(400).json({ error: err.message });
    }
};

// DELETE blog
const deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;
        await blogService.delete(id);
        res.json({ message: 'Blog deleted successfully' });
    } catch (err) {
        console.error('Error deleting blog:', err);
        res.status(400).json({ error: err.message });
    }
};

// PATCH toggle visibility
const toggleBlogVisibility = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await blogService.toggleVisibility(id);
        res.json({
            message: 'success',
            data: result
        });
    } catch (err) {
        console.error('Error toggling blog visibility:', err);
        res.status(400).json({ error: err.message });
    }
};

module.exports = {
    getBlogs,
    getBlog,
    createBlog,
    updateBlog,
    deleteBlog,
    toggleBlogVisibility
};
