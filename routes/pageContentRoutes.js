const express = require('express');
const router = express.Router();
const controller = require('../controllers/pageContentController');

router.get('/:pageId', controller.getPageContent);
router.post('/:pageId', controller.updatePageContent);

module.exports = router;
