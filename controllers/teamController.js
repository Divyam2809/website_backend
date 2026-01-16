const teamService = require('../services/teamService');

// GET all team members
const getTeamMembers = async (req, res) => {
    try {
        const members = await teamService.getAll();
        res.json({
            message: 'success',
            data: members
        });
    } catch (err) {
        console.error('Error fetching team members:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// GET single team member
const getTeamMember = async (req, res) => {
    try {
        const { id } = req.params;
        const member = await teamService.getById(id);
        if (member) {
            res.json({
                message: 'success',
                data: member
            });
        } else {
            res.status(404).json({ error: 'Team member not found' });
        }
    } catch (err) {
        console.error('Error fetching team member:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// POST create team member
const createTeamMember = async (req, res) => {
    try {
        const member = await teamService.create(req.body);
        res.json({
            message: 'success',
            data: member
        });
    } catch (err) {
        console.error('Error creating team member:', err);
        res.status(400).json({ error: err.message });
    }
};

// PUT update team member
const updateTeamMember = async (req, res) => {
    try {
        const { id } = req.params;
        const member = await teamService.update(id, req.body);
        res.json({
            message: 'success',
            data: member
        });
    } catch (err) {
        console.error('Error updating team member:', err);
        res.status(400).json({ error: err.message });
    }
};

// DELETE team member
const deleteTeamMember = async (req, res) => {
    try {
        const { id } = req.params;
        await teamService.delete(id);
        res.json({ message: 'Team member deleted successfully' });
    } catch (err) {
        console.error('Error deleting team member:', err);
        res.status(400).json({ error: err.message });
    }
};

// PATCH toggle visibility
const toggleTeamVisibility = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await teamService.toggleVisibility(id);
        res.json({
            message: 'success',
            data: result
        });
    } catch (err) {
        console.error('Error toggling team visibility:', err);
        res.status(400).json({ error: err.message });
    }
};

module.exports = {
    getTeamMembers,
    getTeamMember,
    createTeamMember,
    updateTeamMember,
    deleteTeamMember,
    toggleTeamVisibility
};
