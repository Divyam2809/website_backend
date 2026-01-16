const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');

router.get('/team', teamController.getTeamMembers);
router.get('/team/:id', teamController.getTeamMember);
router.post('/team', teamController.createTeamMember);
router.put('/team/:id', teamController.updateTeamMember);
router.delete('/team/:id', teamController.deleteTeamMember);
router.patch('/team/:id/visibility', teamController.toggleTeamVisibility);

module.exports = router;
