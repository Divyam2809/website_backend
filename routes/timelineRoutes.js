const express = require('express');
const router = express.Router();
const timelineController = require('../controllers/timelineController');

router.get('/timeline', timelineController.getTimeline);
router.get('/timeline/:id', timelineController.getTimelineItem);
router.post('/timeline', timelineController.createTimelineItem);
router.put('/timeline/:id', timelineController.updateTimelineItem);
router.delete('/timeline/:id', timelineController.deleteTimelineItem);
router.patch('/timeline/:id/visibility', timelineController.toggleTimelineVisibility);

module.exports = router;
