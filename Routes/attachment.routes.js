const express = require('express');
const router = express.Router();
const attachmentController = require('../Controllers/attachment.controller');


router.get('/:id', attachmentController.getById);

module.exports = router;
